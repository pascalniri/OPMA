import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const CreateSchema = z.object({
  label: z.string().min(1),
  dot: z.string().optional(),
  position: z.number().int().optional(),
});

// GET /api/projects/:projectId/board-columns
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  if (!await assertProjectAccess(userId, projectId)) return err("Not found", 404);

  const columns = await prisma.boardColumn.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(columns);
}

// POST /api/projects/:projectId/board-columns
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  if (!await assertProjectAccess(userId, projectId)) return err("Not found", 404);

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  // Auto-position at the end if not specified
  const lastCol = await prisma.boardColumn.findFirst({
    where: { projectId },
    orderBy: { position: "desc" },
  });
  const position = parsed.data.position ?? (lastCol ? lastCol.position + 1 : 0);

  const column = await prisma.boardColumn.create({
    data: {
      label: parsed.data.label,
      dot: parsed.data.dot ?? "#A3A3A3",
      position,
      projectId,
    },
  });

  await notifyProject(projectId, { type: "board.column.created", column });
  return NextResponse.json(column, { status: 201 });
}
