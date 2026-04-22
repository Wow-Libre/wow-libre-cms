"use client";
import { useTranslation } from "react-i18next";

const DownloadApp = () => {
  const { t } = useTranslation();

  const downloadLink =
    "https://www.mediafire.com/file/bndlaj7t3jxv8jf/app-release.apk/file";

  return (
    <section
      className="contenedor mt-8 relative overflow-hidden"
      role="region"
      aria-label="Download app section"
    >
      <div className="relative z-10 min-h-[430px] rounded-2xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 lg:p-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.15),transparent_38%),radial-gradient(circle_at_82%_48%,rgba(6,182,212,0.12),transparent_36%)]" />

        <div className="relative z-10 grid min-h-[350px] grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="flex h-full flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/85">
              {t("home-download-app.badge", "¡Nueva App Disponible!")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
              {t("home-download-app.title", "Descarga Nuestra App Android")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300">
              {t(
                "home-download-app.description",
                "Lleva la aventura de World of Warcraft contigo. Accede a tu cuenta, gestiona tus personajes, consulta noticias y mucho más desde tu dispositivo móvil.",
              )}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <p className="text-sm text-zinc-300">• {t("home-download-app.feature1", "Gestión de cuenta completa")}</p>
              <p className="text-sm text-zinc-300">• {t("home-download-app.feature2", "Notificaciones en tiempo real")}</p>
              <p className="text-sm text-zinc-300">• {t("home-download-app.feature3", "Acceso rápido a la tienda")}</p>
              <p className="text-sm text-zinc-300">• {t("home-download-app.feature4", "Interfaz optimizada móvil")}</p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <a
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-emerald-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/20 sm:w-auto"
              >
                {t("home-download-app.button", "Descargar para Android")}
              </a>
              <p className="text-xs text-zinc-400">
                {t("home-download-app.info", "Versión 1.0 • Gratis")}
              </p>
            </div>
          </div>

          <div className="relative h-full min-h-[320px] md:min-h-[380px] overflow-hidden rounded-xl border border-white/10 bg-black/35">
            <img
              src="https://static.wixstatic.com/media/5dd8a0_486ff58d42574f9f8113cc30b991f364~mv2.jpg"
              alt="App Android WoW Libre"
              className="h-[320px] w-full rounded-xl object-cover md:h-[380px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
