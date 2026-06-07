"use client";

import type { ArmoryEquipmentSlot } from "@/features/armory/types/armory.types";
import {
  itemIconUrl,
  resolveItemIcon,
  wowheadItemUrl,
} from "@/features/armory/utils/wowheadItems";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface EquipmentSlotProps {
  slotId: number;
  item?: ArmoryEquipmentSlot;
  labelKey: string;
}

const EquipmentSlot = ({ slotId, item, labelKey }: EquipmentSlotProps) => {
  const { t } = useTranslation();
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    if (!item?.item_id) {
      setIcon(null);
      return;
    }
    let active = true;
    resolveItemIcon(item.item_id).then((resolved) => {
      if (active) setIcon(resolved);
    });
    return () => {
      active = false;
    };
  }, [item?.item_id]);

  const title = item?.item_name || t(labelKey);

  const content = item ? (
    <motion.a
      href={wowheadItemUrl(item.item_id)}
      data-wowhead={`item=${item.item_id}`}
      title={title}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 22 }}
      className="group relative flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/35 bg-gradient-to-b from-slate-900/90 to-black/80 shadow-[0_4px_16px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] transition-shadow hover:border-cyan-400/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.25)]"
    >
      {icon ? (
        <img
          src={itemIconUrl(icon)}
          alt={item.item_name}
          className="h-10 w-10 rounded-sm object-cover drop-shadow-md"
        />
      ) : (
        <span className="text-[10px] font-bold text-amber-200/70">?</span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition group-hover:opacity-100 bg-gradient-to-t from-cyan-500/10 to-transparent" />
    </motion.a>
  ) : (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-slate-600/40 bg-black/25 shadow-inner"
      title={t(labelKey)}
    >
      <span className="text-[9px] uppercase tracking-wider text-slate-500">
        {slotId}
      </span>
    </div>
  );

  return content;
};

export default EquipmentSlot;
