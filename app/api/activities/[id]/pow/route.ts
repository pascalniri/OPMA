import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, assertActivityAccess, err } from "@/lib/api";
import { notifyProject, createNotification } from "@/lib/notify";
import { recalculateProjectProgress, recalculateMilestoneStatus } from "@/lib/progress";
import { z } from "zod";

const SubmitSchema = z.object({
  notes: z.string().optional(),
  documentIds: z.array(z.string()).optional(),
});

const ReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

// POST /api/activities/:id/pow — submit proof of work
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
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const submission = await prisma.$transaction(async (tx) => {
    const sub = await tx.powSubmission.create({
      data: {
        activityId: id,
        submitterId: userId,
        notes: parsed.data.notes,
        ...(parsed.data.documentIds?.length && {
          documents: { connect: parsed.data.documentIds.map((did) => ({ id: did })) },
        }),
      },
      include: { submitter: { select: { id: true, name: true } } },
    });

    // Mark the activity as pending verification
    await tx.activity.update({
      where: { id },
      data: { powStatus: "AWAITING_REVIEW" },
    });

    return sub;
  });

  await notifyProject(activityMeta.projectId, {
    type: "pow.submitted",
    activityId: id,
    submission,
  });

  // Notify project team members with OWNER/ADMIN roles to review
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      team: { projects: { some: { id: activityMeta.projectId } } },
      role: { in: ["OWNER", "ADMIN"] },
      NOT: { userId },
    },
    select: { userId: true },
  });

  await Promise.all(
    teamMembers.map((m) =>
      createNotification({
        userId: m.userId,
        type: "VERIFICATION",
        message: `Proof of Work submitted — review required`,
        payload: { activityId: id, projectId: activityMeta.projectId, submissionId: submission.id },
      }),
    ),
  );

  return NextResponse.json(submission, { status: 201 });
}

// PATCH /api/activities/:id/pow — approve or reject
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
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0].message, 400);

  const latestSubmission = await prisma.powSubmission.findFirst({
    where: { activityId: id },
    orderBy: { createdAt: "desc" },
  });
  if (!latestSubmission) return err("No submission to review", 404);
  if (latestSubmission.status !== "AWAITING_REVIEW") return err("Submission already reviewed", 400);

  const { status, notes } = parsed.data;

  const [submission, activity] = await prisma.$transaction([
    prisma.powSubmission.update({
      where: { id: latestSubmission.id },
      data: { status, notes, reviewerId: userId, reviewedAt: new Date() },
    }),
    prisma.activity.update({
      where: { id },
      data: {
        powStatus: status === "APPROVED" ? "APPROVED" : "REJECTED",
        ...(status === "APPROVED" && { status: "VERIFIED" }),
      },
    }),
  ]);

  // APPROVED flips activity.status → VERIFIED, so recalculate progress
  if (status === "APPROVED") {
    await recalculateProjectProgress(activityMeta.projectId);
    const fullActivity = await prisma.activity.findUnique({
      where: { id },
      select: { milestoneId: true },
    });
    if (fullActivity?.milestoneId) {
      await recalculateMilestoneStatus(fullActivity.milestoneId);
    }
  }

  await notifyProject(activityMeta.projectId, {
    type: "pow.reviewed",
    activityId: id,
    status,
    activity,
  });

  // Notify the submitter
  await createNotification({
    userId: latestSubmission.submitterId,
    type: "VERIFICATION",
    message: `Your Proof of Work was ${status === "APPROVED" ? "approved ✓" : "rejected"}`,
    payload: { activityId: id, projectId: activityMeta.projectId, status },
  });

  return NextResponse.json({ submission, activity });
}
