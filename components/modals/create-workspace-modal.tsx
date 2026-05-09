"use client";

import React, { useState } from "react";
import { CheckCircle2, Globe, Building2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useOrganizations from "@/hooks/useOrganizations";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateWorkspaceModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateWorkspaceModalProps) {
  const [submitted, setSubmitted] = useState(false);
  
  const { register, errors, onSubmit: hookSubmit, isLoading, apiError, reset } = useOrganizations({
    onSuccess: () => {
      setSubmitted(true);
      if (onSuccess) onSuccess();
      
      // Delay closing to show success state, then refresh
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1800);
    },
  });

  const handleClose = () => {
    reset();
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1B1B1A] border border-white/10 text-white max-w-lg shadow-2xl p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold text-white/90 mb-1.5">
            Create New Workspace
          </DialogTitle>
          <p className="text-xs text-white/40 font-medium">
            Set up a dedicated space for your team's projects and collaboration.
          </p>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white/90 mb-1">
              Workspace Created
            </h3>
            <p className="text-xs text-white/30 text-center">
              Your new workspace is ready. Redirecting you now...
            </p>
          </div>
        ) : (
          <form onSubmit={hookSubmit} className="px-6 pt-5 pb-6 space-y-5">
            {/* Workspace Name */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Workspace Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  {...register("name")}
                  placeholder="e.g. Engineering Team"
                  className="pl-9 "
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[10px] text-red-400/80">{errors.name.message}</p>
              )}
            </div>

            {/* URL Slug */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Workspace URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <div className="flex items-center">
                   <span className="absolute left-9 text-white/20 text-xs">
                    opma.io/
                  </span>
                  <Input
                    {...register("slug")}
                    placeholder="my-team"
                    className="pl-[92px]"
                  />
                </div>
              </div>
              {errors.slug ? (
                <p className="mt-1.5 text-[10px] text-red-400/80">{errors.slug.message}</p>
              ) : (
                <p className="mt-1.5 text-[11px] text-white/25">
                  This will be your unique workspace identifier.
                </p>
              )}
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
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : "Create Workspace"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
