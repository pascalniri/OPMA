// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectStatus = "active" | "on-hold" | "completed" | "archived";
export type MilestoneStatus =
  | "not-started"
  | "on-track"
  | "at-risk"
  | "delayed"
  | "completed";
export type ActivityStatus =
  | "todo"
  | "in-progress"
  | "pending-verification"
  | "verified";
export type Priority = "low" | "medium" | "high" | "critical";
export type PowStatus =
  | "not-submitted"
  | "awaiting-review"
  | "approved"
  | "rejected";
export type VelocityRisk = "low" | "medium" | "high";
export type MemberStatus = "active" | "away" | "offline";

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  avatarColor: string;
  status: MemberStatus;
  activeActivities: number;
  completedActivities: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  weight: number;
  status: MilestoneStatus;
  progress: number;
  dueDate: string;
  activitiesCount: number;
  completedActivities: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  milestoneId: string;
  milestoneName: string;
  assigneeId: string;
  assignee: TeamMember;
  status: ActivityStatus;
  priority: Priority;
  powStatus: PowStatus;
  dueDate: string;
  createdAt: string;
  tags: string[];
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  velocityRisk: VelocityRisk;
  pendingVerifications: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: { used: number; total: number; currency: string };
}

export interface VaultDocument {
  id: string;
  name: string;
  category: "requirements" | "designs" | "reports" | "contracts" | "other";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  mimeType: string;
  milestoneId?: string;
  activityId?: string;
  tags: string[];
}

export interface Notification {
  id: string;
  type: "verification" | "deadline" | "comment" | "assignment";
  message: string;
  time: string;
  read: boolean;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm1",
    name: "Alice Mwende",
    initials: "AM",
    role: "Director",
    email: "alice@opma.org",
    avatarColor: "bg-white",
    status: "active",
    activeActivities: 3,
    completedActivities: 12,
  },
  {
    id: "tm2",
    name: "James Oduya",
    initials: "JO",
    role: "Manager",
    email: "james@opma.org",
    avatarColor: "bg-white/80",
    status: "active",
    activeActivities: 4,
    completedActivities: 18,
  },
  {
    id: "tm3",
    name: "Sarah Kimani",
    initials: "SK",
    role: "Lead Contributor",
    email: "sarah@opma.org",
    avatarColor: "bg-white/60",
    status: "away",
    activeActivities: 2,
    completedActivities: 9,
  },
  {
    id: "tm4",
    name: "David Osei",
    initials: "DO",
    role: "Senior Member",
    email: "david@opma.org",
    avatarColor: "bg-white/40",
    status: "active",
    activeActivities: 5,
    completedActivities: 14,
  },
  {
    id: "tm5",
    name: "Grace Njiru",
    initials: "GN",
    role: "Auditor",
    email: "grace@opma.org",
    avatarColor: "bg-white/20",
    status: "offline",
    activeActivities: 1,
    completedActivities: 7,
  },
  {
    id: "tm6",
    name: "Kevin Muthoni",
    initials: "KM",
    role: "Contributor",
    email: "kevin@opma.org",
    avatarColor: "bg-white/10",
    status: "active",
    activeActivities: 2,
    completedActivities: 11,
  },
];

export const MILESTONES: Milestone[] = [
  {
    id: "ms1",
    name: "Requirements & Architecture",
    description: "Define system requirements and architecture blueprints.",
    weight: 15,
    status: "completed",
    progress: 100,
    dueDate: "2025-03-15",
    activitiesCount: 8,
    completedActivities: 8,
  },
  {
    id: "ms2",
    name: "Core API Development",
    description: "Build and document all core API endpoints.",
    weight: 30,
    status: "on-track",
    progress: 72,
    dueDate: "2025-05-30",
    activitiesCount: 14,
    completedActivities: 10,
  },
  {
    id: "ms3",
    name: "Frontend Integration",
    description:
      "Integrate frontend with API layer and implement all UI screens.",
    weight: 25,
    status: "at-risk",
    progress: 45,
    dueDate: "2025-06-20",
    activitiesCount: 11,
    completedActivities: 5,
  },
  {
    id: "ms4",
    name: "Security & Compliance Audit",
    description: "Complete security audit and ensure regulatory compliance.",
    weight: 15,
    status: "not-started",
    progress: 0,
    dueDate: "2025-07-10",
    activitiesCount: 6,
    completedActivities: 0,
  },
  {
    id: "ms5",
    name: "UAT & Deployment",
    description: "User acceptance testing and production deployment.",
    weight: 15,
    status: "not-started",
    progress: 0,
    dueDate: "2025-08-01",
    activitiesCount: 9,
    completedActivities: 0,
  },
];

