"use client";

import "../style.css";

import PageCounter from "@/components/utilities/counter";
import TitleWow from "@/components/utilities/serverTitle";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import NavbarAuthenticated from "@/components/navbar-authenticated";
import Footer from "@/components/footer";
import useAuth from "@/hook/useAuth";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getPlanAcquisition } from "@/api/home";
import { PlansAcquisition } from "@/model/model";
import { getSubscriptionActive } from "@/api/subscriptions";
import { buyProduct } from "@/api/store";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { BuyRedirectDto } from "@/model/model";
import { InternalServerError } from "@/dto/generic";
import Cookies from "js-cookie";

interface MonthlyPlan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  description?: string;
  discount?: number;
  discounted_price: number;
  currency: string;
  frequency_type: string | null;
  features: string[];
  recommended?: boolean;
}

/** Formatea precio con descuento para mostrar (ej. $10.80/año) */
function formatDiscountedPrice(plan: MonthlyPlan): string {
  const sym = plan.currency === "USD" ? "$" : plan.currency + " ";
  const period = plan.frequency_type === "YEARLY" ? "/año" : plan.frequency_type === "MONTHLY" ? "/mes" : "";
  const value = plan.discounted_price % 1 === 0
    ? plan.discounted_price.toFixed(0)
    : plan.discounted_price.toFixed(2);
  return `${sym}${value}${period}`;
}

