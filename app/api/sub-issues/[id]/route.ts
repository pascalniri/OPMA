import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertActivityAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const PatchSchema = z.object({
  title: z.string().min(1).optional(),
  done: z.boolean().optional(),
});

async function resolveSubIssue(userId: string, id: string) {
  const sub = await prisma.subIssue.findUnique({ where: { id } });
  if (!sub) return null;
  const activity = await assertActivityAccess(userId, sub.activityId);
  return activity ? { sub, activity } : null;
}

// PATCH /api/sub-issues/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const resolved = await resolveSubIssue(userId, id);
  if (!resolved) return err("Not found", 404);

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const updated = await prisma.subIssue.update({ where: { id }, data: parsed.data });

  await notifyProject(resolved.activity.projectId, {
    type: "subissue.updated",
    activityId: resolved.sub.activityId,
    subIssue: updated,
  });

  return NextResponse.json(updated);
}

// DELETE /api/sub-issues/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const resolved = await resolveSubIssue(userId, id);
  if (!resolved) return err("Not found", 404);

  await prisma.subIssue.delete({ where: { id } });
  await notifyProject(resolved.activity.projectId, {
    type: "subissue.deleted",
    activityId: resolved.sub.activityId,
    id,
  });

  return new NextResponse(null, { status: 204 });
}
