"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Plus,
  ArrowUpCircle,
  MoreHorizontal,
} from "lucide-react";
import { ACTIVITIES, type Activity, type ActivityStatus } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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



export function ActivityBoard() {
  const router = useRouter();
  const [activities, setActivities] = useState(ACTIVITIES);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeCol, setActiveCol] = useState<ActivityStatus | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("activityId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, colId: ActivityStatus) => {
    e.preventDefault();
    setActiveCol(colId);
  };

  const onDragLeave = () => {
    setActiveCol(null);
  };

  const onDrop = (e: React.DragEvent, colId: ActivityStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("activityId");
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: colId } : a)),
    );
    setDraggedId(null);
    setActiveCol(null);
  };

  return (
    <>
      <div className="flex gap-5 h-full p-8 overflow-x-auto select-none no-scrollbar">
        {COLS.map((col) => {
          const cards = activities.filter((a) => a.status === col.id);
          const isOver = activeCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => onDragOver(e, col.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, col.id)}
              className={cn(
                "shrink-0 w-[300px] flex flex-col rounded-lg transition-all duration-200 bg-[#1B1B1A]/50 border border-white/10",
                isOver ? "bg-white/10 border-white/20 ring-1 ring-white/10" : "",
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: col.dot,
                      boxShadow: isOver ? `0 0 8px ${col.dot}` : "none",
                    }}
                  />
                  <div>
                    <span className="text-[13px] font-bold text-white/90 tracking-tight">
                      {col.label}
                    </span>
                    <span className="block text-[9px] text-white/25 font-medium uppercase tracking-wider mt-0.5">
                      {col.sub}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[8px] font-bold tabular-nums text-white/30 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    {cards.length}
                  </span>
                  <button className="text-white/20 hover:text-white/50 transition-colors p-1 rounded-md hover:bg-white/5">
                    <Plus size={10} />
                  </button>
                </div>
              </div>

              {/* Cards Area */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-3 space-y-3 transition-colors",
                  isOver ? "bg-white/5" : "",
                )}
              >
                {cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/[0.03] rounded-lg">
                    <span className="text-[8px] font-medium text-white/15 uppercase tracking-widest">
                      Drop Here
                    </span>
                  </div>
                ) : (
                  cards.map((a) => (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, a.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className={cn(
                        "rounded-md p-4 group relative transition-all duration-200 cursor-grab active:cursor-grabbing bg-[#1B1B1A] border border-white/10 hover:border-white/10 hover:bg-[#252523]",
                        draggedId === a.id ? "opacity-40 scale-[0.98] grayscale" : "",
                      )}
                    >
                     

                      <h4 className="text-[13px] font-semibold mb-3 leading-snug text-white/90 group-hover:text-white transition-colors">
                        {a.title}
                      </h4>

                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm"
                          style={{
                            color: priBadge[a.priority],
                            background: `${priBadge[a.priority]}15`,
                            border: `1px solid ${priBadge[a.priority]}25`,
                          }}
                        >
                          {a.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/50">
                          <CalendarDays size={10} />
                          <span className="text-[8px] font-medium tabular-nums">
                            {a.dueDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {a.status === "in-progress" && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/activities/${a.id}`);
                              }}
                              className="h-7 px-2 flex items-center gap-1.5 text-[10px] font-bold rounded-lg transition-all bg-white text-black hover:bg-white/90 shadow-lg shadow-white/5"
                            >
                              Manage
                            </Button>
                          )}
                          <div
                            className="w-7 h-7 bg-white text-[#1b1b1a] rounded-full flex items-center justify-center text-[10px] font-bold"
                          >
                            {a.assignee.initials}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
