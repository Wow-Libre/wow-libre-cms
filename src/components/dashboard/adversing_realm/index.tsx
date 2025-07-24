import {
  createAdvertisementById,
  getRealmAdvertisementById,
} from "@/api/realmAdvertisement";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface AdvertisingRealmFormProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}

const emptyRealmAdvertisement: RealmAdvertisement = {
  id: 0,
  title: "",
  tag: "",
  sub_title: "",
  description: "",
  cta_primary: "",
  img_url: "",
  footer_disclaimer: "",
  redirect: "",
  realmlist: "",
  copy_success: false,
};

const AdvertisingRealmForm: React.FC<AdvertisingRealmFormProps> = ({
  token,
  realmId,
  t,
}) => {
  const [formData, setFormData] = useState<RealmAdvertisement>(
    emptyRealmAdvertisement
  );
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"ES" | "EN" | "PT">("ES");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRealmAdvertisementById(
          realmId,
          language,
          token
        );
        if (response) {
          setFormData(response);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `${error.message}`,
          color: "white",
          background: "#0B1218",
          timer: 43500,
        });
      }
    };

    fetchData();
  }, [realmId, token, language]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (
      (name === "tag" && value.length > 10) ||
      (name === "sub_title" && value.length > 40) ||
      (name === "description" && value.length > 40) ||
      (name === "footer_disclaimer" && value.length > 40) ||
      (name === "cta_primary" && value.length > 20)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Exceeds maximum length. Please enter a valid value.",
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TAG: min 5, max 10
    if (!formData.tag || formData.tag.length < 5 || formData.tag.length > 10) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "The tag must be between 5 and 10 characters.",
      });
      return;
    }

    // SUBTITLE: not null
    if (!formData.sub_title || formData.sub_title.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "The subtitle cannot be empty.",
      });
      return;
    }

    // DESCRIPTION: min 5, max 40
    if (
      !formData.description ||
      formData.description.length < 5 ||
      formData.description.length > 40
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "The description must be between 5 and 40 characters.",
      });
      return;
    }

    // CTA PRIMARY: min 5, max 20
    if (
      !formData.cta_primary ||
      formData.cta_primary.length < 5 ||
      formData.cta_primary.length > 20
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "The button text must be between 5 and 20 characters.",
      });
      return;
    }

    // IMG URL: not null and valid format
    if (!formData.img_url || !isValidUrl(formData.img_url)) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "The image URL is required and must be valid.",
      });
      return;
    }

    // FOOTER DISCLAIMER: min 5, max 40
    if (
      !formData.footer_disclaimer ||
      formData.footer_disclaimer.length < 5 ||
      formData.footer_disclaimer.length > 40
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "The disclaimer must be between 5 and 40 characters.",
      });
      return;
    }

    try {
      await createAdvertisementById(
        realmId,
        token,
        formData.title,
        formData.tag,
        formData.sub_title,
        formData.description,
        formData.cta_primary,
        formData.img_url,
        formData.footer_disclaimer,
        language
      );

      Swal.fire({
        title: t("adversing-realm.success.title"),
        text: t("adversing-realm.success.description"),
        icon: "success",
        confirmButtonText: t("adversing-realm.success.action"),
        customClass: {
          confirmButton:
            "bg-indigo-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "ES" | "EN" | "PT");
  };

  const getValue = (key: keyof RealmAdvertisement) =>
    String(formData[key] ?? "");

  return (
    <div className="text-gray-200 flex flex-col items-center md:p-12 space-y-12">
      {/* Vista del Reino */}
      <section className="p-5 bg-gradient-to-bl from-[#1a1a1a] via-[#1a1a1a] to-black rounded-xl w-full">
        <div className="container mx-auto px-4 space-y-16">
          <div className="text-center mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
              <h1 className="text-5xl font-bold text-white mb-4 md:mb-0">
                {t("adversing-realm.title")} -{" "}
                <span className="text-[#7a5b26]">
                  {t("adversing-realm.subtitle")}
                </span>
              </h1>

              {/* Idioma */}
              <div className="flex items-center">
                <label className="text-gray-300 font-semibold mr-2">
                  {t("adversing-realm.language")}
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-[#1a1a1a] text-white p-2 rounded border border-[#7a5b26]"
                >
                  <option value="ES">
                    {t("adversing-realm.select-language.es")}
                  </option>
                  <option value="EN">
                    {t("adversing-realm.select-language.en")}
                  </option>
                  <option value="PT">
                    {t("adversing-realm.select-language.pt")}
                  </option>
                </select>
              </div>
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
                <div className="absolute inset-0 bg-gradient-to-t from-black via-[#1a1a1a] to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white text-2xl font-semibold px-6 text-center">
                    {formData.footer_disclaimer}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 text-white text-center md:text-left px-4 mb-1">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                {formData.title}{" "}
                <span className="text-[#7a5b26] pb-2">{formData.tag}</span>
              </h2>
              <p className="text-gray-300 leading-relaxed text-xl mb-4">
                {formData.sub_title}
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mb-8">
                {formData.description}
              </p>

              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href={formData.redirect}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-gradient-to-r from-[#3a2f17] via-[#1a1a1a] to-black text-white font-medium py-3 px-8 rounded-full shadow-lg hover:from-[#4c3b1b] hover:to-[#2c2c2c] focus:ring-4 focus:ring-[#7a5b26] transition">
                    {formData.cta_primary}
                  </button>
                </a>
                <button
                  className="bg-gradient-to-r from-[#7a5b26] to-[#a7863b] text-white font-medium py-3 px-8 rounded-full shadow-lg hover:from-[#9c7b30] hover:to-[#c3a650] focus:ring-4 focus:ring-[#7a5b26] transition"
                  onClick={() => handleCopy(formData.realmlist)}
                >
                  {copied ? "¡Copiado!" : "Realmlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de edición */}
      <section
        className="relative rounded-lg shadow-xl p-8 w-full max-w-6xl bg-[#1a1a1a] border border-[#7a5b26] transition-shadow duration-300 hover:shadow-[0_0_25px_5px_#7a5b26]"
        style={{
          backgroundImage: "linear-gradient(#1a1a1a, #111111)",
        }}
      >
        <h2 className="text-2xl font-extrabold text-[#e5a943] mb-8 tracking-wide">
          {t("adversing-realm.description")}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
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
              placeholder: t(
                "adversing-realm.form.description-text-placeholder"
              ),
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
          ].map(({ label, name, textarea, placeholder }) => (
            <div key={name} className="col-span-1">
              <label
                htmlFor={name}
                className="block mb-2 font-semibold text-gray-300"
              >
                {label}
              </label>
              {textarea ? (
                <textarea
                  id={name}
                  name={name}
                  placeholder={placeholder}
                  value={getValue(name as keyof RealmAdvertisement)}
                  onChange={handleChange}
                  minLength={5}
                  maxLength={100}
                  rows={4}
                  className="text-xl w-full rounded-md bg-[#111111] p-3 text-gray-200 border border-[#7a5b26] focus:border-[#c9aa57] focus:outline-none transition resize-none"
                  required
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  type="text"
                  minLength={5}
                  maxLength={40}
                  placeholder={placeholder}
                  value={getValue(name as keyof RealmAdvertisement)}
                  onChange={handleChange}
                  className="w-full rounded-md bg-[#111111] p-3 text-gray-200 border border-[#7a5b26] focus:border-[#c9aa57] focus:outline-none transition"
                  required
                />
              )}
            </div>
          ))}

          <div className="col-span-full">
            <button
              type="submit"
              className="select-none bg-gradient-to-r from-[#7a1f1f] to-[#a52a2a] text-[#ffcc33] font-semibold px-6 py-3 rounded border border-[#a52a2a] hover:brightness-110 transition"
            >
              {t("adversing-realm.btn.primary")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdvertisingRealmForm;
