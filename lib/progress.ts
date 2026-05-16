import { prisma } from "@/lib/prisma";

// Recalculates project.progress as (VERIFIED activities / total activities) * 100
// and auto-advances milestone status when all its activities are VERIFIED.
// Call this after any activity status change.
export async function recalculateProjectProgress(projectId: string): Promise<void> {
  const [total, verified] = await Promise.all([
    prisma.activity.count({ where: { projectId } }),
    prisma.activity.count({ where: { projectId, status: "VERIFIED" } }),
  ]);

  const progress = total === 0 ? 0 : Math.round((verified / total) * 100);

  await prisma.project.update({
    where: { id: projectId },
    data: { progress },
  });
}

// When an activity's milestone changes or the activity is verified, check if
// all activities in that milestone are VERIFIED and flip its status to COMPLETED.
export async function recalculateMilestoneStatus(milestoneId: string): Promise<void> {
  const [total, verified] = await Promise.all([
    prisma.activity.count({ where: { milestoneId } }),
    prisma.activity.count({ where: { milestoneId, status: "VERIFIED" } }),
  ]);

  if (total === 0) return;

  const newStatus = verified === total ? "COMPLETED" : verified > 0 ? "IN_PROGRESS" : "NOT_STARTED";

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: newStatus },
  });
}
