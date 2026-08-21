import { useTranslation } from "react-i18next";
import {
  DEVELOPMENT_BTN_PRIMARY,
  DEVELOPMENT_BTN_SECONDARY,
  DEVELOPMENT_CARD_SURFACE,
  developmentSoftware,
} from "../constants";

export function DevelopmentSoftwareList() {
  const { t } = useTranslation();

  return (
    <section id="software" aria-labelledby="development-software-heading">
      <header className="max-w-3xl text-center sm:mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
          {t("development.catalog-kicker")}
        </p>
        <h2
          id="development-software-heading"
          className="font-gaming mt-3 text-3xl font-bold text-white sm:text-4xl"
        >
          {t("development.catalog-title")}{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
            {t("development.catalog-title-accent")}
          </span>
        </h2>
        <p className="mt-3 text-base text-slate-400 sm:text-lg">
          {t("development.catalog-subtitle")}
        </p>
      </header>

      <div className="mt-12 space-y-8 lg:space-y-10">
        {developmentSoftware.map((item, index) => {
          const key = `development.items.${item.id}`;
          return (
            <article
              key={item.id}
              className={`${DEVELOPMENT_CARD_SURFACE} transition duration-300 hover:border-cyan-400/20 hover:shadow-[0_36px_80px_-18px_rgba(0,0,0,0.9),0_0_48px_rgba(34,211,238,0.08)]`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-stretch lg:gap-10 xl:gap-14">
                <div className="flex min-w-0 flex-col justify-center order-2 lg:order-1">
                  <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                    {t(`${key}.badge`)}
                  </span>
                  <h3 className="font-gaming mt-4 text-2xl font-bold text-white sm:text-3xl">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-400">
                    {t(`${key}.description`)}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    {t(`${key}.compatibility`)}
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={DEVELOPMENT_BTN_PRIMARY}
                    >
                      {t("development.download")}
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
                    </a>
                    <a
                      href={item.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={DEVELOPMENT_BTN_SECONDARY}
                    >
                      {t("development.source")}
                    </a>
                  </div>
                </div>

                <div className="relative order-1 min-h-[240px] w-full sm:min-h-[300px] lg:min-h-[400px] xl:min-h-[460px] lg:order-2">
                  <div className="group relative h-full overflow-hidden rounded-2xl shadow-[0_22px_50px_-16px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.cover}
                      alt={t(`${key}.title`)}
                      className="h-full min-h-[inherit] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
