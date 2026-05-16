"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from "@/components/ui/select";
import { RotatingLines } from "react-loader-spinner";
import { AddTeamMemberModal } from "@/components/modals/add-team-member-modal";
import type { ProjectMember } from "@/hooks/useTeamMembers";
import { cn } from "@/lib/utils";
import { CheckCircle2, Activity, Mail, UserPlus, Trash2 } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_CFG: Record<string, { label: string; cls: string }> = {
  OWNER:  { label: "Owner",  cls: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50" },
  ADMIN:  { label: "Admin",  cls: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50" },
  MEMBER: { label: "Member", cls: "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-100" },
  VIEWER: { label: "Viewer", cls: "bg-neutral-50 text-neutral-400 border-neutral-100 hover:bg-neutral-50" },
};

const ROLE_OPTIONS = ["OWNER", "ADMIN", "MEMBER", "VIEWER"];

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({
  member,
  onRoleChange,
  onRemove,
}: {
  member: ProjectMember;
  onRoleChange: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
}) {
  const roleCfg = ROLE_CFG[member.role] ?? { label: member.role, cls: "" };
  const total = member.activeActivities + member.verifiedActivities;
  const completionRate = total > 0 ? Math.round((member.verifiedActivities / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="space-y-4 pt-2">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-black/4 text-[#737373] font-bold text-sm">
              {initials(member.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#1A1A1A] truncate">
              {member.user.name ?? "Unknown"}
            </p>
            {/* Role selector */}
            <Select value={member.role} onValueChange={(r) => r && onRoleChange(member.user.id, r)}>
              <SelectTrigger size="sm" className="mt-1 h-5 border-0 shadow-none px-0 text-[9px] font-bold w-fit gap-1">
                <Badge variant="outline" className={cn("text-[9px] pointer-events-none", roleCfg.cls)}>
                  {roleCfg.label}
                </Badge>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_CFG[r]?.label ?? r}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={() => onRemove(member.user.id)}
            className="text-[#D4D4D4] hover:text-red-400 transition-colors p-0.5 rounded mt-0.5 shrink-0"
            title="Remove member"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center text-[#A3A3A3] mb-1">
              <Activity size={10} />
            </div>
            <p className="text-[13px] font-bold text-[#1A1A1A]">{member.activeActivities}</p>
            <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Active</p>
          </div>
          <div>
            <div className="flex items-center justify-center text-[#A3A3A3] mb-1">
              <CheckCircle2 size={10} />
            </div>
            <p className="text-[13px] font-bold text-[#1A1A1A]">{member.verifiedActivities}</p>
            <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Done</p>
          </div>
          <div>
            <div className="flex items-center justify-center text-[#A3A3A3] mb-1">
              <span className="text-[10px]">%</span>
            </div>
            <p className="text-[13px] font-bold text-[#1A1A1A]">{completionRate}</p>
            <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Rate</p>
          </div>
        </div>

        {member.user.email && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#A3A3A3] hover:text-[#737373] transition-colors">
            <Mail size={10} />
            <span className="truncate">{member.user.email}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Team Tab ─────────────────────────────────────────────────────────────────

export function ProjectTeam({
  members,
  isLoading,
  teamId,
  organizationId,
  onRoleChange,
  onRemove,
  onAdd,
}: {
  members: ProjectMember[];
  isLoading: boolean;
  teamId?: string;
  organizationId?: string;
  onRoleChange?: (userId: string, role: string) => void;
  onRemove?: (userId: string) => void;
  onAdd?: (userId: string, role: string) => Promise<void>;
}) {
  const [addOpen, setAddOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2">
        <RotatingLines visible height="24" width="24" color="grey" strokeWidth="4" animationDuration="0.75" ariaLabel="loading" />
        <p className="text-[11px] text-[#A3A3A3]">Loading team…</p>
      </div>
    );
  }

  const existingUserIds = members.map((m) => m.user.id);

  return (
    <>
      <div className="max-w-6xl space-y-5 min-w-full">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">Team Members</h2>
          <span className="px-2 py-0.5 rounded-full bg-black/4 border border-black/6 text-[10px] font-semibold text-[#737373]">
            {members.length} total
          </span>
          <div className="ml-auto">
            {onAdd && organizationId && (
              <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1.5 text-[#737373]" onClick={() => setAddOpen(true)}>
                <UserPlus size={12} />
                Add Member
              </Button>
            )}
          </div>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-[#A3A3A3] py-12 text-center">No members found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                onRoleChange={onRoleChange ?? (() => {})}
                onRemove={onRemove ?? (() => {})}
              />
            ))}
          </div>
        )}
      </div>

      {onAdd && organizationId && (
        <AddTeamMemberModal
          open={addOpen}
          onOpenChange={setAddOpen}
          organizationId={organizationId}
          existingUserIds={existingUserIds}
          onAdd={onAdd}
        />
      )}
    </>
  );
}
