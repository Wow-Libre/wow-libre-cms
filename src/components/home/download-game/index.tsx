"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const DownloadGame = () => {
  const { t } = useTranslation();

  return (
    <section className="contenedor mt-8 px-4" role="region" aria-label="Download game section">
      <div className="download-client-shell relative min-h-[430px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8 lg:p-10">
        <div className="download-client-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(249,115,22,0.16),transparent_38%),radial-gradient(circle_at_82%_48%,rgba(56,189,248,0.12),transparent_36%)]" />

        <div className="relative grid min-h-[350px] items-center gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          <div className="download-client-content flex h-full flex-col justify-center">
            <p className="font-semibold text-sm uppercase tracking-[0.2em] text-amber-200/85 md:text-base">
              {t("home-who-we-are.title")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-zinc-100 md:text-4xl">
              {t("home-who-we-are.btn-text")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
              {t("home-who-we-are.description")}
            </p>
            <p className="mt-3 text-sm text-zinc-400/90 md:text-base">
              {t("home-who-we-are.recommended-client-note")}
            </p>

            <div className="mt-6">
              <Link
                href="/contributions"
                className="download-client-cta inline-flex rounded-md bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-3 text-base font-semibold text-black transition-all hover:from-amber-500 hover:to-orange-400"
              >
                {t("home-who-we-are.btn-text")}
              </Link>
            </div>
          </div>

          <div className="download-client-visual relative h-full overflow-hidden rounded-xl border border-white/10 bg-black/35 min-h-[320px] md:min-h-[380px]">
            <div
              className="download-client-bg absolute inset-0 bg-cover bg-center opacity-65"
              style={{
                backgroundImage:
                  "url('https://wowcircle.me/dragonflight/en/assets/img/ui/tab/bg3.webp')",
              }}
            />
            <img
              src="https://wowcircle.me/dragonflight/en/assets/img/iridikron.webp"
              alt="Cliente oficial"
              className="download-client-character absolute -right-3 bottom-0 h-[92%] w-auto max-w-[70%] object-contain opacity-90"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/65" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(249,115,22,0.2),transparent_40%)]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadGame;
