import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "AT_RISK", "COMPLETED", "DELAYED"]).optional(),
  weight: z.number().int().min(1).optional(),
  dueDate: z.string().nullable().optional(),
});

async function resolveMilestone(userId: string, id: string) {
  const milestone = await prisma.milestone.findUnique({ where: { id } });
  if (!milestone) return null;
  const access = await assertProjectAccess(userId, milestone.projectId);
  return access ? milestone : null;
}

// PATCH /api/milestones/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const milestone = await resolveMilestone(userId, id);
  if (!milestone) return err("Not found", 404);

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  if (parsed.data.weight !== undefined) {
    const currentWeights = await prisma.milestone.aggregate({
      where: { projectId: milestone.projectId, NOT: { id } },
      _sum: { weight: true },
    });
    const total = (currentWeights._sum.weight || 0) + parsed.data.weight;
    if (total > 100) {
      return err(`Total weight would exceed 100% (other milestones: ${currentWeights._sum.weight || 0}%)`, 400);
    }
  }

  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate === null ? null : undefined,
    },
  });

  const project = await prisma.project.findUnique({
    where: { id: milestone.projectId },
    select: { budgetTotal: true },
  });

  const withValue = {
    ...updated,
    monetaryValue: (updated.weight / 100) * (project?.budgetTotal || 0),
  };

  await notifyProject(milestone.projectId, { type: "milestone.updated", milestone: withValue });
  return NextResponse.json(withValue);
}

// DELETE /api/milestones/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const milestone = await resolveMilestone(userId, id);
  if (!milestone) return err("Not found", 404);

  await prisma.milestone.delete({ where: { id } });
  await notifyProject(milestone.projectId, { type: "milestone.deleted", id });
  return new NextResponse(null, { status: 204 });
}
