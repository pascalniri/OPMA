"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { EditProjectModal } from "@/components/modals/edit-project-modal";
import type { ProjectDetail, ProjectPatch } from "@/hooks/useProject";
import type { ProjectMember } from "@/hooks/useTeamMembers";

type TeamSummary = { id: string; name: string; identifier: string };
import { cn } from "@/lib/utils";
import {
  Clock,
  MoreHorizontal,
  Pencil,
  Share2,
  CheckSquare,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  active: {
    label: "Active",
    cls: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
  },
  "on-hold": {
    label: "On Hold",
    cls: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  completed: {
    label: "Completed",
    cls: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  archived: {
    label: "Archived",
    cls: "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-100",
  },
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectHeader({
  project,
  team,
  members,
  onProjectUpdate,
}: {
  project: ProjectDetail;
  team: TeamSummary;
  members: ProjectMember[];
  onProjectUpdate?: (patch: ProjectPatch) => Promise<void>;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const status = STATUS_CFG[project.status] ?? {
    label: project.status,
    cls: "",
  };
  const visible = members.slice(0, 4);
  const overflow = members.length - visible.length;

  return (
    <>
      <div className="shrink-0 bg-white border-b border-black/6 px-6 pt-5 pb-4">
        <div className="flex items-start gap-6 justify-between">
          {/* Identity */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-black/4 border border-black/6 text-[9px] font-bold text-[#737373] uppercase tracking-wider">
                {project.code}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-black/4 border border-black/6 text-[9px] font-medium text-[#737373]">
                {team.identifier}
              </span>
              <Badge
                variant="outline"
                className={cn("text-[10px]", status.cls)}
              >
                {status.label}
              </Badge>
            </div>
            <h1 className="text-lg font-bold text-[#1A1A1A] leading-tight">
              {project.name}
            </h1>
            <p className="text-[11px] text-[#737373] max-w-xl leading-relaxed">
              {project.description ?? "No description."}
            </p>
          </div>

          {/* Actions + avatars */}
          <div className="flex items-center gap-3 shrink-0">
            <TooltipProvider>
              <AvatarGroup>
                {visible.map((m) => (
                  <Tooltip key={m.id}>
                    <TooltipTrigger>
                      <Avatar>
                        <AvatarFallback className="min-h-8 min-w-8 bg-black text-white font-bold text-[9px]">
                          {initials(m.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      {m.user.name ?? "Unknown"} — {m.role}
                    </TooltipContent>
                  </Tooltip>
                ))}
                {overflow > 0 && (
                  <AvatarGroupCount>+{overflow}</AvatarGroupCount>
                )}
              </AvatarGroup>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-10" />

  
            <Button
            variant="default"
              onClick={() => setEditOpen(true)}
            >
              Edit Project
            </Button>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-4 text-[10px] text-[#A3A3A3]">
          <div className="flex items-center gap-1.5">
            <Clock size={10} />
            <span>
              {fmtDate(project.startDate)} → {fmtDate(project.endDate)}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1.5">
            <CheckSquare size={10} />
            <span>
              {project.pendingVerifications} pending verification
              {project.pendingVerifications !== 1 ? "s" : ""}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1.5">
            <span>
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {onProjectUpdate && (
        <EditProjectModal
          project={project}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSave={onProjectUpdate}
        />
      )}
    </>
  );
}
