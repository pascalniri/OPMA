import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  activeOrgId: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: string;
  progress: number;
}

export interface Team {
  id: string;
  name: string;
  identifier: string;
  projects: Project[];
  role: string;
}

export interface Membership {
  role: string;
  organization: Organization;
}

export default function useMe() {
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/me");
      setUser(response.data.user);
      setMemberships(response.data.memberships);
      setActiveOrganization(response.data.activeOrganization);
      setTeams(response.data.teams);
    } catch (err) {
      setError("Failed to fetch user information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchOrganization = async (organizationId: string) => {
    if (organizationId === user?.activeOrgId) return;
    
    setIsSwitching(true);
    const targetOrg = memberships.find(m => m.organization.id === organizationId)?.organization;
    
    const toastId = toast.loading(`Switching to ${targetOrg?.name || 'workspace'}...`);
    
    try {
      await api.patch("/api/me", { organizationId });
      toast.success(`Switched to ${targetOrg?.name}`, { id: toastId });
      
      // Refresh user data to reflect the new active organization
      await fetchMe();
      
      // Force reload after a short delay to update all contexts
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to switch organization";
      toast.error(message, { id: toastId });
      console.error("Failed to switch organization", err);
    } finally {
      setIsSwitching(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return {
    user,
    memberships,
    activeOrganization,
    teams,
    isLoading,
    isSwitching,
    error,
    switchOrganization,
    logout,
    refresh: fetchMe,
  };
}