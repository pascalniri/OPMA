"use client";

import { CURRENT_PROJECT, MILESTONES } from "@/lib/data";
import { TrendingUp, TrendingDown, Clock, DollarSign, Zap, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const budgetPct       = Math.round((CURRENT_PROJECT.budget.used / CURRENT_PROJECT.budget.total) * 100);
const overallProgress = Math.round(MILESTONES.reduce((s, m) => s + (m.weight / 100) * m.progress, 0));
const atRiskCount     = MILESTONES.filter(m => m.status === "at-risk" || m.status === "delayed").length;
const timelineProgress = (() => {
  const start = new Date(CURRENT_PROJECT.startDate).getTime();
  const end   = new Date(CURRENT_PROJECT.endDate).getTime();
  const now   = Date.now();
  return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
})();

type HealthStatus = "good" | "warn" | "bad";

function getStatus(value: number, highIsBad = false): HealthStatus {
  if (highIsBad) return value > 85 ? "bad" : value > 70 ? "warn" : "good";
  return value < 40 ? "bad" : value < 65 ? "warn" : "good";
}

const palette: Record<HealthStatus, { color: string; bg: string; border: string; bar: string }> = {
  good: { color: "#ffffff", bg: "rgba(34,197,94,0.09)",   border: "rgba(34,197,94,0.18)",   bar: "#ffffff" },
  warn: { color: "#ffffff", bg: "rgba(245,158,11,0.09)", border: "rgba(245,158,11,0.18)",  bar: "#ffffff" },
  bad:  { color: "#ef4444", bg: "rgba(239,68,68,0.09)",   border: "rgba(239,68,68,0.18)",   bar: "#ef4444" },
};

const METRICS = [
  { icon: Clock,       label: "Timeline",      value: `${timelineProgress}%`, bar: timelineProgress, sub: `${CURRENT_PROJECT.startDate} → ${CURRENT_PROJECT.endDate}`, status: getStatus(timelineProgress), trend: timelineProgress > 50 ? "warn" : "ok" },
  { icon: DollarSign,  label: "Budget",        value: `${budgetPct}%`,        bar: budgetPct,        sub: `$${(CURRENT_PROJECT.budget.used/1000).toFixed(0)}k of $${(CURRENT_PROJECT.budget.total/1000).toFixed(0)}k`, status: getStatus(budgetPct, true), trend: budgetPct > 70 ? "warn" : "ok" },
  { icon: Zap,         label: "Delivery Score",value: `${overallProgress}%`,  bar: overallProgress,  sub: `${MILESTONES.filter(m=>m.status==="completed").length} milestones done`, status: getStatus(overallProgress), trend: overallProgress > 60 ? "ok" : "warn" },
  { icon: Users2,      label: "Risk Exposure", value: `${atRiskCount} items`, bar: (atRiskCount / MILESTONES.length) * 100, sub: `${atRiskCount} milestones at risk`, status: (atRiskCount === 0 ? "good" : atRiskCount > 2 ? "bad" : "warn") as HealthStatus, trend: atRiskCount > 2 ? "warn" : "ok" },
];

export function ProjectHealth() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {METRICS.map((m) => {
        const p = palette[m.status];
        return (
          <div
            key={m.label}
            className="rounded-2xl p-5 transition-all"
            style={{ background: "#1f1f23", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                <m.icon className="w-4 h-4" style={{ color: p.color }} strokeWidth={2} />
              </div>
              {m.trend === "ok"
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500/60" />
                : <TrendingDown className="w-3.5 h-3.5 text-amber-500/60" />
              }
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-1">{m.label}</div>
            <div className="text-[26px] font-bold tabular-nums leading-none mb-3" style={{ color: p.color }}>{m.value}</div>
            <div className="h-1 w-full rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.bar}%`, background: p.bar }} />
            </div>
            <p className="text-[11px] text-white/30 font-medium leading-snug">{m.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
