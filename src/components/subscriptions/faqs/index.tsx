import { getFaqs } from "@/api/faqs";
import { FaqType } from "@/enums/FaqType";
import { FaqsModel } from "@/model/model";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface FaqsSubscriptionsProps {
  language: string;
}

const FaqsSubscriptions: React.FC<FaqsSubscriptionsProps> = ({ language }) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState<FaqsModel[]>();
  const [loading, setLoading] = useState(true);

  const toggleAnswer = (index: any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await getFaqs(FaqType.SUBSCRIPTION, language);
        setFaqs(data);
      } catch (err) {
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [language]);

  return (
    <div className="contenedor">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        <h2 className="text-3xl font-bold text-start text-white mb-8">
          {t("subscription.faqs.title")}
        </h2>
        <div className="space-y-4">
          {!loading &&
            faqs?.map((faq, index) => (
              <div key={index} className="border rounded-lg p-4">
                <button
                  onClick={() => toggleAnswer(index)}
                  className="flex justify-between items-center w-full text-left text-xl font-bold text-white"
                >
                  <span className="text-xl">{faq.question}</span>
                  <span className=" text-white">
                    {activeIndex === index ? "-" : "+"}
                  </span>
                </button>
                {activeIndex === index && (
                  <div className="mt-2 text-gray-300 text-lg">{faq.answer}</div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FaqsSubscriptions;
