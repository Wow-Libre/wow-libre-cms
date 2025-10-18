import { createFaq, deleteFaq, getFaqs } from "@/api/faqs";
import { FaqType } from "@/enums/FaqType";
import { FaqsModel } from "@/model/model";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface FaqsDashboardProps {
  token: string;
  t: (key: string) => string;
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
        title: "Error",
        text: err.message,
        confirmButtonText: "Aceptar",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFaqs();
  }, [selectedLanguage, selectedType]);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim() || !language || !type) return;

    try {
      await createFaq(question, answer, type, language, token);

      Swal.fire({
        icon: "success",
        title: "FAQ agregada",
        text: "La pregunta frecuente fue agregada exitosamente.",
        confirmButtonText: "Aceptar",
      });
      fetchAllFaqs();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: err.message,
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleDelete = async (idFaq: number) => {
    try {
      await deleteFaq(idFaq, token);
      Swal.fire({
        icon: "success",
        title: "FAQ eliminada",
        text: "La pregunta frecuente fue eliminada exitosamente.",
        confirmButtonText: "Aceptar",
      });
      fetchAllFaqs();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: err.message,
        confirmButtonText: "Aceptar",
      });
    }
  };

  const filteredInfoFaqs = faqs.filter(
    (f) => f.language === selectedLanguage && f.type === selectedType
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Gestión de FAQs</h1>
        <p className="text-slate-300">
          Administra las preguntas frecuentes del servidor
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Formulario */}
          <section
            aria-label="Formulario para agregar FAQs"
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("faqs-dashboard.title")}
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-8">
              <div>
                <label
                  htmlFor="question"
                  className="block mb-2 font-semibold text-slate-200 text-lg"
                >
                  {t("faqs-dashboard.question")}
                </label>
                <input
                  id="question"
                  type="text"
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="answer"
                  className="block mb-2 font-semibold text-slate-200 text-lg"
                >
                  {t("faqs-dashboard.answer")}
                </label>
                <textarea
                  id="answer"
                  rows={4}
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300 resize-none"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-2 font-semibold text-slate-200 text-lg">
                    {t("faqs-dashboard.language.title")}
                  </label>
                  <select
                    className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                  >
                    <option value="ES">
                      {" "}
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

                <div className="flex-1">
                  <label className="block mb-2 font-semibold text-slate-200 text-lg">
                    {t("faqs-dashboard.type.title")}
                  </label>
                  <select
                    className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
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
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold px-8 py-4 rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 text-lg"
              >
                {t("faqs-dashboard.btn.add-faq")}
              </button>
            </form>
          </section>

          {/* Listado */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-10 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Lista de FAQs
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
            </div>
            <div className="mb-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-slate-200 text-lg">
                    {t("faqs-dashboard.filter-faqs-type")}
                  </label>
                  <select
                    className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
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
                  <label className="block mb-2 font-semibold text-slate-200 text-lg">
                    {t("faqs-dashboard.filter-faqs-language")}
                  </label>
                  <select
                    className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as FaqType)}
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
            </div>

            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-8 max-h-[60vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                FAQs Filtradas
              </h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="relative">
                    <div className="animate-spin h-12 w-12 text-blue-400"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                </div>
              ) : filteredInfoFaqs.length === 0 ? (
                <p className="text-gray-500">
                  {t("faqs-dashboard.empty.title")}
                </p>
              ) : (
                <ul className="space-y-6">
                  {filteredInfoFaqs.map((faq, idx) => (
                    <li
                      key={idx}
                      className="bg-gradient-to-br from-slate-600/50 to-slate-700/50 p-8 rounded-xl border border-slate-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                            {t("faqs-dashboard.language-text")}: {faq.language}
                          </span>
                          <span className="text-sm font-semibold text-green-300 bg-green-500/20 px-3 py-1 rounded-full">
                            {t("faqs-dashboard.type-text")}: {faq.type}
                          </span>
                        </div>

                        <h4 className="font-bold text-xl text-white leading-snug">
                          {faq.question}
                        </h4>

                        <p className="text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold px-6 py-3 rounded-lg border border-red-400/30 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                      >
                        {t("faqs-dashboard.btn.delete-faq")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FaqsDashboard;
