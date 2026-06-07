"use client";

import EquipmentSlot from "@/features/armory/components/EquipmentSlot";
import {
  armoryGlassPanelClass,
  ArmoryShimmerOverlay,
} from "@/features/armory/components/ArmoryMotion";
import {
  EQUIPMENT_SLOT_BOTTOM,
  EQUIPMENT_SLOT_LEFT,
  EQUIPMENT_SLOT_RIGHT,
  SLOT_LABEL_KEYS,
} from "@/features/armory/constants/equipmentSlots";
import type { ArmoryCharacterProfile } from "@/features/armory/types/armory.types";
import { motion } from "framer-motion";

interface PaperDollProps {
  profile: ArmoryCharacterProfile;
  classColor?: string;
}

const slotStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
};

const slotItem = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 420, damping: 24 },
  },
};

const PaperDoll = ({ profile, classColor = "#38bdf8" }: PaperDollProps) => {
  const equipmentBySlot = new Map(
    profile.equipment.map((item) => [item.slot, item])
  );

  const renderColumn = (slots: readonly number[]) => (
    <motion.div variants={slotStagger} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
      {slots.map((slotId) => (
        <motion.div key={slotId} variants={slotItem}>
          <EquipmentSlot
            slotId={slotId}
            item={equipmentBySlot.get(slotId)}
            labelKey={SLOT_LABEL_KEYS[slotId] ?? "armory.slots.unknown"}
          />
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <div
      className={`relative p-5 md:p-8 ${armoryGlassPanelClass("border-cyan-500/15")}`}
      style={{
        boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 60px -16px ${classColor}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <ArmoryShimmerOverlay />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, ${classColor}12 0%, transparent 65%)`,
        }}
      />

      <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        {renderColumn(EQUIPMENT_SLOT_LEFT)}

        <div className="relative flex flex-col items-center px-4 py-2">
          <motion.div
            className="absolute h-48 w-48 rounded-full md:h-52 md:w-52"
            style={{ border: `1px solid ${classColor}33` }}
            animate={{ rotate: 360, scale: [1, 1.03, 1] }}
            transition={{
              rotate: { duration: 24, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.div
            className="absolute h-44 w-44 rounded-full md:h-48 md:w-48"
            style={{
              boxShadow: `0 0 40px ${classColor}33, inset 0 0 30px rgba(0,0,0,0.5)`,
            }}
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-44 w-44 overflow-hidden rounded-full border-2 bg-gradient-to-b from-slate-800 to-black md:h-48 md:w-48"
            style={{
              borderColor: `${classColor}66`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 32px ${classColor}28`,
            }}
          >
            <img
              src={profile.race_logo}
              alt={profile.race}
              className="h-full w-full object-cover"
            />
            <motion.img
              src={profile.class_logo}
              alt={profile.class}
              className="absolute bottom-2 right-2 h-11 w-11 rounded-full border-2 border-black/80 bg-black/90 p-0.5 shadow-xl"
              whileHover={{ scale: 1.1, rotate: -8 }}
            />
          </motion.div>
        </div>

        {renderColumn(EQUIPMENT_SLOT_RIGHT)}
      </div>

      <motion.div
        variants={slotStagger}
        initial="hidden"
        animate="visible"
        className="relative mt-6 flex justify-center gap-3"
      >
        {EQUIPMENT_SLOT_BOTTOM.map((slotId) => (
          <motion.div key={slotId} variants={slotItem}>
            <EquipmentSlot
              slotId={slotId}
              item={equipmentBySlot.get(slotId)}
              labelKey={SLOT_LABEL_KEYS[slotId] ?? "armory.slots.unknown"}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default PaperDoll;
