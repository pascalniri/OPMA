import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, err } from "@/lib/api";
import { z } from "zod";

const PatchSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]).optional(),
});

async function resolveMembership(userId: string, orgId: string) {
  const membership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  return membership;
}

// PATCH /api/organizations/:orgId/members/:memberId
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orgId: string; memberId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { orgId, memberId } = await params;

  // Check if current user is ADMIN or OWNER in this org
  const currentUserMembership = await resolveMembership(userId, orgId);
  if (!currentUserMembership || !["OWNER", "ADMIN"].includes(currentUserMembership.role)) {
    return err("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.organizationId !== orgId) return err("Member not found", 404);

  // Prevent modifying the owner if not the owner
  if (member.role === "OWNER" && currentUserMembership.role !== "OWNER") {
    return err("Only the owner can modify another owner", 403);
  }

  const updated = await prisma.organizationMember.update({
    where: { id: memberId },
    data: parsed.data,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/organizations/:orgId/members/:memberId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; memberId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { orgId, memberId } = await params;

  const currentUserMembership = await resolveMembership(userId, orgId);
  if (!currentUserMembership || !["OWNER", "ADMIN"].includes(currentUserMembership.role)) {
    return err("Forbidden", 403);
  }

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.organizationId !== orgId) return err("Member not found", 404);

  if (member.role === "OWNER" && currentUserMembership.role !== "OWNER") {
    return err("Only the owner can remove another owner", 403);
  }

  // Prevent self-removal if owner?
  if (member.userId === userId && member.role === "OWNER") {
    return err("Owners cannot remove themselves. Transfer ownership first.", 400);
  }

  await prisma.organizationMember.delete({ where: { id: memberId } });

  return new NextResponse(null, { status: 204 });
}
