import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── IDs pulled from the live DB ───────────────────────────────────────────────
const USER_ID   = "cmoys9l5b0000f8i8hnlpj2d8";
const TEAM_ID   = "cmoytfb4o0004f8i8teknxt23";   // Engineering & Product
const ORG_ID    = "cmoytdybj0002f8i8p152hdms";

async function main() {
  console.log("Seeding projects…");

  // ── Project 1: Website Redesign ───────────────────────────────────────────
  const p1 = await prisma.project.create({
    data: {
      name:           "Website Redesign",
      code:           "WEB-2026",
      description:    "Full redesign of the company website — new design system, improved performance, and accessibility compliance.",
      status:         "active",
      velocityRisk:   "MEDIUM",
      startDate:      new Date("2026-01-15"),
      endDate:        new Date("2026-06-30"),
      budgetTotal:    45000,
      budgetUsed:     12000,
      budgetCurrency: "USD",
      teamId:         TEAM_ID,
      organizationId: ORG_ID,
      creatorId:      USER_ID,
    },
  });

  // Milestones for p1
  const m1a = await prisma.milestone.create({
    data: {
      name:      "Discovery & Design",
      description: "User research, wireframes, and final design handoff.",
      status:    "COMPLETED",
      weight:    25,
      dueDate:   new Date("2026-02-28"),
      projectId: p1.id,
    },
  });

  const m1b = await prisma.milestone.create({
    data: {
      name:      "Frontend Development",
      description: "Implement all pages and components from the approved designs.",
      status:    "IN_PROGRESS",
      weight:    50,
      dueDate:   new Date("2026-05-15"),
      projectId: p1.id,
    },
  });

  const m1c = await prisma.milestone.create({
    data: {
      name:      "QA & Launch",
      description: "End-to-end testing, performance audit, and go-live.",
      status:    "NOT_STARTED",
      weight:    25,
      dueDate:   new Date("2026-06-30"),
      projectId: p1.id,
    },
  });

  // Activities for p1
  await prisma.activity.createMany({
    data: [
      // m1a — all VERIFIED
      {
        title:       "Conduct stakeholder interviews",
        description: "Interview 6 stakeholders to gather requirements.",
        status:      "VERIFIED",
        powStatus:   "APPROVED",
        priority:    "HIGH",
        projectId:   p1.id,
        milestoneId: m1a.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Produce wireframes for all pages",
        description: "Lo-fi wireframes for the 12 main pages.",
        status:      "VERIFIED",
        powStatus:   "APPROVED",
        priority:    "HIGH",
        projectId:   p1.id,
        milestoneId: m1a.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Final design approval",
        description: "Present hi-fi mockups and get sign-off.",
        status:      "VERIFIED",
        powStatus:   "APPROVED",
        priority:    "MEDIUM",
        projectId:   p1.id,
        milestoneId: m1a.id,
        assigneeId:  USER_ID,
      },
      // m1b — mixed
      {
        title:       "Set up component library",
        description: "Bootstrap the design system with base tokens.",
        status:      "VERIFIED",
        powStatus:   "APPROVED",
        priority:    "HIGH",
        projectId:   p1.id,
        milestoneId: m1b.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Build homepage and navigation",
        status:      "IN_PROGRESS",
        powStatus:   "NOT_SUBMITTED",
        priority:    "HIGH",
        projectId:   p1.id,
        milestoneId: m1b.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Build product and pricing pages",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "MEDIUM",
        projectId:   p1.id,
        milestoneId: m1b.id,
        assigneeId:  USER_ID,
      },
      // m1c — all TODO
      {
        title:       "Cross-browser & accessibility audit",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "HIGH",
        projectId:   p1.id,
        milestoneId: m1c.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Performance optimisation (Core Web Vitals)",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "MEDIUM",
        projectId:   p1.id,
        milestoneId: m1c.id,
        assigneeId:  USER_ID,
      },
    ],
  });

  // Calculate and persist progress for p1
  const p1Total    = await prisma.activity.count({ where: { projectId: p1.id } });
  const p1Verified = await prisma.activity.count({ where: { projectId: p1.id, status: "VERIFIED" } });
  await prisma.project.update({
    where: { id: p1.id },
    data:  { progress: Math.round((p1Verified / p1Total) * 100) },
  });

  console.log(`✓ Project 1 created: ${p1.name} (${p1Verified}/${p1Total} verified)`);

  // ── Project 2: Mobile App v2 ──────────────────────────────────────────────
  const p2 = await prisma.project.create({
    data: {
      name:           "Mobile App v2",
      code:           "MOB-2026",
      description:    "Major version bump — offline mode, push notifications, and a revamped onboarding flow.",
      status:         "active",
      velocityRisk:   "HIGH",
      startDate:      new Date("2026-03-01"),
      endDate:        new Date("2026-09-30"),
      budgetTotal:    80000,
      budgetUsed:     8500,
      budgetCurrency: "USD",
      teamId:         TEAM_ID,
      organizationId: ORG_ID,
      creatorId:      USER_ID,
    },
  });

  const m2a = await prisma.milestone.create({
    data: {
      name:      "Architecture & Planning",
      status:    "COMPLETED",
      weight:    20,
      dueDate:   new Date("2026-03-31"),
      projectId: p2.id,
    },
  });

  const m2b = await prisma.milestone.create({
    data: {
      name:      "Core Feature Development",
      status:    "IN_PROGRESS",
      weight:    60,
      dueDate:   new Date("2026-08-15"),
      projectId: p2.id,
    },
  });

  const m2c = await prisma.milestone.create({
    data: {
      name:      "Beta Testing & Release",
      status:    "NOT_STARTED",
      weight:    20,
      dueDate:   new Date("2026-09-30"),
      projectId: p2.id,
    },
  });

  await prisma.activity.createMany({
    data: [
      // m2a — all VERIFIED
      {
        title:       "Define technical architecture",
        description: "Choose state management, navigation library, and offline strategy.",
        status:      "VERIFIED",
        powStatus:   "APPROVED",
        priority:    "CRITICAL",
        projectId:   p2.id,
        milestoneId: m2a.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Set up CI/CD pipelines",
        status:      "VERIFIED",
        powStatus:   "APPROVED",
        priority:    "HIGH",
        projectId:   p2.id,
        milestoneId: m2a.id,
        assigneeId:  USER_ID,
      },
      // m2b — early ones verified, rest in progress/todo
      {
        title:       "Implement offline data sync",
        description: "Use SQLite + background sync worker.",
        status:      "IN_PROGRESS",
        powStatus:   "NOT_SUBMITTED",
        priority:    "CRITICAL",
        projectId:   p2.id,
        milestoneId: m2b.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Push notification service integration",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "HIGH",
        projectId:   p2.id,
        milestoneId: m2b.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Revamp onboarding flow",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "HIGH",
        projectId:   p2.id,
        milestoneId: m2b.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Dark mode support",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "LOW",
        projectId:   p2.id,
        milestoneId: m2b.id,
        assigneeId:  USER_ID,
      },
      // m2c
      {
        title:       "Internal beta distribution (TestFlight / Play Internal)",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "HIGH",
        projectId:   p2.id,
        milestoneId: m2c.id,
        assigneeId:  USER_ID,
      },
      {
        title:       "Crash & analytics instrumentation",
        status:      "TODO",
        powStatus:   "NOT_SUBMITTED",
        priority:    "MEDIUM",
        projectId:   p2.id,
        milestoneId: m2c.id,
        assigneeId:  USER_ID,
      },
    ],
  });

  // Sub-issues for a couple of activities to show the feature
  const offlineActivity = await prisma.activity.findFirst({
    where: { projectId: p2.id, title: { contains: "offline" } },
  });
  if (offlineActivity) {
    await prisma.subIssue.createMany({
      data: [
        { title: "Research SQLite adapter options",      done: true,  activityId: offlineActivity.id },
        { title: "Implement conflict resolution strategy", done: false, activityId: offlineActivity.id },
        { title: "Write sync queue with retry logic",     done: false, activityId: offlineActivity.id },
      ],
    });
  }

  const p2Total    = await prisma.activity.count({ where: { projectId: p2.id } });
  const p2Verified = await prisma.activity.count({ where: { projectId: p2.id, status: "VERIFIED" } });
  await prisma.project.update({
    where: { id: p2.id },
    data:  { progress: Math.round((p2Verified / p2Total) * 100) },
  });

  console.log(`✓ Project 2 created: ${p2.name} (${p2Verified}/${p2Total} verified)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await pool.end(); });
