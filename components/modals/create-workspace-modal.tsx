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
import { Label } from "../ui/label";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    errors,
    onSubmit: hookSubmit,
    isLoading,
    apiError,
    reset,
  } = useOrganizations({
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
      <DialogContent className="bg-white border border-black/10 text-foreground max-w-lg  p-0 gap-0 rounded">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-[18px] font-bold text-foreground tracking-tight mb-1.5">
            Create New Workspace
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground font-medium">
            Set up a dedicated space for your team's projects and collaboration.
          </p>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-black/5 border border-black/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Workspace Created
            </h3>
            <p className="text-[11px] text-muted-foreground text-center">
              Your new workspace is ready. Redirecting you now...
            </p>
          </div>
        ) : (
          <form onSubmit={hookSubmit} className="px-6 pt-5 pb-6 space-y-5">
            {/* Workspace Name */}
            <div>
              <Label>Workspace Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                <Input
                  {...register("name")}
                  placeholder="e.g. Engineering Team"
                  className="pl-9"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-[10px] text-red-500 font-bold">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* URL Slug */}
            <div>
              <Label>Workspace URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                <div className="flex items-center">
                  <span className="absolute left-9 text-muted-foreground/40 text-[12px] font-medium">
                    opma.io/
                  </span>
                  <Input
                    {...register("slug")}
                    placeholder="my-team"
                    className="pl-[90px]"
                  />
                </div>
              </div>
              {errors.slug ? (
                <p className="mt-1.5 text-[10px] text-red-500 font-bold">
                  {errors.slug.message}
                </p>
              ) : (
                <p className="mt-1.5 text-[10px] text-muted-foreground font-medium">
                  This will be your unique workspace identifier.
                </p>
              )}
            </div>

            {apiError && (
              <div className="p-3 rounded bg-red-50 border border-red-100 text-[11px] text-red-600 font-bold">
                {apiError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
