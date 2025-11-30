"use client";

import { getFaqs } from "@/api/faqs";
import NavbarMinimalist from "@/components/navbar-minimalist";
import MeetTheTeam from "@/components/team";
import { useUserContext } from "@/context/UserContext";
import { FaqType } from "@/enums/FaqType";
import { FaqsModel } from "@/model/model";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const faqsDefault: FaqsModel[] = [];

const Help: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqsModel[]>([]);
  const { user } = useUserContext();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: FaqsModel[] = await getFaqs(
          FaqType.SUPPORT,
          user.language
        );
        setFaqs(response);
      } catch (error) {
        setFaqs(faqsDefault);
      }
    };

    fetchData();
  }, []);

  const [visibleAnswers, setVisibleAnswers] = useState<boolean[]>(
    Array(faqs.length).fill(false)
  );

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

      <div className="mt-10">
        <section
          id="features"
          className="container mx-auto px-4 space-y-6 py-8 md:py-12 lg:py-20"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center">
            {/* Badge decorativo */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 mb-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm font-semibold text-blue-400">
                Support Center
              </p>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              {t("support.title")}
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl">
              {t("support.subtitle")}
            </p>
          </div>
        </section>
      </div>

      <section className="relative overflow-hidden">
        <div className="contenedor py-8 px-4 sm:py-10 sm:px-6">
          <div className="mx-auto max-w-4xl">
            {/* Imagen original */}
            <div className="w-full mb-8 rounded-2xl select-none">
              <img
                src="https://static.wixstatic.com/media/5dd8a0_49558bb47b38464d88658e647a185e7f~mv2.png"
                alt="support"
                className="shadow shadow-teal-800 w-500% h-500 object-cover mx-auto rounded-full"
              />
            </div>

            {/* FAQs centradas */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("support.faqs.title")}
              </h1>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-xl transition-all duration-300 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden"
                >
                  <button
                    className="flex items-center justify-between w-full p-6 text-left transition-colors duration-300 hover:bg-slate-700/30"
                    onClick={() => toggleAnswer(index)}
                  >
                    <h3 className="font-semibold text-lg text-white pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-500/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-blue-400 transition-transform duration-300"
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
                      <div className="border-t border-slate-600/50 pt-4">
                        <p className="text-gray-300 leading-relaxed">
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

        <MeetTheTeam />
      </section>
    </div>
  );
};

export default Help;
