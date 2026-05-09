"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Database,
  BarChart3,
  Users,
  Settings,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Project Pulse", icon: LayoutDashboard },
  { href: "/milestones", label: "Milestones", icon: Target },
  { href: "/vault", label: "Vault", icon: Database },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-[250px] shrink-0 bg-[#252523] border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-[49px] shrink-0 border-b border-white/10">
        <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white text-[#252523]">
          <Hexagon size={14} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-semibold text-white/90">OPMA</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 h-9 rounded text-xs transition-all group",
                isActive
                  ? "text-white/90 bg-white/7"
                  : "text-white/40 hover:text-white/75 hover:bg-white/5",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-white/80" : "text-white/30",
                )}
                strokeWidth={1.5}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Project score mini */}
      <div className="mx-3 mb-3 p-3 rounded-lg bg-white/[0.03] border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Score
          </span>
          <span className="text-xs font-bold text-white">68%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden bg-white/10">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: "68%" }}
          />
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 h-[48px] shrink-0 border-t border-white/10">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-[#252523] shrink-0 bg-white">
          AM
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-white/75 truncate">
            Alice Mwende
          </div>
          <div className="text-[10px] text-white/30 truncate">
            Project Manager
          </div>
        </div>
      </div>
    </aside>
  );
}
