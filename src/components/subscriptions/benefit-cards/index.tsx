"use client";

import { useState } from "react";

export type BenefitIconType =
  | "starterSet"
  | "mounts"
  | "accounts"
  | "professions"
  | "instant80"
  | "services"
  | "slots";

function BenefitIcon({ type }: { type: BenefitIconType }) {
  const props = {
    className: "h-5 w-5",
    fill: "none" as const,
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (type) {
    case "starterSet":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      );
    case "mounts":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      );
    case "accounts":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "professions":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
        </svg>
      );
    case "instant80":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "services":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      );
  }
}

function SubscriptionBenefitCard({
  icon,
  title,
  description,
  disclaimer,
  index,
}: {
  icon: BenefitIconType;
  title: string;
  description: string;
  disclaimer?: string;
  index: number;
}) {
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/45 bg-slate-900/40 p-6 shadow-lg shadow-black/40 transition-all duration-300 ease-out animate-fade-in-up hover:-translate-y-1.5 hover:border-slate-600/70 hover:bg-slate-900/55 hover:shadow-2xl hover:shadow-black/55 motion-reduce:animate-none motion-reduce:hover:translate-y-0 sm:p-7"
      style={index > 0 ? { animationDelay: `${index * 0.1}s` } : undefined}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />

      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300 shadow-inner transition-all duration-300 group-hover:scale-105 group-hover:border-slate-600 group-hover:text-slate-100">
          <BenefitIcon type={icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 transition-colors duration-300 group-hover:text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-slate-100 transition-colors duration-300 group-hover:text-white sm:text-xl">
            {title}
          </h3>
        </div>
      </div>

      <p className="mt-5 flex-1 text-base leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
        {description}
      </p>

      {disclaimer && (
        <p className="mt-4 border-t border-slate-800 pt-4 text-sm leading-relaxed text-slate-500 transition-colors duration-300 group-hover:border-slate-700 group-hover:text-slate-400">
          {disclaimer}
        </p>
      )}
    </article>
  );
}

export interface SubscriptionBenefitItem {
  id: string;
  icon: BenefitIconType;
  title: string;
  description: string;
  disclaimer?: string;
}

export interface SubscriptionBenefitCategory {
  id: string;
  name: string;
  subtitle?: string;
  /** Cuando true, la categoría muestra estado "Sin definir" en lugar de cards. */
  empty?: boolean;
  /** Etiqueta opcional para el badge del header (ej. "Próximamente"). */
  badge?: string;
  /** Variante visual del header. */
  tone?: "primary" | "muted";
  items: SubscriptionBenefitItem[];
}

export interface SubscriptionBenefitsGridProps {
  title: string;
  subtitle?: string;
  categories: SubscriptionBenefitCategory[];
  /** i18n helpers opcionales para el placeholder empty. */
  emptyTitle?: string;
  emptyBadge?: string;
  emptyDescription?: string;
  toggleExpandLabel?: string;
  toggleCollapseLabel?: string;
}

function CategoryEmptyState({
  badge,
  title,
  description,
}: {
  badge?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-700/60 bg-gradient-to-br from-slate-900/50 via-slate-950/40 to-slate-900/50 px-6 py-12 sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" aria-hidden />
            {badge}
          </span>
        )}

        <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-900/70 shadow-inner">
          <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </div>

        <h3 className="mt-5 font-gaming text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h3>
        {description && (
          <p className="mt-3 max-w-md text-base leading-relaxed text-slate-400 sm:text-lg">
            {description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500"
              aria-hidden
            >
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              {["???", "???", "???"][i]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryPanel({
  category,
  defaultOpen,
  emptyTitle,
  emptyBadge,
  emptyDescription,
  toggleExpandLabel,
  toggleCollapseLabel,
}: {
  category: SubscriptionBenefitCategory;
  defaultOpen: boolean;
  emptyTitle?: string;
  emptyBadge?: string;
  emptyDescription?: string;
  toggleExpandLabel?: string;
  toggleCollapseLabel?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isEmpty = category.empty || category.items.length === 0;
  const count = category.items.length;
  const tone = category.tone ?? "primary";

  const headerRing =
    tone === "primary"
      ? "border-cyan-400/40 from-cyan-500/15 via-cyan-500/5 to-transparent"
      : "border-slate-700/60 from-slate-800/40 via-slate-800/10 to-transparent";

  const headerIconBg =
    tone === "primary"
      ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
      : "border-slate-700/60 bg-slate-800/60 text-slate-300";

  const chevronColor =
    tone === "primary" ? "text-cyan-200" : "text-slate-300";

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/80 shadow-xl shadow-black/30 backdrop-blur-sm ${headerRing}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`benefit-category-${category.id}`}
        aria-label={open ? toggleCollapseLabel : toggleExpandLabel}
        className="group flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.02] sm:px-7 sm:py-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-inner sm:h-14 sm:w-14 ${headerIconBg}`}
            aria-hidden
          >
            <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 sm:text-xs">
                Categoría
              </p>
              {category.badge && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
                  {category.badge}
                </span>
              )}
            </div>
            <h3 className="font-gaming mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">
              {category.name}
            </h3>
            {category.subtitle && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-400 sm:text-base">
                {category.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`hidden rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] sm:inline-flex ${
              tone === "primary"
                ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                : "border-slate-700/60 bg-slate-800/60 text-slate-300"
            }`}
            aria-label={`${count} beneficios`}
          >
            {isEmpty ? "—" : `${count}`}
          </span>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-transform duration-300 ${headerIconBg} ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <svg className={`h-4 w-4 ${chevronColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
      </button>

      <div
        id={`benefit-category-${category.id}`}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-800/80 px-5 py-6 sm:px-7 sm:py-8">
            {isEmpty ? (
              <CategoryEmptyState
                badge={category.badge ?? emptyBadge}
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item, index) => (
                  <SubscriptionBenefitCard
                    key={item.id}
                    index={index}
                    {...item}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionBenefitsGrid({
  title,
  subtitle,
  categories,
  emptyTitle,
  emptyBadge,
  emptyDescription,
  toggleExpandLabel,
  toggleCollapseLabel,
}: SubscriptionBenefitsGridProps) {
  return (
    <section className="py-8 sm:py-12">
      <div className="mb-8 animate-fade-in-up sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Azeroth Pass
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{title}</h2>
        {subtitle && (
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5">
        {categories.map((category, index) => (
          <CategoryPanel
            key={category.id}
            category={category}
            defaultOpen={index === 0}
            emptyTitle={emptyTitle}
            emptyBadge={emptyBadge}
            emptyDescription={emptyDescription}
            toggleExpandLabel={toggleExpandLabel}
            toggleCollapseLabel={toggleCollapseLabel}
          />
        ))}
      </div>
    </section>
  );
}

export function SubscriptionBenefitsGridSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40"
        />
      ))}
    </div>
  );
}