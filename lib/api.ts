import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null as string | null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: session.user.id, unauthorized: null };
}

// Returns the project if the user is a member of its team, null otherwise.
export async function assertProjectAccess(userId: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, teamId: true, organizationId: true },
  });
  if (!project) return null;
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId: project.teamId } },
  });
  return member ? project : null;
}

// Resolves project access from an activity id — used in nested resources.
export async function assertActivityAccess(userId: string, activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, projectId: true },
  });
  if (!activity) return null;
  const project = await assertProjectAccess(userId, activity.projectId);
  return project ? activity : null;
}

export function err(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
