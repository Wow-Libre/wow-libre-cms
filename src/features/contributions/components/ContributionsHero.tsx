import { socialLinks } from "@/constants/socialLinks";
import {
  CONTRIBUTIONS_BTN_PRIMARY,
  CONTRIBUTIONS_BTN_SECONDARY,
  CONTRIBUTIONS_CARD_SURFACE,
  CONTRIBUTIONS_HERO_IMAGES,
} from "../constants";
import Link from "next/link";

const whatsAppLink = socialLinks.find((l) => l.name === "WhatsApp");

export function ContributionsHero() {
  return (
    <section className={CONTRIBUTIONS_CARD_SURFACE}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-amber-500/5" />
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#download" className={CONTRIBUTIONS_BTN_PRIMARY}>
              Descargar juego
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </Link>
            {whatsAppLink ? (
              <a
                href={whatsAppLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={CONTRIBUTIONS_BTN_SECONDARY}
              >
                <svg
                  className="h-5 w-5 text-emerald-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                  <path d="M12.05 21.785h-.004A9.87 9.87 0 0 1 7.46 20.4l-.35.12-3.607.946.964-3.515.13-.36A9.86 9.86 0 0 1 2.16 12.05C2.165 6.585 6.61 2.14 12.078 2.14c2.63.002 5.101 1.027 6.96 2.888a9.825 9.825 0 0 1 2.887 6.958c-.003 5.468-4.45 9.8-9.875 9.8m8.413-18.213A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
                </svg>
                Grupo de WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {CONTRIBUTIONS_HERO_IMAGES.map((img) => (
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
