import React from "react";
import { AdvertisingRealmPreviewProps } from "../types";

const AdvertisingRealmPreview: React.FC<AdvertisingRealmPreviewProps> = ({
  formData,
  copied,
  onCopy,
  t,
}) => {
  return (
    <section className="w-full rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="container mx-auto px-4 space-y-16">
        <div className="text-center mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
            <h1 className="mb-4 text-4xl font-bold text-[#1d1d1f] md:mb-0 md:text-5xl">
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
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white text-2xl font-semibold px-6 text-center">
                  {formData.footer_disclaimer}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-1 w-full px-4 text-center text-[#1d1d1f] md:w-1/2 md:text-left">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              {formData.title}{" "}
              <span className="text-slate-400 pb-2">{formData.tag}</span>
            </h2>
            <p className="text-slate-300 leading-relaxed text-2xl mb-4">
              {formData.sub_title}
            </p>
            <p className="text-slate-300 leading-relaxed text-xl mb-8">
              {formData.description}
            </p>

            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href={formData.redirect}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="rounded-full border border-black/10 bg-[#0071e3] px-8 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-[#0077ed] dashboard-on-accent">
                  {formData.cta_primary}
                </button>
              </a>
              <button
                className="rounded-full border border-black/10 bg-[#f5f5f7] px-8 py-3 text-lg font-medium text-[#1d1d1f] shadow-sm transition hover:bg-black/[0.04]"
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
