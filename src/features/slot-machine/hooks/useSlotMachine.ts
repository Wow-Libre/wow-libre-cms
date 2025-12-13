import { useState, useEffect } from "react";
import { MachineDto } from "@/model/model";
import { SlotItem, ExchangeType } from "../types";
import {
  SLOT_OPTIONS,
  WINNING_SYMBOLS,
  SPIN_COST,
  SPIN_DURATION,
  SPIN_INTERVAL,
  EXCHANGE_RATES,
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

export const useSlotMachine = ({
  serverId,
  characterId,
  accountId,
  token,
  language,
}: UseSlotMachineProps) => {
  const [slots, setSlots] = useState<SlotItem[]>(["⚔️", "⚔️", "⚔️"]);
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

  // Audio states
  const [audio] = useState(new Audio("/sound/slot.mp3"));
  const [winAudio] = useState(new Audio("/sound/slot_win.mp3"));
  const [lossAudio] = useState(new Audio("/sound/slot_loss.mp3"));

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const coins = await getPoints(token, accountId, serverId);
        setBalance(coins.coins);
        console.log("Saldo inicial:", coins.coins);
      } catch (error) {
        console.error("Error al obtener el saldo:", error);
      }
    };

    fetchBalance();
  }, [token, serverId, accountId]);

  const getRandomSlot = (): SlotItem =>
    SLOT_OPTIONS[Math.floor(Math.random() * SLOT_OPTIONS.length)];

  const calculateResult = async () => {
    try {
      const result: MachineDto = await claimMachine(
        serverId,
        accountId,
        characterId,
        token,
        language
      );

      if (result.winner) {
        const winningSymbol =
          WINNING_SYMBOLS[Math.floor(Math.random() * WINNING_SYMBOLS.length)];

        setSlots([winningSymbol, winningSymbol, winningSymbol]);
        setResult("🎉 ¡Has ganado! 🎉");
        setModalData(result);
        setShowModal(true);
        winAudio.play();
      } else {
        let slot1 = getRandomSlot();
        let slot2 = getRandomSlot();
        let slot3 = getRandomSlot();

        while (slot1 === slot2 && slot2 === slot3) {
          slot3 = getRandomSlot();
        }

        setSlots([slot1, slot2, slot3]);
        setResult("😢 ¡Mejor suerte la próxima vez!");
        setShowModal(false);
        lossAudio.play();
      }
    } catch (error) {
      console.error("Error al calcular el resultado:", error);
      setResult(
        "⚠️ Hubo un error al determinar el resultado. Intenta de nuevo más tarde."
      );
    } finally {
      setIsToggled(false);
    }
  };

  const spin = async () => {
    if (isSpinning || balance < SPIN_COST) return;

    setIsSpinning(true);
    setResult(null);
    setBalance((prev) => prev - SPIN_COST);
    audio.play();

    let spins = 0;
    const spinInterval = setInterval(async () => {
      setSlots([getRandomSlot(), getRandomSlot(), getRandomSlot()]);
      spins += SPIN_INTERVAL;
      if (spins >= SPIN_DURATION) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        await calculateResult();
      }
    }, SPIN_INTERVAL);
  };

  const handleToggleChange = () => {
    if (!isSpinning && balance >= SPIN_COST) {
      setIsToggled(true);
      spin();
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
    type: ExchangeType
  ): number => {
    switch (type) {
      case "voting":
        return amount; // $10 de puntos de votación = 10 créditos (1:1)
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
      // Convertir el tipo de intercambio al formato de la API
      const apiType = mapExchangeTypeToApiType(exchangeType);

      // Calcular los créditos que se recibirán después de la conversión
      const creditsToReceive = calculateExchangeResult(amount, exchangeType);

      // Llamar al endpoint para realizar el intercambio
      // Enviamos los créditos calculados, el backend se encarga de deducir la cantidad correspondiente
      await changePoints(
        serverId,
        accountId,
        characterId,
        token,
        creditsToReceive,
        apiType
      );

      // Recargar el balance después del intercambio exitoso
      const coins = await getPoints(token, accountId, serverId);
      setBalance(coins.coins);

      closeExchangeModal();

      // Mostrar mensaje de éxito
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
          "Error al realizar el intercambio. Por favor intenta de nuevo."
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
    // State
    slots,
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
    // Actions
    handleToggleChange,
    closeModal,
    closeExchangeModal,
    handleExchange,
    handleExchangeTypeChange,
    handleExchangeAmountChange,
    setShowExchangeModal,
    // Utils
    calculateExchangeResult,
    canSpin: !isSpinning && balance >= SPIN_COST,
  };
};
