"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCheck } from "react-icons/fa";

const WOW_EMBLEM_URL =
  "https://static.wixstatic.com/media/5dd8a0_87f6b8f5c91343c3823fd351dcc8798d~mv2.webp";

export interface GamingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonText?: string;
  onConfirm?: () => void;
  showCloseButton?: boolean;
  kicker?: string;
  highlight?: string;
  steps?: string[];
}

function StepIcon() {
  return (
    <svg
      className="h-6 w-6 text-cyan-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

const GamingModal: React.FC<GamingModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "Continuar",
  onConfirm,
  showCloseButton = false,
  kicker,
  highlight,
  steps = [],
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="relative z-10 mx-auto w-full max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gaming-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13] shadow-2xl shadow-black/50">
          <div
            className="h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500"
            aria-hidden
          />

          <div className="relative px-6 pb-2 pt-7 sm:px-8 sm:pt-8">
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white sm:right-5 sm:top-5"
                aria-label="Cerrar"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : null}

            <div className="flex items-start gap-4 pr-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 sm:h-14 sm:w-14">
                <StepIcon />
              </div>
              <div className="min-w-0 flex-1">
                {kicker ? (
                  <p className="font-gaming-alt mb-2 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                    {kicker}
                  </p>
                ) : null}
                <h2
                  id="gaming-modal-title"
                  className="font-gaming text-3xl font-semibold leading-tight tracking-wide text-white sm:text-[2rem]"
                >
                  {title}
                </h2>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-6 py-5 sm:px-8 sm:py-6">
            <p className="font-gaming-alt text-lg leading-relaxed text-slate-300 sm:text-xl">
              {description}
            </p>

            {highlight ? (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/40 px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="font-gaming-alt text-base font-medium leading-relaxed text-cyan-100/95 sm:text-lg">
                  {highlight}
                </p>
              </div>
            ) : null}

            {steps.length > 0 ? (
              <ul className="space-y-2.5 rounded-xl border border-white/8 bg-[#0d1118]/90 p-4 sm:p-5">
                {steps.map((step, index) => (
                  <li
                    key={`welcome-step-${index}`}
                    className="flex gap-3 text-base leading-snug text-slate-200 sm:text-lg"
                  >
                    <span className="font-gaming mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/8 text-sm font-semibold text-cyan-300">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex justify-center pt-1">
              <div className="relative">
                <img
                  src={WOW_EMBLEM_URL}
                  alt=""
                  className="h-24 w-24 rounded-xl border border-white/10 object-cover shadow-lg shadow-cyan-900/30 sm:h-28 sm:w-28"
                />
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#0b0e13]"
                  aria-hidden
                >
                  <FaCheck className="text-[10px] text-white" />
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 px-6 py-6 sm:px-8">
            <button
              type="button"
              onClick={handleConfirm}
              className="font-gaming w-full rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-4 text-lg font-semibold uppercase tracking-wide text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-sky-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-[#0b0e13] sm:text-xl"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default GamingModal;
