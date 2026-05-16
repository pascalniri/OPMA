"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RotatingLines } from "react-loader-spinner";
import useMilestones from "@/hooks/useMilestones";
import useProject from "@/hooks/useProject";
import type { Milestone } from "@/hooks/useMilestones";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
} from "lucide-react";
import {
  MilestoneModal,
  STATUS_CFG,
  EMPTY,
  type FormState,
} from "@/components/modals/milestone-modal";

// ─── Config ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

// ─── Milestone Card ───────────────────────────────────────────────────────────

function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
  currency,
}: {
  milestone: Milestone;
  onEdit: () => void;
  onDelete: () => void;
  currency: string;
}) {
  const cfg = STATUS_CFG[milestone.status] ?? {
    label: milestone.status,
    cls: "",
    dotColor: "bg-neutral-300",
  };
  const total = milestone._count?.activities ?? 0;
  const verified = milestone.verifiedActivities;
  const progress = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <Card className="group/card flex flex-col h-full">
      <CardHeader className="border-b">
        <CardTitle className="text-[13px] font-semibold text-[#1A1A1A] pr-2">
          {milestone.name}
        </CardTitle>
        <CardAction className="flex items-center gap-1">
          <button
            className="w-7 h-7 bg-black/3 border border-black/10 cursor-pointer flex items-center justify-center rounded-[4px]"
            onClick={onEdit}
            title="Edit milestone"
          >
            <Pencil size={11} />
          </button>
          <button
            className="w-7 h-7 bg-black/3 border border-black/10 cursor-pointer flex items-center justify-center rounded-[4px]"
            onClick={onDelete}
            title="Delete milestone"
          >
            <Trash2 size={11} />
          </button>
          <Badge
            variant="outline"
            className={cn("text-[10px] ml-1 text-white", cfg.cls)}
          >
            {cfg.label}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 flex-1">
        {milestone.description && (
          <CardDescription className="leading-relaxed">
            {milestone.description}
          </CardDescription>
        )}

        <div className="p-2.5 rounded bg-black/3 border border-black/6 flex items-center justify-between">
          <div className="flex items-center gap-2">
          
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                Milestone Value
              </p>
              <p className="text-[12px] font-bold text-[#1A1A1A]">
                {fmtMoney(milestone.monetaryValue, currency)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-[#A3A3A3] uppercase tracking-wider">
              Weight
            </p>
            <p className="text-[12px] font-bold text-[#1A1A1A]">
              {milestone.weight}%
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="font-semibold text-[#A3A3A3] uppercase tracking-wider">
              Progress
            </span>
            <span className="font-bold text-[#1A1A1A]">{progress}%</span>
          </div>
          <Progress value={progress} className="gap-0" />
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <CheckCircle2
            size={12}
            className={
              verified === total && total > 0
                ? "text-green-500"
                : "text-[#A3A3A3]"
            }
          />
          <span className="text-[#737373]">
            <span className="font-bold text-[#1A1A1A]">{verified}</span>
            {" / "}
            {total} activities verified
          </span>
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t">
        <div className="flex items-center gap-3 text-[10px] text-[#A3A3A3] w-full">
          <div className="flex items-center gap-1.5">
            <Clock size={10} />
            <span>Due {fmtDate(milestone.dueDate)}</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1.5">
            <Layers size={10} />
            <span>Weight: {milestone.weight}%</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// ─── Milestones Tab ───────────────────────────────────────────────────────────

export function ProjectMilestones({ projectId }: { projectId: string }) {
  const {
    milestones,
    isLoading: msLoading,
    create,
    update,
    remove,
  } = useMilestones(projectId);
  const { project, isLoading: prjLoading } = useProject(projectId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Milestone | null>(null);
  const [saving, setSaving] = useState(false);

  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);

  async function handleCreate(form: FormState) {
    setSaving(true);
    try {
      await create({
        name: form.name.trim(),
        description: form.description || undefined,
        weight: parseInt(form.weight) || 1,
        dueDate: form.dueDate || undefined,
      });
      setCreateOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(form: FormState) {
    if (!editTarget) return;
    setSaving(true);
    try {
      await update(editTarget.id, {
        name: form.name.trim(),
        description: form.description || undefined,
        status: form.status,
        weight: parseInt(form.weight) || 1,
        dueDate: form.dueDate || null,
      });
      setEditTarget(null);
    } finally {
      setSaving(false);
    }
  }

  if (msLoading || prjLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2">
        <RotatingLines
          visible
          height="24"
          width="24"
          color="grey"
          strokeWidth="4"
          animationDuration="0.75"
          ariaLabel="loading"
        />
        <p className="text-[11px] text-[#A3A3A3]">Loading milestones…</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <>
      <div className="max-w-6xl space-y-5 min-w-full">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">
            Milestones
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-black/4 border border-black/6 text-[10px] font-semibold text-[#737373]">
            {milestones.length} total
          </span>
          {totalWeight > 0 && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full border text-[10px] font-semibold",
                totalWeight > 100
                  ? "bg-red-50 border-red-100 text-red-700"
                  : "bg-green-50 border-green-100 text-green-700",
              )}
            >
              {totalWeight}% weight assigned
            </span>
          )}
          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] gap-1.5 text-[#737373]"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={12} />
              New Milestone
            </Button>
          </div>
        </div>

        {milestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 border border-dashed border-black/8 rounded-lg">
            <p className="text-[12px] text-[#A3A3A3]">No milestones yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={12} />
              Add first milestone
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {milestones.map((ms) => (
              <MilestoneCard
                key={ms.id}
                milestone={ms}
                currency={project.budgetCurrency}
                onEdit={() => setEditTarget(ms)}
                onDelete={() => remove(ms.id)}
              />
            ))}
          </div>
        )}
      </div>

      <MilestoneModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={EMPTY}
        onSubmit={handleCreate}
        saving={saving}
      />

      {editTarget && (
        <MilestoneModal
          open
          onOpenChange={(v) => {
            if (!v) setEditTarget(null);
          }}
          initial={{
            name: editTarget.name,
            description: editTarget.description ?? "",
            weight: String(editTarget.weight),
            dueDate: editTarget.dueDate ? editTarget.dueDate.slice(0, 10) : "",
            status: editTarget.status,
          }}
          onSubmit={handleEdit}
          saving={saving}
        />
      )}
    </>
  );
}
