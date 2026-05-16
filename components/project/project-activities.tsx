"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ProjectBoard } from "@/components/project/project-board";
import { RotatingLines } from "react-loader-spinner";
import useActivities from "@/hooks/useActivities";
import type {
  Activity,
  ActivityStatus,
  Priority,
  PowStatus,
} from "@/hooks/useActivities";
import type { ProjectMember } from "@/hooks/useTeamMembers";
import type { Milestone } from "@/hooks/useMilestones";
import { cn } from "@/lib/utils";
import { Search, Clock, ShieldCheck, List, Kanban } from "lucide-react";
import { Button } from "../ui/button";

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTIVITY_STATUS_CFG: Record<
  ActivityStatus,
  { label: string; cls: string }
> = {
  TODO: { label: "Todo", cls: "bg-neutral-500" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-blue-500" },
  PENDING_VERIFICATION: { label: "Pending", cls: "bg-orange-500" },
  VERIFIED: { label: "Verified", cls: "bg-green-500" },
};

const PRIORITY_DOT: Record<Priority, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-orange-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

const POW_STATUS_CFG: Record<PowStatus, { label: string; color: string }> = {
  NOT_SUBMITTED: { label: "Not submitted", color: "text-[#A3A3A3]" },
  AWAITING_REVIEW: { label: "Awaiting review", color: "text-orange-600" },
  APPROVED: { label: "Approved", color: "text-green-600" },
  REJECTED: { label: "Rejected", color: "text-red-500" },
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PENDING_VERIFICATION", label: "Pending" },
  { value: "VERIFIED", label: "Verified" },
];

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// ─── Activity Row ─────────────────────────────────────────────────────────────

function ActivityRow({ activity }: { activity: Activity }) {
  const statusCfg = ACTIVITY_STATUS_CFG[activity.status];
  const priorityDot = PRIORITY_DOT[activity.priority];
  const powCfg = POW_STATUS_CFG[activity.powStatus];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-[16px_1fr_130px_100px_80px_80px] items-center gap-4 px-4 h-12 hover:bg-black/1.5 transition-colors group">
        {/* Priority dot */}
        <Tooltip>
          <TooltipTrigger>
            <div className={cn("w-2 h-2 rounded-full mx-auto", priorityDot)} />
          </TooltipTrigger>
          <TooltipContent className="capitalize">
            {activity.priority.toLowerCase()} priority
          </TooltipContent>
        </Tooltip>

        {/* Title + milestone */}
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">
            {activity.title}
          </p>
          <p className="text-[10px] text-[#A3A3A3] truncate">
            {activity.milestone?.name ?? "—"}
          </p>
        </div>

        {/* Status */}
        <Badge
          variant="outline"
          className={cn("text-[10px] text-white w-fit", statusCfg.cls)}
        >
          {statusCfg.label}
        </Badge>

        {/* Assignee */}
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback className="min-h-5 min-w-5 bg-black text-white font-bold text-[8px]">
              {initials(activity.assignee?.name ?? null)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-[#737373] truncate">
            {(activity.assignee?.name ?? "—").split(" ")[0]}
          </span>
        </div>

        {/* PoW */}
        <Tooltip>
          <TooltipTrigger>
            <div className={cn("flex items-center gap-1", powCfg.color)}>
              <ShieldCheck size={11} />
              <span className="text-[10px] font-medium truncate">
                {activity.powStatus === "APPROVED"
                  ? "Approved"
                  : activity.powStatus === "AWAITING_REVIEW"
                    ? "Review"
                    : activity.powStatus === "REJECTED"
                      ? "Rejected"
                      : "–"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>{powCfg.label}</TooltipContent>
        </Tooltip>

        {/* Due date */}
        <div className="flex items-center gap-1 text-[10px] text-[#A3A3A3]">
          <Clock size={10} />
          <span>{activity.dueDate ? fmtDate(activity.dueDate) : "—"}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Activities Tab ───────────────────────────────────────────────────────────

export function ProjectActivities({
  projectId,
  members = [],
  milestones = [],
}: {
  projectId: string;
  members?: Pick<ProjectMember, "id" | "role" | "user">[];
  milestones?: Pick<Milestone, "id" | "name">[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"list" | "board" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("project-activities-view");
    setView((saved as "list" | "board") || "board");
  }, []);

  useEffect(() => {
    if (view) {
      localStorage.setItem("project-activities-view", view);
    }
  }, [view]);

  const { activities, isLoading, update, create, movePlacement } =
    useActivities(projectId);

  const filtered = useMemo(() => {
    if (!view) return [];
    return activities.filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.milestone?.name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        view === "board" || statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [activities, search, statusFilter, view]);

  if (isLoading || !view) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <RotatingLines
          visible
          height="24"
          width="24"
          color="grey"
          strokeWidth="4"
          animationDuration="0.75"
          ariaLabel="loading"
        />
        <p className="text-[11px] text-[#A3A3A3]">Loading activities…</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-5 min-w-full",
        view === "board" ? "max-w-none h-full flex flex-col" : "max-w-6xl",
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <Input
          placeholder="Search activities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {view === "board" && (
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map(({ value, label }) => (
              <Button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={cn(
                  "",
                  statusFilter === value
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#737373] bg-black/4",
                )}
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] text-[#A3A3A3] font-medium">
            {filtered.length} activit{filtered.length !== 1 ? "ies" : "y"}
          </span>

          <div className="flex items-center gap-1 p-1 rounded bg-black/4 border border-black/6">
            <button
              onClick={() => setView("board")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 h-6 rounded text-[11px] font-medium transition-all",
                view === "board"
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#A3A3A3] hover:text-[#737373]",
              )}
            >
              <Kanban size={12} />
              Board
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 h-6 rounded text-[11px] font-medium transition-all",
                view === "list"
                  ? "bg-white text-[#1A1A1A] shadow-sm"
                  : "text-[#A3A3A3] hover:text-[#737373]",
              )}
            >
              <List size={12} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Board view */}
      {view === "board" ? (
        <div className="flex-1 min-h-0">
          <ProjectBoard
            activities={filtered}
            projectId={projectId}
            members={members}
            milestones={milestones}
            onMove={(id, status) => update(id, { status })}
            onSave={(id, data) => update(id, data)}
            onCreate={create}
            onMovePlacement={movePlacement}
          />
        </div>
      ) : (
        <div className="rounded-md border border-black/10 bg-white overflow-hidden w-full">
          <div className="grid grid-cols-[16px_1fr_130px_100px_80px_80px] items-center gap-4 px-4 h-9 border-b border-black/4 bg-black/1.5">
            {["", "Activity", "Status", "Assignee", "PoW", "Due"].map((h) => (
              <span
                key={h}
                className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider"
              >
                {h}
              </span>
            ))}
          </div>
          <div className="divide-y divide-black/4">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[12px] text-[#A3A3A3]">
                No activities match your filters.
              </div>
            ) : (
              filtered.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
