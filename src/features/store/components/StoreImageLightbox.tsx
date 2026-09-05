"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type StoreImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

export function StoreImageLightbox({ src, alt, onClose }: StoreImageLightboxProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full border border-white/15 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:text-cyan-100 sm:right-8 sm:top-8"
      >
        Cerrar
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-cyan-400/20"
      />
    </div>,
    document.body
  );
}
