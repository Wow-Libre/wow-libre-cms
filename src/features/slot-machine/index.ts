// Components
export { SlotMachine } from "./components/SlotMachine";
export { SlotMachineHeader } from "./components/SlotMachineHeader";
export { SlotMachineSlots } from "./components/SlotMachineSlots";
export { RouletteWheel } from "./components/RouletteWheel";
export { RoulettePlayModal } from "./components/RoulettePlayModal";
export { SlotMachineLever } from "./components/SlotMachineLever";
export { WinModal } from "./components/WinModal";
export { ExchangeModal } from "./components/ExchangeModal";
export { RechargeCard } from "./components/RechargeCard";
export { ExchangeInfo } from "./components/ExchangeInfo";

// Hooks
export { useSlotMachine } from "./hooks/useSlotMachine";

// Types
export type {
  SlotItem,
  ExchangeType,
  SlotMachineProps,
  WinModalProps,
  ExchangeModalProps,
  SlotMachineHeaderProps,
  SlotMachineLeverProps,
  SlotMachineSlotsProps,
  RouletteWheelProps,
  RouletteSegment,
} from "./types";

// API
export { getPoints, claimMachine, changePoints } from "./api/machineApi";

// Constants
export {
  SLOT_OPTIONS,
  WINNING_SYMBOLS,
  ROULETTE_SEGMENTS,
  SPIN_COST,
  WIN_REWARD,
  SPIN_DURATION,
  SPIN_INTERVAL,
  EXCHANGE_RATES,
} from "./constants";
