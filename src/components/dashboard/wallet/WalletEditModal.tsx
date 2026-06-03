"use client";

import { DashboardModalShell } from "@/components/dashboard/DashboardModalShell";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import { formatWalletAmount } from "@/features/wallet-balance/utils/formatWalletAmount";
import type { WalletUserRowDto } from "@/api/wallet/admin";
import { useEffect, useMemo, useState } from "react";

export type WalletBalanceSaveType = "donation" | "voting" | "machine";

interface WalletEditModalProps {
  open: boolean;
  user: WalletUserRowDto | null;
  defaultRealmId?: number;
  saving: boolean;
  savingType: WalletBalanceSaveType | null;
  onClose: () => void;
  onSaveDonation: (points: number) => void;
  onSaveVoting: (points: number) => void;
  onSaveMachine: (updates: { realm_id: number; points: number }[]) => void;
}

type BalanceTab = WalletBalanceSaveType;

function getInitials(first?: string | null, last?: string | null, email?: string | null): string {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  if (a || b) return `${a}${b}`.toUpperCase();
  return (email?.trim()?.[0] ?? "?").toUpperCase();
}

function parseNonNegativeInt(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

export function WalletEditModal({
  open,
  user,
  defaultRealmId,
  saving,
  savingType,
  onClose,
  onSaveDonation,
  onSaveVoting,
  onSaveMachine,
}: WalletEditModalProps) {
  const [activeTab, setActiveTab] = useState<BalanceTab>("donation");
  const [donationInput, setDonationInput] = useState("0");
  const [votingInput, setVotingInput] = useState("0");
  const [machineInputs, setMachineInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!user) return;
    setActiveTab("donation");
    setDonationInput(String(user.points ?? 0));
    setVotingInput(String(user.voting_points ?? 0));

    const initialMachine: Record<number, string> = {};
    for (const item of user.machine_wallets ?? []) {
      if (item.realm_id != null) {
        initialMachine[item.realm_id] = String(item.points ?? 0);
      }
    }
    if (defaultRealmId) {
      initialMachine[defaultRealmId] =
        initialMachine[defaultRealmId] ??
        String(user.machine_wallets?.find((m) => m.realm_id === defaultRealmId)?.points ?? 0);
    }
    setMachineInputs(initialMachine);
  }, [user, defaultRealmId]);

  const donationNext = useMemo(() => parseNonNegativeInt(donationInput), [donationInput]);
  const votingNext = useMemo(() => parseNonNegativeInt(votingInput), [votingInput]);

  const machineUpdates = useMemo(() => {
    const updates: { realm_id: number; points: number }[] = [];
    for (const [realmIdStr, value] of Object.entries(machineInputs)) {
      const realmId = Number(realmIdStr);
      const points = parseNonNegativeInt(value);
      if (!Number.isFinite(realmId) || points == null) continue;
      const original = user?.machine_wallets?.find((m) => m.realm_id === realmId)?.points ?? 0;
      if (points !== original) {
        updates.push({ realm_id: realmId, points });
      }
    }
    return updates;
  }, [machineInputs, user?.machine_wallets]);

  const donationChanged =
    donationNext != null && donationNext !== (user?.points ?? 0);
  const votingChanged =
    votingNext != null && votingNext !== (user?.voting_points ?? 0);
  const machineChanged = machineUpdates.length > 0;

  const votingAvailable = user?.voting_available !== false;

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Sin nombre";

  const tabs: { id: BalanceTab; label: string; value: string; tone: string }[] = [
    {
      id: "donation",
      label: "Donación",
      value: formatWalletAmount(user?.points ?? 0),
      tone: "border-amber-500/40 bg-amber-500/10 text-amber-100",
    },
    {
      id: "voting",
      label: "Votación",
      value: formatWalletAmount(user?.voting_points ?? 0),
      tone: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
    },
    {
      id: "machine",
      label: "Máquina",
      value: formatWalletAmount(user?.machine_points_total ?? 0),
      tone: "border-violet-500/40 bg-violet-500/10 text-violet-100",
    },
  ];

  return (
    <DashboardModalShell
      open={open}
      onClose={onClose}
      accent="amber"
      maxWidthClass="max-w-2xl"
      title="Gestionar balances"
      subtitle="Cada tipo de saldo se guarda por separado. Solo se actualiza lo que confirmes en la pestaña activa."
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`rounded-xl border ${DASHBOARD_PALETTE.border} px-5 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50`}
          >
            Cerrar
          </button>
        </div>
      }
    >
      {user && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-600/20 text-xl font-bold text-amber-200 ring-1 ring-amber-500/30">
              {getInitials(user.first_name, user.last_name, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-semibold text-white">{displayName}</p>
              <p className="truncate text-base text-slate-400">{user.email ?? "—"}</p>
              <p className="mt-1 text-sm text-slate-500">ID #{user.id}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  activeTab === tab.id
                    ? `${tab.tone} ring-1 ring-white/10`
                    : "border-slate-700/50 bg-slate-900/40 text-slate-400 hover:border-slate-600"
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-wide opacity-80">{tab.label}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">{tab.value}</p>
              </button>
            ))}
          </div>

          {activeTab === "donation" && (
            <section className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-lg font-semibold text-amber-100">Puntos de donación</h3>
              <p className="text-base text-slate-400">
                Saldo usado en la tienda y beneficios de cuenta.
              </p>
              <input
                type="number"
                min={0}
                step={1}
                value={donationInput}
                onChange={(e) => setDonationInput(e.target.value)}
                className={`${DASHBOARD_PALETTE.input} py-4 text-2xl font-bold tabular-nums`}
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={saving || !donationChanged || donationNext == null}
                  onClick={() => donationNext != null && onSaveDonation(donationNext)}
                  className={`${DASHBOARD_PALETTE.btnPrimary} px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {saving && savingType === "donation" ? "Guardando..." : "Guardar donación"}
                </button>
              </div>
            </section>
          )}

          {activeTab === "voting" && (
            <section className="space-y-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
              <h3 className="text-lg font-semibold text-cyan-100">Puntos de votación</h3>
              {!votingAvailable ? (
                <p className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 text-base text-slate-400">
                  No hay plataformas de votación activas en el servidor. Configúralas primero en la sección Votes del panel.
                </p>
              ) : (
                <>
                  <p className="text-base text-slate-400">
                    Total de puntos de voto del usuario. Solo se guarda este valor al confirmar.
                  </p>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={votingInput}
                    onChange={(e) => setVotingInput(e.target.value)}
                    className={`${DASHBOARD_PALETTE.input} py-4 text-2xl font-bold tabular-nums`}
                  />
                  {(user.voting_wallets ?? []).length > 0 && (
                    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Detalle por plataforma (solo lectura)
                      </p>
                      <ul className="space-y-2">
                        {user.voting_wallets.map((vw) => (
                          <li
                            key={vw.id}
                            className="flex items-center justify-between text-base text-slate-300"
                          >
                            <span>{vw.platform_name ?? `Plataforma #${vw.platform_id}`}</span>
                            <span className="font-bold tabular-nums text-cyan-200">
                              {formatWalletAmount(vw.vote_balance ?? 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={saving || !votingChanged || votingNext == null}
                      onClick={() => votingNext != null && onSaveVoting(votingNext)}
                      className={`${DASHBOARD_PALETTE.btnPrimary} px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {saving && savingType === "voting" ? "Guardando..." : "Guardar votación"}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === "machine" && (
            <section className="space-y-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <h3 className="text-lg font-semibold text-violet-100">Puntos de máquina (slot)</h3>
              <p className="text-base text-slate-400">
                Puntos por reino. Solo se envían los reinos que hayas modificado.
              </p>

              {Object.keys(machineInputs).length === 0 ? (
                <p className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 text-base text-slate-400">
                  Este usuario no tiene registros de máquina. Abre el panel desde un reino para asignar puntos al reino actual.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(machineInputs).map(([realmIdStr, value]) => {
                    const realmId = Number(realmIdStr);
                    const realmName =
                      user.machine_wallets?.find((m) => m.realm_id === realmId)?.realm_name ??
                      (defaultRealmId === realmId ? "Reino del panel" : `Reino #${realmId}`);
                    return (
                      <div
                        key={realmIdStr}
                        className="flex flex-col gap-3 rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-base font-semibold text-white">{realmName}</p>
                          <p className="text-sm text-slate-500">Reino ID {realmId}</p>
                        </div>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={value}
                          onChange={(e) =>
                            setMachineInputs((prev) => ({ ...prev, [realmId]: e.target.value }))
                          }
                          className={`${DASHBOARD_PALETTE.input} w-full py-3 text-xl font-bold tabular-nums sm:max-w-[180px]`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={saving || !machineChanged}
                  onClick={() => onSaveMachine(machineUpdates)}
                  className={`${DASHBOARD_PALETTE.btnPrimary} px-6 py-3 text-base disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {saving && savingType === "machine" ? "Guardando..." : "Guardar máquina"}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </DashboardModalShell>
  );
}
