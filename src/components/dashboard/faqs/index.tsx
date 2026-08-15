import { createFaq, deleteFaq, getFaqs } from "@/api/faqs";
import { FaqType } from "@/enums/FaqType";
import { FaqsModel } from "@/model/model";
import React, { useEffect, useState } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardSection } from "../layout";
import { DASHBOARD_PALETTE } from "../styles/dashboardPalette";
import {
  FaCommentDots,
  FaLanguage,
  FaQuestion,
  FaQuestionCircle,
  FaTag,
  FaTrashAlt,
} from "react-icons/fa";

interface FaqsDashboardProps {
  token: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

type FaqWithLanguage = FaqsModel & {
  language: string;
};

const FaqsDashboard: React.FC<FaqsDashboardProps> = ({ token, t }) => {
  const [faqs, setFaqs] = useState<FaqWithLanguage[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState("ES");
  const [type, setType] = useState<FaqType>(FaqType.SUPPORT);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ES");
  const [selectedType, setSelectedType] = useState<FaqType>(FaqType.SUPPORT);

  const fetchAllFaqs = async () => {
    setLoading(true);

    try {
      const faqsData = await getFaqs(selectedType, selectedLanguage);

      const faqsWithLang = faqsData.map((faq) => ({
        ...faq,
        language: selectedLanguage,
      }));

      setFaqs(faqsWithLang);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t("faqs-dashboard.alerts.fetch-error-title"),
        text: err.message,
        confirmButtonText: t("faqs-dashboard.buttons.accept"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, selectedType]);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim() || !language || !type) return;

    setSubmitting(true);
    try {
      await createFaq(question, answer, type, language, token);

      Swal.fire({
        icon: "success",
        title: t("faqs-dashboard.alerts.create-success-title"),
        text: t("faqs-dashboard.alerts.create-success-message"),
        confirmButtonText: t("faqs-dashboard.buttons.accept"),
      });
      setQuestion("");
      setAnswer("");
      fetchAllFaqs();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t("faqs-dashboard.alerts.create-error-title"),
        text: err.message,
        confirmButtonText: t("faqs-dashboard.buttons.accept"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (idFaq: number) => {
    const result = await Swal.fire({
      title: t("faqs-dashboard.alerts.delete-confirm-title"),
      text: t("faqs-dashboard.alerts.delete-confirm-message"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("faqs-dashboard.alerts.delete-confirm-yes"),
      cancelButtonText: t("faqs-dashboard.alerts.delete-confirm-no"),
    });
    if (!result.isConfirmed) return;

    try {
      await deleteFaq(idFaq, token);
      await fetchAllFaqs();
      Swal.fire({
        icon: "success",
        title: t("faqs-dashboard.alerts.delete-success-title"),
        text: t("faqs-dashboard.alerts.delete-success-message"),
        confirmButtonText: t("faqs-dashboard.buttons.accept"),
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t("faqs-dashboard.alerts.delete-error-title"),
        text: err.message,
        confirmButtonText: t("faqs-dashboard.buttons.accept"),
      });
    }
  };

  const filteredInfoFaqs = faqs.filter(
    (f) => f.language === selectedLanguage && f.type === selectedType
  );

  const renderLabel = (
    Icon: React.ComponentType<{ className?: string }>,
    text: string
  ) => (
    <span className="mb-2 flex items-center gap-2 text-base font-medium text-slate-200">
      <Icon className="h-5 w-5 text-blue-300/90" aria-hidden />
      <span>{text}</span>
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <section
        className={`flex flex-col gap-4 rounded-xl ${DASHBOARD_PALETTE.card} p-5 shadow-lg backdrop-blur-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <FaQuestionCircle className="h-5 w-5" aria-hidden />
            </div>
            <h1
              className={`text-2xl font-semibold ${DASHBOARD_PALETTE.text} sm:text-3xl`}
            >
              {t("faqs-dashboard.header.title")}
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm font-semibold text-blue-200">
              <span
                className="h-2 w-2 rounded-full bg-blue-300"
                aria-hidden
              />
              {t("faqs-dashboard.list.count", {
                count: filteredInfoFaqs.length,
              })}
            </span>
          </div>
          <p className={`mt-3 text-base ${DASHBOARD_PALETTE.textMuted}`}>
            {t("faqs-dashboard.header.subtitle")}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Formulario */}
        <div className="xl:col-span-2">
          <DashboardSection
            title={
              <span
                className={`text-lg font-semibold ${DASHBOARD_PALETTE.text} sm:text-xl`}
              >
                {t("faqs-dashboard.form.title")}
              </span>
            }
          >
            <form onSubmit={handleAddFaq} className="space-y-5">
              <div>
                <label htmlFor="faq-question" className="block">
                  {renderLabel(FaQuestion, t("faqs-dashboard.question"))}
                </label>
                <input
                  id="faq-question"
                  type="text"
                  className={DASHBOARD_PALETTE.input}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="faq-answer" className="block">
                  {renderLabel(FaCommentDots, t("faqs-dashboard.answer"))}
                </label>
                <textarea
                  id="faq-answer"
                  rows={5}
                  className={`${DASHBOARD_PALETTE.input} resize-y min-h-[7rem]`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="faq-language" className="block">
                    {renderLabel(
                      FaLanguage,
                      t("faqs-dashboard.language.title")
                    )}
                  </label>
                  <select
                    id="faq-language"
                    className={DASHBOARD_PALETTE.input}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                  >
                    <option value="ES">
                      {t("faqs-dashboard.language.es")}
                    </option>
                    <option value="EN">
                      {t("faqs-dashboard.language.en")}
                    </option>
                    <option value="PT">
                      {t("faqs-dashboard.language.pt")}
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="faq-type" className="block">
                    {renderLabel(FaTag, t("faqs-dashboard.type.title"))}
                  </label>
                  <select
                    id="faq-type"
                    className={DASHBOARD_PALETTE.input}
                    value={type}
                    onChange={(e) => setType(e.target.value as FaqType)}
                    required
                  >
                    <option value={FaqType.SUPPORT}>
                      {t("faqs-dashboard.type.support")}
                    </option>
                    <option value={FaqType.SUBSCRIPTION}>
                      {t("faqs-dashboard.type.subscription")}
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`flex w-full items-center justify-center gap-2 ${DASHBOARD_PALETTE.btnPrimary} mt-2 disabled:opacity-60`}
              >
                {submitting ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden
                    />
                    <span>{t("faqs-dashboard.form.submit-loading")}</span>
                  </>
                ) : (
                  <>
                    <FaQuestionCircle className="h-4 w-4" aria-hidden />
                    <span>{t("faqs-dashboard.btn.add-faq")}</span>
                  </>
                )}
              </button>
            </form>
          </DashboardSection>
        </div>

        {/* Listado */}
        <div className="xl:col-span-3">
          <DashboardSection
            title={
              <span
                className={`text-lg font-semibold ${DASHBOARD_PALETTE.text} sm:text-xl`}
              >
                {t("faqs-dashboard.list.title")}
              </span>
            }
            action={
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="faq-filter-language"
                  className="text-sm font-medium text-slate-400"
                >
                  {t("faqs-dashboard.list.filter-language")}
                </label>
                <select
                  id="faq-filter-language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ES">
                    {t("faqs-dashboard.language.es")}
                  </option>
                  <option value="EN">
                    {t("faqs-dashboard.language.en")}
                  </option>
                  <option value="PT">
                    {t("faqs-dashboard.language.pt")}
                  </option>
                </select>
                <label
                  htmlFor="faq-filter-type"
                  className="ml-2 text-sm font-medium text-slate-400"
                >
                  {t("faqs-dashboard.list.filter-type")}
                </label>
                <select
                  id="faq-filter-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as FaqType)}
                  className="rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={FaqType.SUPPORT}>
                    {t("faqs-dashboard.type.support")}
                  </option>
                  <option value={FaqType.SUBSCRIPTION}>
                    {t("faqs-dashboard.type.subscription")}
                  </option>
                </select>
              </div>
            }
            noPadding
          >
            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-400">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-400" />
                  <p className="text-sm">{t("faqs-dashboard.list.loading")}</p>
                </div>
              ) : filteredInfoFaqs.length === 0 ? (
                <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700/70 bg-slate-900/40 px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/80 text-blue-300 ring-1 ring-slate-700/60">
                    <FaQuestionCircle className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-base font-semibold ${DASHBOARD_PALETTE.text}`}>
                      {t("faqs-dashboard.list.empty-title")}
                    </p>
                    <p className="text-sm text-slate-400">
                      {t("faqs-dashboard.empty.title")}
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredInfoFaqs.map((faq) => (
                    <li
                      key={faq.id}
                      className="group rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-200">
                          <FaLanguage className="h-3 w-3" aria-hidden />
                          <span>{faq.language}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-200">
                          <FaTag className="h-3 w-3" aria-hidden />
                          <span>{faq.type}</span>
                        </span>
                      </div>
                      <h3
                        className={`mt-3 text-base font-semibold leading-snug ${DASHBOARD_PALETTE.text} sm:text-lg`}
                      >
                        {faq.question}
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                        {faq.answer}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(faq.id)}
                          className={`inline-flex items-center gap-1.5 ${DASHBOARD_PALETTE.btnDanger} text-sm`}
                          aria-label={t("faqs-dashboard.btn.delete-faq")}
                          title={t("faqs-dashboard.btn.delete-faq")}
                        >
                          <FaTrashAlt className="h-3.5 w-3.5" aria-hidden />
                          <span>{t("faqs-dashboard.btn.delete-faq")}</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default FaqsDashboard;
