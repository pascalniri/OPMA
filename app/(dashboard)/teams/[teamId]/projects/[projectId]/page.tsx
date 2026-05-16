"use client";

import { useParams } from "next/navigation";
import { RotatingLines } from "react-loader-spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectOverview } from "@/components/project/project-overview";
import { ProjectMilestones } from "@/components/project/project-milestones";
import { ProjectActivities } from "@/components/project/project-activities";
import { ProjectTeam } from "@/components/project/project-team";
import useProject from "@/hooks/useProject";
import useMilestones from "@/hooks/useMilestones";
import useTeamMembers from "@/hooks/useTeamMembers";

export default function ProjectPage() {
  const { projectId } = useParams<{ teamId: string; projectId: string }>();

  const {
    project,
    isLoading: projectLoading,
    update: updateProject,
  } = useProject(projectId);
  const { milestones } = useMilestones(projectId);
  const {
    members,
    isLoading: membersLoading,
    addMember,
    removeMember,
    changeRole,
  } = useTeamMembers(projectId, project?.team.id);

  if (projectLoading || !project) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-full bg-[#FAFAFA]">
        <RotatingLines
          visible
          height="30"
          width="30"
          color="grey"
          strokeWidth="4"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
        />
        <p className="font-bold text-[12px] text-black">Loading project…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <ProjectHeader
        project={project}
        team={project.team}
        members={members}
        onProjectUpdate={(patch) => updateProject(patch).then(() => {})}
      />

      <Tabs
        defaultValue="overview"
        className="flex-1 flex flex-col overflow-hidden min-h-0 gap-0!"
      >
        <div className="shrink-0 bg-white border-b border-black/6 px-6">
          <TabsList variant="line" className="gap-2 h-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="overflow-auto p-6 w-full">
          <ProjectOverview
            project={project}
            milestones={milestones}
            members={members}
          />
        </TabsContent>

        <TabsContent value="milestones" className="overflow-auto p-6 w-full">
          <ProjectMilestones projectId={projectId} />
        </TabsContent>

        <TabsContent value="activities" className="overflow-auto p-6">
          <ProjectActivities
            projectId={projectId}
            members={members}
            milestones={milestones}
          />
        </TabsContent>

        <TabsContent value="team" className="overflow-auto p-6">
          <ProjectTeam
            members={members}
            isLoading={membersLoading}
            teamId={project.team.id}
            organizationId={project.organizationId}
            onRoleChange={changeRole}
            onRemove={removeMember}
            onAdd={addMember}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
