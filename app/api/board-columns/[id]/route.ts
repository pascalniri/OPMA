import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const PatchSchema = z.object({
  label: z.string().min(1).optional(),
  dot: z.string().optional(),
  position: z.number().int().optional(),
});

async function resolveColumn(userId: string, id: string) {
  const col = await prisma.boardColumn.findUnique({ where: { id } });
  if (!col) return null;
  const access = await assertProjectAccess(userId, col.projectId);
  return access ? col : null;
}

// PATCH /api/board-columns/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const col = await resolveColumn(userId, id);
  if (!col) return err("Not found", 404);

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const updated = await prisma.boardColumn.update({ where: { id }, data: parsed.data });
  await notifyProject(col.projectId, { type: "board.column.updated", column: updated });
  return NextResponse.json(updated);
}

// DELETE /api/board-columns/:id
// Orphaned activity placements are cascade-deleted; the activity itself stays.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const col = await resolveColumn(userId, id);
  if (!col) return err("Not found", 404);
  if (col.isDefault) return err("Default columns cannot be deleted", 400);

  await prisma.boardColumn.delete({ where: { id } });
  await notifyProject(col.projectId, { type: "board.column.deleted", id });
  return new NextResponse(null, { status: 204 });
}
