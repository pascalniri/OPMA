"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { IssuesView } from "@/components/issues/issues-view";
import useMe from "@/hooks/useMe";
import { RotatingLines } from 'react-loader-spinner'

export default function TeamIssuesPage() {
  const { teamId } = useParams();
  const { teams } = useMe();

  const currentTeam = useMemo(() => {
    return teams.find((t) => t.id === teamId);
  }, [teams, teamId]);

  if (!currentTeam) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center h-full bg-[#FAFAFA]">
        <RotatingLines
          visible={true}
          height="30"
          width="30"
          color="grey"
          strokeWidth="4"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
        <p className="font-bold text-[12px] text-black">
          Synchronizing Team Context
        </p>
      </div>
    );
  }

  return (
    <IssuesView
      title={`${currentTeam.name} — Issues`}
      description={`Strategic oversight of all technical requirements for the ${currentTeam.name} workspace.`}
    />
  );
}
