"use client";

import { getFaqs } from "@/api/faqs";
import NavbarMinimalist from "@/components/navbar-minimalist";
import { useUserContext } from "@/context/UserContext";
import { FaqType } from "@/enums/FaqType";
import { FaqsModel } from "@/model/model";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const faqsDefault: FaqsModel[] = [];

const Help: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqsModel[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const { user } = useUserContext();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingFaqs(true);
        const response: FaqsModel[] = await getFaqs(
          FaqType.SUPPORT,
          user.language
        );
        setFaqs(response);
      } catch (error) {
        setFaqs(faqsDefault);
      } finally {
        setIsLoadingFaqs(false);
      }
    };

    fetchData();
  }, []);

  const [visibleAnswers, setVisibleAnswers] = useState<boolean[]>(
    Array(faqs.length).fill(false)
  );

  useEffect(() => {
    setVisibleAnswers(Array(faqs.length).fill(false));
  }, [faqs.length]);

  const toggleAnswer = (index: number) => {
    setVisibleAnswers((prevVisibleAnswers) => {
      const updatedVisibleAnswers = [...prevVisibleAnswers];
      updatedVisibleAnswers[index] = !updatedVisibleAnswers[index];
      return updatedVisibleAnswers;
    });
  };

  return (
    <div>
      <div className="contenedor">
        <NavbarMinimalist />
      </div>

      <div className="mt-6">
        <section
          id="features"
          className="container mx-auto px-4 py-6 md:py-10 lg:py-12"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-5 text-center">
            <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2">
              <div className="mr-2 h-2 w-2 rounded-full bg-cyan-300 animate-pulse"></div>
              <p className="text-sm font-semibold text-blue-400">
                Support Center
              </p>
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {t("support.title")}
            </h2>
            <p className="max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
              {t("support.subtitle")}
            </p>
          </div>
        </section>
      </div>

      <section className="relative">
        <div className="contenedor relative px-4 pb-14 pt-2 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 w-full select-none">
              <img
                src="https://static.wixstatic.com/media/5dd8a0_49558bb47b38464d88658e647a185e7f~mv2.png"
                alt="support"
                className="mx-auto h-52 w-52 rounded-full border border-cyan-500/20 object-cover shadow-[0_22px_55px_rgba(8,145,178,0.2)] sm:h-64 sm:w-64"
              />
            </div>

            <div className="mb-6 text-center">
              <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                {t("support.faqs.title")}
              </h1>
              <p className="text-sm text-slate-300 md:text-base">
                Resuelve dudas comunes o contacta al GM en tiempo real.
              </p>
            </div>

            <div className="mx-auto max-w-5xl rounded-2xl border border-slate-700/45 bg-slate-900/55 p-5 shadow-[0_12px_35px_rgba(2,6,23,0.45)] backdrop-blur-[1px] sm:p-8">
                <div className="mb-5 border-b border-slate-700/60 pb-4">
                  <h2 className="text-lg font-semibold text-white sm:text-xl">
                    Preguntas Frecuentes
                  </h2>
                  <p className="mt-1 text-base text-slate-300">
                    Soluciones rapidas para problemas comunes.
                  </p>
                </div>
                <div className="space-y-4">
                  {isLoadingFaqs && (
                    <div className="rounded-xl border border-slate-700/40 bg-slate-800/70 p-6 text-base text-slate-300">
                      Cargando preguntas frecuentes...
                    </div>
                  )}

                  {!isLoadingFaqs && faqs.length === 0 && (
                    <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-6 text-base leading-relaxed text-slate-200">
                      No hay FAQs disponibles por ahora. Puedes usar la burbuja de
                      chat con el GM para recibir ayuda directa.
                    </div>
                  )}

                  {!isLoadingFaqs && faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="group overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/60 transition-all duration-300 hover:border-cyan-400/45 hover:bg-slate-800/55 hover:shadow-lg hover:shadow-cyan-500/10"
                    >
                      <button
                        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-300 hover:bg-slate-700/30"
                        onClick={() => toggleAnswer(index)}
                      >
                        <h3 className="pr-4 text-lg font-semibold text-white sm:text-xl">
                          {faq.question}
                        </h3>
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 transition-all duration-300 group-hover:bg-cyan-500/30">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-cyan-300 transition-transform duration-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              style={{
                                transform: visibleAnswers[index]
                                  ? "rotate(45deg)"
                                  : "rotate(0deg)",
                              }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {visibleAnswers[index] && (
                        <div className="px-6 pb-6">
                          <div className="border-t border-slate-600/50 pt-5">
                            <p className="text-base leading-relaxed text-slate-300">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

      </section>
    </div>
  );
};

export default Help;
