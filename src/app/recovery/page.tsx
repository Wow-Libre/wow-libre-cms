"use client";

import {
  recoverPassword,
  validateRecoverPassword,
} from "@/api/account/security";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const OTP_LENGTH = 5;
const PRIMARY_CTA =
  "inline-flex min-h-[5.6rem] w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 text-[1.7rem] font-bold text-slate-950 shadow-[0_12px_28px_-10px_rgba(34,211,238,0.4)] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none";
const SECONDARY_CTA =
  "inline-flex min-h-[5.2rem] w-full items-center justify-center rounded-xl border border-cyan-500/20 bg-transparent px-6 text-[1.5rem] font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-slate-900/60 hover:text-white";

type RecoveryStep = "email" | "code" | "done";

const RecoveryReveal = ({
  delayMs = 0,
  className,
  children,
}: {
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 ${className ?? ""}`}
    style={{ animationDelay: `${delayMs}ms` }}
  >
    {children}
  </div>
);

const ChangePassword = () => {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUserContext();
  const language = user.language;

  const focusOtp = (index: number) => {
    otpRefs.current[index]?.focus();
    otpRefs.current[index]?.select();
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await recoverPassword(email);
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("code");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("reset-password.section-one.error-send-message"),
      );
    } finally {
      setLoading(false);
    }
  };

  const applyOtpValue = (raw: string) => {
    const chars = raw
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, OTP_LENGTH)
      .split("");
    const next = Array(OTP_LENGTH).fill("");
    chars.forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    const nextEmpty = next.findIndex((cell) => !cell);
    focusOtp(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      applyOtpValue(value);
      return;
    }
    const char = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    if (char && index < OTP_LENGTH - 1) focusOtp(index + 1);
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      e.preventDefault();
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      focusOtp(index - 1);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    applyOtpValue(e.clipboardData.getData("text"));
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const otpCode = otp.join("");

    try {
      await validateRecoverPassword(email, otpCode, language);
      setStep("done");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("reset-password.section-two.error-code"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    setLoading(false);
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(""));
    setStep("email");
  };

  const steps = [
    t("reset-password.steps.one"),
    t("reset-password.steps.two"),
    t("reset-password.steps.three"),
  ];
  const activeIndex = step === "email" ? 0 : step === "code" ? 1 : 2;

  return (
    <div className="relative min-h-screen overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />

      <div className="contenedor relative z-30 mb-6">
        <NavbarAuthenticated />
      </div>

      <div className="relative z-10">
        <div className="mx-auto w-full max-w-[52rem] px-6 py-12 md:py-20">
          <RecoveryReveal delayMs={80}>
            <article className="premium-manage-card relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-slate-950/95 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.85)]">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
                aria-hidden
              />

              <div className="relative px-8 pb-10 pt-10 sm:px-12 sm:pb-12 sm:pt-12">
                <div className="mb-9 flex gap-3" aria-hidden>
                  {[0, 1, 2].map((index) => (
                    <span
                      key={index}
                      className={`h-1 flex-1 rounded-full ${
                        index <= activeIndex ? "bg-cyan-400" : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[1.3rem] font-semibold uppercase tracking-[0.22em] text-cyan-300/85">
                  {t("reset-password.kicker")}
                </p>
                <h1 className="mt-3 text-[2.8rem] font-semibold leading-tight tracking-tight text-white sm:text-[3.4rem]">
                  {step === "email"
                    ? t("reset-password.section-one.title")
                    : step === "code"
                      ? t("reset-password.section-two.title")
                      : t("reset-password.section-two.title-success")}
                </h1>
                <p className="mt-4 text-[1.6rem] leading-relaxed text-slate-300">
                  {step === "email"
                    ? t("reset-password.section-one.sub-title")
                    : step === "code"
                      ? t("reset-password.section-two.sub-title")
                      : t("reset-password.section-two.success-message")}
                </p>

                {step === "email" && (
                  <form onSubmit={handleSubmitEmail} className="mt-10 space-y-8">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-3 block text-[1.5rem] font-semibold text-slate-200"
                      >
                        {t("reset-password.section-one.var-mail")}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-cyan-300/80">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t(
                            "reset-password.section-one.var-mail-placeholder",
                          )}
                          className="w-full rounded-xl border border-cyan-500/20 bg-slate-900/90 py-5 pl-14 pr-5 text-[1.7rem] text-white placeholder-slate-500 shadow-inner transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <p
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[1.45rem] text-rose-100"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}

                    <button type="submit" className={PRIMARY_CTA} disabled={loading}>
                      {loading
                        ? t("reset-password.section-one.btn.send")
                        : t("reset-password.section-one.btn.txt")}
                    </button>
                  </form>
                )}

                {step === "code" && (
                  <form onSubmit={handleOtpSubmit} className="mt-10 space-y-8">
                    <p className="rounded-xl border border-cyan-500/15 bg-black/30 px-5 py-4 text-[1.5rem] leading-relaxed text-slate-200">
                      {t("reset-password.section-two.code-sent-to", { email })}
                    </p>
                    <p className="text-[1.4rem] text-slate-400">
                      {t("reset-password.section-two.disclaimer")}
                    </p>

                    <div className="flex justify-center gap-3 pt-1">
                      {otp.map((value, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
                          maxLength={1}
                          inputMode="text"
                          autoComplete="one-time-code"
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          className={`h-[6.2rem] w-[5rem] rounded-xl border bg-slate-900/90 text-center text-[2.2rem] font-semibold tabular-nums text-white shadow-inner transition focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 sm:h-[6.8rem] sm:w-[5.6rem] ${
                            value
                              ? "border-cyan-400/50 bg-cyan-500/10"
                              : "border-cyan-500/20"
                          }`}
                          aria-label={t("reset-password.section-two.code-digit", {
                            n: index + 1,
                          })}
                        />
                      ))}
                    </div>

                    {error && (
                      <p
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[1.45rem] text-rose-100"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className={PRIMARY_CTA}
                      disabled={loading || otp.some((cell) => !cell)}
                    >
                      {loading
                        ? t("reset-password.section-two.btn.send")
                        : t("reset-password.section-two.btn.txt")}
                    </button>
                    <button
                      type="button"
                      onClick={handleBackClick}
                      className={SECONDARY_CTA}
                    >
                      {t("reset-password.section-two.btn.return")}
                    </button>
                  </form>
                )}

                {step === "done" && (
                  <div className="mt-10 space-y-8">
                    <p className="rounded-xl border border-cyan-500/15 bg-black/30 px-5 py-5 text-[1.6rem] leading-relaxed text-slate-200">
                      {t("reset-password.section-two.done-hint")}
                    </p>
                    <button
                      type="button"
                      className={PRIMARY_CTA}
                      onClick={() => router.push("/login")}
                    >
                      {t("reset-password.back-to-login")}
                    </button>
                    <Link
                      href="/help"
                      className="block text-center text-[1.45rem] font-medium text-cyan-300/90 hover:text-cyan-200"
                    >
                      {t("reset-password.need-help")}
                    </Link>
                  </div>
                )}
              </div>

              {step !== "done" && (
                <div className="relative border-t border-cyan-500/10 bg-black/25 px-8 py-6 text-center sm:px-12">
                  <Link
                    href="/login"
                    className="text-[1.45rem] font-medium text-slate-300 transition hover:text-cyan-200"
                  >
                    {t("reset-password.back-to-login")}
                  </Link>
                </div>
              )}
            </article>
          </RecoveryReveal>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
