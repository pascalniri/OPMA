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
      dot: "#D4D4D4",
    },
    { id: "in-progress", label: "In Progress", sub: "Active", dot: "#3B82F6" },
    {
      id: "pending-verification",
      label: "Pending Review",
      sub: "Awaiting PoW",
      dot: "#F59E0B",
    },
    {
      id: "verified",
      label: "Verified Done",
      sub: "Approved",
      dot: "#10B981",
    },
  ];

const priBadge: Record<string, string> = {
  low: "#71717A",
  medium: "#3B82F6",
  high: "#F59E0B",
  critical: "#EF4444",
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
                "shrink-0 w-[300px] flex flex-col rounded-xl transition-all duration-200 bg-black/2 border border-black/[0.04]",
                isOver ? "bg-black/4 border-black/[0.08]" : "",
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: col.dot,
                    }}
                  />
                  <div>
                    <span className="text-[13px] font-bold text-[#1A1A1A] tracking-tight">
                      {col.label}
                    </span>
                    <span className="block text-[9px] text-[#A3A3A3] font-bold uppercase tracking-wider mt-0.5">
                      {col.sub}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold tabular-nums text-[#737373] px-2 py-0.5 rounded-md bg-white border border-black/[0.04] shadow-sm">
                    {cards.length}
                  </span>
                  <button className="text-[#A3A3A3] hover:text-[#1A1A1A] transition-colors p-1 rounded-md hover:bg-black/4">
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Cards Area */}
              <div
                className={cn(
                  "flex-1 overflow-y-auto p-3 space-y-3 transition-colors",
                  isOver ? "bg-black/[0.01]" : "",
                )}
              >
                {cards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-black/[0.02] rounded-xl">
                    <span className="text-[10px] font-bold text-[#D4D4D4] uppercase tracking-widest">
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
                        "rounded-xl p-4 group relative transition-all duration-200 cursor-grab active:cursor-grabbing bg-white border border-black/[0.04] hover:border-black/[0.08] hover:shadow-md shadow-sm",
                        draggedId === a.id
                          ? "opacity-40 scale-[0.98] grayscale"
                          : "",
                      )}
                    >
                      <h4 className="text-[13px] font-bold mb-3 leading-snug text-[#1A1A1A]">
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

                      <div className="flex items-center justify-between pt-3.5 border-t border-black/[0.04]">
                        <div className="flex items-center gap-2 text-[#A3A3A3]">
                          <CalendarDays size={10} />
                          <span className="text-[8px] font-bold tabular-nums">
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
                              className="h-7 px-2 flex items-center gap-1.5 text-[10px] font-bold rounded-lg transition-all bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 shadow-sm"
                            >
                              Manage
                            </Button>
                          )}
                          <div className="w-7 h-7 bg-black/4 text-[#1A1A1A] rounded-full flex items-center justify-center text-[10px] font-bold border border-black/[0.05]">
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
