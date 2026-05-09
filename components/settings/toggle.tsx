"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all cursor-pointer",
        on ? "bg-[#ffffff]" : "bg-white/12",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
          on ? "left-[18px] bg-[#1B1B1A]" : "left-[2px]",
        )}
      />
    </button>
  );
}
