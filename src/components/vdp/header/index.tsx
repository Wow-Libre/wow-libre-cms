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

  const handleCopy = () => {
    if (realmlist) {
      navigator.clipboard.writeText(realmlist);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-5 bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white py-20">
      <div className="contenedor mx-auto flex flex-col md:flex-row items-center my-12 md:my-24">
        <div className="flex flex-col w-full lg:w-1/3 justify-center items-start p-8 ">
          <img
            src={logo || webProps.logo}
            alt="Logo Server"
            loading="lazy"
            className="w-64 h-64 object-contain rounded-full shadow-2xl mb-4 animate-pulse select-none"
          />

          <h1 className="text-3xl md:text-5xl p-2 text-yellow-300 tracking-loose">
            {type}
          </h1>
          <h2 className="text-3xl md:text-5xl leading-relaxed md:leading-snug mb-2">
            {name}
          </h2>
          <p className="text-sm md:text-lg text-gray-200 mb-4">{description}</p>

          <div className="flex flex-row space-x-4">
            {isLogged ? (
              <a
                href="#register"
                className="bg-transparent hover:bg-yellow-300 text-yellow-300 hover:text-black rounded-lg shadow hover:shadow-lg py-3 px-6 border border-yellow-300 hover:border-transparent transition duration-300 ease-in-out"
              >
                {t("vdp-server.header.btn.register-text")}
              </a>
            ) : (
              <a
                href={url.startsWith("http") ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-medium py-3 px-6 rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
              >
                {t("vdp-server.header.btn.website")}
              </a>
            )}

            <button
              onClick={handleCopy}
              className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 text-black font-medium py-3 px-6 rounded-lg shadow-lg hover:from-yellow-400 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
            >
              {copied
                ? t("vdp-server.header.btn.copy")
                : t("vdp-server.header.btn.realmlist")}
            </button>
          </div>
        </div>

        {/* Grid para imágenes verticales con misma proporción */}
        <div className="p-4 mt-12 mb-6 md:mb-0 md:mt-0 ml-0 md:ml-12 lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
            <div className="w-full h-[500px] overflow-hidden rounded-3xl shadow-lg">
              <img
                className="w-full h-full object-cover"
                src={
                  headerImgLeft ||
                  "https://media.steelseriescdn.com/thumbs/filer_public/62/64/6264f4b0-429b-4da0-ae6a-230834dbcb32/wow_key_art_m_tile.png__540x540_crop-scale_optimize_subsampling-2.png"
                }
                alt="Tech Image 1"
              />
            </div>

            <div className="w-full h-[500px] overflow-hidden rounded-3xl shadow-lg">
              <img
                className="w-full h-full object-cover"
                src={
                  headerImgCenter ||
                  "https://4kwallpapers.com/images/wallpapers/world-of-warcraft-1080x2400-18842.jpg"
                }
                alt="Tech Image 2"
              />
            </div>

            <div className="w-full h-[500px] overflow-hidden rounded-3xl shadow-lg">
              <img
                className="w-full h-full object-cover"
                src={
                  headerImgRight ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2EIGTeqjRDSEn6ab5W5uegxHuOECy15XEbw&s"
                }
                alt="Tech Image 3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VdpBanner;
