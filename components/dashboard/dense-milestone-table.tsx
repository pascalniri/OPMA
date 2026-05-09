"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { MILESTONES, type MilestoneStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

type SortKey = "name" | "weight" | "progress" | "dueDate" | "status";

const STATUS: Record<
  MilestoneStatus,
  { label: string; icon: React.ElementType; color: string; bar: string }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "#ffffff",
    bar: "#ffffff",
  },
  "on-track": {
    label: "On Track",
    icon: Circle,
    color: "#ffffff",
    bar: "#ffffff",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertCircle,
    color: "#ffffff",
    bar: "#ffffff",
  },
  delayed: {
    label: "Delayed",
    icon: XCircle,
    color: "#ef4444",
    bar: "#ef4444",
  },
  "not-started": {
    label: "Not Started",
    icon: Clock,
    color: "rgba(255,255,255,0.2)",
    bar: "rgba(255,255,255,0.12)",
  },
};

export function DenseMilestoneTable() {
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((p) => !p);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = [...MILESTONES].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "name") cmp = a.name.localeCompare(b.name);
    if (sortKey === "weight") cmp = a.weight - b.weight;
    if (sortKey === "progress") cmp = a.progress - b.progress;
    if (sortKey === "dueDate") cmp = a.dueDate.localeCompare(b.dueDate);
    if (sortKey === "status") cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  function ColHead({
    label,
    k,
    className,
  }: {
    label: string;
    k: SortKey;
    className?: string;
  }) {
    const active = sortKey === k;
    return (
      <th
        className={cn(
          "text-left py-3 px-3 cursor-pointer select-none group",
          className,
        )}
        onClick={() => handleSort(k)}
      >
        <span
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.25)" }}
        >
          {label}
          <ArrowUpDown
            className={cn(
              "w-2.5 h-2.5 shrink-0 transition-opacity",
              active ? "opacity-60" : "opacity-0 group-hover:opacity-30",
            )}
          />
        </span>
      </th>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div
        className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-xs font-semibold text-white/60">
          Milestone Health
        </span>
        <span className="text-[11px] text-white/25">
          Total weight{" "}
          <span className="font-bold" style={{ color: "#ffffff" }}>
            {MILESTONES.reduce((s, m) => s + m.weight, 0)}%
          </span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead
            className="sticky top-0"
            style={{
              background: "#1a1a1e",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <tr>
              <ColHead label="Milestone" k="name" className="pl-5 w-[40%]" />
              <ColHead label="Wt" k="weight" className="w-[7%]" />
              <ColHead label="Status" k="status" className="w-[15%]" />
              <ColHead label="Progress" k="progress" className="w-[26%]" />
              <ColHead label="Due" k="dueDate" className="pr-5 w-[12%]" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const s = STATUS[m.status];
              const Icon = s.icon;
              return (
                <tr
                  key={m.id}
                  className="cursor-default group hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="pl-5 py-3.5 pr-3">
                    <div className="text-[12.5px] font-medium text-white/75">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-white/25 mt-0.5">
                      {m.completedActivities}/{m.activitiesCount} done
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[11px] font-bold text-white/30 tabular-nums">
                      {m.weight}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className="flex items-center gap-1.5 text-[11px] font-medium"
                      style={{ color: s.color }}
                    >
                      <Icon className="w-3 h-3 shrink-0" strokeWidth={2} />
                      {s.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${m.progress}%`, background: s.bar }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white/30 tabular-nums w-8 text-right shrink-0">
                        {m.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-5 px-3">
                    <span className="text-[11px] text-white/30 tabular-nums">
                      {m.dueDate}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
