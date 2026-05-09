"use client";

import { useState } from "react";
import { Bell, Search, Plus, Layers } from "lucide-react";
import { NOTIFICATIONS, WORKSPACES } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  title: string;
  subtitle?: string;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  action?: React.ReactNode;
  onSearch: () => void;
}

export function Header({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  action,
  onSearch,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeWsId, setActiveWsId] = useState("ws1");
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const activeWs = WORKSPACES.find((w) => w.id === activeWsId) || WORKSPACES[0];

  return (
    <div className="shrink-0 bg-[#252523] border-b border-white/10">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 h-[48px]">
        <div className="flex-1">
          <span className="text-xs font-medium text-white/50">{title}</span>
        </div>

        {/* Search */}
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 h-7 rounded-md text-xs transition-colors hover:bg-white/5 text-white/35 border border-white/10"
        >
          <Search className="w-3 h-3" />
          <span>Search…</span>
          <span className="ml-2 text-[10px] px-1 rounded bg-white/[0.07] text-white/25">
            ⌘K
          </span>
        </button>

        {/* Workspace Switcher */}
        {action ?? (
          <Select
            value={activeWsId}
            onValueChange={(val) => val && setActiveWsId(val)}
          >
            <SelectTrigger className="max-h-7 min-w-[180px] border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-2.5 text-white/70">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full bg-linear-to-br flex items-center justify-center text-[8px] font-bold text-white shadow-sm",
                    activeWs.gradient,
                  )}
                ></div>
                <SelectValue placeholder="Workspace" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#1B1B1A] border-white/10 text-white min-w-[200px]">
              {WORKSPACES.map((ws) => (
                <SelectItem
                  key={ws.id}
                  value={ws.id}
                  className="focus:bg-white/5 focus:text-white py-2"
                >
                  <div className="flex items-center gap-2.5 w-full">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full bg-linear-to-br flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-sm",
                        ws.gradient,
                      )}
                    ></div>
                    <div className="flex flex-col">
                      <span className="font-medium text-xs">{ws.name}</span>
                      <span className="text-[10px] text-white/30">
                        {ws.type} Plan
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-white/35"
          >
            <Bell className="w-4 h-4" />
          
          </button>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-1 w-72 rounded-lg overflow-hidden z-50 bg-[#1B1B1A] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/35 border-b border-white/10">
                Notifications
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {NOTIFICATIONS.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/10"
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                        n.read ? "bg-white/12" : "bg-[#ffffff]",
                      )}
                    />
                    <p className="text-xs text-white/55">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs (Arena-style) */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 px-6 pb-0 border-t border-white/10">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "px-4 h-9 text-xs font-medium transition-all relative",
                  isActive ? "text-white/90" : "text-white/38",
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] rounded-t-full bg-[#ffffff]" />
                )}
              </button>
            );
          })}
          {subtitle && (
            <span className="ml-auto text-xs text-white/28">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
