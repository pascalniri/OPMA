"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Tab Components
import { GeneralTab } from "@/components/settings/general-tab";
import { TeamTab } from "@/components/settings/team-tab";
import { PermissionsTab } from "@/components/settings/permissions-tab";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { SecurityTab } from "@/components/settings/security-tab";

const TABS = [
  { id: "general", label: "General" },
  { id: "team", label: "Team" },
  { id: "permissions", label: "Permissions" },
  { id: "integrations", label: "Integrations" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
];

export default function SettingsPage() {
  const params = useParams();
  const teamId = params.teamId;
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#252523]">
      <Header
        title="Settings"
        action={
          <Button
            onClick={save}
            className={cn(
              " transition-all",
              saved ? "bg-[#ffffff] text-white hover:bg-[#ffffff]/90" : "",
            )}
          >
            {saved ? (
              <>
                <Check size={12} />
                Saved!
              </>
            ) : (
              <>
                <Save size={12} />
                Save
              </>
            )}
          </Button>
        }
        onSearch={() => {}}
      />
      <div className="flex-1 overflow-auto px-8 py-7 w-full">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold mb-1 text-white/90">
            Settings
          </h1>
          <p className="text-xs text-white/40">
            Configure your project, team, integrations, and security policies.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.07]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 h-9 text-xs font-medium transition-all relative",
                tab === t.id ? "text-white/90" : "text-white/38",
              )}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-px rounded-t-full bg-[#ffffff]" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="pb-20 w-full mx-auto">
          {tab === "general" && <GeneralTab />}
          {tab === "team" && <TeamTab />}
          {tab === "permissions" && <PermissionsTab />}
          {tab === "integrations" && <IntegrationsTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
