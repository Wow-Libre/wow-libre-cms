"use client";

import NavbarMinimalist from "@/components/navbar-minimalist";
import React from "react";
import { useTranslation } from "react-i18next";

const TermsAndConditions = () => {
  const { t } = useTranslation();

  const sections = [
    {
      key: "license",
      icon: "⚖️",
      color: "gaming-primary-main"
    },
    {
      key: "liability", 
      icon: "🛡️",
      color: "gaming-status-success"
    },
    {
      key: "community",
      icon: "👥", 
      color: "gaming-secondary-main"
    },
    {
      key: "changes",
      icon: "🔄",
      color: "gaming-accent-purple"
    }
  ];

  return (
    <div className="min-h-screen bg-midnight">
      <NavbarMinimalist />
      
      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gaming-base-main rounded-full mb-6 shadow-2xl border border-gaming-primary-main/30">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gaming-primary-light mb-6">
            {t("terms.title")}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t("terms.intro")}
          </p>
        </div>

        {/* Copyright Disclaimer */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gaming-base-main/30 border-l-4 border-gaming-secondary-main rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-8 h-8 bg-gaming-secondary-main/20 rounded-full flex items-center justify-center">
                  <span className="text-gaming-secondary-main text-lg">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gaming-secondary-main mb-2">
                  {t("terms.sections.disclaimer.title")}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  <strong>{t("terms.sections.disclaimer.content")}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div
              key={section.key}
              className="group bg-gaming-base-main/50 backdrop-blur-sm border border-gaming-base-light/30 rounded-2xl p-8 transition-all duration-300 hover:border-gaming-primary-main/50 hover:shadow-xl hover:shadow-gaming-primary-main/10"
            >
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 bg-${section.color}/20 rounded-xl flex items-center justify-center mr-4 border border-${section.color}/30`}>
                  <span className="text-2xl">{section.icon}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {t(`terms.sections.${section.key}.title`)}
                </h2>
              </div>
              
              <p className="text-lg text-gray-200 leading-relaxed mb-6">
                {t(`terms.sections.${section.key}.content`)}
              </p>
              
              {/* Simple accent line */}
              <div className={`h-1 bg-${section.color}/60 rounded-full w-full`}></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-gaming-base-main/50 backdrop-blur-sm border border-gaming-base-light/30 rounded-2xl p-8">
            <p className="text-lg text-gray-300">
              {t("terms.sections.footer")}{" "}
              <a
                href="https://www.wowlibre.com"
                className="text-gaming-primary-light font-semibold hover:text-gaming-secondary-main transition-colors duration-300"
              >
                {t("terms.sections.brand")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
