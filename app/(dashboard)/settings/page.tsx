"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { CURRENT_PROJECT, TEAM_MEMBERS } from "@/lib/data";
import { Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "general", label: "General" },
  { id: "team", label: "Team & Roles" },
  { id: "integrations", label: "Integrations" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
];

const INTEGRATIONS = [
  {
    name: "GitHub",
    desc: "Link commits and PRs as evidence.",
    connected: true,
    account: "org/core-api",
    color: "#e5e7eb",
  },
  {
    name: "Figma",
    desc: "Attach design links to activities.",
    connected: true,
    account: "opma-designs",
    color: "#a855f7",
  },
  {
    name: "Slack",
    desc: "Receive alerts and reminders.",
    connected: false,
    account: null,
    color: "#ffffff",
  },
  {
    name: "Jira",
    desc: "Sync issues with activities.",
    connected: false,
    account: null,
    color: "#ffffff",
  },
];

const NOTIFS = [
  {
    label: "PoW Submitted",
    desc: "When a member submits proof of work",
    on: true,
  },
  {
    label: "Deadline Reminders",
    desc: "3 days before a milestone is due",
    on: true,
  },
  {
    label: "Status Changed",
    desc: "When a milestone moves to at-risk",
    on: true,
  },
  {
    label: "New Assignments",
    desc: "When you are assigned an activity",
    on: false,
  },
];

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all",
        on ? "bg-[#ffffff]" : "bg-white/12",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
          on ? "left-[18px]" : "left-[2px]",
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);

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
            size="sm"
            className={cn(
              "h-7 font-bold transition-all",
              saved ? "bg-[#ffffff] text-white hover:bg-[#ffffff]/90" : "",
            )}
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save
              </>
            )}
          </Button>
        }
        onSearch={() => {}}
      />
      <div className="flex-1 overflow-auto px-8 py-7">
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
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full bg-[#ffffff]" />
              )}
            </button>
          ))}
        </div>

        {/* General */}
        {tab === "general" && (
          <div className="p-6 rounded-lg max-w-2xl space-y-5 bg-[#1B1B1A] border border-white/10">
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
        )}

        {/* Team */}
        {tab === "team" && (
          <div className="rounded-lg overflow-hidden max-w-3xl bg-[#1B1B1A] border border-white/10">
            {TEAM_MEMBERS.map((m, i) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors",
                  i < TEAM_MEMBERS.length - 1
                    ? "border-b border-white/[0.05]"
                    : "",
                )}
              >
                <div
                  className={`w-8 h-8 rounded-full ${m.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}
                >
                  {m.initials}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/80">{m.name}</div>
                  <div className="text-[11px] text-white/30">{m.email}</div>
                </div>
                <select className="h-7 px-2 rounded-md text-xs bg-transparent outline-none border border-white/10 text-white/55">
                  <option>{m.role}</option>
                  <option>Project Manager</option>
                  <option>Developer</option>
                  <option>Designer</option>
                </select>
                <button className="text-[11px] transition-colors hover:text-red-400 text-white/25">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Integrations */}
        {tab === "integrations" && (
          <div className="space-y-3 max-w-2xl">
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
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded",
                        intg.connected
                          ? "text-[#ffffff] bg-[#ffffff]/12"
                          : "text-white/30 bg-white/6",
                      )}
                    >
                      {intg.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <p className="text-xs text-white/35">{intg.desc}</p>
                </div>
                <button
                  className={cn(
                    "px-4 h-7 rounded text-xs font-medium transition-all",
                    intg.connected
                      ? "text-white/40 bg-white/6"
                      : "text-white bg-[#ffffff]",
                  )}
                >
                  {intg.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <div className="rounded-lg overflow-hidden max-w-2xl bg-[#1B1B1A] border border-white/10">
            {notifs.map((n, i) => (
              <div
                key={n.label}
                className={cn(
                  "flex items-center justify-between px-5 py-4",
                  i < notifs.length - 1 ? "border-b border-white/[0.05]" : "",
                )}
              >
                <div>
                  <div className="text-xs font-medium text-white/80">
                    {n.label}
                  </div>
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
        )}

        {/* Security */}
        {tab === "security" && (
          <div className="space-y-4 max-w-2xl">
            <div className="p-4 rounded-lg bg-[#ffffff]/8 border border-[#ffffff]/20">
              <p className="text-xs font-semibold mb-1 text-[#ffffff]">
                Proof-of-Work Policy
              </p>
              <p className="text-xs text-[#ffffff]/70">
                All activities must include evidence before moving to Verified
                Done. This policy cannot be bypassed.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
              {[
                {
                  label: "Require PoW for all verifications",
                  desc: "Cannot mark done without evidence.",
                  on: true,
                },
                {
                  label: "Allow milestone weight edits",
                  desc: "PM-only permission.",
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
              ].map((s, i, arr) => (
                <div
                  key={s.label}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    i < arr.length - 1 ? "border-b border-white/[0.05]" : "",
                  )}
                >
                  <div>
                    <div className="text-xs font-medium text-white/80">
                      {s.label}
                    </div>
                    <div className="text-xs text-white/35">{s.desc}</div>
                  </div>
                  <Toggle on={s.on} onChange={() => {}} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
