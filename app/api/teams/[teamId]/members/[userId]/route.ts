import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, err } from "@/lib/api";
import { z } from "zod";

async function assertTeamAdmin(requesterId: string, teamId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: requesterId, teamId } },
  });
  return member && ["OWNER", "ADMIN"].includes(member.role) ? member : null;
}

const PatchSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

// PATCH /api/teams/:teamId/members/:userId — change role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const { userId: requesterId, unauthorized } = await requireAuth();
  if (!requesterId) return unauthorized!;

  const { teamId, userId: targetUserId } = await params;
  const admin = await assertTeamAdmin(requesterId, teamId);
  if (!admin) return err("Forbidden", 403);

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  // Protect the last owner
  if (parsed.data.role !== "OWNER") {
    const target = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: targetUserId, teamId } },
      select: { role: true },
    });
    if (target?.role === "OWNER") {
      const ownerCount = await prisma.teamMember.count({ where: { teamId, role: "OWNER" } });
      if (ownerCount <= 1) return err("Cannot change the role of the only owner", 400);
    }
  }

  const member = await prisma.teamMember.update({
    where: { userId_teamId: { userId: targetUserId, teamId } },
    data: { role: parsed.data.role },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
  });

  return NextResponse.json(member);
}

// DELETE /api/teams/:teamId/members/:userId — remove member
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> },
) {
  const { userId: requesterId, unauthorized } = await requireAuth();
  if (!requesterId) return unauthorized!;

  const { teamId, userId: targetUserId } = await params;

  // Members can remove themselves; otherwise requires admin
  if (requesterId !== targetUserId) {
    const admin = await assertTeamAdmin(requesterId, teamId);
    if (!admin) return err("Forbidden", 403);
  }

  const target = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: targetUserId, teamId } },
    select: { role: true },
  });
  if (!target) return err("Not found", 404);

  if (target.role === "OWNER") {
    const ownerCount = await prisma.teamMember.count({ where: { teamId, role: "OWNER" } });
    if (ownerCount <= 1) return err("Cannot remove the only owner", 400);
  }

  await prisma.teamMember.delete({
    where: { userId_teamId: { userId: targetUserId, teamId } },
  });

  return new NextResponse(null, { status: 204 });
}
