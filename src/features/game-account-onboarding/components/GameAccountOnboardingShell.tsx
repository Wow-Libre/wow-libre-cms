"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import { useUserContext } from "@/context/UserContext";
import { useTranslation } from "react-i18next";

const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";

const STEPS = [
  { id: 1, key: "register.game-onboarding.step-plan" },
  { id: 2, key: "register.game-onboarding.step-realm" },
  { id: 3, key: "register.game-onboarding.step-password" },
] as const;

interface GameAccountOnboardingShellProps {
  currentStep: 1 | 2 | 3;
  titleKey: string;
  descriptionKey: string;
  children: ReactNode;
  loading?: boolean;
  maxWidthClass?: string;
}

export function GameAccountOnboardingShell({
  currentStep,
  titleKey,
  descriptionKey,
  children,
  loading = false,
  maxWidthClass = "max-w-6xl",
}: GameAccountOnboardingShellProps) {
  const { t, i18n } = useTranslation();
  const { user } = useUserContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const language = (user.language || "en").slice(0, 2).toLowerCase();
    void i18n.changeLanguage(language).finally(() => {
      setMounted(true);
    });
  }, [i18n, user.language]);

  const showCopy = mounted;
  const showContent = mounted && !loading;

  return (
    <div className="relative min-h-screen overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />
      <img
        src={REGISTER_DECORATIVE_TREANT}
        alt=""
        className="accounts-decoration-animated pointer-events-none absolute bottom-0 right-4 z-[1] hidden w-[20rem] opacity-70 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)] md:block lg:right-10 lg:w-[24rem] xl:right-16 xl:w-[28rem]"
      />
      <div className="contenedor relative z-30">
        <NavbarAuthenticated />
      </div>

      <div
        className={`relative z-10 mx-auto w-full ${maxWidthClass} px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20`}
      >
        <p className="min-h-[1.6rem] text-center text-[1.15rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          {showCopy ? t("register.game-onboarding.kicker") : "\u00a0"}
        </p>

        <ol className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((step, index) => {
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <li key={step.id} className="flex min-w-0 items-center gap-2 sm:gap-3">
                {index > 0 ? (
                  <span
                    className={`hidden h-px w-8 sm:block ${
                      done || active ? "bg-cyan-400/70" : "bg-white/15"
                    }`}
                    aria-hidden
                  />
                ) : null}
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[1.2rem] font-bold ${
                      active
                        ? "bg-cyan-500 text-slate-950"
                        : done
                          ? "bg-cyan-500/20 text-cyan-200"
                          : "border border-white/15 bg-slate-950/70 text-slate-400"
                    }`}
                  >
                    {done ? "✓" : step.id}
                  </span>
                  <span
                    className={`hidden min-w-[4rem] text-[1.3rem] font-medium sm:inline ${
                      active ? "text-white" : "text-slate-500"
                    }`}
                  >
                    {showCopy ? t(step.key) : "\u00a0"}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <header className="mx-auto mt-6 mb-7 max-w-3xl text-center">
          <h1 className="min-h-[3.4rem] text-[2.6rem] font-semibold leading-tight tracking-tight text-white sm:text-[3.2rem]">
            {showCopy ? t(titleKey) : "\u00a0"}
          </h1>
          <p className="mt-2 min-h-[2.2rem] text-[1.5rem] leading-snug text-slate-400">
            {showCopy ? t(descriptionKey) : "\u00a0"}
          </p>
        </header>

        {showContent ? (
          children
        ) : (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}

interface OnboardingActionsProps {
  onBack: () => void;
  backLabel: string;
  continueLabel: string;
  continueDisabled?: boolean;
  continueType?: "button" | "submit";
  onContinue?: () => void;
}

export function OnboardingActions({
  onBack,
  backLabel,
  continueLabel,
  continueDisabled = false,
  continueType = "button",
  onContinue,
}: OnboardingActionsProps) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl border border-white/12 bg-slate-950/60 px-6 py-3.5 text-[1.5rem] font-semibold text-slate-200 transition hover:border-white/25 hover:bg-slate-900"
      >
        {backLabel}
      </button>
      <button
        type={continueType}
        onClick={onContinue}
        disabled={continueDisabled}
        className={`rounded-xl px-8 py-3.5 text-[1.5rem] font-semibold transition ${
          continueDisabled
            ? "cursor-not-allowed bg-cyan-500/30 text-slate-400"
            : "bg-cyan-500 text-slate-950 shadow-[0_12px_28px_-12px_rgba(34,211,238,0.55)] hover:bg-cyan-400"
        }`}
      >
        {continueLabel}
      </button>
    </div>
  );
}
