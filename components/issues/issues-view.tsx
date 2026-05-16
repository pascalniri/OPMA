"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ACTIVITIES,
  TEAM_MEMBERS,
  ALL_PROJECTS,
  type ActivityStatus,
  type Priority,
  type Activity,
} from "@/lib/data";
import {
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Zap,
  Calendar,
  MessageSquare,
  Paperclip,
  ArrowUpRight,
  LayoutGrid,
  List,
  X,
  ChevronUp,
  ChevronsUpDown,
  User,
  Tag,
  Flag,
  Save,
  Trash2,
  Copy,
  Link,
  FolderKanban,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Button } from "../ui/button";

// ── Types ────────────────────────────────────────────────────────────────────
type ViewMode = "list" | "board";
type SortField = "dueDate" | "priority" | "status" | "title" | "createdAt";
type SortOrder = "asc" | "desc";

interface Issue extends Activity {
  comments?: number;
  attachments?: number;
  subTasks?: Array<{ id: string; title: string; completed: boolean }>;
}

// ── Configuration ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ActivityStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: any;
    boardColumn: string;
    order: number;
  }
> = {
  todo: {
    label: "Backlog",
    color: "text-slate-400",
    bg: "bg-slate-50",
    icon: Circle,
    boardColumn: "Backlog",
    order: 0,
  },
  "in-progress": {
    label: "In Progress",
    color: "text-foreground",
    bg: "bg-black/[0.04]",
    icon: Clock,
    boardColumn: "In Progress",
    order: 1,
  },
  "pending-verification": {
    label: "In Review",
    color: "text-orange-500",
    bg: "bg-orange-50",
    icon: AlertCircle,
    boardColumn: "In Review",
    order: 2,
  },
  verified: {
    label: "Verified",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle2,
    boardColumn: "Verified",
    order: 3,
  },
};

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; order: number }
> = {
  low: { label: "Low", color: "text-slate-400", bg: "bg-slate-100", order: 0 },
  medium: {
    label: "Medium",
    color: "text-foreground",
    bg: "bg-black/[0.04]",
    order: 1,
  },
  high: {
    label: "High",
    color: "text-orange-500",
    bg: "bg-orange-50",
    order: 2,
  },
  critical: {
    label: "Urgent",
    color: "text-rose-500",
    bg: "bg-rose-50",
    order: 3,
  },
};

interface IssuesViewProps {
  title: string;
  description: string;
}

