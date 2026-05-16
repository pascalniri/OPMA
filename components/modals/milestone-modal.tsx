"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import type { MilestoneStatus } from "@/hooks/useMilestones";
import { cn } from "@/lib/utils";
import { RotatingLines } from "react-loader-spinner";

// ─── Config ───────────────────────────────────────────────────────────────────

export const STATUS_CFG: Record<
  MilestoneStatus,
  { label: string; cls: string; dotColor: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
    cls: "bg-neutral-500",
    dotColor: "bg-neutral-300",
  },
  IN_PROGRESS: {
    label: "In Progress",
    cls: "bg-green-500",
    dotColor: "bg-green-400",
  },
  AT_RISK: { label: "At Risk", cls: "bg-amber-500", dotColor: "bg-amber-400" },
  DELAYED: { label: "Delayed", cls: "bg-red-500", dotColor: "bg-red-400" },
  COMPLETED: {
    label: "Completed",
    cls: "bg-blue-500",
    dotColor: "bg-blue-400",
  },
};

const STATUS_OPTIONS = Object.entries(STATUS_CFG) as [
  MilestoneStatus,
  (typeof STATUS_CFG)[MilestoneStatus],
][];

export type FormState = {
  name: string;
  description: string;
  weight: string;
  dueDate: string;
  status: MilestoneStatus;
};

export const EMPTY: FormState = {
  name: "",
  description: "",
  weight: "1",
  dueDate: "",
  status: "NOT_STARTED",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MilestoneModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: FormState;
  onSubmit: (data: FormState) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const isEdit = !!initial.name;

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(v: boolean) {
    if (v) setForm(initial);
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/6">
          <DialogTitle className="text-[13px] font-bold text-[#1A1A1A]">
            {isEdit ? "Edit Milestone" : "New Milestone"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label>
              Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Milestone name…"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description…"
              className="resize-none min-h-20 text-[12px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-transparent px-3 text-[12px] outline-none focus:border-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weight (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  set("status", (v as MilestoneStatus) ?? "NOT_STARTED")
                }
              >
                <SelectTrigger className="w-full">
                  <span className="flex items-center gap-2 text-[12px]">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        STATUS_CFG[form.status].dotColor,
                      )}
                    />
                    {STATUS_CFG[form.status].label}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_OPTIONS.map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              cfg.dotColor,
                            )}
                          />
                          {cfg.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t border-black/6 bg-transparent rounded-none">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(form)}
            disabled={!form.name.trim() || saving}
          >
            {saving ? (
              <RotatingLines strokeColor="white" strokeWidth="3" />
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create milestone"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
