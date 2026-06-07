"use client";

import type { ArmoryModelPreview } from "@/features/armory/types/armory.types";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

declare global {
  interface Window {
    ModelViewer?: new (
      element: HTMLElement,
      options: Record<string, unknown>
    ) => { destroy?: () => void };
  }
}

interface ArmoryModelViewerProps {
  preview: ArmoryModelPreview;
}

/**
 * Phase 3 — 3D preview via ZAM Model Viewer when available.
 * Falls back gracefully when the script cannot load or item IDs are unknown.
 */
const ArmoryModelViewer = ({ preview }: ArmoryModelViewerProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading"
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !preview.item_ids?.length) {
      setStatus("fallback");
      return;
    }

    let destroyed = false;
    let viewerInstance: { destroy?: () => void } | null = null;

    const loadViewer = async () => {
      try {
        if (!window.ModelViewer) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector(
              'script[data-armory-modelviewer="true"]'
            );
            if (existing) {
              existing.addEventListener("load", () => resolve());
              return;
            }
            const script = document.createElement("script");
            script.src =
              "https://wow.zamimg.com/modelviewer/live/viewer.min.js";
            script.async = true;
            script.dataset.armoryModelviewer = "true";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("modelviewer load failed"));
            document.body.appendChild(script);
          });
        }

        if (destroyed || !window.ModelViewer || !containerRef.current) {
          setStatus("fallback");
          return;
        }

        containerRef.current.innerHTML = "";
        viewerInstance = new window.ModelViewer(containerRef.current, {
          type: 2,
          contentPath: "https://wow.zamimg.com/modelviewer/live/",
          background: "transparent",
          models: {
            type: preview.class_id,
            id: preview.race_id,
            gender: preview.gender,
          },
          items: preview.item_ids.map((id) => ({ id })),
        });
        setStatus("ready");
      } catch {
        setStatus("fallback");
      }
    };

    loadViewer();

    return () => {
      destroyed = true;
      viewerInstance?.destroy?.();
    };
  }, [preview.class_id, preview.gender, preview.item_ids, preview.race_id]);

  if (status === "fallback") {
    return (
      <p className="max-w-xs text-center text-xs text-slate-400">
        {t("armory.modelViewer.fallback")}
      </p>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <p className="mb-2 text-center text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
        {t("armory.modelViewer.title")}
      </p>
      <div
        ref={containerRef}
        className="mx-auto h-48 w-full overflow-hidden rounded-xl border border-cyan-500/20 bg-black/40"
        aria-busy={status === "loading"}
        aria-label={t("armory.modelViewer.title")}
      />
    </div>
  );
};

export default ArmoryModelViewer;
