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
  { id: "analytics", label: "Analytics" },
];

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
    <div className="flex flex-col h-full overflow-hidden bg-[#252523]">
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
          <h1 className="text-[22px] font-semibold mb-1.5 text-white/90">
            {CURRENT_PROJECT.name}
          </h1>
          <p className="text-xs mb-4 text-white/40">
            {CURRENT_PROJECT.description}
          </p>
        </div>

        {activeTab === "leaderboard" && (
          <>
            {/* ── Filter bar — Arena "Show Filters" row ── */}
            <div className="flex items-center justify-between mb-0 px-4 h-10 rounded-t-lg bg-[#1B1B1A] border-x border-t border-white/10">
              <button className="flex items-center gap-2 text-xs transition-colors text-white/45 hover:text-white/70">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Show Filters
              </button>
              <div className="flex items-center gap-1">
                <span className="text-[11px] mr-2 text-white/28">Sort by</span>
                {(["weight", "progress", "status"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={cn(
                      "px-3 h-6 rounded text-[11px] font-medium capitalize transition-all border",
                      sortBy === opt
                        ? "text-white bg-[#ffffff]/20 border-[#ffffff]/40"
                        : "text-white/38 bg-transparent border-transparent",
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Leaderboard table ── */}
            <div className="bg-[#1B1B1A] border-x border-b border-white/10 rounded-b-lg overflow-hidden">
              {/* Table header */}
              <div
                className="grid px-4 py-2.5 bg-[#252523] border-b border-white/10"
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
                    className="text-[11px] font-semibold uppercase tracking-widest text-white/28"
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
                      "grid items-center px-4 py-4 transition-colors cursor-default hover:bg-white/[0.025]",
                      i < sorted.length - 1
                        ? "border-b border-white/[0.05]"
                        : "",
                    )}
                    style={{
                      gridTemplateColumns: "48px 1fr 120px 110px 180px 100px",
                    }}
                  >
                    {/* Rank */}
                    <div className="text-xs font-semibold text-white/30">
                      {i + 1}
                    </div>

                    {/* Milestone name */}
                    <div>
                      <div className="text-xs font-medium text-white/85">
                        {m.name}
                      </div>
                      <div className="text-[11px] mt-0.5 text-white/30">
                        {m.completedActivities}/{m.activitiesCount} activities ·{" "}
                        {m.weight}% weight
                      </div>
                    </div>

                    {/* Score */}
                    <div>
                      <span className="text-xs font-bold text-white">
                        {pts}
                      </span>
                      <span className="text-[11px] ml-1 text-white/28">
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
                      <span className="text-xs" style={{ color: s.color }}>
                        {s.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${m.progress}%`,
                            background: s.color,
                          }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums w-8 text-right text-white/35">
                        {m.progress}%
                      </span>
                    </div>

                    {/* Due */}
                    <div className="text-[11px] tabular-nums text-white/32">
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

        {activeTab === "analytics" && (
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Overall Score",
                value: `${overallScore.toFixed(1)}%`,
                color: "#ffffff",
              },
              {
                label: "Verified Activities",
                value: `${verified}/${ACTIVITIES.length}`,
                color: "#ffffff",
              },
              {
                label: "Budget Used",
                value: `${Math.round((CURRENT_PROJECT.budget.used / CURRENT_PROJECT.budget.total) * 100)}%`,
                color: "#ffffff",
              },
              {
                label: "At Risk",
                value: MILESTONES.filter(
                  (m) => m.status === "at-risk" || m.status === "delayed",
                ).length,
                color: "#ffffff",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="p-6 rounded-lg bg-[#1B1B1A] border border-white/10"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3 text-white/30">
                  {card.label}
                </div>
                <div
                  className="text-[36px] font-bold"
                  style={{ color: card.color }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
