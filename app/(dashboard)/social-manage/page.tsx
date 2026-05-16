"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Shield, 
  Mail, 
  UserMinus, 
  Power,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMe from "@/hooks/useMe";
import { RotatingLines } from "react-loader-spinner";
import { cn } from "@/lib/utils";
import useOrgMembers from "@/hooks/useOrgMembers";
import { InviteMemberModal } from "@/components/modals/invite-member-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

interface Member {
  id: string;
  role: MemberRole;
  status: "active" | "disabled";
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string;
  expiresAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    role: "OWNER",
    status: "active",
    user: { id: "u1", name: "Pascal Niri", email: "pascal@example.com", image: null },
    joinedAt: "2024-01-10T10:00:00Z"
  },
  {
    id: "2",
    role: "ADMIN",
    status: "active",
    user: { id: "u2", name: "Sarah Chen", email: "sarah@example.com", image: null },
    joinedAt: "2024-02-15T14:30:00Z"
  },
  {
    id: "3",
    role: "MEMBER",
    status: "active",
    user: { id: "u3", name: "Marcus Wright", email: "marcus@example.com", image: null },
    joinedAt: "2024-03-01T09:15:00Z"
  },
  {
    id: "4",
    role: "VIEWER",
    status: "disabled",
    user: { id: "u4", name: "Elena Rodriguez", email: "elena@example.com", image: null },
    joinedAt: "2024-03-12T16:45:00Z"
  }
];

const MOCK_INVITES: Invitation[] = [
  {
    id: "i1",
    email: "newhire@example.com",
    role: "MEMBER",
    createdAt: "2024-05-10T10:00:00Z",
    expiresAt: "2024-05-17T10:00:00Z"
  }
];

// ─── Components ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: MemberRole }) {
  const cfg = {
    OWNER:  { label: "Owner",  cls: "bg-black text-white", icon: ShieldCheck },
    ADMIN:  { label: "Admin",  cls: "bg-neutral-800 text-white", icon: Shield },
    MEMBER: { label: "Member", cls: "bg-neutral-100 text-neutral-800", icon: Users },
    VIEWER: { label: "Viewer", cls: "bg-neutral-100 text-neutral-500", icon: Clock },
  }[role];

  return (
    <Badge className={cn("text-[10px] gap-1 px-1.5 h-5 font-bold uppercase tracking-wider", cfg.cls)}>
      <cfg.icon size={10} />
      {cfg.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: "active" | "disabled" }) {
  return (
    <Badge variant="outline" className={cn(
      "text-[10px] font-bold uppercase tracking-wider h-5",
      status === "active" ? "text-green-600 border-green-200 bg-green-50/50" : "text-neutral-400 border-neutral-200 bg-neutral-50"
    )}>
      {status}
    </Badge>
  );
}

export default function SocialManagePage() {
  const { activeOrganization, isLoading: userLoading } = useMe();
  const { 
    members, 
    invitations, 
    isLoading: dataLoading, 
    updateMember, 
    removeMember, 
    inviteMember, 
    revokeInvitation 
  } = useOrgMembers(activeOrganization?.id);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const filteredInvites = useMemo(() => {
    return invitations.filter(i => 
      i.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [invitations, search]);

  if (userLoading || dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <RotatingLines visible height="24" width="24" color="grey" strokeWidth="4" animationDuration="0.75" />
        <p className="text-[11px] text-[#A3A3A3]">Loading workspace data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-end justify-between border-b border-black/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#737373] mb-1">
              <Users size={14} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Workspace Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Social Manage
            </h1>
            <p className="text-[13px] text-[#737373]">
              Manage members, roles and access for <span className="font-bold text-black">{activeOrganization?.name}</span>
            </p>
          </div>
          <Button 
            className="h-9 gap-2 text-[12px] font-bold"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus size={14} />
            Invite Member
          </Button>
        </div>

        <Tabs defaultValue="members" className="space-y-6" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-black/4 p-1 h-9">
              <TabsTrigger value="members" className="text-[12px] px-4 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="invitations" className="text-[12px] px-4 h-7 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Invitations ({invitations.length})
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={14} />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9 h-9 w-[280px] text-[12px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="members" className="m-0">
            <div className="rounded-xl border border-black/8 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/5 h-10">
                    <th className="pl-6 text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[40%]">Member</th>
                    <th className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[20%]">Role</th>
                    <th className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[15%]">Status</th>
                    <th className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[15%]">Joined</th>
                    <th className="pr-6 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/4">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg ring-1 ring-black/5 shadow-sm">
                            <AvatarImage src={member.user.image || ""} />
                            <AvatarFallback className="bg-black text-white text-[10px] font-bold">
                              {member.user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[#1A1A1A] truncate">{member.user.name || "Unnamed User"}</p>
                            <p className="text-[11px] text-[#A3A3A3] truncate">{member.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="py-4">
                        <StatusBadge status="active" />
                      </td>
                      <td className="py-4">
                        <p className="text-[12px] text-[#737373]">
                          {new Date(member.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </td>
                      <td className="pr-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger >
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#A3A3A3] hover:text-black">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              className="text-[12px] gap-2"
                              onClick={() => {
                                const roles: MemberRole[] = ["ADMIN", "MEMBER", "VIEWER"];
                                const nextRole = roles[(roles.indexOf(member.role) + 1) % roles.length];
                                updateMember(member.id, { role: nextRole });
                              }}
                            >
                              <Shield size={14} />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-[12px] gap-2 opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Power size={14} />
                              Status Toggle (Syncing...)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-[12px] gap-2 text-red-600 focus:text-red-600"
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${member.user.name || member.user.email} from the workspace?`)) {
                                  removeMember(member.id);
                                }
                              }}
                            >
                              <UserMinus size={14} />
                              Remove from Workspace
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <Search size={32} />
                          <p className="text-[13px] font-medium">No members found matching "{search}"</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="m-0">
            <div className="rounded-xl border border-black/8 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/[0.02] border-b border-black/5 h-10">
                    <th className="pl-6 text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[40%]">Email Address</th>
                    <th className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[20%]">Role</th>
                    <th className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[20%]">Sent At</th>
                    <th className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider w-[15%]">Expires</th>
                    <th className="pr-6 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/4">
                  {filteredInvites.map((invite) => (
                    <tr key={invite.id} className="group hover:bg-black/[0.01] transition-colors">
                      <td className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-black/4 flex items-center justify-center text-[#737373]">
                            <Mail size={14} />
                          </div>
                          <span className="text-[13px] font-bold text-[#1A1A1A]">{invite.email}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <RoleBadge role={invite.role} />
                      </td>
                      <td className="py-4">
                        <p className="text-[12px] text-[#737373]">
                          {new Date(invite.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 text-[10px] font-bold uppercase tracking-wider px-1.5 h-5">
                          {Math.max(0, Math.ceil((new Date(invite.expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                        </Badge>
                      </td>
                      <td className="pr-6 py-4 text-right">
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[11px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => revokeInvitation(invite.id)}
                          >
                           Revoke
                         </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredInvites.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <Mail size={32} />
                          <p className="text-[13px] font-medium">No pending invitations</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={inviteMember}
        />
      </div>
    </div>
  );
}
