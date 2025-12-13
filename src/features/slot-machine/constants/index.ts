import { SlotItem } from "../types";

export const SLOT_OPTIONS: SlotItem[] = [
  "⚔️", // Espada
  "🛡️", // Escudo
  "💎", // Gema
  "🧙", // Mago
  "🐉", // Dragón
  "🏹", // Arco
  "🔥", // Fuego
];

export const WINNING_SYMBOLS: SlotItem[] = ["⚔️", "🛡️", "💎"];

export const SPIN_COST = 1; // Costo por giro
export const WIN_REWARD = 50; // Recompensa al ganar

export const SPIN_DURATION = 3000; // Duración de la animación en ms
export const SPIN_INTERVAL = 100; // Intervalo de actualización en ms

export const EXCHANGE_RATES = {
  voting: 1, // $10 de puntos de votación = 10 créditos (1:1)
  gold: 1000, // 1000 oro = 1 crédito
} as const;
