"use client";
import { getInterstitial } from "@/api/home";
import { Interstitial as InterstitialType } from "@/model/model";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";

const FALLBACK_COUNTDOWN_HOURS = 23;
const DEFAULT_BADGE_TEXT = "DESTACADO";

// Posiciones fijas de las partículas para que sean estables entre renders.
// Cada una tiene un retardo y duración propia vía style inline (ver Particles).
const PARTICLES = [
  { left: "12%", top: "20%", size: 6, delay: 0, duration: 4.2 },
  { left: "82%", top: "15%", size: 5, delay: 0.7, duration: 3.6 },
  { left: "20%", top: "70%", size: 4, delay: 1.4, duration: 4.8 },
  { left: "75%", top: "78%", size: 7, delay: 0.3, duration: 4.0 },
  { left: "50%", top: "12%", size: 4, delay: 2.1, duration: 5.0 },
  { left: "45%", top: "85%", size: 5, delay: 1.0, duration: 4.4 },
];

type Countdown = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function diffCountdown(target: number): Countdown {
  const totalMs = Math.max(0, target - Date.now());
  const totalSec = Math.floor(totalMs / 1000);
  return {
    totalMs,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    expired: totalMs === 0,
  };
}

function pad(n: number, width = 2) {
  return n.toString().padStart(width, "0");
}

