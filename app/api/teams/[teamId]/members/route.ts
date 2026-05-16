import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, err } from "@/lib/api";
import { z } from "zod";

async function assertTeamMember(userId: string, teamId: string) {
  return prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
}

const PostSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

// GET /api/teams/:teamId/members
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { teamId } = await params;
  const access = await assertTeamMember(userId, teamId);
  if (!access) return err("Not found", 404);

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

// POST /api/teams/:teamId/members — add a user to the team
export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { teamId } = await params;
  const access = await assertTeamMember(userId, teamId);
  if (!access || !["OWNER", "ADMIN"].includes(access.role)) return err("Forbidden", 403);

  const body = await req.json();
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { userId: targetUserId, role } = parsed.data;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { organizationId: true },
  });
  if (!team) return err("Not found", 404);

  // Target user must belong to the same organization
  const orgMembership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: targetUserId, organizationId: team.organizationId } },
  });
  if (!orgMembership) return err("User is not in this organization", 400);

  try {
    const member = await prisma.teamMember.create({
      data: { userId: targetUserId, teamId, role },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return err("User is already a team member", 400);
    throw e;
  }
}
