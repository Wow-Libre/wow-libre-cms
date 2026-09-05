import { MachineDto } from "@/model/model";

export type SlotItem = string;

export type ExchangeType = "voting" | "gold";

export type RouletteTone = "red" | "black" | "green";

export type RouletteSegment = {
  label: string;
  kind: "win" | "lose";
  tone: RouletteTone;
};

export interface RouletteWheelProps {
  rotation: number;
  spinning: boolean;
  segments: RouletteSegment[];
  className?: string;
}

export interface SlotMachineProps {
  serverId: number;
  characterId: number;
  token: string;
  accountId: number;
  t: (key: string, options?: any) => string;
  language: string;
}

export interface WinModalProps {
  show: boolean;
  data: MachineDto | null;
  onClose: () => void;
}

export interface ExchangeModalProps {
  show: boolean;
  exchangeType: ExchangeType;
  exchangeAmount: string;
  exchangeError: string | null;
  onClose: () => void;
  onExchangeTypeChange: (type: ExchangeType) => void;
  onExchangeAmountChange: (amount: string) => void;
  onExchange: () => void;
}

export interface SlotMachineHeaderProps {
  balance: number;
}

export interface SlotMachineLeverProps {
  isSpinning: boolean;
  isToggled: boolean;
  canSpin: boolean;
  onToggle: () => void;
}

export interface SlotMachineSlotsProps {
  slots: SlotItem[];
}
