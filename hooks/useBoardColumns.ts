import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BoardColumn {
  id: string;
  label: string;
  position: number;
  dot: string;
  isDefault: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({
  label: yup.string().required("Column name is required").min(1),
  dot: yup.string().optional(),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseBoardColumnsOptions {
  onSuccess?: (column: BoardColumn) => void;
}

export default function useBoardColumns(projectId: string, options?: UseBoardColumnsOptions) {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
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
    defaultValues: { label: "", dot: "#A3A3A3" },
  });

  const fetchColumns = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/projects/${projectId}/board-columns`);
      setColumns(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load board columns");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/projects/${projectId}/board-columns`, data);
      setColumns((prev) => [...prev, res.data]);
      reset();
      toast.success("Column added");
      options?.onSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add column");
    } finally {
      setIsSubmitting(false);
    }
  });

  const update = async (
    id: string,
    data: { label?: string; dot?: string; position?: number },
  ): Promise<BoardColumn> => {
    try {
      const res = await api.patch(`/api/board-columns/${id}`, data);
      setColumns((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update column");
      throw err;
    }
  };

  const remove = async (id: string): Promise<void> => {
    const tid = toast.loading("Removing column...");
    try {
      await api.delete(`/api/board-columns/${id}`);
      setColumns((prev) => prev.filter((c) => c.id !== id));
      toast.success("Column removed", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove column", { id: tid });
      throw err;
    }
  };

  return {
    columns,
    isLoading,
    error,
    refresh: fetchColumns,
    register,
    errors,
    onSubmit,
    isSubmitting,
    reset,
    update,
    remove,
  };
}
