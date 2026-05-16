"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PageShellProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}

export function PageShell({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  noPad,
}: PageShellProps) {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "var(--background)" }}
    >
      {/* Sticky page header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-8 h-[60px] shrink-0"
        style={{
          background: "rgba(18,18,23,0.90)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              background: "rgba(100,80,223,0.12)",
              border: "1px solid rgba(100,80,223,0.2)",
            }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: "#ffffff" }}
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white/90 leading-none">
              {title}
            </h1>
            <p className="text-[11px] text-white/35 font-medium mt-0.5 leading-none">
              {subtitle}
            </p>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      <div className={cn(noPad ? "" : "px-8 py-6 space-y-5")}>{children}</div>
    </div>
  );
}

interface PrimaryButtonProps {
  icon?: React.ElementType;
  children: ReactNode;
  onClick?: () => void;
  variant?: "brand" | "ghost" | "danger";
}

export function PrimaryButton({
  icon: Icon,
  children,
  onClick,
  variant = "brand",
}: PrimaryButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    brand: { background: "#ffffff", color: "#fff" },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.6)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    danger: {
      background: "rgba(239,68,68,0.12)",
      color: "#ef4444",
      border: "1px solid rgba(239,68,68,0.2)",
    },
  };
  return (
    <button
      onClick={onClick}
      style={styles[variant]}
      className="flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-semibold transition-all hover:brightness-110 active:scale-95"
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "brand" | "green" | "amber" | "red" | "violet";
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "brand",
}: StatCardProps) {
  const palette: Record<string, { color: string; bg: string; border: string }> =
    {
      brand: {
        color: "#ffffff",
        bg: "rgba(100,80,223,0.10)",
        border: "rgba(100,80,223,0.18)",
      },
      green: {
        color: "#ffffff",
        bg: "rgba(34,197,94,0.09)",
        border: "rgba(34,197,94,0.16)",
      },
      amber: {
        color: "#ffffff",
        bg: "rgba(245,158,11,0.09)",
        border: "rgba(245,158,11,0.16)",
      },
      red: {
        color: "#ef4444",
        bg: "rgba(239,68,68,0.09)",
        border: "rgba(239,68,68,0.16)",
      },
      violet: {
        color: "#a855f7",
        bg: "rgba(168,85,247,0.09)",
        border: "rgba(168,85,247,0.16)",
      },
    };
  const p = palette[accent];

  return (
    <div
      className="flex flex-col gap-3.5 p-5 rounded-2xl transition-all hover:brightness-110 group"
      style={{
        background: "#1f1f23",
        border: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="p-2.5 rounded-xl"
          style={{ background: p.bg, border: `1px solid ${p.border}` }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: p.color }}
            strokeWidth={2}
          />
        </div>
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: p.color, opacity: 0.5 }}
        />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-1">
          {label}
        </div>
        <div
          className="text-[28px] font-bold tabular-nums leading-none"
          style={{ color: p.color }}
        >
          {value}
        </div>
        {sub && (
          <div className="text-[11px] text-white/35 mt-1.5 font-medium">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
