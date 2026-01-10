"use client";
import { useTranslation } from "react-i18next";

const DownloadApp = () => {
  const { t } = useTranslation();

  const downloadLink =
    "https://www.mediafire.com/file/z0h4xw8bd93hxka/wowlibre.apk/file";

  return (
    <section
      className="contenedor mt-8 relative overflow-hidden"
      role="region"
      aria-label="Download app section"
    >
      {/* Fondo con gradiente gaming */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900"></div>

      {/* Efectos de fondo gaming */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 bg-slate-800/40 backdrop-blur-sm border border-emerald-700/50 rounded-2xl p-6 sm:p-8 lg:p-10 overflow-hidden">
        {/* Efecto de grid animado de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center relative z-10">
          {/* Contenido de texto */}
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Badge animado */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
                <svg
                  className="w-5 h-5 mr-2 text-emerald-400 animate-bounce"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.95-3.24-1.44-1.88-.78-2.93-1.21-3.99-2.95-1.05-1.73-.32-3.17.76-4.73.98-1.42 2.03-2.84 3.09-4.26.41-.56.83-1.12 1.26-1.68.51-.68.51-1.57 0-2.25L9.68 2.85c-.51-.68-1.33-.87-2.02-.39-.66.47-1.3.98-1.93 1.52-2.43 2.09-3.95 4.82-4.08 7.91-.13 3.31 1.3 6.22 3.54 8.49 2.23 2.27 5.18 3.61 8.49 3.48 3.09-.13 5.82-1.65 7.91-4.08.54-.63 1.05-1.27 1.52-1.93.48-.69.29-1.51-.39-2.02l-1.68-1.26c-.68-.51-1.57-.51-2.25 0-.56.43-1.12.85-1.68 1.26-1.42 1.06-2.84 2.11-4.26 3.09-1.56 1.08-3 1.81-4.73.76-1.74-1.06-2.17-2.11-2.95-3.99-.49-1.16-.94-2.15-1.44-3.24-.48-1.03-.55-2.1.4-3.08l2.75-2.86c.95-.98 2.05-.88 3.08-.4 1.09.5 2.08.95 3.24 1.44 1.88.78 2.93 1.21 3.99 2.95 1.05 1.73.32 3.17-.76 4.73-.98 1.42-2.03 2.84-3.09 4.26-.41.56-.83 1.12-1.26 1.68-.51.68-.51 1.57 0 2.25l1.68 1.26c.51.68 1.33.87 2.02.39.66-.47 1.3-.98 1.93-1.52 2.43-2.09 3.95-4.82 4.08-7.91.13-3.31-1.3-6.22-3.54-8.49-2.23-2.27-5.18-3.61-8.49-3.48-3.09.13-5.82 1.65-7.91 4.08-.54.63-1.05 1.27-1.52 1.93-.48.69-.29 1.51.39 2.02l1.68 1.26c.68.51 1.57.51 2.25 0 .56-.43 1.12-.85 1.68-1.26 1.42-1.06 2.84-2.11 4.26-3.09 1.56-1.08 3-1.81 4.73-.76 1.74 1.06 2.17 2.11 2.95 3.99.49 1.16.94 2.15 1.44 3.24.48 1.03.55 2.1-.4 3.08l-2.75 2.86z" />
                </svg>
                <p className="text-sm font-semibold text-emerald-400">
                  {t("home-download-app.badge", "¡Nueva App Disponible!")}
                </p>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {t("home-download-app.title", "Descarga Nuestra App Android")}
                </span>
              </h2>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                {t(
                  "home-download-app.description",
                  "Lleva la aventura de World of Warcraft contigo. Accede a tu cuenta, gestiona tus personajes, consulta noticias y mucho más desde tu dispositivo móvil."
                )}
              </p>

              {/* Features list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">
                    {t(
                      "home-download-app.feature1",
                      "Gestión de cuenta completa"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">
                    {t(
                      "home-download-app.feature2",
                      "Notificaciones en tiempo real"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">
                    {t(
                      "home-download-app.feature3",
                      "Acceso rápido a la tienda"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm">
                    {t(
                      "home-download-app.feature4",
                      "Interfaz optimizada móvil"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de descarga mejorado */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative overflow-hidden rounded-xl">
                <a
                  href={downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 w-full sm:w-auto text-sm sm:text-base"
                >
                  {/* Efecto de partículas flotantes */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl">
                    <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                    <div
                      className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full animate-ping"
                      style={{ animationDelay: "200ms" }}
                    ></div>
                    <div
                      className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-ping"
                      style={{ animationDelay: "500ms" }}
                    ></div>
                    <div
                      className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full animate-ping"
                      style={{ animationDelay: "800ms" }}
                    ></div>
                  </div>

                  <span className="relative z-10 flex items-center gap-3">
                    {/* Icono Android */}
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1349 1.0987L4.8429 5.4465a.4161.4161 0 00-.5676-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.186.8535 12.4725.8535 14.2625V17.8c0 2.2818 4.7765 2.4 11.1465 2.4 6.37 0 11.1465-.1182 11.1465-2.4v-3.5375c0-1.79-1.8354-3.0766-5.328-4.4411m-7.8815 3.5317c.1865 0 .3535-.021.5335-.0412v3.6342c0 .2762-.2239.5-.5.5-.2762 0-.5-.2238-.5-.5v-3.6336c.18.0196.3465.0406.4665.0406m8.766 0c.1201 0 .2866-.021.4666-.0412v3.6342c0 .2762-.2238.5-.5.5-.2761 0-.5-.2238-.5-.5v-3.6336c.18.0196.3465.0406.5334.0406M5.459 9.3008c12.46 0 13.082.0094 13.082.0094.2761 0 .4993-.2238.4993-.5 0-.2761-.2232-.4993-.4993-.4993 0 0-.622-.0094-13.082-.0094-12.46 0-13.082.0094-13.082.0094-.2761 0-.4993.2232-.4993.4993 0 .2762.2232.5.4993.5 0 0 .622-.0094 13.082-.0094" />
                    </svg>
                    {t("home-download-app.button", "Descargar para Android")}
                    <svg
                      className="w-5 h-5 transition-transform group-hover:translate-x-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>

                  {/* Efecto de brillo que se desliza */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
                </a>
              </div>

              {/* Texto informativo */}
              <div className="flex items-center text-sm text-gray-400">
                <svg
                  className="w-4 h-4 mr-2 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {t("home-download-app.info", "Versión 1.0 • Gratis")}
              </div>
            </div>
          </div>

          {/* Imagen/Ilustración mejorada */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="https://static.wixstatic.com/media/5dd8a0_486ff58d42574f9f8113cc30b991f364~mv2.jpg"
                alt="App Android WoW Libre"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl"
              />

              {/* Overlay con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

              {/* Efecto de brillo en los bordes */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </div>

            {/* Efectos decorativos alrededor */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500/30 rounded-full blur-sm animate-pulse"></div>
            <div
              className="absolute -bottom-4 -right-4 w-6 h-6 bg-cyan-500/30 rounded-full blur-sm animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></div>
            <div
              className="absolute top-1/2 -right-2 w-4 h-4 bg-teal-400/40 rounded-full blur-sm animate-pulse"
              style={{ animationDelay: "600ms" }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadApp;
