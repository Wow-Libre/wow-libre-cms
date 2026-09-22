"use client";

import React, { useMemo } from "react";
import { DashboardLoading } from "@/components/dashboard/layout";
import { DashboardSection } from "@/components/dashboard/layout";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import { TeleportDashboardProps } from "../types";
import { useTeleportDashboard } from "../hooks/useTeleportDashboard";
import TeleportForm from "./TeleportForm";
import TeleportCard from "./TeleportCard";

const PAGE_SIZE = 4;

function StatsTile({
  label,
  value,
  iconClass,
  wellClass,
  icon,
}: {
  label: string;
  value: number;
  iconClass: string;
  wellClass: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card} p-5 sm:p-6`}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${wellClass} ${iconClass}`}
        aria-hidden
      >
        <div className="h-6 w-6">{icon}</div>
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.textMuted}`}>
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums tracking-tight ${DASHBOARD_PALETTE.text} sm:text-4xl`}>
        {value}
      </p>
    </div>
  );
}

const TeleportDashboard: React.FC<TeleportDashboardProps> = ({
  token,
  realmId,
  t,
}) => {
  const {
    loading,
    submitting,
    deleting,
    teleports,
    form,
    errors,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useTeleportDashboard({ token, realmId, t });

  const [currentPage, setCurrentPage] = React.useState(0);

  const stats = useMemo(() => {
    const total = teleports.length;
    const all = teleports.filter((tp) => tp.faction === "ALL").length;
    const horde = teleports.filter((tp) => tp.faction === "HORDE").length;
    const alliance = teleports.filter((tp) => tp.faction === "ALLIANCE").length;
    return { total, all, horde, alliance };
  }, [teleports]);

  const pageCount = Math.max(1, Math.ceil(teleports.length / PAGE_SIZE));

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  const visibleTeleports = useMemo(
    () => teleports.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [teleports, currentPage],
  );

  const rangeStart = teleports.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((currentPage + 1) * PAGE_SIZE, teleports.length);
  const hasMore = currentPage < pageCount - 1;
  const hasPrev = currentPage > 0;

  const goToPage = (page: number) => {
    if (page < 0 || page >= pageCount) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" aria-busy>
        <DashboardLoading message={t("teleport-dashboard.loading") || "Cargando portales..."} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="w-full shrink-0 xl:sticky xl:top-6 xl:max-w-[60rem]">
        <TeleportForm
          form={form}
          errors={errors}
          submitting={submitting}
          token={token}
          onChange={handleChange}
          onSubmit={handleSubmit}
          t={t}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatsTile
            label={t("teleport-dashboard.stats.total")}
            value={stats.total}
            iconClass="text-[#0071e3]"
            wellClass="bg-[#0071e3]/10"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatsTile
            label={t("teleport-dashboard.form-teleport.faction.select-neutral")}
            value={stats.all}
            iconClass="text-[#6e6e73]"
            wellClass="bg-[#f5f5f7]"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />
          <StatsTile
            label={t("teleport-dashboard.form-teleport.faction.select-horde")}
            value={stats.horde}
            iconClass="text-[#ff3b30]"
            wellClass="bg-[#ff3b30]/10"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
          <StatsTile
            label={t("teleport-dashboard.form-teleport.faction.select-alliance")}
            value={stats.alliance}
            iconClass="text-[#0071e3]"
            wellClass="bg-[#0071e3]/10"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        <DashboardSection
          title={t("teleport-dashboard.teleports-list.title")}
          description={t("teleport-dashboard.teleports-list.panel-description")}
        >
          {teleports.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-[#f5f5f7] py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0071e3] shadow-sm ring-1 ring-black/8">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className={`max-w-md text-base leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                {t("teleport-dashboard.teleports-list.empty")}
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {visibleTeleports.map((tp) => (
                  <TeleportCard
                    key={tp.id}
                    teleport={tp}
                    onDelete={handleDelete}
                    deleting={deleting === tp.id}
                    t={t}
                  />
                ))}
              </ul>

              {teleports.length > 0 && (
                <nav
                  className="mt-6 flex flex-col gap-4 border-t border-black/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between"
                  aria-label={t("teleport-dashboard.teleports-list.pagination.aria")}
                >
                  <div className={`text-sm leading-relaxed ${DASHBOARD_PALETTE.textMuted} sm:text-base`}>
                    <p>
                      {t("teleport-dashboard.teleports-list.pagination.range", {
                        start: rangeStart,
                        end: rangeEnd,
                        total: teleports.length,
                      })}
                    </p>
                    <p className="mt-0.5">
                      {t("teleport-dashboard.teleports-list.pagination.page", {
                        current: currentPage + 1,
                        total: pageCount,
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <PaginationButton
                      onClick={() => goToPage(0)}
                      disabled={!hasPrev}
                      ariaLabel={t("teleport-dashboard.teleports-list.pagination.first")}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </PaginationButton>
                    <PaginationButton
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={!hasPrev}
                      ariaLabel={t("teleport-dashboard.teleports-list.pagination.prev")}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </PaginationButton>
                    <PaginationCurrent current={currentPage + 1} total={pageCount} t={t} />
                    <PaginationButton
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={!hasMore}
                      ariaLabel={t("teleport-dashboard.teleports-list.pagination.next")}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </PaginationButton>
                    <PaginationButton
                      onClick={() => goToPage(pageCount - 1)}
                      disabled={!hasMore}
                      ariaLabel={t("teleport-dashboard.teleports-list.pagination.last")}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </PaginationButton>
                  </div>
                </nav>
              )}
            </>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

function PaginationButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#1d1d1f] transition hover:bg-[#f5f5f7] hover:text-[#0071e3] disabled:cursor-not-allowed disabled:opacity-35 sm:h-11 sm:w-11"
    >
      {children}
    </button>
  );
}

function PaginationCurrent({ current, total, t }: { current: number; total: number; t: (k: string) => string }) {
  const hasMultiple = total > 1;
  return (
    <span className="mx-1 inline-flex h-10 min-w-[3.25rem] items-center justify-center rounded-full bg-[#0071e3] px-3 text-sm font-semibold text-white dashboard-on-accent sm:h-11">
      <span aria-current="page" aria-label={`${current} / ${total}`}>
        {hasMultiple ? `${current} / ${total}` : current}
      </span>
      <span className="sr-only">{t("teleport-dashboard.teleports-list.pagination.aria")}</span>
    </span>
  );
}

export default TeleportDashboard;
