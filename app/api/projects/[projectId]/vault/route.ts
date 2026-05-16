import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["requirements", "designs", "reports", "contracts", "other"]).optional(),
  // s3Key is the path returned by your S3 upload step — client uploads directly
  // to S3 then POSTs the key here to register the document.
  s3Key: z.string().min(1),
  size: z.string(),
  mimeType: z.string(),
  tags: z.array(z.string()).optional(),
  milestoneId: z.string().optional(),
  activityId: z.string().optional(),
  powSubmissionId: z.string().optional(),
});

// GET /api/projects/:projectId/vault
// ?category=&milestoneId=&activityId=
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { projectId } = await params;
  if (!await assertProjectAccess(userId, projectId)) return err("Not found", 404);

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const milestoneId = searchParams.get("milestoneId");
  const activityId = searchParams.get("activityId");

  const documents = await prisma.vaultDocument.findMany({
    where: {
      projectId,
      ...(category && { category }),
      ...(milestoneId && { milestoneId }),
      ...(activityId && { activityId }),
    },
    include: {
      uploadedBy: { select: { id: true, name: true, image: true } },
      milestone: { select: { id: true, name: true } },
      activity: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST /api/projects/:projectId/vault
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

  const document = await prisma.vaultDocument.create({
    data: {
      ...parsed.data,
      category: parsed.data.category ?? "other",
      tags: parsed.data.tags ?? [],
      projectId,
      uploadedById: userId,
    },
    include: {
      uploadedBy: { select: { id: true, name: true, image: true } },
    },
  });

  await notifyProject(projectId, { type: "vault.document.added", document });
  return NextResponse.json(document, { status: 201 });
}
