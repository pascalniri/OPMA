"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  MILESTONES,
  ACTIVITIES,
  CURRENT_PROJECT,
  TEAM_MEMBERS,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const params = useParams();
  const teamId = params.teamId;
  const verified = ACTIVITIES.filter((a) => a.status === "verified").length;
  const inProg = ACTIVITIES.filter((a) => a.status === "in-progress").length;
  const pending = ACTIVITIES.filter(
    (a) => a.status === "pending-verification",
  ).length;
  const score = MILESTONES.reduce(
    (s, m) => s + (m.weight / 100) * m.progress,
    0,
  );
  const budgetPct = Math.round(
    (CURRENT_PROJECT.budget.used / CURRENT_PROJECT.budget.total) * 100,
  );
  const bars = [3, 5, 4, 8, 6, 7, 4, 9, 11, 8, 6, 5];
  const maxBar = Math.max(...bars);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#252523]">
      <Header title="Reports" onSearch={() => {}} />
      <div className="flex-1 overflow-auto px-8 py-7">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold mb-1 text-white/90">
            Analytics & Reports
          </h1>
          <p className="text-xs text-white/40">
            Project performance, velocity, and budget analytics.
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Project Score",
              value: `${score.toFixed(1)}%`,
              color: "#ffffff",
            },
            {
              label: "Verified",
              value: `${verified}/${ACTIVITIES.length}`,
              color: "#ffffff",
            },
            { label: "Pending Review", value: pending, color: "#ffffff" },
            {
              label: "Budget Used",
              value: `${budgetPct}%`,
              color: budgetPct > 80 ? "#ef4444" : "#a855f7",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="p-5 rounded-lg bg-[#1B1B1A] border border-white/10"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider mb-3 text-white/28">
                {k.label}
              </div>
              <div className="text-[32px] font-bold" style={{ color: k.color }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          {/* Velocity chart */}
          <div className="col-span-2 p-5 rounded-lg bg-[#1B1B1A] border border-white/10">
            <div className="text-xs font-medium mb-1 text-white/75">
              Activity Velocity
            </div>
            <div className="text-[11px] mb-5 text-white/30">
              Weekly activities created — last 12 weeks
            </div>
            <div className="flex items-end gap-1.5 h-24">
              {bars.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${(v / maxBar) * 100}%`,
                    background:
                      i === bars.length - 1
                        ? "#ffffff"
                        : "rgba(100,80,223,0.30)",
                  }}
                />
              ))}
            </div>
          </div>
          {/* Budget */}
          <div className="p-5 rounded-lg bg-[#1B1B1A] border border-white/10">
            <div className="text-xs font-medium mb-1 text-white/75">Budget</div>
            <div className="text-[11px] mb-5 text-white/30">
              Cumulative spend
            </div>
            <div className="text-[28px] font-bold mb-3 text-[#a855f7]">
              {budgetPct}%
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden mb-3 bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-[#a855f7]"
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            {[
              [
                "Total",
                `$${(CURRENT_PROJECT.budget.total / 1000).toFixed(0)}k`,
              ],
              ["Spent", `$${(CURRENT_PROJECT.budget.used / 1000).toFixed(0)}k`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-xs mb-1">
                <span className="text-white/35">{l}</span>
                <span className="text-white/70">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone contribution table */}
        <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
          <div className="px-5 py-3 text-xs font-medium text-white/75 border-b border-white/[0.07]">
            Milestone Contribution
          </div>
          {MILESTONES.map((m, i) => {
            const pts = ((m.weight / 100) * m.progress).toFixed(1);
            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.025]",
                  i < MILESTONES.length - 1
                    ? "border-b border-white/[0.05]"
                    : "",
                )}
              >
                <span className="flex-1 text-xs text-white/70">{m.name}</span>
                <div className="w-40 h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-[#ffffff]"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold w-16 text-right text-[#ffffff]">
                  +{pts}pts
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
