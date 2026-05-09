"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "./toggle";
import { INITIAL_NOTIFS } from "./constants";

export function NotificationsTab() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  return (
    <div className="rounded-lg overflow-hidden  bg-[#1B1B1A] border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {notifs.map((n, i) => (
        <div
          key={n.label}
          className={cn(
            "flex items-center justify-between px-5 py-4",
            i < notifs.length - 1 ? "border-b border-white/5" : "",
          )}
        >
          <div>
            <div className="text-xs font-medium text-white/80">{n.label}</div>
            <div className="text-xs text-white/35">{n.desc}</div>
          </div>
          <Toggle
            on={n.on}
            onChange={(v) => {
              const c = [...notifs];
              c[i] = { ...c[i], on: v };
              setNotifs(c);
            }}
          />
        </div>
      ))}
    </div>
  );
}
