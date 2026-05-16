"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  Hash,
  AlignLeft,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Loader2,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useProjects from "@/hooks/useProjects";
import useMe from "@/hooks/useMe";
import { RotatingLines } from "react-loader-spinner";
import { Label } from "../ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function autoCode(name: string): string {
  const word = name.trim().split(/\s+/)[0] ?? "";
  const slug = word.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return slug ? `${slug}-${new Date().getFullYear()}` : "";
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function CreateProjectModal({
  isOpen,
  onClose,
  teamId,
  onSuccess,
}: CreateProjectModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const { activeOrganization } = useMe();

  const {
    register,
    errors,
    onSubmit: hookSubmit,
    isSubmitting,
    reset,
    setValue,
    watch,
  } = useProjects(teamId, {
    onSuccess: () => {
      setSubmitted(true);
      onSuccess?.();
      setTimeout(handleClose, 1800);
    },
  });

  const nameValue = watch("name");

  useEffect(() => {
    const generated = autoCode(nameValue ?? "");
    if (generated) setValue("code", generated);
  }, [nameValue, setValue]);

  useEffect(() => {
    setValue("teamId", teamId);
  }, [teamId, setValue]);

  useEffect(() => {
    if (activeOrganization?.id) {
      setValue("organizationId", activeOrganization.id);
    }
  }, [activeOrganization, setValue, isOpen]);

  function handleClose() {
    reset();
    setSubmitted(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/6">
          <DialogTitle className="text-sm font-semibold text-[#1A1A1A]">
            New Project
          </DialogTitle>
          <p className="text-xs text-[#A3A3A3]">
            Projects track milestones, activities, and proof of work for your team.
          </p>
        </DialogHeader>

        {/* ── Success state ── */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 px-6">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">
              Project Created
            </h3>
            <p className="text-xs text-[#A3A3A3] text-center">
              Your project is ready. Head over to set up milestones.
            </p>
          </div>
        ) : (
          <form id="create-project-form" onSubmit={hookSubmit} className="px-6 pt-5 pb-6 space-y-4">
            {/* Hidden fields */}
            <input type="hidden" {...register("teamId")} />
            <input type="hidden" {...register("organizationId")} />

            {/* ── Name ── */}
            <div>
              <Label>
                Project Name <span className="text-[#D4D4D4] normal-case font-normal tracking-normal">(required)</span>
              </Label>
              <div className="relative">
                <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                <Input
                  {...register("name")}
                  placeholder="e.g. Website Redesign"
                  className="pl-9"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[10px] text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* ── Code ── */}
            <div>
              <Label>
                Project Code
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                <Input
                  {...register("code")}
                  placeholder="e.g. WEB-2025"
                  className="pl-9 uppercase"
                />
              </div>
              {errors.code ? (
                <p className="mt-1.5 text-[10px] text-red-500">{errors.code.message}</p>
              ) : (
                <p className="mt-1.5 text-[10px] text-[#D4D4D4]">
                  Auto-generated from name. Used as the project identifier.
                </p>
              )}
            </div>

            {/* ── Description ── */}
            <div>
              <Label>
                Description <span className="text-[#D4D4D4] normal-case font-normal tracking-normal">(optional)</span>
              </Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-3.5 h-3.5 text-[#A3A3A3]" />
                <textarea
                  {...register("description")}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full pl-9 pr-3 py-2 bg-transparent border border-black/10 rounded-md text-xs outline-none focus:border-black/20 transition-all text-[#1A1A1A] resize-none placeholder:text-[#D4D4D4]"
                />
              </div>
            </div>

            {/* ── Dates ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>
                  Start Date
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                  <Input
                    type="date"
                    {...register("startDate")}
                    className="pl-9 text-[#737373]"
                  />
                </div>
              </div>
              <div>
                <Label>
                  End Date
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                  <Input
                    type="date"
                    {...register("endDate")}
                    className="pl-9 text-[#737373]"
                  />
                </div>
              </div>
            </div>

            {/* ── Budget ── */}
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div>
                <Label>
                  Budget
                </Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A3A3A3]" />
                  <Input
                    type="number"
                    min={0}
                    {...register("budgetTotal", { valueAsNumber: true })}
                    placeholder="0"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>
                  Currency
                </Label>
                <Input
                  {...register("budgetCurrency")}
                  placeholder="USD"
                  className="uppercase"
                  maxLength={3}
                />
              </div>
            </div>

          </form>
        )}

        <DialogFooter className="mx-0 mb-0 px-6 py-4 border-t border-black/6 bg-transparent rounded-none">
          <Button type="button" variant="ghost" onClick={handleClose} className="text-[#737373]">
            Cancel
          </Button>
          <Button type="submit" form="create-project-form" disabled={isSubmitting || submitted}>
            {isSubmitting ? <RotatingLines strokeColor="white" strokeWidth="3" /> : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
