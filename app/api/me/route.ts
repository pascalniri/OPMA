import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch full user details including memberships and the active organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        teamMemberships: {
          include: {
            team: {
              include: {
                projects: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Identify the currently active organization details
    let activeOrg = user.memberships.find(
      (m) => m.organizationId === user.activeOrgId
    )?.organization;

    // Fallback: If no activeOrgId is set but user has memberships, use the first one
    if (!activeOrg && user.memberships.length > 0) {
      activeOrg = user.memberships[0].organization;
      
      // Update the user record to save this fallback
      await prisma.user.update({
        where: { id: user.id },
        data: { activeOrgId: activeOrg.id }
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        activeOrgId: user.activeOrgId,
      },
      activeOrganization: activeOrg || null,
      memberships: user.memberships.map((m) => ({
        role: m.role,
        organization: m.organization,
      })),
      teams: user.teamMemberships
        .filter((tm) => tm.team.organizationId === user.activeOrgId)
        .map((tm) => ({
          ...tm.team,
          role: tm.role,
        })),
    });
  } catch (error) {
    console.error("API_ME_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Verify the user is actually a member of this organization before switching
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 },
      );
    }

    // Update the user's activeOrgId
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { activeOrgId: organizationId },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("SWITCH_ORG_ERROR", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
