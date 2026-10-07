"use client";

import { AccountFallbackOption } from "@/model/model";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FallbackAccountModalProps {
  open: boolean;
  options: AccountFallbackOption[];
  saving: boolean;
  onSelect: (accountGameId: number) => void;
}

export function FallbackAccountModal({
  open,
  options,
  saving,
  onSelect,
}: FallbackAccountModalProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-cyan-400/25 bg-[#0b1219] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fallback-account-title"
      >
        <h2 id="fallback-account-title" className="text-2xl font-semibold text-white">
          {t("account.fallback.modal-title")}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-300">
          {t("account.fallback.modal-text")}
        </p>
        <ul className="mt-5 max-h-80 space-y-2 overflow-y-auto">
          {options.map((option) => {
            const selected = selectedId === option.id;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(option.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-cyan-300 bg-cyan-400/15 text-white"
                      : "border-white/10 bg-slate-950/60 text-slate-200 hover:border-cyan-400/40"
                  }`}
                >
                  <span className="font-semibold">{option.username}</span>
                  <span className="text-sm text-slate-400">{option.realm}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          disabled={saving || selectedId == null}
          onClick={() => {
            if (selectedId != null) {
              onSelect(selectedId);
            }
          }}
          className="mt-5 w-full rounded-xl bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/30 disabled:text-slate-400"
        >
          {t("account.fallback.modal-confirm")}
        </button>
      </div>
    </div>
  );
}
