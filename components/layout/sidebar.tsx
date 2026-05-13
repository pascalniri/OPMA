"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Database,
  BarChart3,
  Users,
  Settings,
  Hexagon,
  ChevronsUpDown,
  Check,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Zap,
  Globe,
  LogOut,
  ChevronRight,
  Bell,
  UserCheck,
  CheckSquare,
  Folder,
  Calendar,
  Building2,
  Home,
  LayoutGrid,
  PanelLeftClose,
} from "lucide-react";
import { cn, getGradientFromName } from "@/lib/utils";
import useMe from "@/hooks/useMe";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateTeamModal } from "@/components/modals/create-team-modal";
import { useState, useRef, useEffect } from "react";

const NAV = [
  { href: "/search", label: "Search...", icon: Search },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assigned", label: "Assigned to me", icon: UserCheck },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/companies", label: "Companies", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    user,
    memberships,
    activeOrganization,
    teams,
    switchOrganization,
    logout,
  } = useMe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(true);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const orgSwitcherRef = useRef<HTMLDivElement>(null);

  const toggleTeam = (teamId: string) => {
    setExpandedTeamId((prev) => (prev === teamId ? null : teamId));
  };

  useEffect(() => {
    if (teams.length > 0 && !isInitialized) {
      setExpandedTeamId(teams[0].id);
      setIsInitialized(true);
    }
  }, [teams, isInitialized]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        orgSwitcherRef.current &&
        !orgSwitcherRef.current.contains(event.target as Node)
      ) {
        setIsOrgSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="flex flex-col h-full w-[250px] shrink-0 bg-sidebar border-r border-black/[0.04] relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[49px] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs italic">
            t.
          </div>
          <span className="text-xs font-bold text-sidebar-foreground tracking-tight">
            trior
          </span>
        </div>
        <button className="text-[#A1A1A1] hover:text-sidebar-foreground transition-colors">
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto pt-2 pb-4 px-2 custom-scrollbar">
        {/* Global Links */}
        <div className="space-y-0.5 mb-8">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded text-xs transition-all group font-medium",
                  isActive
                    ? "text-sidebar-foreground bg-white border border-black/10"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-black/2",
                )}
              >
                <item.icon
                  size={14}
                  className={cn(
                    " shrink-0",
                    isActive
                      ? "text-sidebar-foreground"
                      : "text-[#A3A3A3] group-hover:text-sidebar-foreground",
                  )}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Spaces Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2 group">
            <h3 className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
              Spaces
            </h3>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 hover:bg-black/[0.03] rounded">
                <Search size={12} className="text-[#A3A3A3]" />
              </button>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="p-1 hover:bg-black/[0.03] rounded"
              >
                <Plus size={12} className="text-[#A3A3A3]" />
              </button>
            </div>
          </div>

          <div className="space-y-0.5">
            <Link
              href="/home"
              className="flex items-center gap-3 px-3 h-9 rounded-lg text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-black/2 transition-all font-medium"
            >
              <Home size={14} className="text-[#A3A3A3]" strokeWidth={1.5} />
              Home
            </Link>

            {/* Teams Dropdown */}
            <div className="space-y-0.5">
              <button
                onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 h-9 rounded-lg text-xs transition-all font-medium",
                  isTeamsExpanded
                    ? "text-sidebar-foreground bg-black/2"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-black/2",
                )}
              >
                <LayoutGrid
                  size={14}
                  className="text-[#A3A3A3]"
                  strokeWidth={1.5}
                />
                <span className="flex-1 text-left">Teams</span>
                <ChevronRight
                  size={14}
                  className={cn(
                    "text-[#A3A3A3] transition-transform",
                    isTeamsExpanded && "rotate-90",
                  )}
                />
              </button>

              {isTeamsExpanded && (
                <div className="ml-7 space-y-1 mt-1 border-l border-black/[0.04]">
                  {teams.length === 0 ? (
                    <div className="pl-4 py-2 text-[11px] text-[#A3A3A3] italic">
                      No teams yet
                    </div>
                  ) : (
                    teams.map((team) => (
                      <div key={team.id} className="space-y-0.5">
                        <button
                          onClick={() => toggleTeam(team.id)}
                          className="w-full flex items-center gap-2 pl-4 pr-3 h-8 text-[12px] text-muted-foreground hover:text-sidebar-foreground transition-colors font-medium text-left"
                        >
                          <ChevronRight
                            size={12}
                            className={cn(
                              "text-[#D4D4D4] transition-transform",
                              expandedTeamId === team.id && "rotate-90",
                            )}
                          />
                          <span className="truncate flex-1">{team.name}</span>
                        </button>

                        {expandedTeamId === team.id && (
                          <div className="ml-4 space-y-0.5 mb-3 mt-1">
                            {/* Issues link */}
                            <Link
                              href={`/teams/${team.id}/issues`}
                              className={cn(
                                "flex items-center gap-2 pl-4 pr-3 h-8 rounded-lg text-[12px] transition-all",
                                pathname === `/teams/${team.id}/issues` ? "text-sidebar-foreground bg-white border border-black/[0.03] font-semibold" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-black/[0.01]"
                              )}
                            >
                              <Zap size={13} className="text-[#A3A3A3]" />
                              <span>Issues</span>
                            </Link>

                            {/* Projects section */}
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 pl-4 pr-3 h-8 text-[12px] text-muted-foreground font-semibold">
                                <Folder size={13} className="text-[#A3A3A3]" />
                                <span>Projects</span>
                              </div>
                              <div className="ml-4 space-y-0.5">
                                {team.projects.map((project) => {
                                  const isActive = pathname.includes(project.id);
                                  return (
                                    <Link
                                      key={project.id}
                                      href={`/teams/${team.id}/projects/${project.id}`}
                                      className={cn(
                                        "flex items-center gap-2 pl-4 pr-3 h-8 rounded-lg text-xs transition-all",
                                        isActive
                                          ? "text-sidebar-foreground bg-white border border-black/[0.03] font-semibold shadow-sm"
                                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-black/[0.01]",
                                      )}
                                    >
                                      <div className="w-1 h-1 rounded-full bg-[#D4D4D4]" />
                                      <span className="truncate">
                                        {project.name}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Members link */}
                            <Link
                              href={`/teams/${team.id}/members`}
                              className={cn(
                                "flex items-center gap-2 pl-4 pr-3 h-8 rounded-lg text-xs transition-all",
                                pathname === `/teams/${team.id}/members` ? "text-sidebar-foreground bg-white border border-black/[0.03] font-semibold" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-black/[0.01]"
                              )}
                            >
                              <Users size={13} className="text-[#A3A3A3]" />
                              <span>Members</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              href="/social-manage"
              className="flex items-center gap-3 px-3 h-9 rounded-lg text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-black/2 transition-all font-medium"
            >
              <Target size={14} className="text-primary" strokeWidth={1.5} />
              Social Manage
            </Link>
          </div>
        </div>
      </div>

      {/* Organization Switcher */}
      <div className="px-4 pb-6 mt-auto relative" ref={orgSwitcherRef}>
        <button
          onClick={() => setIsOrgSwitcherOpen(!isOrgSwitcherOpen)}
          className="w-full bg-white rounded p-3 border border-black/10 hover:bg-black/1 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black/4 flex items-center justify-center text-sidebar-foreground font-bold text-[10px]">
              {activeOrganization?.name?.[0] || "O"}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-[12px] font-bold text-sidebar-foreground truncate">
                {activeOrganization?.name || "Select Workspace"}
              </p>
              <p className="text-[10px] text-[#737373] leading-tight truncate">
                {memberships?.length || 0} {(memberships?.length || 0) === 1 ? "workspace" : "workspaces"}
              </p>
            </div>
            <ChevronsUpDown size={14} className="text-[#A3A3A3] group-hover:text-sidebar-foreground transition-colors" />
          </div>
        </button>

        {isOrgSwitcherOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-black/10 rounded py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-3 py-2 border-b border-black/3">
              <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Switch Workspace</p>
            </div>
            <div className="max-h-[200px] overflow-y-auto py-1 custom-scrollbar">
              {memberships?.map((m: any) => (
                <button
                  key={m.organization.id}
                  onClick={() => {
                    switchOrganization(m.organization.id);
                    setIsOrgSwitcherOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-[12px] hover:bg-black/2 transition-colors",
                    activeOrganization?.id === m.organization.id ? "text-sidebar-foreground font-bold " : "text-[#737373] cursor-pointer"
                  )}
                >
                  <div className="w-6 h-6 rounded bg-black/[0.04] flex items-center justify-center text-[10px] font-bold">
                    {m.organization.name[0]}
                  </div>
                  <span className="truncate flex-1 text-left">{m.organization.name}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-black/[0.03] p-1">
               <button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsOrgSwitcherOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-[#737373] hover:text-sidebar-foreground hover:bg-black/[0.02] rounded-lg transition-colors"
               >
                 <Plus size={14} />
                 Create Workspace
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <CreateTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </aside>
  );
}
