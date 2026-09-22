"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoadingSpinner from "@/components/utilities/loading-spinner";
import Cookies from "js-cookie";
import useAuth from "@/hook/useAuth";

import { registerAccountGame } from "@/api/account/register";
import { getSubscriptionActive } from "@/api/subscriptions";
import { useTranslation } from "react-i18next";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import {
  SELECTED_PLAN_STORAGE_KEY,
  planPath,
} from "@/features/plan-selection/utils/premiumAccess";
import {
  GameAccountOnboardingShell,
  OnboardingActions,
} from "@/features/game-account-onboarding/components/GameAccountOnboardingShell";

const AccountIngame = () => {
  const { user } = useUserContext();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const jwt = Cookies.get("token");
  const { t } = useTranslation();

  useAuth(t("errors.message.expiration-session"));

  useEffect(() => {
    const ensurePremiumAccess = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.replace(planPath(false));
        return;
      }

      try {
        const hasActiveSubscription = await getSubscriptionActive(token);
        if (!hasActiveSubscription) {
          router.replace(planPath(false));
        }
      } catch (error) {
        console.error("No se pudo validar la suscripcion premium", error);
        router.replace(planPath(false));
      }
    };

    void ensurePremiumAccess();
  }, [router]);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

  

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.password-game-no-matches"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.password-game-empty"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }

    if (password.trim().length < 5 || password.trim().length > 30) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.password-game-invalid-length"),
        color: "white",
        background: "#0B1218",
        timer: 43500,
      });
      return;
    }
    setIsSubmitting(true);

    try {
      
      await registerAccountGame(
        {
          username: user.username,
          password: password,
          realm_name: user.server || "",
          expansion: user.expansion || "",
          game_mail: user.email,
        },
        jwt || ""
      );

      localStorage.removeItem(SELECTED_PLAN_STORAGE_KEY);

      router.push("/accounts");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolverClick = () => {
    router.push("/register/username?showWelcome=false");
  };

  const inputClassName =
    "mt-2 w-full rounded-xl border border-white/12 bg-slate-900/80 px-4 py-3.5 text-[1.5rem] text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20";

  return (
    <GameAccountOnboardingShell
      currentStep={3}
      titleKey="register.section-page.finaly-create-account-game.password-txt"
      descriptionKey="register.section-page.finaly-create-account-game.title-server-message"
      maxWidthClass="max-w-2xl"
    >
      <form
        onSubmit={handleFormSubmit}
        className="rounded-2xl border border-white/10 bg-slate-950/85 p-6 sm:p-8"
      >
        {(user.username || user.server) && (
          <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
            {user.username ? (
              <div>
                <p className="text-[1.15rem] uppercase tracking-[0.14em] text-slate-500">
                  {t("register.section-page.account-game.username-txt")}
                </p>
                <p className="mt-1 text-[1.6rem] font-semibold text-white">
                  {user.username}
                </p>
              </div>
            ) : null}
            {user.server ? (
              <div>
                <p className="text-[1.15rem] uppercase tracking-[0.14em] text-slate-500">
                  {t("register.section-page.account-game.realm-txt")}
                </p>
                <p className="mt-1 text-[1.6rem] font-semibold text-white">
                  {user.server}
                </p>
              </div>
            ) : null}
          </div>
        )}

        <label htmlFor="input-password" className="block text-[1.4rem] font-medium text-slate-300">
          {t("register.section-page.finaly-create-account-game.password-txt")}
        </label>
        <input
          id="input-password"
          className={inputClassName}
          maxLength={20}
          type="password"
          placeholder={t(
            "register.section-page.finaly-create-account-game.password-placeholder",
          )}
          value={password}
          onChange={handlePasswordChange}
        />

        <label
          htmlFor="input-confirm-password"
          className="mt-5 block text-[1.4rem] font-medium text-slate-300"
        >
          {t("register.section-page.finaly-create-account-game.confirm-password-txt")}
        </label>
        <input
          id="input-confirm-password"
          className={inputClassName}
          type="password"
          maxLength={20}
          placeholder={t(
            "register.section-page.finaly-create-account-game.confirm-password-placeholder",
          )}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />

        {isSubmitting ? (
          <div className="mt-6 flex flex-col items-center">
            <LoadingSpinner />
            <p className="mt-3 text-center text-[1.4rem] text-slate-400">
              {t("register.section-page.finaly-create-account-game.loading-sniper-txt")}
            </p>
          </div>
        ) : null}

        <OnboardingActions
          onBack={handleVolverClick}
          backLabel={t(
            "register.section-page.finaly-create-account-game.button.btn-secondary",
          )}
          continueLabel={t(
            "register.section-page.finaly-create-account-game.button.btn-primary",
          )}
          continueType="submit"
          continueDisabled={isSubmitting}
        />
      </form>
    </GameAccountOnboardingShell>
  );
};

export default AccountIngame;
