import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";

// GET /api/projects/:projectId/members
// Returns team members for the project's team, with per-project activity stats.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  const access = await assertProjectAccess(userId, projectId);
  if (!access) return err("Not found", 404);

  const teamMembers = await prisma.teamMember.findMany({
    where: { teamId: access.teamId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch activity stats for each member in this project in one query
  const activityStats = await prisma.activity.groupBy({
    by: ["assigneeId", "status"],
    where: {
      projectId,
      assigneeId: { in: teamMembers.map((m) => m.userId) },
    },
    _count: { id: true },
  });

  const statsMap = new Map<string, { active: number; verified: number }>();
  for (const row of activityStats) {
    if (!row.assigneeId) continue;
    const entry = statsMap.get(row.assigneeId) ?? { active: 0, verified: 0 };
    if (row.status === "IN_PROGRESS") entry.active += row._count.id;
    if (row.status === "VERIFIED") entry.verified += row._count.id;
    statsMap.set(row.assigneeId, entry);
  }

  const result = teamMembers.map((m) => {
    const stats = statsMap.get(m.userId) ?? { active: 0, verified: 0 };
    return {
      id: m.id,
      role: m.role,
      user: m.user,
      activeActivities: stats.active,
      verifiedActivities: stats.verified,
    };
  });

  return NextResponse.json(result);
}