export const CURRENT_PROJECT: Project = {
  id: "proj1",
  name: "Core API Refactor",
  code: "CAR-2025",
  description:
    "Complete refactor of the legacy API system to a modern microservices architecture.",
  status: "active",
  progress: 68,
  velocityRisk: "medium",
  pendingVerifications: 12,
  startDate: "2025-01-15",
  endDate: "2025-08-01",
  teamSize: 6,
  budget: { used: 145000, total: 220000, currency: "USD" },
};

export const ALL_PROJECTS: Pick<
  Project,
  "id" | "name" | "code" | "status" | "progress"
>[] = [
  { id: "proj1", name: "Core API Refactor", code: "CAR-2025", status: "active", progress: 68 },
  { id: "proj2", name: "Mobile App v2", code: "MOB-2025", status: "active", progress: 34 },
  { id: "proj3", name: "Data Pipeline Migration", code: "DPM-2025", status: "on-hold", progress: 21 },
  { id: "proj4", name: "Internal HR Portal", code: "HRP-2024", status: "completed", progress: 100 },
];

export const DUMMY_PROJECTS: Project[] = [
  {
    id: "proj1",
    name: "Core API Refactor",
    code: "CAR-2025",
    description: "Complete refactor of the legacy API system to a modern microservices architecture with improved scalability.",
    status: "active",
    progress: 68,
    velocityRisk: "medium",
    pendingVerifications: 3,
    startDate: "2025-01-15",
    endDate: "2025-08-01",
    teamSize: 6,
    budget: { used: 145000, total: 220000, currency: "USD" },
  },
  {
    id: "proj2",
    name: "Mobile App v2",
    code: "MOB-2025",
    description: "Full redesign of the consumer mobile application with offline support, biometric auth, and a new onboarding flow.",
    status: "active",
    progress: 34,
    velocityRisk: "high",
    pendingVerifications: 7,
    startDate: "2025-02-01",
    endDate: "2025-09-30",
    teamSize: 5,
    budget: { used: 62000, total: 180000, currency: "USD" },
  },
  {
    id: "proj3",
    name: "Data Pipeline Migration",
    code: "DPM-2025",
    description: "Migrate all ETL jobs from on-premise Spark to a managed cloud pipeline with near real-time ingestion.",
    status: "on-hold",
    progress: 21,
    velocityRisk: "high",
    pendingVerifications: 1,
    startDate: "2025-03-01",
    endDate: "2025-11-15",
    teamSize: 4,
    budget: { used: 38000, total: 95000, currency: "USD" },
  },
  {
    id: "proj4",
    name: "Internal HR Portal",
    code: "HRP-2024",
    description: "Self-service HR portal covering leave management, payroll overview, and performance review workflows.",
    status: "completed",
    progress: 100,
    velocityRisk: "low",
    pendingVerifications: 0,
    startDate: "2024-06-01",
    endDate: "2025-01-31",
    teamSize: 3,
    budget: { used: 74000, total: 75000, currency: "USD" },
  },
  {
    id: "proj5",
    name: "Security Compliance Suite",
    code: "SCS-2025",
    description: "Implement SOC 2 Type II controls, automated vulnerability scanning, and a centralised audit log system.",
    status: "active",
    progress: 52,
    velocityRisk: "low",
    pendingVerifications: 5,
    startDate: "2025-01-20",
    endDate: "2025-07-31",
    teamSize: 4,
    budget: { used: 91000, total: 160000, currency: "USD" },
  },
  {
    id: "proj6",
    name: "Analytics Dashboard",
    code: "ADB-2025",
    description: "Real-time business intelligence dashboard with customisable widgets, export pipelines, and role-based views.",
    status: "active",
    progress: 79,
    velocityRisk: "low",
    pendingVerifications: 2,
    startDate: "2024-11-01",
    endDate: "2025-06-30",
    teamSize: 5,
    budget: { used: 112000, total: 130000, currency: "USD" },
  },
  {
    id: "proj7",
    name: "Partner Integration Hub",
    code: "PIH-2025",
    description: "Unified webhook and OAuth integration layer for third-party partner ecosystems and marketplace connectors.",
    status: "on-hold",
    progress: 11,
    velocityRisk: "medium",
    pendingVerifications: 0,
    startDate: "2025-04-01",
    endDate: "2025-12-31",
    teamSize: 3,
    budget: { used: 9000, total: 110000, currency: "USD" },
  },
  {
    id: "proj8",
    name: "Legacy System Decommission",
    code: "LSD-2024",
    description: "Structured wind-down of the v1 monolith — data archival, client migration support, and infra teardown.",
    status: "archived",
    progress: 88,
    velocityRisk: "low",
    pendingVerifications: 0,
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    teamSize: 2,
    budget: { used: 41000, total: 45000, currency: "USD" },
  },
];

