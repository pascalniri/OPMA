import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject, createNotification } from "@/lib/notify";
import { recalculateProjectProgress } from "@/lib/progress";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  milestoneId: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const activityInclude = {
  assignee: { select: { id: true, name: true, image: true } },
  milestone: { select: { id: true, name: true } },
  subIssues: true,
  placement: { include: { column: true } },
};

// GET /api/projects/:projectId/activities
// ?status=&priority=&assigneeId=&search=&milestoneId=
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  if (!await assertProjectAccess(userId, projectId)) return err("Not found", 404);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assigneeId = searchParams.get("assigneeId");
  const milestoneId = searchParams.get("milestoneId");
  const search = searchParams.get("search");

  const activities = await prisma.activity.findMany({
    where: {
      projectId,
      ...(status && { status: status as any }),
      ...(priority && { priority: priority as any }),
      ...(assigneeId && { assigneeId }),
      ...(milestoneId && { milestoneId }),
      ...(search && { title: { contains: search, mode: "insensitive" } }),
    },
    include: activityInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(activities);
}

// POST /api/projects/:projectId/activities
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  if (!await assertProjectAccess(userId, projectId)) return err("Not found", 404);

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { assigneeId, dueDate, ...rest } = parsed.data;

  const activity = await prisma.activity.create({
    data: {
      ...rest,
      projectId,
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: activityInclude,
  });

  await recalculateProjectProgress(projectId);
  await notifyProject(projectId, { type: "activity.created", activity });

  // Notify the assignee if different from creator
  if (assigneeId && assigneeId !== userId) {
    await createNotification({
      userId: assigneeId,
      type: "ASSIGNMENT",
      message: `You were assigned to "${activity.title}"`,
      payload: { activityId: activity.id, projectId },
    });
  }

  return NextResponse.json(activity, { status: 201 });
}
