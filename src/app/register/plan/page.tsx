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

interface MonthlyPlan {
  id: string;
  name: string;
  price: number;
  priceDisplay: string; // Precio formateado como "$2/ mes" o "Gratis"
  discount?: number;
  discounted_price: number;
  features: string[];
  recommended?: boolean;
}

const PlanSelection = () => {
  const { user } = useUserContext();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);
  const { t } = useTranslation();

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getPlanAcquisition(user.language);
        
        // Mapear los planes de la API a MonthlyPlan
        const mappedPlans: MonthlyPlan[] = plansData.map((plan: PlansAcquisition, index: number) => {
          return {
            id: String(plan.id),
            name: plan.name,
            price: plan.price,
            priceDisplay: plan.price_title, // Precio formateado como "$2/ mes" o "Gratis"
            discounted_price: plan.discounted_price,
            discount: plan.discount > 0 ? plan.discount : undefined,
            features: plan.features || [],
            recommended: index === 1, // El segundo plan como recomendado por defecto
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

    fetchPlans();
  }, [user.language]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
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

    // Guardar el plan seleccionado en localStorage para usar en account-ingame
    const planData = monthlyPlans.find((p) => p.id === selectedPlan);
    if (planData && user) {
      // Guardar en localStorage para usar en account-ingame
      localStorage.setItem("selectedPlan", JSON.stringify(planData));
    }

    router.push("/register/account-ingame");
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full max-w-7xl mb-8">
            {monthlyPlans.map((plan: MonthlyPlan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`
                  relative p-8 md:p-10 rounded-xl border-2 transition-all duration-300 cursor-pointer min-h-[500px] flex flex-col
                  ${
                    selectedPlan === plan.id
                      ? "border-blue-500 bg-blue-500/10 shadow-lg scale-105"
                      : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                  }
                  ${plan.recommended ? "ring-2 ring-yellow-400 ring-opacity-50" : ""}
                `}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-5 py-1.5 rounded-full text-sm font-bold">
                    RECOMENDADO
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex flex-col items-center">
                    {plan.discount && plan.discount > 0 && (
                      <span className="text-green-400 text-base md:text-lg font-semibold mb-2">
                        {plan.discount}% OFF
                      </span>
                    )}
                    <span className="text-4xl md:text-5xl font-bold text-white text-center">
                      {plan.priceDisplay}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start text-base md:text-lg text-gray-300">
                      <svg
                        className="w-6 h-6 md:w-7 md:h-7 text-green-400 mr-3 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div
                  className={`
                    w-full py-3 md:py-4 text-center rounded-lg font-semibold text-base md:text-lg transition-colors
                    ${
                      selectedPlan === plan.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }
                  `}
                >
                  {selectedPlan === plan.id ? "✓ Seleccionado" : "Seleccionar"}
                </div>
              </div>
            ))}
          </div>

          <PageCounter currentSection={2} totalSections={3} />
          
          {/* Botón Principal */}
          <button
            className={`text-white px-5 py-5 rounded-lg mt-8 button-registration relative group transition-all duration-500 hover:text-white hover:bg-gradient-to-r hover:from-gaming-primary-main hover:to-gaming-secondary-main hover:shadow-2xl hover:shadow-gaming-primary-main/40 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden ${
              !selectedPlan ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="button"
            onClick={handleContinue}
            disabled={!selectedPlan}
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
              {t("register.plan.continue") || "Continuar"}
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

