import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, err } from "@/lib/api";

async function resolveMembership(userId: string, orgId: string) {
  return await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

// DELETE /api/organizations/:orgId/invitations/:invitationId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ orgId: string; invitationId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { orgId, invitationId } = await params;
  const membership = await resolveMembership(userId, orgId);
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return err("Forbidden", 403);
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation || invitation.organizationId !== orgId) return err("Invitation not found", 404);

  await prisma.invitation.delete({ where: { id: invitationId } });

  return new NextResponse(null, { status: 204 });
}
