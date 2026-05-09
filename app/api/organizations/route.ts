import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug: providedSlug } = await req.json();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Generate a slug if none provided, or clean the provided one
    const slug = (providedSlug || name)
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // Use a transaction to ensure all 3 steps happen together
    const newOrg = await prisma.$transaction(async (tx) => {
      // 1. Check if slug is unique
      const existing = await tx.organization.findUnique({
        where: { slug },
      });

      if (existing) {
        throw new Error("A workspace with this slug already exists.");
      }

      // 2. Create the Organization
      const org = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      // 3. Create the Membership for the creator as OWNER
      await tx.organizationMember.create({
        data: {
          userId: session.user.id!,
          organizationId: org.id,
          role: "OWNER",
        },
      });

      // 4. Update the user's activeOrgId so they switch to it immediately
      await tx.user.update({
        where: { id: session.user.id },
        data: { activeOrgId: org.id },
      });

      return org;
    });

    return NextResponse.json(newOrg, { status: 201 });
  } catch (error: any) {
    console.error("CREATE_ORG_ERROR", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
