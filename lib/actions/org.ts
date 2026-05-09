"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
});

export async function createOrganization(formData: z.infer<typeof CreateOrgSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { name, slug } = CreateOrgSchema.parse(formData);

  try {
    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Update user's active workspace
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeOrgId: org.id },
    });

    revalidatePath("/settings");
    return { success: true, org };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Slug already exists" };
    }
    return { error: "Failed to create organization" };
  }
}

export async function inviteUser(email: string, role: "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER") {
  const session = await auth();
  const orgId = session?.user?.activeOrgId;

  if (!orgId) throw new Error("No active organization");
  
  // Check if current user is ADMIN or OWNER
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id!,
        organizationId: orgId,
      },
    },
  });

  if (!membership || (membership.role !== "ADMIN" && membership.role !== "OWNER")) {
    throw new Error("Only admins can invite users");
  }

  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.invitation.create({
    data: {
      email,
      role,
      token,
      expires,
      organizationId: orgId,
    },
  });

  // In a real app, you would send an email here
  console.log(`Invite link: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`);

  revalidatePath("/settings/team");
  return { success: true, token };
}

export async function acceptInvitation(token: string) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/invite/${token}`);

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invitation || invitation.expires < new Date()) {
    return { error: "Invitation expired or invalid" };
  }

  try {
    await prisma.$transaction([
      prisma.organizationMember.create({
        data: {
          userId: session.user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      }),
      prisma.invitation.delete({
        where: { id: invitation.id },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { activeOrgId: invitation.organizationId },
      }),
    ]);

    revalidatePath("/dashboard");
    return { success: true, orgSlug: invitation.organization.slug };
  } catch (error) {
    return { error: "Failed to join organization. You might already be a member." };
  }
}
