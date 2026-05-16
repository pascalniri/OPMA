import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface OrgMember {
  id: string;
  role: MemberRole;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string;
  expires: string;
}

export default function useOrgMembers(orgId: string | undefined) {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!orgId) return;
    try {
      setIsLoading(true);
      setError(null);
      const [membersRes, invitesRes] = await Promise.all([
        api.get(`/api/organizations/${orgId}/members`),
        api.get(`/api/organizations/${orgId}/invitations`),
      ]);
      setMembers(membersRes.data);
      setInvitations(invitesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load workspace data");
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateMember = async (memberId: string, data: { role?: MemberRole }) => {
    try {
      const res = await api.patch(`/api/organizations/${orgId}/members/${memberId}`, data);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? res.data : m)));
      toast.success("Member updated");
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update member");
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await api.delete(`/api/organizations/${orgId}/members/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to remove member");
      throw err;
    }
  };

  const inviteMember = async (email: string, role: MemberRole) => {
    try {
      const res = await api.post(`/api/organizations/${orgId}/invitations`, { email, role });
      setInvitations((prev) => [res.data, ...prev]);
      toast.success(`Invitation sent to ${email}`);
      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send invitation");
      throw err;
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/api/organizations/${orgId}/invitations/${invitationId}`);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      toast.success("Invitation revoked");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to revoke invitation");
      throw err;
    }
  };

  return {
    members,
    invitations,
    isLoading,
    error,
    updateMember,
    removeMember,
    inviteMember,
    revokeInvitation,
    refresh: fetchData,
  };
}
