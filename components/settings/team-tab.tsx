"use client";

import { useState } from "react";
import { TEAM_MEMBERS } from "@/lib/data";
import { Mail, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROLES } from "./constants";

export function TeamTab() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Contributor");
  const [inviting, setInviting] = useState(false);

  const sendInvite = () => {
    if (!inviteEmail) return;
    setInviting(true);
    setTimeout(() => {
      setInviting(false);
      setInviteEmail("");
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Invite Section */}
      <div className="p-6 rounded-lg bg-[#1B1B1A] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus size={16} className="text-white/40" />
          <h3 className="text-xs font-bold text-white/90">Invite New Member</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Mail size={14} className="absolute left-3 top-3 text-white/20 group-focus-within:text-white/60 transition-colors" />
            <input 
              type="email"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md bg-transparent border border-white/10 focus:border-white/20 outline-none text-xs transition-all text-white/80 placeholder:text-white/10"
            />
          </div>
          <div className="w-48 relative group">
            <Shield size={14} className="absolute left-3 top-3 text-white/20 group-focus-within:text-white/60 transition-colors" />
            <select 
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md bg-transparent border border-white/10 focus:border-white/20 outline-none text-xs transition-all text-white/80 appearance-none cursor-pointer"
            >
              {ROLES.map(r => (
                <option key={r} value={r} className="bg-[#1B1B1A] text-white/80">{r}</option>
              ))}
            </select>
          </div>
          <Button 
            onClick={sendInvite}
            disabled={!inviteEmail || inviting}
            className={cn(
              "h-10 px-6 font-bold text-xs transition-all",
              inviting ? "bg-white/10 text-white/40" : "bg-white text-black hover:bg-white/90"
            )}
          >
            {inviting ? "Sending..." : "Send Invite"}
          </Button>
        </div>
        <p className="text-[10px] text-white/20 px-1">
          They will receive an email to join your organization as a <span className="text-white/40 font-bold">{inviteRole}</span>.
        </p>
      </div>

      <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
        <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20">Current Members</h3>
        </div>
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
              {ROLES.filter(r => r !== m.role).map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <button className="text-[11px] transition-colors hover:text-red-400 text-white/25">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
