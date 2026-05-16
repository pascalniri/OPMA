import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MilestoneStatus = "NOT_STARTED" | "IN_PROGRESS" | "AT_RISK" | "COMPLETED" | "DELAYED";

export interface Milestone {
  id: string;
  name: string;
  description: string | null;
  status: MilestoneStatus;
  weight: number;
  dueDate: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  verifiedActivities: number;
  monetaryValue: number;
  _count?: { activities: number };
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({
  name: yup.string().required("Milestone name is required").min(1),
  description: yup.string().optional(),
  weight: yup.number().integer().min(1).optional(),
  dueDate: yup.string().optional(),
});

export type CreateMilestoneData = yup.InferType<typeof schema>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseMilestonesOptions {
  onSuccess?: (milestone: Milestone) => void;
}

export default function useMilestones(projectId: string, options?: UseMilestonesOptions) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: "", weight: 1 },
  });

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/projects/${projectId}/milestones`);
      setMilestones(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load milestones");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/milestones`, data);
      setMilestones((prev) => [...prev, res.data]);
      reset();
      toast.success("Milestone created");
      options?.onSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create milestone");
    } finally {
      setIsSubmitting(false);
    }
  });

  const create = async (data: {
    name: string;
    description?: string;
    weight?: number;
    dueDate?: string | null;
  }): Promise<Milestone> => {
    const tid = toast.loading("Creating milestone…");
    try {
      const res = await api.post(`/api/projects/${projectId}/milestones`, data);
      const newMs: Milestone = { ...res.data, verifiedActivities: 0, _count: { activities: 0 } };
      setMilestones((prev) => [...prev, newMs]);
      toast.success("Milestone created", { id: tid });
      return newMs;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create milestone", { id: tid });
      throw err;
    }
  };

  const update = async (
    id: string,
    data: Partial<Pick<Milestone, "name" | "description" | "status" | "weight"> & { dueDate?: string | null }>,
  ): Promise<Milestone> => {
    const tid = toast.loading("Saving...");
    try {
      const res = await api.patch(`/api/milestones/${id}`, data);
      setMilestones((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      toast.success("Milestone updated", { id: tid });
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update milestone", { id: tid });
      throw err;
    }
  };

  const remove = async (id: string): Promise<void> => {
    const tid = toast.loading("Deleting milestone...");
    try {
      await api.delete(`/api/milestones/${id}`);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      toast.success("Milestone deleted", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete milestone", { id: tid });
      throw err;
    }
  };

  return {
    milestones,
    isLoading,
    error,
    refresh: fetchMilestones,
    register,
    errors,
    onSubmit,
    isSubmitting,
    reset,
    setValue,
    create,
    update,
    remove,
  };
}
