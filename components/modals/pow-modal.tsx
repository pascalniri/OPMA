"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Link2,
  FileText,
  X,
  CheckCircle2,
  CloudUpload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { type Activity } from "@/lib/data";
import { cn } from "@/lib/utils";

interface PowModalProps {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}

export function PowModal({ activity, open, onClose }: PowModalProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFiles([]);
      setUrl("");
      setNotes("");
      onClose();
    }, 1800);
  };

  const handleClose = () => {
    setFiles([]);
    setUrl("");
    setNotes("");
    setSubmitted(false);
    onClose();
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1B1B1A] border border-white/10 text-white max-w-lg shadow-2xl p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base font-semibold text-white/90 mb-1.5">
            Submit Proof of Work
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] bg-white/10 text-white/70 border-white/20 font-medium"
            >
              {activity.milestoneName}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-white/40 font-medium truncate">
            {activity.title}
          </p>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-semibold text-white/90 mb-1">
              Submitted for Verification
            </h3>
            <p className="text-xs text-white/30 text-center">
              Your proof of work has been sent to the project manager for
              review.
            </p>
          </div>
        ) : (
          <div className="px-6 pt-5 pb-6 space-y-5">
            {/* Drop zone */}
            <div>
              <label className="block text-xs font-semibold text-white/30 mb-2 uppercase tracking-wider">
                Upload Evidence
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all cursor-pointer py-8 px-4",
                  dragging
                    ? "border-white bg-white/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-10 h-10 rounded-lg bg-[#252523] border border-white/10 flex items-center justify-center shadow-sm">
                  <CloudUpload
                    className={cn(
                      "w-5 h-5 transition-colors",
                      dragging ? "text-white" : "text-white/25",
                    )}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/60">
                    <span className="text-white font-semibold">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-white/25 mt-0.5">
                    Screenshots, PDFs, ZIP archives (max 25 MB)
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <FileText className="w-4 h-4 text-white/60 shrink-0" />
                      <span className="text-xs text-white/70 flex-1 truncate">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-white/25 shrink-0">
                        {(f.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles((p) => p.filter((_, j) => j !== i));
                        }}
                        className="text-white/20 hover:text-white/40 transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-semibold text-white/30 mb-2 uppercase tracking-wider">
                Reference URL
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. github.com/org/repo/commit/abc123"
                  className="pl-9 bg-white/[0.03] border-white/10 text-white/70 placeholder:text-white/20 focus-visible:ring-white/20 focus-visible:border-white/50 h-9"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/25">
                GitHub commit, Figma link, Loom recording, etc.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-white/30 mb-2 uppercase tracking-wider">
                Verification Notes
              </label>
              <span className="sr-only">Verification Notes</span>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what was done..."
                className="bg-white/[0.03] border-white/10 text-white/70 placeholder:text-white/20 focus-visible:ring-white/20 focus-visible:border-white/50 min-h-24 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-white/40 hover:text-white hover:bg-white/5 border border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={files.length === 0 && !url && !notes}
                className="flex-1 font-bold h-9"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
