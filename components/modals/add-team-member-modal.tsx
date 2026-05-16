"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from "@/components/ui/select";
import type { OrgMember } from "@/hooks/useTeamMembers";
import api from "@/lib/axios";
import { Search } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
  { value: "ADMIN",  label: "Admin" },
  { value: "OWNER",  label: "Owner" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AddTeamMemberModal({
  open,
  onOpenChange,
  organizationId,
  existingUserIds,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  existingUserIds: string[];
  onAdd: (userId: string, role: string) => Promise<void>;
}) {
  const [orgMembers, setOrgMembers]   = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [search, setSearch]           = useState("");
  const [selectedId, setSelectedId]   = useState("");
  const [role, setRole]               = useState("MEMBER");
  const [adding, setAdding]           = useState(false);

  useEffect(() => {
    if (!open || !organizationId) return;
    setIsLoading(true);
    setSearch("");
    setSelectedId("");
    setRole("MEMBER");
    api.get(`/api/organizations/${organizationId}/members`)
      .then((r) => setOrgMembers(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [open, organizationId]);

  const available = useMemo(() => {
    return orgMembers
      .filter((m) => !existingUserIds.includes(m.user.id))
      .filter((m) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (m.user.name ?? "").toLowerCase().includes(q) ||
          (m.user.email ?? "").toLowerCase().includes(q)
        );
      });
  }, [orgMembers, existingUserIds, search]);

  const selected = available.find((m) => m.user.id === selectedId) ?? null;

  async function handleAdd() {
    if (!selectedId) return;
    setAdding(true);
    try {
      await onAdd(selectedId, role);
      onOpenChange(false);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/6">
          <DialogTitle className="text-[13px] font-bold text-[#1A1A1A]">Add Team Member</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedId(""); }}
              placeholder="Search by name or email…"
              className="pl-8"
            />
          </div>

          {/* User list */}
          <div className="border border-black/8 rounded-md overflow-hidden max-h-52 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-[11px] text-[#A3A3A3] py-6">Loading…</p>
            ) : available.length === 0 ? (
              <p className="text-center text-[11px] text-[#A3A3A3] py-6">
                {search ? "No users match your search." : "All org members are already in this team."}
              </p>
            ) : (
              available.map((m) => (
                <button
                  key={m.user.id}
                  onClick={() => setSelectedId(m.user.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-black/4 last:border-0 ${
                    selectedId === m.user.id
                      ? "bg-black/4"
                      : "hover:bg-black/2"
                  }`}
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-black/4 text-[#737373] font-bold text-[9px]">
                      {initials(m.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">
                      {m.user.name ?? "Unknown"}
                    </p>
                    <p className="text-[10px] text-[#A3A3A3] truncate">{m.user.email}</p>
                  </div>
                  {selectedId === m.user.id && (
                    <div className="w-2 h-2 rounded-full bg-black/60 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Selected user + role */}
          {selected && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-black/2 border border-black/6">
              <Avatar size="sm">
                <AvatarFallback className="bg-black/4 text-[#737373] font-bold text-[9px]">
                  {initials(selected.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">{selected.user.name}</p>
                <p className="text-[10px] text-[#A3A3A3] truncate">{selected.user.email}</p>
              </div>
              <Select value={role} onValueChange={(v) => setRole(v ?? "MEMBER")}>
                <SelectTrigger size="sm" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ROLE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t border-black/6 bg-transparent rounded-none">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={adding}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selectedId || adding}>
            {adding ? "Adding…" : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
