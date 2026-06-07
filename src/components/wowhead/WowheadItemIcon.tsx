"use client";

import {
  itemIconUrl,
  resolveItemIcon,
  wowheadItemUrl,
} from "@/features/armory/utils/wowheadItems";
import { useEffect, useState } from "react";

type WowheadItemIconSize = "sm" | "md";

interface WowheadItemIconProps {
  itemId: number;
  itemName: string;
  size?: WowheadItemIconSize;
  className?: string;
  stopPropagation?: boolean;
}

const SIZE_CLASS: Record<WowheadItemIconSize, { box: string; img: string }> = {
  sm: { box: "h-10 w-10", img: "h-8 w-8" },
  md: { box: "h-12 w-12", img: "h-10 w-10" },
};

export default function WowheadItemIcon({
  itemId,
  itemName,
  size = "md",
  className = "",
  stopPropagation = true,
}: WowheadItemIconProps) {
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void resolveItemIcon(itemId).then((resolved) => {
      if (active) setIcon(resolved);
    });
    return () => {
      active = false;
    };
  }, [itemId]);

  const dims = SIZE_CLASS[size];

  return (
    <a
      href={wowheadItemUrl(itemId)}
      data-wowhead={`item=${itemId}`}
      target="_blank"
      rel="noopener noreferrer"
      title={itemName}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      className={`group relative flex shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-gradient-to-b from-slate-900/90 to-black/80 shadow-[0_4px_16px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] transition-shadow hover:border-cyan-400/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_20px_rgba(34,211,238,0.25)] ${dims.box} ${className}`}
    >
      {icon ? (
        <img
          src={itemIconUrl(icon)}
          alt={itemName}
          className={`${dims.img} rounded-sm object-cover drop-shadow-md`}
        />
      ) : (
        <span className="text-[10px] font-bold text-amber-200/70">?</span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 transition group-hover:opacity-100" />
    </a>
  );
}
