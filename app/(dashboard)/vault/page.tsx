"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { VAULT_DOCUMENTS, type VaultDocument } from "@/lib/data";
import { Search, Plus, FileText, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const catColor: Record<VaultDocument["category"], string> = {
  requirements: "#ffffff",
  designs: "#a855f7",
  reports: "#ffffff",
  contracts: "#ffffff",
  other: "rgba(255,255,255,0.30)",
};

export default function VaultPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"all" | VaultDocument["category"]>("all");

  const docs = VAULT_DOCUMENTS.filter(
    (d) =>
      (cat === "all" || d.category === cat) &&
      (!search || d.name.toLowerCase().includes(search.toLowerCase())),
  );
  const cats = [
    "all",
    "requirements",
    "designs",
    "reports",
    "contracts",
    "other",
  ] as const;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#252523]">
      <Header
        title="Vault"
        action={
          <Button size="sm" className="h-7 font-bold">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Upload
          </Button>
        }
        onSearch={() => {}}
      />
      <div className="flex-1 overflow-auto px-8 py-7">
        <div className="mb-6">
          <h1 className="text-[22px] font-semibold mb-1 text-white/90">
            Vault
          </h1>
          <p className="text-xs text-white/40">
            Centralized documents — requirements, designs, reports, and
            evidence.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="pl-9 pr-4 h-8 rounded-md text-xs bg-transparent outline-none border border-white/10 text-white/70 w-[220px]"
            />
          </div>
          <div className="flex items-center gap-1">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "px-3 h-7 rounded text-[11px] font-medium capitalize transition-all border",
                  cat === c
                    ? "text-white bg-[#ffffff]/18 border-[#ffffff]/35"
                    : "text-white/38 bg-transparent border-transparent",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[11px] text-white/28">
            {docs.length} files
          </span>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden bg-[#1B1B1A] border border-white/10">
          <div
            className="grid px-4 py-2.5 bg-[#252523] border-b border-white/10"
            style={{
              gridTemplateColumns: "1fr 140px 100px 120px 80px",
            }}
          >
            {["Name", "Category", "Size", "Uploaded", ""].map((col, i) => (
              <div
                key={i}
                className="text-[11px] font-semibold uppercase tracking-widest text-white/28"
              >
                {col}
              </div>
            ))}
          </div>
          {docs.map((doc, i) => (
            <div
              key={doc.id}
              className={cn(
                "grid items-center px-4 py-3.5 group transition-colors cursor-default hover:bg-white/[0.025]",
                i < docs.length - 1 ? "border-b border-white/[0.05]" : "",
              )}
              style={{
                gridTemplateColumns: "1fr 140px 100px 120px 80px",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{
                    background: `${catColor[doc.category]}18`,
                    border: `1px solid ${catColor[doc.category]}30`,
                  }}
                >
                  <FileText
                    className="w-3.5 h-3.5"
                    style={{ color: catColor[doc.category] }}
                    strokeWidth={1.7}
                  />
                </div>
                <span className="text-xs font-medium text-white/80">
                  {doc.name}
                </span>
              </div>
              <span
                className="text-[11px] capitalize px-2 py-0.5 rounded w-fit"
                style={{
                  color: catColor[doc.category],
                  background: `${catColor[doc.category]}15`,
                }}
              >
                {doc.category}
              </span>
              <span className="text-xs text-white/35">{doc.size}</span>
              <span className="text-[11px] text-white/30">
                {doc.uploadedAt}
              </span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                <button className="text-white/30 hover:text-white transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button className="text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
