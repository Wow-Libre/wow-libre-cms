import { RouletteSegment, SlotItem } from "../types";

export const SLOT_OPTIONS: SlotItem[] = [
  "⚔️",
  "🛡️",
  "💎",
  "🧙",
  "🐉",
  "🏹",
  "🔥",
];

export const WINNING_SYMBOLS: SlotItem[] = ["⚔️", "🛡️", "💎"];

export const ROULETTE_SEGMENTS: RouletteSegment[] = [
  { label: "PREMIO", kind: "win", tone: "green" },
  { label: "32", kind: "lose", tone: "red" },
  { label: "15", kind: "lose", tone: "black" },
  { label: "19", kind: "lose", tone: "red" },
  { label: "4", kind: "lose", tone: "black" },
  { label: "21", kind: "lose", tone: "red" },
  { label: "2", kind: "lose", tone: "black" },
  { label: "25", kind: "lose", tone: "red" },
  { label: "17", kind: "lose", tone: "black" },
  { label: "PREMIO", kind: "win", tone: "green" },
  { label: "34", kind: "lose", tone: "red" },
  { label: "6", kind: "lose", tone: "black" },
  { label: "27", kind: "lose", tone: "red" },
  { label: "13", kind: "lose", tone: "black" },
  { label: "36", kind: "lose", tone: "red" },
  { label: "11", kind: "lose", tone: "black" },
  { label: "30", kind: "lose", tone: "red" },
  { label: "8", kind: "lose", tone: "black" },
];

export const SPIN_COST = 1;
export const WIN_REWARD = 50;

export const SPIN_DURATION = 5200;
export const SPIN_INTERVAL = 100;

export function rouletteIndicesByKind(kind: RouletteSegment["kind"]): number[] {
  return ROULETTE_SEGMENTS.flatMap((segment, index) =>
    segment.kind === kind ? [index] : [],
  );
}

export const EXCHANGE_RATES = {
  voting: 1, // $10 de puntos de votación = 10 créditos (1:1)
  gold: 1000, // 1000 oro = 1 crédito
} as const;
