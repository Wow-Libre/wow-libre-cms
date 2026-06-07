"use client";

import { ReactNode } from "react";

type Accent = "emerald" | "amber" | "cyan" | "red";

const accentStyles: Record<
  Accent,
  { border: string; badge: string; ring: string }
> = {
  emerald: {
    border: "border-emerald-500/30",
    badge: "text-emerald-400",
    ring: "focus:ring-emerald-500 focus:border-emerald-500",
  },
  amber: {
    border: "border-amber-500/30",
    badge: "text-amber-400",
    ring: "focus:ring-amber-500 focus:border-amber-500",
  },
  cyan: {
    border: "border-cyan-500/30",
    badge: "text-cyan-400",
    ring: "focus:ring-cyan-500 focus:border-cyan-500",
  },
  red: {
    border: "border-red-500/30",
    badge: "text-red-400",
    ring: "focus:ring-red-500 focus:border-red-500",
  },
};

interface FriendSubModalProps {
  title: string;
  subtitle: string;
  accent?: Accent;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function FriendSubModal({
  title,
  subtitle,
  accent = "cyan",
  closeLabel,
  onClose,
  children,
  footer,
}: FriendSubModalProps) {
  const styles = accentStyles[accent];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.55)]`}
      >
        <div className="shrink-0 border-b border-slate-700/80 bg-slate-900/95 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.18em] ${styles.badge}`}
              >
                {subtitle}
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-lg font-bold text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/20 hover:text-white"
              aria-label={closeLabel}
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-700/80 bg-slate-900/80 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { accentStyles };
