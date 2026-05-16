"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import useMe from "@/hooks/useMe";
import useProjects from "@/hooks/useProjects";
import type { Project } from "@/hooks/useProjects";
import { RotatingLines } from "react-loader-spinner";
import { cn } from "@/lib/utils";
import {
  Plus,
  LayoutGrid,
  List,
  ChevronRight,
  GitBranch,
  AlertTriangle,
  Layers,
  Clock,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

// ─── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; badgeClass: string }> = {
  active:    { label: "Active",    badgeClass: "bg-green-500" },
  "on-hold": { label: "On Hold",  badgeClass: "bg-orange-500" },
  completed: { label: "Completed", badgeClass: "bg-blue-500" },
  archived:  { label: "Archived", badgeClass: "bg-neutral-500" },
};

const RISK_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  LOW:      { label: "Low risk",    color: "text-green-600",  icon: TrendingUp },
  MEDIUM:   { label: "Medium risk", color: "text-orange-600", icon: AlertTriangle },
  HIGH:     { label: "High risk",   color: "text-red-500",    icon: ShieldAlert },
  CRITICAL: { label: "Critical risk", color: "text-red-700",  icon: ShieldAlert },
};

const STATUSES: Array<{ value: string; label: string }> = [
  { value: "all",       label: "All" },
  { value: "active",    label: "Active" },
  { value: "on-hold",   label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "archived",  label: "Archived" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBudget(used: number, total: number, currency: string) {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
  return `${fmt(used)} / ${fmt(total)} ${currency}`;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function statusCfg(status: string) {
  return STATUS_CFG[status] ?? { label: status, badgeClass: "bg-neutral-400" };
}

function riskCfg(risk: string) {
  return RISK_CFG[risk] ?? { label: risk, color: "text-[#A3A3A3]", icon: TrendingUp };
}

// ─── Project Card (grid view) ─────────────────────────────────────────────────

function ProjectCard({ project, teamId }: { project: Project; teamId: string }) {
  const status = statusCfg(project.status);
  const risk = riskCfg(project.velocityRisk);
  const RiskIcon = risk.icon;

  return (
    <Link href={`/teams/${teamId}/projects/${project.id}`} className="group block">
      <Card className="h-full transition-all hover:ring-foreground/20">
        <CardHeader className="border-b border-foreground/6">
          <div className="flex items-start gap-2 min-w-0">
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded bg-black/4 border border-black/6 text-[9px] font-bold text-[#737373] uppercase tracking-wider">
              {project.code}
            </span>
            <CardTitle className="text-[13px] truncate leading-snug">
              {project.name}
            </CardTitle>
          </div>
          <CardAction>
            <Badge variant="outline" className={cn("text-white", status.badgeClass)}>
              {status.label}
            </Badge>
          </CardAction>
          <CardDescription className="line-clamp-2 leading-relaxed col-span-2">
            {project.description ?? "No description provided."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <Progress value={project.progress}>
            <ProgressLabel className="text-[10px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
              Progress
            </ProgressLabel>
            <ProgressValue className="text-[11px] font-bold text-[#1A1A1A]" />
          </Progress>

          <div className="grid grid-cols-3 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger >
                  <div className="flex flex-col items-center gap-1 p-2 rounded bg-black/2 border border-black/4 cursor-default">
                    <Layers size={12} className="text-[#A3A3A3]" />
                    <span className="text-[11px] font-bold text-[#1A1A1A]">
                      {project._count?.milestones ?? 0}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Milestones</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger >
                  <div className="flex flex-col items-center gap-1 p-2 rounded bg-black/2 border border-black/4 cursor-default">
                    <RiskIcon size={12} className={risk.color} />
                    <span className={cn("text-[11px] font-bold capitalize", risk.color)}>
                      {project.velocityRisk.toLowerCase()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{risk.label}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger >
                  <div className="flex flex-col items-center gap-1 p-2 rounded bg-black/2 border border-black/4 cursor-default">
                    <GitBranch size={12} className="text-[#A3A3A3]" />
                    <span className="text-[11px] font-bold text-[#1A1A1A]">
                      {project._count?.activities ?? 0}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Activities</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>

        <CardFooter className="gap-4 text-[10px] text-[#A3A3A3]">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{fmtDate(project.endDate)}</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1">
            <DollarSign size={10} />
            <span>{fmtBudget(project.budgetUsed, project.budgetTotal, project.budgetCurrency)}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#737373]">
            <span>Open</span>
            <ArrowUpRight size={10} />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

// ─── Project Row (list view) ──────────────────────────────────────────────────

function ProjectRow({ project, teamId }: { project: Project; teamId: string }) {
  const status = statusCfg(project.status);
  const risk = riskCfg(project.velocityRisk);
  const RiskIcon = risk.icon;

  return (
    <Link
      href={`/teams/${teamId}/projects/${project.id}`}
      className="grid grid-cols-[1fr_110px_160px_90px_80px_32px] items-center px-4 h-14 hover:bg-black/1.5 transition-colors group"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="shrink-0 px-1.5 py-0.5 rounded bg-black/4 border border-black/6 text-[9px] font-bold text-[#737373] uppercase tracking-wider">
          {project.code}
        </span>
        <span className="text-[12px] font-semibold text-[#1A1A1A] truncate">
          {project.name}
        </span>
      </div>

      <Badge variant="outline" className={cn("text-white w-fit", status.badgeClass)}>
        {status.label}
      </Badge>

      <div className="pr-4">
        <Progress value={project.progress}>
          <ProgressValue className="text-[10px] font-bold text-[#1A1A1A] !ml-0" />
        </Progress>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger >
            <div className={cn("flex items-center gap-1 cursor-default", risk.color)}>
              <RiskIcon size={11} />
              <span className="text-[11px] font-medium capitalize">
                {project.velocityRisk.toLowerCase()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>{risk.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center gap-1 text-[11px] text-[#737373]">
        <GitBranch size={11} />
        <span>{project._count?.activities ?? 0} tasks</span>
      </div>

      <ChevronRight
        size={14}
        className="text-[#D4D4D4] group-hover:text-[#737373] transition-colors justify-self-end"
      />
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClear, hasFilters }: { onClear: () => void; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-md bg-black/[0.03] border border-black/6 flex items-center justify-center">
        <LayoutGrid size={20} className="text-[#D4D4D4]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-[#1A1A1A]">
          {hasFilters ? "No projects match your filters" : "No projects yet"}
        </p>
        {hasFilters ? (
          <button
            onClick={onClear}
            className="mt-1 text-xs text-primary underline underline-offset-2"
          >
            Clear filters
          </button>
        ) : (
          <p className="mt-1 text-xs text-[#A3A3A3]">Create your first project to get started.</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamProjectsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { teams } = useMe();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { projects, isLoading, refresh } = useProjects(teamId);

  const currentTeam = useMemo(
    () => teams.find((t) => t.id === teamId),
    [teams, teamId],
  );

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects, search, statusFilter]);

  const hasFilters = search.length > 0 || statusFilter !== "all";

  if (!currentTeam) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-full bg-[#FAFAFA]">
        <RotatingLines
          visible
          height="30"
          width="30"
          color="grey"
          strokeWidth="4"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
        />
        <p className="font-bold text-[12px] text-black">Synchronizing Team Context</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <Header
        title={`${currentTeam.name} — Projects`}
        action={
          <Button variant="default" onClick={() => setIsModalOpen(true)}>
            <Plus size={12} />
            New Project
          </Button>
        }
        onSearch={() => {}}
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-black/4 bg-white shrink-0">
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        <div className="flex items-center gap-0.5 ml-2">
          {STATUSES.map(({ value, label }) => (
            <Button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                statusFilter === value ? "bg-[#1A1A1A] text-white" : "text-[#737373] bg-black/4",
              )}
            >
              {label}
            </Button>
          ))}
        </div>

        <span className="ml-auto text-[11px] text-[#A3A3A3] font-medium">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        </span>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "p-2 rounded transition-colors",
              view === "grid" ? "bg-black/[0.06] text-[#1A1A1A]" : "text-[#A3A3A3] hover:text-[#737373]",
            )}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 rounded transition-colors",
              view === "list" ? "bg-black/[0.06] text-[#1A1A1A]" : "text-[#A3A3A3] hover:text-[#737373]",
            )}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col gap-2 items-center justify-center py-24">
            <RotatingLines
              visible
              height="24"
              width="24"
              color="grey"
              strokeWidth="4"
              animationDuration="0.75"
              ariaLabel="loading-projects"
            />
            <p className="text-[11px] text-[#A3A3A3] font-medium">Loading projects…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={() => { setSearch(""); setStatusFilter("all"); }}
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} teamId={teamId} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-black/10 bg-white overflow-hidden">
            <div className="grid grid-cols-[1fr_110px_160px_90px_80px_32px] items-center px-4 h-9 border-b border-black/4 bg-black/1.5">
              {["Project", "Status", "Progress", "Risk", "Tasks", ""].map((h) => (
                <span key={h} className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  {h}
                </span>
              ))}
            </div>
            <div className="divide-y divide-black/4">
              {filtered.map((project) => (
                <ProjectRow key={project.id} project={project} teamId={teamId} />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teamId={teamId}
        onSuccess={refresh}
      />
    </div>
  );
}
