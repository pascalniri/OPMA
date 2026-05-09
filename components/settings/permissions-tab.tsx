"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES, PERMISSION_CATEGORIES } from "./constants";

export function PermissionsTab() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {PERMISSION_CATEGORIES.map((cat) => (
        <div key={cat.id} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {cat.label}
            </h3>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="overflow-hidden rounded-md border border-white/10 bg-[#1B1B1A]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 ">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase text-white/20 w-[300px]">
                    Permission
                  </th>
                  {ROLES.map((role) => (
                    <th key={role} className="px-4 py-4 text-[10px] font-semibold uppercase text-white/20 text-center">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cat.permissions.map((p) => (
                  <tr key={p.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
                        {p.label}
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5">
                        {p.desc}
                      </div>
                    </td>
                    {ROLES.map((role) => (
                      <td key={role} className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <button className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center transition-all",
                            role === "Owner" || role === "Admin" || (role === "Manager" && !p.id.includes("bypass"))
                              ? "bg-white border-white text-black"
                              : "border-white/10 hover:border-white/30 text-transparent"
                          )}>
                            <Check size={12} strokeWidth={4} />
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
