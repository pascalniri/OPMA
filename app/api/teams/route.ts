import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, identifier, description, organizationId } = await req.json();

    if (!name || !identifier || !organizationId) {
      return NextResponse.json(
        { error: "Name, identifier, and organizationId are required" },
        { status: 400 }
      );
    }

    // Verify user is an admin or owner of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Only organization admins can create teams" },
        { status: 403 }
      );
    }

    // Create the team and the first member (the creator) in a transaction
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          name,
          identifier: identifier.toUpperCase(),
          description,
          organizationId,
        },
      });

      await tx.teamMember.create({
        data: {
          userId: session.user.id,
          teamId: newTeam.id,
          role: "OWNER", // The creator is the team owner
        },
      });

      return newTeam;
    });

    return NextResponse.json(team);
  } catch (error: any) {
    console.error("CREATE_TEAM_ERROR", error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A team with this identifier already exists in this organization" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
