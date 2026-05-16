"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Mail, Shield } from "lucide-react";
import type { MemberRole } from "@/hooks/useOrgMembers";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => Promise<void>;
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("MEMBER");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await onInvite(email, role);
      setEmail("");
      setRole("MEMBER");
      onClose();
    } catch (err) {
      // Error handled in hook/toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-black text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Invite Member</DialogTitle>
          </div>
          <p className="text-white/60 text-[13px]">
            Send an invitation link to a new workspace member.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={14} />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 h-11 border-black/10 focus:border-black/20 focus:ring-black/5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                Workspace Role
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger className="h-11 border-black/10 focus:border-black/20 focus:ring-black/5">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ADMIN" className="text-[13px]">
                      <div className="flex items-center gap-2">
                        <Shield size={12} />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEMBER" className="text-[13px]">
                       <div className="flex items-center gap-2">
                        <Shield size={12} className="opacity-40" />
                        <span>Member</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="VIEWER" className="text-[13px]">
                       <div className="flex items-center gap-2">
                        <Shield size={12} className="opacity-20" />
                        <span>Viewer</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-[#A3A3A3] mt-1.5 leading-relaxed">
                {role === "ADMIN" && "Admins can manage projects, team members, and workspace settings."}
                {role === "MEMBER" && "Members can create projects and work on assigned activities."}
                {role === "VIEWER" && "Viewers can see projects and progress but cannot make changes."}
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="h-11 px-6 font-bold text-[13px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="h-11 px-8 font-bold text-[13px] bg-black hover:bg-neutral-800 text-white"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