const PlanSelection = () => {
  const { user } = useUserContext();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { t } = useTranslation();

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    const checkSubscriptionAndFetchPlans = async () => {
      try {
        const token = Cookies.get("token");
        
        // Verificar si el usuario tiene una suscripción activa
        if (token) {
          const hasActiveSubscription = await getSubscriptionActive(token);
          
          if (hasActiveSubscription) {
            // Si tiene suscripción activa, redirigir directamente a account-ingame
            router.push("/register/account-ingame");
            return;
          }
        }
        
        // Si no tiene suscripción, cargar los planes normalmente
        const plansData = await getPlanAcquisition(user.language);
        
        // Mapear los planes de la API a MonthlyPlan
        const mappedPlans: MonthlyPlan[] = plansData.map((plan: PlansAcquisition, index: number) => {
          return {
            id: String(plan.id),
            name: plan.name,
            price: plan.price,
            priceDisplay: plan.price_title,
            description: plan.description || undefined,
            discounted_price: plan.discounted_price,
            discount: plan.discount > 0 ? plan.discount : undefined,
            currency: plan.currency || "USD",
            frequency_type: plan.frequency_type ?? null,
            features: plan.features || [],
            recommended: index === 1,
          };
        });
        
        setMonthlyPlans(mappedPlans);
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar los planes disponibles. Por favor, inténtalo más tarde.",
          color: "white",
          background: "#0B1218",
        });
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionAndFetchPlans();
  }, [user.language, router]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un plan",
        text: "Por favor, selecciona un plan para continuar.",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Error de autenticación",
        text: "Por favor, inicia sesión para continuar.",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    const planData = monthlyPlans.find((p) => p.id === selectedPlan);
    if (!planData) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo encontrar el plan seleccionado.",
        color: "white",
        background: "#0B1218",
      });
      return;
    }

    // Si el plan es gratis (precio 0), guardar y continuar sin crear suscripción
    if (planData.price === 0) {
      localStorage.setItem("selectedPlan", JSON.stringify(planData));
      router.push("/register/account-ingame");
      return;
    }

    setIsProcessing(true);

    try {
      // Obtener métodos de pago disponibles
      const paymentMethods = await getPaymentMethodsGateway(token);

      if (!paymentMethods || paymentMethods.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No hay medios de pago disponibles",
          text: "Por favor, contacta al administrador para configurar medios de pago.",
          color: "white",
          background: "#0B1218",
        });
        setIsProcessing(false);
        return;
      }

      // Usar el primer método de pago disponible
      const paymentMethod = paymentMethods[0];

      // Crear la suscripción llamando a la API
      const response: BuyRedirectDto = await buyProduct(
        null, // accountId puede ser null en el registro
        token,
        true, // isSubscription = true
        selectedPlan, // planId como product_reference
        paymentMethod.payment_type,
        1 // realmId por defecto (ajustar si es necesario)
      );

      // Guardar el plan seleccionado en localStorage
      localStorage.setItem("selectedPlan", JSON.stringify(planData));

      // Si no es un pago (is_payment = false), redirigir directamente
      if (!response.is_payment) {
        window.open(response.redirect, "_blank");
        router.push("/register/account-ingame");
        return;
      }

      // Si es PayU, crear formulario y abrir en nueva pestaña
      if (paymentMethod.payment_type.toLowerCase() === "payu") {
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
        form.target = "_blank"; // Abrir en nueva pestaña

        Object.keys(paymentData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(paymentData[key]);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        // Para otros métodos de pago, abrir la URL directamente en nueva pestaña
        window.open(response.redirect, "_blank");
      }

      // Redirigir a account-ingame después de abrir la pestaña de pago
      router.push("/register/account-ingame");
    } catch (error: any) {
      console.error("Error al crear suscripción:", error);
      
      if (error instanceof InternalServerError) {
        Swal.fire({
          icon: "error",
          title: "Error",
          html: `
            <p><strong>Mensaje:</strong> ${error.message}</p>
            <hr style="border-color: #444; margin: 8px 0;">
            <p><strong>Transaction ID:</strong> ${error.transactionId}</p>
          `,
          color: "white",
          background: "#0B1218",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo crear la suscripción. Por favor, intenta de nuevo.",
          color: "white",
          background: "#0B1218",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVolverClick = () => {
    router.push("/register/username");
  };

  if (loading) {
    return (
      <div className="contenedor">
        <NavbarAuthenticated />
        <div className="register-container register">
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contenedor">
      <NavbarAuthenticated />
      <div className="register-container register">
        <TitleWow
          title={t("register.plan.title") || "Selecciona tu Plan"}
          description={t("register.plan.description") || "Elige el plan que mejor se adapte a tus necesidades"}
        />
        <div className="register-container-form pt-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-7xl mb-8 items-stretch">
            {monthlyPlans.map((plan: MonthlyPlan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`
                  group relative h-full min-h-[480px] rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden
                  ${
                    selectedPlan === plan.id
                      ? "border-blue-500 bg-blue-500/10 shadow-xl shadow-blue-500/20 md:scale-[1.02]"
                      : "border-slate-500/60 bg-slate-800/70 hover:border-slate-400/70 hover:bg-slate-800/90"
                  }
                  ${plan.recommended ? "border-amber-500/40 shadow-lg shadow-amber-500/10" : ""}
                  ${plan.recommended && selectedPlan !== plan.id ? "hover:border-amber-500/50" : ""}
                `}
              >
                <div className="relative flex flex-col flex-1 min-h-0 p-6 md:p-8">
                  {/* Nombre y tagline */}
                  <div className="text-center mb-4 flex-shrink-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    {plan.price === 0 && (
                      <p className="text-xs font-medium text-slate-400">{t("register.plan.free-tagline")}</p>
                    )}
                    {plan.recommended && plan.price > 0 && (
                      <p className="text-xs font-medium text-amber-400/90">{t("register.plan.recommended-tagline")}</p>
                    )}
                  </div>

                  {/* Precio: con descuento mostramos precio tachado + precio final; sin descuento solo priceDisplay */}
                  <div className="text-center mb-5 flex-shrink-0">
                    {plan.discount != null && plan.discount > 0 && (
                      <div className="mb-3">
                        <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 text-sm font-bold">
                          {plan.discount}% OFF
                        </span>
                      </div>
                    )}
                    {plan.discount != null && plan.discount > 0 && plan.price > plan.discounted_price && (
                      <p className="text-base text-slate-500 line-through mb-1">
                        {plan.currency === "USD" ? "$" : ""}{plan.price % 1 === 0 ? plan.price.toFixed(0) : plan.price.toFixed(2)}
                        {plan.currency !== "USD" ? ` ${plan.currency}` : ""}
                        {plan.frequency_type === "YEARLY" ? "/año" : plan.frequency_type === "MONTHLY" ? "/mes" : ""}
                      </p>
                    )}
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
                      {plan.discount != null && plan.discount > 0 && plan.price > plan.discounted_price
                        ? formatDiscountedPrice(plan)
                        : plan.priceDisplay}
                    </p>
                    {plan.description && (
                      <p className="mt-2 text-xs text-slate-400 max-w-[240px] mx-auto leading-snug">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-5 flex-shrink-0" />

                  {/* Lista de beneficios: crece y empuja el CTA abajo */}
                  <ul className="space-y-3 mb-5 flex-1 min-h-0 overflow-y-auto">
                    {plan.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 mt-0.5">
                          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-sm md:text-base text-slate-300 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA siempre abajo */}
                  <div
                    className={`
                      w-full py-3.5 md:py-4 text-center rounded-xl font-semibold text-sm md:text-base transition-all duration-200 flex-shrink-0
                      ${
                        selectedPlan === plan.id
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : plan.price === 0
                            ? "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                            : "bg-slate-700/80 text-slate-200 hover:bg-slate-600 hover:text-white border border-slate-600 hover:border-slate-500"
                      }
                    `}
                  >
                    {selectedPlan === plan.id
                      ? `✓ ${t("register.plan.cta-selected")}`
                      : plan.price === 0
                        ? t("register.plan.cta-free")
                        : t("register.plan.cta-select")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PageCounter currentSection={2} totalSections={3} />
          
          {/* Botón Principal */}
          <button
            className={`text-white px-5 py-5 rounded-lg mt-8 button-registration relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gaming-primary-main hover:to-gaming-secondary-main hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden ${
              !selectedPlan || isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="button"
            onClick={handleContinue}
            disabled={!selectedPlan || isProcessing}
          >
            {/* Efecto de partículas flotantes */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-75"></div>
              <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-50"></div>
              <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full opacity-60"></div>
              <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full opacity-40"></div>
            </div>

            {/* Efecto de brillo profesional */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            {/* Efecto de borde luminoso */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gaming-primary-main/20 via-gaming-secondary-main/20 to-gaming-primary-main/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <span className="relative z-10 font-semibold tracking-wide text-base md:text-lg lg:text-xl">
              {isProcessing ? "Procesando..." : (t("register.plan.continue") || "Continuar")}
            </span>

            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gaming-primary-main to-gaming-secondary-main group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>

          {/* Botón Secundario */}
          <button
            className="text-white px-5 py-5 rounded-lg mt-4 button-registration relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:shadow-gray-500/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
            type="button"
            onClick={handleVolverClick}
          >
            {/* Efecto de partículas flotantes */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-75"></div>
              <div className="absolute top-4 right-1/3 w-0.5 h-0.5 bg-white/40 rounded-full opacity-50"></div>
              <div className="absolute bottom-2 left-1/2 w-1 h-1 bg-white/50 rounded-full opacity-60"></div>
              <div className="absolute bottom-4 right-1/4 w-0.5 h-0.5 bg-white/35 rounded-full opacity-40"></div>
            </div>

            {/* Efecto de brillo profesional */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>

            {/* Efecto de borde luminoso */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <span className="relative z-10 font-semibold tracking-wide text-base md:text-lg lg:text-xl">
              {t("register.plan.back") || "Volver"}
            </span>

            {/* Línea inferior elegante */}
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-600 group-hover:w-full transition-all duration-700 ease-out"></div>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlanSelection;

