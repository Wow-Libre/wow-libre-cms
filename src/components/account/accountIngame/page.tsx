"use client";

import useAuth from "@/hook/useAuth";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";

import { getServersForGameRegistration } from "@/api/account/realms";
import { isUserPremiumActive } from "@/api/subscriptions";
import { useUserContext } from "@/context/UserContext";
import { ServerModel } from "@/model/model";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import GamingModal from "@/components/utilities/gaming-modal";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import {
  GameAccountOnboardingShell,
  OnboardingActions,
} from "@/features/game-account-onboarding/components/GameAccountOnboardingShell";
import { GameAccountRealmField } from "@/features/game-account-onboarding/components/GameAccountRealmField";
import {
  planPath,
} from "@/features/plan-selection/utils/premiumAccess";

const USERNAME_PATTERN = /^[a-zA-Z0-9\s]*$/;

const Username = () => {
  const { user, setUser } = useUserContext();
  const [userName, setUsername] = useState("");
  const [servers, setServers] = useState<ServerModel[]>([]);
  const [gameMail, setGameMail] = useState("");
  const [selectedServerId, setSelectedServerId] = useState("");
  const router = useRouter();
  const { t, ready } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [serversLoading, setServersLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<"checking" | "ok" | "required">(
    "checking",
  );

  useAuth(t("errors.message.expiration-session"));

  const searchParams = useSearchParams();
  const disclaimerParam = searchParams.get("showWelcome");
  const disclaimer = disclaimerParam === "true";

  useEffect(() => {
    if (ready) {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    if (disclaimer && premiumStatus === "ok") {
      setShowWelcomeModal(true);
    }
  }, [disclaimer, premiumStatus]);

  const goToPlans = () => {
    router.replace(planPath(disclaimer));
  };

  useEffect(() => {
    const ensurePremiumAccess = async () => {
      const token = Cookies.get("token");
      if (!token) {
        goToPlans();
        return;
      }

      try {
        const hasActiveSubscription = await isUserPremiumActive(token);
        if (!hasActiveSubscription) {
          setPremiumStatus("required");
          setShowWelcomeModal(false);
          return;
        }
        setPremiumStatus("ok");
      } catch (error) {
        console.error("No se pudo validar la suscripcion premium", error);
        setPremiumStatus("required");
        setShowWelcomeModal(false);
      }
    };

    void ensurePremiumAccess();
  }, [disclaimer, router]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setServersLoading(true);
        const serversData = await getServersForGameRegistration();
        setServers(serversData);
      } catch (error) {
        console.error("No se pudieron cargar los reinos", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: t("register.error.servers-fetch-empty"),
          color: "white",
          background: "#0B1218",
          timer: 4500,
        });
      } finally {
        setServersLoading(false);
      }
    };

    fetchServers();
  }, []);

  const groupedServers = useMemo(() => {
    const map = new Map<string, ServerModel[]>();
    servers.forEach((server) => {
      const key = server.exp_name || "Otros";
      const group = map.get(key);
      if (group) {
        group.push(server);
        return;
      }
      map.set(key, [server]);
    });
    return Array.from(map.entries());
  }, [servers]);

  useEffect(() => {
    if (serversLoading || servers.length === 0 || selectedServerId) {
      return;
    }
    if (servers.length === 1) {
      setSelectedServerId(String(servers[0].id));
    }
  }, [serversLoading, servers, selectedServerId]);

  const selectedServer = servers.find(
    (server) => String(server.id) === selectedServerId,
  );
  const trimmedName = userName.trim();
  const usernameLengthOk = trimmedName.length >= 5 && trimmedName.length <= 20;
  const usernameCharsOk = USERNAME_PATTERN.test(userName);
  const canContinue = Boolean(selectedServer && usernameLengthOk && usernameCharsOk);
  const usernameTouched = userName.length > 0;

  const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleGameMailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGameMail(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (premiumStatus !== "ok") {
      setPremiumStatus("required");
      return;
    }

    if (!selectedServer) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.server-is-empty"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (!trimmedName) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.username-empty"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (!usernameCharsOk) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: t("register.error.special-characters"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (!usernameLengthOk) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("register.error.username-invalid-length"),
        color: "white",
        background: "#0B1218",
        timer: 4500,
      });
      return;
    }

    if (user) {
      setUser({
        ...user,
        username: userName,
        server: selectedServer.name,
        expansion: selectedServer.expansion,
        email: gameMail,
      });
    }
    router.push("/register/account-ingame");
  };

  const handleVolverClick = () => {
    router.push(planPath(disclaimer));
  };

  if (loading || premiumStatus === "checking") {
    return (
      <GameAccountOnboardingShell
        currentStep={2}
        titleKey="register.section-page.account-game.form-title"
        descriptionKey="register.section-page.account-game.form-subtitle"
        loading
      >
        {null}
      </GameAccountOnboardingShell>
    );
  }

  return (
    <GameAccountOnboardingShell
      currentStep={2}
      titleKey="register.section-page.account-game.form-title"
      descriptionKey="register.section-page.account-game.form-subtitle"
      maxWidthClass="max-w-3xl"
    >
      <form
        onSubmit={handleFormSubmit}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1219] p-7 sm:p-9"
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-44 w-64 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
          aria-hidden
        />

        <section className="relative">
          <p
            id="realm-field-label"
            className="text-[1.15rem] font-semibold uppercase tracking-[0.18em] text-cyan-300"
          >
            {t("register.section-page.account-game.realm-txt")}
          </p>
          <p className="mt-2 text-[1.4rem] text-slate-400">
            {t("register.section-page.account-game.realm-helper")}
          </p>
          <GameAccountRealmField
            servers={servers}
            groupedServers={groupedServers}
            selectedServerId={selectedServerId}
            loading={serversLoading}
            onSelect={setSelectedServerId}
          />
        </section>

        <section className="relative mt-8 border-t border-white/10 pt-8">
          <p className="text-[1.15rem] font-semibold uppercase tracking-[0.18em] text-cyan-300">
            {t("register.section-page.account-game.username-txt")}
          </p>
          <div
            className={`mt-3 rounded-2xl border px-4 py-3 transition ${
              usernameTouched &&
              (!usernameCharsOk || (trimmedName.length > 0 && trimmedName.length < 5))
                ? "border-amber-400/50 bg-slate-950/70"
                : "border-white/12 bg-slate-950/70 focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/15"
            }`}
          >
            <label htmlFor="usernameForm" className="sr-only">
              {t("register.section-page.account-game.username-txt")}
            </label>
            <input
              id="usernameForm"
              className="w-full bg-transparent text-[2.1rem] font-semibold tracking-wide text-white placeholder:text-slate-500 focus:outline-none"
              type="text"
              maxLength={20}
              autoComplete="username"
              placeholder={t(
                "register.section-page.account-game.username-placeholder",
              )}
              value={userName}
              onChange={handleUserNameChange}
            />
          </div>
          <div className="mt-2 flex items-start justify-between gap-4">
            <p className="text-[1.3rem] leading-relaxed text-slate-500">
              {t("register.section-page.account-game.username-helper")}
            </p>
            <p
              className={`shrink-0 text-[1.25rem] ${
                usernameLengthOk ? "text-cyan-200" : "text-slate-500"
              }`}
            >
              {trimmedName.length}/20
            </p>
          </div>
        </section>

        {Number(selectedServer?.expansion) > 2 ? (
          <section className="relative mt-8">
            <label
              htmlFor="emailGameForm"
              className="text-[1.15rem] font-semibold uppercase tracking-[0.18em] text-cyan-300"
            >
              {t("register.section-page.account-game.email-game-txt")}
            </label>
            <input
              id="emailGameForm"
              className="mt-3 w-full rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-4 text-[1.6rem] text-white placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/15"
              type="text"
              maxLength={60}
              placeholder={t(
                "register.section-page.account-game.email-game-placeholder",
              )}
              value={gameMail}
              onChange={handleGameMailChange}
            />
            <p className="mt-2 text-[1.3rem] leading-relaxed text-slate-500">
              {t("register.section-page.account-game.email-game-disclaimer")}
            </p>
          </section>
        ) : null}

        <section className="relative mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-5">
          <p className="text-[1.15rem] font-semibold uppercase tracking-[0.16em] text-cyan-300">
            {t("register.section-page.account-game.client-login")}
          </p>
          {trimmedName && selectedServer ? (
            <>
              <p className="mt-2 truncate text-[2.2rem] font-semibold tracking-wide text-white">
                {trimmedName}
              </p>
              <p className="mt-1 text-[1.4rem] text-slate-300">
                {selectedServer.name}
                {selectedServer.exp_name ? ` · ${selectedServer.exp_name}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-2 text-[1.45rem] leading-relaxed text-slate-400">
              {t("register.section-page.account-game.client-preview-empty")}
            </p>
          )}
        </section>

        <OnboardingActions
          onBack={handleVolverClick}
          backLabel={t("register.section-page.account-game.button.btn-secondary")}
          continueLabel={t("register.section-page.account-game.button.btn-primary")}
          continueType="submit"
          continueDisabled={!canContinue || premiumStatus !== "ok"}
        />
      </form>

      <GamingModal
        isOpen={premiumStatus === "required"}
        onClose={goToPlans}
        title={t("register.section-page.account-game.premium-gate.title")}
        description={t(
          "register.section-page.account-game.premium-gate.description",
        )}
        kicker={t("register.section-page.account-game.premium-gate.kicker")}
        highlight={t(
          "register.section-page.account-game.premium-gate.highlight",
        )}
        steps={[
          t("register.section-page.account-game.premium-gate.step-1"),
          t("register.section-page.account-game.premium-gate.step-2"),
        ]}
        buttonText={t("register.section-page.account-game.premium-gate.cta")}
        onConfirm={goToPlans}
        showCloseButton={false}
      />

      <GamingModal
        isOpen={showWelcomeModal && premiumStatus === "ok"}
        onClose={() => setShowWelcomeModal(false)}
        title={t("register.section-page.account-game.show-welcome.title")}
        description={t(
          "register.section-page.account-game.show-welcome.description",
        )}
        kicker={t("register.section-page.account-game.show-welcome.kicker")}
        highlight={t(
          "register.section-page.account-game.show-welcome.highlight",
        )}
        steps={[
          t("register.section-page.account-game.show-welcome.step-1"),
          t("register.section-page.account-game.show-welcome.step-2"),
          t("register.section-page.account-game.show-welcome.step-3"),
        ]}
        buttonText={t("register.section-page.account-game.show-welcome.cta")}
        onConfirm={() => {
          setShowWelcomeModal(false);
        }}
        showCloseButton={false}
      />
    </GameAccountOnboardingShell>
  );
};

export default Username;
