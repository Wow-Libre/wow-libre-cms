"use client";

import { getPlanAcquisition } from "@/api/home";
import { getPaymentMethodsGateway } from "@/api/payment_methods";
import { buyProduct } from "@/api/store";
import { activateFreeTrial, getTrialEligibility } from "@/api/subscriptions";
import { InternalServerError } from "@/dto/generic";
import { PaymentMethodsGatewayReponse } from "@/dto/response/PaymentMethodsResponse";
import { isFreeTrialPlan } from "@/features/plan-selection/utils/premiumAccess";
import { BuyRedirectDto, PlansAcquisition } from "@/model/model";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { isOneMonthPlan } from "@/features/plan-selection/utils/planDuration";

function submitPaymentForm(response: BuyRedirectDto) {
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
  form.target = "_blank";

  Object.keys(paymentData).forEach((key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(paymentData[key]);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export function useSubscriptionCheckout(
  language: string,
  options?: { onTrialActivated?: () => void },
) {
  const token = Cookies.get("token");
  const router = useRouter();
  const { t } = useTranslation();
  const onTrialActivated = options?.onTrialActivated;

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlansAcquisition[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsGatewayReponse[]>([]);
  const [trialEligible, setTrialEligible] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [methods, plansData, eligible] = await Promise.all([
          token ? getPaymentMethodsGateway(token) : Promise.resolve([]),
          getPlanAcquisition(language || "es"),
          token ? getTrialEligibility(token) : Promise.resolve(false),
        ]);
        if (!cancelled) {
          setPaymentMethods(methods);
          setPlans(plansData ?? []);
          setTrialEligible(eligible);
        }
      } catch {
        if (!cancelled) {
          setPaymentMethods([]);
          setPlans([]);
          setTrialEligible(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [language, token]);

  const monthlyPlan = useMemo(
    () =>
      plans.find(
        (plan) =>
          plan.price > 0 &&
          isOneMonthPlan(plan.frequency_type, plan.frequency_value),
      ),
    [plans],
  );

  const recommendedPlanIndex = useMemo(() => {
    const yearlyIndex = plans.findIndex(
      (plan) => plan.price > 0 && plan.frequency_type === "YEARLY",
    );
    if (yearlyIndex >= 0) return yearlyIndex;
    const paidIndices = plans
      .map((plan, index) => (plan.price > 0 ? index : -1))
      .filter((index) => index >= 0);
    return paidIndices[Math.floor(paidIndices.length / 2)] ?? 0;
  }, [plans]);

  const processPayment = useCallback(
    async (paymentMethod: PaymentMethodsGatewayReponse, planId?: string | null) => {
      if (!token) {
        router.push("/login");
        return;
      }

      const planIdToSend = planId ?? selectedPlanId;
      if (!planIdToSend) return;

      try {
        const response = await buyProduct(
          null,
          token,
          true,
          planIdToSend,
          paymentMethod.payment_type,
          1,
        );
        submitPaymentForm(response);
      } catch (error: unknown) {
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
          text: error instanceof Error ? error.message : "Error al procesar el pago",
          color: "white",
          background: "#0B1218",
        });
      }
    },
    [router, selectedPlanId, token],
  );

  const handlePlanSelect = useCallback(
    (planId: string) => {
      const selectedPlan = plans.find((plan) => String(plan.id) === planId);
      if (selectedPlan && isFreeTrialPlan(selectedPlan)) {
        setShowPlansModal(false);
        if (!token) {
          router.push("/login");
          return;
        }
        if (!trialEligible) {
          Swal.fire({
            icon: "info",
            title: t("subscription.trial.not-eligible-title"),
            text: t("subscription.trial.not-eligible-text"),
            color: "white",
            background: "#0B1218",
          });
          return;
        }
        void (async () => {
          try {
            await activateFreeTrial(token, Number(planId));
            await Swal.fire({
              icon: "success",
              title: t("subscription.trial.activated-title"),
              text: t("subscription.trial.activated-text"),
              color: "white",
              background: "#0B1218",
            });
            setTrialEligible(false);
            onTrialActivated?.();
          } catch (error: unknown) {
            const ineligible =
              error instanceof InternalServerError && error.statusCode === 409;
            Swal.fire({
              icon: ineligible ? "info" : "error",
              title: ineligible
                ? t("subscription.trial.not-eligible-title")
                : t("subscription.trial.activate-error-title"),
              text: ineligible
                ? t("subscription.trial.not-eligible-text")
                : error instanceof Error
                  ? error.message
                  : t("subscription.trial.activate-error-text"),
              color: "white",
              background: "#0B1218",
            });
          }
        })();
        return;
      }

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
          text: "Contacta al administrador para configurar métodos de pago.",
          color: "white",
          background: "#0B1218",
        });
        return;
      }

      if (paymentMethods.length === 1) {
        void processPayment(paymentMethods[0], planId);
        return;
      }

      setShowPaymentModal(true);
    },
    [paymentMethods, plans, processPayment, router, t, token, trialEligible, onTrialActivated],
  );

  const startCheckout = useCallback(
    (prefilledPlanId?: number | null) => {
      if (!token) {
        router.push("/login");
        return;
      }
      if (prefilledPlanId != null) {
        handlePlanSelect(String(prefilledPlanId));
        return;
      }
      setShowPlansModal(true);
    },
    [handlePlanSelect, router, token],
  );

  const handlePaymentMethodSelect = useCallback(
    (paymentMethod: PaymentMethodsGatewayReponse) => {
      setShowPaymentModal(false);
      void processPayment(paymentMethod, selectedPlanId);
    },
    [processPayment, selectedPlanId],
  );

  return {
    loading,
    plans,
    trialEligible,
    paymentMethods,
    monthlyPlan,
    recommendedPlanIndex,
    showPlansModal,
    setShowPlansModal,
    showPaymentModal,
    setShowPaymentModal,
    startCheckout,
    handlePlanSelect,
    handlePaymentMethodSelect,
  };
}