export const WORKSPACES = [
  {
    id: "ws1",
    name: "Opma Engineering",
    type: "Pro",
    gradient: "bg-white",
  },
  {
    id: "ws2",
    name: "Design Ops",
    type: "Free",
    gradient: "bg-white/60",
  },
  {
    id: "ws3",
    name: "Product Strategy",
    type: "Pro",
    gradient: "bg-white/30",
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: "act1",
    title: "Design authentication service schema",
    description: "Create comprehensive DB schema for auth service",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm2",
    assignee: TEAM_MEMBERS[1],
    status: "verified",
    priority: "high",
    powStatus: "approved",
    dueDate: "2025-04-20",
    createdAt: "2025-04-01",
    tags: ["backend", "auth"],
    projectId: "proj1",
  },
  {
    id: "act2",
    title: "Implement JWT token rotation",
    description: "Implement secure JWT refresh token rotation mechanism",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "pending-verification",
    priority: "critical",
    powStatus: "awaiting-review",
    dueDate: "2025-05-10",
    createdAt: "2025-04-10",
    tags: ["backend", "security"],
    projectId: "proj1",
  },
  {
    id: "act3",
    title: "Build user management endpoints",
    description: "CRUD operations for user management API",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm2",
    assignee: TEAM_MEMBERS[1],
    status: "pending-verification",
    priority: "high",
    powStatus: "awaiting-review",
    dueDate: "2025-05-12",
    createdAt: "2025-04-15",
    tags: ["backend", "api"],
    projectId: "proj2",
  },
  {
    id: "act4",
    title: "Dashboard wireframes & prototypes",
    description: "Create Figma wireframes for all dashboard screens",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "verified",
    priority: "high",
    powStatus: "approved",
    dueDate: "2025-04-25",
    createdAt: "2025-04-05",
    tags: ["design", "figma"],
    projectId: "proj2",
  },
  {
    id: "act5",
    title: "Implement project pulse page",
    description: "Build the main project dashboard with live metrics",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "in-progress",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-05-20",
    createdAt: "2025-04-20",
    tags: ["frontend", "react"],
    projectId: "proj3",
  },
  {
    id: "act6",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing & deployment",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm6",
    assignee: TEAM_MEMBERS[5],
    status: "in-progress",
    priority: "medium",
    powStatus: "not-submitted",
    dueDate: "2025-05-15",
    createdAt: "2025-04-18",
    tags: ["devops", "ci-cd"],
  },
  {
    id: "act7",
    title: "Rate limiting & throttling middleware",
    description: "Implement API rate limiting for all endpoints",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "in-progress",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-05-18",
    createdAt: "2025-04-22",
    tags: ["backend", "security"],
  },
  {
    id: "act8",
    title: "Write OpenAPI documentation",
    description: "Complete OpenAPI/Swagger docs for all endpoints",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm2",
    assignee: TEAM_MEMBERS[1],
    status: "todo",
    priority: "medium",
    powStatus: "not-submitted",
    dueDate: "2025-05-28",
    createdAt: "2025-04-25",
    tags: ["documentation"],
  },
  {
    id: "act9",
    title: "Kanban board UI components",
    description: "Build activity board UI for project management",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "todo",
    priority: "medium",
    powStatus: "not-submitted",
    dueDate: "2025-05-25",
    createdAt: "2025-04-26",
    tags: ["frontend", "react"],
  },
  {
    id: "act10",
    title: "Database migration scripts",
    description: "Write and test all database migration scripts",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "todo",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-05-22",
    createdAt: "2025-04-27",
    tags: ["backend", "database"],
  },
  {
    id: "act11",
    title: "Security audit preparation",
    description: "Prepare docs and environment for security audit",
    milestoneId: "ms4",
    milestoneName: "Security & Compliance Audit",
    assigneeId: "tm6",
    assignee: TEAM_MEMBERS[5],
    status: "todo",
    priority: "critical",
    powStatus: "not-submitted",
    dueDate: "2025-07-01",
    createdAt: "2025-04-28",
    tags: ["security", "compliance"],
  },
  {
    id: "act12",
    title: "QA test plan & automation scripts",
    description: "Write comprehensive test plan and automated test scripts",
    milestoneId: "ms5",
    milestoneName: "UAT & Deployment",
    assigneeId: "tm5",
    assignee: TEAM_MEMBERS[4],
    status: "todo",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-07-20",
    createdAt: "2025-04-29",
    tags: ["qa", "testing"],
  },
  {
    id: "act13",
    title: "Refactor database connection pooling",
    description: "Optimize DB connections for high concurrency scenarios.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "in-progress",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-05-25",
    createdAt: "2025-05-01",
    tags: ["backend", "performance"],
    projectId: "proj1",
  },
  {
    id: "act14",
    title: "Implement real-time notification engine",
    description: "WebSocket integration for instant team alerts.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm2",
    assignee: TEAM_MEMBERS[1],
    status: "todo",
    priority: "critical",
    powStatus: "not-submitted",
    dueDate: "2025-06-05",
    createdAt: "2025-05-05",
    tags: ["backend", "websockets"],
    projectId: "proj1",
  },
  {
    id: "act15",
    title: "Mobile responsive navigation fix",
    description: "Fix hamburger menu issues on iOS Safari.",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "verified",
    priority: "medium",
    powStatus: "approved",
    dueDate: "2025-05-12",
    createdAt: "2025-05-02",
    tags: ["frontend", "mobile"],
    projectId: "proj2",
  },
  {
    id: "act16",
    title: "Dark mode color palette refinement",
    description: "Ensure AA accessibility contrast for dark theme.",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "pending-verification",
    priority: "low",
    powStatus: "awaiting-review",
    dueDate: "2025-05-18",
    createdAt: "2025-05-04",
    tags: ["design", "ui"],
    projectId: "proj2",
  },
  {
    id: "act17",
    title: "Legacy data migration script",
    description: "Migrate user profiles from v1 mongo instance.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm6",
    assignee: TEAM_MEMBERS[5],
    status: "in-progress",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-06-01",
    createdAt: "2025-05-06",
    tags: ["devops", "data"],
    projectId: "proj1",
  },
  {
    id: "act18",
    title: "Unit tests for auth middleware",
    description: "Increase coverage to 95% for security layer.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "todo",
    priority: "medium",
    powStatus: "not-submitted",
    dueDate: "2025-06-10",
    createdAt: "2025-05-08",
    tags: ["testing", "backend"],
    projectId: "proj1",
  },
  {
    id: "act19",
    title: "Integrate Stripe payment hooks",
    description: "Handle subscription lifecycle events.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm2",
    assignee: TEAM_MEMBERS[1],
    status: "todo",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-06-15",
    createdAt: "2025-05-10",
    tags: ["backend", "payments"],
    projectId: "proj1",
  },
  {
    id: "act20",
    title: "Bug: Image upload memory leak",
    description: "Investigate and fix heap overflow in sharp processing.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "in-progress",
    priority: "critical",
    powStatus: "not-submitted",
    dueDate: "2025-05-20",
    createdAt: "2025-05-11",
    tags: ["bug", "backend"],
    projectId: "proj1",
  },
  {
    id: "act21",
    title: "Onboarding tour components",
    description: "Walkthrough guides for new project managers.",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "todo",
    priority: "low",
    powStatus: "not-submitted",
    dueDate: "2025-06-20",
    createdAt: "2025-05-12",
    tags: ["frontend", "ux"],
    projectId: "proj2",
  },
  {
    id: "act22",
    title: "AWS S3 lifecycle configuration",
    description: "Setup automatic archival for old PoW images.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm6",
    assignee: TEAM_MEMBERS[5],
    status: "verified",
    priority: "medium",
    powStatus: "approved",
    dueDate: "2025-05-25",
    createdAt: "2025-05-13",
    tags: ["devops", "cloud"],
    projectId: "proj1",
  },
  {
    id: "act23",
    title: "PDF Report Generator service",
    description: "Generate monthly milestone compliance reports.",
    milestoneId: "ms5",
    milestoneName: "UAT & Deployment",
    assigneeId: "tm5",
    assignee: TEAM_MEMBERS[4],
    status: "in-progress",
    priority: "high",
    powStatus: "not-submitted",
    dueDate: "2025-06-30",
    createdAt: "2025-05-14",
    tags: ["backend", "reports"],
    projectId: "proj3",
  },
  {
    id: "act24",
    title: "SEO meta tag dynamic generator",
    description: "OpenGraph support for project sharing links.",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "todo",
    priority: "medium",
    powStatus: "not-submitted",
    dueDate: "2025-06-15",
    createdAt: "2025-05-15",
    tags: ["frontend", "seo"],
    projectId: "proj2",
  },
  {
    id: "act25",
    title: "Database index optimization",
    description: "Optimize slow queries on activity feed.",
    milestoneId: "ms2",
    milestoneName: "Core API Development",
    assigneeId: "tm6",
    assignee: TEAM_MEMBERS[5],
    status: "pending-verification",
    priority: "high",
    powStatus: "awaiting-review",
    dueDate: "2025-06-05",
    createdAt: "2025-05-16",
    tags: ["backend", "database"],
    projectId: "proj1",
  },
  {
    id: "act26",
    title: "User profile settings cleanup",
    description: "Remove deprecated fields and update UI schema.",
    milestoneId: "ms3",
    milestoneName: "Frontend Integration",
    assigneeId: "tm3",
    assignee: TEAM_MEMBERS[2],
    status: "verified",
    priority: "low",
    powStatus: "approved",
    dueDate: "2025-05-28",
    createdAt: "2025-05-17",
    tags: ["frontend", "refactor"],
    projectId: "proj2",
  },
  {
    id: "act27",
    title: "Security: Rate limit auth attempts",
    description: "Prevent brute force attacks on login endpoint.",
    milestoneId: "ms4",
    milestoneName: "Security & Compliance Audit",
    assigneeId: "tm4",
    assignee: TEAM_MEMBERS[3],
    status: "todo",
    priority: "critical",
    powStatus: "not-submitted",
    dueDate: "2025-07-05",
    createdAt: "2025-05-18",
    tags: ["security", "auth"],
    projectId: "proj1",
  },
];

