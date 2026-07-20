"use client";

import NavbarMinimalist from "@/components/navbar-minimalist";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

type SectionKey = "infoCollection" | "infoUsage" | "dataSharing" | "security" | "changes";

const SECTION_DEFS: { key: SectionKey; number: string }[] = [
  { key: "infoCollection", number: "01" },
  { key: "infoUsage", number: "02" },
  { key: "dataSharing", number: "03" },
  { key: "security", number: "04" },
  { key: "changes", number: "05" },
];

// Inline SVG icons (line style) — minimal, professional
const IconCheck = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10.5l3 3 7-7" />
  </svg>
);

const IconArrowUp = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 16V4m0 0l-5 5m5-5l5 5" />
  </svg>
);

const IconDoc = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 2h7l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1zM12 2v3h3M7 9h6M7 12h6M7 15h4" />
  </svg>
);

const IconClock = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="10" cy="10" r="7.5" />
    <path strokeLinecap="round" d="M10 6v4l2.5 1.5" />
  </svg>
);

const IconPrinter = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 7V3h10v4M5 14H3v-5a1 1 0 011-1h12a1 1 0 011 1v5h-2M5 12h10v5H5z" />
  </svg>
);

const IconList = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path strokeLinecap="round" d="M3 6h14M3 10h14M3 14h10" />
  </svg>
);

const IconChevron = ({ className = "h-3 w-3" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5l3 3 3-3" />
  </svg>
);

const IconArrowRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0l-4-4m4 4l-4 4" />
  </svg>
);

