"use client";

import { getFaqs } from "@/api/faqs";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import { useUserContext } from "@/context/UserContext";
import { FaqType } from "@/enums/FaqType";
import { getWhatsAppSupportHref } from "@/features/purchases/utils/whatsappSupport";
import { FaqsModel } from "@/model/model";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const DISCORD_INVITE_URL = "https://discord.gg/xNcAfTAJRR";

const IconSearch = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path strokeLinecap="round" d="M12.8 12.8L17 17" />
  </svg>
);

const IconChevron = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5l5 5 5-5" />
  </svg>
);

const IconArrowUpRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 14L14 6m0 0H7.5M14 6v6.5" />
  </svg>
);

const HelpReveal = ({
  delayMs = 0,
  className,
  fadeOnly = false,
  children,
}: {
  delayMs?: number;
  className?: string;
  fadeOnly?: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`${
      fadeOnly ? "opacity-0" : "animate-fade-in-up"
    } motion-reduce:animate-none motion-reduce:opacity-100 ${className ?? ""}`}
    style={
      fadeOnly
        ? { animation: `fadeIn 0.8s ease-out ${delayMs}ms forwards` }
        : { animationDelay: `${delayMs}ms` }
    }
  >
    {children}
  </div>
);

const Help: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqsModel[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const { user } = useUserContext();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingFaqs(true);
        const response = await getFaqs(FaqType.SUPPORT, user.language);
        setFaqs(response);
        setOpenFaqId(null);
      } catch (error) {
        console.error("Failed to load support FAQs", error);
        setFaqs([]);
      } finally {
        setIsLoadingFaqs(false);
      }
    };

    fetchData();
  }, [user.language]);

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return faqs;

    return faqs.filter((faq) => {
      const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [faqs, query]);

  const toggleAnswer = (faqId: number) => {
    setOpenFaqId((current) => (current === faqId ? null : faqId));
  };

  return (
    <div className="relative min-h-screen overflow-visible bg-midnight pb-16">
      <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(56,189,248,0.10),transparent_38%),radial-gradient(circle_at_82%_84%,rgba(14,165,233,0.08),transparent_40%)]" />

      <div className="contenedor relative z-30">
        <NavbarAuthenticated />
      </div>

      <div className="relative z-10">
        <header className="border-b border-cyan-500/20">
          <div className="contenedor px-[2.4rem] py-[6rem] md:px-[4rem] md:py-[8rem]">
            <HelpReveal>
              <p className="inline-flex items-center gap-[1.2rem] text-[1.4rem] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                <span className="h-px w-[3.2rem] bg-cyan-400/40" />
                {t("support.badge")}
              </p>
            </HelpReveal>
            <HelpReveal delayMs={140}>
              <h1 className="mt-[2rem] max-w-[90rem] text-[4rem] font-semibold leading-tight tracking-tight text-white md:text-[5.2rem] lg:text-[6rem]">
                {t("support.title")}
              </h1>
            </HelpReveal>
            <HelpReveal delayMs={280}>
              <p className="mt-[2rem] max-w-[72rem] text-[1.8rem] leading-[1.7] text-slate-300 md:text-[2rem]">
                {t("support.subtitle")}
              </p>
            </HelpReveal>
          </div>
        </header>

        <section className="contenedor grid gap-[4rem] px-[2.4rem] py-[6rem] md:px-[4rem] md:py-[8rem] lg:grid-cols-[minmax(0,1fr)_42rem] lg:gap-[5.6rem]">
          <div>
            <HelpReveal delayMs={360} className="mb-[3.2rem] flex flex-col gap-[1.6rem] sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[3rem] font-semibold text-white md:text-[3.6rem]">
                  {t("support.faqs.title")}
                </h2>
                <p className="mt-[1.4rem] max-w-[64rem] text-[1.7rem] leading-[1.7] text-slate-300">
                  {t("support.faqs.description")}
                </p>
              </div>
              {!isLoadingFaqs && faqs.length > 0 && (
                <p className="text-[1.4rem] uppercase tracking-[0.18em] text-slate-500">
                  {t("support.faqs.count", { count: filteredFaqs.length })}
                </p>
              )}
            </HelpReveal>

            {!isLoadingFaqs && faqs.length > 0 && (
              <HelpReveal delayMs={460}>
                <label className="relative mb-[2.4rem] block">
                  <span className="sr-only">{t("support.faqs.searchPlaceholder")}</span>
                  <span className="pointer-events-none absolute left-[1.8rem] top-1/2 -translate-y-1/2 text-slate-500">
                    <IconSearch className="h-[2rem] w-[2rem]" />
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("support.faqs.searchPlaceholder")}
                    className="w-full rounded-2xl border border-cyan-500/25 bg-slate-950/70 py-[1.6rem] pl-[5.2rem] pr-[2rem] text-[1.7rem] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_28px_rgba(2,6,23,0.35)] outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_12px_32px_rgba(8,145,178,0.18)] focus:ring-0"
                  />
                </label>
              </HelpReveal>
            )}

            <HelpReveal delayMs={540}>
            <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-slate-950/95 shadow-[0_22px_60px_rgba(2,6,23,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-cyan-400/10">
              {isLoadingFaqs && (
                <div className="divide-y divide-slate-800/80" aria-busy="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="animate-pulse px-[2.8rem] py-[2.8rem]">
                      <div className="h-[1.8rem] w-3/4 rounded bg-slate-800" />
                      <div className="mt-[1.4rem] h-[1.4rem] w-1/2 rounded bg-slate-800/70" />
                    </div>
                  ))}
                </div>
              )}

              {!isLoadingFaqs && faqs.length === 0 && (
                <p className="px-[3.2rem] py-[6rem] text-center text-[1.8rem] leading-[1.7] text-slate-300">
                  {t("support.faqs.empty")}
                </p>
              )}

              {!isLoadingFaqs && faqs.length > 0 && filteredFaqs.length === 0 && (
                <p className="px-[3.2rem] py-[6rem] text-center text-[1.8rem] leading-[1.7] text-slate-300">
                  {t("support.faqs.noResults")}
                </p>
              )}

              {!isLoadingFaqs && filteredFaqs.length > 0 && (
                <dl>
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqId === faq.id;
                    const panelId = `faq-panel-${faq.id}`;
                    const buttonId = `faq-button-${faq.id}`;

                    return (
                      <div
                        key={faq.id}
                        className="animate-fade-in-up border-b border-cyan-500/10 last:border-b-0 motion-reduce:animate-none motion-reduce:opacity-100"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <dt>
                          <button
                            id={buttonId}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className="flex w-full items-start gap-[1.8rem] px-[2.8rem] py-[2.6rem] text-left transition-colors hover:bg-cyan-500/[0.06]"
                            onClick={() => toggleAnswer(faq.id)}
                          >
                            <span className="mt-[0.4rem] font-mono text-[1.5rem] tracking-wider text-cyan-400/80">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="flex-1 text-[2rem] font-medium leading-snug text-slate-100">
                              {faq.question}
                            </span>
                            <IconChevron
                              className={`mt-[0.6rem] h-[2rem] w-[2rem] shrink-0 text-slate-500 transition-transform duration-200 ${
                                isOpen ? "rotate-180 text-cyan-300" : ""
                              }`}
                            />
                          </button>
                        </dt>
                        <dd
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          hidden={!isOpen}
                          className="px-[2.8rem] pb-[2.8rem] pl-[6.2rem]"
                        >
                          <p className="border-t border-cyan-500/15 pt-[1.8rem] text-[1.7rem] leading-[1.75] text-slate-300">
                            {faq.answer}
                          </p>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </div>
            </HelpReveal>
          </div>

          <aside>
            <HelpReveal delayMs={620} fadeOnly className="sticky top-[8rem]">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-slate-950/95 p-[2.8rem] shadow-[0_22px_60px_rgba(2,6,23,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-cyan-400/10">
              <h2 className="text-[1.5rem] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                {t("support.contact.title")}
              </h2>
              <p className="mt-[1.6rem] text-[1.7rem] leading-[1.7] text-slate-300">
                {t("support.contact.subtitle")}
              </p>
              <div className="mt-[2.4rem] space-y-[1.4rem]">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-[2rem] py-[1.6rem] text-[1.6rem] font-medium text-cyan-100 shadow-[0_10px_28px_rgba(8,145,178,0.22)] transition hover:border-cyan-300/50 hover:bg-cyan-500/15 hover:shadow-[0_14px_36px_rgba(8,145,178,0.32)]"
                >
                  {t("support.contact.discord")}
                  <IconArrowUpRight className="h-[2rem] w-[2rem]" />
                </a>
                <a
                  href={getWhatsAppSupportHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-600/50 bg-slate-950/40 px-[2rem] py-[1.6rem] text-[1.6rem] font-medium text-slate-200 shadow-[0_8px_24px_rgba(2,6,23,0.35)] transition hover:border-cyan-400/35 hover:bg-slate-900/70 hover:shadow-[0_12px_32px_rgba(8,145,178,0.16)]"
                >
                  {t("support.contact.whatsapp")}
                  <IconArrowUpRight className="h-[2rem] w-[2rem]" />
                </a>
              </div>
            </div>
            </HelpReveal>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Help;
