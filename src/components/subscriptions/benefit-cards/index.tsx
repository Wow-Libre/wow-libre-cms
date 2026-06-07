"use client";

export type BenefitIconType =
  | "tier11"
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
    case "tier11":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
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

export interface SubscriptionBenefitsGridProps {
  title: string;
  subtitle?: string;
  items: SubscriptionBenefitItem[];
}

export default function SubscriptionBenefitsGrid({
  title,
  subtitle,
  items,
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <SubscriptionBenefitCard key={item.id} index={index} {...item} />
        ))}
      </div>
    </section>
  );
}

export function SubscriptionBenefitsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40"
        />
      ))}
    </div>
  );
}
