import React from "react";
import { FaCircle } from "react-icons/fa";

type DisplayMoneyProps = {
  money: number;
};

const MoneyIcons: React.FC<{ color: string }> = ({ color }) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case "yellow-500":
        return "text-yellow-500";
      case "gray-500":
        return "text-gray-500";
      case "orange-500":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={`${getColorClass(color)} inline-block mr-1`}>
      <FaCircle />
    </div>
  );
};

const formatGold = (gold: number): string => {
  if (gold >= 1000000) return `${(gold / 1000000).toFixed(1)}M`;
  if (gold >= 1000) return `${(gold / 1000).toFixed(0)}k`;
  return gold.toString();
};

const DisplayMoney: React.FC<DisplayMoneyProps> = ({ money }) => {
  const goldValue = 10000;
  const silverValue = 100;

  const gold = Math.floor(money / goldValue);
  const remainingSilver = money % goldValue;
  const silver = Math.floor(remainingSilver / silverValue);
  const copper = remainingSilver % silverValue;

  return (
    <div className="text-white">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <MoneyIcons color="yellow-500" />
          <span className="ml-2 text-xl font-bold">{formatGold(gold)}</span>
        </div>
        <div className="flex items-center">
          <MoneyIcons color="gray-500" />
          <span className="ml-2 text-xl font-bold">{silver}</span>
        </div>
        <div className="flex items-center">
          <MoneyIcons color="orange-500" />
          <span className="ml-2 text-xl font-bold">{copper}</span>
        </div>
      </div>
    </div>
  );
};

export default DisplayMoney;
