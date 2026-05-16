"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Activity, ActivityStatus } from "@/hooks/useActivities";
import type { ProjectMember } from "@/hooks/useTeamMembers";
import type { Milestone } from "@/hooks/useMilestones";
import { cn } from "@/lib/utils";
import { Plus, X, ShieldCheck, CalendarDays } from "lucide-react";
import { Badge } from "../ui/badge";
import { IssueDetailDialog, type ActivityPatch } from "../modals/issue-detail-dialog";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardColumn = {
  id: string;
  label: string;
  sub: string;
  dot: string;
  removable?: boolean;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const INITIAL_COLUMNS: BoardColumn[] = [
  { id: "todo",                 label: "Todo",         sub: "Queued",       dot: "#D4D4D4" },
  { id: "in-progress",          label: "In Progress",  sub: "Active",       dot: "#3B82F6" },
  { id: "pending-verification", label: "Pending",      sub: "Awaiting PoW", dot: "#F59E0B" },
  { id: "verified",             label: "Verified",     sub: "Approved",     dot: "#10B981" },
];

const NEW_COL_COLORS = [
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16",
  "#F97316", "#6366F1", "#14B8A6", "#EAB308",
];

const PRIORITY_CFG: Record<string, { dot: string; badge: string }> = {
  LOW:      { dot: "bg-green-500",   badge: "bg-green-500" },
  MEDIUM:   { dot: "bg-orange-500",  badge: "bg-orange-500" },
  HIGH:     { dot: "bg-orange-500",  badge: "bg-orange-500" },
  CRITICAL: { dot: "bg-red-500",     badge: "bg-red-500" },
};

const POW_COLOR: Record<string, string> = {
  NOT_SUBMITTED:   "text-neutral-400",
  AWAITING_REVIEW: "text-orange-500",
  APPROVED:        "text-green-500",
  REJECTED:        "text-red-500",
};

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function statusToColId(s: ActivityStatus): string {
  const map: Record<ActivityStatus, string> = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    PENDING_VERIFICATION: "pending-verification",
    VERIFIED: "verified",
  };
  return map[s] ?? "backlog";
}

