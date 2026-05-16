import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertProjectAccess, err } from "@/lib/api";
import { notifyProject } from "@/lib/notify";

// DELETE /api/vault/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, unauthorized } = await requireAuth();
  if (!userId) return unauthorized!;

  const { id } = await params;
  const doc = await prisma.vaultDocument.findUnique({ where: { id } });
  if (!doc) return err("Not found", 404);

  const access = await assertProjectAccess(userId, doc.projectId);
  if (!access) return err("Forbidden", 403);

  await prisma.vaultDocument.delete({ where: { id } });
  await notifyProject(doc.projectId, { type: "vault.document.deleted", id });
  return new NextResponse(null, { status: 204 });
}
