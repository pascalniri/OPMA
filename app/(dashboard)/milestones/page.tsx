"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  MILESTONES,
  ACTIVITIES,
  type Milestone,
  type MilestoneStatus,
} from "@/lib/data";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  XCircle,
  ChevronDown,
  CalendarDays,
  Activity,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATUS: Record<
  MilestoneStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "rgba(255,255,255,0.9)",
  },
  "on-track": {
    icon: Circle,
    label: "On Track",
    color: "rgba(255,255,255,0.7)",
  },
  "at-risk": {
    icon: AlertCircle,
    label: "At Risk",
    color: "rgba(255,255,255,0.5)",
  },
  delayed: { icon: XCircle, label: "Delayed", color: "rgba(255,255,255,0.4)" },
  "not-started": {
    icon: Clock,
    label: "Not Started",
    color: "rgba(255,255,255,0.25)",
  },
};

function MilestoneRow({ m, rank }: { m: Milestone; rank: number }) {
  const [open, setOpen] = useState(false);
  const s = STATUS[m.status];
  const Icon = s.icon;
  const acts = ACTIVITIES.filter((a) => a.milestoneId === m.id);
  const pts = ((m.weight / 100) * m.progress).toFixed(1);

  return (
    <>
      <div
        className="grid items-center px-4 py-4 cursor-pointer transition-colors hover:bg-white/10 border-b border-white/[0.05]"
        style={{
          gridTemplateColumns: "48px 1fr 100px 120px 180px 100px 40px",
        }}
        onClick={() => setOpen((p) => !p)}
      >
        <div className="text-xs font-semibold text-white/30">{rank}</div>
        <div>
          <div className="text-xs font-medium text-white/85">{m.name}</div>
          <div className="text-[11px] mt-0.5 text-white/30">
            {m.description.slice(0, 60)}…
          </div>
        </div>
        <div>
          <span className="text-xs font-bold text-[#ffffff]">{pts}</span>
          <span className="text-[11px] ml-1 text-white/28">pts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: s.color }}
            strokeWidth={2}
          />
          <span className="text-xs" style={{ color: s.color }}>
            {s.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
            <div
              className="h-full rounded-full"
              style={{ width: `${m.progress}%`, background: s.color }}
            />
          </div>
          <span className="text-[11px] tabular-nums w-8 text-right shrink-0 text-white/35">
            {m.progress}%
          </span>
        </div>
        <div className="text-[11px] tabular-nums text-white/32">
          {m.dueDate}
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform text-white/25",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </div>

      {open && (
        <div className="bg-[#252523] border-b border-white/[0.05]">
          {acts.length === 0 ? (
            <div className="px-16 py-4 text-xs text-white/30">
              No activities assigned.
            </div>
          ) : (
            acts.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 px-16 py-2.5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.04]"
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    a.status === "verified"
                      ? "bg-[#ffffff]"
                      : a.status === "pending-verification"
                        ? "bg-[#ffffff]"
                        : a.status === "in-progress"
                          ? "bg-[#ffffff]"
                          : "bg-white/15",
                  )}
                />
                <span className="flex-1 text-xs text-white/60">{a.title}</span>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded",
                    a.priority === "critical"
                      ? "text-[#ef4444] bg-[#ef4444]/12"
                      : a.priority === "high"
                        ? "text-[#ffffff] bg-[#ffffff]/12"
                        : "text-[#ffffff] bg-[#ffffff]/12",
                  )}
                >
                  {a.priority}
                </span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${a.assignee.avatarColor}`}
                >
                  {a.assignee.initials}
                </div>
                <span className="text-[10px] tabular-nums w-20 text-right text-white/28">
                  {a.dueDate}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default function MilestonesPage() {
  const totalPts = MILESTONES.reduce(
    (s, m) => s + (m.weight / 100) * m.progress,
    0,
  );
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#252523]">
      <Header
        title="Milestones"
        tabs={[
          { id: "all", label: "All Milestones" },
          { id: "at-risk", label: "At Risk" },
        ]}
        activeTab="all"
        onTabChange={() => {}}
        action={
          <Button>
            <Plus size={12} />
            Create Milestone
          </Button>
        }
        onSearch={() => {}}
      />
      <div className="flex-1 overflow-auto px-8 py-7">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold mb-1 text-white/90">
            Milestones
          </h1>
          <p className="text-xs mb-4 text-white/40">
            Weighted milestones define the scoring structure and delivery gates
            of this project.
          </p>
          <div className="flex items-center gap-4">
            {[
              {
                icon: CheckCircle2,
                text: `${MILESTONES.filter((m) => m.status === "completed").length} completed`,
              },
              {
                icon: AlertCircle,
                text: `${MILESTONES.filter((m) => m.status === "at-risk" || m.status === "delayed").length} at risk`,
              },
              {
                icon: Activity,
                text: `${MILESTONES.reduce((s, m) => s + m.activitiesCount, 0)} total activities`,
              },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-xs text-white/35"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.6} />
                {text}
              </div>
            ))}
            <div className="ml-auto px-3 py-0.5 rounded-md text-[11px] font-bold bg-[#ffffff]/15 text-[#ffffff] border border-[#ffffff]/25">
              Score {totalPts.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
          {/* Header */}
          <div
            className="grid px-4 py-2.5 bg-[#252523] border-b border-white/10"
            style={{
              gridTemplateColumns: "48px 1fr 100px 120px 180px 100px 40px",
            }}
          >
            {[
              "Rank",
              "Milestone",
              "Score",
              "Status",
              "Progress",
              "Due",
              "",
            ].map((col, i) => (
              <div
                key={i}
                className="text-[11px] font-semibold uppercase tracking-widest text-white/28"
              >
                {col}
              </div>
            ))}
          </div>
          {[...MILESTONES]
            .sort((a, b) => b.weight - a.weight)
            .map((m, i) => (
              <MilestoneRow key={m.id} m={m} rank={i + 1} />
            ))}
        </div>
      </div>
    </div>
  );
}
