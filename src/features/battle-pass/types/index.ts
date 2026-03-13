/** Temporada del pase de batalla (reino) */
export interface BattlePassSeason {
  id: number;
  realm_id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

/** Premio por nivel (1-80) */
export interface BattlePassReward {
  id: number;
  season_id: number;
  level: number;
  name: string;
  image_url: string;
  core_item_id: number;
  wowhead_id: number | null;
}

/** Progreso del personaje en una temporada */
export interface BattlePassProgress {
  character_level: number;
  claimed_reward_ids: number[];
}

/** Premio con estado de desbloqueo y reclamado (para la vista) */
export interface BattlePassRewardWithStatus extends BattlePassReward {
  unlocked: boolean;
  claimed: boolean;
}

export interface BattlePassViewProps {
  token: string;
  serverId: number;
  accountId: number;
  characterId: number;
  characterLevel: number;
  language: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export interface BattlePassDashboardProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}
