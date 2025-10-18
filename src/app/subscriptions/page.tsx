"use client";
import { getPlanAvailable } from "@/api/plan";
import { buyProduct } from "@/api/store";
import { getSubscriptionActive } from "@/api/subscriptions";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import PremiumBenefitsCarrousel from "@/components/premium-carrousel";
import MultiCarouselSubs from "@/components/subscriptions/carrousel";
import FaqsSubscriptions from "@/components/subscriptions/faqs";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import { BuyRedirectDto, PlanModel } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCashRegister, FaCreditCard, FaMoneyCheckAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const Subscriptions = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [planModel, setPlan] = useState<PlanModel>();
  const [isSubscription, setIsSubscription] = useState<boolean>(false);

  const { user } = useUserContext();
  const token = Cookies.get("token");
  const router = useRouter();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planPromise = getPlanAvailable();
        const subscriptionPromise = token
          ? getSubscriptionActive(token)
          : Promise.resolve(false);
        const [plan, isSubscription] = await Promise.all([
          planPromise,
          subscriptionPromise,
        ]);

        setPlan(plan);
        setIsSubscription(isSubscription);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  const handlePayment = async () => {
    try {
      if (!token) {
        router.push("/login");
        return;
      }

      const response: BuyRedirectDto = await buyProduct(
        null,
        null,
        token,
        true,
        null,
        "null",
        1
      );

      const paymentData: Record<string, string> = {
        merchantId: response.merchant_id,
        accountId: response.account_id,
        description: response.description,
        referenceCode: response.reference_code,
        amount: response.amount,
        tax: response.tax,
        taxReturnBase: response.tax_return_base,
        currency: response.currency,
        signature: response.signature,
        test: response.test,
        buyerEmail: response.buyer_email,
        responseUrl: response.response_url,
        confirmationUrl: response.confirmation_url,
      };

      const form = document.createElement("form");
      form.method = "POST";
      form.action = response.redirect;

      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(paymentData[key]);
        form.appendChild(input);
        form.target = "_blank";
      });

      document.body.appendChild(form);

      form.submit();
    } catch (error: any) {
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: "Opss!",
          html: `
                 <p><strong>Message:</strong> ${error.message}</p>
                 <hr style="border-color: #444; margin: 8px 0;">
                 <p><strong>Transaction ID:</strong> ${error.transactionId}</p>
               `,
          color: "white",
          background: "#0B1218",
        });
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
      });
    }
  };

  const handleRedirectAccounts = async () => {
    router.push("/accounts");
  };
  return (
    <div>
      <div className="contenedor">
        <NavbarAuthenticated />
      </div>

      <div
        className="text-white mb-20 mt-14"
        style={{
          background: "linear-gradient(to right, #000000, #434343, #c0c0c0)",
        }}
      >
        <div className="contenedor mx-auto px-6 py-12 lg:py-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {/* Contenido a la izquierda */}
            <div className="flex flex-col justify-between max-w-2xl w-full">
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-10">
                  {t("subscription.title")}
                </h2>
                <p className="text-lg sm:text-xl lg:text-3xl mb-6 break-words">
                  {t("subscription.description")}
                </p>
                <div className="mb-4">
                  <div className="flex items-center space-x-4">
                    <p className="text-lg sm:text-xl lg:text-3xl line-through">
                      ${Math.floor(planModel?.price ?? 0)}
                      {t("subscription.recurrency")}
                    </p>
                    <span className="bg-green-500 text-white text-sm sm:text-lg font-semibold px-3 py-1 rounded-full">
                      {planModel?.discount}% OFF
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-4xl pt-2 font-semibold">
                    ${Math.floor(planModel?.discounted_price ?? 0)}
                    {t("subscription.recurrency")}
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:mt-10">
                {!loading && user.logged_in ? (
                  isSubscription ? (
                    <Link
                      href="/accounts"
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold mb-4"
                    >
                      {t("subscription.btn-subscription-active.text")}
                    </Link>
                  ) : (
                    <button
                      onClick={handlePayment}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold mb-4"
                    >
                      {t("subscription.btn-active.text")}
                    </button>
                  )
                ) : (
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold mb-4"
                  >
                    {t("subscription.btn-inactive.text")}
                  </Link>
                )}

                <p className="text-lg pt-4 break-words">
                  {t("subscription.disclaimer")}
                </p>
              </div>
            </div>
            {/* Contenido a la derecha (imágenes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-16">
              <div className="relative h-[350px] sm:h-[450px] w-full sm:w-[300px] select-none mx-auto overflow-hidden">
                <img
                  src="https://pbs.twimg.com/media/GM6DUOyWIAA5HzL.jpg"
                  alt="Premium-subscription"
                  className="object-cover rounded-xl w-full h-full transition duration-300 hover:opacity-75"
                />
              </div>
              <div className="relative h-[350px] sm:h-[450px] w-full sm:w-[300px] select-none mx-auto overflow-hidden">
                <img
                  src="https://i.pinimg.com/736x/13/9f/ff/139fff3479f0069e9e5046ebe4f94e8e.jpg"
                  alt="premium"
                  className="object-cover rounded-xl w-full h-full transition duration-300 hover:opacity-75"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-reduce">
        <div className="py-12 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-start text-white mb-8">
              {t("subscription.benefits.title")}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Grow 1 */}
              <div
                className="p-8 rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:translate-y-[-10px]"
                style={{
                  background: "linear-gradient(to right, #1e1e2f, #3a3a3f)",
                }}
              >
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {t("subscription.benefits.primary.title")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                  <div className="text-gray-300 rounded-lg text-xl">
                    {t("subscription.benefits.primary.description")}
                  </div>
                </div>
              </div>

              {/* Grow 2 */}
              <div
                className="p-8 rounded-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:translate-y-[-10px]"
                style={{
                  background: "linear-gradient(to right, #1e1e2f, #3a3a3f)",
                }}
              >
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {t("subscription.benefits.secondary.title")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                  <div className="text-gray-300 rounded-lg text-xl">
                    {t("subscription.benefits.secondary.description")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PremiumBenefitsCarrousel t={t} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-start mb-4">
            <span className="bg-green-500 text-white text-xl font-semibold px-3 py-1 rounded-full mr-4">
              {planModel?.discount} OFF
            </span>
            <div className="flex flex-col">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mr-4 mb-1">
                {t("subscription.adversing.title")}
              </h2>
              <h3 className="text-xl text-gray-300">
                {t("subscription.adversing.description")}
              </h3>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <iframe
              width="800"
              height="350"
              src="https://www.youtube.com/embed/sxPji1VlsU0?si=EPa0DkocLJ-Nurx2"
              title="World of Warcraft: Battle for Azeroth Cinematic Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            ></iframe>
          </div>

          <MultiCarouselSubs t={t} />
        </div>
      </div>

      <div className="contenedor-minimun">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Sección de Precio */}
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2">
              {t("subscription.payment-methods.title")}
            </h2>
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-2">
                <span className="line-through text-gray-400 text-3xl mr-2">
                  ${planModel?.price}
                  {t("subscription.payment-methods.currency")}
                </span>
                <span className="bg-green-500 text-white text-2xl font-semibold px-3 py-1 rounded-full">
                  {planModel?.discount}% OFF
                </span>
              </div>
              <span className="text-4xl font-bold text-white">
                ${Math.round(planModel?.discounted_price || 15)}
                {t("subscription.payment-methods.currency")}
              </span>
            </div>
          </div>

          {/* Separador antes de la sección de Medios de Pago */}
          <div className="border-t border-gray-500 my-4"></div>

          {/* Título de Medios de Pago */}
          <h3 className="text-4xl lg:text-5xl font-bold text-white text-center mb-8">
            {t("subscription.payment-methods.sub-title")}
          </h3>

          {/* Sección de Medios de Pago en columna */}
          <div className="flex flex-col space-y-2 pt-5">
            {/* Componente de Medio de Pago 1 */}
            <div className="border rounded-lg p-3 flex items-center">
              <FaCreditCard className="text-white text-2xl mr-2" />
              <h4 className="text-2xl font-bold text-white mb-0">
                {t("subscription.payment-methods.payments.primary")}
              </h4>
            </div>

            {/* Componente de Medio de Pago 2 */}
            <div className="border rounded-lg p-3 flex items-center">
              <FaMoneyCheckAlt className="text-white text-2xl mr-2" />
              <h4 className="text-2xl font-bold text-white mb-0">
                {t("subscription.payment-methods.payments.second")}
              </h4>
            </div>

            {/* Componente de Medio de Pago 3 */}
            <div className="border rounded-lg p-3 flex items-center">
              <FaCashRegister className="text-white text-2xl mr-2" />
              <h4 className="text-2xl font-bold text-white mb-0">
                {t("subscription.payment-methods.payments.three")}
              </h4>
            </div>
          </div>

          {/* Botón al final */}
          <div className="flex flex-col justify-center mt-8 items-center w-full max-w-md mx-auto">
            <button
              onClick={isSubscription ? handleRedirectAccounts : handlePayment}
              className="bg-blue-500 text-white font-bold py-4 px-10 rounded-lg w-full"
            >
              {isSubscription
                ? t("subscription.payment-methods.btn-admin")
                : t("subscription.payment-methods.btn-payment")}
            </button>
            <p className="text-lg pt-4 break-words text-white text-center w-full">
              {t("subscription.payment-methods.disclaimer")}
            </p>
          </div>
        </div>
      </div>

      <FaqsSubscriptions language={user.language} />
    </div>
  );
};

export default Subscriptions;
