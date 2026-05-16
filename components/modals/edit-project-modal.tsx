"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem,
} from "@/components/ui/select";
import type { ProjectDetail, ProjectPatch } from "@/hooks/useProject";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "active",    label: "Active" },
  { value: "on-hold",   label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "archived",  label: "Archived" },
];

const RISK_OPTIONS = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"];

// ─── Component ────────────────────────────────────────────────────────────────

export function EditProjectModal({
  project,
  open,
  onOpenChange,
  onSave,
}: {
  project: ProjectDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: ProjectPatch) => Promise<void>;
}) {
  const [name, setName]               = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus]           = useState(project.status);
  const [velocityRisk, setRisk]       = useState(project.velocityRisk);
  const [startDate, setStartDate]     = useState(project.startDate ? project.startDate.slice(0, 10) : "");
  const [endDate, setEndDate]         = useState(project.endDate ? project.endDate.slice(0, 10) : "");
  const [budgetUsed, setBudgetUsed]   = useState(String(project.budgetUsed));
  const [budgetTotal, setBudgetTotal] = useState(String(project.budgetTotal));
  const [currency, setCurrency]       = useState(project.budgetCurrency);
  const [saving, setSaving]           = useState(false);

  // Re-sync if project changes while modal is closed
  useEffect(() => {
    if (!open) return;
    setName(project.name);
    setDescription(project.description ?? "");
    setStatus(project.status);
    setRisk(project.velocityRisk);
    setStartDate(project.startDate ? project.startDate.slice(0, 10) : "");
    setEndDate(project.endDate ? project.endDate.slice(0, 10) : "");
    setBudgetUsed(String(project.budgetUsed));
    setBudgetTotal(String(project.budgetTotal));
    setCurrency(project.budgetCurrency);
  }, [open, project]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description || undefined,
        status,
        velocityRisk,
        startDate: startDate || null,
        endDate: endDate || null,
        budgetUsed: parseFloat(budgetUsed) || 0,
        budgetTotal: parseFloat(budgetTotal) || 0,
        budgetCurrency: currency,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/6">
          <DialogTitle className="text-[13px] font-bold text-[#1A1A1A]">Edit Project</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description…"
              className="resize-none min-h-20 text-[12px]"
            />
          </div>

          {/* Status + Velocity Risk */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v ?? "active")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Velocity Risk</Label>
              <Select value={velocityRisk} onValueChange={(v) => setRisk(v as typeof velocityRisk)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {RISK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Start Date</Label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-transparent px-3 text-[12px] outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">End Date</Label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-transparent px-3 text-[12px] outline-none focus:border-ring"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Budget</Label>
            <div className="grid grid-cols-[1fr_1fr_100px] gap-2">
              <div className="space-y-1">
                <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Used</p>
                <Input
                  type="number"
                  min="0"
                  value={budgetUsed}
                  onChange={(e) => setBudgetUsed(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Total</p>
                <Input
                  type="number"
                  min="0"
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Currency</p>
                <Select value={currency} onValueChange={(v) => setCurrency(v ?? "USD")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t border-black/6 bg-transparent rounded-none">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
