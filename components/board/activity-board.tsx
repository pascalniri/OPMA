"use client";

import { useState } from "react";
import {
  CalendarDays,
  Plus,
  ArrowUpCircle,
  MoreHorizontal,
} from "lucide-react";
import { PowModal } from "@/components/modals/pow-modal";
import { ACTIVITIES, type Activity, type ActivityStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

const COLS: { id: ActivityStatus; label: string; sub: string; dot: string }[] =
  [
    {
      id: "todo",
      label: "To Do",
      sub: "Queued",
      dot: "rgba(255,255,255,0.25)",
    },
    { id: "in-progress", label: "In Progress", sub: "Active", dot: "#ffffff" },
    {
      id: "pending-verification",
      label: "Pending Review",
      sub: "Awaiting PoW",
      dot: "#ffffff",
    },
    {
      id: "verified",
      label: "Verified Done",
      sub: "Approved",
      dot: "#ffffff",
    },
  ];

const priBadge: Record<string, string> = {
  low: "rgba(255,255,255,0.20)",
  medium: "#ffffff",
  high: "#ffffff",
  critical: "#ef4444",
};

function Card({ a, onPoW }: { a: Activity; onPoW: (a: Activity) => void }) {
  return (
    <div className="rounded-lg p-3.5 group transition-colors cursor-default bg-[#1B1B1A] border border-white/[0.07] hover:border-white/[0.13]">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-[#ffffff] bg-[#ffffff]/12">
          {a.milestoneName}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-[12.5px] font-medium mb-2.5 leading-snug text-white/78">
        {a.title}
      </p>
      <div className="flex items-center gap-1.5 mb-3">
        <span
          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded"
          style={{
            color: priBadge[a.priority],
            background: `${priBadge[a.priority]}18`,
          }}
        >
          {a.priority}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-white/28">
          <CalendarDays className="w-3 h-3" />
          <span className="text-[10px]">{a.dueDate}</span>
        </div>
        <div className="flex items-center gap-2">
          {a.status === "in-progress" && (
            <button
              onClick={() => onPoW(a)}
              className="flex items-center gap-1 text-[10px] font-semibold transition-colors hover:opacity-80 text-[#ffffff]"
            >
              <ArrowUpCircle className="w-3 h-3" />
              PoW
            </button>
          )}
          <div
            className={`w-6 h-6 rounded-full ${a.assignee.avatarColor} flex items-center justify-center text-[9px] font-bold text-white`}
          >
            {a.assignee.initials}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityBoard() {
  const [powActivity, setPowActivity] = useState<Activity | null>(null);
  return (
    <>
      <div className="flex gap-4 h-full p-6 overflow-x-auto">
        {COLS.map((col) => {
          const cards = ACTIVITIES.filter((a) => a.status === col.id);
          return (
            <div
              key={col.id}
              className="shrink-0 w-[280px] flex flex-col rounded-lg overflow-hidden bg-[#252523] border border-white/[0.07]"
            >
              <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: col.dot }}
                  />
                  <div>
                    <span className="text-[12.5px] font-semibold text-white/75">
                      {col.label}
                    </span>
                    <span className="block text-[10px] text-white/30">
                      {col.sub}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded text-white/40 bg-white/6">
                    {cards.length}
                  </span>
                  <button className="text-white/28">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-black/15">
                {cards.length === 0 ? (
                  <div className="text-center py-10 text-xs text-white/20">
                    Empty
                  </div>
                ) : (
                  cards.map((a) => (
                    <Card key={a.id} a={a} onPoW={setPowActivity} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <PowModal
        activity={powActivity}
        open={!!powActivity}
        onClose={() => setPowActivity(null)}
      />
    </>
  );
}
