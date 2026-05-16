import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, err } from "@/lib/api";
import { z } from "zod";
import crypto from "crypto";
import { sendMail, generateInvitationEmail } from "@/lib/mail";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

async function resolveMembership(userId: string, orgId: string) {
  return await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

// GET /api/organizations/:orgId/invitations
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { orgId } = await params;
  const membership = await resolveMembership(userId, orgId);
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return err("Forbidden", 403);
  }

  const invitations = await prisma.invitation.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invitations);
}

// POST /api/organizations/:orgId/invitations
export async function POST(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { orgId } = await params;
  const membership = await resolveMembership(userId, orgId);
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return err("Forbidden", 403);
  }

  const body = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { email, role } = parsed.data;

  // Check if already a member
  const existingMember = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, user: { email } },
  });
  if (existingMember) return err("User is already a member", 400);

  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Fetch org name for email
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  const invitation = await prisma.invitation.upsert({
    where: { email_organizationId: { email, organizationId: orgId } },
    update: { token, role, expires, createdAt: new Date() },
    create: { email, token, role, expires, organizationId: orgId },
  });

  // Send invitation email
  try {
    await sendMail({
      to: email,
      subject: `You've been invited to join ${org?.name || "a workspace"} on Akazi Space`,
      html: generateInvitationEmail(org?.name || "a workspace", token),
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    // We still return the invitation as it was created in the DB
  }

  return NextResponse.json(invitation, { status: 201 });
}
