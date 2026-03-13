import { useCallback, useEffect, useState } from "react";
import {
  getActiveSeason,
  getProgress,
  getRewards,
  claimReward,
} from "../api/battlePassApi";
import type {
  BattlePassSeason,
  BattlePassRewardWithStatus,
} from "../types";
import type { BattlePassViewProps } from "../types";

export function useBattlePass({
  token,
  serverId,
  accountId,
  characterId,
  characterLevel,
}: Omit<BattlePassViewProps, "t" | "language">) {
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<BattlePassSeason | null>(null);
  const [rewardsWithStatus, setRewardsWithStatus] = useState<
    BattlePassRewardWithStatus[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token || !serverId || !accountId || !characterId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activeSeason = await getActiveSeason(serverId, token);
      setSeason(activeSeason ?? null);
      if (!activeSeason) {
        setRewardsWithStatus([]);
        setLoading(false);
        return;
      }
      const [rewards, progress] = await Promise.all([
        getRewards(serverId, activeSeason.id, token),
        getProgress(
          serverId,
          accountId,
          characterId,
          activeSeason.id,
          token
        ),
      ]);
      const claimedSet = new Set(progress.claimed_reward_ids);
      const withStatus: BattlePassRewardWithStatus[] = rewards.map((r) => ({
        ...r,
        unlocked: characterLevel >= r.level,
        claimed: claimedSet.has(r.id),
      }));
      setRewardsWithStatus(withStatus);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRewardsWithStatus([]);
    } finally {
      setLoading(false);
    }
  }, [
    token,
    serverId,
    accountId,
    characterId,
    characterLevel,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const handleClaim = useCallback(
    async (rewardId: number) => {
      if (!season || !token) return;
      setClaimingId(rewardId);
      try {
        await claimReward(
          serverId,
          accountId,
          characterId,
          season.id,
          rewardId,
          token
        );
        await load();
      } finally {
        setClaimingId(null);
      }
    },
    [season, token, serverId, accountId, characterId, load]
  );

  return {
    loading,
    error,
    season,
    rewardsWithStatus,
    refresh: load,
    claimReward: handleClaim,
    claimingId,
  };
}
