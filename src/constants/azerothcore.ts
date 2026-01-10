export type Faction = "ALLIANCE" | "HORDE" | "UNKNOWN";

export const getFactionByRaceId = (raceId: number): Faction => {
  // AzerothCore (3.3.5a) default races.
  const allianceRaces = new Set([1, 3, 4, 7, 11]);
  const hordeRaces = new Set([2, 5, 6, 8, 10]);

  if (allianceRaces.has(raceId)) return "ALLIANCE";
  if (hordeRaces.has(raceId)) return "HORDE";
  return "UNKNOWN";
};

export const getRaceNameById = (raceId: number): string => {
  const races: Record<number, string> = {
    1: "Humano",
    2: "Orco",
    3: "Enano",
    4: "Elfo de la noche",
    5: "No-muerto",
    6: "Tauren",
    7: "Gnomo",
    8: "Trol",
    10: "Elfo de sangre",
    11: "Draenei",
  };

  return races[raceId] || `Raza ${raceId}`;
};

export const getClassNameById = (classId: number): string => {
  const classes: Record<number, string> = {
    1: "Guerrero",
    2: "Paladin",
    3: "Cazador",
    4: "Picaro",
    5: "Sacerdote",
    6: "Caballero de la muerte",
    7: "Chaman",
    8: "Mago",
    9: "Brujo",
    11: "Druida",
  };

  return classes[classId] || `Clase ${classId}`;
};

