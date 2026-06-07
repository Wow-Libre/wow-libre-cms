export type {
  ArmoryAutocompleteItem,
  ArmoryCharacterProfile,
  ArmoryEquipmentSlot,
  ArmoryProfession,
  ArmorySearchFilters,
  ArmorySearchItem,
  ArmorySearchResponse,
} from "./types/armory.types";

export {
  autocompleteArmoryCharacters,
  getArmoryProfile,
  searchArmoryCharacters,
} from "./api/armoryApi";

export { default as ArmorySearch } from "./components/ArmorySearch";
export { default as CharacterProfile } from "./components/CharacterProfile";
export { default as PaperDoll } from "./components/PaperDoll";
export { default as ArmoryCharacterDetailsPanel } from "./components/ArmoryCharacterDetailsPanel";
export { default as ArmoryTalentsPanel } from "./components/ArmoryTalentsPanel";
export { default as ArmoryAchievementsPanel } from "./components/ArmoryAchievementsPanel";
export { default as ArmoryReputationPanel } from "./components/ArmoryReputationPanel";
export { default as ArmoryPvpPanel } from "./components/ArmoryPvpPanel";

export {
  CLASS_COLORS,
  EQUIPMENT_SLOT_BOTTOM,
  EQUIPMENT_SLOT_LEFT,
  EQUIPMENT_SLOT_RIGHT,
  WOW_CLASSES,
  WOW_RACES,
} from "./constants/equipmentSlots";
