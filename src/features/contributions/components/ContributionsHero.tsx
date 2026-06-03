import { socialLinks } from "@/constants/socialLinks";
import { CONTRIBUTIONS_HERO_IMAGES } from "../constants";
import Link from "next/link";

const whatsAppLink = socialLinks.find((l) => l.name === "WhatsApp");

export function ContributionsHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-amber-500/5" />
      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
            Recursos del jugador
          </p>
          <h1 className="font-gaming mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Guías y descarga del cliente
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Descarga el cliente de World of Warcraft y entra al servidor con
            todo listo para jugar.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link
              href="#download"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:from-cyan-500 hover:to-sky-500 sm:text-base"
            >
              Descargar juego
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </Link>
            {whatsAppLink ? (
              <a
                href={whatsAppLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/50 hover:bg-emerald-500/20 sm:text-base"
              >
                Grupo de WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {CONTRIBUTIONS_HERO_IMAGES.map((img) => (
            <div
              key={img.src}
              className="relative aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
