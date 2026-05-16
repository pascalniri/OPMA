import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActivityStatus = "TODO" | "IN_PROGRESS" | "PENDING_VERIFICATION" | "VERIFIED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type PowStatus = "NOT_SUBMITTED" | "AWAITING_REVIEW" | "APPROVED" | "REJECTED";

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  status: ActivityStatus;
  priority: Priority;
  powStatus: PowStatus;
  dueDate: string | null;
  tags: string[];
  projectId: string;
  milestoneId: string | null;
  assigneeId: string | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  milestone: { id: string; name: string } | null;
  subIssues: { id: string; title: string; done: boolean }[];
  placement: { columnId: string; column: { id: string; label: string; dot: string } } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFilters {
  status?: ActivityStatus;
  priority?: Priority;
  assigneeId?: string;
  milestoneId?: string;
  search?: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({
  title: yup.string().required("Title is required").min(1),
  description: yup.string().optional(),
  milestoneId: yup.string().optional(),
  assigneeId: yup.string().optional(),
  priority: yup.string<Priority>().optional(),
  dueDate: yup.string().optional(),
  tags: yup.array(yup.string().required()).optional(),
});

export type CreateActivityData = yup.InferType<typeof schema>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseActivitiesOptions {
  onSuccess?: (activity: Activity) => void;
}

export default function useActivities(
  projectId: string,
  filters?: ActivityFilters,
  options?: UseActivitiesOptions,
) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "", description: "", priority: "MEDIUM" as Priority },
  });

  const fetchActivities = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.priority) params.set("priority", filters.priority);
      if (filters?.assigneeId) params.set("assigneeId", filters.assigneeId);
      if (filters?.milestoneId) params.set("milestoneId", filters.milestoneId);
      if (filters?.search) params.set("search", filters.search);
      const query = params.toString();
      const res = await api.get(`/api/projects/${projectId}/activities${query ? `?${query}` : ""}`);
      setActivities(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, filters?.status, filters?.priority, filters?.assigneeId, filters?.milestoneId, filters?.search]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/activities`, data);
      setActivities((prev) => [res.data, ...prev]);
      reset();
      toast.success("Activity created");
      options?.onSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create activity");
    } finally {
      setIsSubmitting(false);
    }
  });

  const STATUS_LABEL: Record<string, string> = {
    TODO: "Todo",
    IN_PROGRESS: "In Progress",
    PENDING_VERIFICATION: "Pending Verification",
    VERIFIED: "Verified",
  };

  const create = async (data: { title: string; status?: ActivityStatus }): Promise<Activity> => {
    try {
      const res = await api.post(`/api/projects/${projectId}/activities`, data);
      setActivities((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create activity");
      throw err;
    }
  };

  const update = async (
    id: string,
    data: Partial<Pick<Activity, "title" | "description" | "status" | "priority" | "powStatus" | "tags"> & {
      assigneeId?: string | null;
      milestoneId?: string | null;
      dueDate?: string | null;
    }>,
  ): Promise<Activity> => {
    const tid = toast.loading("Saving…");
    try {
      const res = await api.patch(`/api/activities/${id}`, data);
      setActivities((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      const successMsg = data.status
        ? `Moved to ${STATUS_LABEL[data.status] ?? data.status}`
        : "Saved";
      toast.success(successMsg, { id: tid });
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update activity", { id: tid });
      throw err;
    }
  };

  const remove = async (id: string): Promise<void> => {
    const tid = toast.loading("Deleting activity...");
    try {
      await api.delete(`/api/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success("Activity deleted", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete activity", { id: tid });
      throw err;
    }
  };

  const movePlacement = async (id: string, columnId: string): Promise<void> => {
    try {
      await api.patch(`/api/activities/${id}/placement`, { columnId });
      setActivities((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, placement: a.placement ? { ...a.placement, columnId } : null } : a,
        ),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to move activity");
      throw err;
    }
  };

  return {
    activities,
    isLoading,
    error,
    refresh: fetchActivities,
    register,
    errors,
    onSubmit,
    isSubmitting,
    reset,
    setValue,
    watch,
    create,
    update,
    remove,
    movePlacement,
  };
}
