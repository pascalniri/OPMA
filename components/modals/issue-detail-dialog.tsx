"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectGroup, SelectItem,
} from "@/components/ui/select";
import type { Activity, ActivityStatus, Priority } from "@/hooks/useActivities";
import type { ProjectMember } from "@/hooks/useTeamMembers";
import type { Milestone } from "@/hooks/useMilestones";
import useSubIssues from "@/hooks/useSubIssues";
import { cn } from "@/lib/utils";
import {
  X, Plus, CheckSquare, Square, ShieldCheck,
  CalendarDays, Layers, Tag, User, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityPatch = {
  title?: string;
  description?: string | null;
  status?: ActivityStatus;
  priority?: Priority;
  assigneeId?: string | null;
  milestoneId?: string | null;
  dueDate?: string | null;
  tags?: string[];
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ActivityStatus, { label: string; dot: string; cls: string }> = {
  TODO:                 { label: "Todo",         dot: "bg-neutral-400", cls: "bg-neutral-500 text-white" },
  IN_PROGRESS:          { label: "In Progress",   dot: "bg-blue-500",    cls: "bg-blue-500 text-white" },
  PENDING_VERIFICATION: { label: "Pending",       dot: "bg-orange-400",  cls: "bg-orange-500 text-white" },
  VERIFIED:             { label: "Verified",      dot: "bg-green-500", cls: "bg-green-500 text-white" },
};

const PRIORITY_CFG: Record<Priority, { label: string; dot: string; cls: string }> = {
  LOW:      { label: "Low",      dot: "bg-green-500", cls: "text-green-700" },
  MEDIUM:   { label: "Medium",   dot: "bg-amber-400",   cls: "text-amber-700" },
  HIGH:     { label: "High",     dot: "bg-orange-500",  cls: "text-orange-700" },
  CRITICAL: { label: "Critical", dot: "bg-red-500",     cls: "text-red-700" },
};

const POW_CFG: Record<string, { label: string; color: string }> = {
  NOT_SUBMITTED:   { label: "Not submitted",  color: "text-[#A3A3A3]" },
  AWAITING_REVIEW: { label: "Awaiting review", color: "text-amber-600" },
  APPROVED:        { label: "Approved",        color: "text-green-600" },
  REJECTED:        { label: "Rejected",        color: "text-red-500" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function issueId(rawId: string) {
  const short = rawId.slice(-6).toUpperCase();
  return `ISS-${short}`;
}

// ─── Sub-row layout ───────────────────────────────────────────────────────────

function MetaField({ icon: Icon, label, children }: {
  icon: React.ElementType; label: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Icon size={11} className="text-[#A3A3A3] shrink-0" />
        <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">{label}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function IssueDetailDialog({
  activity,
  columnLabel,
  columnDot,
  open,
  onOpenChange,
  onSave,
  members = [],
  milestones = [],
}: {
  activity: Activity;
  columnLabel: string;
  columnDot: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: ActivityPatch) => void;
  members?: Pick<ProjectMember, "id" | "role" | "user">[];
  milestones?: Pick<Milestone, "id" | "name">[];
}) {
  // Editable local state — re-synced when activity changes
  const [title, setTitle]           = useState(activity.title);
  const [description, setDescription] = useState(activity.description ?? "");
  const [status, setStatus]         = useState<ActivityStatus>(activity.status);
  const [priority, setPriority]     = useState<Priority>(activity.priority);
  const [assigneeId, setAssigneeId] = useState(activity.assigneeId ?? "");
  const [milestoneId, setMilestoneId] = useState(activity.milestoneId ?? "");
  const [dueDate, setDueDate]       = useState(activity.dueDate ? activity.dueDate.slice(0, 10) : "");
  const [tags, setTags]             = useState<string[]>(activity.tags);
  const [newTag, setNewTag]         = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Sub-issues via hook (real-time, persisted)
  const {
    subIssues, doneCount, isSubmitting: siSubmitting,
    register: siRegister, onSubmit: siSubmit, toggle, remove: removeSubIssue,
  } = useSubIssues(activity.id);

  useEffect(() => {
    setTitle(activity.title);
    setDescription(activity.description ?? "");
    setStatus(activity.status);
    setPriority(activity.priority);
    setAssigneeId(activity.assigneeId ?? "");
    setMilestoneId(activity.milestoneId ?? "");
    setDueDate(activity.dueDate ? activity.dueDate.slice(0, 10) : "");
    setTags(activity.tags);
    setNewTag("");
  }, [activity.id]);

  const isDirty =
    title !== activity.title ||
    description !== (activity.description ?? "") ||
    status !== activity.status ||
    priority !== activity.priority ||
    (assigneeId || null) !== activity.assigneeId ||
    (milestoneId || null) !== activity.milestoneId ||
    dueDate !== (activity.dueDate ? activity.dueDate.slice(0, 10) : "") ||
    JSON.stringify(tags) !== JSON.stringify(activity.tags);

  function handleSave() {
    onSave(activity.id, {
      title: title.trim() || activity.title,
      description: description || null,
      status,
      priority,
      assigneeId: assigneeId || null,
      milestoneId: milestoneId || null,
      dueDate: dueDate || null,
      tags,
    });
    onOpenChange(false);
  }

  function handleDiscard() {
    onOpenChange(false);
  }

  function addTag() {
    const t = newTag.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setNewTag("");
    tagInputRef.current?.focus();
  }

  const statusCfg  = STATUS_CFG[status];
  const priorityCfg = PRIORITY_CFG[priority];
  const powCfg     = POW_CFG[activity.powStatus] ?? POW_CFG.NOT_SUBMITTED;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDiscard(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-230 max-w-230 w-230 p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/6 bg-black/1">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded bg-black/4 border border-black/6 text-[9px] font-bold text-[#737373] uppercase tracking-wider shrink-0">
              {issueId(activity.id)}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-2 h-2 rounded-full" style={{ background: columnDot }} />
              <span className="text-[11px] font-semibold text-[#737373]">{columnLabel}</span>
            </div>
            <Separator orientation="vertical" className="h-3 shrink-0" />
            {/* Inline status selector */}
            <Select value={status} onValueChange={(v) => setStatus(v as ActivityStatus)}>
              <SelectTrigger  className={cn("h-5 px-2 text-[10px] font-semibold", statusCfg.cls)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.entries(STATUS_CFG) as [ActivityStatus, typeof STATUS_CFG[ActivityStatus]][]).map(([val, cfg]) => (
                    <SelectItem key={val} value={val}>
                      <span className={cn("w-2 h-2 rounded-full inline-block mr-1.5", cfg.dot)} />
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* Inline priority selector */}
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger size="sm" className="border-0 shadow-none px-2 h-6 text-[10px] font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {(Object.entries(PRIORITY_CFG) as [Priority, typeof PRIORITY_CFG[Priority]][]).map(([val, cfg]) => (
                    <SelectItem key={val} value={val}>
                      <span className={cn("w-2 h-2 rounded-full inline-block mr-1.5", cfg.dot)} />
                      <span className={cfg.cls}>{cfg.label}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <button onClick={handleDiscard} className="text-[#A3A3A3] hover:text-[#1A1A1A] transition-colors p-1 rounded hover:bg-black/4 shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Editable title */}
        <div className="px-5 pt-4 pb-3 border-b border-black/6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[17px] font-bold text-[#1A1A1A] bg-transparent outline-none placeholder:text-[#D4D4D4] leading-snug"
            placeholder="Issue title…"
          />
        </div>

        {/* Body */}
        <div className="grid grid-cols-[1fr_300px] divide-x divide-black/6 max-h-150">
          {/* Left — description + sub-issues */}
          <div className="overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">Description</p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
                className="min-h-[100px] border-black/8 text-[12px] text-[#737373] placeholder:text-[#D4D4D4] resize-none focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">
                Sub-issues
                {subIssues.length > 0 && (
                  <span className="ml-2 text-[#737373] normal-case font-normal">
                    {doneCount}/{subIssues.length} done
                  </span>
                )}
              </p>

              {subIssues.length > 0 && (
                <div className="divide-y divide-black/4 rounded border border-black/6 bg-black/[0.01] px-3">
                  {subIssues.map((si) => (
                    <div key={si.id} className="flex items-center gap-2 py-1.5 group/si">
                      <button onClick={() => toggle(si.id)} className="shrink-0 text-[#A3A3A3] hover:text-[#1A1A1A] transition-colors">
                        {si.done
                          ? <CheckSquare size={13} className="text-green-500" />
                          : <Square size={13} />}
                      </button>
                      <span className={cn("flex-1 text-[12px]", si.done ? "line-through text-[#A3A3A3]" : "text-[#1A1A1A]")}>
                        {si.title}
                      </span>
                      <button
                        onClick={() => removeSubIssue(si.id)}
                        className="shrink-0 opacity-0 group-hover/si:opacity-100 text-[#D4D4D4] hover:text-red-400 transition-all"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={siSubmit} className="flex items-center gap-2">
                <Input
                  {...siRegister("title")}
                  placeholder="Add sub-issue…"
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <Button variant="outline" type="submit" disabled={siSubmitting}>
                  <Plus size={12} />
                </Button>
              </form>
            </div>
          </div>

          {/* Right — metadata sidebar */}
          <div className="overflow-y-auto px-5 py-5 space-y-5">

            {/* Assignee */}
            <MetaField icon={User} label="Assignee">
              <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v ?? "")}>
                <SelectTrigger className="w-full h-9 border-black/10 px-3 text-[12px]">
                  {assigneeId ? (() => {
                    const m = members.find((m) => m.user.id === assigneeId);
                    return (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white border border-black/8 flex items-center justify-center text-[8px] font-bold shrink-0">
                          {initials(m?.user.name ?? null)}
                        </span>
                        <span className="truncate">{m?.user.name ?? m?.user.email ?? "Unknown"}</span>
                      </span>
                    );
                  })() : (
                    <span className="text-[#A3A3A3]">Unassigned</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">
                      <span className="text-[#A3A3A3]">Unassigned</span>
                    </SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user.id} value={m.user.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-black/4 border border-black/6 flex items-center justify-center text-[8px] font-bold text-[#737373] shrink-0">
                            {initials(m.user.name)}
                          </span>
                          {m.user.name ?? m.user.email ?? "Unknown"}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </MetaField>

            {/* Milestone */}
            <MetaField icon={Layers} label="Milestone">
              <Select value={milestoneId} onValueChange={(v) => setMilestoneId(v ?? "")}>
                <SelectTrigger className="w-full h-9 border-black/10 px-3 text-[12px]">
                  {milestoneId ? (() => {
                    const ms = milestones.find((ms) => ms.id === milestoneId);
                    return <span className="truncate">{ms?.name ?? "Unknown milestone"}</span>;
                  })() : (
                    <span className="text-[#A3A3A3]">No milestone</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">
                      <span className="text-[#A3A3A3]">No milestone</span>
                    </SelectItem>
                    {milestones.map((ms) => (
                      <SelectItem key={ms.id} value={ms.id}>{ms.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </MetaField>

            {/* Due Date */}
            <MetaField icon={CalendarDays} label="Due Date">
              <div className="relative">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-9 rounded border border-black/10 bg-transparent px-3 text-[12px] text-[#1A1A1A] outline-none focus:border-ring transition-colors"
                />
                {dueDate && (
                  <button
                    onClick={() => setDueDate("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#D4D4D4] hover:text-[#A3A3A3] transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </MetaField>

            {/* PoW */}
            <MetaField icon={ShieldCheck} label="Proof of Work">
              <div className={cn(
                "h-9 flex items-center px-3 rounded border text-[12px] font-medium",
                activity.powStatus === "APPROVED" && "bg-green-50 border-green-200 text-green-700",
                activity.powStatus === "REJECTED" && "bg-red-50 border-red-200 text-red-600",
                activity.powStatus === "AWAITING_REVIEW" && "bg-amber-50 border-amber-200 text-amber-700",
                activity.powStatus === "NOT_SUBMITTED" && "bg-black/2 border-black/8 text-[#A3A3A3]",
              )}>
                {powCfg.label}
              </div>
            </MetaField>

            {/* Tags */}
            <MetaField icon={Tag} label="Tags">
              <div className="space-y-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-black/4 border border-black/8 text-[10px] font-medium text-[#525252]"
                      >
                        {tag}
                        <button
                          onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                          className="ml-0.5 text-[#A3A3A3] hover:text-red-400 transition-colors"
                        >
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    ref={tagInputRef}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTag(); }
                      e.stopPropagation();
                    }}
                    placeholder="Add a tag…"
                    className="h-8 text-[11px] flex-1 border-black/10"
                  />
                  <Button size="icon-sm" variant="outline" onClick={addTag} disabled={!newTag.trim()}>
                    <Plus size={11} />
                  </Button>
                </div>
              </div>
            </MetaField>

            {isDirty && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-700">
                <AlertCircle size={11} />
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-black/6 bg-black/[0.01]">
          <Button variant="ghost" onClick={handleDiscard}>Discard</Button>
          <Button onClick={handleSave} disabled={!isDirty}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
