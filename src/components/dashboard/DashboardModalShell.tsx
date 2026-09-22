"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export type DashboardModalAccent = "cyan" | "amber" | "emerald";

const ACCENT_BAR: Record<DashboardModalAccent, string> = {
  cyan: "from-[#0071e3] via-[#5ac8fa] to-[#0071e3]",
  amber: "from-[#ff9f0a] via-[#ffd60a] to-[#ff9f0a]",
  emerald: "from-[#34c759] via-[#30d158] to-[#34c759]",
};

export interface DashboardModalShellProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  accent?: DashboardModalAccent;
  zIndexClass?: string;
}

export function DashboardModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidthClass = "max-w-3xl",
  accent = "cyan",
  zIndexClass = "z-[100]",
}: DashboardModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`dashboard-admin fixed inset-0 flex items-center justify-center overflow-y-auto bg-black/25 p-4 backdrop-blur-md ${zIndexClass}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`relative my-8 w-full ${maxWidthClass} max-h-[min(92vh,920px)] overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.28)]`}
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${ACCENT_BAR[accent]}`}
          aria-hidden
        />
        <div className="flex max-h-[min(92vh,920px)] flex-col">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/[0.06] px-6 py-5 pr-4 pt-6 sm:px-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] sm:text-3xl">
                {title}
              </h2>
              {subtitle != null && subtitle !== "" && (
                <p className="mt-2 text-base leading-relaxed text-[#6e6e73] sm:text-lg">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full p-2.5 text-[#6e6e73] transition-colors hover:bg-black/[0.05] hover:text-[#1d1d1f]"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
            {children}
          </div>
          {footer != null && (
            <div className="shrink-0 border-t border-black/[0.06] bg-[#f5f5f7] px-6 py-4 sm:px-8">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