export const VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: "doc1",
    name: "System Architecture Diagram v2.1",
    category: "requirements",
    uploadedBy: "Alice Mwende",
    uploadedAt: "2025-03-10",
    size: "4.2 MB",
    mimeType: "image/png",
    milestoneId: "ms1",
    tags: ["architecture", "technical"],
  },
  {
    id: "doc2",
    name: "API Requirements Specification",
    category: "requirements",
    uploadedBy: "Alice Mwende",
    uploadedAt: "2025-03-12",
    size: "1.8 MB",
    mimeType: "application/pdf",
    milestoneId: "ms1",
    tags: ["requirements", "api"],
  },
  {
    id: "doc3",
    name: "Figma Design System Export",
    category: "designs",
    uploadedBy: "Sarah Kimani",
    uploadedAt: "2025-04-05",
    size: "12.4 MB",
    mimeType: "application/figma",
    milestoneId: "ms3",
    tags: ["design", "figma"],
  },
  {
    id: "doc4",
    name: "Q1 Progress Report",
    category: "reports",
    uploadedBy: "Alice Mwende",
    uploadedAt: "2025-04-01",
    size: "892 KB",
    mimeType: "application/pdf",
    tags: ["report", "q1"],
  },
  {
    id: "doc5",
    name: "Vendor Contract — Cloud Infrastructure",
    category: "contracts",
    uploadedBy: "Alice Mwende",
    uploadedAt: "2025-01-20",
    size: "2.1 MB",
    mimeType: "application/pdf",
    tags: ["contract", "legal"],
  },
  {
    id: "doc6",
    name: "JWT Auth Implementation PoW",
    category: "other",
    uploadedBy: "David Osei",
    uploadedAt: "2025-05-01",
    size: "456 KB",
    mimeType: "image/png",
    activityId: "act2",
    tags: ["pow", "auth"],
  },
  {
    id: "doc7",
    name: "Sprint 4 Retrospective Notes",
    category: "reports",
    uploadedBy: "Alice Mwende",
    uploadedAt: "2025-04-28",
    size: "310 KB",
    mimeType: "application/pdf",
    tags: ["report", "retrospective"],
  },
  {
    id: "doc8",
    name: "UI Component Library Handoff",
    category: "designs",
    uploadedBy: "Sarah Kimani",
    uploadedAt: "2025-04-18",
    size: "8.7 MB",
    mimeType: "application/zip",
    milestoneId: "ms3",
    tags: ["design", "components"],
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "verification",
    message: "David Osei submitted PoW for 'JWT token rotation'",
    time: "12 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "deadline",
    message: "Milestone 'Frontend Integration' is at risk — 6 days to deadline",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "n3",
    type: "verification",
    message: "James Oduya submitted PoW for 'User management endpoints'",
    time: "3 hr ago",
    read: false,
  },
  {
    id: "n4",
    type: "assignment",
    message: "You were assigned 'Security audit preparation'",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n5",
    type: "comment",
    message: "Kevin commented on 'CI/CD pipeline' activity",
    time: "Yesterday",
    read: true,
  },
];
