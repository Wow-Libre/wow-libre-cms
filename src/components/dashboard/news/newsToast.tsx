"use client";

import { useEffect, useState } from "react";

export type NewsToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: NewsToastKind;
  message: string;
};

let listeners: Array<(t: Toast) => void> = [];
let nextId = 1;

export function showNewsToast(
  message: string,
  kind: NewsToastKind = "info",
  ttlMs = 3500,
) {
  const id = nextId++;
  listeners.forEach((l) => l({ id, kind, message }));
  setTimeout(() => {
    listeners.forEach((l) => l({ id, kind: "info", message: "" } as Toast));
  }, ttlMs);
}

const TONE: Record<NewsToastKind, string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  error: "border-red-500/40 bg-red-500/10 text-red-200",
  info: "border-slate-600/40 bg-slate-800/95 text-slate-200",
};

const ICON: Record<NewsToastKind, string> = {
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  error:
    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export function NewsToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (t: Toast) => {
      if (!t.message) return;
      setToasts((prev) => {
        if (prev.find((x) => x.id === t.id)) return prev;
        return [...prev, t];
      });
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-4 sm:right-4 sm:top-auto sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-2xl backdrop-blur-md ${TONE[t.kind]}`}
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={ICON[t.kind]}
            />
          </svg>
          <p className="flex-1">{t.message}</p>
          <button
            type="button"
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            className="shrink-0 rounded p-1 text-current opacity-60 transition-opacity hover:opacity-100"
            aria-label="Cerrar"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
