/** WoW paper-doll slot layout (0–18), matching Trinity/AzerothCore equipment slots. */
export const EQUIPMENT_SLOT_LEFT = [0, 1, 2, 14, 4, 3, 8, 9] as const;
export const EQUIPMENT_SLOT_RIGHT = [5, 6, 7, 10, 11, 12, 13, 18] as const;
export const EQUIPMENT_SLOT_BOTTOM = [15, 16, 17] as const;

export const CLASS_COLORS: Record<number, string> = {
  1: "#C79C6E",
  2: "#F58CBA",
  3: "#ABD473",
  4: "#FFF569",
  5: "#FFFFFF",
  6: "#C41F3B",
  7: "#0070DE",
  8: "#69CCF0",
  9: "#9482C9",
  10: "#00FF96",
  11: "#FF7D0A",
};

export const WOW_CLASSES = [
  { id: 1, name: "Warrior" },
  { id: 2, name: "Paladin" },
  { id: 3, name: "Hunter" },
  { id: 4, name: "Rogue" },
  { id: 5, name: "Priest" },
  { id: 6, name: "Death Knight" },
  { id: 7, name: "Shaman" },
  { id: 8, name: "Mage" },
  { id: 9, name: "Warlock" },
  { id: 10, name: "Monk" },
  { id: 11, name: "Druid" },
] as const;

export const WOW_RACES = [
  { id: 1, name: "Human" },
  { id: 2, name: "Orc" },
  { id: 3, name: "Dwarf" },
  { id: 4, name: "Night Elf" },
  { id: 5, name: "Undead" },
  { id: 6, name: "Tauren" },
  { id: 7, name: "Gnome" },
  { id: 8, name: "Troll" },
  { id: 10, name: "Blood Elf" },
  { id: 11, name: "Draenei" },
] as const;

export const SLOT_LABEL_KEYS: Record<number, string> = {
  0: "armory.slots.head",
  1: "armory.slots.neck",
  2: "armory.slots.shoulder",
  3: "armory.slots.shirt",
  4: "armory.slots.chest",
  5: "armory.slots.waist",
  6: "armory.slots.legs",
  7: "armory.slots.feet",
  8: "armory.slots.wrist",
  9: "armory.slots.hands",
  10: "armory.slots.finger",
  11: "armory.slots.finger",
  12: "armory.slots.trinket",
  13: "armory.slots.trinket",
  14: "armory.slots.back",
  15: "armory.slots.mainHand",
  16: "armory.slots.offHand",
  17: "armory.slots.ranged",
  18: "armory.slots.tabard",
};
