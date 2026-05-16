import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertActivityAccess, err } from "@/lib/api";
import { notifyProject, createNotification } from "@/lib/notify";
import { recalculateProjectProgress, recalculateMilestoneStatus } from "@/lib/progress";
import { z } from "zod";

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "PENDING_VERIFICATION", "VERIFIED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  powStatus: z.enum(["NOT_SUBMITTED", "AWAITING_REVIEW", "APPROVED", "REJECTED"]).optional(),
  assigneeId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

const activityInclude = {
  assignee: { select: { id: true, name: true, image: true } },
  milestone: { select: { id: true, name: true } },
  subIssues: true,
  placement: { include: { column: true } },
};

// PATCH /api/activities/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const activityMeta = await assertActivityAccess(userId, id);
  if (!activityMeta) return err("Not found", 404);

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { assigneeId, dueDate, ...rest } = parsed.data;

  const prev = await prisma.activity.findUnique({ where: { id }, select: { assigneeId: true } });

  const activity = await prisma.activity.update({
    where: { id },
    data: {
      ...rest,
      ...(assigneeId !== undefined && { assigneeId }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
    include: activityInclude,
  });

  // Recalculate progress whenever status changes
  if (parsed.data.status !== undefined) {
    await recalculateProjectProgress(activityMeta.projectId);
    if (activity.milestoneId) {
      await recalculateMilestoneStatus(activity.milestoneId);
    }
  }

  await notifyProject(activityMeta.projectId, { type: "activity.updated", activity });

  // Notify new assignee
  const newAssignee = parsed.data.assigneeId;
  if (newAssignee && newAssignee !== prev?.assigneeId && newAssignee !== userId) {
    await createNotification({
      userId: newAssignee,
      type: "ASSIGNMENT",
      message: `You were assigned to "${activity.title}"`,
      payload: { activityId: id, projectId: activityMeta.projectId },
    });
  }

  return NextResponse.json(activity);
}

// DELETE /api/activities/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const activityMeta = await assertActivityAccess(userId, id);
  if (!activityMeta) return err("Not found", 404);

  const deletedActivity = await prisma.activity.findUnique({
    where: { id },
    select: { milestoneId: true },
  });

  await prisma.activity.delete({ where: { id } });
  await recalculateProjectProgress(activityMeta.projectId);
  if (deletedActivity?.milestoneId) {
    await recalculateMilestoneStatus(deletedActivity.milestoneId);
  }
  await notifyProject(activityMeta.projectId, { type: "activity.deleted", id });
  return new NextResponse(null, { status: 204 });
}
