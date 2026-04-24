"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CommunityNewsSidebar } from "./CommunityNewsSidebar";
import { StoriesStrip } from "./StoriesStrip";

type CommunityShellProps = {
  children: ReactNode;
  composer: ReactNode;
  /** Sustituir por un skeleton hasta hidratar evita mismatch SSR/cliente (cookies / contexto). */
  strip?: ReactNode;
  /** Contenido opcional debajo del bloque de noticias (columna izquierda). */
  leftRailBottom?: ReactNode;
};

export function CommunityShell({ children, composer, strip, leftRailBottom }: CommunityShellProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      {/* Capas suaves para no tapar fire-embers / radiales del shell de la ruta */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 -top-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[22rem] w-[22rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-px w-[min(100%,72rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/15 to-transparent" />
      </div>

      <div className="contenedor relative px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        <div className="relative mx-auto w-full max-w-[min(1680px,100%)]">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,340px)_1fr] xl:gap-10">
            <aside className="order-2 w-full min-w-0 space-y-4 lg:sticky lg:top-24 lg:order-1 lg:self-start lg:z-10">
              <CommunityNewsSidebar />
              {leftRailBottom}
            </aside>

            <div className="order-1 min-w-0 lg:order-2">
              <header className="mb-8 text-center sm:mb-10 sm:text-left">
                <div className="inline-flex items-center gap-3 sm:mb-1">
                  <span className="hidden h-px w-10 bg-gradient-to-r from-transparent to-gaming-primary-light/60 sm:block" />
                  <h1 className="font-gaming text-3xl font-semibold tracking-wide text-white sm:text-4xl lg:text-[2.75rem]">
                    {t("community.title")}
                  </h1>
                </div>
                <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-slate-400 sm:mx-0 sm:text-lg">
                  {t("community.subtitle")}
                </p>
              </header>

              <div className="mx-auto w-full max-w-6xl space-y-4">
                {strip ?? <StoriesStrip />}
                <div className="sticky top-4 z-20 sm:top-6">{composer}</div>
              </div>

              <div className="mx-auto mt-6 w-full max-w-6xl space-y-5">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
