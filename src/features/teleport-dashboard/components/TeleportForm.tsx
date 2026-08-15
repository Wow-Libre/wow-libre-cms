"use client";

import React from "react";
import { TeleportFormData, FormErrors } from "../types";
import { FIELD_CONSTRAINTS, POSITION_FIELDS, MAP_FIELDS } from "../constants";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import { DashboardImageUploader } from "@/components/dashboard/image-uploader/DashboardImageUploader";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { uploadTeleportImage } from "@/lib/upload/teleportImageUpload";

/** Inputs más grandes que la paleta global para mejor lectura */
const INPUT_FIELD_CLASS = `${DASHBOARD_PALETTE.input} py-3.5 text-lg`;

interface TeleportFormProps {
  form: TeleportFormData;
  errors: FormErrors;
  submitting: boolean;
  token: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

const FACTION_OPTIONS: Array<{
  value: "ALL" | "HORDE" | "ALLIANCE";
  accent: "slate" | "red" | "blue";
  activeBg: string;
  activeBorder: string;
  activeRing: string;
  iconClass: string;
  iconBgClass: string;
  testId: string;
}> = [
  {
    value: "ALL",
    accent: "slate",
    activeBg: "from-slate-500/20 to-slate-700/10",
    activeBorder: "border-slate-400/60",
    activeRing: "ring-slate-400/40",
    iconClass: "text-slate-200",
    iconBgClass: "bg-slate-500/15 border-slate-400/40",
    testId: "all",
  },
  {
    value: "HORDE",
    accent: "red",
    activeBg: "from-red-500/20 to-red-700/10",
    activeBorder: "border-red-400/60",
    activeRing: "ring-red-400/40",
    iconClass: "text-red-200",
    iconBgClass: "bg-red-500/15 border-red-400/40",
    testId: "horde",
  },
  {
    value: "ALLIANCE",
    accent: "blue",
    activeBg: "from-blue-500/20 to-blue-700/10",
    activeBorder: "border-blue-400/60",
    activeRing: "ring-blue-400/40",
    iconClass: "text-blue-200",
    iconBgClass: "bg-blue-500/15 border-blue-400/40",
    testId: "alliance",
  },
];

function FactionIcon({ value, className }: { value: string; className?: string }) {
  if (value === "HORDE") {
    return (
      <svg className={className ?? "h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    );
  }
  if (value === "ALLIANCE") {
    return (
      <svg className={className ?? "h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  return (
    <svg className={className ?? "h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function FieldInput({
  name,
  label,
  icon,
  type,
  required,
  form,
  errors,
  onChange,
  constraints,
  t: _t,
}: {
  name: keyof TeleportFormData;
  label: string;
  icon: React.ReactNode;
  type: "text" | "number" | "url";
  required: boolean;
  form: TeleportFormData;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  constraints: (typeof FIELD_CONSTRAINTS)[keyof typeof FIELD_CONSTRAINTS];
  t: (key: string) => string;
}) {
  const fieldError = errors[name as string];
  const errorClass = fieldError
    ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/20"
    : "";
  return (
    <div className="space-y-2">
      <label
        htmlFor={`tp-${name}`}
        className={`flex items-center gap-2 text-lg font-medium ${DASHBOARD_PALETTE.label}`}
      >
        <span className="shrink-0 text-cyan-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
        <span>{label}</span>
        {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={`tp-${name}`}
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        placeholder={type === "number" ? "0" : undefined}
        className={`${INPUT_FIELD_CLASS} ${errorClass}`}
        required={required}
        {...(constraints && "maxLength" in constraints && { maxLength: constraints.maxLength })}
        {...(POSITION_FIELDS.includes(name as (typeof POSITION_FIELDS)[number]) &&
          constraints &&
          "min" in constraints &&
          "max" in constraints &&
          "step" in constraints && {
            min: constraints.min,
            max: constraints.max,
            step: constraints.step,
          })}
        {...(MAP_FIELDS.includes(name as (typeof MAP_FIELDS)[number]) &&
          constraints &&
          "min" in constraints &&
          "step" in constraints && { min: constraints.min, step: constraints.step })}
        {...(name === "img_url" && {
          pattern: "https?://.+",
          title: "URL válida (http:// o https://)",
        })}
      />
      {fieldError && (
        <p className="text-base font-medium text-red-400">{fieldError}</p>
      )}
    </div>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-5 sm:p-6`}>
      <h3 className={`mb-5 flex items-center gap-2.5 text-base font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted} sm:text-lg`}>
        <span className="text-cyan-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

const TeleportForm: React.FC<TeleportFormProps> = ({
  form,
  errors,
  submitting,
  token,
  onChange,
  onSubmit,
  t,
}) => {
  const currentFaction = (form.faction as "ALL" | "HORDE" | "ALLIANCE") ?? "ALL";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-b from-slate-800/95 via-slate-900/90 to-slate-950/95 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06] backdrop-blur-sm">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500"
        aria-hidden
      />
      <div className="relative p-6 sm:p-7">
        <div className="flex gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 to-blue-600/10 shadow-inner ring-1 ring-cyan-400/10"
            aria-hidden
          >
            <FactionIcon value="ALL" className="h-9 w-9 text-cyan-300" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${DASHBOARD_PALETTE.text}`}>
              {t("teleport-dashboard.title")}
            </h2>
            <p className={`mt-2 text-lg leading-relaxed ${DASHBOARD_PALETTE.textMuted}`}>
              {t("teleport-dashboard.panel-description")}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          {/* Datos básicos */}
          <FormSection
            title={t("teleport-dashboard.form-teleport.section-basic") || "Datos básicos"}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <FieldInput
                name="name"
                label={t("teleport-dashboard.labels.name")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h12" />
                  </svg>
                }
                type="text"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.name}
                t={t}
              />
              <div>
                <label
                  className={`mb-2 flex items-center gap-2 text-lg font-medium ${DASHBOARD_PALETTE.label}`}
                >
                  <span className="shrink-0 text-cyan-400 [&_svg]:h-5 [&_svg]:w-5">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </span>
                  <span>{t("teleport-dashboard.labels.img_url")}</span>
                  <span className="text-red-400">*</span>
                </label>
                <DashboardImageUploader
                  token={token}
                  value={form.img_url}
                  uploadFn={uploadTeleportImage}
                  onChange={(url) =>
                    onChange({
                      target: { name: "img_url", value: url },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  label=""
                  hint={t("teleport-dashboard.labels.img_url-hint")}
                  context="teleport"
                  accent="blue"
                  onError={(msg) =>
                    Swal.fire({
                      title: t("teleport-dashboard.errors.image-upload-error") ||
                        "Error al subir imagen",
                      text: msg,
                      icon: "error",
                      color: "white",
                      background: "#0B1218",
                    })
                  }
                />
                {errors["img_url"] && (
                  <p className="mt-2 text-base font-medium text-red-400">{errors["img_url"]}</p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Posición en el mundo */}
          <FormSection
            title={
              t("teleport-dashboard.form-teleport.section-position") || "Posición en el mundo"
            }
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              <FieldInput
                name="position_x"
                label={t("teleport-dashboard.labels.position_x")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4 4 4M8 17l4 4 4-4M3 12h18" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.position_x}
                t={t}
              />
              <FieldInput
                name="position_y"
                label={t("teleport-dashboard.labels.position_y")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10M7 16h10" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.position_y}
                t={t}
              />
              <FieldInput
                name="position_z"
                label={t("teleport-dashboard.labels.position_z")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4M3 7l9 4 9-4M3 7v10l9 4m0-14v14m0 0l9-4V7" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.position_z}
                t={t}
              />
              <FieldInput
                name="orientation"
                label={t("teleport-dashboard.labels.orientation")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.orientation}
                t={t}
              />
            </div>
          </FormSection>

          {/* Mapa y zona */}
          <FormSection
            title={t("teleport-dashboard.form-teleport.section-map") || "Mapa y zona"}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
              <FieldInput
                name="map"
                label={t("teleport-dashboard.labels.map")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.map}
                t={t}
              />
              <FieldInput
                name="zone"
                label={t("teleport-dashboard.labels.zone")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.zone}
                t={t}
              />
              <FieldInput
                name="area"
                label={t("teleport-dashboard.labels.area")}
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                }
                type="number"
                required
                form={form}
                errors={errors}
                onChange={onChange}
                constraints={FIELD_CONSTRAINTS.area}
                t={t}
              />
            </div>
          </FormSection>

          {/* Facción */}
          <FormSection
            title={t("teleport-dashboard.form-teleport.section-faction") || "Facción"}
            icon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            <div>
              <label
                className={`mb-3 flex items-center gap-2 text-base font-medium ${DASHBOARD_PALETTE.label}`}
              >
                <FactionIcon
                  value={currentFaction}
                  className={`h-5 w-5 ${
                    currentFaction === "HORDE"
                      ? "text-red-400"
                      : currentFaction === "ALLIANCE"
                        ? "text-blue-400"
                        : "text-slate-300"
                  }`}
                />
                {t("teleport-dashboard.form-teleport.faction.title")}
              </label>
              <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {FACTION_OPTIONS.map((opt) => {
                  const active = currentFaction === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      role="radio"
                      aria-checked={active}
                      data-testid={`teleport-faction-${opt.testId}`}
                      onClick={() => onChange({ target: { name: "faction", value: opt.value } } as React.ChangeEvent<HTMLInputElement>)}
                      className={`flex items-center justify-center gap-2.5 rounded-xl border px-4 py-3.5 text-base font-semibold transition-all ${
                        active
                          ? `${opt.activeBorder} bg-gradient-to-br ${opt.activeBg} text-white shadow-md ring-1 ${opt.activeRing}`
                          : "border-slate-600/50 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/70"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md border ${opt.iconBgClass} ${opt.iconClass}`}
                        aria-hidden
                      >
                        <FactionIcon value={opt.value} className="h-4 w-4" />
                      </span>
                      <span>
                        {opt.value === "ALL"
                          ? t("teleport-dashboard.form-teleport.faction.select-neutral")
                          : opt.value === "HORDE"
                            ? t("teleport-dashboard.form-teleport.faction.select-horde")
                            : t("teleport-dashboard.form-teleport.faction.select-alliance")}
                      </span>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" name="faction" value={currentFaction} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
                  <span>{t("teleport-dashboard.buttons.submitting") || "Creando..."}</span>
                </>
              ) : (
                <>
                  <svg className="h-6 w-6 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t("teleport-dashboard.buttons.add-teleport")}</span>
                </>
              )}
            </button>
          </FormSection>
        </form>
      </div>
    </div>
  );
};

export default TeleportForm;
