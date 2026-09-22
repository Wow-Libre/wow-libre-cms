"use client";

import { Suspense, useState, useEffect } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import useAuth from "@/hook/useAuth";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SUBSCRIPTION_POLL_INTERVAL_MS,
  SUBSCRIPTION_POLL_MAX_ATTEMPTS,
  clearPendingPremiumCheckout,
  premiumCheckoutOwnerId,
  readPendingPremiumCheckout,
  savePendingPremiumCheckout,
  patchPendingPremiumCheckout,
  updatePendingPremiumCheckoutAttempt,
  usernameAfterPlanPath,
} from "@/features/plan-selection/utils/premiumAccess";
import {
  GameAccountOnboardingShell,
  OnboardingActions,
} from "@/features/game-account-onboarding/components/GameAccountOnboardingShell";
import { PlanSalesCard } from "@/features/game-account-onboarding/components/PlanSalesCard";
import { PremiumActivationStatus } from "@/features/plan-selection/components/PremiumActivationStatus";
import { getPlanAcquisition } from "@/api/home";
import { PlansAcquisition } from "@/model/model";
import { isUserPremiumActive } from "@/api/subscriptions";
import { buyProduct } from "@/api/store";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { BuyRedirectDto } from "@/model/model";
import { InternalServerError } from "@/dto/generic";
import Cookies from "js-cookie";
import {
  checkoutPeriodLabel,
  durationSavingsPercent,
  isOneMonthPlan,
  planPeriodMonths,
} from "@/features/plan-selection/utils/planDuration";

interface MonthlyPlan {
  id: string;
  name: string;
  price: number;
  description?: string;
  discount?: number;
  discounted_price: number;
  currency: string;
  frequency_type: string | null;
  frequency_value: number | null;
  features: string[];
  recommended?: boolean;
}

const LOOKS_FREE_COPY =
  /gratis|free|gratuit|grátis|sin costo|sin coste|sem custo|no cost/i;

function toMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function isFreePlan(plan: Pick<MonthlyPlan, "price" | "discounted_price">) {
  return toMoney(plan.price) <= 0 && toMoney(plan.discounted_price) <= 0;
}

function formatMoney(amount: number, currency: string): string {
  const value = amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2);
  if ((currency || "USD").toUpperCase() === "USD") return `$${value}`;
  return `${value} ${currency}`;
}

function payableAmount(plan: MonthlyPlan): number {
  if (plan.discounted_price > 0 && plan.discounted_price < plan.price) {
    return plan.discounted_price;
  }
  return plan.price > 0 ? plan.price : plan.discounted_price;
}

