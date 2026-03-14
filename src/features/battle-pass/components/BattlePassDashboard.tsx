"use client";

import React, { useState } from "react";
import { DashboardLoading, DashboardSection } from "@/components/dashboard/layout";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import Swal from "sweetalert2";
import { FaCalendarPlus, FaGift, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { useBattlePassDashboard } from "../hooks/useBattlePassDashboard";
import type { BattlePassDashboardProps } from "../types";
import type { BattlePassReward, BattlePassSeason } from "../types";
import type { BattlePassRewardCreateDto, BattlePassSeasonCreateDto } from "../api/battlePassApi";

const inputClass = `${DASHBOARD_PALETTE.input} placeholder-slate-500`;
const btnPrimaryClass = `${DASHBOARD_PALETTE.btnPrimary} inline-flex items-center justify-center gap-2`;
const btnSecondaryClass = "rounded-xl border border-slate-600 bg-slate-700/80 px-4 py-2.5 font-medium text-slate-200 transition-colors hover:bg-slate-600 hover:text-white inline-flex items-center gap-2";
const btnDangerClass = `${DASHBOARD_PALETTE.btnDanger} inline-flex items-center gap-1.5`;
const btnIconClass = "rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white";
const btnIconDangerClass = "rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400";

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

  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [seasonForm, setSeasonForm] = useState<BattlePassSeasonCreateDto>({
    realm_id: realmId,
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
  const [editingReward, setEditingReward] = useState<BattlePassReward | null>(null);

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSeason(seasonForm);
      setShowSeasonForm(false);
      setSeasonForm({
        realm_id: realmId,
        name: "",
        start_date: "",
        end_date: "",
      });
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

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeasonId) return;
    try {
      await createReward({
        ...rewardForm,
        season_id: selectedSeasonId,
      });
      setShowRewardForm(false);
      setRewardForm({
        season_id: selectedSeasonId,
        level: rewards.length + 1,
        name: "",
        image_url: "",
        core_item_id: 0,
        wowhead_id: null,
      });
      Swal.fire({
        icon: "success",
        title: t("battle-pass-dashboard.reward-created"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch {
      //
    }
  };

  const handleUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    try {
      await updateReward(editingReward.id, {
        level: rewardForm.level,
        name: rewardForm.name,
        image_url: rewardForm.image_url,
        core_item_id: rewardForm.core_item_id,
        wowhead_id: rewardForm.wowhead_id,
      });
      setEditingReward(null);
      setShowRewardForm(false);
      Swal.fire({
        icon: "success",
        title: t("battle-pass-dashboard.reward-updated"),
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
    } catch {
      //
    }
  };

  const handleDeleteReward = (reward: BattlePassReward) => {
    Swal.fire({
      icon: "warning",
      title: t("battle-pass-dashboard.confirm-delete-reward"),
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      color: "white",
      background: "#0B1218",
    }).then((result) => {
      if (result.isConfirmed) deleteReward(reward.id);
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <DashboardLoading message={t("battle-pass-dashboard.loading")} />
      </div>
    );
  }

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);
  const levelsProgress = selectedSeason ? Math.min((rewards.length / 80) * 100, 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <DashboardSection title={t("battle-pass-dashboard.seasons-title")}>
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("battle-pass-dashboard.select-season")}
            </label>
            <select
              value={selectedSeasonId ?? ""}
              onChange={(e) => setSelectedSeasonId(Number(e.target.value) || null)}
              className={inputClass}
            >
              <option value="">—</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({new Date(s.start_date).toLocaleDateString()} –{" "}
                  {new Date(s.end_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowSeasonForm(true)}
            className={`${btnPrimaryClass} w-full sm:w-auto`}
          >
            <FaCalendarPlus className="h-4 w-4" />
            {t("battle-pass-dashboard.new-season")}
          </button>
        </div>

        {showSeasonForm && (
          <form
            onSubmit={handleCreateSeason}
            className="mt-6 rounded-xl border border-slate-600/60 bg-slate-800/40 p-5 shadow-inner"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                {t("battle-pass-dashboard.new-season")}
              </h3>
              <button
                type="button"
                onClick={() => setShowSeasonForm(false)}
                className={`${btnIconClass} rounded-full`}
                aria-label={t("battle-pass-dashboard.cancel")}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                  {t("battle-pass-dashboard.season-name-placeholder")}
                </label>
                <input
                  type="text"
                  placeholder={t("battle-pass-dashboard.season-name-placeholder")}
                  value={seasonForm.name}
                  onChange={(e) =>
                    setSeasonForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                    Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={seasonForm.start_date}
                    onChange={(e) =>
                      setSeasonForm((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={seasonForm.end_date}
                    onChange={(e) =>
                      setSeasonForm((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={`${btnPrimaryClass} disabled:opacity-50`}
              >
                {submitting ? "..." : t("battle-pass-dashboard.save")}
              </button>
              <button
                type="button"
                onClick={() => setShowSeasonForm(false)}
                className={btnSecondaryClass}
              >
                <FaTimes className="h-4 w-4" />
                {t("battle-pass-dashboard.cancel")}
              </button>
            </div>
          </form>
        )}
      </DashboardSection>

      <DashboardSection title={t("battle-pass-dashboard.rewards-title")}>
        {!selectedSeason ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-800/30 py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <FaGift className="h-7 w-7" />
            </div>
            <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
              {t("battle-pass-dashboard.select-season-first")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("battle-pass-dashboard.select-season")}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${DASHBOARD_PALETTE.text}`}>
                  {selectedSeason.name}
                </p>
                <p className={`mt-1 text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                  {rewards.length}/80 {t("battle-pass-dashboard.levels")}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${levelsProgress}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingReward(null);
                  setRewardForm({
                    season_id: selectedSeasonId!,
                    level: rewards.length + 1,
                    name: "",
                    image_url: "",
                    core_item_id: 0,
                    wowhead_id: null,
                  });
                  setShowRewardForm(true);
                }}
                disabled={rewards.length >= 80}
                className={`${btnPrimaryClass} shrink-0 disabled:opacity-50`}
              >
                <FaPlus className="h-4 w-4" />
                {t("battle-pass-dashboard.add-reward")}
              </button>
            </div>

            {showRewardForm && (
              <form
                onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
                className="mb-6 rounded-xl border border-slate-600/60 bg-slate-800/40 p-5 shadow-inner"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                    {editingReward
                      ? t("battle-pass-dashboard.edit-reward")
                      : t("battle-pass-dashboard.add-reward")}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRewardForm(false);
                      setEditingReward(null);
                    }}
                    className={`${btnIconClass} rounded-full`}
                    aria-label={t("battle-pass-dashboard.cancel")}
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                      {t("battle-pass-dashboard.level-placeholder")}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={80}
                      placeholder={t("battle-pass-dashboard.level-placeholder")}
                      value={rewardForm.level}
                      onChange={(e) =>
                        setRewardForm((prev) => ({
                          ...prev,
                          level: Number(e.target.value) || 1,
                        }))
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                      {t("battle-pass-dashboard.name-placeholder")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("battle-pass-dashboard.name-placeholder")}
                      value={rewardForm.name}
                      onChange={(e) =>
                        setRewardForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                      {t("battle-pass-dashboard.image-placeholder")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("battle-pass-dashboard.image-placeholder")}
                      value={rewardForm.image_url}
                      onChange={(e) =>
                        setRewardForm((prev) => ({
                          ...prev,
                          image_url: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                      {t("battle-pass-dashboard.core-item-id-placeholder")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder={t("battle-pass-dashboard.core-item-id-placeholder")}
                      value={rewardForm.core_item_id || ""}
                      onChange={(e) =>
                        setRewardForm((prev) => ({
                          ...prev,
                          core_item_id: Number(e.target.value) || 0,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                      {t("battle-pass-dashboard.wowhead-id-placeholder")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder={t("battle-pass-dashboard.wowhead-id-placeholder")}
                      value={rewardForm.wowhead_id ?? ""}
                      onChange={(e) =>
                        setRewardForm((prev) => ({
                          ...prev,
                          wowhead_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${btnPrimaryClass} disabled:opacity-50`}
                  >
                    {submitting ? "..." : t("battle-pass-dashboard.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRewardForm(false);
                      setEditingReward(null);
                    }}
                    className={btnSecondaryClass}
                  >
                    <FaTimes className="h-4 w-4" />
                    {t("battle-pass-dashboard.cancel")}
                  </button>
                </div>
              </form>
            )}

            <div className="h-[380px] min-h-0 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
              {rewards.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-800/30 py-10 text-center">
                  <FaGift className="mb-2 h-10 w-10 text-slate-500" />
                  <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
                    {t("battle-pass-dashboard.no-rewards")}
                  </p>
                </div>
              ) : (
                rewards
                  .sort((a, b) => a.level - b.level)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-600/60 bg-slate-800/50 p-3 transition-colors hover:border-slate-500/60 hover:bg-slate-800/70"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 font-mono text-sm font-bold text-amber-400 ring-1 ring-amber-500/30">
                          {r.level}
                        </span>
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-600"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-500">
                            <FaGift className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`truncate font-medium ${DASHBOARD_PALETTE.text}`}>
                            {r.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            core:{r.core_item_id}
                            {r.wowhead_id != null ? ` · wh:${r.wowhead_id}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReward(r);
                            setRewardForm({
                              season_id: r.season_id,
                              level: r.level,
                              name: r.name,
                              image_url: r.image_url,
                              core_item_id: r.core_item_id,
                              wowhead_id: r.wowhead_id,
                            });
                            setShowRewardForm(true);
                          }}
                          className={`${btnIconClass} rounded-lg`}
                          title={t("battle-pass-dashboard.edit")}
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(r)}
                          disabled={deletingId === r.id}
                          className={`${btnIconDangerClass} rounded-lg disabled:opacity-50`}
                          title={t("battle-pass-dashboard.delete")}
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </>
        )}
      </DashboardSection>
    </div>
  );
};

export default BattlePassDashboard;
