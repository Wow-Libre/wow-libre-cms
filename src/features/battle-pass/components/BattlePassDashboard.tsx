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
        color: "#1d1d1f",
        background: "#ffffff",
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
          color: "#1d1d1f",
          background: "#ffffff",
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
          color: "#1d1d1f",
          background: "#ffffff",
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
      color: "#1d1d1f",
      background: "#ffffff",
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
        <div className={`relative overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card}`}>
          <div className="absolute inset-x-0 top-0 h-0.5 bg-[#0071e3]" aria-hidden />
          <div className="relative p-6 sm:p-7">
            <div className="flex gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3]"
                aria-hidden
              >
                <svg
                  className="h-8 w-8"
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
                <p className={`mt-2 text-xl leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                  {t("battle-pass-dashboard.seasons-subtitle")}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-[#ff3b30]/25 bg-[#ff3b30]/8 px-4 py-3 text-lg text-[#ff3b30]">
                {error}
              </div>
            )}

            {/* Lista de temporadas como cards seleccionables */}
            {seasons.length === 0 ? (
              <div className={`mt-5 rounded-2xl border border-dashed border-black/10 bg-[#f5f5f7] py-8 text-center text-lg ${DASHBOARD_PALETTE.textMuted}`}>
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
                        className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-[#0071e3]/30 bg-[#0071e3]/8 text-[#1d1d1f] ring-1 ring-[#0071e3]/15"
                            : `border-black/10 bg-white ${DASHBOARD_PALETTE.text} hover:bg-[#f5f5f7]`
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-[#0071e3]/12 text-[#0071e3]"
                                : "bg-[#f5f5f7] text-[#6e6e73]"
                            }`}
                          >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-xl font-semibold">{s.name}</span>
                            <span className={`mt-0.5 block truncate text-base ${DASHBOARD_PALETTE.textMuted}`}>
                              {formatDateRange(s.start_date, s.end_date)}
                            </span>
                          </span>
                        </span>
                        {s.is_active && (
                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#34c759]/25 bg-[#34c759]/10 px-2.5 py-1 text-sm font-semibold text-[#1f8a38]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" aria-hidden />
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
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} py-3.5 text-lg`}
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
            className={`relative overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card} p-6 sm:p-7`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]" aria-hidden>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <h3 className={`text-2xl font-semibold tracking-tight ${DASHBOARD_PALETTE.text}`}>
                  {t("battle-pass-dashboard.new-season")}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className={`rounded-full border border-black/10 bg-white px-4 py-2 text-base font-medium ${DASHBOARD_PALETTE.textMuted} transition hover:bg-[#f5f5f7] hover:text-[#1d1d1f]`}
                aria-label={t("battle-pass-dashboard.cancel")}
              >
                {t("battle-pass-dashboard.cancel")}
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
                  {t("battle-pass-dashboard.season-name")}
                </label>
                <input
                  type="text"
                  placeholder={t("battle-pass-dashboard.season-name-placeholder")}
                  value={seasonForm.name}
                  onChange={(e) => setSeasonForm((p) => ({ ...p, name: e.target.value }))}
                  className={`${DASHBOARD_PALETTE.input} text-lg`}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.start-date")}
                  </label>
                  <input
                    type="datetime-local"
                    value={seasonForm.start_date}
                    onChange={(e) => setSeasonForm((p) => ({ ...p, start_date: e.target.value }))}
                    className={`${DASHBOARD_PALETTE.input} text-lg`}
                    required
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.end-date")}
                  </label>
                  <input
                    type="datetime-local"
                    value={seasonForm.end_date}
                    onChange={(e) => setSeasonForm((p) => ({ ...p, end_date: e.target.value }))}
                    className={`${DASHBOARD_PALETTE.input} text-lg`}
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} py-3.5 text-lg disabled:opacity-60`}
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
            className={`relative overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card} p-6 sm:p-7`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3]" aria-hidden>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                  </svg>
                </span>
                <h3 className={`text-2xl font-semibold tracking-tight ${DASHBOARD_PALETTE.text}`}>
                  {editingReward ? t("battle-pass-dashboard.edit-reward") : t("battle-pass-dashboard.add-reward")}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className={`rounded-full border border-black/10 bg-white px-4 py-2 text-base font-medium ${DASHBOARD_PALETTE.textMuted} transition hover:bg-[#f5f5f7] hover:text-[#1d1d1f]`}
                aria-label={t("battle-pass-dashboard.cancel")}
              >
                {t("battle-pass-dashboard.cancel")}
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
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
                    className={`${DASHBOARD_PALETTE.input} text-lg`}
                    required
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t("battle-pass-dashboard.name-placeholder")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("battle-pass-dashboard.name-placeholder")}
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm((p) => ({ ...p, name: e.target.value }))}
                    className={`${DASHBOARD_PALETTE.input} text-lg`}
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
                      color: "#1d1d1f",
                      background: "#ffffff",
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
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
                    className={`${DASHBOARD_PALETTE.input} text-lg`}
                  />
                </div>
                <div>
                  <label className={`mb-2 block text-lg font-medium ${DASHBOARD_PALETTE.label}`}>
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
                    className={`${DASHBOARD_PALETTE.input} text-lg`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} py-3.5 text-lg disabled:opacity-60`}
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
            iconClass="text-[#ff9f0a]"
            wellClass="bg-[#ff9f0a]/12"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
              </svg>
            }
          />
          <StatTile
            label={t("battle-pass-dashboard.stats.first-level")}
            value={stats.minLevel ?? "—"}
            iconClass="text-[#0071e3]"
            wellClass="bg-[#0071e3]/10"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 15l7-7 7 7" />
              </svg>
            }
          />
          <StatTile
            label={t("battle-pass-dashboard.stats.last-level")}
            value={stats.maxLevel ?? "—"}
            iconClass="text-[#af52de]"
            wellClass="bg-[#af52de]/12"
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-[#f5f5f7] py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0071e3] shadow-sm ring-1 ring-black/8">
                <svg className="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                </svg>
              </div>
              <p className={`max-w-md text-xl leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                {t("battle-pass-dashboard.select-season-first")}
              </p>
            </div>
          ) : sortedRewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-[#f5f5f7] py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#ff9f0a] shadow-sm ring-1 ring-black/8">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                </svg>
              </div>
              <p className={`max-w-md text-xl leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
                {t("battle-pass-dashboard.no-rewards")}
              </p>
              <button
                type="button"
                onClick={openNewRewardForm}
                className={`mt-4 inline-flex items-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} py-3 text-lg`}
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
                    className={`group relative overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card} transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] ${
                      isEditing ? "ring-2 ring-[#0071e3]/30" : ""
                    }`}
                  >
                    <div className="absolute left-0 top-0 h-full w-1 bg-[#0071e3]" aria-hidden />
                    <div className="relative flex h-full flex-col gap-3 pl-4 pr-3 pt-4 pb-4 sm:pl-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#0071e3]/10 font-mono text-xl font-semibold tabular-nums text-[#0071e3]">
                          {r.level}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => openEditRewardForm(r)}
                            className="rounded-full p-2 text-[#6e6e73] transition-colors hover:bg-[#0071e3]/10 hover:text-[#0071e3]"
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
                            className="rounded-full p-2 text-[#6e6e73] transition-colors hover:bg-[#ff3b30]/10 hover:text-[#ff3b30] disabled:opacity-50"
                            title={t("battle-pass-dashboard.delete")}
                            aria-label={t("battle-pass-dashboard.delete")}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex min-h-[5.5rem] items-center justify-center rounded-2xl bg-[#f5f5f7]">
                        {r.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.image_url}
                            alt={r.name}
                            className="max-h-32 w-full rounded-xl object-contain p-2"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`flex items-center justify-center p-6 ${DASHBOARD_PALETTE.textMuted}`}>
                            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4a7 7 0 1114 0H5z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-xl font-semibold ${DASHBOARD_PALETTE.text}`}>
                          {r.name}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {r.core_item_id > 0 && (
                            <span className={`inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#f5f5f7] px-2.5 py-1 text-sm font-medium ${DASHBOARD_PALETTE.textMuted}`}>
                              <span>core</span>
                              <span className={`tabular-nums ${DASHBOARD_PALETTE.text}`}>{r.core_item_id}</span>
                            </span>
                          )}
                          {r.wowhead_id != null && (
                            <a
                              href={`https://www.wowhead.com/item=${r.wowhead_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-[#af52de]/20 bg-[#af52de]/8 px-2.5 py-1 text-sm font-medium text-[#7d3caf] transition hover:bg-[#af52de]/12"
                              title={t("battle-pass-dashboard.open-wowhead")}
                            >
                              <span className="opacity-70">wh</span>
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
                        className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-2.5 text-base font-medium ${DASHBOARD_PALETTE.text} transition hover:border-[#0071e3]/30 hover:text-[#0071e3]`}
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
                  className={`flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-[#f5f5f7] px-4 py-10 text-lg font-medium ${DASHBOARD_PALETTE.textMuted} transition hover:border-[#0071e3]/35 hover:bg-[#0071e3]/5 hover:text-[#0071e3] disabled:cursor-not-allowed disabled:opacity-50`}
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
                  <span className={`text-base ${DASHBOARD_PALETTE.textMuted}`}>
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
  iconClass,
  wellClass,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconClass: string;
  wellClass: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${DASHBOARD_PALETTE.card} p-5 sm:p-6`}>
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${wellClass} ${iconClass}`} aria-hidden>
        <div className="h-6 w-6">{icon}</div>
      </div>
      <p className={`text-sm font-semibold uppercase tracking-wide ${DASHBOARD_PALETTE.textMuted}`}>
        {label}
      </p>
      <p className={`mt-2 text-4xl font-semibold tabular-nums tracking-tight ${DASHBOARD_PALETTE.text} sm:text-5xl`}>
        {value}
      </p>
    </div>
  );
}

export default BattlePassDashboard;

