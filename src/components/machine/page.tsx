"use client";
import React, { useState, useEffect } from "react";
import { getPoints } from "@/api/machine";
import { claimMachine } from "@/api/machine";
import { MachineDto } from "@/model/model";
import WowheadTooltip from "@/utils/wowhead";

// Tipos de símbolos
type SlotItem = string;

// Opciones temáticas de WoW
const slotOptions: SlotItem[] = [
  "⚔️", // Espada
  "🛡️", // Escudo
  "💎", // Gema
  "🧙", // Mago
  "🐉", // Dragón
  "🏹", // Arco
  "🔥", // Fuego
];

const winningSymbols = ["⚔️", "🛡️", "💎"]; // Símbolos posibles para ganar
const spinCost = 1; // Costo por giro
const winReward = 50; // Recompensa al ganar

interface MachineProps {
  serverId: number;
  characterId: number;
  token: string;
  accountId: number;
  t: (key: string, options?: any) => string;
  language: string;
}

const SlotMachine: React.FC<MachineProps> = ({
  serverId,
  characterId,
  accountId,
  token,
  t,
  language,
}) => {
  const [slots, setSlots] = useState<SlotItem[]>(["⚔️", "⚔️", "⚔️"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [audio] = useState(new Audio("/sound/slot.mp3"));
  const [winAudio] = useState(new Audio("/sound/slot_win.mp3"));
  const [lossAudio] = useState(new Audio("/sound/slot_loss.mp3"));
  const [modalData, setModalData] = useState<MachineDto | null>(null);
  const [isToggled, setIsToggled] = useState(false); // Estado del toggle
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeType, setExchangeType] = useState<'balance' | 'voting' | 'gold'>('balance');
  const [exchangeAmount, setExchangeAmount] = useState<string>('');
  const [exchangeError, setExchangeError] = useState<string | null>(null);

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
  }, [token, serverId]);

  const getRandomSlot = () =>
    slotOptions[Math.floor(Math.random() * slotOptions.length)];

  const spin = async () => {
    if (isSpinning || balance < spinCost) return;

    setIsSpinning(true);
    setResult(null);
    setBalance((prev) => prev - spinCost);
    audio.play();

    const spinDuration = 3000;
    const interval = 100;

    let spins = 0;
    const spinInterval = setInterval(async () => {
      setSlots([getRandomSlot(), getRandomSlot(), getRandomSlot()]);
      spins += interval;
      if (spins >= spinDuration) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        await calculateResult();
      }
    }, interval);
  };

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
          winningSymbols[Math.floor(Math.random() * winningSymbols.length)];

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
      setIsToggled(false); // Restablece el toggle a 'false' después de cada ejecución
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeExchangeModal = () => {
    setShowExchangeModal(false);
    setExchangeAmount('');
    setExchangeError(null);
  };

  const calculateExchangeResult = (amount: number, type: 'balance' | 'voting' | 'gold'): number => {
    switch (type) {
      case 'balance':
        return amount * 10; // $1 = 10 créditos
      case 'voting':
        return amount; // $10 de puntos de votación = 10 créditos (1:1)
      case 'gold':
        return amount / 1000; // 1000 oro = 1 crédito
      default:
        return 0;
    }
  };

  const handleExchange = async () => {
    const amount = parseFloat(exchangeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setExchangeError('Por favor ingresa una cantidad válida');
      return;
    }

    setExchangeError(null);
    
    // TODO: Implementar la llamada a la API para realizar el intercambio
    // Por ahora, solo simulamos la actualización del balance
    try {
      const credits = calculateExchangeResult(amount, exchangeType);
      
      // Aquí deberías llamar a la API para realizar el intercambio
      // await exchangeCurrency(token, accountId, serverId, exchangeType, amount);
      
      // Actualizar el balance después del intercambio exitoso
      setBalance((prev) => prev + credits);
      closeExchangeModal();
      
      // Mostrar mensaje de éxito
      alert(`¡Intercambio exitoso! Has recibido ${credits} créditos.`);
    } catch (error) {
      console.error('Error al realizar el intercambio:', error);
      setExchangeError('Error al realizar el intercambio. Por favor intenta de nuevo.');
    }
  };

  const handleToggleChange = () => {
    if (!isSpinning && balance >= spinCost) {
      setIsToggled(!isToggled);
      if (!isToggled) {
        spin(); // Ejecuta el slot si se activa
      }
    }
  };

  return (
    <div className="w-full h-full p-6 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header con saldo */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎰</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Máquina Tragamonedas
                </h1>
                <p className="text-lg text-gray-300">
                  Prueba tu suerte y gana premios increíbles
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">Saldo: ${balance}</p>
              <p className="text-sm text-gray-400">Costo por giro: $1</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Máquina tragamonedas */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Máquina de la Fortuna
            </h2>

            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {slots.map((slot, index) => (
                  <div
                    key={index}
                    className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 rounded-xl shadow-lg transition-all duration-300 text-4xl"
                  >
                    {slot}
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-300">
                    Activar:
                  </span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      onChange={handleToggleChange}
                      checked={isToggled}
                    />
                    <div className="relative w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {result && (
                <div className="text-center">
                  <p className="text-xl font-semibold text-white bg-gray-700 px-6 py-3 rounded-lg">
                    {result}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Información de compra */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">
                Recargar Créditos
              </h3>
              <p className="text-gray-300 mb-6 text-sm">
                ¿Te estás quedando sin créditos? Intercambia tus monedas ahora y continúa
                jugando.
              </p>
              <button 
                onClick={() => setShowExchangeModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Intercambiar Monedas
              </button>
            </div>

            {/* Probabilidades */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">
                Tipo de cambio
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">💰</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Saldo a créditos</p>
                      <p className="text-white font-semibold">
                        $1 = 10 créditos
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🗳️</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">
                        Puntos de votación a créditos
                      </p>
                      <p className="text-white font-semibold">
                        $10 = 10 créditos
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🪙</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Oro a créditos</p>
                      <p className="text-white font-semibold">
                        1000 oro = 1 crédito
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl text-center relative w-full max-w-lg border border-gray-700">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-white">¡Felicidades!</h2>
              </div>

              <div className="flex flex-col items-center mb-6">
                <img
                  src={modalData.logo}
                  alt={`Logo de ${modalData.name}`}
                  className="w-32 h-32 rounded-xl border-2 border-gray-600 mb-4 shadow-lg"
                />
                <a
                  className="text-xl font-semibold text-blue-400 hover:text-blue-300 mb-2 transition-colors duration-200"
                  href={`https://www.wowhead.com/item=${modalData.name}`}
                  data-game="wow"
                  data-type="item"
                  data-wh-icon-added="true"
                >
                  {modalData.name}
                </a>
                <p className="text-lg text-gray-300 mb-2">{modalData.type}</p>
                <p className="text-base text-gray-400 italic mb-4">
                  {modalData.message}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
          <WowheadTooltip />
        </div>
      )}

      {/* Modal de intercambio de monedas */}
      {showExchangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl relative w-full max-w-2xl border border-gray-700">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Intercambiar Monedas</h2>
                <button
                  onClick={closeExchangeModal}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Selector de tipo de intercambio */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Tipo de intercambio
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setExchangeType('balance');
                      setExchangeAmount('');
                      setExchangeError(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      exchangeType === 'balance'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-sm font-semibold text-white">Saldo</div>
                    <div className="text-xs text-gray-400 mt-1">$1 = 10 créditos</div>
                  </button>
                  <button
                    onClick={() => {
                      setExchangeType('voting');
                      setExchangeAmount('');
                      setExchangeError(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      exchangeType === 'voting'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">🗳️</div>
                    <div className="text-sm font-semibold text-white">Votación</div>
                    <div className="text-xs text-gray-400 mt-1">$10 = 10 créditos</div>
                  </button>
                  <button
                    onClick={() => {
                      setExchangeType('gold');
                      setExchangeAmount('');
                      setExchangeError(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      exchangeType === 'gold'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">🪙</div>
                    <div className="text-sm font-semibold text-white">Oro</div>
                    <div className="text-xs text-gray-400 mt-1">1000 oro = 1 crédito</div>
                  </button>
                </div>
              </div>

              {/* Campo de cantidad */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Cantidad a intercambiar
                </label>
                <input
                  type="number"
                  value={exchangeAmount}
                  onChange={(e) => {
                    setExchangeAmount(e.target.value);
                    setExchangeError(null);
                  }}
                  placeholder={
                    exchangeType === 'balance'
                      ? 'Cantidad en $'
                      : exchangeType === 'voting'
                      ? 'Cantidad en puntos de votación'
                      : 'Cantidad en oro'
                  }
                  className="w-full p-4 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white text-lg"
                  min="0"
                  step={exchangeType === 'gold' ? '1000' : '0.01'}
                />
                {exchangeError && (
                  <p className="text-red-400 text-sm mt-2">{exchangeError}</p>
                )}
              </div>

              {/* Resultado calculado */}
              {exchangeAmount && parseFloat(exchangeAmount) > 0 && (
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Recibirás:</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {calculateExchangeResult(parseFloat(exchangeAmount), exchangeType).toFixed(2)} créditos
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-4">
                <button
                  onClick={closeExchangeModal}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExchange}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Intercambiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotMachine;
