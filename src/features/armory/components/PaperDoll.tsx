"use client";

import EquipmentSlot from "@/features/armory/components/EquipmentSlot";
import {
  EQUIPMENT_SLOT_BOTTOM,
  EQUIPMENT_SLOT_LEFT,
  EQUIPMENT_SLOT_RIGHT,
  SLOT_LABEL_KEYS,
} from "@/features/armory/constants/equipmentSlots";
import type { ArmoryCharacterProfile } from "@/features/armory/types/armory.types";
import ArmoryModelViewer from "./ArmoryModelViewer";

interface PaperDollProps {
  profile: ArmoryCharacterProfile;
}

const PaperDoll = ({ profile }: PaperDollProps) => {
  const equipmentBySlot = new Map(
    profile.equipment.map((item) => [item.slot, item])
  );

  const renderColumn = (slots: readonly number[]) => (
    <div className="flex flex-col gap-2">
      {slots.map((slotId) => (
        <EquipmentSlot
          key={slotId}
          slotId={slotId}
          item={equipmentBySlot.get(slotId)}
          labelKey={SLOT_LABEL_KEYS[slotId] ?? "armory.slots.unknown"}
        />
      ))}
    </div>
  );

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-4 shadow-[0_0_40px_rgba(14,165,233,0.08)] backdrop-blur-sm md:p-6">
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
        {renderColumn(EQUIPMENT_SLOT_LEFT)}

        <div className="relative flex flex-col items-center gap-3 px-2">
          <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-amber-400/40 bg-gradient-to-b from-slate-800 to-black shadow-[0_0_30px_rgba(251,191,36,0.15)]">
            <img
              src={profile.race_logo}
              alt={profile.race}
              className="h-full w-full object-cover"
            />
            <img
              src={profile.class_logo}
              alt={profile.class}
              className="absolute bottom-1 right-1 h-10 w-10 rounded-full border border-black/60 bg-black/80 p-0.5"
            />
          </div>
          <ArmoryModelViewer preview={profile.model_preview} />
        </div>

        {renderColumn(EQUIPMENT_SLOT_RIGHT)}
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {EQUIPMENT_SLOT_BOTTOM.map((slotId) => (
          <EquipmentSlot
            key={slotId}
            slotId={slotId}
            item={equipmentBySlot.get(slotId)}
            labelKey={SLOT_LABEL_KEYS[slotId] ?? "armory.slots.unknown"}
          />
        ))}
      </div>
    </div>
  );
};

export default PaperDoll;
