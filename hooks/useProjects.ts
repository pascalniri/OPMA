import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  progress: number;
  velocityRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate: string | null;
  endDate: string | null;
  budgetUsed: number;
  budgetTotal: number;
  budgetCurrency: string;
  teamId: string;
  organizationId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; name: string | null; image: string | null };
  _count?: { milestones: number; activities: number };
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = yup.object({
  name: yup.string().required("Project name is required").min(2, "Name must be at least 2 characters"),
  code: yup.string().required("Project code is required").min(1, "Code is required"),
  description: yup.string().optional(),
  teamId: yup.string().required(),
  organizationId: yup.string().required(),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
  budgetTotal: yup.number().min(0).optional(),
  budgetCurrency: yup.string().optional(),
});

export type CreateProjectData = yup.InferType<typeof schema>;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseProjectsOptions {
  onSuccess?: (project: Project) => void;
}

export default function useProjects(teamId: string, options?: UseProjectsOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
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
    defaultValues: {
      name: "",
      code: "",
      description: "",
      teamId,
      organizationId: "",
      budgetCurrency: "USD",
    },
  });

  const fetchProjects = useCallback(async () => {
    if (!teamId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/projects?teamId=${teamId}`);
      setProjects(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/api/projects", data);
      setProjects((prev) => [res.data, ...prev]);
      reset();
      toast.success("Project created");
      options?.onSuccess?.(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  });

  const update = async (id: string, data: Partial<CreateProjectData>): Promise<Project> => {
    const tid = toast.loading("Saving...");
    try {
      const res = await api.patch(`/api/projects/${id}`, data);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      toast.success("Project updated", { id: tid });
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update project", { id: tid });
      throw err;
    }
  };

  const remove = async (id: string): Promise<void> => {
    const tid = toast.loading("Deleting project...");
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted", { id: tid });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete project", { id: tid });
      throw err;
    }
  };

  return {
    // List state
    projects,
    isLoading,
    error,
    refresh: fetchProjects,
    // Create form
    register,
    errors,
    onSubmit,
    isSubmitting,
    reset,
    setValue,
    watch,
    // Mutations
    update,
    remove,
  };
}