const COL_TO_STATUS: Record<string, ActivityStatus> = {
  "todo":                 "TODO",
  "in-progress":          "IN_PROGRESS",
  "pending-verification": "PENDING_VERIFICATION",
  "verified":             "VERIFIED",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function ActivityCard({
  activity,
  displayTitle,
  isDragging,
  onDragStart,
  onDragEnd,
  onSelect,
}: {
  activity: Activity;
  displayTitle: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onSelect: () => void;
}) {
  const pri = PRIORITY_CFG[activity.priority];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        "group rounded bg-white border border-black/6 p-3.5 space-y-3",
        "hover:border-black/12 hover:shadow-sm",
        "cursor-pointer select-none transition-all duration-150",
        isDragging && "opacity-30 scale-[0.97] grayscale",
      )}
    >
      {/* Priority + title */}
      <div className="flex items-start gap-2">
        <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", pri.dot)} />
        <p className="text-[12px] font-semibold text-[#1A1A1A] leading-snug">
          {displayTitle}
        </p>
      </div>

      {/* Milestone */}
      <p className="text-[10px] text-[#A3A3A3] truncate pl-3.5">
        {activity.milestone?.name ?? "—"}
      </p>

      {/* Tags */}
      {activity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-3.5">
          {activity.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-full bg-black/3 border border-black/6 text-[9px] font-medium text-[#737373]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-black/4">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-black/4 border border-black/6 flex items-center justify-center text-[8px] font-bold text-[#737373]">
            {initials(activity.assignee?.name ?? null)}
          </div>
          <span className="text-[10px] text-[#737373]">
            {(activity.assignee?.name ?? "?").split(" ")[0]}
          </span>
        </div>

        {/* Right meta */}
        <div className="flex items-center gap-2.5">
          <Badge className={cn("uppercase text-white", pri.badge)}>
            {activity.priority}
          </Badge>
          <ShieldCheck size={11} className={POW_COLOR[activity.powStatus]} />
          <div className="flex items-center gap-1 text-[#A3A3A3]">
            <CalendarDays size={9} />
            <span className="text-[9px] font-medium tabular-nums">
              {activity.dueDate ? activity.dueDate.slice(5, 10) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  column,
  activities,
  displayTitles,
  draggedId,
  isOver,
  isAdding,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onRemove,
  onStartAdd,
  onAddActivity,
  onCancelAdd,
  onSelect,
}: {
  column: BoardColumn;
  activities: Activity[];
  displayTitles: Record<string, string>;
  draggedId: string | null;
  isOver: boolean;
  isAdding: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onRemove?: () => void;
  onStartAdd: () => void;
  onAddActivity: (title: string) => void;
  onCancelAdd: () => void;
  onSelect: (id: string) => void;
}) {
  const [newTitle, setNewTitle] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  function submitNew() {
    if (newTitle.trim()) {
      onAddActivity(newTitle.trim());
      setNewTitle("");
    }
  }

  function handleStartAdd() {
    setNewTitle("");
    onStartAdd();
    setTimeout(() => addInputRef.current?.focus(), 0);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "shrink-0 w-75 flex flex-col rounded-md border transition-all duration-150",
        isOver
          ? "bg-black/4 border-black/12 shadow-sm"
          : "bg-black/2 border-black/4",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: column.dot }}
          />
          <div>
            <p className="text-[12px] font-bold text-[#1A1A1A] tracking-tight">
              {column.label}
            </p>
            <p className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
              {column.sub}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold tabular-nums text-[#737373] px-2 py-0.5 rounded-md bg-white border border-black/4 shadow-sm">
            {activities.length}
          </span>
          <button
            onClick={handleStartAdd}
            className="text-[#A3A3A3] hover:text-[#1A1A1A] transition-colors p-0.5 rounded hover:bg-black/4"
          >
            <Plus size={13} />
          </button>
          {column.removable && (
            <button
              onClick={onRemove}
              className="text-[#D4D4D4] hover:text-red-400 transition-colors p-0.5 rounded"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-3 space-y-2.5 min-h-30 transition-colors",
          isOver && "bg-black/1",
        )}
      >
        {/* Quick-add input */}
        {isAdding && (
          <div className="space-y-1.5 pb-1">
            <Input
              ref={addInputRef}
              placeholder="Issue title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.stopPropagation(); submitNew(); }
                if (e.key === "Escape") { onCancelAdd(); setNewTitle(""); }
              }}
              className="h-8 text-xs bg-white"
            />
            <div className="flex gap-1.5">
              <Button
                size="xs"
                onClick={submitNew}
                disabled={!newTitle.trim()}
                className="flex-1 text-[10px]"
              >
                Add issue
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => { onCancelAdd(); setNewTitle(""); }}
                className="text-[10px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {activities.length === 0 && !isAdding ? (
          <div className="flex items-center justify-center h-20 rounded-lg border-2 border-dashed border-black/4">
            <span className="text-[9px] font-bold text-[#D4D4D4] uppercase tracking-widest">
              Drop here
            </span>
          </div>
        ) : (
          activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              displayTitle={displayTitles[a.id] ?? a.title}
              isDragging={draggedId === a.id}
              onDragStart={(e) => { e.stopPropagation(); onDragStart(e, a.id); }}
              onDragEnd={onDragEnd}
              onSelect={() => onSelect(a.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Add Column ───────────────────────────────────────────────────────────────

function AddColumnSlot({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    if (name.trim()) onAdd(name.trim());
    setName("");
    setOpen(false);
  }

  function cancel() {
    setName("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className="shrink-0 w-68 flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed border-black/6 text-[#A3A3A3] hover:border-black/12 hover:text-[#737373] hover:bg-black/1 transition-all"
      >
        <Plus size={16} />
        <span className="text-[11px] font-semibold">Add Column</span>
      </button>
    );
  }

  return (
    <div className="shrink-0 w-68 rounded-xl bg-black/2 border border-black/8 p-4 space-y-3">
      <p className="text-[11px] font-bold text-[#737373] uppercase tracking-wider">
        New Column
      </p>
      <Input
        ref={inputRef}
        placeholder="Column name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") cancel();
        }}
        className="h-8 text-xs"
      />
      <div className="flex gap-2">
        <Button size="xs" onClick={submit} className="flex-1">
          Add
        </Button>
        <Button size="xs" variant="ghost" onClick={cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export function ProjectBoard({
  activities,
  projectId,
  members = [],
  milestones = [],
  onMove,
  onSave,
  onCreate,
  onMovePlacement,
}: {
  activities: Activity[];
  projectId: string;
  members?: Pick<ProjectMember, "id" | "role" | "user">[];
  milestones?: Pick<Milestone, "id" | "name">[];
  onMove?: (id: string, status: ActivityStatus) => void;
  onSave?: (id: string, data: import("@/components/modals/issue-detail-dialog").ActivityPatch) => void;
  onCreate?: (data: { title: string; status: ActivityStatus }) => Promise<Activity>;
  onMovePlacement?: (id: string, columnId: string) => Promise<void>;
}) {
  const [columns, setColumns] = useState<BoardColumn[]>(INITIAL_COLUMNS);
  const [colorIndex, setColorIndex] = useState(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeCol, setActiveCol] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  const [activityPatches, setActivityPatches] = useState<Record<string, ActivityPatch>>({});

  const [placement, setPlacement] = useState<Record<string, string>>(() =>
    Object.fromEntries(activities.map((a) => [
      a.id,
      a.placement?.column.id ?? statusToColId(a.status),
    ])),
  );

  // Load persisted custom columns from API
  useEffect(() => {
    if (!projectId) return;
    api.get(`/api/projects/${projectId}/board-columns`)
      .then((res) => {
        const custom: BoardColumn[] = res.data
          .filter((c: any) => !c.isDefault)
          .map((c: any) => ({ id: c.id, label: c.label, sub: "Custom", dot: c.dot, removable: true }));
        if (custom.length > 0) setColumns([...INITIAL_COLUMNS, ...custom]);
      })
      .catch(() => {});
  }, [projectId]);

  // Sync placement when server-side activities update
  useEffect(() => {
    setPlacement((prev) => {
      const next = { ...prev };
      for (const a of activities) {
        if (!next[a.id]) next[a.id] = a.placement?.column.id ?? statusToColId(a.status);
      }
      return next;
    });
  }, [activities]);

  const allActivities = [...activities, ...localActivities];

  const displayTitles: Record<string, string> = Object.fromEntries(
    allActivities.map((a) => [a.id, activityPatches[a.id]?.title ?? a.title]),
  );

  function createLocalActivity(title: string): Activity {
    const now = new Date().toISOString();
    return {
      id: `local-${Date.now()}`,
      title,
      description: null,
      milestoneId: null,
      assigneeId: null,
      assignee: null,
      milestone: null,
      status: "TODO",
      priority: "MEDIUM",
      powStatus: "NOT_SUBMITTED",
      dueDate: null,
      projectId: "",
      tags: [],
      subIssues: [],
      placement: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async function handleAddActivity(title: string, colId: string) {
    const statusForCol = COL_TO_STATUS[colId] ?? "TODO";
    const temp = createLocalActivity(title);
    setLocalActivities((prev) => [...prev, temp]);
    setPlacement((prev) => ({ ...prev, [temp.id]: colId }));
    setAddingToColumn(null);

    try {
      const real = await onCreate?.({ title, status: statusForCol });
      if (real) {
        setPlacement((prev) => ({ ...prev, [real.id]: colId }));
        if (!COL_TO_STATUS[colId]) {
          api.patch(`/api/activities/${real.id}/placement`, { columnId: colId }).catch(() => {});
        }
      }
    } catch {
      // error toast already shown by hook
    } finally {
      setLocalActivities((prev) => prev.filter((a) => a.id !== temp.id));
      setPlacement((prev) => { const n = { ...prev }; delete n[temp.id]; return n; });
    }
  }

  function handleUpdate(id: string, patch: ActivityPatch) {
    setActivityPatches((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    if (!id.startsWith("local-")) {
      onSave?.(id, patch);
    }
  }

  function onDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.setData("activityId", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent, colId: string) {
    e.preventDefault();
    setActiveCol(colId);
  }

  function onDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setActiveCol(null);
    }
  }

  function onDrop(e: React.DragEvent, colId: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("activityId");
    if (id) {
      setPlacement((prev) => ({ ...prev, [id]: colId }));
      if (!id.startsWith("local-")) {
        const newStatus = COL_TO_STATUS[colId];
        if (newStatus) {
          onMove?.(id, newStatus);
        } else {
          onMovePlacement?.(id, colId);
        }
      }
    }
    setDraggedId(null);
    setActiveCol(null);
  }

  async function addColumn(name: string) {
    const dot = NEW_COL_COLORS[colorIndex % NEW_COL_COLORS.length];
    setColorIndex((i) => i + 1);
    try {
      const res = await api.post(`/api/projects/${projectId}/board-columns`, { label: name, dot });
      const col = res.data;
      setColumns((prev) => [
        ...prev,
        { id: col.id, label: col.label, sub: "Custom", dot: col.dot, removable: true },
      ]);
    } catch {
      toast.error("Failed to create column");
    }
  }

  async function removeColumn(colId: string) {
    setPlacement((prev) => {
      const next = { ...prev };
      for (const [aid, cid] of Object.entries(next)) {
        if (cid === colId) next[aid] = "todo";
      }
      return next;
    });
    setColumns((prev) => prev.filter((c) => c.id !== colId));
    try {
      await api.delete(`/api/board-columns/${colId}`);
    } catch {
      toast.error("Failed to remove column");
    }
  }

  const selectedActivity = selectedId
    ? allActivities.find((a) => a.id === selectedId)
    : null;

  const selectedColumn = selectedId
    ? columns.find((col) => (placement[selectedId] ?? "") === col.id)
    : null;

  return (
    <>
      <div className="flex gap-4 h-full overflow-x-auto pb-4 select-none">
        {columns.map((col) => {
          const colActivities = allActivities.filter(
            (a) => (placement[a.id] ?? a.status) === col.id,
          );
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              activities={colActivities}
              displayTitles={displayTitles}
              draggedId={draggedId}
              isOver={activeCol === col.id}
              isAdding={addingToColumn === col.id}
              onDragOver={(e) => onDragOver(e, col.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, col.id)}
              onDragStart={onDragStart}
              onDragEnd={() => setDraggedId(null)}
              onRemove={col.removable ? () => removeColumn(col.id) : undefined}
              onStartAdd={() => setAddingToColumn(col.id)}
              onAddActivity={(title) => handleAddActivity(title, col.id)}
              onCancelAdd={() => setAddingToColumn(null)}
              onSelect={setSelectedId}
            />
          );
        })}
        <AddColumnSlot onAdd={addColumn} />
      </div>

      {selectedActivity && (
        <IssueDetailDialog
          activity={selectedActivity}
          columnLabel={selectedColumn?.label ?? ""}
          columnDot={selectedColumn?.dot ?? "#A3A3A3"}
          open={!!selectedId}
          onOpenChange={(open) => { if (!open) setSelectedId(null); }}
          onSave={handleUpdate}
          members={members}
          milestones={milestones}
        />
      )}
    </>
  );
}
