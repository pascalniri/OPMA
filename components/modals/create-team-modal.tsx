"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Hash, Users, Loader2, AlignLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTeams from "@/hooks/useTeams";
import useMe from "@/hooks/useMe";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateTeamModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateTeamModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const { activeOrganization, refresh } = useMe();
  
  const { register, errors, onSubmit: hookSubmit, isLoading, apiError, reset, setValue } = useTeams({
    onSuccess: () => {
      setSubmitted(true);
      refresh();
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        handleClose();
      }, 1800);
    },
  });

  // Debug: log validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Team Form Errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (activeOrganization?.id) {
      setValue("organizationId", activeOrganization.id);
    }
  }, [activeOrganization, setValue, isOpen]);

  const handleClose = () => {
    reset();
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1B1B1A] border border-white/10 text-white max-w-md shadow-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold text-white/90">
            Create New Team
          </DialogTitle>
          <p className="text-xs text-white/40 font-medium">
            Teams group projects and people together. (e.g. Engineering, Design)
          </p>
        </DialogHeader>

        {!activeOrganization ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
             <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-[11px] text-yellow-400/90 text-center">
              No active workspace found. Please create or select a workspace first.
            </div>
            <Button onClick={handleClose} className="mt-4 bg-white text-black text-xs h-8">
              Understood
            </Button>
          </div>
        ) : submitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white/90 mb-1">
              Team Created
            </h3>
            <p className="text-xs text-white/30 text-center">
              Your new team is ready for projects.
            </p>
          </div>
        ) : (
          <form onSubmit={hookSubmit} className="px-6 pt-5 pb-6 space-y-5">
            {/* Hidden Organization ID */}
            <input type="hidden" {...register("organizationId")} />
            
            {/* Team Name */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Team Name
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  {...register("name")}
                  placeholder="e.g. Engineering"
                  className="pl-9 bg-transparent border-white/10 focus:border-white/20"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[10px] text-red-400/80">{errors.name.message}</p>
              )}
            </div>

            {/* Identifier */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Identifier
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  {...register("identifier")}
                  placeholder="e.g. ENG"
                  className="pl-9 bg-transparent border-white/10 focus:border-white/20 uppercase"
                  maxLength={5}
                />
              </div>
              {errors.identifier ? (
                <p className="mt-1.5 text-[10px] text-red-400/80">{errors.identifier.message}</p>
              ) : (
                <p className="mt-1.5 text-[10px] text-white/25">
                  A short code used for projects (2-5 characters).
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Description (Optional)
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-white/25" />
                <textarea
                  {...register("description")}
                  placeholder="What does this team do?"
                  rows={3}
                  className="w-full pl-9 pr-3 py-2 bg-transparent border border-white/10 rounded-md text-xs outline-none focus:border-white/20 transition-all text-white/80 resize-none"
                />
              </div>
            </div>

            {apiError && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-[11px] text-red-400/90">
                {apiError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-white/40 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-white text-[#1B1B1A] hover:bg-white/90"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : "Create Team"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
