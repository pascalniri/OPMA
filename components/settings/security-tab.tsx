"use client";

import { cn } from "@/lib/utils";
import { Toggle } from "./toggle";

const SECURITY_POLICIES = [
  {
    label: "Require PoW for all verifications",
    desc: "Cannot mark done without evidence.",
    on: true,
  },
  {
    label: "Allow milestone weight edits",
    desc: "Manager-only permission.",
    on: true,
  },
  {
    label: "Enable audit log",
    desc: "Track all changes and submissions.",
    on: true,
  },
  {
    label: "Restrict vault to project members",
    desc: "Non-members cannot access files.",
    on: false,
  },
];

export function SecurityTab() {
  return (
    <div className="space-y-4  animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 rounded-lg bg-[#ffffff]/8 border border-[#ffffff]/20">
        <p className="text-xs font-semibold mb-1 text-[#ffffff]">
          Proof-of-Work Policy
        </p>
        <p className="text-xs text-[#ffffff]/70">
          All activities must include evidence before moving to Verified Done.
          This policy cannot be bypassed.
        </p>
      </div>
      <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
        {SECURITY_POLICIES.map((s, i, arr) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center justify-between px-5 py-4",
              i < arr.length - 1 ? "border-b border-white/[0.05]" : "",
            )}
          >
            <div>
              <div className="text-xs font-medium text-white/80">{s.label}</div>
              <div className="text-xs text-white/35">{s.desc}</div>
            </div>
            <Toggle on={s.on} onChange={() => {}} />
          </div>
        ))}
      </div>
    </div>
  );
}