export function IssuesView({ title, description }: IssuesViewProps) {
  // ── State ──
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");

  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());
  const [hoveredIssue, setHoveredIssue] = useState<string | null>(null);

  // ── Logic ──
  const filteredIssues = useMemo(() => {
    return ACTIVITIES.filter((issue) => {
      // Exclude "Done" (verified) items from this strategic view
      if (issue.status === "verified") return false;

      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const matchesStatus =
        selectedStatus === "all" || issue.status === selectedStatus;
      if (!matchesStatus) return false;

      const matchesProject =
        selectedProject === "all" || issue.projectId === selectedProject;
      if (!matchesProject) return false;

      const matchesPriority =
        selectedPriority === "all" || issue.priority === selectedPriority;
      if (!matchesPriority) return false;

      const matchesAssignee =
        selectedAssignee === "all" || issue.assignee.id === selectedAssignee;
      if (!matchesAssignee) return false;

      return true;
    });
  }, [
    searchQuery,
    selectedStatus,
    selectedProject,
    selectedPriority,
    selectedAssignee,
  ]);

  const sortedIssues = useMemo(() => {
    const sorted = [...filteredIssues];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField as keyof Activity];
      let bVal: any = b[sortField as keyof Activity];

      if (sortField === "priority") {
        aVal = PRIORITY_CONFIG[a.priority as Priority].order;
        bVal = PRIORITY_CONFIG[b.priority as Priority].order;
      }

      if (sortField === "status") {
        aVal = STATUS_CONFIG[a.status as ActivityStatus].order;
        bVal = STATUS_CONFIG[b.status as ActivityStatus].order;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredIssues, sortField, sortOrder]);

  const boardGroups = useMemo(() => {
    const groups: Record<string, Issue[]> = {};
    Object.values(STATUS_CONFIG).forEach((status) => {
      groups[status.boardColumn] = [];
    });
    sortedIssues.forEach((issue) => {
      const column = STATUS_CONFIG[issue.status].boardColumn;
      groups[column].push(issue);
    });
    return groups;
  }, [sortedIssues]);

  const toggleIssueSelection = (issueId: string) => {
    const newSelection = new Set(selectedIssues);
    if (newSelection.has(issueId)) newSelection.delete(issueId);
    else newSelection.add(issueId);
    setSelectedIssues(newSelection);
  };

  // ── Components ──
  const IssueCard = ({
    issue,
    isSelected,
  }: {
    issue: Issue;
    isSelected: boolean;
  }) => {
    const status = STATUS_CONFIG[issue.status];
    const priority = PRIORITY_CONFIG[issue.priority];
    const isHovered = hoveredIssue === issue.id;

    return (
      <div
        className={cn(
          "group relative bg-white border transition-all cursor-pointer",
          isSelected
            ? "border-foreground/50 bg-black/[0.02]"
            : "border-black/10 hover:border-black/15",
          "rounded p-4",
        )}
        onMouseEnter={() => setHoveredIssue(issue.id)}
        onMouseLeave={() => setHoveredIssue(null)}
      >
        <div className="flex items-start gap-4">
          <div className="pt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleIssueSelection(issue.id)}
              className="w-3.5 h-3.5 rounded border-black/10 cursor-pointer accent-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                {issue.id}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-tight",
                  priority.bg,
                  priority.color,
                )}
              >
                {priority.label}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                <Flag size={10} className="opacity-50" />
                {issue.milestoneName}
              </div>
            </div>

            <h3 className="text-xs font-bold text-foreground leading-tight transition-all">
              {issue.title}
            </h3>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <Calendar size={10} className="opacity-50" />
                Due {issue.dueDate}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <MessageSquare size={10} className="opacity-50" />
                {issue.comments || 0}
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[9px] font-bold border",
                  status.bg,
                  status.color,
                  "border-current/10",
                )}
              >
                <status.icon size={10} strokeWidth={3} />
                {status.label}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                issue.assignee.avatarColor,
              )}
            >
              {issue.assignee.initials}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#ffffff] overflow-hidden">
      <Header title={title} onSearch={() => {}} />

      <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-black/10 rounded p-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded transition-all",
                  viewMode === "list"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-black/5",
                )}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={cn(
                  "p-1.5 rounded transition-all",
                  viewMode === "board"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-black/5",
                )}
              >
                <FolderKanban size={14} />
              </button>
            </div>
            <Button variant="default">
              <Plus size={14} />
              New Issue
            </Button>
          </div>
        </div>

        {/* ── Context & Filters ── */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-black/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-black/5 px-2.5 py-1 rounded">
              <Zap size={12} className="text-orange-500" />
              {filteredIssues.length} Active Issues
            </div>
            <div className="h-4 w-px bg-black/10" />
            <div className="flex items-center gap-2">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
              >
                <option value="all">All Projects</option>
                {ALL_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={10} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              Sort by:
              <button
                onClick={() => {
                  setSortField("dueDate");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="font-bold text-foreground ml-1"
              >
                Due Date
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="pb-10">
          {viewMode === "list" ? (
            <div className="grid grid-cols-1 gap-3">
              {sortedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  isSelected={selectedIssues.has(issue.id)}
                />
              ))}
              {sortedIssues.length === 0 && (
                <div className="py-20 text-center border border-dashed border-black/10 rounded">
                  <p className="text-[12px] font-bold text-muted-foreground">
                    No active issues found in this workspace.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {Object.entries(boardGroups).map(([title, issues]) => {
                const config = Object.values(STATUS_CONFIG).find(
                  (s) => s.boardColumn === title,
                );
                if (!config) return null;
                return (
                  <div key={title} className="flex-1 min-w-[300px] space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <config.icon
                          size={13}
                          className={config.color}
                          strokeWidth={3}
                        />
                        <h3 className="text-[12px] font-bold text-foreground uppercase tracking-widest">
                          {title}
                        </h3>
                        <span className="text-[10px] font-bold bg-black/5 px-1.5 py-0.5 rounded text-muted-foreground">
                          {issues.length}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-black/5 rounded">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {issues.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          isSelected={selectedIssues.has(issue.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bulk Actions Bar ── */}
      {selectedIssues.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-foreground text-background px-5 py-2.5 rounded shadow-2xl flex items-center gap-4 border border-white/10">
            <span className="text-[11px] font-bold">
              {selectedIssues.size} Strategic Items Selected
            </span>
            <div className="w-px h-4 bg-white/20" />
            <button className="text-[11px] font-bold hover:text-white/80 transition-colors">
              Archive
            </button>
            <button
              onClick={() => setSelectedIssues(new Set())}
              className="p-1 hover:bg-white/10 rounded transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
