import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectDetail {
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
  pendingVerifications: number;
  creator: { id: string; name: string | null; image: string | null };
  team: { id: string; name: string; identifier: string };
  _count: { milestones: number; activities: number; vaultDocuments: number };
  createdAt: string;
  updatedAt: string;
}

export type ProjectPatch = {
  name?: string;
  description?: string;
  status?: string;
  velocityRisk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate?: string | null;
  endDate?: string | null;
  budgetUsed?: number;
  budgetTotal?: number;
  budgetCurrency?: string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/projects/${projectId}`);
      setProject(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const update = async (data: ProjectPatch): Promise<ProjectDetail> => {
    const tid = toast.loading("Saving…");
    try {
      const res = await api.patch(`/api/projects/${projectId}`, data);
      setProject((prev) => (prev ? { ...prev, ...res.data } : res.data));
      toast.success("Project updated", { id: tid });
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update project", { id: tid });
      throw err;
    }
  };

  return { project, isLoading, error, refresh: fetchProject, update };
}
