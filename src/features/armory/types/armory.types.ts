export interface ArmoryEquipmentSlot {
  slot: number;
  item_id: number;
  item_name: string;
  count: number;
  item_instance_id: number;
}

export interface ArmoryProfession {
  id: number;
  name: string;
  logo: string;
  value: number;
  max: number;
}

export interface ArmoryModelPreview {
  race_id: number;
  class_id: number;
  gender: number;
  item_ids: number[];
  equipment_cache?: string;
}

export interface ArmoryTalentGroup {
  spec: number;
  spec_name?: string;
  active: boolean;
  spells: number[];
}

export interface ArmoryAchievement {
  achievement_id: number;
  earned_date: number;
}

export interface ArmoryReputation {
  faction_id: number;
  name: string;
  standing: number;
  rank: number;
  rank_label: string;
  progress_value: number;
  progress_max: number;
}

export interface ArmoryPvpBracket {
  slot: number;
  bracket: string;
  rating: number;
  season_wins: number;
}

export interface ArmoryCharacterProfile {
  id: number;
  name: string;
  race_id: number;
  race: string;
  race_logo: string;
  class_id: number;
  class: string;
  class_logo: string;
  gender: number;
  level: number;
  xp: number;
  money: number;
  online: number;
  logout_time: number;
  total_time: number;
  total_kills: number;
  health: number;
  power1: number;
  zone: number;
  faction: "alliance" | "horde" | "neutral";
  guild_id?: number;
  guild_name?: string;
  equipment: ArmoryEquipmentSlot[];
  professions: ArmoryProfession[];
  model_preview: ArmoryModelPreview;
  active_spec: number;
  talent_groups: ArmoryTalentGroup[];
  achievement_count: number;
  achievements: ArmoryAchievement[];
  reputations: ArmoryReputation[];
  pvp_brackets: ArmoryPvpBracket[];
}

export interface ArmorySearchItem {
  id: number;
  name: string;
  level: number;
  race_id: number;
  race: string;
  class_id: number;
  class: string;
  gender: number;
  online: number;
  guild_name?: string;
  faction: string;
}

export interface ArmorySearchResponse {
  characters: ArmorySearchItem[];
  total: number;
  page: number;
  size: number;
}

export interface ArmoryAutocompleteItem {
  name: string;
  level: number;
  class: string;
}

export interface ArmorySearchFilters {
  name?: string;
  class_id?: number;
  race_id?: number;
  faction?: string;
  min_level?: number;
  max_level?: number;
  sort?: string;
  page?: number;
  size?: number;
  realm?: string;
  expansion_id?: number;
  realm_id?: number;
}
