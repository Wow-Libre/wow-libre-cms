"use client";

import type { ArmoryEquipmentSlot } from "@/features/armory/types/armory.types";
import {
  itemIconUrl,
  resolveItemIcon,
  wowheadItemUrl,
} from "@/features/armory/utils/wowheadItems";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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
    <a
      href={wowheadItemUrl(item.item_id)}
      data-wowhead={`item=${item.item_id}`}
      className="group relative flex h-12 w-12 items-center justify-center rounded-md border border-amber-500/30 bg-black/60 shadow-inner transition hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]"
      title={title}
    >
      {icon ? (
        <img
          src={itemIconUrl(icon)}
          alt={item.item_name}
          className="h-10 w-10 rounded-sm object-cover"
        />
      ) : (
        <span className="text-[10px] font-bold text-amber-200/70">?</span>
      )}
    </a>
  ) : (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-slate-600/50 bg-black/30"
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