const Interstitial = () => {
  const [interstitialData, setInterstitialData] =
    useState<InterstitialType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Timestamp objetivo para el countdown. Se decide una sola vez al montar
  // para que la cuenta regresiva no se "resetee" entre renders.
  const [countdownTarget, setCountdownTarget] = useState<number | null>(null);

  useEffect(() => {
    const fetchInterstitial = async () => {
      const token = Cookies.get("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getInterstitial(token);
        // Solo mostrar si existe y está activo
        if (data && data.active && data.url_img) {
          setInterstitialData(data);
          // Si el backend trae ends_at, úsalo; si no, fallback de 24h.
          const parsed = data.ends_at ? Date.parse(data.ends_at) : NaN;
          const target =
            Number.isFinite(parsed) && parsed > Date.now()
              ? parsed
              : Date.now() + FALLBACK_COUNTDOWN_HOURS * 60 * 60 * 1000 + 59 * 1000;
          setCountdownTarget(target);
          setIsVisible(true);
        }
      } catch {
        // No mostrar errores, simplemente no mostrar nada
      } finally {
        setLoading(false);
      }
    };

    fetchInterstitial();
  }, []);

  // Cuenta regresiva viva (cada segundo).
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!isVisible || countdownTarget === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isVisible, countdownTarget]);

  const countdown = useMemo<Countdown | null>(() => {
    if (countdownTarget === null) return null;
    return diffCountdown(countdownTarget);
  }, [countdownTarget, now]);

  // Bloquear scroll cuando el banner está visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubscribe = () => {
    if (interstitialData?.redirect_url) {
      window.open(interstitialData.redirect_url, "_blank", "noopener,noreferrer");
    }
    handleClose();
  };

  // No mostrar nada si está cargando o no hay datos
  if (loading || !interstitialData || !isVisible) {
    return null;
  }

  const badgeText = interstitialData.badge_text?.trim() || DEFAULT_BADGE_TEXT;
  const discountLabel = interstitialData.discount_label?.trim();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop oscuro con mesh-gradient animado */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.16),transparent_45%),rgba(2,6,23,0.92)] backdrop-blur-md"
        onClick={handleClose}
        style={{ animation: "fadeIn 0.4s ease-out" }}
      />

      {/* Marco externo con glow neón pulsante */}
      <div
        className="relative max-w-5xl w-full rounded-3xl animate-premium-glow"
        style={{
          animation:
            "scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1), premiumGlowPulse 3s ease-in-out 0.6s infinite",
        }}
      >
        {/* Botón cerrar: fuera del overflow-hidden para que flote sin recortarse */}
        <button
          onClick={handleClose}
          className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 z-50 p-3 rounded-full bg-slate-900/90 hover:bg-pink-600 backdrop-blur-md text-white transition-all duration-300 hover:scale-110 hover:rotate-90 border-2 border-white/20 shadow-2xl shadow-black/50"
          aria-label="Cerrar banner"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Borde animado: gradient rotando por debajo del panel */}
        <div className="rounded-3xl p-[2px] bg-gradient-to-r from-purple-500 via-pink-500 via-cyan-400 to-purple-500 bg-[length:200%_auto]">
          <div
            className="relative rounded-[calc(1.5rem-2px)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden border border-white/5"
            style={{ animation: "fadeIn 0.6s ease-out" }}
          >
            {/* Partículas flotantes (CSS-only) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
              {PARTICLES.map((p, i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-particle"
                  style={{
                    left: p.left,
                    top: p.top,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                  }}
                />
              ))}
            </div>

            {/* Imagen del banner con overlays (badge + countdown) */}
            <div className="relative w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-[400px] max-h-[75vh]">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30 pointer-events-none z-10" />
              <img
                src={interstitialData.url_img}
                alt="Oferta especial"
                className={`max-w-full max-h-[75vh] w-auto h-auto transition-all duration-1000 ease-out ${
                  imageLoaded
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 blur-sm"
                }`}
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                onError={() => handleClose()}
                style={{ objectFit: "contain", display: "block" }}
              />

              {/* Badge flotante sobre la imagen (top-left) */}
              <div
                className="absolute top-4 left-4 sm:top-5 sm:left-5 z-30 animate-badge-bounce"
                aria-label={badgeText}
              >
                <div className="animate-badge-pulse">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-pink-500/60 blur-lg" aria-hidden />
                    <span className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-extrabold uppercase tracking-widest text-white shadow-2xl shadow-pink-500/50 ring-2 ring-white/30">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.9)]" aria-hidden />
                      {badgeText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown sobre la imagen (top-right) */}
              {countdown && !countdown.expired && (
                <div
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 rounded-2xl bg-slate-950/95 px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-md ring-2 ring-purple-400/40 shadow-2xl shadow-purple-500/30"
                  style={{
                    animation:
                      "badgeBounceIn 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.6s both, countdownPulse 2s ease-in-out 1.5s infinite",
                  }}
                >
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-200/90 leading-none mb-1.5 text-center">
                    ⏱ Termina en
                  </p>
                  <div className="flex items-center justify-center gap-1 font-mono text-lg sm:text-2xl font-black tabular-nums text-white">
                    {countdown.days > 0 && (
                      <>
                        <span className="text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">{countdown.days}</span>
                        <span className="text-white/60 text-xs sm:text-sm font-bold">d</span>
                      </>
                    )}
                    <span className="text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">{pad(countdown.hours)}</span>
                    <span className="text-white/60 text-xs sm:text-sm font-bold">h</span>
                    <span className="text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">{pad(countdown.minutes)}</span>
                    <span className="text-white/60 text-xs sm:text-sm font-bold">m</span>
                    <span className="text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">{pad(countdown.seconds)}</span>
                    <span className="text-white/60 text-xs sm:text-sm font-bold">s</span>
                  </div>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="p-8 bg-gradient-to-b from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-sm">
              <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
                <button
                  onClick={handleSubscribe}
                  className="group relative animate-cta-pulse rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600 px-8 py-4 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-900 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative flex items-center justify-center gap-3">
                    {discountLabel && (
                      <span className="rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white/95 ring-1 ring-white/20">
                        {discountLabel}
                      </span>
                    )}
                    <svg
                      className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="tracking-wide">Subscribirme</span>
                  </span>
                </button>

                <button
                  onClick={handleClose}
                  className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-gray-200 font-medium text-base rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-md hover:shadow-lg border border-slate-700/50 hover:border-slate-600/50 hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>No quiero estos beneficios</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interstitial;