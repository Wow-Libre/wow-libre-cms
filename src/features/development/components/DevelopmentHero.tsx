import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  DEVELOPMENT_BTN_PRIMARY,
  DEVELOPMENT_BTN_SECONDARY,
  DEVELOPMENT_CARD_SURFACE,
  DEVELOPMENT_HERO_IMAGES,
} from "../constants";

export function DevelopmentHero() {
  const { t } = useTranslation();

  return (
    <section className={DEVELOPMENT_CARD_SURFACE}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-amber-500/5" />
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
            {t("development.kicker")}
          </p>
          <h1 className="font-gaming mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              {t("development.title")}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {t("development.subtitle")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#software" className={DEVELOPMENT_BTN_PRIMARY}>
              {t("development.cta-catalog")}
              <svg
                className="h-5 w-5 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </Link>
            <a
              href="https://github.com/Wow-Libre"
              target="_blank"
              rel="noopener noreferrer"
              className={DEVELOPMENT_BTN_SECONDARY}
            >
              {t("development.cta-github")}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {DEVELOPMENT_HERO_IMAGES.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
