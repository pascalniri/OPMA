"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACTIVITIES,
  TEAM_MEMBERS,
  type Activity,
  type TeamMember,
} from "@/lib/data";
import {
  ChevronLeft,
  CalendarDays,
  User,
  Tag,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Plus,
  MessageSquare,
  History,
  CheckSquare,
  Send,
  Link2,
  Paperclip,
  Smile,
  FileText,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const priBadge: Record<string, string> = {
  low: "rgba(255,255,255,0.20)",
  medium: "#ffffff",
  high: "#ffffff",
  critical: "#ef4444",
};

interface Comment {
  id: string;
  user: TeamMember;
  text: string;
  time: string;
}

interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

type TabType = "overview" | "subtasks" | "discussion" | "history";

export default function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const a = ACTIVITIES.find((item) => item.id === id);

  // Layout State
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Collaboration State
  const [assignees, setAssignees] = useState<TeamMember[]>(
    a ? [a.assignee] : [],
  );
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      user: TEAM_MEMBERS[1],
      text: "Started working on the initial draft. Should have something to show by EOD.",
      time: "2h ago",
    },
    {
      id: "c2",
      user: TEAM_MEMBERS[2],
      text: "Looks good! Don't forget to include the edge cases we discussed.",
      time: "1h ago",
    },
  ]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: "s1", text: "Research existing solutions", done: true },
    { id: "s2", text: "Create technical specification", done: false },
    { id: "s3", text: "Initial implementation", done: false },
  ]);
  const [newComment, setNewComment] = useState("");

  if (!a) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50">
        <h1 className="text-xl font-bold mb-4">Activity not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      user: TEAM_MEMBERS[0], // Current user mock
      text: newComment,
      time: "Just now",
    };
    setComments([...comments, comment]);
    setNewComment("");
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)),
    );
  };

  const NAV_ITEMS: { id: TabType; label: string; icon: any; badge?: number }[] =
    [
      { id: "overview", label: "Overview", icon: FileText },
      {
        id: "subtasks",
        label: "Subtasks",
        icon: CheckSquare,
        badge: subtasks.length,
      },
      {
        id: "discussion",
        label: "Discussion",
        icon: MessageSquare,
        badge: comments.length,
      },
      { id: "history", label: "History", icon: History },
    ];

  return (
    <div className="flex flex-col h-full bg-[#252523] text-white">
      {/* ── Top Navigation / Breadcrumbs ── */}
      <div className="flex items-center justify-between px-8 py-4 h-[49px] border-b border-white/10 bg-[#252523]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors text-white/40 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-white/30">Activities</span>
            <span className="text-white/10">/</span>
            <span className="text-white/30 truncate max-w-[150px]">
              {a.milestoneName}
            </span>
            <span className="text-white/10">/</span>
            <span className="text-white/80">{a.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Presence Indicators */}
          <div className="flex -space-x-2">
            {TEAM_MEMBERS.slice(0, 3).map((m, i) => (
              <div
                key={m.id}
                className={cn(
                  "w-6 h-6 rounded-full border-2 border-[#252523] flex items-center justify-center text-[8px] font-bold text-black ring-1 ring-white/5",
                  m.avatarColor,
                )}
                title={`${m.name} is viewing`}
              >
                {m.initials}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/30 hover:text-white"
            >
              <Link2 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/30 hover:text-white"
            >
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Inner Sidebar (Navigation Rail) ── */}
        <div className="w-[240px] border-r border-white/10 flex flex-col p-4 space-y-8 bg-[#1B1B1A]/30">
          <div className="space-y-1">
            <h3 className="text-[10px] font-semibold uppercase text-white/20 mb-4">
              Workspace
            </h3>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 rounded transition-all text-xs font-medium group",
                  activeTab === item.id
                    ? "bg-white/5 text-white/40"
                    : "text-white/30 hover:bg-white/5  cursor-pointer",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={14}
                    strokeWidth={activeTab === item.id ? 2.5 : 2}
                  />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/10 text-white/60">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-8 space-y-4">
            <h3 className="text-[10px] font-semibold uppercase text-white/20 mb-4">
              Collaborators
            </h3>
            <div className="flex -space-x-2">
              {assignees.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 border-[#1B1B1A] flex items-center justify-center text-[10px] font-black text-black ring-1 ring-white/5 shadow-xl",
                    m.avatarColor,
                  )}
                >
                  {m.initials}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Workspace ── */}
        <div className="flex-1 overflow-auto no-scrollbar">
          <div className="max-w-5xl mx-auto px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
              {/* ── Dynamic Content Area ── */}
              <div className="space-y-12">
                {/* Header Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-black text-[9px] font-semibold uppercase ">
                      <Clock size={12} />
                      {a.status.replace("-", " ")}
                    </div>
                    <span className="text-white/20 text-xs">—</span>
                    <span className="text-white/40 text-xs font-medium uppercase tracking-widest">
                      {a.createdAt}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white/95 leading-[1.1]">
                    {a.title}
                  </h1>
                </div>

                {/* Tab Rendering */}
                {activeTab === "overview" && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-semibold uppercase text-white/25">
                          Description
                        </h3>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                      <div className="text-xs leading-relaxed text-white/60 space-y-6 ">
                        <p>
                          Please ensure that all deliverables for this activity
                          are documented and verified. Proof of Work (PoW) must
                          include direct evidence of implementation, such as
                          repository links, design artifacts, or staging
                          environment snapshots.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-semibold uppercase text-white/25">
                          Evidence & PoW
                        </h3>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                      <div className="bg-[#222220] border border-white/10 rounded-md p-8 space-y-8">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1.5">
                            <h3 className="text-xs font-bold text-white/90">
                              Verification Assets
                            </h3>
                            <p className="text-xs text-white/30 max-w-md">
                              Upload artifacts required for the verification
                              stage.
                            </p>
                          </div>
                          <Button>Upload Proof of Work</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="aspect-video rounded-md border border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.01] group hover:border-white/10 transition-all cursor-pointer"
                            >
                              <Plus
                                size={20}
                                className="text-white/5 group-hover:text-white/20 transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "subtasks" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-semibold uppercase text-white/25">
                        Task List
                      </h3>
                      <button className="text-[10px] font-bold cursor-pointer text-white/30 hover:text-white transition-colors flex items-center gap-1">
                        <Plus size={12} /> Add Task
                      </button>
                    </div>
                    <div className="space-y-1 bg-[#222220] border border-white/10 rounded-md overflow-hidden">
                      {subtasks.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => toggleSubtask(s.id)}
                          className="group flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-all cursor-pointer"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border transition-all flex items-center justify-center",
                              s.done
                                ? "bg-white border-white"
                                : "border-white/20 group-hover:border-white/40",
                            )}
                          >
                            {s.done && (
                              <CheckCircle2
                                size={12}
                                className="text-black"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-xs transition-all",
                              s.done
                                ? "text-white/20 line-through"
                                : "text-white/70 group-hover:text-white",
                            )}
                          >
                            {s.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "discussion" && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-10">
                      {comments.map((c) => (
                        <div key={c.id} className="flex gap-5 group">
                          <div className="w-7 h-7 bg-white text-[#222220] rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg">
                            {c.user.initials}
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-white/90">
                                {c.user.name}
                              </span>
                              <span className="text-[10px] text-white/20 uppercase font-semibold tracking-widest">
                                {c.time}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 leading-relaxed">
                              {c.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-5 pt-8">
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-black shrink-0">
                        AM
                      </div>
                      <div className="flex-1 bg-[#222220] border border-white/10 rounded-md p-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Reply to thread..."
                          className="w-full bg-transparent border focus:border-white/10 rounded-[2px] focus:ring-none text-xs p-3 min-h-[100px] resize-none text-white/80 placeholder:text-white/10"
                        />
                        <div className="flex items-center justify-between py-2 border-t border-white/10">
                          <Button onClick={addComment}>Add Comment</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Sidebar: Details ── */}
              <div className="space-y-8">
                {/* Team Section */}
                <div className="space-y-4 px-2">
                  <h3 className="text-[10px] font-semibold uppercase text-white/25">
                    Project Team
                  </h3>
                  <div className="space-y-3">
                    {assignees.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 group"
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#222220] transition-transform group-hover:scale-105",
                            member.avatarColor,
                          )}
                        >
                          {member.initials}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-medium text-white/90">
                            {member.name}
                          </div>
                          <div className="text-[9px] text-white/30 uppercase tracking-wider font-medium">
                            {member.role}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="flex items-center gap-3 w-full group text-white/20 hover:text-white/40 transition-all cursor-pointer">
                      <div className="w-7 h-7 rounded-full border border-dashed border-white/10 flex items-center justify-center group-hover:border-white/20">
                        <Plus size={12} />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        Add Collaborator
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
