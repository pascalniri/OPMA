import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, err } from "@/lib/api";
import { z } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).toUpperCase(),
  description: z.string().optional(),
  teamId: z.string().min(1),
  organizationId: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetTotal: z.number().optional(),
  budgetCurrency: z.string().optional(),
});

// GET /api/projects?teamId=xxx
export async function GET(req: Request) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) return err("teamId query param required", 400);

  // Verify membership
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  if (!member) return err("Forbidden", 403);

  const projects = await prisma.project.findMany({
    where: { teamId },
    include: {
      creator: { select: { id: true, name: true, image: true } },
      _count: { select: { milestones: true, activities: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

// POST /api/projects
export async function POST(req: Request) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const { name, code, description, teamId, organizationId, startDate, endDate, budgetTotal, budgetCurrency } = parsed.data;

  // Verify caller is at least a MEMBER of the team
  const member = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });
  if (!member) return err("Forbidden", 403);

  try {
    const project = await prisma.project.create({
      data: {
        name,
        code,
        description,
        teamId,
        organizationId,
        creatorId: userId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        budgetTotal: budgetTotal ?? 0,
        budgetCurrency: budgetCurrency ?? "USD",
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return err("A project with this code already exists in this organization", 400);
    if (e.code === "P2003") return err("Invalid team or organization reference", 400);
    console.error("[POST /api/projects]", e);
    return err("Internal server error", 500);
  }
}
