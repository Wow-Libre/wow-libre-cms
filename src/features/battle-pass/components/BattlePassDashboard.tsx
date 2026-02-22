"use client";

import React, { useState } from "react";
import { DashboardLoading, DashboardSection } from "@/components/dashboard/layout";
import Swal from "sweetalert2";
import { useBattlePassDashboard } from "../hooks/useBattlePassDashboard";
import type { BattlePassDashboardProps } from "../types";
import type { BattlePassReward, BattlePassSeason } from "../types";
import type { BattlePassRewardCreateDto, BattlePassSeasonCreateDto } from "../api/battlePassApi";

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
      <div className="flex min-h-[280px] items-center justify-center">
        <DashboardLoading message={t("battle-pass-dashboard.loading")} />
      </div>
    );
  }

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <DashboardSection title={t("battle-pass-dashboard.seasons-title")}>
        {error && (
          <p className="mb-3 rounded-lg bg-red-900/30 p-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            {t("battle-pass-dashboard.select-season")}
          </label>
          <select
            value={selectedSeasonId ?? ""}
            onChange={(e) => setSelectedSeasonId(Number(e.target.value) || null)}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
          >
            <option value="">—</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({new Date(s.start_date).toLocaleDateString()} –{" "}
                {new Date(s.end_date).toLocaleDateString()})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowSeasonForm(true)}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            {t("battle-pass-dashboard.new-season")}
          </button>
        </div>

        {showSeasonForm && (
          <form
            onSubmit={handleCreateSeason}
            className="mt-4 rounded-lg border border-gray-600 bg-gray-800/50 p-4"
          >
            <h3 className="mb-3 font-semibold text-white">
              {t("battle-pass-dashboard.new-season")}
            </h3>
            <input
              type="text"
              placeholder={t("battle-pass-dashboard.season-name-placeholder")}
              value={seasonForm.name}
              onChange={(e) =>
                setSeasonForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mb-2 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              required
            />
            <input
              type="datetime-local"
              value={seasonForm.start_date}
              onChange={(e) =>
                setSeasonForm((prev) => ({ ...prev, start_date: e.target.value }))
              }
              className="mb-2 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              required
            />
            <input
              type="datetime-local"
              value={seasonForm.end_date}
              onChange={(e) =>
                setSeasonForm((prev) => ({ ...prev, end_date: e.target.value }))
              }
              className="mb-3 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-500 disabled:opacity-50"
              >
                {submitting ? "..." : t("battle-pass-dashboard.save")}
              </button>
              <button
                type="button"
                onClick={() => setShowSeasonForm(false)}
                className="rounded bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-500"
              >
                {t("battle-pass-dashboard.cancel")}
              </button>
            </div>
          </form>
        )}
      </DashboardSection>

      <DashboardSection title={t("battle-pass-dashboard.rewards-title")}>
        {!selectedSeason ? (
          <p className="text-gray-400">
            {t("battle-pass-dashboard.select-season-first")}
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm text-gray-400">
              {t("battle-pass-dashboard.season")}: {selectedSeason.name} (
              {rewards.length}/80 {t("battle-pass-dashboard.levels")})
            </p>
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
              className="mb-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {t("battle-pass-dashboard.add-reward")}
            </button>

            {showRewardForm && (
              <form
                onSubmit={editingReward ? handleUpdateReward : handleCreateReward}
                className="mb-4 rounded-lg border border-gray-600 bg-gray-800/50 p-4"
              >
                <h3 className="mb-3 font-semibold text-white">
                  {editingReward
                    ? t("battle-pass-dashboard.edit-reward")
                    : t("battle-pass-dashboard.add-reward")}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
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
                    className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder={t("battle-pass-dashboard.name-placeholder")}
                    value={rewardForm.name}
                    onChange={(e) =>
                      setRewardForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                    required
                  />
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
                    className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                  />
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
                    className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                  />
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
                    className="rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded bg-green-600 px-3 py-1.5 text-white hover:bg-green-500 disabled:opacity-50"
                  >
                    {submitting ? "..." : t("battle-pass-dashboard.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRewardForm(false);
                      setEditingReward(null);
                    }}
                    className="rounded bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-500"
                  >
                    {t("battle-pass-dashboard.cancel")}
                  </button>
                </div>
              </form>
            )}

            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {rewards.length === 0 ? (
                <p className="text-gray-500">
                  {t("battle-pass-dashboard.no-rewards")}
                </p>
              ) : (
                rewards
                  .sort((a, b) => a.level - b.level)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded border border-gray-600 bg-gray-800/50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-400">Lv{r.level}</span>
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : null}
                        <span className="text-white">{r.name}</span>
                        <span className="text-xs text-gray-500">
                          core:{r.core_item_id}
                          {r.wowhead_id != null ? ` wh:${r.wowhead_id}` : ""}
                        </span>
                      </div>
                      <div className="flex gap-1">
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
                          className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-500"
                        >
                          {t("battle-pass-dashboard.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(r)}
                          disabled={deletingId === r.id}
                          className="rounded bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {deletingId === r.id ? "..." : t("battle-pass-dashboard.delete")}
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
