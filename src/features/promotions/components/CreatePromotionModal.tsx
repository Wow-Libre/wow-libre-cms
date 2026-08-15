"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CreatePromotionDto, PromotionItemDto } from "../types";
import { createPromotion } from "../api/promosApi";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardImageUploader } from "@/components/dashboard/image-uploader/DashboardImageUploader";
import { uploadPromotionImage } from "@/lib/upload/promotionImageUpload";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  realmId: number;
  language: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

// Enum de clases de World of Warcraft
const WOW_CLASSES = [
  { id: 0, key: "all", icon: "" },
  { id: 1, key: "warrior", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_warrior.jpg" },
  { id: 2, key: "paladin", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_paladin.jpg" },
  { id: 3, key: "hunter", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_hunter.jpg" },
  { id: 4, key: "rogue", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_rogue.jpg" },
  { id: 5, key: "priest", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_priest.jpg" },
  { id: 6, key: "death_knight", icon: "https://wow.zamimg.com/images/wow/icons/large/spell_deathknight_classicon.jpg" },
  { id: 7, key: "shaman", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_shaman.jpg" },
  { id: 8, key: "mage", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_mage.jpg" },
  { id: 9, key: "warlock", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_warlock.jpg" },
  { id: 10, key: "monk", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_monk.jpg" },
];

const TYPE_OPTIONS = [
  {
    key: "MONEY",
    accent: "amber" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m0-10c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0 0v2"
        />
      </svg>
    ),
  },
  {
    key: "LEVEL",
    accent: "blue" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    key: "ITEM",
    accent: "violet" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
];

const TYPE_ACCENTS: Record<typeof TYPE_OPTIONS[number]["accent"], {
  activeBg: string;
  activeBorder: string;
  activeRing: string;
  iconClass: string;
  iconBgClass: string;
}> = {
  amber: {
    activeBg: "from-amber-500/20 to-amber-700/10",
    activeBorder: "border-amber-400/60",
    activeRing: "ring-amber-400/40",
    iconClass: "text-amber-200",
    iconBgClass: "bg-amber-500/15 border-amber-400/40",
  },
  blue: {
    activeBg: "from-blue-500/20 to-blue-700/10",
    activeBorder: "border-blue-400/60",
    activeRing: "ring-blue-400/40",
    iconClass: "text-blue-200",
    iconBgClass: "bg-blue-500/15 border-blue-400/40",
  },
  violet: {
    activeBg: "from-violet-500/20 to-violet-700/10",
    activeBorder: "border-violet-400/60",
    activeRing: "ring-violet-400/40",
    iconClass: "text-violet-200",
    iconBgClass: "bg-violet-500/15 border-violet-400/40",
  },
};

const MAX_LENGTHS = {
  name: 30,
  description: 80,
  btn_text: 30,
  item_code: 30,
};

const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  realmId,
  language,
  t,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionDto>({
    img_url: "",
    name: "",
    description: "",
    btn_text: "",
    send_item: false,
    type: "MONEY",
    min_level: 0,
    max_level: 100,
    amount: 0,
    realm_id: realmId,
    class_character: 0,
    level: undefined,
    status: true,
    language: language,
    items: [],
  });

  const [items, setItems] = useState<PromotionItemDto[]>([]);
  const [currentItem, setCurrentItem] = useState<PromotionItemDto>({
    code: "",
    quantity: 1,
  });
  const [itemInputError, setItemInputError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      if (name === "send_item" && !checked) setItems([]);
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "class_character") {
          updated.class_character = Number(value);
        }
        if (name === "type") {
          if (value !== "MONEY") updated.amount = 0;
          if (value !== "LEVEL") updated.level = undefined;
          if (value !== "ITEM") {
            updated.send_item = false;
            setItems([]);
          } else {
            updated.send_item = true;
          }
        }
        return updated;
      });
    }
  };

  const setType = (key: string) => {
    setFormData((prev) => {
      const updated = { ...prev, type: key };
      if (key !== "MONEY") updated.amount = 0;
      if (key !== "LEVEL") updated.level = undefined;
      if (key !== "ITEM") {
        updated.send_item = false;
        setItems([]);
      } else {
        updated.send_item = true;
      }
      return updated;
    });
  };

  const setClassCharacter = (id: number) => {
    setFormData((prev) => ({ ...prev, class_character: id }));
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, img_url: url }));
  };

  const addItem = () => {
    if (itemInputError) setItemInputError("");
    const code = currentItem.code.trim();
    if (!code) {
      setItemInputError(
        t("promotions-dashboard.create-modal.errors.name-required"),
      );
      return;
    }
    if (!currentItem.quantity || currentItem.quantity < 1) {
      setItemInputError(
        t("promotions-dashboard.create-modal.errors.image-required"),
      );
      return;
    }
    setItems((prev) => [...prev, { code, quantity: currentItem.quantity }]);
    setCurrentItem({ code: "", quantity: 1 });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    if (!formData.img_url.trim()) {
      return t("promotions-dashboard.create-modal.errors.image-required");
    }
    if (!formData.name.trim()) {
      return t("promotions-dashboard.create-modal.errors.name-required");
    }
    if (formData.name.length > MAX_LENGTHS.name) {
      return t("promotions-dashboard.create-modal.errors.name-max-length");
    }
    if (formData.description.length > MAX_LENGTHS.description) {
      return t(
        "promotions-dashboard.create-modal.errors.description-max-length",
      );
    }
    if (
      (formData.min_level ?? 0) < 0 ||
      (formData.max_level ?? 0) < 0
    ) {
      return t("promotions-dashboard.create-modal.errors.levels-negative");
    }
    if (
      formData.type === "LEVEL" &&
      (!formData.level || formData.level <= 0)
    ) {
      return t(
        "promotions-dashboard.create-modal.errors.level-required-on-level-type",
      );
    }
    if (formData.type === "ITEM" && items.length === 0) {
      return t(
        "promotions-dashboard.create-modal.errors.items-required-on-item-type",
      );
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      Swal.fire({
        icon: "warning",
        title: t(
          "promotions-dashboard.create-modal.errors.validation-title",
        ),
        text: validationError,
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: CreatePromotionDto = {
        ...formData,
        status: true,
        amount: formData.type === "MONEY" ? (formData.amount || 0) : 0,
        items: formData.type === "ITEM" && items.length > 0 ? items : undefined,
        send_item: formData.type === "ITEM",
      };
      await createPromotion(payload, token);
      await Swal.fire({
        title: t("promotions-dashboard.create-modal.errors.create-success-title"),
        text: t("promotions-dashboard.create-modal.errors.create-success-text"),
        icon: "success",
        color: "white",
        background: "#0B1218",
        timer: 2500,
      });
      onSuccess();
      onClose();
      setFormData({
        img_url: "",
        name: "",
        description: "",
        btn_text: "",
        send_item: false,
        type: "MONEY",
        min_level: 0,
        max_level: 100,
        amount: 0,
        realm_id: realmId,
        class_character: 0,
        level: undefined,
        status: true,
        language: language,
        items: [],
      });
      setItems([]);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t("promotions-dashboard.create-modal.errors.create-error-title"),
        text:
          error.message ||
          t("promotions-dashboard.create-modal.errors.create-error-default"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const currentType = formData.type as "MONEY" | "LEVEL" | "ITEM";
  const showAmount = currentType === "MONEY";
  const showLevel = currentType === "LEVEL";
  const showItems = currentType === "ITEM";

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

  const inputBase =
    "w-full rounded-xl border px-4 py-3 text-lg text-white placeholder-slate-500 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const inputNormal =
    "border-slate-600/50 bg-slate-800/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 hover:border-slate-500";
  const inputError =
    "border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20";
  const labelClass =
    "flex items-center justify-between gap-2 text-lg font-semibold text-slate-200";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
      <div className="relative my-auto flex min-h-0 w-full max-w-6xl max-h-[min(90dvh,880px)] flex-col overflow-hidden rounded-2xl border border-slate-600/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
        {/* Botón de cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg border border-slate-700 bg-slate-800/50 p-2 text-slate-400 transition-all duration-200 hover:border-slate-500 hover:bg-slate-700/50 hover:text-white"
          aria-label={t("promotions-dashboard.create-modal.actions.cancel")}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="shrink-0 border-b border-slate-700/50 px-8 pb-6 pt-8 pr-14">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {t("promotions-dashboard.create-modal.title")}
            </h2>
          </div>
          <p className="ml-4 text-base text-slate-400">
            {t("promotions-dashboard.create-modal.subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="modal-scroll-slate min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 py-6">
            <div className="space-y-8">
              {/* SECCIÓN: Imagen de la promoción */}
              <section>
                <SectionHeader
                  title={t("promotions-dashboard.create-modal.fields.img-url")}
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                />
                <p className="mb-3 text-base text-slate-400">
                  {t(
                    "promotions-dashboard.create-modal.fields.img-url-helper",
                  )}
                </p>
                <DashboardImageUploader
                  token={token}
                  value={formData.img_url}
                  uploadFn={uploadPromotionImage}
                  onChange={handleImageUrlChange}
                  label=""
                  hint={t(
                    "promotions-dashboard.create-modal.fields.img-url-hint",
                  )}
                  context="promotion"
                  accent="indigo"
                  onError={(msg) =>
                    Swal.fire({
                      title: t(
                        "promotions-dashboard.create-modal.errors.image-upload-error",
                      ),
                      text: msg,
                      icon: "error",
                      color: "white",
                      background: "#0B1218",
                    })
                  }
                />
              </section>

              {/* SECCIÓN: Datos básicos */}
              <section>
                <SectionHeader
                  title={t(
                    "promotions-dashboard.create-modal.sections.basics",
                  )}
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M4 6h16M4 12h16M4 18h12"
                      />
                    </svg>
                  }
                />
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label htmlFor="promotion-name" className={labelClass}>
                      <span className="flex items-center gap-2">
                        <span className="text-cyan-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </span>
                        {t("promotions-dashboard.create-modal.fields.name")}
                        <span className="text-red-400">*</span>
                      </span>
                      {renderCharCount(formData.name.length, MAX_LENGTHS.name)}
                    </label>
                    <p className="mb-2 text-base text-slate-400">
                      {t(
                        "promotions-dashboard.create-modal.fields.name-helper",
                      )}
                    </p>
                    <input
                      id="promotion-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={MAX_LENGTHS.name}
                      required
                      disabled={loading}
                      placeholder={t(
                        "promotions-dashboard.create-modal.fields.name-placeholder",
                      )}
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>

                  {/* Btn text */}
                  <div>
                    <label htmlFor="promotion-btn-text" className={labelClass}>
                      <span className="flex items-center gap-2">
                        <span className="text-cyan-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                        {t("promotions-dashboard.create-modal.fields.btn-text")}
                        <span className="text-red-400">*</span>
                      </span>
                      {renderCharCount(formData.btn_text.length, MAX_LENGTHS.btn_text)}
                    </label>
                    <p className="mb-2 text-base text-slate-400">
                      {t(
                        "promotions-dashboard.create-modal.fields.btn-text-helper",
                      )}
                    </p>
                    <input
                      id="promotion-btn-text"
                      type="text"
                      name="btn_text"
                      value={formData.btn_text}
                      onChange={handleChange}
                      maxLength={MAX_LENGTHS.btn_text}
                      required
                      disabled={loading}
                      placeholder={t(
                        "promotions-dashboard.create-modal.fields.btn-text-placeholder",
                      )}
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>
                </div>
              </section>

              {/* Description (ancho completo) */}
              <section>
                <label htmlFor="promotion-description" className={labelClass}>
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h12"
                      />
                    </svg>
                  </span>
                  {t("promotions-dashboard.create-modal.fields.description")}
                  <span className="text-red-400">*</span>
                  </span>
                  {renderCharCount(
                    formData.description.length,
                    MAX_LENGTHS.description,
                  )}
                </label>
                <p className="mb-2 text-base text-slate-400">
                  {t(
                    "promotions-dashboard.create-modal.fields.description-helper",
                  )}
                </p>
                <textarea
                  id="promotion-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={MAX_LENGTHS.description}
                  rows={3}
                  required
                  disabled={loading}
                  placeholder={t(
                    "promotions-dashboard.create-modal.fields.description-placeholder",
                  )}
                  className={`${inputBase} resize-none ${inputNormal}`}
                />
              </section>

              {/* SECCIÓN: Recompensa */}
              <section className="rounded-2xl border border-slate-600/35 bg-slate-950/30 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:p-7">
                <SectionHeader
                  title={t(
                    "promotions-dashboard.create-modal.sections.reward",
                  )}
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  }
                />
                <p className="mb-4 text-base text-slate-400">
                  {t(
                    "promotions-dashboard.create-modal.fields.type-helper",
                  )}
                </p>

                {/* Type segmented control */}
                <div
                  role="radiogroup"
                  aria-label={t(
                    "promotions-dashboard.create-modal.fields.type",
                  )}
                  className="grid grid-cols-1 gap-3 md:grid-cols-3"
                >
                  {TYPE_OPTIONS.map((opt) => {
                    const active = currentType === opt.key;
                    const accent = TYPE_ACCENTS[opt.accent];
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        data-testid={`promotion-type-${opt.key.toLowerCase()}`}
                        onClick={() => setType(opt.key)}
                        className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-4 text-left transition-all ${
                          active
                            ? `${accent.activeBorder} bg-gradient-to-br ${accent.activeBg} text-white shadow-md ring-1 ${accent.activeRing}`
                            : "border-slate-600/50 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${accent.iconBgClass} ${accent.iconClass}`}
                          aria-hidden
                        >
                          {opt.icon}
                        </span>
                        <span className="text-base font-bold">
                          {t(
                            `promotions-dashboard.create-modal.fields.type-${opt.key.toLowerCase()}`,
                          )}
                        </span>
                        <span
                          className={`text-sm leading-snug ${active ? "text-white/85" : "text-slate-400"}`}
                        >
                          {t(
                            `promotions-dashboard.create-modal.fields.type-${opt.key.toLowerCase()}-desc`,
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input type="hidden" name="type" value={currentType} />

                {/* Conditional fields */}
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {showAmount && (
                    <div>
                      <label htmlFor="promotion-amount" className={labelClass}>
                        <span className="flex items-center gap-2">
                          <span className="text-amber-300">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m0-10c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0 0v2"
                              />
                            </svg>
                          </span>
                          {t("promotions-dashboard.create-modal.fields.amount")}
                        </span>
                      </label>
                      <p className="mb-2 text-base text-slate-400">
                        {t(
                          "promotions-dashboard.create-modal.fields.amount-helper",
                        )}
                      </p>
                      <input
                        id="promotion-amount"
                        type="number"
                        name="amount"
                        value={formData.amount || ""}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        disabled={loading}
                        placeholder={t(
                          "promotions-dashboard.create-modal.fields.amount-placeholder",
                        )}
                        className={`${inputBase} ${inputNormal}`}
                      />
                    </div>
                  )}

                  {showLevel && (
                    <div>
                      <label htmlFor="promotion-level" className={labelClass}>
                        <span className="flex items-center gap-2">
                          <span className="text-blue-300">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                          </span>
                          {t("promotions-dashboard.create-modal.fields.level-target")}
                          <span className="text-red-400">*</span>
                        </span>
                      </label>
                      <p className="mb-2 text-base text-slate-400">
                        {t(
                          "promotions-dashboard.create-modal.fields.level-helper",
                        )}
                      </p>
                      <input
                        id="promotion-level"
                        type="number"
                        name="level"
                        value={formData.level ?? ""}
                        onChange={handleChange}
                        min="1"
                        required
                        disabled={loading}
                        placeholder={t(
                          "promotions-dashboard.create-modal.fields.level-placeholder",
                        )}
                        className={`${inputBase} ${inputNormal}`}
                      />
                    </div>
                  )}
                </div>

                {/* Items list (solo en ITEM) */}
                {showItems && (
                  <div className="mt-6">
                    <SectionSubHeader
                      title={t(
                        "promotions-dashboard.create-modal.fields.items",
                      )}
                      icon={
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      }
                    />
                    <p className="mb-3 text-base text-slate-400">
                      {t(
                        "promotions-dashboard.create-modal.fields.items-helper",
                      )}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <input
                        type="text"
                        value={currentItem.code}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            code: e.target.value,
                          })
                        }
                        maxLength={MAX_LENGTHS.item_code}
                        disabled={loading}
                        placeholder={t(
                          "promotions-dashboard.create-modal.fields.item-code-placeholder",
                        )}
                        className={`${inputBase} min-w-0 flex-1 ${inputNormal}`}
                      />
                      <input
                        type="number"
                        value={currentItem.quantity}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            quantity: Number(e.target.value) || 1,
                          })
                        }
                        min="1"
                        disabled={loading}
                        placeholder={t(
                          "promotions-dashboard.create-modal.fields.item-quantity-placeholder",
                        )}
                        className={`${inputBase} w-full sm:w-32 ${inputNormal}`}
                      />
                      <button
                        type="button"
                        onClick={addItem}
                        disabled={loading}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/15 px-5 py-3 text-base font-semibold text-violet-200 transition hover:bg-violet-500/25 disabled:opacity-60"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        {t(
                          "promotions-dashboard.create-modal.fields.items-add-button",
                        )}
                      </button>
                    </div>

                    {itemInputError && (
                      <p className="mt-2 text-base text-red-400 font-medium">
                        {itemInputError}
                      </p>
                    )}

                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-slate-400">
                        {items.length === 1
                          ? t(
                              "promotions-dashboard.create-modal.fields.items-list-count-one",
                            )
                          : t(
                              "promotions-dashboard.create-modal.fields.items-list-count-other",
                              { count: items.length },
                            )}
                      </p>
                      {items.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-600/50 bg-slate-900/30 px-4 py-4 text-base text-slate-500">
                          {t(
                            "promotions-dashboard.create-modal.fields.items-list-empty",
                          )}
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {items.map((item, index) => (
                            <li
                              key={`${item.code}-${index}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-3"
                            >
                              <span className="min-w-0 flex-1 break-all text-base font-medium text-slate-200">
                                <span className="text-violet-300">{item.code}</span>{" "}
                                <span className="text-slate-500">×</span>{" "}
                                <span className="text-slate-300">{item.quantity}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={loading}
                                className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200 disabled:opacity-60"
                                aria-label={t(
                                  "promotions-dashboard.create-modal.fields.items-remove-button",
                                )}
                              >
                                {t(
                                  "promotions-dashboard.create-modal.fields.items-remove-button",
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* SECCIÓN: Restricciones */}
              <section>
                <SectionHeader
                  title={t(
                    "promotions-dashboard.create-modal.sections.restrictions",
                  )}
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  }
                />

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  {/* Min level */}
                  <div>
                    <label htmlFor="promotion-min-level" className={labelClass}>
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-300">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </span>
                        {t("promotions-dashboard.create-modal.fields.min-level")}
                        <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <p className="mb-2 text-base text-slate-400">
                      {t(
                        "promotions-dashboard.create-modal.fields.min-level-helper",
                      )}
                    </p>
                    <input
                      id="promotion-min-level"
                      type="number"
                      name="min_level"
                      value={formData.min_level}
                      onChange={handleChange}
                      min="0"
                      required
                      disabled={loading}
                      placeholder="0"
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>

                  {/* Max level */}
                  <div>
                    <label htmlFor="promotion-max-level" className={labelClass}>
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-300">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                        {t("promotions-dashboard.create-modal.fields.max-level")}
                        <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <p className="mb-2 text-base text-slate-400">
                      {t(
                        "promotions-dashboard.create-modal.fields.max-level-helper",
                      )}
                    </p>
                    <input
                      id="promotion-max-level"
                      type="number"
                      name="max_level"
                      value={formData.max_level}
                      onChange={handleChange}
                      min="0"
                      required
                      disabled={loading}
                      placeholder="100"
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>
                </div>

                {/* Class character */}
                <div className="mt-5">
                  <p className={`mb-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}>
                    {t(
                      "promotions-dashboard.create-modal.fields.class-character",
                    )}
                  </p>
                  <p className="mb-3 text-base text-slate-400">
                    {t(
                      "promotions-dashboard.create-modal.fields.class-character-helper",
                    )}
                  </p>
                  <div
                    role="radiogroup"
                    aria-label={t(
                      "promotions-dashboard.create-modal.fields.class-character",
                    )}
                    className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11"
                  >
                    {WOW_CLASSES.map((c) => {
                      const active = (formData.class_character ?? 0) === c.id;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          role="radio"
                          aria-checked={active}
                          aria-label={
                            c.id === 0
                              ? t("promotions-dashboard.create-modal.fields.all-classes")
                              : t(
                                  `promotions-dashboard.create-modal.fields.class-option.${c.key}`,
                                )
                          }
                          onClick={() => setClassCharacter(c.id)}
                          disabled={loading}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                            active
                              ? "border-cyan-400/60 bg-cyan-500/20 ring-2 ring-cyan-400/40"
                              : "border-slate-600/50 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/70"
                          }`}
                        >
                          {c.icon ? (
                            <img
                              src={c.icon}
                              alt=""
                              className="h-10 w-10 rounded-md border border-slate-600/50 object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-600/50 bg-slate-700/50 text-slate-300">
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </span>
                          )}
                          <span className="line-clamp-2 text-center text-[0.7rem] font-semibold leading-tight text-slate-200">
                            {c.id === 0
                              ? t("promotions-dashboard.create-modal.fields.all-classes")
                              : t(
                                  `promotions-dashboard.create-modal.fields.class-option.${c.key}`,
                                )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 justify-end gap-4 border-t border-slate-700/50 bg-slate-900/80 px-8 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-700/40 px-6 py-3 text-lg font-medium text-white transition-all duration-200 hover:bg-slate-600/40 disabled:opacity-60"
            >
              {t("promotions-dashboard.create-modal.actions.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                  {t("promotions-dashboard.create-modal.actions.creating")}
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {t("promotions-dashboard.create-modal.actions.create")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-2.5">
      <span className="text-cyan-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <h3 className="text-xl font-semibold text-white sm:text-2xl">{title}</h3>
    </div>
  );
}

function SectionSubHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2.5 border-t border-slate-700/50 pt-4">
      <span className="text-violet-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <h4 className="text-lg font-semibold text-slate-100">{title}</h4>
    </div>
  );
}

export default CreatePromotionModal;
