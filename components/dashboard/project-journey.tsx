"use client";

import { MILESTONES, type MilestoneStatus } from "@/lib/data";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  XCircle,
  CalendarDays,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS: Record<
  MilestoneStatus,
  {
    icon: React.ElementType;
    color: string;
    bar: string;
    dot: string;
    label: string;
  }
> = {
  completed: {
    icon: CheckCircle2,
    color: "#ffffff",
    bar: "#ffffff",
    dot: "#ffffff",
    label: "Completed",
  },
  "on-track": {
    icon: Circle,
    color: "rgba(255,255,255,0.7)",
    bar: "rgba(255,255,255,0.7)",
    dot: "rgba(255,255,255,0.7)",
    label: "On Track",
  },
  "at-risk": {
    icon: AlertCircle,
    color: "rgba(255,255,255,0.5)",
    bar: "rgba(255,255,255,0.5)",
    dot: "rgba(255,255,255,0.5)",
    label: "At Risk",
  },
  delayed: {
    icon: XCircle,
    color: "rgba(255,255,255,0.4)",
    bar: "rgba(255,255,255,0.4)",
    dot: "rgba(255,255,255,0.4)",
    label: "Delayed",
  },
  "not-started": {
    icon: Clock,
    color: "rgba(255,255,255,0.2)",
    bar: "rgba(255,255,255,0.12)",
    dot: "rgba(255,255,255,0.12)",
    label: "Not Started",
  },
};

export function ProjectJourney() {
  return (
    <div className="space-y-0">
      {MILESTONES.map((m, i) => {
        const s = STATUS[m.status];
        const Icon = s.icon;
        const isLast = i === MILESTONES.length - 1;

        return (
          <div key={m.id} className="flex gap-5 group">
            {/* Timeline spine */}
            <div className="flex flex-col items-center" style={{ width: 40 }}>
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{
                  background: `${s.color}14`,
                  border: `1.5px solid ${s.color}30`,
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: s.color }}
                  strokeWidth={2}
                />
              </div>
              {!isLast && (
                <div
                  className="w-px flex-1 my-2 min-h-[20px]"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              )}
            </div>

            {/* Card */}
            <div
              className={cn(
                "flex-1 rounded-2xl p-5 transition-all hover:border-white/10 hover:brightness-105",
                isLast ? "mb-0" : "mb-3",
              )}
              style={{
                background: "#1f1f23",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <h3 className="text-xs font-semibold text-white/85">
                      {m.name}
                    </h3>
                    <span
                      className="shrink-0 text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full"
                      style={{
                        color: s.color,
                        background: `${s.color}15`,
                        border: `1px solid ${s.color}28`,
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="shrink-0 text-[10px] font-semibold text-white/20 px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {m.weight}% wt
                    </span>
                  </div>
                  <p className="text-[11.5px] text-white/35 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className="text-[22px] font-bold tabular-nums leading-none"
                    style={{ color: s.color }}
                  >
                    {m.progress}
                  </div>
                  <div className="text-[10px] text-white/25 mt-0.5">%</div>
                  <div
                    className="text-[11px] font-bold mt-1.5"
                    style={{ color: "#ffffff" }}
                  >
                    +{((m.weight / 100) * m.progress).toFixed(1)}pts
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="h-1 w-full rounded-full overflow-hidden mb-3"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.progress}%`, background: s.bar }}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center gap-5 text-[11px] text-white/30">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3" />
                  <span className="font-semibold text-white/50">
                    {m.completedActivities}/{m.activitiesCount}
                  </span>{" "}
                  activities
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3" />
                  Due{" "}
                  <span className="font-semibold text-white/50 ml-1">
                    {m.dueDate}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
