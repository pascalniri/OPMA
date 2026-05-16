import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  velocityRisk: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetUsed: z.number().optional(),
  budgetTotal: z.number().optional(),
});

// GET /api/projects/:projectId
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  const access = await assertProjectAccess(userId, projectId);
  if (!access) return err("Not found", 404);

  const [project, pendingVerifications] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        team: { select: { id: true, name: true, identifier: true } },
        _count: { select: { milestones: true, activities: true, vaultDocuments: true } },
      },
    }),
    prisma.activity.count({
      where: { projectId, powStatus: "AWAITING_REVIEW" },
    }),
  ]);

  return NextResponse.json({ ...project, pendingVerifications });
}

// PATCH /api/projects/:projectId
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  const access = await assertProjectAccess(userId, projectId);
  if (!access) return err("Not found", 404);

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const data = parsed.data;
  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  await notifyProject(projectId, { type: "project.updated", project });
  return NextResponse.json(project);
}

// DELETE /api/projects/:projectId
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  const access = await assertProjectAccess(userId, projectId);
  if (!access) return err("Not found", 404);

  await prisma.project.delete({ where: { id: projectId } });
  return new NextResponse(null, { status: 204 });
}
