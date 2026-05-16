import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertActivityAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const Schema = z.object({ columnId: z.string() });

// PATCH /api/activities/:id/placement
// Moves a card to a kanban column without changing activity.status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const activityMeta = await assertActivityAccess(userId, id);
  if (!activityMeta) return err("Not found", 404);

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const placement = await prisma.activityPlacement.upsert({
    where: { activityId: id },
    create: { activityId: id, columnId: parsed.data.columnId },
    update: { columnId: parsed.data.columnId },
    include: { column: true },
  });

  await notifyProject(activityMeta.projectId, {
    type: "activity.moved",
    activityId: id,
    columnId: parsed.data.columnId,
  });

  return NextResponse.json(placement);
}
