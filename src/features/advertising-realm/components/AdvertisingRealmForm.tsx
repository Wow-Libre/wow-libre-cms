import React from "react";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { AdvertisingRealmFormProps } from "../types";

const AdvertisingRealmForm: React.FC<AdvertisingRealmFormProps> = ({
  formData,
  errors,
  language,
  onChange,
  onLanguageChange,
  onSubmit,
  t,
}) => {
  const getValue = (key: keyof RealmAdvertisement) =>
    String(formData[key] ?? "");

  const fields = [
    {
      label: t("adversing-realm.form.label-text"),
      name: "tag",
      placeholder: t("adversing-realm.form.label-text-placeholder"),
    },
    {
      label: t("adversing-realm.form.subtitle-text"),
      name: "sub_title",
      placeholder: t("adversing-realm.form.subtitle-placeholder"),
    },
    {
      label: t("adversing-realm.form.description-text"),
      name: "description",
      textarea: true,
      placeholder: t("adversing-realm.form.description-text-placeholder"),
    },
    {
      label: t("adversing-realm.form.disclaimer"),
      name: "footer_disclaimer",
      textarea: true,
      placeholder: t("adversing-realm.form.disclaimer-placeholder"),
    },
    {
      label: t("adversing-realm.form.img-url"),
      name: "img_url",
      placeholder: t("adversing-realm.form.img-url-placeholder"),
    },
    {
      label: t("adversing-realm.form.cta-primary"),
      name: "cta_primary",
      placeholder: t("adversing-realm.form.cta-primary-placeholder"),
    },
  ];

  return (
    <section className="relative rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 w-full max-w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 transition-all duration-300 hover:border-slate-600/70 hover:shadow-lg text-white">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-200 mb-3">
            {t("adversing-realm.description")}
          </h2>

          {/* Idioma */}
          <div className="flex items-center">
            <label className="text-slate-300 font-semibold mr-2">
              {t("adversing-realm.language")}
            </label>
            <select
              value={language}
              onChange={onLanguageChange}
              style={{
                backgroundColor: "rgb(15 23 42 / 0.5)",
                color: "white",
              }}
              className="bg-slate-900/50 text-white p-2 rounded-lg border border-slate-600/50 focus:border-slate-500 focus:ring-1 focus:ring-slate-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/60"
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
        {fields.map(({ label, name, textarea, placeholder }) => (
          <div
            key={name}
            className={`flex flex-col ${
              textarea ? "col-span-2" : "col-span-1"
            }`}
          >
            <label
              htmlFor={name}
              className="mb-2 font-semibold text-slate-300 text-base"
            >
              {label}
              <span className="text-red-400 ml-1">*</span>
            </label>
            {textarea ? (
              <textarea
                id={name}
                name={name}
                placeholder={placeholder}
                value={getValue(name as keyof RealmAdvertisement)}
                onChange={onChange}
                minLength={5}
                maxLength={100}
                rows={4}
                style={{
                  backgroundColor: "rgb(15 23 42 / 0.5)",
                  color: "white",
                }}
                className={`w-full p-4 rounded-lg bg-slate-900/50 border transition-all duration-300 text-white text-base placeholder-slate-500 focus:outline-none focus:ring-1 resize-none hover:border-slate-500/60 ${
                  errors[name]
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-600/50 focus:border-slate-500 focus:ring-slate-500/20"
                }`}
                required
              />
            ) : (
              <input
                id={name}
                name={name}
                type={name === "img_url" ? "url" : "text"}
                minLength={5}
                maxLength={name === "img_url" ? 2048 : 40}
                placeholder={placeholder}
                value={getValue(name as keyof RealmAdvertisement)}
                onChange={onChange}
                style={{
                  backgroundColor: "rgb(15 23 42 / 0.5)",
                  color: "white",
                }}
                className={`w-full p-4 rounded-lg bg-slate-900/50 border transition-all duration-300 text-white text-base placeholder-slate-500 focus:outline-none focus:ring-1 hover:border-slate-500/60 ${
                  errors[name]
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-600/50 focus:border-slate-500 focus:ring-slate-500/20"
                }`}
                required
              />
            )}
            {errors[name] && (
              <p className="mt-1 text-sm text-red-400 font-medium">
                {errors[name]}
              </p>
            )}
          </div>
        ))}

        <div className="col-span-2">
          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold px-8 py-4 rounded-lg border border-slate-600/50 hover:border-slate-500/60 transition-all duration-300 text-lg flex items-center justify-center gap-2"
          >
            {t("adversing-realm.btn.primary")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdvertisingRealmForm;
