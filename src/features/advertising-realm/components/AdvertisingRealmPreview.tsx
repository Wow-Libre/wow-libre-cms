import React from "react";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { AdvertisingRealmPreviewProps } from "../types";

const AdvertisingRealmPreview: React.FC<AdvertisingRealmPreviewProps> = ({
  formData,
  copied,
  onCopy,
  t,
}) => {
  return (
    <section className="p-5 bg-gradient-to-bl from-slate-900 via-slate-900 to-slate-950 rounded-xl w-full">
      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4 md:mb-0">
              {t("adversing-realm.title")} -{" "}
              <span className="text-slate-400">
                {t("adversing-realm.subtitle")}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center mb-8 rounded-xl">
          <div className="w-full md:w-1/2 relative mb-8 md:mb-0">
            <div
              className="bg-no-repeat bg-cover bg-center h-80 rounded-xl shadow-lg overflow-hidden group"
              style={{
                backgroundImage: `url(${formData.img_url})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-2xl font-semibold px-6 text-center">
                  {formData.footer_disclaimer}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 text-white text-center md:text-left px-4 mb-1">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {formData.title}{" "}
              <span className="text-slate-400 pb-2">{formData.tag}</span>
            </h2>
            <p className="text-slate-300 leading-relaxed text-xl mb-4">
              {formData.sub_title}
            </p>
            <p className="text-slate-300 leading-relaxed text-lg mb-8">
              {formData.description}
            </p>

            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href={formData.redirect}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-8 rounded-full shadow-lg border border-slate-600/50 hover:border-slate-500/60 focus:ring-2 focus:ring-slate-500/20 transition-all duration-300">
                  {formData.cta_primary}
                </button>
              </a>
              <button
                className="bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-8 rounded-full shadow-lg border border-slate-500/50 hover:border-slate-400/60 focus:ring-2 focus:ring-slate-400/20 transition-all duration-300"
                onClick={() => onCopy(formData.realmlist)}
              >
                {copied ? "¡Copiado!" : "Realmlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertisingRealmPreview;
