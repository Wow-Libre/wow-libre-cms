"use client";

import React from "react";
import { TeleportFormData, FormErrors } from "../types";
import { FIELD_CONSTRAINTS, POSITION_FIELDS, MAP_FIELDS } from "../constants";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

interface TeleportFormProps {
  form: TeleportFormData;
  errors: FormErrors;
  submitting: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

function FieldInput({
  name,
  label,
  type,
  required,
  form,
  errors,
  onChange,
  constraints,
  t,
}: {
  name: keyof TeleportFormData;
  label: string;
  type: "text" | "number" | "url";
  required: boolean;
  form: TeleportFormData;
  errors: FormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  constraints: (typeof FIELD_CONSTRAINTS)[keyof typeof FIELD_CONSTRAINTS];
  t: (key: string) => string;
}) {
  const fieldError = errors[name as string];
  return (
    <div className="flex flex-col">
      <label className={`mb-2.5 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={onChange}
        placeholder={type === "number" ? "0" : undefined}
        className={`min-h-[3.25rem] py-4 text-base ${DASHBOARD_PALETTE.input} ${fieldError ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""}`}
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
        <p className="mt-2 text-sm font-medium text-red-400">{fieldError}</p>
      )}
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${DASHBOARD_PALETTE.border} bg-slate-800/40 p-6 sm:p-7`}>
      <h3 className={`mb-5 text-sm font-semibold uppercase tracking-wider ${DASHBOARD_PALETTE.textMuted}`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

const TeleportForm: React.FC<TeleportFormProps> = ({
  form,
  errors,
  submitting,
  onChange,
  onSubmit,
  t,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Datos básicos */}
      <FormSection title={t("teleport-dashboard.form-teleport.section-basic") || "Datos básicos"}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          <FieldInput
            name="name"
            label={t("teleport-dashboard.labels.name")}
            type="text"
            required
            form={form}
            errors={errors}
            onChange={onChange}
            constraints={FIELD_CONSTRAINTS.name}
            t={t}
          />
          <FieldInput
            name="img_url"
            label={t("teleport-dashboard.labels.img_url")}
            type="url"
            required={false}
            form={form}
            errors={errors}
            onChange={onChange}
            constraints={FIELD_CONSTRAINTS.img_url}
            t={t}
          />
        </div>
      </FormSection>

      {/* Posición en el mundo */}
      <FormSection title={t("teleport-dashboard.form-teleport.section-position") || "Posición en el mundo"}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          <FieldInput
            name="position_x"
            label={t("teleport-dashboard.labels.position_x")}
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
      <FormSection title={t("teleport-dashboard.form-teleport.section-map") || "Mapa y zona"}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          <FieldInput
            name="map"
            label={t("teleport-dashboard.labels.map")}
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

      {/* Facción y envío */}
      <FormSection title={t("teleport-dashboard.form-teleport.section-faction") || "Facción"}>
        <div className="space-y-6">
          <div>
            <label className={`mb-2.5 block text-base font-medium ${DASHBOARD_PALETTE.label}`}>
              {t("teleport-dashboard.form-teleport.faction.title")}
            </label>
            <select
              name="faction"
              value={form.faction}
              onChange={onChange}
              className={`min-h-[3.25rem] py-4 text-base ${DASHBOARD_PALETTE.input}`}
            >
              <option value="ALL">
                {t("teleport-dashboard.form-teleport.faction.select-neutral")}
              </option>
              <option value="HORDE">
                {t("teleport-dashboard.form-teleport.faction.select-horde")}
              </option>
              <option value="ALLIANCE">
                {t("teleport-dashboard.form-teleport.faction.select-alliance")}
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 text-base ${DASHBOARD_PALETTE.btnPrimary} flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {submitting ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{t("teleport-dashboard.buttons.submitting") || "Creating..."}</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t("teleport-dashboard.buttons.add-teleport")}</span>
              </>
            )}
          </button>
        </div>
      </FormSection>
    </form>
  );
};

export default TeleportForm;
