"use client";

import { getRealmsAdvertisement } from "@/api/realmAdvertisement";
import { useUserContext } from "@/context/UserContext";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SESSION_AUTO_OPEN_KEY = "wow_home_realmlist_tip_auto_v1";

/** Panel de administración de reinos (lista + dashboard) */
const ADMIN_REALMS_PATH_PREFIX = "/realms";

const RealmlistAssistantWidget: React.FC = () => {
  const pathname = usePathname();
  const hideOnAdminViews =
    pathname?.startsWith(ADMIN_REALMS_PATH_PREFIX) ?? false;

  const { t } = useTranslation();
  const { user } = useUserContext();
  const token = Cookies.get("token");
  const isAuthenticated = Boolean(token && user.logged_in);
  const [realms, setRealms] = useState<RealmAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (hideOnAdminViews || isAuthenticated) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getRealmsAdvertisement(user.language);
        if (!cancelled && data.length > 0) {
          setRealms(data);
          if (
            typeof window !== "undefined" &&
            !window.sessionStorage.getItem(SESSION_AUTO_OPEN_KEY)
          ) {
            window.sessionStorage.setItem(SESSION_AUTO_OPEN_KEY, "1");
            setIsOpen(true);
          }
        }
      } catch (error) {
        console.error("[RealmlistAssistantWidget] getRealmsAdvertisement", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user.language, hideOnAdminViews, isAuthenticated]);

  const handleCopy = (realmlist: string, realmId: number) => {
    void navigator.clipboard.writeText(realmlist).then(
      () => {
        setCopiedId(realmId);
        window.setTimeout(() => setCopiedId(null), 2000);
      },
      (error: unknown) => {
        console.error("[RealmlistAssistantWidget] clipboard.writeText", error);
      }
    );
  };

  if (hideOnAdminViews || isAuthenticated) {
    return null;
  }

  if (loading || realms.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-[9998] sm:bottom-6 sm:left-6">
      {isOpen && (
        <div className="relative mb-4 flex w-[min(96vw,640px)] max-h-[min(85vh,820px)] flex-col overflow-hidden rounded-2xl border-2 border-cyan-400/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[0_22px_60px_rgba(8,145,178,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:w-[min(94vw,720px)]">
          {/* Glow superior */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

          {/* Esquinas runicas */}
          <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-cyan-300/70" />
          <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-cyan-300/70" />
          <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-cyan-300/70" />
          <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-cyan-300/70" />

          {/* Header */}
          <div className="relative flex items-start justify-between gap-3 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent px-6 py-5 sm:px-8 sm:py-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-gaming inline-flex items-center rounded-md border border-cyan-300/50 bg-cyan-500/15 px-3 py-1.5 text-sm font-bold uppercase tracking-[0.2em] text-cyan-100 sm:text-base">
                  {t("home-us.realmlist-assistant.badge")}
                </span>
              </div>
              <h3 className="font-gaming mt-3 text-2xl font-bold leading-tight tracking-wide text-white sm:text-3xl">
                {t("home-us.realmlist-assistant.title")}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-200 sm:text-lg">
                {t("home-us.realmlist-assistant.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 rounded-lg border border-slate-700/60 bg-slate-900/60 p-2 text-slate-300 transition hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-200"
              aria-label={t("home-us.realmlist-assistant.fab-close")}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Hint con icono */}
          <div className="flex items-start gap-3 border-b border-slate-700/50 bg-slate-950/40 px-6 py-4 sm:px-8 sm:py-5">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300/50 bg-amber-500/15 text-amber-200">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3a6 6 0 00-3 11.2V17h6v-2.8A6 6 0 0012 3zM10 21h4M11 17h2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              {t("home-us.realmlist-assistant.hint")}
            </p>
          </div>

          {/* Lista de reinos */}
          <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
            {realms.map((realm, index) => (
              <li
                key={realm.id}
                className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-400/50 hover:shadow-[0_10px_30px_rgba(8,145,178,0.25)]"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300/80 via-sky-400/60 to-transparent" />
                <div className="flex items-center gap-3">
                  <span className="font-gaming inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyan-300/50 bg-cyan-500/10 text-base font-bold text-cyan-100 sm:text-lg">
                    {index + 1}
                  </span>
                  <p className="font-gaming text-lg font-bold tracking-wide text-cyan-50 sm:text-xl">
                    {t(realm.title)}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                  <code className="relative min-w-0 flex-1 break-all rounded-lg border border-cyan-500/30 bg-slate-950/80 px-4 py-3.5 font-mono text-base leading-relaxed text-emerald-200 shadow-inner shadow-black/40 sm:text-lg">
                    <span className="mr-2 select-none text-cyan-400/70">›</span>
                    {realm.realmlist}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(realm.realmlist, realm.id)}
                    className={`shrink-0 rounded-lg border px-5 py-3 text-base font-bold uppercase tracking-wider shadow-md transition sm:text-lg ${
                      copiedId === realm.id
                        ? "border-emerald-300/70 bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-emerald-500/30"
                        : "border-cyan-300/60 bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-cyan-500/30 hover:from-cyan-300 hover:to-sky-500"
                    }`}
                    aria-label={
                      copiedId === realm.id
                        ? t("vdp-server.header.btn.copy")
                        : t("vdp-server.header.btn.realmlist")
                    }
                  >
                    <span className="flex items-center justify-center gap-2">
                      {copiedId === realm.id ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      )}
                      {copiedId === realm.id
                        ? t("vdp-server.header.btn.copy")
                        : t("vdp-server.header.btn.realmlist")}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="border-t border-cyan-400/25 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent p-5 sm:p-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-gaming w-full rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-3.5 text-base font-bold uppercase tracking-[0.18em] text-slate-200 transition hover:border-cyan-300/60 hover:bg-slate-700/70 hover:text-white sm:text-lg"
            >
              {t("home-us.realmlist-assistant.dismiss")}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`font-gaming group relative inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-base font-bold uppercase tracking-[0.18em] text-white shadow-[0_8px_28px_rgba(6,182,212,0.55)] transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 sm:text-lg ${
          isOpen
            ? "border-slate-500/60 bg-gradient-to-br from-slate-700 to-slate-900"
            : "border-cyan-300/60 bg-gradient-to-br from-cyan-500 to-blue-600 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        }`}
        aria-label={
          isOpen
            ? t("home-us.realmlist-assistant.fab-close")
            : t("home-us.realmlist-assistant.fab-open")
        }
      >
        {isOpen ? (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span
            className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(165,243,252,0.9)]"
            aria-hidden
          />
        )}
        <span>{t("home-us.realmlist-assistant.badge")}</span>
      </button>
    </div>
  );
};

export default RealmlistAssistantWidget;
