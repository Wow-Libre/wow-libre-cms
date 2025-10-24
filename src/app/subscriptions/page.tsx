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
        className="text-white mb-20 mt-14 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
        }}
      >
        {/* Efecto de partículas de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-32 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-40 right-10 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-500"></div>
        </div>
        <div className="contenedor mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contenido a la izquierda */}
            <div className="flex flex-col justify-between max-w-2xl w-full order-2 lg:order-1">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 lg:mb-10 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                  {t("subscription.title")}
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-4 sm:mb-6 break-words text-gray-200 leading-relaxed">
                  {t("subscription.description")}
                </p>
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl line-through text-gray-400">
                      ${Math.floor(planModel?.price ?? 0)}
                      {t("subscription.recurrency")}
                    </p>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm sm:text-base md:text-lg font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit">
                      {planModel?.discount}% OFF
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl pt-2 font-semibold text-white">
                    ${Math.floor(planModel?.discounted_price ?? 0)}
                    {t("subscription.recurrency")}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 lg:mt-10">
                {!loading && user.logged_in ? (
                  isSubscription ? (
                    <Link
                      href="/accounts"
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block w-full sm:w-auto text-center"
                    >
                      {t("subscription.btn-subscription-active.text")}
                    </Link>
                  ) : (
                    <button
                      onClick={handlePayment}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                    >
                      {t("subscription.btn-active.text")}
                    </button>
                  )
                ) : (
                  <Link
                    href="/register"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block w-full sm:w-auto text-center"
                  >
                    {t("subscription.btn-inactive.text")}
                  </Link>
                )}

                <p className="text-sm sm:text-base lg:text-lg pt-4 break-words text-gray-300 leading-relaxed">
                  {t("subscription.disclaimer")}
                </p>
              </div>
            </div>
            {/* Contenido a la derecha (imágenes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-16 order-1 lg:order-2">
              <div className="relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full max-w-[300px] sm:w-[300px] select-none mx-auto overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <img
                  src="https://pbs.twimg.com/media/GM6DUOyWIAA5HzL.jpg"
                  alt="Premium-subscription"
                  className="object-cover rounded-xl w-full h-full transition duration-500 group-hover:scale-110 group-hover:opacity-90"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/50 rounded-xl transition-all duration-300"></div>
              </div>
              <div className="relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full max-w-[300px] sm:w-[300px] select-none mx-auto overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <img
                  src="https://i.pinimg.com/736x/13/9f/ff/139fff3479f0069e9e5046ebe4f94e8e.jpg"
                  alt="premium"
                  className="object-cover rounded-xl w-full h-full transition duration-500 group-hover:scale-110 group-hover:opacity-90"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-400/50 rounded-xl transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="contenedor-reduce">
        <div className="py-8 sm:py-12 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-start text-white mb-6 sm:mb-8">
              {t("subscription.benefits.title")}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Grow 1 */}
              <div
                className="p-4 sm:p-6 lg:p-8 rounded-xl transform transition-all duration-500 ease-in-out hover:scale-105 hover:translate-y-[-10px] group relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Borde con gradiente */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] rounded-xl" style={{ background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)" }}></div>
                
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-blue-300 transition-colors duration-300">
                    {t("subscription.benefits.primary.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
                    <div className="text-gray-300 rounded-lg text-base sm:text-lg lg:text-xl leading-relaxed group-hover:text-gray-100 transition-colors duration-300">
                      {t("subscription.benefits.primary.description")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grow 2 */}
              <div
                className="p-4 sm:p-6 lg:p-8 rounded-xl transform transition-all duration-500 ease-in-out hover:scale-105 hover:translate-y-[-10px] group relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {/* Borde con gradiente */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-[1px] rounded-xl" style={{ background: "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)" }}></div>
                
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                    {t("subscription.benefits.secondary.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
                    <div className="text-gray-300 rounded-lg text-base sm:text-lg lg:text-xl leading-relaxed group-hover:text-gray-100 transition-colors duration-300">
                      {t("subscription.benefits.secondary.description")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PremiumBenefitsCarrousel t={t} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-start mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg sm:text-xl font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit">
              {planModel?.discount} OFF
            </span>
            <div className="flex flex-col">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mr-0 sm:mr-4 mb-1">
                {t("subscription.adversing.title")}
              </h2>
              <h3 className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
                {t("subscription.adversing.description")}
              </h3>
            </div>
          </div>

          <div className="flex justify-center mt-4 sm:mt-6">
            <div className="relative group w-full max-w-4xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <div className="relative bg-black rounded-xl p-1">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/sxPji1VlsU0?si=EPa0DkocLJ-Nurx2"
                    title="World of Warcraft: Battle for Azeroth Cinematic Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>

          <MultiCarouselSubs t={t} />
        </div>
      </div>

      <div className="contenedor-minimun">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Sección de Precio */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2 text-center">
              {t("subscription.payment-methods.title")}
            </h2>
            <div className="flex flex-col items-center">
              <div className="flex flex-col sm:flex-row sm:items-center mb-2 space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="line-through text-gray-400 text-xl sm:text-2xl lg:text-3xl text-center sm:text-left">
                  ${planModel?.price}
                  {t("subscription.payment-methods.currency")}
                </span>
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg sm:text-xl lg:text-2xl font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit mx-auto sm:mx-0">
                  {planModel?.discount}% OFF
                </span>
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
                ${Math.round(planModel?.discounted_price || 15)}
                {t("subscription.payment-methods.currency")}
              </span>
            </div>
          </div>

          {/* Separador antes de la sección de Medios de Pago */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-black px-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Título de Medios de Pago */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-center mb-6 sm:mb-8">
            {t("subscription.payment-methods.sub-title")}
          </h3>

          {/* Sección de Medios de Pago en columna */}
          <div className="flex flex-col space-y-3 sm:space-y-4 pt-3 sm:pt-5">
            {/* Componente de Medio de Pago 1 */}
            <div className="border border-gray-600 rounded-xl p-3 sm:p-4 flex items-center group hover:border-blue-400/50 transition-all duration-300 hover:bg-gray-800/30 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                <FaCreditCard className="text-white text-lg sm:text-xl lg:text-2xl" />
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0 group-hover:text-blue-300 transition-colors duration-300">
                {t("subscription.payment-methods.payments.primary")}
              </h4>
            </div>

            {/* Componente de Medio de Pago 2 */}
            <div className="border border-gray-600 rounded-xl p-3 sm:p-4 flex items-center group hover:border-purple-400/50 transition-all duration-300 hover:bg-gray-800/30 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                <FaMoneyCheckAlt className="text-white text-lg sm:text-xl lg:text-2xl" />
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0 group-hover:text-purple-300 transition-colors duration-300">
                {t("subscription.payment-methods.payments.second")}
              </h4>
            </div>

            {/* Componente de Medio de Pago 3 */}
            <div className="border border-gray-600 rounded-xl p-3 sm:p-4 flex items-center group hover:border-green-400/50 transition-all duration-300 hover:bg-gray-800/30 hover:shadow-lg hover:shadow-green-500/10">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                <FaCashRegister className="text-white text-lg sm:text-xl lg:text-2xl" />
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0 group-hover:text-green-300 transition-colors duration-300">
                {t("subscription.payment-methods.payments.three")}
              </h4>
            </div>
          </div>

          {/* Botón al final */}
          <div className="flex flex-col justify-center mt-6 sm:mt-8 items-center w-full max-w-sm sm:max-w-md mx-auto">
            <div className="relative group w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              <button
                onClick={isSubscription ? handleRedirectAccounts : handlePayment}
                className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-xl w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                {isSubscription
                  ? t("subscription.payment-methods.btn-admin")
                  : t("subscription.payment-methods.btn-payment")}
              </button>
            </div>
            <p className="text-sm sm:text-base lg:text-lg pt-3 sm:pt-4 break-words text-gray-300 text-center w-full leading-relaxed px-2">
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
