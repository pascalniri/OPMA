"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutDashboard,
  Target,
  Clock,
  MessageSquare,
} from "lucide-react";
import useMe from "@/hooks/useMe";

export default function ProjectPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const projectId = params.projectId as string;
  const { teams } = useMe();

  const team = teams.find((t) => t.id === teamId);
  const project = team?.projects.find((p) => p.id === projectId);

  return (
    <div className="flex flex-col h-full bg-background">
      <Header
        title={project?.name || "Project Details"}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "tasks", label: "Tasks" },
          { id: "updates", label: "Updates" },
        ]}
        activeTab="overview"
        onTabChange={() => {}}
        action={
          <Button>
            <Plus size={12} />
            New Update
          </Button>
        }
        onSearch={() => {}}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-2 py-0.5 rounded bg-black/4 border border-black/[0.05] text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                  {team?.identifier || "TEAM"}
                </div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">
                  {project?.name || "Loading Project..."}
                </h1>
              </div>
              <p className="text-xs text-[#737373] max-w-xl">
                Comprehensive tracking and management for {project?.name}. View
                milestones, tasks, and team activity in one place.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-black/4 flex items-center justify-center text-[10px] font-bold text-[#A3A3A3]"
                  >
                    ?
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="text-[#737373] hover:text-[#1A1A1A]"
              >
                Share
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Status",
                value: project?.status || "Active",
                icon: LayoutDashboard,
              },
              {
                label: "Progress",
                value: `${project?.progress || 0}%`,
                icon: Target,
              },
              { label: "Timeline", value: "Q2 2024", icon: Clock },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-white border border-black/[0.04] shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2 text-[#A3A3A3]">
                  <stat.icon size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div className="text-lg font-bold text-[#1A1A1A]">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Placeholder */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-[0.2em]">
              Recent Activity
            </h3>
            <div className="rounded-xl border border-black/[0.04] divide-y divide-black/[0.04] bg-white shadow-sm overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-black/2 shrink-0 flex items-center justify-center">
                    <MessageSquare size={14} className="text-[#A3A3A3]" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-[#737373]">
                      <span className="font-bold text-[#1A1A1A]">
                        System Update
                      </span>{" "}
                      • No updates recorded yet.
                    </div>
                    <div className="text-[10px] text-[#A3A3A3]">Just now</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
