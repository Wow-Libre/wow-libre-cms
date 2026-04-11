"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export type DashboardModalAccent = "cyan" | "amber" | "emerald";

const ACCENT_BAR: Record<DashboardModalAccent, string> = {
  cyan: "from-cyan-500 via-sky-500 to-violet-500",
  amber: "from-amber-500 via-orange-500 to-rose-500",
  emerald: "from-emerald-500 via-teal-500 to-cyan-600",
};

export interface DashboardModalShellProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Tailwind max-width: max-w-lg | max-w-3xl | max-w-5xl … */
  maxWidthClass?: string;
  accent?: DashboardModalAccent;
  /** z-index por encima del header del dashboard */
  zIndexClass?: string;
}

/**
 * Contenedor visual común para modales del panel admin (overlay + tarjeta + barra de acento).
 */
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
      className={`fixed inset-0 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md ${zIndexClass}`}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`relative my-8 w-full ${maxWidthClass} max-h-[min(92vh,920px)] overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-800/98 via-slate-900/98 to-slate-950 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.06]`}
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENT_BAR[accent]}`}
          aria-hidden
        />
        <div className="flex max-h-[min(92vh,920px)] flex-col">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-700/50 px-6 py-5 pr-4 pt-6 sm:px-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {title}
              </h2>
              {subtitle != null && subtitle !== "" && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-white"
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
            <div className="shrink-0 border-t border-slate-700/50 bg-slate-900/90 px-6 py-4 sm:px-8">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
