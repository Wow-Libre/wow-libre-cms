"use client";
import { createBanner, deleteBanner, getBanners } from "@/api/advertising";
import { Banners } from "@/model/banners";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface AdvertisingBannersProps {
  token: string;
  t: (key: string) => string;
}

const BannersAdvertisingDashboard: React.FC<AdvertisingBannersProps> = ({
  token,
  t,
}) => {
  const [banners, setBanners] = useState<Banners[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("es");

  useEffect(() => {
    fetchBanners();
  }, [selectedLanguage, token]);

  const fetchBanners = async () => {
    try {
      const fetchedBanners = await getBanners(selectedLanguage);
      setBanners(fetchedBanners);
    } catch (error) {
      console.error("Error al obtener los banners:", error);
    }
  };

  const [form, setForm] = useState<Banners>({
    id: 0,
    media_url: "",
    alt: "",
    language: "",
    type: "IMAGE",
    label: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBanner(
        form.language,
        form.media_url,
        form.alt,
        form.type,
        form.label,
        token
      );

      setForm({
        id: 0,
        media_url: "",
        alt: "",
        language: "",
        type: "IMAGE",
        label: "",
      });
      fetchBanners();
      Swal.fire({
        title: t("banners-dashboard.alerts.create-success-title"),
        text: t("banners-dashboard.alerts.create-success-message"),
        icon: "success",
        confirmButtonText: t("banners-dashboard.buttons.accept"),
        customClass: {
          confirmButton:
            "bg-cyan-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("banners-dashboard.alerts.create-error-title"),
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
    }
  };

  const handleDelete = async (bannerId: number) => {
    try {
      await deleteBanner(bannerId, token);
      Swal.fire({
        title: t("banners-dashboard.alerts.delete-success-title"),
        text: t("banners-dashboard.alerts.delete-success-message"),
        icon: "success",
        confirmButtonText: t("banners-dashboard.buttons.accept"),
        customClass: {
          confirmButton:
            "bg-cyan-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
      fetchBanners();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("banners-dashboard.alerts.delete-error-title"),
        text: `${t("banners-dashboard.alerts.delete-error-message")} ${
          error.message
        }`,
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("banners-dashboard.title")}
        </h1>
        <p className="text-slate-300">{t("banners-dashboard.subtitle")}</p>
        <div className="mt-4">
          <p
            className="text-sm text-yellow-300 font-medium bg-yellow-500/20 inline-block px-4 py-2 rounded-lg border border-yellow-400/40"
            dangerouslySetInnerHTML={{ __html: t("banners-dashboard.warning") }}
          />
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Formulario */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("banners-dashboard.form.title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  {t("banners-dashboard.form.media-label")}
                </label>
                <input
                  type="text"
                  name="media_url"
                  value={form.media_url}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                  placeholder={t("banners-dashboard.form.media-placeholder")}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  {t("banners-dashboard.form.alt-label")}
                </label>
                <input
                  type="text"
                  name="alt"
                  value={form.alt}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                  placeholder={t("banners-dashboard.form.alt-placeholder")}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  {t("banners-dashboard.form.language-label")}
                </label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                >
                  <option value="" disabled>
                    {t("banners-dashboard.form.language-placeholder")}
                  </option>
                  <option value="ES">Español</option>
                  <option value="EN">Inglés</option>
                  <option value="PT">Portugués</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  {t("banners-dashboard.form.type-label")}
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                >
                  <option value="IMAGE">
                    {t("banners-dashboard.form.type-image")}
                  </option>
                  <option value="VIDEO">
                    {t("banners-dashboard.form.type-video")}
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-200 text-lg">
                  {t("banners-dashboard.form.label-label")}
                </label>
                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                  placeholder={t("banners-dashboard.form.label-placeholder")}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-lg"
              >
                {t("banners-dashboard.form.submit")}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("banners-dashboard.list.title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
            </div>

            <div className="mb-8">
              <label
                htmlFor="language"
                className="block mb-2 font-semibold text-slate-200 text-lg"
              >
                {t("banners-dashboard.list.filter-label")}
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              >
                <option value="ES">Español</option>
                <option value="EN">Inglés</option>
                <option value="PT">Portugués</option>
              </select>
            </div>
            {banners.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-lg">
                  {t("banners-dashboard.list.empty")}
                </p>
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {banners.map((banner, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-slate-600/50 to-slate-700/50 rounded-xl border border-slate-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 overflow-hidden"
                  >
                    {banner.type === "IMAGE" ? (
                      <img
                        src={banner.media_url}
                        alt={banner.alt}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <video
                        src={banner.media_url}
                        controls
                        className="w-full h-64 object-cover"
                      />
                    )}
                    <div className="p-8 space-y-4">
                      <h4 className="font-bold text-xl text-white">
                        {banner.alt}
                      </h4>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                          Idioma: {banner.language}
                        </span>
                        <span className="text-sm font-semibold text-green-300 bg-green-500/20 px-3 py-1 rounded-full">
                          Tipo: {banner.type}
                        </span>
                      </div>

                      {banner.label && (
                        <p className="text-sm text-yellow-300 bg-yellow-500/20 px-3 py-1 rounded-full inline-block">
                          {banner.label}
                        </p>
                      )}

                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="w-full mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-lg border border-red-400/30 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                      >
                        {t("banners-dashboard.buttons.delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannersAdvertisingDashboard;
