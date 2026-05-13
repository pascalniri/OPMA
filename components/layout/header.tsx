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
import useMe from "@/hooks/useMe";

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
  const { user, logout } = useMe();
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="shrink-0 bg-background border-b border-border">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 h-[49px]">
        <div className="flex-1">
          <h1 className="text-xs font-bold text-foreground">{title}</h1>
        </div>

        {/* Action / Search / Profile */}
        <div className="flex items-center gap-4">
          {action}

          <div className="flex items-center gap-2">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full border border-black/4 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black/4 border border-black/4 flex items-center justify-center text-[10px] font-bold text-[#737373] uppercase">
                {user?.name?.[0] || user?.email?.[0] || "?"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 px-6 pb-0 border-t border-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "px-4 h-9 text-xs font-medium transition-all relative",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
