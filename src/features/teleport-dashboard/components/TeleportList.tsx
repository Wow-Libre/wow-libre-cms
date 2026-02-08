"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Teleport } from "@/model/teleport";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import TeleportCard from "./TeleportCard";

const PAGE_SIZE = 12;

interface TeleportListProps {
  teleports: Teleport[];
  deleting: number | null;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}

const TeleportList: React.FC<TeleportListProps> = ({
  teleports,
  deleting,
  onDelete,
  t,
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Al cambiar la lista: si hay menos items (borrar), cap visibleCount; si hay más (crear), reiniciar vista
  useEffect(() => {
    setVisibleCount((prev) => {
      if (teleports.length <= prev) return Math.min(prev, Math.max(PAGE_SIZE, teleports.length));
      return PAGE_SIZE;
    });
  }, [teleports.length]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, teleports.length));
  }, [teleports.length]);

  // Intersection Observer: cargar más al llegar al final del scroll
  useEffect(() => {
    if (teleports.length === 0 || visibleCount >= teleports.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) loadMore();
      },
      { root: containerRef.current, rootMargin: "100px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, teleports.length, loadMore]);

  if (teleports.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-5xl opacity-50">📍</div>
        <p className={DASHBOARD_PALETTE.textMuted}>
          {t("teleport-dashboard.teleports-list.empty")}
        </p>
      </div>
    );
  }

  const visibleTeleports = teleports.slice(0, visibleCount);
  const hasMore = visibleCount < teleports.length;

  return (
    <div
      ref={containerRef}
      className="max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-lg pr-1"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="space-y-4">
        {visibleTeleports.map((tp) => (
          <TeleportCard
            key={tp.id}
            teleport={tp}
            onDelete={onDelete}
            deleting={deleting === tp.id}
            t={t}
          />
        ))}
      </div>
      {/* Sentinel para scroll infinito */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4"
          aria-hidden
        >
          <div className={`h-8 w-8 animate-spin rounded-full border-2 ${DASHBOARD_PALETTE.spinner}`} />
        </div>
      )}
      {!hasMore && teleports.length > PAGE_SIZE && (
        <p className={`py-3 text-center text-sm ${DASHBOARD_PALETTE.textMuted}`}>
          {t("teleport-dashboard.teleports-list.all-loaded") || "Todos los teleports cargados"}
        </p>
      )}
    </div>
  );
};

export default TeleportList;
