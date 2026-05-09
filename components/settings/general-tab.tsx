"use client";

import { CURRENT_PROJECT } from "@/lib/data";

export function GeneralTab() {
  return (
    <div className="p-6 rounded-lg  space-y-5 bg-[#1B1B1A] border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {[
        {
          label: "Project Name",
          value: CURRENT_PROJECT.name,
          type: "text",
        },
        {
          label: "Project Code",
          value: CURRENT_PROJECT.code,
          type: "text",
        },
        {
          label: "Start Date",
          value: CURRENT_PROJECT.startDate,
          type: "date",
        },
        {
          label: "End Date",
          value: CURRENT_PROJECT.endDate,
          type: "date",
        },
      ].map((f) => (
        <div key={f.label}>
          <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-white/30">
            {f.label}
          </label>
          <input
            type={f.type}
            defaultValue={f.value}
            className="w-full h-9 px-3 rounded-md bg-transparent outline-none text-xs focus:border-[#ffffff] transition-colors border border-white/10 text-white/75"
          />
        </div>
      ))}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-white/30">
          Description
        </label>
        <textarea
          defaultValue={CURRENT_PROJECT.description}
          rows={3}
          className="w-full px-3 py-2 rounded-md bg-transparent outline-none text-xs resize-none border border-white/10 text-white/75"
        />
      </div>
    </div>
  );
}
