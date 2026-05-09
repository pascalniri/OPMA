"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Target,
  Database,
  BarChart3,
  Users,
  Settings,
  ArrowRight,
  Plus,
  FileText,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  action: () => void;
  group: "Navigate" | "Actions";
  shortcut?: string;
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  const ALL_COMMANDS: CommandItem[] = [
    {
      id: "dashboard",
      label: "Project Pulse",
      sublabel: "Overview & health metrics",
      icon: LayoutDashboard,
      action: () => navigate("/dashboard"),
      group: "Navigate",
      shortcut: "G P",
    },
    {
      id: "milestones",
      label: "Milestones",
      sublabel: "Track weighted milestone progress",
      icon: Target,
      action: () => navigate("/milestones"),
      group: "Navigate",
      shortcut: "G M",
    },
    {
      id: "vault",
      label: "Vault",
      sublabel: "Documents & evidence files",
      icon: Database,
      action: () => navigate("/vault"),
      group: "Navigate",
      shortcut: "G V",
    },
    {
      id: "reports",
      label: "Reports",
      sublabel: "Project analytics & velocity",
      icon: BarChart3,
      action: () => navigate("/reports"),
      group: "Navigate",
      shortcut: "G R",
    },
    {
      id: "team",
      label: "Team",
      sublabel: "Members, roles & activity",
      icon: Users,
      action: () => navigate("/team"),
      group: "Navigate",
      shortcut: "G T",
    },
    {
      id: "settings",
      label: "Settings",
      sublabel: "Project configuration & integrations",
      icon: Settings,
      action: () => navigate("/settings"),
      group: "Navigate",
      shortcut: "G S",
    },
    {
      id: "new-activity",
      label: "Create activity",
      sublabel: "Add a new tracked activity",
      icon: Plus,
      action: onClose,
      group: "Actions",
    },
    {
      id: "new-milestone",
      label: "Create milestone",
      sublabel: "Add a new project milestone",
      icon: CheckSquare,
      action: onClose,
      group: "Actions",
    },
    {
      id: "upload-doc",
      label: "Upload document",
      sublabel: "Add evidence to the vault",
      icon: FileText,
      action: onClose,
      group: "Actions",
    },
  ];

  const filtered = query.trim()
    ? ALL_COMMANDS.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.sublabel?.toLowerCase().includes(query.toLowerCase()),
      )
    : ALL_COMMANDS;

  const groups = [...new Set(filtered.map((c) => c.group))];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 16);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selectedIndex, onClose]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-foreground/20 backdrop-blur-[4px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[560px] mx-4 rounded-2xl border border-border bg-card shadow-2xl shadow-primary/15 overflow-hidden card-elevated">
        {/* ── Search input ── */}
        <div className="flex items-center gap-3 px-4 h-13 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, documents…"
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none font-medium"
          />
          <kbd className="hidden sm:flex items-center text-[10px] text-muted-foreground border border-border rounded-md px-1.5 py-0.5 font-mono bg-muted">
            ESC
          </kbd>
        </div>

        {/* ── Results ── */}
        <div className="max-h-[360px] overflow-y-auto py-1.5">
          {groups.map((group) => {
            const groupItems = filtered.filter((c) => c.group === group);
            return (
              <div key={group}>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground select-none">
                  {group}
                </div>
                {groupItems.map((item) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors",
                        isSelected ? "bg-primary/8" : "hover:bg-muted/60",
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors border",
                          isSelected
                            ? "bg-primary/10 border-primary/20"
                            : "bg-muted border-border",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-3.5 h-3.5 transition-colors",
                            isSelected ? "text-brand" : "text-foreground/40",
                          )}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            "text-[12.5px] font-semibold leading-none transition-colors",
                            isSelected
                              ? "text-foreground"
                              : "text-foreground/65",
                          )}
                        >
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className="text-[11px] text-muted-foreground mt-[3px] leading-none">
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                      {item.shortcut && (
                        <div className="flex items-center gap-1 shrink-0">
                          {item.shortcut.split(" ").map((k) => (
                            <kbd
                              key={k}
                              className="text-[9px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-muted"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      )}
                      {isSelected && !item.shortcut && (
                        <ArrowRight className="w-3.5 h-3.5 text-brand shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* ── Footer hints ── */}
        <div className="flex items-center gap-4 px-4 h-9 border-t border-border bg-muted/50">
          {[
            ["↑↓", "navigate"],
            ["↵", "select"],
            ["ESC", "close"],
          ].map(([key, label], i) => (
            <span
              key={i}
              className={cn(
                "flex items-center gap-1.5 text-[10px] text-muted-foreground/60",
                i === 2 && "ml-auto",
              )}
            >
              <kbd className="border border-border rounded px-1 py-0.5 font-mono text-[9px] bg-background">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
