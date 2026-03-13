"use client";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { buyProduct } from "@/api/store";
import { getSubscriptionActive } from "@/api/subscriptions";
import { getPlanAcquisition } from "@/api/home";
import { PlansAcquisition } from "@/model/model";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import PremiumBenefitsCarrousel from "@/components/premium-carrousel";
import MultiCarouselSubs from "@/components/subscriptions/carrousel";
import FaqsSubscriptions from "@/components/subscriptions/faqs";
import { useUserContext } from "@/context/UserContext";
import { InternalServerError } from "@/dto/generic";
import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { BuyRedirectDto, PlanModel } from "@/model/model";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCashRegister, FaCreditCard, FaMoneyCheckAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const Subscriptions = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [planModel, setPlan] = useState<PlanModel>();
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodsGatewayReponse[]
  >([]);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showPlansModal, setShowPlansModal] = useState<boolean>(false);
  const [plans, setPlans] = useState<PlansAcquisition[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodsGatewayReponse | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  const { user } = useUserContext();
  const token = Cookies.get("token");
  const router = useRouter();

  // Evitar problemas de hidratación - solo renderizar contenido dinámico después del mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        // Usar directamente user.language como en register/plan/page.tsx
        const languageToUse = user?.language || "es";

        const subscriptionPromise = token
          ? getSubscriptionActive(token)
          : Promise.resolve(false);
        const paymentMethodsPromise = token
          ? getPaymentMethodsGateway(token)
          : Promise.resolve([]);
        const plansPromise = getPlanAcquisition(languageToUse);

        const [isSubscription, paymentMethods, plansData] = await Promise.all([
          subscriptionPromise,
          paymentMethodsPromise,
          plansPromise,
        ]);

        // Usar el plan más barato (precio > 0) para planModel (para mostrar precios y descuentos)
        if (plansData && plansData.length > 0) {
          // Filtrar planes con precio mayor a 0 y encontrar el más barato
          const paidPlans = plansData.filter((plan) => plan.price > 0);

          if (paidPlans.length > 0) {
            // Ordenar por precio y tomar el más barato
            const cheapestPlan = paidPlans.reduce((prev, current) =>
              current.price < prev.price ? current : prev
            );

            setPlan({
              name: cheapestPlan.name,
              price: cheapestPlan.price,
              discount: cheapestPlan.discount,
              discounted_price: cheapestPlan.discounted_price,
              status: cheapestPlan.status,
              subscribe_url: "", // No disponible en PlansAcquisition
            });
          }
        }

        setIsSubscription(isSubscription);
        setPaymentMethods(paymentMethods);
        setPlans(plansData || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user?.language, token]);

  const handlePayment = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    // Mostrar modal de planes primero
    setShowPlansModal(true);
  };

  const handlePlanSelect = (planId: string) => {
    // Buscar el plan seleccionado
    const selectedPlan = plans.find((plan) => String(plan.id) === planId);

    // Si el plan es gratis (precio 0), solo cerrar el modal
    if (selectedPlan && selectedPlan.price === 0) {
      setShowPlansModal(false);
      return;
    }

    setSelectedPlanId(planId);
    setShowPlansModal(false);

    if (paymentMethods.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No hay medios de pago disponibles",
        text: "Por favor, contacta al administrador para configurar medios de pago.",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    if (paymentMethods.length === 1) {
      // Si solo hay un medio de pago, usarlo directamente
      processPayment(paymentMethods[0], planId);
    } else {
      // Si hay múltiples medios de pago, mostrar modal
      setShowPaymentModal(true);
    }
  };

  const processPayment = async (
    paymentMethod: PaymentMethodsGatewayReponse,
    planId?: string | null
  ) => {
    try {
      if (!token) {
        router.push("/login");
        return;
      }

      const planIdToSend = planId || selectedPlanId;

      const response: BuyRedirectDto = await buyProduct(
        null,
        token,
        true,
        planIdToSend,
        paymentMethod.payment_type,
        1
      );

      const paymentData: Record<string, string> = {
        merchantId: response.payu.merchant_id,
        accountId: response.payu.account_id,
        description: response.description,
        referenceCode: response.reference_code,
        amount: response.amount,
        tax: response.tax,
        taxReturnBase: response.tax_return_base,
        currency: response.currency,
        signature: response.payu.signature,
        test: response.payu.test,
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

  const handlePaymentMethodSelect = (
    paymentMethod: PaymentMethodsGatewayReponse
  ) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowPaymentModal(false);
    processPayment(paymentMethod, selectedPlanId);
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
          background:
            "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)",
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
                {mounted && planModel && (
                  <div className="mb-4 w-full min-w-[100px] sm:min-w-[200px] max-w-sm group/card">
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 sm:px-6 py-4 sm:py-5 shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10">
                      <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 mb-1">
                        {t("subscription.payment-methods.title")}
                      </p>
                      {(planModel.discount ?? 0) > 0 && (
                        <div className="mb-2 flex justify-end">
                          <span className="inline-block rounded-xl bg-emerald-500/20 text-emerald-400 text-lg sm:text-xl font-bold px-4 py-2 border border-emerald-500/30 animate-pulse">
                            {planModel.discount}%
                          </span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl text-gray-500 line-through">
                          ${Number(planModel.price ?? 0).toFixed(2)}
                        </span>
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums transition-transform duration-300 group-hover/card:scale-105 origin-left">
                          ${Number(planModel.discounted_price ?? 0).toFixed(2)}
                          <span className="text-lg sm:text-xl font-normal text-gray-400 ml-0.5">
                            {t("subscription.recurrency")}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-6 lg:mt-10">
                {mounted && !loading && (
                  <>
                    {user.logged_in ? (
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
                    ) : !user.logged_in ? (
                      <Link
                        href="/register"
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold mb-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-block w-full sm:w-auto text-center"
                      >
                        {t("subscription.btn-inactive.text")}
                      </Link>
                    ) : null}
                  </>
                )}

                {mounted && (
                  <p className="text-sm sm:text-base lg:text-lg pt-4 break-words text-gray-300 leading-relaxed">
                    {t("subscription.disclaimer")}
                  </p>
                )}
              </div>
            </div>
            {/* Contenido a la derecha (imágenes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-16 order-1 lg:order-2">
              <div className="relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full max-w-[300px] sm:w-[300px] select-none mx-auto overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_0307782384a547ed9b1feb9f72b28650~mv2.webp"
                  alt="Premium-subscription"
                  className="object-cover rounded-xl w-full h-full transition duration-500 group-hover:scale-110 group-hover:opacity-90"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/50 rounded-xl transition-all duration-300"></div>
              </div>
              <div className="relative h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full max-w-[300px] sm:w-[300px] select-none mx-auto overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 rounded-xl"></div>
                <img
                  src="https://static.wixstatic.com/media/5dd8a0_176603a6fd924b2e8228639d706c9c47~mv2.webp"
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
                  background:
                    "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Borde con gradiente */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div
                  className="absolute inset-[1px] rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                  }}
                ></div>

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
                  background:
                    "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Borde con gradiente */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div
                  className="absolute inset-[1px] rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                  }}
                ></div>

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

              {/* Grow 2 */}
              <div
                className="p-4 sm:p-6 lg:p-8 rounded-xl transform transition-all duration-500 ease-in-out hover:scale-105 hover:translate-y-[-10px] group relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Borde con gradiente */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div
                  className="absolute inset-[1px] rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #1e1e2f 0%, #2a2a3f 50%, #3a3a4f 100%)",
                  }}
                ></div>

                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                    {t("subscription.benefits.tertiary.title")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
                    <div className="text-gray-300 rounded-lg text-base sm:text-lg lg:text-xl leading-relaxed group-hover:text-gray-100 transition-colors duration-300">
                      {t("subscription.benefits.tertiary.description")}
                      <br />
                      <br />
                      <span className="text-gray-400 text-sm">
                        {t("subscription.benefits.tertiary.disclaimer")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PremiumBenefitsCarrousel t={t} language={i18n.language as string} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-start mb-4 sm:mb-6">
            {mounted && planModel?.discount && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg sm:text-xl font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full mr-0 sm:mr-4 mb-2 sm:mb-0 shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit">
                {planModel.discount} OFF
              </span>
            )}
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
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
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
              {mounted && planModel ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-2 space-y-2 sm:space-y-0 sm:space-x-2">
                    <span className="line-through text-gray-400 text-xl sm:text-2xl lg:text-3xl text-center sm:text-left">
                      ${planModel.price}
                      {t("subscription.payment-methods.currency")}
                    </span>
                    {(planModel.discount ?? 0) > 0 && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg sm:text-xl lg:text-2xl font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit mx-auto sm:mx-0">
                        {planModel.discount}%
                      </span>
                    )}
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
                    ${Math.floor(planModel.discounted_price ?? 0)}
                    {t("subscription.payment-methods.currency")}
                  </span>
                </>
              ) : (
                <div className="text-gray-400 text-xl">{t("subscription.loading-prices")}</div>
              )}
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
                onClick={
                  isSubscription ? handleRedirectAccounts : handlePayment
                }
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

      {/* Modal de selección de planes */}
      {showPlansModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPlansModal(false)}
        >
          <div
            className="bg-[#111827] rounded-2xl border border-gray-700/80 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700/80 bg-[#111827]/95 backdrop-blur px-6 py-4">
              <h3 className="text-xl font-semibold text-white">
                {t("subscription.plans-modal.title")}
              </h3>
              <button
                type="button"
                onClick={() => setShowPlansModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                aria-label={t("subscription.plans-modal.close")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-blue-500" />
                  <p className="text-gray-400">{t("subscription.plans-modal.loading")}</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  {t("subscription.plans-modal.no-plans")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {plans.map((plan, index) => {
                    const isSelected = selectedPlanId === String(plan.id);
                    const isRecommended = index === 1;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => handlePlanSelect(String(plan.id))}
                        className={`
                          group relative flex flex-col rounded-xl border transition-all duration-200 cursor-pointer min-h-[520px]
                          ${isSelected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-gray-600/80 hover:border-gray-500"}
                          ${isRecommended ? "bg-gray-800/60" : "bg-gray-800/40"}
                        `}
                      >
                        {isRecommended && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                            <span className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-0.5 text-xs font-semibold text-black">
                              {t("subscription.plans-modal.recommended")}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-1 flex-col p-6 md:p-7">
                          <div className="mb-6 text-center">
                            <h4 className="text-lg font-bold text-white mb-3">{plan.name}</h4>
                            {(plan.discount ?? 0) > 0 && (
                              <span className="inline-block rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400 mb-3">
                                {plan.discount}% {t("subscription.plans-modal.discount-badge")}
                              </span>
                            )}
                            <div className="flex flex-col items-center gap-0.5">
                              {(plan.discount ?? 0) > 0 ? (
                                <>
                                  <span className="text-lg text-gray-500 line-through tabular-nums">
                                    {plan.price_title}
                                  </span>
                                  <p className="text-3xl md:text-4xl font-bold tabular-nums text-white">
                                    ${Number(plan.discounted_price).toFixed(2)}
                                    <span className="text-lg font-normal text-gray-400">
                                      {plan.frequency_type === "YEARLY"
                                        ? t("subscription.per-year")
                                        : t("subscription.recurrency")}
                                    </span>
                                  </p>
                                </>
                              ) : (
                                <p className="text-3xl md:text-4xl font-bold tabular-nums text-white">
                                  {plan.price_title}
                                </p>
                              )}
                            </div>
                            {plan.description && (
                              <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
                            )}
                          </div>

                          <div className="h-px bg-gray-600/80 mb-6" />

                          <ul className="space-y-3 flex-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-6">
                            <div
                              className={`
                                flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-colors
                                ${plan.price === 0
                                  ? "bg-gray-600/50 text-gray-400 cursor-default"
                                  : isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                                }
                              `}
                            >
                              {plan.price === 0 ? (
                                t("subscription.plans-modal.close")
                              ) : isSelected ? (
                                <>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {t("subscription.plans-modal.selected")}
                                </>
                              ) : (
                                t("subscription.plans-modal.select-plan")
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-700/80">
                <button
                  type="button"
                  onClick={() => setShowPlansModal(false)}
                  className="w-full rounded-lg border border-gray-600 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-700/30 hover:text-white"
                >
                  {t("subscription.plans-modal.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de medios de pago */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-[#111827] rounded-2xl border border-gray-700/80 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-700/80 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                {t("subscription.payment-modal.title")}
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                aria-label={t("subscription.plans-modal.close")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handlePaymentMethodSelect(method)}
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-600/80 bg-gray-800/40 p-4 text-left transition-colors hover:border-blue-500/50 hover:bg-gray-700/50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600/80">
                    <FaCreditCard className="text-white text-lg" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{method.name}</p>
                    <p className="text-sm text-gray-400">{method.payment_type}</p>
                  </div>
                  <svg className="h-5 w-5 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-700/80 p-4">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full rounded-lg border border-gray-600 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-700/30 hover:text-white"
              >
                {t("subscription.payment-modal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
