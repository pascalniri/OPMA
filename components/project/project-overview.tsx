"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ProjectDetail } from "@/hooks/useProject";
import type { Milestone } from "@/hooks/useMilestones";
import type { ProjectMember } from "@/hooks/useTeamMembers";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  CheckCircle2,
  Clock,
  Target,
  Activity,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const RISK_CFG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  LOW: {
    label: "Low",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: TrendingUp,
  },
  MEDIUM: {
    label: "Medium",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: AlertTriangle,
  },
  HIGH: {
    label: "High",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: ShieldAlert,
  },
  CRITICAL: {
    label: "Critical",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: ShieldAlert,
  },
};

const MILESTONE_STATUS_CFG: Record<string, { label: string; cls: string }> = {
  NOT_STARTED: {
    label: "Not Started",
    cls: "bg-neutral-100 text-neutral-500 border-neutral-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    cls: "bg-green-50 text-green-700 border-green-200",
  },
  AT_RISK: {
    label: "At Risk",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DELAYED: { label: "Delayed", cls: "bg-red-50 text-red-700 border-red-200" },
  COMPLETED: {
    label: "Completed",
    cls: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2 text-[#A3A3A3]">
          <Icon size={12} />
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3]">
            {label}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

export function ProjectOverview({
  project,
  milestones,
  members,
}: {
  project: ProjectDetail;
  milestones: Milestone[];
  members: ProjectMember[];
}) {
  const risk = RISK_CFG[project.velocityRisk] ?? RISK_CFG.LOW;
  const RiskIcon = risk.icon;
  const budgetPct =
    project.budgetTotal > 0
      ? Math.round((project.budgetUsed / project.budgetTotal) * 100)
      : 0;
  const budgetBarColor =
    budgetPct >= 90
      ? "bg-red-400"
      : budgetPct >= 70
        ? "bg-amber-400"
        : "bg-green-400";

  return (
    <div className="max-w-6xl space-y-6 min-w-full">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Progress" icon={Target}>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-[#1A1A1A]">
              {project.progress}%
            </span>
            <Progress value={project.progress} className="gap-0" />
          </div>
        </StatCard>

        <StatCard label="Budget" icon={DollarSign}>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-[#1A1A1A]">
              {fmtK(project.budgetUsed)}
              <span className="text-sm font-medium text-[#A3A3A3] ml-1">
                / {fmtK(project.budgetTotal)} {project.budgetCurrency}
              </span>
            </span>
            <div className="h-1 w-full rounded-full bg-black/6 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  budgetBarColor,
                )}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <p className="text-[10px] text-[#A3A3A3]">{budgetPct}% utilized</p>
          </div>
        </StatCard>

        <StatCard label="Velocity Risk" icon={RiskIcon}>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                risk.bg,
              )}
            >
              <RiskIcon size={16} className={risk.color} />
            </div>
            <div>
              <p className={cn("text-sm font-bold", risk.color)}>
                {risk.label}
              </p>
              <p className="text-[10px] text-[#A3A3A3]">velocity risk</p>
            </div>
          </div>
        </StatCard>

        <StatCard label="Verifications" icon={CheckCircle2}>
          <div className="space-y-0.5">
            <span className="text-2xl font-bold text-[#1A1A1A]">
              {project.pendingVerifications}
            </span>
            <p className="text-[10px] text-[#A3A3A3]">awaiting review</p>
          </div>
        </StatCard>
      </div>

      {/* Milestones + team */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">
            Milestones
          </h3>
          <Card size="sm">
            <CardContent className="divide-y divide-black/4 py-0! px-0!">
              {milestones.length === 0 ? (
                <p className="px-4 py-6 text-xs text-[#A3A3A3]">
                  No milestones yet.
                </p>
              ) : (
                milestones.map((ms) => {
                  const cfg = MILESTONE_STATUS_CFG[ms.status] ?? {
                    label: ms.status,
                    cls: "",
                  };
                  const total = ms._count?.activities ?? 0;
                  const progress =
                    total > 0
                      ? Math.round((ms.verifiedActivities / total) * 100)
                      : 0;
                  return (
                    <div
                      key={ms.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span className="shrink-0 w-8 text-center text-[9px] font-bold text-[#A3A3A3]">
                        {ms.weight}%
                      </span>
                      <Separator orientation="vertical" className="h-8" />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-[#1A1A1A] truncate">
                            {ms.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("text-[9px] shrink-0", cfg.cls)}
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                        <Progress value={progress} className="gap-0" />
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-[#1A1A1A] w-8 text-right">
                        {progress}%
                      </span>
                      <div className="shrink-0 flex items-center gap-1 text-[10px] text-[#A3A3A3]">
                        <Clock size={9} />
                        <span>{fmtDate(ms.dueDate)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">
            Team
          </h3>
          <Card size="sm">
            <CardContent className="divide-y divide-black/4 py-0! px-0!">
              {members.length === 0 ? (
                <p className="px-4 py-6 text-xs text-[#A3A3A3]">
                  No members found.
                </p>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-black/4 text-[#737373] font-bold text-[9px]">
                        {initials(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">
                        {m.user.name ?? "Unknown"}
                      </p>
                      <p className="text-[10px] text-[#A3A3A3] truncate capitalize">
                        {m.role.toLowerCase()}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-bold text-[#1A1A1A]">
                        {m.activeActivities}
                      </p>
                      <p className="text-[9px] text-[#A3A3A3]">active</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
