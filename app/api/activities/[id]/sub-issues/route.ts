import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertActivityAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const CreateSchema = z.object({ title: z.string().min(1) });

// GET /api/activities/:id/sub-issues
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  if (!await assertActivityAccess(userId, id)) return err("Not found", 404);

  const subIssues = await prisma.subIssue.findMany({
    where: { activityId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(subIssues);
}

// POST /api/activities/:id/sub-issues
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const activityMeta = await assertActivityAccess(userId, id);
  if (!activityMeta) return err("Not found", 404);

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const subIssue = await prisma.subIssue.create({
    data: { title: parsed.data.title, activityId: id },
  });

  await notifyProject(activityMeta.projectId, {
    type: "subissue.created",
    activityId: id,
    subIssue,
  });

  return NextResponse.json(subIssue, { status: 201 });
}
