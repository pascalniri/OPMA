import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  activeActivities: number;
  verifiedActivities: number;
}

export interface OrgMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useTeamMembers(projectId: string, teamId?: string) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get(`/api/projects/${projectId}/members`);
      setMembers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (userId: string, role: string): Promise<void> => {
    if (!teamId) { toast.error("Team ID not available"); return; }
    const tid = toast.loading("Adding member…");
    try {
      await api.post(`/api/teams/${teamId}/members`, { userId, role });
      toast.success("Member added", { id: tid });
      await fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add member", { id: tid });
      throw err;
    }
  };

  const removeMember = async (userId: string): Promise<void> => {
    if (!teamId) { toast.error("Team ID not available"); return; }
    const tid = toast.loading("Removing member…");
    try {
      await api.delete(`/api/teams/${teamId}/members/${userId}`);
      toast.success("Member removed", { id: tid });
      await fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove member", { id: tid });
      throw err;
    }
  };

  const changeRole = async (userId: string, role: string): Promise<void> => {
    if (!teamId) { toast.error("Team ID not available"); return; }
    const tid = toast.loading("Updating role…");
    try {
      await api.patch(`/api/teams/${teamId}/members/${userId}`, { role });
      toast.success("Role updated", { id: tid });
      await fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update role", { id: tid });
      throw err;
    }
  };

  return {
    members,
    isLoading,
    error,
    refresh: fetchMembers,
    addMember,
    removeMember,
    changeRole,
  };
}
