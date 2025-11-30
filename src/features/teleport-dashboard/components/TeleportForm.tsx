import React from "react";
import { TeleportFormData, FormErrors } from "../types";
import { FIELD_CONSTRAINTS, POSITION_FIELDS, MAP_FIELDS } from "../constants";

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

const TeleportForm: React.FC<TeleportFormProps> = ({
  form,
  errors,
  submitting,
  onChange,
  onSubmit,
  t,
}) => {
  const fields = [
    {
      label: t("teleport-dashboard.labels.name"),
      name: "name",
      type: "text" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.position_x"),
      name: "position_x",
      type: "number" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.position_y"),
      name: "position_y",
      type: "number" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.position_z"),
      name: "position_z",
      type: "number" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.img_url"),
      name: "img_url",
      type: "url" as const,
      required: false,
    },
    {
      label: t("teleport-dashboard.labels.map"),
      name: "map",
      type: "number" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.orientation"),
      name: "orientation",
      type: "number" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.zone"),
      name: "zone",
      type: "number" as const,
      required: true,
    },
    {
      label: t("teleport-dashboard.labels.area"),
      name: "area",
      type: "number" as const,
      required: true,
    },
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 md:p-10 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide transition-all duration-300 hover:border-slate-600/70 hover:shadow-lg"
    >
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-200 mb-3">
          {t("teleport-dashboard.title")}
        </h2>
        <div className="h-px bg-slate-700/50"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {fields.map(({ label, name, type, required }) => {
          const fieldValue = form[name as keyof typeof form];
          const fieldError = errors[name];
          const constraints = FIELD_CONSTRAINTS[name];

          return (
            <div key={name} className="flex flex-col">
              <label className="mb-2 font-semibold text-slate-300 text-base">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                type={type}
                name={name}
                value={fieldValue}
                onChange={onChange}
                className={`w-full p-4 rounded-lg bg-slate-900/50 border transition-all duration-300 text-white text-base placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  fieldError
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-600/50 focus:border-slate-500 focus:ring-slate-500/20 hover:border-slate-500/60"
                }`}
                required={required}
                {...(constraints &&
                  "maxLength" in constraints && {
                    maxLength: constraints.maxLength,
                  })}
                {...(POSITION_FIELDS.includes(
                  name as (typeof POSITION_FIELDS)[number]
                ) &&
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
                  "step" in constraints && {
                    min: constraints.min,
                    step: constraints.step,
                  })}
                {...(name === "img_url" && {
                  pattern: "https?://.+",
                  title:
                    "Please enter a valid URL starting with http:// or https://",
                })}
              />
              {fieldError && (
                <p className="mt-1 text-sm text-red-400 font-medium">
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}

        <div className="col-span-2">
          <label className="block mb-3 font-bold text-slate-300 text-lg">
            {t("teleport-dashboard.form-teleport.faction.title")}
          </label>
          <select
            name="faction"
            value={form.faction}
            onChange={onChange}
            className="w-full p-5 rounded-lg bg-slate-900/50 border border-slate-600/50 focus:border-slate-500 focus:ring-1 focus:ring-slate-500/20 outline-none transition-all duration-300 text-white text-lg hover:border-slate-500/60"
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

        <div className="col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg border border-slate-600/50 hover:border-slate-500/60 transition-all duration-300 text-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>
                  {t("teleport-dashboard.buttons.submitting") || "Creating..."}
                </span>
              </>
            ) : (
              t("teleport-dashboard.buttons.add-teleport")
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TeleportForm;
