import { Teleport } from "@/model/teleport";
import { FieldConstraints } from "../types";

export const NUMERIC_FIELDS = [
  "position_x",
  "position_y",
  "position_z",
  "map",
  "orientation",
  "zone",
  "area",
] as const;

export const POSITION_FIELDS = [
  "position_x",
  "position_y",
  "position_z",
  "orientation",
] as const;

export const MAP_FIELDS = ["map", "zone", "area"] as const;

export const FIELD_CONSTRAINTS: FieldConstraints = {
  name: { maxLength: 50, required: true },
  img_url: { maxLength: 200, pattern: /^https?:\/\/.+/ },
  position_x: { min: -9000000000000, max: 9000000000000, step: 0.00000001 },
  position_y: { min: -9000000000000, max: 9000000000000, step: 0.00000001 },
  position_z: { min: -9000000000000, max: 9000000000000, step: 0.00000001 },
  orientation: { min: -9000000000000, max: 9000000000000, step: 0.00000001 },
  map: { min: 0, step: 1 },
  zone: { min: 0, step: 1 },
  area: { min: 0, step: 1 },
};

export const initialFormState: Omit<Teleport, "id"> = {
  name: "",
  position_x: 0,
  position_y: 0,
  position_z: 0,
  img_url: "",
  map: 0,
  orientation: 0,
  zone: 0,
  area: 0,
  faction: "ALL",
};
