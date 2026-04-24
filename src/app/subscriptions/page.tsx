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
              current.price < prev.price ? current : prev,
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
    planId?: string | null,
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
        1,
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
    paymentMethod: PaymentMethodsGatewayReponse,
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
        <div className="pointer-events-none absolute inset-0 z-0 opacity-18 [background-image:radial-gradient(circle,rgba(56,189,248,0.42)_0_2px,transparent_3px),radial-gradient(circle,rgba(14,165,233,0.34)_0_1.6px,transparent_2.6px),radial-gradient(circle,rgba(59,130,246,0.3)_0_1.2px,transparent_2px)] [background-size:180px_180px,240px_220px,300px_260px] [animation:embers-drift-blue_9.2s_ease-in-out_infinite]" />
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
                <div className="text-gray-400 text-xl">
                  {t("subscription.loading-prices")}
                </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md"
          onClick={() => setShowPlansModal(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-6xl xl:max-w-7xl min-h-0 rounded-3xl shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plans-modal-title"
          >
            <div
              className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-amber-500/25 via-violet-600/20 to-cyan-500/15 opacity-90 blur-[1px]"
              aria-hidden
            />
            <div className="relative max-h-[min(92vh,880px)] min-h-0 overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-600/60 bg-slate-900/95 overscroll-contain">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/12 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl"
                aria-hidden
              />

              <div className="sticky top-0 z-10 border-b border-slate-700/80 bg-slate-900/95 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25 sm:h-11 sm:w-11">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5 pr-1 sm:pr-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400/90 sm:text-[11px]">
                        {t("subscription.plans-modal.kicker")}
                      </p>
                      <h3
                        id="plans-modal-title"
                        className="mt-1 bg-gradient-to-r from-slate-100 via-white to-slate-200 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl"
                      >
                        {t("subscription.plans-modal.title")}
                      </h3>
                      <p className="mt-1.5 max-w-3xl text-xs leading-snug text-slate-400 sm:text-sm">
                        {t("subscription.plans-modal.subtitle")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPlansModal(false)}
                    className="shrink-0 self-end rounded-xl border border-slate-600/80 bg-slate-800/60 p-2.5 text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white sm:self-start"
                    aria-label={t("subscription.plans-modal.close")}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="relative px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5 lg:px-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-amber-500" />
                    <p className="text-sm text-slate-400">
                      {t("subscription.plans-modal.loading")}
                    </p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="rounded-2xl border border-slate-700/80 bg-slate-800/40 py-16 text-center">
                    <p className="text-slate-400">
                      {t("subscription.plans-modal.no-plans")}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-6 xl:gap-7">
                    {plans.map((plan, index) => {
                      const isSelected = selectedPlanId === String(plan.id);
                      const isRecommended = index === 1;
                      return (
                        <div
                          key={plan.id}
                          onClick={() => handlePlanSelect(String(plan.id))}
                          className={`
                            group relative flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-2xl border p-1 transition-all duration-300
                            ${
                              isRecommended
                                ? "border-amber-500/35 bg-gradient-to-b from-amber-500/[0.07] to-slate-800/40 shadow-lg shadow-amber-500/5"
                                : "border-slate-700/80 bg-slate-800/35"
                            }
                            ${
                              isSelected
                                ? "ring-2 ring-amber-500/40 ring-offset-2 ring-offset-slate-900"
                                : "hover:border-slate-500/90 hover:bg-slate-800/55"
                            }
                          `}
                        >
                          <div
                            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[0.65rem] sm:rounded-[0.7rem]"
                            aria-hidden
                          >
                            <div
                              className="absolute -top-[45%] left-0 h-[190%] w-[42%] opacity-80 blur-[2px] animate-plan-card-light motion-reduce:animate-none sm:blur-[3px]"
                              style={{
                                backgroundImage: isRecommended
                                  ? "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.5) 45%, rgba(253,230,138,0.35) 55%, transparent 100%)"
                                  : "linear-gradient(90deg, transparent 0%, rgba(165,243,252,0.4) 48%, rgba(103,232,249,0.25) 52%, transparent 100%)",
                                animationDelay: `${index * 0.45}s`,
                              }}
                            />
                          </div>
                          <div className="relative z-10 flex flex-1 flex-col rounded-[0.85rem] px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5 md:px-7 md:pb-7">
                            {isRecommended && (
                              <div className="mb-3 flex justify-center sm:mb-4">
                                <span className="inline-flex max-w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-900 shadow-md shadow-amber-500/30 sm:text-xs">
                                  {t("subscription.plans-modal.recommended")}
                                </span>
                              </div>
                            )}

                            <div className="mb-4 text-center sm:mb-5">
                              <h4 className="break-words text-lg font-bold tracking-tight text-white sm:text-xl">
                                {plan.name}
                              </h4>
                              {(plan.discount ?? 0) > 0 && (
                                <span className="mt-2.5 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                                  {plan.discount}%{" "}
                                  {t("subscription.plans-modal.discount-badge")}
                                </span>
                              )}
                              <div className="mt-3 flex flex-col items-center gap-1 sm:mt-4">
                                {(plan.discount ?? 0) > 0 ? (
                                  <>
                                    <span className="max-w-full break-words text-center text-sm text-slate-500 line-through tabular-nums">
                                      ${Number(plan.price ?? 0).toFixed(2)}
                                      {plan.frequency_type === "YEARLY"
                                        ? ` ${t("subscription.per-year")}`
                                        : ` ${t("subscription.recurrency")}`}
                                    </span>
                                    <p className="max-w-full break-words text-center text-3xl font-bold tabular-nums text-white md:text-4xl">
                                      $
                                      {Number(
                                        plan.discounted_price ?? 0,
                                      ).toFixed(2)}
                                      <span className="block text-sm font-medium text-slate-400 sm:inline sm:text-base">
                                        {plan.frequency_type === "YEARLY"
                                          ? ` ${t("subscription.per-year")}`
                                          : ` ${t("subscription.recurrency")}`}
                                      </span>
                                    </p>
                                  </>
                                ) : (
                                  <p className="max-w-full break-words text-3xl font-bold tabular-nums text-white md:text-4xl">
                                    {plan.price_title}
                                  </p>
                                )}
                              </div>
                              {plan.description && (
                                <p className="mt-3 break-words text-sm leading-relaxed text-slate-400 sm:mt-4">
                                  {plan.description}
                                </p>
                              )}
                            </div>

                            <div className="mb-4 h-px shrink-0 bg-gradient-to-r from-transparent via-slate-600/80 to-transparent sm:mb-5" />

                            <ul className="min-h-0 flex-1 space-y-3">
                              {plan.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
                                >
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                    <svg
                                      className="h-3 w-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeWidth={2.5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </span>
                                  <span className="min-w-0 flex-1 break-words">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            <div className="mt-auto pt-6 sm:pt-7">
                              <div
                                className={`
                                  flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-center text-sm font-bold leading-snug transition-all sm:py-3.5
                                  ${
                                    plan.price === 0
                                      ? "cursor-default border border-slate-600/60 bg-slate-800/50 text-slate-500"
                                      : isSelected
                                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/20"
                                        : "border border-slate-600/80 bg-slate-800/60 text-slate-200 group-hover:border-slate-500 group-hover:bg-slate-700/70"
                                  }
                                `}
                              >
                                {plan.price === 0 ? (
                                  t("subscription.plans-modal.close")
                                ) : isSelected ? (
                                  <>
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de medios de pago */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md"
          onClick={() => setShowPaymentModal(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md sm:max-w-lg min-h-0 rounded-3xl shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <div
              className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/20 via-slate-600/15 to-cyan-500/15 opacity-90 blur-[1px]"
              aria-hidden
            />
            <div className="relative max-h-[min(88vh,640px)] min-h-0 overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-600/60 bg-slate-900/95 overscroll-contain">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
                aria-hidden
              />

              <div className="border-b border-slate-700/80 bg-slate-900/95 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 sm:h-11 sm:w-11">
                      <FaCreditCard
                        className="h-5 w-5 sm:h-5 sm:w-5"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1 pr-1 sm:pr-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300/90 sm:text-[11px]">
                        {t("subscription.payment-modal.kicker")}
                      </p>
                      <h3
                        id="payment-modal-title"
                        className="mt-1 text-base font-bold tracking-tight text-white sm:text-lg"
                      >
                        {t("subscription.payment-modal.title")}
                      </h3>
                      <p className="mt-1.5 text-xs leading-snug text-slate-400 sm:text-sm">
                        {t("subscription.payment-modal.subtitle")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="shrink-0 self-end rounded-xl border border-slate-600/80 bg-slate-800/60 p-2.5 text-slate-400 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white sm:self-start"
                    aria-label={t("subscription.plans-modal.close")}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 p-4 sm:space-y-3 sm:p-5">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handlePaymentMethodSelect(method)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-800/40 p-3.5 text-left transition-all hover:border-violet-500/40 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-violet-500/5 sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-inner transition-transform group-hover:scale-105 group-hover:from-violet-600 group-hover:to-indigo-700 sm:h-11 sm:w-11">
                      <FaCreditCard
                        className="text-base sm:text-lg"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-white">
                        {method.name}
                      </p>
                      <p className="mt-0.5 break-all font-mono text-[11px] leading-snug text-slate-500 sm:text-xs">
                        {method.payment_type}
                      </p>
                    </div>
                    <svg
                      className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-violet-400 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-700/80 p-4 sm:p-5 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full rounded-xl border border-slate-600/80 bg-slate-800/50 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800 hover:text-white sm:py-3 sm:text-sm"
                >
                  {t("subscription.payment-modal.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
