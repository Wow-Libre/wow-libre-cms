import React from "react";
import { SlotMachineSlotsProps } from "../types";

export const SlotMachineSlots: React.FC<SlotMachineSlotsProps> = ({
  slots,
}) => {
  return (
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
  );
};
