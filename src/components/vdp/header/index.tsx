import { webProps } from "@/constants/configs";
import React, { useState } from "react";

interface vdpBannerProps {
  type: string;
  name: string;
  realmlist: string;
  description: string;
  url: string;
  isLogged: boolean;
  logo?: string;
  headerImgLeft?: string;
  headerImgRight?: string;
  headerImgCenter?: string;
  t: (key: string, options?: any) => string;
}

const VdpBanner: React.FC<vdpBannerProps> = ({
  type,
  name,
  realmlist,
  description,
  url,
  isLogged,
  logo,
  headerImgLeft,
  headerImgCenter,
  headerImgRight,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const handleCopy = () => {
    if (realmlist) {
      navigator.clipboard.writeText(realmlist);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  return (
    <div className="mb-5 bg-gradient-to-br from-gray-900 via-slate-800/60 to-black text-white py-16 md:py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(71,85,105,0.1),transparent_50%)]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.3)_100%)]"></div>

      <div className="contenedor mx-auto flex flex-col md:flex-row items-center my-8 md:my-16 relative z-10">
        <div className="flex flex-col w-full lg:w-1/3 justify-center items-center md:items-start p-6 md:p-8">
          {/* Logo with enhanced animation */}
          <div className="relative mb-6 group mx-auto md:mx-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-slate-500 to-yellow-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <img
              src={logo || webProps.logo}
              alt="Logo Server"
              loading="lazy"
              className="relative w-48 h-48 md:w-64 md:h-64 object-contain rounded-full shadow-2xl select-none transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <h1 className="text-3xl md:text-5xl p-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 tracking-loose font-bold mb-2 text-center md:text-left">
            {type}
          </h1>
          <h2 className="text-3xl md:text-5xl leading-relaxed md:leading-snug mb-4 font-bold text-white text-center md:text-left">
            {name}
          </h2>
          <p className="text-sm md:text-lg text-gray-200 mb-6 leading-relaxed text-center md:text-left">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
            <button
              onClick={handleCopy}
              className={`group relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-yellow-400/50 hover:from-yellow-400 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                copied
                  ? "from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700"
                  : ""
              }`}
            >
              {copied
                ? t("vdp-server.header.btn.copy")
                : t("vdp-server.header.btn.realmlist")}
            </button>

            {/* Botón de compartir URL */}
            <button
              onClick={handleShareUrl}
              className={`group relative inline-flex items-center justify-center gap-2 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-slate-500/50 hover:from-slate-500 hover:via-slate-600 hover:to-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 ${
                urlCopied
                  ? "from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700"
                  : ""
              }`}
            >
              {urlCopied ? (
                <>
                  <svg
                    className="w-5 h-5"
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
                  <span>¡URL Copiada!</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span> Compartir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grid para imágenes verticales con efectos mejorados */}
        <div className="p-4 mt-8 md:mt-0 md:ml-12 lg:w-2/3 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 justify-center">
            <div className="group w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-slate-500/30 transition-all duration-500 hover:scale-105">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={
                  headerImgLeft ||
                  "https://media.steelseriescdn.com/thumbs/filer_public/62/64/6264f4b0-429b-4da0-ae6a-230834dbcb32/wow_key_art_m_tile.png__540x540_crop-scale_optimize_subsampling-2.png"
                }
                alt="Server Image Left"
              />
            </div>

            <div className="group w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-slate-500/30 transition-all duration-500 hover:scale-105">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={
                  headerImgCenter ||
                  "https://4kwallpapers.com/images/wallpapers/world-of-warcraft-1080x2400-18842.jpg"
                }
                alt="Server Image Center"
              />
            </div>

            <div className="group w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl hover:shadow-slate-500/30 transition-all duration-500 hover:scale-105">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={
                  headerImgRight ||
                  "https://blz-contentstack-images.akamaized.net/v3/assets/blt3452e3b114fab0cd/blt595d131920c36979/68acddcbe8bddc7776b26dc7/MidnightMobilesm.png"
                }
                alt="Server Image Right"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VdpBanner;
