"use client";

import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import type { ServerModel } from "@/model/model";

interface GameAccountRealmFieldProps {
  servers: ServerModel[];
  groupedServers: [string, ServerModel[]][];
  selectedServerId: string;
  loading: boolean;
  onSelect: (serverId: string) => void;
}

export function GameAccountRealmField({
  servers,
  groupedServers,
  selectedServerId,
  loading,
  onSelect,
}: GameAccountRealmFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = servers.find((server) => String(server.id) === selectedServerId);
  const canOpen = servers.length > 1;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) {
    return <div className="mt-3 h-24 animate-pulse rounded-2xl border border-white/10 bg-slate-900/70" />;
  }

  if (servers.length === 0) {
    return (
      <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-[1.45rem] text-slate-400">
        {t("register.section-page.account-game.no-realms")}
      </p>
    );
  }

  return (
    <div ref={rootRef} className="relative mt-3">
      <button
        type="button"
        id="realmForm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("register.section-page.account-game.realm-txt")}
        disabled={!canOpen}
        onClick={() => {
          if (canOpen) {
            setOpen((value) => !value);
          }
        }}
        className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
          selected
            ? "border-cyan-300/50 bg-[#0b1219] shadow-[0_18px_40px_-24px_rgba(34,211,238,0.55)]"
            : "border-white/12 bg-slate-950/80 hover:border-cyan-400/35"
        } ${canOpen ? "cursor-pointer" : "cursor-default"}`}
      >
        {selected ? (
          <>
            <img
              src={selected.avatar}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[1.8rem] font-semibold tracking-wide text-white">
                {selected.name}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[1.35rem] text-slate-400">
                <span>{selected.exp_name}</span>
                <span
                  className={selected.status ? "text-emerald-300" : "text-slate-500"}
                >
                  · {selected.status
                    ? t("register.section-page.account-game.realm-online")
                    : t("register.section-page.account-game.realm-offline")}
                </span>
              </p>
            </div>
          </>
        ) : (
          <div className="flex min-h-16 flex-1 items-center">
            <p className="text-[1.55rem] text-slate-400">
              {t("register.section-page.account-game.select-server")}
            </p>
          </div>
        )}
        {canOpen ? (
          <FaChevronDown
            className={`shrink-0 text-cyan-200/80 transition ${open ? "rotate-180" : ""}`}
            size={14}
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="listbox"
          aria-labelledby="realm-field-label"
          className="absolute z-30 mt-2 max-h-[28rem] w-full overflow-y-auto rounded-2xl border border-white/12 bg-[#0b1219] p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
        >
          {groupedServers.map(([expName, items]) => (
            <div key={expName} className="mb-1 last:mb-0">
              {groupedServers.length > 1 ? (
                <p className="px-3 py-2 text-[1.15rem] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
                  {expName}
                </p>
              ) : null}
              {items.map((server) => {
                const isSelected = String(server.id) === selectedServerId;
                return (
                  <button
                    key={server.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSelect(String(server.id));
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      isSelected
                        ? "bg-cyan-500/15 text-white"
                        : "text-slate-200 hover:bg-white/[0.05]"
                    }`}
                  >
                    <img
                      src={server.avatar}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg border border-white/10 object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[1.5rem] font-semibold">
                        {server.name}
                      </span>
                      <span
                        className={`mt-0.5 block text-[1.25rem] ${
                          server.status ? "text-emerald-300" : "text-slate-500"
                        }`}
                      >
                        {server.status
                          ? t("register.section-page.account-game.realm-online")
                          : t("register.section-page.account-game.realm-offline")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
