"use client";

import { Header } from "@/components/layout/header";
import {
  Plus,
  Users,
  Calendar,
  Building,
  Eye,
  MoreHorizontal,
  PlusCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_PROJECTS,
  NOTIFICATIONS,
  ACTIVITIES,
  TEAM_MEMBERS,
} from "@/lib/data";
import useMe from "@/hooks/useMe";

const QUICK_ACTIONS = [
  {
    label: "Create Project",
    sub: "Create a project for your tasks",
    icon: PlusCircle,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    label: "Create Task",
    sub: "Create task for your project",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Invite to Team",
    sub: "Invite people to your team",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    label: "Schedule Meeting",
    sub: "Schedule a meeting for project",
    icon: Calendar,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    label: "Create a Company",
    sub: "Create your new company",
    icon: Building,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

export default function DashboardPage() {
  const currentUserId = "tm3";
  const myTasks = ACTIVITIES.filter(
    (a) => a.assigneeId === currentUserId,
  ).slice(0, 5);
  const recentProjects = ALL_PROJECTS.slice(0, 6);
  const collaborators = TEAM_MEMBERS.slice(0, 6);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#ffffff]">
      <Header title="Dashboard" onSearch={() => {}} />

      <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-3 p-4 bg-white border border-black/10 rounded hover:border-black/15 cursor-pointer transition-all text-left group"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  action.bg,
                )}
              >
                <action.icon size={14} className={cn("", action.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-foreground truncate">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {action.sub}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Assigned Tasks */}
            <div className="bg-white border border-black/10 rounded overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-foreground">
                  Assigned Tasks
                </h3>
              </div>
              <div className="divide-y divide-black/5">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-6 py-5 flex items-center justify-between group hover:bg-black/[0.005] transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-foreground leading-tight">
                        {task.milestoneName} — {task.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          Panze Portfolio Project
                        </span>
                        <span className="w-1 h-1 rounded-full bg-black/10" />
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar size={10} /> Due in{" "}
                          {Math.floor(Math.random() * 48)} hours
                        </span>
                      </div>
                    </div>
                    <button className="w-7 h-7 cursor-pointer rounded border border-black/5 flex items-center justify-center text-muted-foreground hover:bg-black/5 transition-all">
                      <Eye size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-black/10 rounded overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-foreground">
                  Recent Activity
                </h3>
                <div className="flex items-center gap-3">
                  <button className="text-[11px] font-bold text-blue-600 hover:underline">
                    View All
                  </button>
                  <button className="p-1.5 hover:bg-black/5 rounded-md text-muted-foreground">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {NOTIFICATIONS.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold text-foreground">
                          Wow Rakibul{" "}
                          <span className="text-[11px] font-normal text-muted-foreground ml-2">
                            3:15 PM
                          </span>
                        </p>
                      </div>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">
                        I just finished organizing the team outing and sent
                        invites to everyone for their thoughts.
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 border border-blue-100 rounded-lg cursor-pointer">
                          <FileText size={12} className="text-blue-500" />
                          <span className="text-[11px] font-medium text-blue-600">
                            portfolio.pdf
                          </span>
                          <span className="text-[10px] text-blue-400">
                            25kb
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 px-2 py-1 bg-black/[0.02] border border-black/5 rounded-md text-[10px] text-muted-foreground">
                          <span>🔥</span> 19
                        </button>
                        <button className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-100 rounded-md text-[10px] text-green-600 font-bold">
                          <span>✅</span> 8
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Projects */}
            <div className="bg-white border border-black/10 rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-bold text-foreground">
                  Projects
                </h3>
                <button className="p-1.5 hover:bg-black/5 rounded-md text-muted-foreground">
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 border border-black/10 rounded hover:border-black/20 transition-all cursor-pointer space-y-3"
                  >
                    <div className="w-10 h-10 rounded bg-black/[0.02] flex items-center justify-center">
                      <Building size={18} className="text-foreground" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-foreground leading-tight truncate">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {Math.floor(Math.random() * 5)} task due soon
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* People */}
            <div className="bg-white border border-black/10 rounded p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-bold text-foreground">
                  People{" "}
                  <span className="text-muted-foreground font-normal ml-1">
                    ({TEAM_MEMBERS.length})
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  <select className="text-[11px] bg-transparent font-medium text-muted-foreground outline-none cursor-pointer">
                    <option>Frequent Collaborators</option>
                  </select>
                  <button className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm shadow-blue-200">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {collaborators.map((person) => (
                  <div
                    key={person.id}
                    className="p-4 border border-black/10 rounded text-center space-y-3 hover:bg-black/[0.01] transition-all"
                  >
                    <div className="relative inline-block">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xs font-bold text-white",
                          person.avatarColor || "bg-primary",
                        )}
                      >
                        {person.initials}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-foreground truncate">
                        {person.name}
                      </h4>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {person.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
