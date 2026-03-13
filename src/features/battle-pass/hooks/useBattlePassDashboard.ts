import { useCallback, useEffect, useState } from "react";
import {
  adminGetSeasons,
  adminCreateSeason,
  adminUpdateSeason,
  adminGetRewards,
  adminCreateReward,
  adminUpdateReward,
  adminDeleteReward,
  type BattlePassSeasonCreateDto,
  type BattlePassRewardCreateDto,
} from "../api/battlePassApi";
import type { BattlePassSeason, BattlePassReward } from "../types";

export function useBattlePassDashboard(token: string, realmId: number) {
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<BattlePassSeason[]>([]);
  const [rewards, setRewards] = useState<BattlePassReward[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSeasons = useCallback(async () => {
    if (!token || !realmId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await adminGetSeasons(realmId, token);
      setSeasons(list);
      if (list.length > 0 && !selectedSeasonId) {
        const active =
          list.find(
            (s) =>
              new Date(s.start_date) <= new Date() &&
              new Date(s.end_date) >= new Date()
          ) ?? list[0];
        setSelectedSeasonId(active.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [token, realmId, selectedSeasonId]);

  const loadRewards = useCallback(async () => {
    if (!token || !realmId || !selectedSeasonId) {
      setRewards([]);
      return;
    }
    try {
      const list = await adminGetRewards(realmId, selectedSeasonId, token);
      setRewards(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRewards([]);
    }
  }, [token, realmId, selectedSeasonId]);

  useEffect(() => {
    loadSeasons();
  }, [loadSeasons]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const createSeason = useCallback(
    async (body: BattlePassSeasonCreateDto) => {
      setSubmitting(true);
      setError(null);
      try {
        const created = await adminCreateSeason(body, token);
        setSeasons((prev) => [...prev, created]);
        setSelectedSeasonId(created.id);
        await loadRewards();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [token, loadRewards]
  );

  const updateSeason = useCallback(
    async (seasonId: number, body: Partial<BattlePassSeasonCreateDto>) => {
      setSubmitting(true);
      setError(null);
      try {
        await adminUpdateSeason(seasonId, body, token);
        await loadSeasons();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [token, loadSeasons]
  );

  const createReward = useCallback(
    async (body: BattlePassRewardCreateDto) => {
      if (!selectedSeasonId) return;
      setSubmitting(true);
      setError(null);
      try {
        const created = await adminCreateReward(
          { ...body, season_id: selectedSeasonId },
          token
        );
        setRewards((prev) => [...prev, created].sort((a, b) => a.level - b.level));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [token, selectedSeasonId]
  );

  const updateReward = useCallback(
    async (rewardId: number, body: Partial<BattlePassRewardCreateDto>) => {
      setSubmitting(true);
      setError(null);
      try {
        await adminUpdateReward(rewardId, body, token);
        await loadRewards();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [token, loadRewards]
  );

  const deleteReward = useCallback(
    async (rewardId: number) => {
      setDeletingId(rewardId);
      setError(null);
      try {
        await adminDeleteReward(rewardId, token);
        setRewards((prev) => prev.filter((r) => r.id !== rewardId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setDeletingId(null);
      }
    },
    [token]
  );

  return {
    loading,
    error,
    seasons,
    rewards,
    selectedSeasonId,
    setSelectedSeasonId,
    submitting,
    deletingId,
    loadSeasons,
    loadRewards,
    createSeason,
    updateSeason,
    createReward,
    updateReward,
    deleteReward,
  };
}