const IconLock = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="4" y="9" width="12" height="9" rx="1.5" />
    <path strokeLinecap="round" d="M7 9V6a3 3 0 016 0v3" />
  </svg>
);

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const [active, setActive] = useState<SectionKey>("infoCollection");
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(100, (scrolled / max) * 100) : 0;
      setProgress(pct);
      setShowTop(scrolled > 600);

      const offsets = SECTION_DEFS.map((s) => {
        const el = document.getElementById(s.key);
        if (!el) return { key: s.key, top: Number.POSITIVE_INFINITY };
        return { key: s.key, top: el.getBoundingClientRect().top };
      });

      const SPY = 180;
      const passed = offsets.filter((o) => o.top <= SPY);
      if (passed.length > 0) {
        setActive(passed[passed.length - 1].key as SectionKey);
      } else {
        setActive("infoCollection");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: "smooth" });
    setTocOpen(false);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-midnight text-slate-200 selection:bg-amber-400/30">
      {/* Reading progress — single thin line */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-px bg-slate-800/60"
        role="progressbar"
        aria-label={t("privacy.ui.sectionProgress")}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-amber-400/80 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <NavbarMinimalist />

      {/* HERO — editorial */}
      <header className="border-b border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/80">
              <span className="h-px w-6 bg-amber-400/40" />
              {t("privacy.ui.badge")}
              <span className="h-px w-6 bg-amber-400/40" />
            </div>

            <h1 className="mt-6 font-serif text-4xl font-medium leading-tight text-slate-50 md:text-5xl lg:text-6xl">
              {t("privacy.title")}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
              {t("privacy.intro")}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <IconDoc className="h-3.5 w-3.5" />
                {t("privacy.ui.version")}
              </span>
              <span className="hidden h-3 w-px bg-slate-700 sm:block" />
              <span className="inline-flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5" />
                {t("privacy.ui.lastUpdated")}
              </span>
              <span className="hidden h-3 w-px bg-slate-700 sm:block" />
              <span>{t("privacy.ui.readTime")}</span>
              <span className="hidden h-3 w-px bg-slate-700 sm:block" />
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-slate-400 transition hover:text-amber-300"
              >
                <IconPrinter className="h-3.5 w-3.5" />
                {t("privacy.ui.print")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE TOC */}
      <div className="sticky top-16 z-40 mx-auto max-w-6xl px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setTocOpen((o) => !o)}
          className="flex w-full items-center justify-between border-x border-b border-slate-800 bg-slate-900/85 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 backdrop-blur"
          aria-expanded={tocOpen}
        >
          <span className="inline-flex items-center gap-2">
            <IconList className="h-3.5 w-3.5" />
            {t("privacy.ui.tableOfContents")}
          </span>
          <IconChevron className={`h-3 w-3 transition-transform ${tocOpen ? "rotate-180" : ""}`} />
        </button>
        {tocOpen && (
          <nav className="border-x border-b border-slate-800 bg-slate-900/95">
            {SECTION_DEFS.map((s) => {
              const isActive = active === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => scrollTo(s.key)}
                  className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left text-sm transition ${
                    isActive
                      ? "border-amber-400 bg-slate-800/50 text-amber-100"
                      : "border-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[11px] text-slate-500">{s.number}</span>
                  <span className="flex-1">{t(`privacy.sections.${s.key}.title`)}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* MAIN */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 pb-24 pt-14 lg:grid-cols-[220px_1fr]">
        {/* DESKTOP TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {t("privacy.ui.tableOfContents")}
            </h2>
            <ul className="space-y-px">
              {SECTION_DEFS.map((s) => {
                const isActive = active === s.key;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => scrollTo(s.key)}
                      className={`group flex w-full items-start gap-3 border-l py-2 pl-4 pr-2 text-left text-sm transition ${
                        isActive
                          ? "border-amber-400 text-slate-100"
                          : "border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                      }`}
                    >
                      <span
                        className={`mt-0.5 font-mono text-[11px] tracking-wide ${
                          isActive ? "text-amber-300" : "text-slate-600"
                        }`}
                      >
                        {s.number}
                      </span>
                      <span className="flex-1 leading-snug">
                        {t(`privacy.sections.${s.key}.title`)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 border-t border-slate-800 pt-6">
              <Link
                href="/help"
                className="group inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-slate-500 transition hover:text-amber-300"
              >
                {t("privacy.ui.contactSupport")}
                <IconArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="min-w-0">
          {/* Privacy rights callout */}
          <aside className="mb-16 flex items-start gap-4 border-l-2 border-amber-400/60 bg-slate-900/30 py-5 pl-6 pr-6">
            <IconLock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
                {t("privacy.callout.title")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {t("privacy.callout.content")}
              </p>
            </div>
          </aside>

          {/* Sections */}
          <div className="space-y-16">
            {SECTION_DEFS.map((section) => (
              <section
                key={section.key}
                id={section.key}
                className="scroll-mt-32"
              >
                <header className="mb-6 border-b border-slate-800/80 pb-5">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs tracking-wider text-slate-600">
                      § {section.number}
                    </span>
                    <span className="h-px flex-1 bg-slate-800" />
                  </div>
                  <h2 className="mt-4 font-serif text-2xl font-medium text-slate-50 md:text-3xl">
                    {t(`privacy.sections.${section.key}.title`)}
                  </h2>
                </header>

                <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
                  <p className="text-base leading-[1.75] text-slate-300">
                    {t(`privacy.sections.${section.key}.content`)}
                  </p>

                  <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="border-t border-slate-800 pt-4 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0">
                      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                        {t("privacy.ui.keyPoints")}
                      </h3>
                      <ul className="space-y-2.5">
                        {(t(`privacy.sections.${section.key}.points`, {
                          returnObjects: true,
                        }) as string[]).map((point, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-400"
                          >
                            <span className="mt-1 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center text-amber-400">
                              <IconCheck className="h-3 w-3" />
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                </div>
              </section>
            ))}
          </div>

          {/* Signature block */}
          <div className="mt-20 border-t border-slate-800 pt-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="text-xs text-slate-500">
                <div className="font-mono uppercase tracking-[0.18em] text-slate-400">
                  {t("privacy.ui.version")}
                </div>
                <div className="mt-1">{t("privacy.ui.lastUpdated")}</div>
              </div>
              <Link
                href="/"
                className="group inline-flex items-center gap-2 border border-amber-400/40 bg-transparent px-5 py-2.5 text-sm font-medium text-amber-200 transition hover:border-amber-300 hover:bg-amber-400 hover:text-slate-900"
              >
                {t("privacy.ui.acceptAndReturn")}
                <IconArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Footer line */}
      <footer className="border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-slate-500">
          {t("privacy.sections.footer")}{" "}
          <Link
            href="/help"
            className="text-slate-400 underline-offset-4 transition hover:text-amber-300 hover:underline"
          >
            {t("privacy.sections.brand")}
          </Link>
        </div>
      </footer>

      {/* Back-to-top — minimal */}
      <button
        type="button"
        onClick={scrollTop}
        aria-label={t("privacy.ui.backToTop")}
        className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center border border-slate-700 bg-slate-900/90 text-slate-300 backdrop-blur transition-all duration-200 hover:border-amber-400/60 hover:text-amber-300 ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <IconArrowUp className="h-4 w-4" />
      </button>

      {/* Print */}
      <style jsx global>{`
        @media print {
          nav,
          aside button,
          button,
          .fixed {
            display: none !important;
          }
          section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          body {
            background: white !important;
            color: black !important;
          }
          h1, h2, h3 {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
