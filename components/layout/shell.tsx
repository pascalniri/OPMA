"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { CURRENT_PROJECT } from "@/lib/data";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

// Export helpers for pages to open the command palette
export { CURRENT_PROJECT };
