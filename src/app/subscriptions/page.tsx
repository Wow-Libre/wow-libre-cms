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
                  <div className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl line-through text-gray-400">
                        ${Math.floor(planModel.price ?? 0)}
                        {t("subscription.recurrency")}
                      </p>
                      {planModel.discount && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm sm:text-base md:text-lg font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit">
                          {planModel.discount}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl pt-2 font-semibold text-white">
                      ${Math.floor(planModel.discounted_price ?? 0)}
                      {t("subscription.recurrency")}
                    </p>
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
                    Puntos de slots gratis
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6">
                    <div className="text-gray-300 rounded-lg text-base sm:text-lg lg:text-xl leading-relaxed group-hover:text-gray-100 transition-colors duration-300">
                      Obtén puntos de slots gratis para tus personajes.
                      <br />
                      <br />
                      <span className="text-gray-400 text-sm">
                        *Los puntos de slots se pueden usar para comprar giros
                        en la ruleta.
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
                    {planModel.discount && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg sm:text-xl lg:text-2xl font-semibold px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 w-fit mx-auto sm:mx-0">
                        {planModel.discount}% OFF
                      </span>
                    )}
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">
                    ${Math.floor(planModel.discounted_price ?? 0)}
                    {t("subscription.payment-methods.currency")}
                  </span>
                </>
              ) : (
                <div className="text-gray-400 text-xl">Cargando precios...</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Selecciona tu Plan
              </h3>
              <button
                onClick={() => setShowPlansModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
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

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-white">Cargando planes...</div>
              </div>
            ) : plans.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-white">
                  No hay planes disponibles en este momento.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 pt-4 pb-2">
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(String(plan.id))}
                    className={`
                      group relative rounded-2xl transition-all duration-500 cursor-pointer min-h-[580px] flex flex-col
                      ${
                        selectedPlanId === String(plan.id)
                          ? "transform scale-[1.02] shadow-2xl shadow-blue-500/30"
                          : "hover:transform hover:scale-[1.01] hover:shadow-xl"
                      }
                      ${
                        index === 1
                          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border-2 border-yellow-500/50 shadow-yellow-500/20"
                          : "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-gray-700/50"
                      }
                      ${
                        selectedPlanId === String(plan.id)
                          ? "border-2 border-blue-500/80"
                          : ""
                      }
                    `}
                  >
                    {/* Badge RECOMENDADO mejorado */}
                    {index === 1 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
                        <div className="relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black px-5 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-yellow-500/50 whitespace-nowrap">
                          <span className="relative z-10">⭐ RECOMENDADO</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full blur opacity-75 animate-pulse"></div>
                        </div>
                      </div>
                    )}

                    {/* Contenedor interno con overflow hidden para el contenido */}
                    <div className="relative overflow-hidden rounded-2xl flex flex-col flex-1">
                      {/* Efecto de brillo sutil en hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full rounded-2xl"></div>

                      {/* Indicador de selección */}
                      {selectedPlanId === String(plan.id) && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      <div
                        className={`relative z-10 p-8 md:p-10 flex flex-col h-full ${
                          index === 1 ? "pt-10" : ""
                        }`}
                      >
                        {/* Header con nombre y precio */}
                        <div className="text-center mb-8">
                          <h4 className="text-2xl md:text-3xl font-extrabold text-white mb-6 tracking-tight">
                            {plan.name}
                          </h4>

                          {/* Descuento destacado */}
                          {plan.discount && plan.discount > 0 && (
                            <div className="inline-block mb-4">
                              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-green-500/30">
                                {plan.discount}% DE DESCUENTO
                              </span>
                            </div>
                          )}

                          {/* Precio */}
                          <div className="relative inline-block">
                            <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-100 to-gray-300 leading-none">
                              {plan.price_title}
                            </span>
                          </div>

                          {/* Descripción */}
                          {plan.description && (
                            <p className="text-sm text-gray-400 mt-4 font-medium">
                              {plan.description}
                            </p>
                          )}
                        </div>

                        {/* Divider sutil */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8"></div>

                        {/* Lista de características */}
                        <ul className="space-y-4 mb-8 flex-grow">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start group/item"
                            >
                              <div className="flex-shrink-0 mr-4 mt-0.5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/30">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <span className="text-base text-gray-200 leading-relaxed group-hover/item:text-white transition-colors duration-200">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Botón de acción mejorado */}
                        <div className="mt-auto">
                          <div
                            className={`
                            relative w-full py-4 text-center rounded-xl font-bold text-base transition-all duration-300 overflow-hidden group/btn
                            ${
                              plan.price === 0
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                                : selectedPlanId === String(plan.id)
                                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/50 hover:shadow-blue-500/70"
                                : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 hover:from-gray-600 hover:to-gray-500 hover:text-white"
                            }
                          `}
                          >
                            {/* Efecto shimmer en el botón */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative z-10 flex items-center justify-center">
                              {plan.price === 0 ? (
                                <>
                                  <svg
                                    className="w-5 h-5 mr-2"
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
                                  Cerrar
                                </>
                              ) : selectedPlanId === String(plan.id) ? (
                                <>
                                  <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Seleccionado
                                </>
                              ) : (
                                <>
                                  Seleccionar Plan
                                  <svg
                                    className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform"
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
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <button
                onClick={() => setShowPlansModal(false)}
                className="w-full py-3.5 px-6 bg-transparent border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800/50 active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de medios de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Seleccionar Medio de Pago
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method)}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FaCreditCard className="text-white text-lg" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                        {method.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {method.payment_type}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors"
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
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3.5 px-6 bg-transparent border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800/50 active:scale-[0.98]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
