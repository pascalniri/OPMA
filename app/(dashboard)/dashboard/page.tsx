"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  CURRENT_PROJECT,
  MILESTONES,
  ACTIVITIES,
  type MilestoneStatus,
} from "@/lib/data";
import {
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityBoard } from "@/components/board/activity-board";

const TABS = [
  { id: "leaderboard", label: "Leaderboard" },
  { id: "board", label: "Activity Board" },
];

const STATUS: Record<
  MilestoneStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "#10b981",
  },
  "on-track": {
    icon: Circle,
    label: "On Track",
    color: "#3b82f6",
  },
  "at-risk": {
    icon: AlertCircle,
    label: "At Risk",
    color: "#f59e0b",
  },
  delayed: { icon: XCircle, label: "Delayed", color: "#ef4444" },
  "not-started": {
    icon: Clock,
    label: "Not Started",
    color: "#71717a",
  },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [sortBy, setSortBy] = useState<"weight" | "progress" | "status">(
    "weight",
  );

  const sorted = [...MILESTONES].sort((a, b) => {
    if (sortBy === "weight") return b.weight - a.weight;
    if (sortBy === "progress") return b.progress - a.progress;
    return a.status.localeCompare(b.status);
  });

  const overallScore = MILESTONES.reduce(
    (s, m) => s + (m.weight / 100) * m.progress,
    0,
  );
  const verified = ACTIVITIES.filter((a) => a.status === "verified").length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Header
        title="Project Pulse"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={() => {}}
      />

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-auto px-8 py-7">
        {/* ── Arena-style page title section ── */}
        <div className="mb-7">
          <h1 className="text-[22px] font-bold mb-1.5 text-[#1A1A1A]">
            {CURRENT_PROJECT.name}
          </h1>
          <p className="text-xs mb-4 text-[#737373]">
            {CURRENT_PROJECT.description}
          </p>
        </div>

        {activeTab === "leaderboard" && (
          <>
            {/* ── Filter bar ── */}
            <div className="flex items-center justify-between mb-0 px-4 h-10 rounded-t-xl bg-white border-x border-t border-black/4">
              <button className="flex items-center gap-2 text-xs transition-colors text-[#737373] hover:text-[#1A1A1A]">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Show Filters
              </button>
              <div className="flex items-center gap-1">
                <span className="text-[11px] mr-2 text-[#A3A3A3]">Sort by</span>
                {(["weight", "progress", "status"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={cn(
                      "px-3 h-6 rounded-md text-[11px] font-medium capitalize transition-all border",
                      sortBy === opt
                        ? "text-[#1A1A1A] bg-black/2 border-black/[0.08]"
                        : "text-[#A3A3A3] bg-transparent border-transparent hover:text-[#1A1A1A]",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Leaderboard table ── */}
            <div className="bg-white border border-black/[0.04] rounded-b-xl overflow-hidden">
              {/* Table header */}
              <div
                className="grid px-4 py-2.5 bg-black/[0.01] border-b border-black/4"
                style={{
                  gridTemplateColumns: "48px 1fr 120px 110px 180px 100px",
                }}
              >
                {[
                  "Rank",
                  "Milestone",
                  "Score",
                  "Status",
                  "Progress",
                  "Due",
                ].map((col) => (
                  <div
                    key={col}
                    className="text-[11px] font-bold uppercase tracking-widest text-[#A3A3A3]"
                  >
                    {col}
                  </div>
                ))}
              </div>

              {/* Table rows */}
              {sorted.map((m, i) => {
                const s = STATUS[m.status];
                const Icon = s.icon;
                const pts = ((m.weight / 100) * m.progress).toFixed(1);
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "grid items-center px-4 py-4 transition-colors cursor-default hover:bg-black/[0.01]",
                      i < sorted.length - 1
                        ? "border-b border-black/[0.04]"
                        : "",
                    )}
                    style={{
                      gridTemplateColumns: "48px 1fr 120px 110px 180px 100px",
                    }}
                  >
                    {/* Rank */}
                    <div className="text-xs font-bold text-[#A3A3A3]">
                      {i + 1}
                    </div>

                    {/* Milestone name */}
                    <div>
                      <div className="text-xs font-bold text-[#1A1A1A]">
                        {m.name}
                      </div>
                      <div className="text-[11px] mt-0.5 text-[#737373]">
                        {m.completedActivities}/{m.activitiesCount} activities ·{" "}
                        {m.weight}% weight
                      </div>
                    </div>

                    {/* Score */}
                    <div>
                      <span className="text-xs font-bold text-[#1A1A1A]">
                        {pts}
                      </span>
                      <span className="text-[11px] ml-1 text-[#A3A3A3]">
                        pts
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <Icon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: s.color }}
                        strokeWidth={2}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/4">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${m.progress}%`,
                            background: s.color,
                          }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums w-8 text-right text-[#A3A3A3]">
                        {m.progress}%
                      </span>
                    </div>

                    {/* Due */}
                    <div className="text-[11px] tabular-nums text-[#A3A3A3]">
                      {m.dueDate}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "board" && (
          <div className="h-[calc(100vh-280px)]">
            <ActivityBoard />
          </div>
        )}
      </div>
    </div>
  );
}
