"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TEAM_MEMBERS, ACTIVITIES, type TeamMember } from "@/lib/data";
import { Mail, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const statusColor: Record<string, string> = {
  active: "#ffffff",
  away: "#ffffff",
  offline: "rgba(255,255,255,0.20)",
};

export default function TeamPage() {
  const params = useParams();
  const teamId = params.teamId;
  const totalActive = TEAM_MEMBERS.reduce((s, m) => s + m.activeActivities, 0);
  const totalCompleted = TEAM_MEMBERS.reduce(
    (s, m) => s + m.completedActivities,
    0,
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#252523]">
      <Header
        title="Team"
        action={
          <Button>
            <Plus size={12} />
            Invite
          </Button>
        }
        onSearch={() => {}}
      />
      <div className="flex-1 overflow-auto px-8 py-7">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold mb-1 text-white/90">Team</h1>
          <p className="text-xs mb-4 text-white/40">
            Project contributors, roles, workload, and delivery records.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <span>{TEAM_MEMBERS.length} members</span>
            <span>
              {TEAM_MEMBERS.filter((m) => m.status === "active").length} active
              now
            </span>
            <span>{totalCompleted} activities completed</span>
            <span>{totalActive} in progress</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
          <div
            className="grid px-4 py-2.5 bg-[#252523] border-b border-white/10"
            style={{
              gridTemplateColumns: "1fr 140px 80px 80px 80px 200px 140px",
            }}
          >
            {[
              "Member",
              "Role",
              "Active",
              "Done",
              "Status",
              "Progress",
              "Contact",
            ].map((col) => (
              <div
                key={col}
                className="text-[11px] font-semibold uppercase tracking-widest text-white/28"
              >
                {col}
              </div>
            ))}
          </div>
          {TEAM_MEMBERS.map((m, i) => {
            const total = m.activeActivities + m.completedActivities;
            const pct =
              total > 0 ? Math.round((m.completedActivities / total) * 100) : 0;
            return (
              <div
                key={m.id}
                className={cn(
                  "grid items-center px-4 py-3.5 transition-colors cursor-default hover:bg-white/[0.025]",
                  i < TEAM_MEMBERS.length - 1
                    ? "border-b border-white/[0.05]"
                    : "",
                )}
                style={{
                  gridTemplateColumns: "1fr 140px 80px 80px 80px 200px 140px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${m.avatarColor} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
                  >
                    {m.initials}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/85">
                      {m.name}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-white/40">{m.role}</div>
                <div className="text-xs font-bold text-[#ffffff]">
                  {m.activeActivities}
                </div>
                <div className="text-xs font-bold text-[#ffffff]">
                  {m.completedActivities}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: statusColor[m.status] }}
                  />
                  <span className="text-[11px] capitalize text-white/40">
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-[#ffffff]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums w-8 text-right shrink-0 text-white/30">
                    {pct}%
                  </span>
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="flex items-center gap-1.5 text-[11px] transition-colors hover:opacity-80 text-white/30"
                >
                  <Mail className="w-3 h-3 shrink-0" />
                  {m.email}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
