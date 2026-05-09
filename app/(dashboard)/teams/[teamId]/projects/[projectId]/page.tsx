"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Target, Clock, MessageSquare } from "lucide-react";
import useMe from "@/hooks/useMe";

export default function ProjectPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const projectId = params.projectId as string;
  const { teams } = useMe();

  const team = teams.find(t => t.id === teamId);
  const project = team?.projects.find(p => p.id === projectId);

  return (
    <div className="flex flex-col h-full bg-[#252523]">
      <Header
        title={project?.name || "Project Details"}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "tasks", label: "Tasks" },
          { id: "updates", label: "Updates" },
        ]}
        activeTab="overview"
        onTabChange={() => { } }
        action={<Button>
          <Plus size={12} />
          New Update
        </Button>} onSearch={function (): void {
          throw new Error("Function not implemented.");
        } }      />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  {team?.identifier || "TEAM"}
                </div>
                <h1 className="text-2xl font-semibold text-white/90">
                  {project?.name || "Loading Project..."}
                </h1>
              </div>
              <p className="text-sm text-white/40 max-w-xl">
                Comprehensive tracking and management for {project?.name}. 
                View milestones, tasks, and team activity in one place.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#252523] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/20">
                    ?
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="text-white/40 hover:text-white">
                Share
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Status", value: project?.status || "Active", icon: LayoutDashboard },
              { label: "Progress", value: `${project?.progress || 0}%`, icon: Target },
              { label: "Timeline", value: "Q2 2024", icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg bg-[#1B1B1A] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-white/30">
                  <stat.icon size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="text-lg font-semibold text-white/90">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Activity Placeholder */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/20 uppercase tracking-[0.2em]">Recent Activity</h3>
            <div className="rounded-lg border border-white/5 divide-y divide-white/5 bg-[#1B1B1A]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 flex items-center justify-center">
                    <MessageSquare size={14} className="text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-white/60">
                      <span className="font-bold text-white/90">System Update</span> • No updates recorded yet.
                    </div>
                    <div className="text-[10px] text-white/20">Just now</div>
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
