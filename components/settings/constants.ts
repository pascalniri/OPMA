export const ROLES = ["Owner", "Admin", "Manager", "Contributor", "Viewer"];

export const PERMISSION_CATEGORIES = [
  {
    id: "activity",
    label: "Activity Management",
    permissions: [
      { id: "create_activity", label: "Create Activities", desc: "Allow creating new tasks and milestones." },
      { id: "edit_activity", label: "Edit Descriptions", desc: "Modify task titles and requirements." },
      { id: "delete_activity", label: "Delete Activities", desc: "Permanently remove tasks from the system." },
    ]
  },
  {
    id: "verification",
    label: "PoW & Verification",
    permissions: [
      { id: "upload_pow", label: "Upload Evidence", desc: "Attach documents and links as proof of work." },
      { id: "verify_pow", label: "Final Verification", desc: "Approve PoW and mark tasks as Verified Done." },
      { id: "bypass_pow", label: "Bypass Policy", desc: "Mark as done without evidence (High Risk)." },
    ]
  },
  {
    id: "team",
    label: "Workspace & Team",
    permissions: [
      { id: "invite_team", label: "Invite Members", desc: "Add new users to the organization." },
      { id: "manage_roles", label: "Modify Permissions", desc: "Edit the permission matrix and user roles." },
      { id: "view_logs", label: "Audit Logs", desc: "View detailed history of all system changes." },
    ]
  }
];

export const INTEGRATIONS = [
  {
    name: "GitHub",
    desc: "Link commits and PRs as evidence.",
    connected: true,
    account: "org/core-api",
    color: "#e5e7eb",
  },
  {
    name: "Figma",
    desc: "Attach design links to activities.",
    connected: true,
    account: "opma-designs",
    color: "#a855f7",
  },
  {
    name: "Slack",
    desc: "Receive alerts and reminders.",
    connected: false,
    account: null,
    color: "#ffffff",
  },
  {
    name: "Jira",
    desc: "Sync issues with activities.",
    connected: false,
    account: null,
    color: "#ffffff",
  },
];

export const INITIAL_NOTIFS = [
  {
    label: "PoW Submitted",
    desc: "When a member submits proof of work",
    on: true,
  },
  {
    label: "Deadline Reminders",
    desc: "3 days before a milestone is due",
    on: true,
  },
  {
    label: "Status Changed",
    desc: "When a milestone moves to at-risk",
    on: true,
  },
  {
    label: "New Assignments",
    desc: "When you are assigned an activity",
    on: false,
  },
];
