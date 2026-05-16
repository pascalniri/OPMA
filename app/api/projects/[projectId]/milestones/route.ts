import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  weight: z.number().int().min(1).optional(),
  dueDate: z.string().optional(),
});

// GET /api/projects/:projectId/milestones
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  if (!await assertProjectAccess(userId, projectId)) return err("Not found", 404);

  const [milestones, project] = await Promise.all([
    prisma.milestone.findMany({
      where: { projectId },
      include: {
        _count: { select: { activities: true } },
        activities: { select: { status: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { budgetTotal: true },
    }),
  ]);

  const budgetTotal = project?.budgetTotal || 0;

  const result = milestones.map(({ activities, ...ms }) => ({
    ...ms,
    verifiedActivities: activities.filter((a) => a.status === "VERIFIED").length,
    monetaryValue: (ms.weight / 100) * budgetTotal,
  }));

  return NextResponse.json(result);
}

// POST /api/projects/:projectId/milestones
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

  const newWeight = parsed.data.weight ?? 1;

  // Validate total weight
  const currentWeights = await prisma.milestone.aggregate({
    where: { projectId },
    _sum: { weight: true },
  });

  const total = (currentWeights._sum.weight || 0) + newWeight;
  if (total > 100) {
    return err(`Total weight would exceed 100% (currently ${currentWeights._sum.weight || 0}%)`, 400);
  }

  const [milestone, project] = await Promise.all([
    prisma.milestone.create({
      data: {
        ...parsed.data,
        projectId,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { budgetTotal: true },
    }),
  ]);

  const withValue = {
    ...milestone,
    monetaryValue: (milestone.weight / 100) * (project?.budgetTotal || 0),
  };

  await notifyProject(projectId, { type: "milestone.created", milestone: withValue });
  return NextResponse.json(withValue, { status: 201 });
}
