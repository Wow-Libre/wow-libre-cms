"use client";
import { createBanner, deleteBanner, getBanners } from "@/api/advertising";
import { Banners } from "@/model/banners";
import React, { useEffect, useState } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DashboardMediaUploader } from "../image-uploader/DashboardMediaUploader";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import { uploadBannersMedia } from "@/lib/upload/bannersMediaUpload";
import {
  FaBullhorn,
  FaImage,
  FaLanguage,
  FaTrashAlt,
  FaVideo,
} from "react-icons/fa";

interface AdvertisingBannersProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const EMPTY_FORM: Banners = {
  id: 0,
  media_url: "",
  alt: "",
  language: "",
  type: "IMAGE",
  label: "",
};

const BannersAdvertisingDashboard: React.FC<AdvertisingBannersProps> = ({
  token,
  t,
}) => {
  const [banners, setBanners] = useState<Banners[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ES");
  const [form, setForm] = useState<Banners>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  const fetchBanners = async () => {
    try {
      const fetchedBanners = await getBanners(selectedLanguage);
      setBanners(fetchedBanners);
    } catch (error) {
      console.error("Error al obtener los banners:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.media_url.trim()) {
      Swal.fire({
        icon: "warning",
        title: t("banners-dashboard.alerts.media-required-title"),
        text: t("banners-dashboard.alerts.media-required-message"),
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createBanner(
        form.language,
        form.media_url,
        form.alt,
        form.type,
        form.label,
        token
      );

      setForm(EMPTY_FORM);
      await fetchBanners();
      Swal.fire({
        title: t("banners-dashboard.alerts.create-success-title"),
        text: t("banners-dashboard.alerts.create-success-message"),
        icon: "success",
        confirmButtonText: t("banners-dashboard.buttons.accept"),
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("banners-dashboard.alerts.create-error-title"),
        text: error.message,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bannerId: number) => {
    const result = await Swal.fire({
      title: t("banners-dashboard.alerts.delete-confirm-title"),
      text: t("banners-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("banners-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("banners-dashboard.alerts.delete-confirm-no"),
    });
    if (!result.isConfirmed) return;

    try {
      await deleteBanner(bannerId, token);
      await fetchBanners();
      Swal.fire({
        title: t("banners-dashboard.alerts.delete-success-title"),
        text: t("banners-dashboard.alerts.delete-success-message"),
        icon: "success",
        confirmButtonText: t("banners-dashboard.buttons.accept"),
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("banners-dashboard.alerts.delete-error-title"),
        text: `${t("banners-dashboard.alerts.delete-error-message")} ${
          error.message
        }`,
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const renderLabel = (
    Icon: React.ComponentType<{ className?: string }>,
    text: string
  ) => (
    <span className="mb-2 flex items-center gap-2 text-base font-medium text-slate-200">
      <Icon className="h-5 w-5 text-cyan-300/90" aria-hidden />
      <span>{text}</span>
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header: título + contador + CTA con icono */}
      <section
        className={`flex flex-col gap-4 rounded-xl ${DASHBOARD_PALETTE.card} p-5 shadow-lg backdrop-blur-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <FaBullhorn className="h-5 w-5" aria-hidden />
            </div>
            <h1
              className={`text-2xl font-semibold ${DASHBOARD_PALETTE.text} sm:text-3xl`}
            >
              {t("banners-dashboard.header.title")}
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-semibold text-cyan-200">
              <span
                className="h-2 w-2 rounded-full bg-cyan-300"
                aria-hidden
              />
              {t("banners-dashboard.list.count", { count: banners.length })}
            </span>
          </div>
          <p className={`mt-3 text-base ${DASHBOARD_PALETTE.textMuted}`}>
            {t("banners-dashboard.header.subtitle")}
          </p>
        </div>
      </section>

      {/* Callout de advertencia */}
      <div
        className="flex items-start gap-3 rounded-xl border border-yellow-400/40 bg-yellow-500/15 px-4 py-3 text-sm font-medium text-yellow-200 sm:text-base"
        role="status"
        dangerouslySetInnerHTML={{ __html: t("banners-dashboard.warning") }}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Formulario */}
        <div className="xl:col-span-2">
          <DashboardSection
            title={
              <span
                className={`text-lg font-semibold ${DASHBOARD_PALETTE.text} sm:text-xl`}
              >
                {t("banners-dashboard.form.title")}
              </span>
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block">
                  {renderLabel(
                    form.type === "VIDEO" ? FaVideo : FaImage,
                    t("banners-dashboard.form.media-label")
                  )}
                </label>
                <DashboardMediaUploader
                  token={token}
                  value={form.media_url}
                  uploadFn={uploadBannersMedia}
                  onChange={(url) =>
                    setForm((prev) => ({ ...prev, media_url: url }))
                  }
                  kind={form.type === "VIDEO" ? "video" : "image"}
                  label=""
                  hint={t("banners-dashboard.form.media-hint")}
                  accent="cyan"
                  context={form.type === "VIDEO" ? "banners-video" : "banners-image"}
                />
              </div>

              <div>
                <label htmlFor="banner-alt" className="block">
                  {renderLabel(FaImage, t("banners-dashboard.form.alt-label"))}
                </label>
                <input
                  id="banner-alt"
                  type="text"
                  name="alt"
                  value={form.alt}
                  onChange={handleChange}
                  required
                  className={DASHBOARD_PALETTE.input}
                  placeholder={t("banners-dashboard.form.alt-placeholder")}
                />
              </div>

              <div>
                <label htmlFor="banner-language" className="block">
                  {renderLabel(
                    FaLanguage,
                    t("banners-dashboard.form.language-label")
                  )}
                </label>
                <select
                  id="banner-language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  required
                  className={DASHBOARD_PALETTE.input}
                >
                  <option value="" disabled>
                    {t("banners-dashboard.form.language-placeholder")}
                  </option>
                  <option value="ES">Español</option>
                  <option value="EN">English</option>
                  <option value="PT">Português</option>
                </select>
              </div>

              <div>
                <label htmlFor="banner-type" className="block">
                  {renderLabel(
                    FaVideo,
                    t("banners-dashboard.form.type-label")
                  )}
                </label>
                <select
                  id="banner-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className={DASHBOARD_PALETTE.input}
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
                <label htmlFor="banner-label" className="block">
                  {renderLabel(
                    FaBullhorn,
                    t("banners-dashboard.form.label-label")
                  )}
                </label>
                <input
                  id="banner-label"
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  className={DASHBOARD_PALETTE.input}
                  placeholder={t("banners-dashboard.form.label-placeholder")}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`flex w-full items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} mt-2 disabled:opacity-60`}
              >
                {submitting ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden
                    />
                    <span>{t("banners-dashboard.form.submit-loading")}</span>
                  </>
                ) : (
                  <>
                    <FaBullhorn className="h-4 w-4" aria-hidden />
                    <span>{t("banners-dashboard.form.submit")}</span>
                  </>
                )}
              </button>
            </form>
          </DashboardSection>
        </div>

        {/* Lista */}
        <div className="xl:col-span-3">
          <DashboardSection
            title={
              <span
                className={`text-lg font-semibold ${DASHBOARD_PALETTE.text} sm:text-xl`}
              >
                {t("banners-dashboard.list.title")}
              </span>
            }
            action={
              <div className="flex items-center gap-2">
                <label
                  htmlFor="banner-list-language"
                  className="text-sm font-medium text-slate-400"
                >
                  {t("banners-dashboard.list.filter-label")}
                </label>
                <select
                  id="banner-list-language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-sm text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="ES">ES</option>
                  <option value="EN">EN</option>
                  <option value="PT">PT</option>
                </select>
              </div>
            }
          >
            {banners.length === 0 ? (
              <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/80 text-cyan-300 ring-1 ring-slate-700/60">
                  <FaBullhorn className="h-6 w-6" aria-hidden />
                </div>
                <p className="text-base font-medium text-slate-400">
                  {t("banners-dashboard.list.empty")}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {banners.map((banner) => (
                  <li
                    key={banner.id}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/60 transition-all hover:-translate-y-0.5 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="aspect-[3/2] w-full overflow-hidden bg-slate-900/60">
                      {banner.type === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={banner.media_url}
                          alt={banner.alt}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={banner.media_url}
                          controls
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-2 p-4">
                      <p
                        className={`truncate text-base font-semibold ${DASHBOARD_PALETTE.text}`}
                        title={banner.alt}
                      >
                        {banner.alt}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
                          {banner.language}
                        </span>
                        <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-200">
                          {banner.type}
                        </span>
                        {banner.label && (
                          <span className="rounded-full border border-yellow-400/40 bg-yellow-500/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-200">
                            {banner.label}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(banner.id)}
                        className={`mt-2 inline-flex w-full items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnDanger}`}
                      >
                        <FaTrashAlt className="h-3.5 w-3.5" aria-hidden />
                        <span>{t("banners-dashboard.buttons.delete")}</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default BannersAdvertisingDashboard;
