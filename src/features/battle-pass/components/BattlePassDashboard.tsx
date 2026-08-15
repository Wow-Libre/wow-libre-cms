"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardLoading } from "@/components/dashboard/layout";
import { DashboardSection } from "@/components/dashboard/layout";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardImageUploader } from "@/components/dashboard/image-uploader/DashboardImageUploader";
import { uploadBattlePassImage } from "@/lib/upload/battlePassImageUpload";
import { useBattlePassDashboard } from "../hooks/useBattlePassDashboard";
import type { BattlePassDashboardProps, BattlePassReward } from "../types";
import type { BattlePassRewardCreateDto } from "../api/battlePassApi";

const MAX_LEVEL = 80;

const formatDate = (iso: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const formatDateRange = (startIso: string, endIso: string): string => {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const sameYear = s.getFullYear() === e.getFullYear();
    const fmt = (d: Date, withYear: boolean) =>
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        ...(withYear ? { year: "numeric" } : {}),
      });
    return `${fmt(s, !sameYear)} – ${fmt(e, true)}`;
  } catch {
    return `${startIso} – ${endIso}`;
  }
};

const BattlePassDashboard: React.FC<BattlePassDashboardProps> = ({
  token,
  realmId,
  t,
}) => {
  const {
    loading,
    error,
    seasons,
    rewards,
    selectedSeasonId,
    setSelectedSeasonId,
    submitting,
    deletingId,
    createSeason,
    createReward,
    updateReward,
    deleteReward,
  } = useBattlePassDashboard(token, realmId);

  const [activeForm, setActiveForm] = useState<"season" | "reward" | null>(null);
  const [editingReward, setEditingReward] = useState<BattlePassReward | null>(null);
  const [seasonForm, setSeasonForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [rewardForm, setRewardForm] = useState<BattlePassRewardCreateDto>({
    season_id: selectedSeasonId ?? 0,
    level: 1,
    name: "",
    image_url: "",
    core_item_id: 0,
    wowhead_id: null,
  });

  useEffect(() => {
    setRewardForm((prev) => ({ ...prev, season_id: selectedSeasonId ?? 0 }));
  }, [selectedSeasonId]);

  // Reset forms when selected season changes
  useEffect(() => {
    setActiveForm(null);
    setEditingReward(null);
  }, [selectedSeasonId]);

  const selectedSeason = useMemo(
    () => seasons.find((s) => s.id === selectedSeasonId) ?? null,
    [seasons, selectedSeasonId],
  );

  const sortedRewards = useMemo(
    () => [...rewards].sort((a, b) => a.level - b.level),
    [rewards],
  );

  const stats = useMemo(() => {
    const levelsCovered = sortedRewards.length;
    const minLevel = sortedRewards.length > 0 ? sortedRewards[0].level : null;
    const maxLevel =
      sortedRewards.length > 0 ? sortedRewards[sortedRewards.length - 1].level : null;
    return { levelsCovered, minLevel, maxLevel };
  }, [sortedRewards]);

  const openSeasonForm = () => {
    setEditingReward(null);
    setSeasonForm({ name: "", start_date: "", end_date: "" });
    setActiveForm("season");
  };

  const openNewRewardForm = () => {
    setEditingReward(null);
    setRewardForm({
      season_id: selectedSeasonId ?? 0,
      level: sortedRewards.length > 0 ? sortedRewards[sortedRewards.length - 1].level + 1 : 1,
      name: "",
      image_url: "",
      core_item_id: 0,
      wowhead_id: null,
    });
    setActiveForm("reward");
  };

  const openEditRewardForm = (r: BattlePassReward) => {
    setEditingReward(r);
    setRewardForm({
      season_id: r.season_id,
      level: r.level,
      name: r.name,
      image_url: r.image_url,
      core_item_id: r.core_item_id,
      wowhead_id: r.wowhead_id,
    });
    setActiveForm("reward");
  };

  const closeForm = () => {
    setActiveForm(null);
    setEditingReward(null);
  };

  const handleCreateSeason = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createSeason({
        realm_id: realmId,
        name: seasonForm.name.trim(),
        start_date: seasonForm.start_date,
        end_date: seasonForm.end_date,
      });
      closeForm();
      Swal.fire({
        icon: "success",
        title: t("battle-pass-dashboard.season-created"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch {
      // error already set in hook
    }
  };

  const handleSubmitReward = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSeasonId) return;
    try {
      if (editingReward) {
        await updateReward(editingReward.id, {
          level: rewardForm.level,
          name: rewardForm.name.trim(),
          image_url: rewardForm.image_url,
          core_item_id: rewardForm.core_item_id,
          wowhead_id: rewardForm.wowhead_id,
        });
        Swal.fire({
          icon: "success",
          title: t("battle-pass-dashboard.reward-updated"),
          color: "white",
          background: "#0B1218",
          timer: 2500,
        });
      } else {
        await createReward({
          ...rewardForm,
          season_id: selectedSeasonId,
          name: rewardForm.name.trim(),
        });
        Swal.fire({
          icon: "success",
          title: t("battle-pass-dashboard.reward-created"),
          color: "white",
          background: "#0B1218",
          timer: 2500,
        });
      }
      closeForm();
    } catch {
      // error already set in hook
    }
  };

  const handleDeleteReward = (reward: BattlePassReward) => {
    Swal.fire({
      icon: "warning",
      title: t("battle-pass-dashboard.confirm-delete-reward"),
      text: t("battle-pass-dashboard.confirm-delete-reward-text", { level: reward.level, name: reward.name }),
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: t("battle-pass-dashboard.delete"),
      cancelButtonText: t("battle-pass-dashboard.cancel"),
      color: "white",
      background: "#0B1218",
    }).then((result) => {
      if (result.isConfirmed) void deleteReward(reward.id);
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" aria-busy>
        <DashboardLoading message={t("battle-pass-dashboard.loading")} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      {/* Panel izquierdo: Temporadas + Formulario */}
      <div className="flex w-full shrink-0 flex-col gap-6 xl:sticky xl:top-6 xl:max-w-[32rem]">
        {/* Temporadas */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-800/95 via-slate-900/90 to-slate-950/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06] backdrop-blur-sm">
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
            aria-hidden
          />
          <div className="relative p-6 sm:p-7">
            <div className="flex gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/20 to-orange-700/10 shadow-inner ring-1 ring-amber-400/10"
                aria-hidden
              >
                <svg
                  className="h-9 w-9 text-amber-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 9v4l3 3"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <h2 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${DASHBOARD_PALETTE.text}`}>
                  {t("battle-pass-dashboard.seasons-title")}
                </h2>
                <p className={`mt-2 text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("battle-pass-dashboard.seasons-subtitle")}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-base text-red-300">
                {error}
              </div>
            )}

            {/* Lista de temporadas como cards seleccionables */}
            {seasons.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-8 text-center text-base text-slate-400">
                {t("battle-pass-dashboard.no-seasons")}
              </div>
            ) : (
              <ul role="radiogroup" aria-label={t("battle-pass-dashboard.seasons-title")} className="mt-5 space-y-2.5">
                {seasons.map((s) => {
                  const active = s.id === selectedSeasonId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedSeasonId(s.id)}
                        className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                          active
                            ? "border-amber-400/60 bg-gradient-to-br from-amber-500/20 to-amber-700/10 text-white shadow-md shadow-amber-950/30 ring-1 ring-amber-400/40"
                            : "border-slate-600/50 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                              active
                                ? "border-amber-400/50 bg-amber-500/25 text-amber-100"
                                : "border-slate-600/50 bg-slate-700/50 text-slate-400"
                            }`}
                          >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-lg font-semibold">{s.name}</span>
                            <span className={`mt-0.5 block truncate text-base ${active ? "text-amber-100/85" : "text-slate-400"}`}>
                              {formatDateRange(s.start_date, s.end_date)}
                            </span>
                          </span>
                        </span>
                        {s.is_active && (
                          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${
                            active
                              ? "border-emerald-400/45 bg-emerald-500/20 text-emerald-100"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" aria-hidden />
                            {t("battle-pass-dashboard.active-tag")}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <button
              type="button"
              onClick={openSeasonForm}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-lg font-semibold text-amber-200 transition hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t("battle-pass-dashboard.new-season")}
            </button>
          </div>
        </div>

        {/* Formulario (season or reward) */}
        {activeForm === "season" && (
          <form
            onSubmit={handleCreateSeason}
            className="relative overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-b from-slate-800/95 to-slate-950/95 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-amber-400/20 sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/15 text-amber-300" aria-hidden>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <h3 className={`text-2xl font-semibold ${DASHBOARD_PALETTE.text}`}>
                  {t("battle-pass-dashboard.new-season")}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-3.5 py-2 text-base text-slate-300 transition-colors hover:bg-slate-700"
                aria-label={t("battle-pass-dashboard.cancel")}
              >
                {t("battle-pass-dashboard.cancel")}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                  {t("battle-pass-dashboard.season-name")}
                </label>
                <input
                  type="text"
                  placeholder={t("battle-pass-dashboard.season-name-placeholder")}
                  value={seasonForm.name}
                  onChange={(e) => setSeasonForm((p) => ({ ...p, name: e.target.value }))}
                  className={DASHBOARD_PALETTE.input}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.start-date")}
                  </label>
                  <input
                    type="datetime-local"
                    value={seasonForm.start_date}
                    onChange={(e) => setSeasonForm((p) => ({ ...p, start_date: e.target.value }))}
                    className={DASHBOARD_PALETTE.input}
                    required
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.end-date")}
                  </label>
                  <input
                    type="datetime-local"
                    value={seasonForm.end_date}
                    onChange={(e) => setSeasonForm((p) => ({ ...p, end_date: e.target.value }))}
                    className={DASHBOARD_PALETTE.input}
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-60"
            >
              <svg className="h-6 w-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitting ? t("battle-pass-dashboard.saving") : t("battle-pass-dashboard.save")}
            </button>
          </form>
        )}

        {activeForm === "reward" && selectedSeasonId && (
          <form
            onSubmit={handleSubmitReward}
            className="relative overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-b from-slate-800/95 to-slate-950/95 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-amber-400/20 sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/15 text-amber-300" aria-hidden>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                  </svg>
                </span>
                <h3 className={`text-2xl font-semibold ${DASHBOARD_PALETTE.text}`}>
                  {editingReward ? t("battle-pass-dashboard.edit-reward") : t("battle-pass-dashboard.add-reward")}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-3.5 py-2 text-base text-slate-300 transition-colors hover:bg-slate-700"
                aria-label={t("battle-pass-dashboard.cancel")}
              >
                {t("battle-pass-dashboard.cancel")}
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.level-placeholder")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={MAX_LEVEL}
                    value={rewardForm.level}
                    onChange={(e) =>
                      setRewardForm((p) => ({ ...p, level: Number(e.target.value) || 1 }))
                    }
                    className={DASHBOARD_PALETTE.input}
                    required
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.name-placeholder")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("battle-pass-dashboard.name-placeholder")}
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm((p) => ({ ...p, name: e.target.value }))}
                    className={DASHBOARD_PALETTE.input}
                    required
                  />
                </div>
              </div>

              <div>
                <DashboardImageUploader
                  token={token}
                  value={rewardForm.image_url}
                  uploadFn={uploadBattlePassImage}
                  onChange={(url) => setRewardForm((p) => ({ ...p, image_url: url }))}
                  label={t("battle-pass-dashboard.image-label")}
                  hint={t("battle-pass-dashboard.image-hint")}
                  context="battle-pass-reward"
                  accent="amber"
                  onError={(msg) =>
                    Swal.fire({
                      title: t("battle-pass-dashboard.image-upload-error"),
                      text: msg,
                      icon: "error",
                      color: "white",
                      background: "#0B1218",
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.core-item-id-label")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder={t("battle-pass-dashboard.core-item-id-placeholder")}
                    value={rewardForm.core_item_id || ""}
                    onChange={(e) =>
                      setRewardForm((p) => ({ ...p, core_item_id: Number(e.target.value) || 0 }))
                    }
                    className={DASHBOARD_PALETTE.input}
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.wowhead-id-label")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder={t("battle-pass-dashboard.wowhead-id-placeholder")}
                    value={rewardForm.wowhead_id ?? ""}
                    onChange={(e) =>
                      setRewardForm((p) => ({
                        ...p,
                        wowhead_id: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className={DASHBOARD_PALETTE.input}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-60"
              >
                <svg className="h-6 w-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              {submitting
                ? t("battle-pass-dashboard.saving")
                : editingReward
                  ? t("battle-pass-dashboard.save")
                  : t("battle-pass-dashboard.save")}
            </button>
          </form>
        )}
      </div>

      {/* Lista de premios */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          <StatTile
            label={t("battle-pass-dashboard.stats.rewards")}
            value={stats.levelsCovered}
            iconColor="text-amber-300"
            border="border-amber-500/25"
            bg="from-amber-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
              </svg>
            }
          />
          <StatTile
            label={t("battle-pass-dashboard.stats.first-level")}
            value={stats.minLevel ?? "—"}
            iconColor="text-cyan-300"
            border="border-cyan-500/25"
            bg="from-cyan-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 15l7-7 7 7" />
              </svg>
            }
          />
          <StatTile
            label={t("battle-pass-dashboard.stats.last-level")}
            value={stats.maxLevel ?? "—"}
            iconColor="text-violet-300"
            border="border-violet-500/25"
            bg="from-violet-500/[0.10] to-slate-900/70"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 9l-7 7-7-7" />
              </svg>
            }
          />
        </div>

        <DashboardSection
          title={
            selectedSeason
              ? `${t("battle-pass-dashboard.rewards-title")} · ${selectedSeason.name}`
              : t("battle-pass-dashboard.rewards-title")
          }
          description={selectedSeason ? formatDateRange(selectedSeason.start_date, selectedSeason.end_date) : undefined}
        >
          {!selectedSeasonId ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/60">
                <svg className="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                </svg>
              </div>
              <p className={`max-w-md text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                {t("battle-pass-dashboard.select-season-first")}
              </p>
            </div>
          ) : sortedRewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/50 bg-slate-800/20 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
                <svg className="h-10 w-10 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                </svg>
              </div>
              <p className={`max-w-md text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                {t("battle-pass-dashboard.no-rewards")}
              </p>
              <button
                type="button"
                onClick={openNewRewardForm}
className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-lg font-semibold text-amber-200 transition hover:bg-amber-500/20"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t("battle-pass-dashboard.add-reward")}
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedRewards.map((r) => {
                const isEditing = editingReward?.id === r.id;
                return (
                  <li
                    key={r.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-800/90 to-slate-900/95 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg ${
                      isEditing
                        ? "border-amber-400/60 ring-amber-400/30"
                        : "border-slate-600/45 hover:border-amber-500/35"
                    }`}
                  >
                    <div
                      className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-500 to-rose-500 opacity-90"
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col gap-3 pl-4 pr-3 pt-4 pb-4 sm:pl-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-amber-500/35 bg-amber-500/15 font-mono text-xl font-bold text-amber-300 shadow-inner ring-1 ring-amber-400/20">
                          {r.level}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => openEditRewardForm(r)}
                            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-amber-500/15 hover:text-amber-200"
                            title={t("battle-pass-dashboard.edit")}
                            aria-label={t("battle-pass-dashboard.edit")}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReward(r)}
                            disabled={deletingId === r.id}
                            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50"
                            title={t("battle-pass-dashboard.delete")}
                            aria-label={t("battle-pass-dashboard.delete")}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-slate-700/40 bg-slate-950/60">
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.image_url}
                            alt={r.name}
                            className="max-h-32 w-full rounded-xl object-contain p-2"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center p-6 text-amber-300/60">
                            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                          {r.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.core_item_id > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-slate-600/50 bg-slate-800/60 px-2 py-0.5 text-sm font-medium text-slate-300">
                              <span className="text-slate-500">core</span>
                              <span className="tabular-nums text-slate-200">{r.core_item_id}</span>
                            </span>
                          )}
                          {r.wowhead_id != null && (
                            <a
                              href={`https://www.wowhead.com/item=${r.wowhead_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
                              title={t("battle-pass-dashboard.open-wowhead")}
                            >
                              <span className="text-violet-300/70">wh</span>
                              <span className="tabular-nums">{r.wowhead_id}</span>
                              <svg className="h-3 w-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEditRewardForm(r)}
className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-base font-medium text-amber-200 transition hover:bg-amber-500/20"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t("battle-pass-dashboard.edit")}
                      </button>
                    </div>
                  </li>
                );
              })}

              <li>
                <button
                  type="button"
                  onClick={openNewRewardForm}
                  disabled={sortedRewards.length >= MAX_LEVEL}
className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-600/50 bg-slate-800/20 px-4 py-10 text-lg font-medium text-slate-300 transition hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                title={
                    sortedRewards.length >= MAX_LEVEL
                      ? t("battle-pass-dashboard.max-levels-reached")
                      : t("battle-pass-dashboard.add-reward")
                  }
                >
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t("battle-pass-dashboard.add-reward")}</span>
                  <span className="text-base text-slate-500">
                    {sortedRewards.length}/{MAX_LEVEL} {t("battle-pass-dashboard.levels")}
                  </span>
                </button>
              </li>
            </ul>
          )}
        </DashboardSection>
      </div>
    </div>
  );
};

function StatTile({
  label,
  value,
  icon,
  iconColor,
  border,
  bg,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor: string;
  border: string;
  bg: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${bg} p-5 shadow-md ring-1 ring-white/[0.04] transition hover:shadow-lg sm:p-6`}
    >
      <div className={`absolute right-4 top-4 ${iconColor} opacity-40 sm:right-5 sm:top-5`} aria-hidden>
        <div className="h-9 w-9 sm:h-10 sm:w-10">{icon}</div>
      </div>
      <p className={`text-base font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted} sm:text-lg`}>
        {label}
      </p>
      <p className={`mt-3 text-4xl font-bold tabular-nums leading-none ${DASHBOARD_PALETTE.text}`}>
        {value}
      </p>
    </div>
  );
}

export default BattlePassDashboard;

