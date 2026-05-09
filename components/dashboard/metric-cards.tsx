"use client";

import { MILESTONES, ACTIVITIES, CURRENT_PROJECT } from "@/lib/data";
import { Target, TrendingUp, CheckCircle2, Zap } from "lucide-react";

const overallProgress = MILESTONES.reduce((s, m) => s + (m.weight / 100) * m.progress, 0);
const budgetPct       = Math.round((CURRENT_PROJECT.budget.used / CURRENT_PROJECT.budget.total) * 100);
const verifiedCount   = ACTIVITIES.filter(a => a.status === "verified").length;
const completionRate  = Math.round((verifiedCount / ACTIVITIES.length) * 100);

const METRICS = [
  { icon: Target,       label: "Project Score",   value: `${overallProgress.toFixed(1)}%`, bar: overallProgress, barColor: "#ffffff",  sub: "Weighted milestone progress",     color: "#ffffff" },
  { icon: TrendingUp,   label: "Budget Usage",    value: `${budgetPct}%`,        bar: budgetPct,        barColor: budgetPct > 80 ? "#ef4444" : budgetPct > 65 ? "#ffffff" : "#a855f7", sub: `$${(CURRENT_PROJECT.budget.used/1000).toFixed(0)}k of $${(CURRENT_PROJECT.budget.total/1000).toFixed(0)}k used`, color: budgetPct > 80 ? "#ef4444" : budgetPct > 65 ? "#ffffff" : "#a855f7" },
  { icon: CheckCircle2, label: "Completion Rate", value: `${completionRate}%`,   bar: completionRate,   barColor: "#ffffff",  sub: `${verifiedCount} of ${ACTIVITIES.length} verified`, color: "#ffffff" },
  { icon: Zap,          label: "Active Work",     value: ACTIVITIES.filter(a => a.status === "in-progress").length, bar: (ACTIVITIES.filter(a => a.status === "in-progress").length / ACTIVITIES.length) * 100, barColor: "#ffffff", sub: "Currently in progress", color: "#ffffff" },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl p-5 transition-all hover:brightness-105"
          style={{ background: "#1f1f23", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${m.color}14`, border: `1px solid ${m.color}28` }}>
              <m.icon className="w-4 h-4" style={{ color: m.color }} strokeWidth={2} />
            </div>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: m.color, opacity: 0.5 }} />
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-1">{m.label}</div>
          <div className="text-[26px] font-bold tabular-nums leading-none mb-3" style={{ color: m.color }}>{m.value}</div>
          <div className="h-1 w-full rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.bar}%`, background: m.barColor }} />
          </div>
          <p className="text-[11px] text-white/30 font-medium leading-snug">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
