import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubIssue {
  id: string;
  title: string;
  done: boolean;
  activityId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({
  title: yup.string().required("Title is required").min(1),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseSubIssuesOptions {
  onSuccess?: (subIssue: SubIssue) => void;
}

export default function useSubIssues(activityId: string, options?: UseSubIssuesOptions) {
  const [subIssues, setSubIssues] = useState<SubIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "" },
  });

  const fetchSubIssues = useCallback(async () => {
    if (!activityId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/activities/${activityId}/sub-issues`);
      setSubIssues(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load sub-issues");
    } finally {
      setIsLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchSubIssues();
  }, [fetchSubIssues]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/activities/${activityId}/sub-issues`, data);
      setSubIssues((prev) => [...prev, res.data]);
      reset();
      options?.onSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add sub-issue");
    } finally {
      setIsSubmitting(false);
    }
  });

  // Optimistic toggle
  const toggle = async (id: string): Promise<void> => {
    const current = subIssues.find((s) => s.id === id);
    if (!current) return;
    setSubIssues((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
    try {
      const res = await api.patch(`/api/sub-issues/${id}`, { done: !current.done });
      setSubIssues((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    } catch (err: any) {
      setSubIssues((prev) => prev.map((s) => (s.id === id ? current : s)));
      toast.error(err.response?.data?.error || "Failed to update sub-issue");
      throw err;
    }
  };

  const remove = async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/sub-issues/${id}`);
      setSubIssues((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove sub-issue");
      throw err;
    }
  };

  const doneCount = subIssues.filter((s) => s.done).length;

  return {
    subIssues,
    doneCount,
    isLoading,
    error,
    refresh: fetchSubIssues,
    register,
    errors,
    onSubmit,
    isSubmitting,
    reset,
    toggle,
    remove,
  };
}
