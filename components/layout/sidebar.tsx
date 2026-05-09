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
} from "lucide-react";
import { cn, getGradientFromName } from "@/lib/utils";
import useMe from "@/hooks/useMe";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateTeamModal } from "@/components/modals/create-team-modal";
import { useState, useRef, useEffect } from "react";

const NAV = [
  { href: "/dashboard", label: "Project Pulse", icon: LayoutDashboard },
];

const TEAM_NAV = [
  { href: "/milestones", label: "Milestones", icon: Target },
  { href: "/vault", label: "Vault", icon: Database },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/members", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
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
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleTeam = (teamId: string) => {
    setExpandedTeamId(prev => (prev === teamId ? null : teamId));
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="flex flex-col h-full w-[250px] shrink-0 bg-[#252523] border-r border-white/10 relative">
      {/* Active Organization Header */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="cursor-pointer flex items-center gap-2.5 px-4 h-[49px] w-full border-b border-white/10 hover:bg-white/5 transition-all group"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-[10px] shadow-lg shadow-black/20"
            style={{
              background: getGradientFromName(activeOrganization?.name || ""),
            }}
          ></div>
          <span className="text-xs font-semibold text-white/90 truncate flex-1 text-left">
            {activeOrganization?.name || "Select Workspace"}
          </span>
          <ChevronsUpDown
            size={14}
            className=" text-white/20 group-hover:text-white/40"
          />
        </button>

        {/* Switcher Dropdown */}
        {isDropdownOpen && (
          <div className="absolute left-2 right-2 top-14 bg-[#1B1B1A] border border-white/10 rounded-md shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 mb-1">
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider px-2">
                Workspaces
              </p>
            </div>
            <div className="max-h-[200px] flex flex-col gap-1 px-1">
              {memberships.map((m) => {
                const isActive = m.organization.id === activeOrganization?.id;
                return (
                  <button
                    key={m.organization.id}
                    onClick={() => {
                      if (!isActive) switchOrganization(m.organization.id);
                      setIsDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded text-xs transition-all text-left",
                      isActive
                        ? "text-white bg-white/5"
                        : "text-white/40 hover:text-white hover:bg-white/5",
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                      style={{
                        background: getGradientFromName(m.organization.name),
                      }}
                    ></div>
                    <span className="truncate flex-1">
                      {m.organization.name}
                    </span>
                    {isActive && <Check className="w-3 h-3 text-white/40" />}
                  </button>
                );
              })}
            </div>
            <div className="h-px bg-white/5 my-1" />
            <div className="px-1">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-white/40 hover:text-white hover:bg-white/5 text-left"
              >
                <div className="w-4 h-4 rounded-sm border border-dashed border-white/20 flex items-center justify-center shrink-0">
                  <Plus className="w-2.5 h-2.5" />
                </div>
                <span>Create Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 custom-scrollbar">
        {/* Global Links */}
        <div className="space-y-0.5 mb-6">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 h-8 rounded text-[11px] transition-all group font-medium",
                  isActive
                    ? "text-white/90 bg-white/7"
                    : "text-white/40 hover:text-white/75 hover:bg-white/5",
                )}
              >
                <item.icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isActive ? "text-white/80" : "text-white/30",
                  )}
                  strokeWidth={1.5}
                />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Teams Section */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between px-2.5 mb-3 group">
              <h3 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em]">
                Your Teams
              </h3>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/5 rounded transition-all"
              >
                <Plus size={10} className="text-white/40" />
              </button>
            </div>

            <div className="space-y-6">
              {teams.length === 0 ? (
                <div className="px-1">
                  <button
                    onClick={() => setIsTeamModalOpen(true)}
                    className="w-full flex flex-col items-center justify-center py-4 px-2 rounded border border-dashed border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                  >
                    <Plus className="w-4 h-4 text-white/10 group-hover:text-white/20 mb-1.5" />
                    <span className="text-[10px] text-white/20 font-medium group-hover:text-white/40 text-center px-4">
                      Create your first team to get started
                    </span>
                  </button>
                </div>
              ) : (
                teams.map((team) => (
                  <div key={team.id} className="space-y-1">
                    {/* Team Header */}
                    <div 
                      className="flex items-center gap-2 px-2.5 h-7 mb-1 group/team cursor-pointer"
                      onClick={() => toggleTeam(team.id)}
                    >
                      <ChevronRight 
                        size={12} 
                        className={cn(
                          "text-white/20 transition-transform duration-200",
                          expandedTeamId === team.id && "rotate-90"
                        )} 
                      />
                      <span className="text-[11px] font-semibold text-white/60 group-hover/team:text-white/90 transition-colors truncate">
                        {team.name}
                      </span>
                    </div>

                    {expandedTeamId === team.id && (
                      <div className="space-y-4">
                        {/* Team Scoped Views */}
                        <div className="space-y-0.5 ml-1">
                      {TEAM_NAV.map((item) => {
                        const href = `/teams/${team.id}${item.href}`;
                        const isActive = pathname.startsWith(href);
                        return (
                          <Link
                            key={item.label}
                            href={href}
                            className={cn(
                              "flex items-center gap-2.5 px-6 h-7 rounded text-[10px] transition-all font-medium",
                              isActive
                                ? "text-white/90 bg-white/5"
                                : "text-white/25 hover:text-white/60 hover:bg-white/5",
                            )}
                          >
                            <item.icon
                              className="w-3 h-3 opacity-50"
                              strokeWidth={2}
                            />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Team Projects Section */}
                    <div className="mt-2 ml-[21px] space-y-1">
                      <div className="px-2 py-1 text-[9px] font-bold text-white/10 uppercase tracking-wider">
                        Projects
                      </div>
                      <div className="border-l border-white/5 space-y-0.5">
                        {team.projects.length === 0 ? (
                          <div className="pl-3 py-1 text-[9px] text-white/5 italic">
                            No projects
                          </div>
                        ) : (
                          team.projects.map((project) => (
                            <Link
                              key={project.id}
                              href={`/teams/${team.id}/projects/${project.id}`}
                              className={cn(
                                "flex items-center gap-2 pl-3 pr-2 h-7 rounded-r text-[10px] transition-all border-l border-transparent",
                                pathname.includes(project.id)
                                  ? "text-white/90 bg-white/5 border-white/20 -ml-[1px]"
                                  : "text-white/25 hover:text-white/60 hover:bg-white/5 hover:border-white/10",
                              )}
                            >
                              <span className="truncate">{project.name}</span>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
            </div>
          </div>
        </div>
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

      {/* User Section */}
      <div className="flex items-center justify-between px-4 h-[48px] shrink-0 border-t border-white/10 mt-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-7 h-7 rounded-full border border-white/10 shrink-0 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0 uppercase">
              {user?.name?.[0] || user?.email?.[0] || "?"}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-medium text-white/90 leading-none mb-1 truncate">
              {user?.name || "User"}
            </span>
            <span className="text-[9px] text-white/30 leading-none truncate">
              {user?.email}
            </span>
          </div>
        </div>
        <button
          onClick={() => logout()}
          title="Logout"
          className="p-1.5 hover:bg-white/5 rounded text-white/20 hover:text-white/60 transition-all shrink-0 ml-2"
        >
          <LogOut size={14} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
}
