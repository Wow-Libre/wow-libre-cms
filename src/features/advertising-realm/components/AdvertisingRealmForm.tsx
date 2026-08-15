import React from "react";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { AdvertisingRealmFormProps } from "../types";
import { DashboardImageUploader } from "@/components/dashboard/image-uploader/DashboardImageUploader";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { uploadAdvertisingRealmImage } from "@/lib/upload/advertisingRealmImageUpload";

type FieldKey =
  | "tag"
  | "sub_title"
  | "description"
  | "footer_disclaimer"
  | "img_url"
  | "cta_primary";

const MAX_LENGTHS: Record<Exclude<FieldKey, "img_url">, number> = {
  tag: 10,
  sub_title: 40,
  description: 100,
  footer_disclaimer: 100,
  cta_primary: 20,
};

const PLACEHOLDER_KEYS: Record<Exclude<FieldKey, "img_url">, string> = {
  tag: "label-text-placeholder",
  sub_title: "subtitle-placeholder",
  description: "description-text-placeholder",
  footer_disclaimer: "disclaimer-placeholder",
  cta_primary: "cta-primary-placeholder",
};

const FIELD_META: Record<
  Exclude<FieldKey, "img_url">,
  { icon: React.ReactNode; helperKey: string }
> = {
  tag: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
    helperKey: "tag",
  },
  sub_title: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h10"
        />
      </svg>
    ),
    helperKey: "sub_title",
  },
  description: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h12"
        />
      </svg>
    ),
    helperKey: "description",
  },
  footer_disclaimer: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    helperKey: "footer_disclaimer",
  },
  cta_primary: {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    ),
    helperKey: "cta_primary",
  },
};

const AdvertisingRealmForm: React.FC<AdvertisingRealmFormProps> = ({
  formData,
  errors,
  language,
  submitting,
  token,
  onChange,
  onLanguageChange,
  onSubmit,
  t,
}) => {
  const getValue = (key: FieldKey) => String(formData[key] ?? "");

  const handleImageUrlChange = (url: string) => {
    onChange({
      target: { name: "img_url", value: url },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const imgUrlError = errors["img_url"];

  const renderCharCount = (current: number, max: number) => {
    const ratio = current / max;
    const colorClass =
      ratio >= 1
        ? "text-red-400"
        : ratio >= 0.8
          ? "text-amber-400"
          : "text-slate-500";
    return (
      <span className={`text-sm font-medium tabular-nums ${colorClass}`}>
        {current}/{max}
      </span>
    );
  };

  return (
    <section className="relative rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:border-slate-600/70 hover:shadow-lg text-white">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            {t("adversing-realm.description")}
          </h2>

          {/* Idioma */}
          <div className="flex items-center gap-3">
            <label className="text-base font-medium text-slate-300">
              {t("adversing-realm.language")}
            </label>
            <select
              value={language}
              onChange={onLanguageChange}
              className="rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-2.5 text-base font-medium text-white outline-none transition-colors focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
            >
              <option value="ES" className="bg-slate-900 text-white">
                {t("adversing-realm.select-language.es")}
              </option>
              <option value="EN" className="bg-slate-900 text-white">
                {t("adversing-realm.select-language.en")}
              </option>
              <option value="PT" className="bg-slate-900 text-white">
                {t("adversing-realm.select-language.pt")}
              </option>
            </select>
          </div>
        </div>
        <div className="h-px bg-slate-700/50"></div>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
      >
        {/* Imagen de fondo (ancho completo) */}
        <div className="col-span-1 md:col-span-2 flex flex-col">
          <label
            htmlFor="adversing-img-url"
            className="mb-2 flex items-center justify-between text-lg font-semibold text-slate-200"
          >
            <span className="flex items-center gap-2">
              <span className="text-cyan-400 [&_svg]:h-5 [&_svg]:w-5">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              {t("adversing-realm.form.img-url")}
              <span className="text-red-400">*</span>
            </span>
          </label>
          <p className="mb-2 text-base text-slate-400">
            {t("adversing-realm.form.img-url-helper")}
          </p>
          <DashboardImageUploader
            token={token}
            value={getValue("img_url")}
            uploadFn={uploadAdvertisingRealmImage}
            onChange={handleImageUrlChange}
            label=""
            hint={t("adversing-realm.form.img-url-hint")}
            context="advertising-realm"
            accent="blue"
            onError={(msg) =>
              Swal.fire({
                title:
                  t("adversing-realm.errors.upload-error-title") ||
                  "Error al subir la imagen",
                text: msg,
                icon: "error",
                color: "white",
                background: "#0B1218",
              })
            }
          />
          {imgUrlError && (
            <p className="mt-2 text-base text-red-400 font-medium">{imgUrlError}</p>
          )}
        </div>

        {(
          ["tag", "sub_title", "description", "footer_disclaimer", "cta_primary"] as Exclude<
            FieldKey,
            "img_url"
          >[]
        ).map((name) => {
          const meta = FIELD_META[name];
          const maxLength = MAX_LENGTHS[name];
          const value = getValue(name);
          const error = errors[name];
          const isTextarea = name === "description" || name === "footer_disclaimer";

          return (
            <div
              key={name}
              className={`flex flex-col ${
                isTextarea ? "col-span-1 md:col-span-2" : "col-span-1"
              }`}
            >
              <label
                htmlFor={name}
                className="mb-2 flex items-center justify-between gap-2 text-lg font-semibold text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <span className="text-cyan-400 [&_svg]:h-5 [&_svg]:w-5">
                    {meta.icon}
                  </span>
                  {t(`adversing-realm.form.${name === "sub_title" ? "subtitle-text" : name === "footer_disclaimer" ? "disclaimer" : name === "cta_primary" ? "cta-primary" : name}`)}
                  <span className="text-red-400">*</span>
                </span>
                {renderCharCount(value.length, maxLength)}
              </label>
              <p className="mb-2 text-base text-slate-400">
                {t(`adversing-realm.form.helper.${meta.helperKey}`)}
              </p>
              {isTextarea ? (
                <textarea
                  id={name}
                  name={name}
                  placeholder={t(`adversing-realm.form.${PLACEHOLDER_KEYS[name]}`)}
                  value={value}
                  onChange={onChange}
                  minLength={5}
                  maxLength={maxLength}
                  rows={4}
                  disabled={submitting}
                  className={`w-full rounded-xl border px-4 py-3.5 text-lg placeholder-slate-500 outline-none transition-colors resize-none disabled:cursor-not-allowed disabled:opacity-60 ${
                    error
                      ? "border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-600/50 bg-slate-900/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-slate-500"
                  }`}
                  required
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  type="text"
                  minLength={3}
                  maxLength={maxLength}
                  placeholder={t(`adversing-realm.form.${PLACEHOLDER_KEYS[name]}`)}
                  value={value}
                  onChange={onChange}
                  disabled={submitting}
                  className={`w-full rounded-xl border px-4 py-3.5 text-lg placeholder-slate-500 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    error
                      ? "border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                      : "border-slate-600/50 bg-slate-800/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-slate-500"
                  }`}
                  required
                />
              )}
              {error && (
                <p className="mt-2 text-base text-red-400 font-medium">{error}</p>
              )}
            </div>
          );
        })}

        <div className="col-span-1 md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-5 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden
                />
                {t("adversing-realm.btn.primary-submitting") || "Publicando..."}
              </>
            ) : (
              <>
                <svg
                  className="h-6 w-6 opacity-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {t("adversing-realm.btn.primary")}
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdvertisingRealmForm;
