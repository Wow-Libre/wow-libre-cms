import { useEffect, useRef, useState } from "react";
import { MachineDto } from "@/model/model";
import { ExchangeType } from "../types";
import {
  EXCHANGE_RATES,
  ROULETTE_SEGMENTS,
  SPIN_COST,
  SPIN_DURATION,
  rouletteIndicesByKind,
} from "../constants";
import { getPoints, claimMachine, changePoints } from "../api/machineApi";
import Swal from "sweetalert2";

interface UseSlotMachineProps {
  serverId: number;
  characterId: number;
  accountId: number;
  token: string;
  language: string;
}

function pickIndex(kind: "win" | "lose"): number {
  const pool = rouletteIndicesByKind(kind);
  return pool[Math.floor(Math.random() * pool.length)] ?? 0;
}

function nextRotation(current: number, index: number): number {
  const slice = 360 / ROULETTE_SEGMENTS.length;
  const targetMod = (360 - (index * slice + slice / 2)) % 360;
  const currentMod = ((current % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;
  return current + 360 * 7 + delta;
}

export const useSlotMachine = ({
  serverId,
  characterId,
  accountId,
  token,
  language,
}: UseSlotMachineProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<MachineDto | null>(null);
  const [isToggled, setIsToggled] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeType, setExchangeType] = useState<ExchangeType>("voting");
  const [exchangeAmount, setExchangeAmount] = useState<string>("");
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [audio] = useState(() =>
    typeof Audio === "undefined" ? null : new Audio("/sound/slot.mp3"),
  );
  const [winAudio] = useState(() =>
    typeof Audio === "undefined" ? null : new Audio("/sound/slot_win.mp3"),
  );
  const [lossAudio] = useState(() =>
    typeof Audio === "undefined" ? null : new Audio("/sound/slot_loss.mp3"),
  );

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const coins = await getPoints(token, accountId, serverId);
        setBalance(coins.coins);
      } catch (error) {
        console.error("Error al obtener el saldo:", error);
      }
    };

    fetchBalance();
  }, [token, serverId, accountId]);

  useEffect(() => {
    return () => {
      if (spinTimer.current) clearTimeout(spinTimer.current);
    };
  }, []);

  const spin = async () => {
    if (isSpinning || balance < SPIN_COST) return;

    setIsSpinning(true);
    setResult(null);
    setBalance((prev) => prev - SPIN_COST);
    void audio?.play();

    try {
      const outcome: MachineDto = await claimMachine(
        serverId,
        accountId,
        characterId,
        token,
        language,
      );

      const index = pickIndex(outcome.winner ? "win" : "lose");
      const next = nextRotation(rotationRef.current, index);
      rotationRef.current = next;
      setRotation(next);

      await new Promise<void>((resolve) => {
        spinTimer.current = setTimeout(resolve, SPIN_DURATION);
      });

      if (outcome.winner) {
        setModalData(outcome);
        setShowModal(true);
        setResult("La bola cayó en premio");
        void winAudio?.play();
      } else {
        const pocket = ROULETTE_SEGMENTS[index]?.label ?? "—";
        setResult(`Sin premio · casilla ${pocket}`);
        setShowModal(false);
        void lossAudio?.play();
      }
    } catch (error) {
      console.error("Error al calcular el resultado:", error);
      setResult(
        "Hubo un error al determinar el resultado. Intenta de nuevo más tarde.",
      );
    } finally {
      setIsToggled(false);
      setIsSpinning(false);
    }
  };

  const handleToggleChange = () => {
    if (!isSpinning && balance >= SPIN_COST) {
      setIsToggled(true);
      void spin();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeExchangeModal = () => {
    setShowExchangeModal(false);
    setExchangeAmount("");
    setExchangeError(null);
  };

  const calculateExchangeResult = (
    amount: number,
    type: ExchangeType,
  ): number => {
    switch (type) {
      case "voting":
        return amount;
      case "gold":
        return amount / EXCHANGE_RATES.gold;
      default:
        return 0;
    }
  };

  const mapExchangeTypeToApiType = (type: ExchangeType): "GOLD" | "VOTING" => {
    switch (type) {
      case "voting":
        return "VOTING";
      case "gold":
        return "GOLD";
      default:
        return "VOTING";
    }
  };

  const handleExchange = async () => {
    const amount = parseFloat(exchangeAmount);

    if (isNaN(amount) || amount <= 0) {
      setExchangeError("Por favor ingresa una cantidad válida");
      return;
    }

    setExchangeError(null);

    try {
      const apiType = mapExchangeTypeToApiType(exchangeType);
      const creditsToReceive = calculateExchangeResult(amount, exchangeType);

      await changePoints(
        serverId,
        accountId,
        characterId,
        token,
        creditsToReceive,
        apiType,
      );

      const coins = await getPoints(token, accountId, serverId);
      setBalance(coins.coins);

      closeExchangeModal();

      Swal.fire({
        icon: "success",
        title: "¡Intercambio exitoso!",
        text: `Has recibido ${creditsToReceive} créditos.`,
        color: "white",
        background: "#0f172a",
        confirmButtonText: "Aceptar",
        customClass: {
          confirmButton:
            "bg-blue-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
    } catch (error: any) {
      console.error("Error al realizar el intercambio:", error);
      setExchangeError(
        error?.message ||
          "Error al realizar el intercambio. Por favor intenta de nuevo.",
      );
    }
  };

  const handleExchangeTypeChange = (type: ExchangeType) => {
    setExchangeType(type);
    setExchangeAmount("");
    setExchangeError(null);
  };

  const handleExchangeAmountChange = (amount: string) => {
    setExchangeAmount(amount);
    setExchangeError(null);
  };

  return {
    isSpinning,
    result,
    balance,
    showModal,
    modalData,
    isToggled,
    showExchangeModal,
    exchangeType,
    exchangeAmount,
    exchangeError,
    rotation,
    handleToggleChange,
    closeModal,
    closeExchangeModal,
    handleExchange,
    handleExchangeTypeChange,
    handleExchangeAmountChange,
    setShowExchangeModal,
    calculateExchangeResult,
    canSpin: !isSpinning && balance >= SPIN_COST,
  };
};