const PlanSelection = () => {
  const { user } = useUserContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get("showWelcome");
  const nextUsernamePath = usernameAfterPlanPath(showWelcome);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentTimedOut, setPaymentTimedOut] = useState(false);
  const [premiumCheckInFlight, setPremiumCheckInFlight] = useState(false);
  const [premiumCheckAttempt, setPremiumCheckAttempt] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { t } = useTranslation();

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    const checkSubscriptionAndFetchPlans = async () => {
      try {
        const token = Cookies.get("token");
        
        // Verificar si el usuario tiene una suscripción activa
        if (token) {
          const hasActiveSubscription = await isUserPremiumActive(token);

          if (hasActiveSubscription) {
            clearPendingPremiumCheckout();
            router.replace(nextUsernamePath);
            return;
          }
        }

        const pendingCheckout = readPendingPremiumCheckout(
          premiumCheckoutOwnerId(user),
        );
        if (pendingCheckout) {
          setPremiumCheckAttempt(pendingCheckout.attempt || 0);
          setPaymentModalOpen(!pendingCheckout.modalDismissed);
          if (
            (pendingCheckout.attempt || 0) >= SUBSCRIPTION_POLL_MAX_ATTEMPTS
          ) {
            setPaymentTimedOut(true);
            setPaymentPending(false);
          } else {
            setPaymentPending(true);
            setPaymentTimedOut(false);
          }
        }

        // Si no tiene suscripción, cargar los planes normalmente
        const plansData = await getPlanAcquisition(user.language);
        
        // Mapear los planes de la API a MonthlyPlan
        const mappedPlans: MonthlyPlan[] = plansData.map(
          (plan: PlansAcquisition) => {
            const price = toMoney(plan.price);
            const discounted = toMoney(plan.discounted_price);
            const free = price <= 0 && discounted <= 0;
            const rawDescription = plan.description?.trim() || "";
            const description =
              !free && LOOKS_FREE_COPY.test(rawDescription)
                ? undefined
                : rawDescription || undefined;
            const features = plan.features || [];

            return {
              id: String(plan.id),
              name: plan.name,
              price,
              description,
              discounted_price: discounted,
              discount: toMoney(plan.discount) > 0 ? toMoney(plan.discount) : undefined,
              currency: plan.currency || "USD",
              frequency_type: plan.frequency_type ?? null,
              frequency_value: plan.frequency_value ?? 1,
              features,
              recommended: false,
            };
          },
        );

        const paidPlans = mappedPlans.filter((plan) => !isFreePlan(plan));
        const yearlyPlan = paidPlans.find(
          (plan) => (plan.frequency_type ?? "").toUpperCase() === "YEARLY",
        );
        const recommendedPlan =
          yearlyPlan ??
          [...paidPlans].sort((a, b) => b.price - a.price)[0];

        const withRecommended = paidPlans.map((plan) => ({
          ...plan,
          recommended: Boolean(
            recommendedPlan && plan.id === recommendedPlan.id,
          ),
        }));

        setMonthlyPlans(withRecommended);
        if (pendingCheckout?.planId) {
          setSelectedPlan(pendingCheckout.planId);
        } else {
          const featured = withRecommended.find((plan) => plan.recommended);
          if (featured) {
            setSelectedPlan(featured.id);
          }
        }
      } catch (error: any) {
        console.error("No se pudo cargar los planes disponibles", error);
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
  }, [user.language, user.id, user.email, router, nextUsernamePath]);

  useEffect(() => {
    if (!paymentPending || paymentConfirmed) {
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      return;
    }

    const storedCheckout = readPendingPremiumCheckout(
      premiumCheckoutOwnerId(user),
    );
    let attempts = storedCheckout?.attempt ?? 0;
    let cancelled = false;
    let checkBusy = false;
    setPremiumCheckAttempt(attempts);

    const markPremiumReady = () => {
      if (cancelled) {
        return;
      }
      clearPendingPremiumCheckout();
      setPaymentConfirmed(true);
      setPaymentPending(false);
      setPaymentTimedOut(false);
      setPremiumCheckInFlight(false);
      router.replace(nextUsernamePath);
    };

    const checkPremium = async () => {
      if (checkBusy) {
        return false;
      }
      checkBusy = true;
      attempts += 1;
      setPremiumCheckAttempt(attempts);
      updatePendingPremiumCheckoutAttempt(attempts);
      setPremiumCheckInFlight(true);
      try {
        const active = await isUserPremiumActive(token);
        if (cancelled) {
          return false;
        }
        if (active) {
          markPremiumReady();
          return true;
        }
        return false;
      } finally {
        checkBusy = false;
        if (!cancelled) {
          setPremiumCheckInFlight(false);
        }
      }
    };

    void checkPremium();

    const intervalId = window.setInterval(() => {
      void (async () => {
        const active = await checkPremium();
        if (active) {
          window.clearInterval(intervalId);
          return;
        }
        if (attempts >= SUBSCRIPTION_POLL_MAX_ATTEMPTS) {
          window.clearInterval(intervalId);
          if (!cancelled) {
            setPaymentPending(false);
            setPaymentTimedOut(true);
            setPremiumCheckInFlight(false);
          }
        }
      })();
    }, SUBSCRIPTION_POLL_INTERVAL_MS);

    const onTabVisible = () => {
      if (document.visibilityState === "visible") {
        void checkPremium();
      }
    };
    const onWindowFocus = () => {
      void checkPremium();
    };

    document.addEventListener("visibilitychange", onTabVisible);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onTabVisible);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [paymentPending, paymentConfirmed, nextUsernamePath, router, user.id, user.email]);

  const rememberPendingCheckout = (referenceCode: string) => {
    savePendingPremiumCheckout({
      ownerId: premiumCheckoutOwnerId(user),
      referenceCode: referenceCode || `pending-${Date.now()}`,
      planId: selectedPlan,
      startedAt: Date.now(),
      attempt: 0,
      modalDismissed: false,
    });
    setPaymentPending(true);
    setPaymentTimedOut(false);
    setPaymentModalOpen(true);
  };

  const openPaymentModal = () => {
    setPaymentModalOpen(true);
    patchPendingPremiumCheckout({ modalDismissed: false });
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    patchPendingPremiumCheckout({ modalDismissed: true });
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (paymentConfirmed) {
      router.push(nextUsernamePath);
      return;
    }

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

    if (isFreePlan(planData)) {
      Swal.fire({
        icon: "info",
        title: t("register.plan.premium-required-title"),
        text: t("register.plan.premium-required-text"),
        color: "white",
        background: "#0B1218",
      });
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

      if (!response.is_payment) {
        if (response.redirect) {
          window.open(response.redirect, "_blank");
        }
        rememberPendingCheckout(response.reference_code);
        return;
      }

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

      rememberPendingCheckout(response.reference_code);
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
    router.push("/accounts");
  };

  const handleCheckPayment = async () => {
    const token = Cookies.get("token");
    if (!token || premiumCheckInFlight) {
      return;
    }
    setPremiumCheckInFlight(true);
    setPremiumCheckAttempt((prev) => {
      const next = prev + 1;
      updatePendingPremiumCheckoutAttempt(next);
      return next;
    });
    try {
      const active = await isUserPremiumActive(token);
      if (active) {
        clearPendingPremiumCheckout();
        setPaymentConfirmed(true);
        setPaymentPending(false);
        setPaymentTimedOut(false);
        router.replace(nextUsernamePath);
        return;
      }
      setPaymentTimedOut(true);
      setPaymentPending(false);
    } finally {
      setPremiumCheckInFlight(false);
    }
  };

  const oneMonthPlan = monthlyPlans
    .filter((plan) => isOneMonthPlan(plan.frequency_type, plan.frequency_value))
    .sort((a, b) => payableAmount(a) - payableAmount(b))[0];

  const orderedPlans = (() => {
    if (monthlyPlans.length <= 2) {
      return monthlyPlans;
    }
    const recommended = monthlyPlans.find((plan) => plan.recommended);
    if (!recommended) {
      return monthlyPlans;
    }
    const rest = monthlyPlans.filter((plan) => plan.id !== recommended.id);
    const mid = Math.floor(rest.length / 2);
    return [...rest.slice(0, mid), recommended, ...rest.slice(mid)];
  })();

  if (loading) {
    return (
      <GameAccountOnboardingShell
        currentStep={1}
        titleKey="register.plan.title"
        descriptionKey="register.plan.description"
        loading
      >
        {null}
      </GameAccountOnboardingShell>
    );
  }

  const selectedPlanData = monthlyPlans.find((plan) => plan.id === selectedPlan);

  return (
    <GameAccountOnboardingShell
      currentStep={1}
      titleKey="register.plan.title"
      descriptionKey="register.plan.description"
      maxWidthClass="max-w-7xl"
    >
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6 lg:pt-4">
        {orderedPlans.map((plan: MonthlyPlan) => {
          const selected = selectedPlan === plan.id;
          const recommended = Boolean(plan.recommended);
          const hasDiscount =
            Boolean(plan.discount) &&
            plan.discount! > 0 &&
            plan.discounted_price > 0 &&
            plan.price > plan.discounted_price;
          const displayAmount = payableAmount(plan);
          const period = checkoutPeriodLabel(
            plan.frequency_type,
            plan.frequency_value,
            t,
          );
          const periodMonths = planPeriodMonths(
            plan.frequency_type,
            plan.frequency_value,
          );
          const savingsPercent =
            oneMonthPlan && periodMonths > 1
              ? durationSavingsPercent(
                  displayAmount,
                  payableAmount(oneMonthPlan),
                  periodMonths,
                )
              : null;
          const monthlyEquivalent =
            periodMonths > 1 && displayAmount > 0
              ? formatMoney(displayAmount / periodMonths, plan.currency)
              : null;

          return (
            <PlanSalesCard
              key={plan.id}
              plan={plan}
              selected={selected}
              recommended={recommended}
              displayAmount={displayAmount}
              period={period}
              hasDiscount={hasDiscount}
              savingsPercent={savingsPercent}
              monthlyEquivalent={monthlyEquivalent}
              formatMoney={formatMoney}
              onSelect={() => handlePlanSelect(plan.id)}
            />
          );
        })}
      </div>

      <p className="mt-5 text-center text-[1.3rem] text-slate-500">
        {t("register.game-onboarding.trust")}
      </p>

      {(paymentPending || paymentTimedOut) && !paymentModalOpen ? (
        <button
          type="button"
          onClick={openPaymentModal}
          className="mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-cyan-400/25 bg-cyan-950/40 px-5 py-4 text-left transition hover:border-cyan-400/45"
        >
          <span>
            <span className="block text-[1.4rem] font-semibold text-white">
              {t("register.plan.payment-checking-reopen")}
            </span>
            <span className="mt-1 block text-[1.25rem] text-cyan-100/80">
              {t("register.plan.payment-checking-minimized")}
            </span>
          </span>
          <span className="shrink-0 text-[1.3rem] font-semibold text-cyan-200">
            →
          </span>
        </button>
      ) : null}

      <PremiumActivationStatus
        isOpen={paymentModalOpen && (paymentPending || paymentConfirmed || paymentTimedOut)}
        confirmed={paymentConfirmed}
        timedOut={paymentTimedOut}
        pending={paymentPending}
        checking={premiumCheckInFlight}
        attempt={premiumCheckAttempt}
        maxAttempts={SUBSCRIPTION_POLL_MAX_ATTEMPTS}
        onCheckNow={() => {
          void handleCheckPayment();
        }}
        onClose={closePaymentModal}
      />

      <OnboardingActions
        onBack={handleVolverClick}
        backLabel={t("register.plan.back")}
        continueLabel={
          paymentConfirmed
            ? t("register.plan.continue-create")
            : isProcessing
              ? t("register.plan.continue")
              : selectedPlanData
                ? `${t("register.plan.continue")} · ${selectedPlanData.name}`
                : t("register.plan.continue")
        }
        continueDisabled={
          isProcessing || (!paymentConfirmed && !selectedPlan)
        }
        onContinue={() => {
          void handleContinue();
        }}
      />
    </GameAccountOnboardingShell>
  );
};

const PlanSelectionPage = () => (
  <Suspense
    fallback={
      <div className="relative min-h-screen overflow-visible bg-midnight">
        <div className="pointer-events-none absolute inset-0 fire-embers-blue opacity-50" />
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      </div>
    }
  >
    <PlanSelection />
  </Suspense>
);

export default PlanSelectionPage;

