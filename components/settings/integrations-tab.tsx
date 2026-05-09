"use client";

import { cn } from "@/lib/utils";
import { INTEGRATIONS } from "./constants";
import { Button } from "../ui/button";

export function IntegrationsTab() {
  return (
    <div className="space-y-3  animate-in fade-in slide-in-from-bottom-4 duration-500">
      {INTEGRATIONS.map((intg) => (
        <div
          key={intg.name}
          className="flex items-center gap-4 px-5 py-4 rounded-lg bg-[#1B1B1A] border border-white/10"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{
              background: `${intg.color}25`,
              border: `1px solid ${intg.color}35`,
              color: intg.color,
            }}
          >
            {intg.name.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium text-white/85">
                {intg.name}
              </span>
              <span
              
              >
                {intg.connected ? "Connected" : "Not connected"}
              </span>
            </div>
            <p className="text-xs text-white/35">{intg.desc}</p>
          </div>
          <Button
           
          >
            {intg.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </div>
  );
}
