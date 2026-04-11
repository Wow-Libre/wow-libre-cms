import { banAccount, updateMail } from "@/api/dashboard/users";
import { InternalServerError } from "@/dto/generic";
import { AccountsServer } from "@/model/model";
import { useState } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import { DashboardModalShell } from "@/components/dashboard/DashboardModalShell";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

interface BanData {
  banDate: string;
  banReason: string;
  gmName: string;
}

interface UserActionModalProps {
  selectedUser: AccountsServer | null;
  onClose: () => void;
  serverId: number;
  token: string;
  fetchData: () => void;
  banned: boolean;
}

const inputClass = `w-full rounded-xl border border-slate-600/50 bg-slate-800/50 px-4 py-3 text-white outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${DASHBOARD_PALETTE.text}`;

export default function UserActionModal({
  selectedUser,
  onClose,
  serverId,
  token,
  fetchData,
  banned,
}: UserActionModalProps) {
  const [editedEmail, setEditedEmail] = useState(selectedUser?.email || "");
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState(0);
  const [banHours, setBanHours] = useState(0);
  const [banMinutes, setBanMinutes] = useState(0);
  const [password, setPassword] = useState("");
  const [banSeconds, setBanSeconds] = useState(0);
  const [gmName, setGmName] = useState("");
  const [actionType, setActionType] = useState<"edit" | "ban">("edit");

  const handleSaveEmail = async () => {
    if (!isValidEmail(editedEmail)) {
      Swal.fire(
        "Error",
        "Por favor, ingrese un correo electrónico válido.",
        "error"
      );
      return;
    }

    if (selectedUser) {
      try {
        await updateMail(editedEmail, selectedUser.username, serverId, token);
        Swal.fire(
          "Éxito",
          "El correo ha sido actualizado correctamente.",
          "success"
        );
        fetchData();
        onClose();
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
          });
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error instanceof Error ? error.message : "Error desconocido",
          timer: 4000,
        });
      }
    }
  };

  const handleBanUser = async () => {
    if (!password || !gmName || !banReason) {
      Swal.fire("Error", "Por favor, ingrese los campos.", "error");
      return;
    }

    if (selectedUser) {
      try {
        await banAccount(
          selectedUser.username,
          banDays,
          banHours,
          banMinutes,
          banSeconds,
          gmName,
          banReason,
          password,
          serverId,
          token
        );

        Swal.fire("Éxito", "El usuario ha sido baneado.", "success");
        fetchData();
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
          });
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error instanceof Error ? error.message : "Error desconocido",
          timer: 4000,
        });
      }
    }
  };

  const handleSubmit = () => {
    if (actionType === "edit") {
      handleSaveEmail();
    } else if (actionType === "ban") {
      handleBanUser();
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const isBanDisabled =
    actionType === "ban" &&
    ((banDays === 0 &&
      banHours === 0 &&
      banMinutes === 0 &&
      banSeconds === 0) ||
      banReason.trim() === "" ||
      gmName.trim() === "" ||
      password.trim() === "");

  const isEditDisabled = actionType === "edit" && editedEmail.trim() === "";

  if (!selectedUser) return null;

  return (
    <DashboardModalShell
      open
      onClose={onClose}
      title={actionType === "edit" ? "Editar usuario" : "Banear usuario"}
      subtitle={`ID ${selectedUser.id} · ${selectedUser.username}`}
      maxWidthClass="max-w-3xl"
      accent={actionType === "ban" ? "amber" : "cyan"}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border border-slate-600/60 bg-slate-800/90 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/90`}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={actionType === "ban" ? isBanDisabled : isEditDisabled}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                actionType === "ban"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 disabled:opacity-40"
                  : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-95 disabled:opacity-40"
              }`}
            >
              {actionType === "edit" ? "Guardar" : "Confirmar baneo"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {!banned && (
              <button
                type="button"
                onClick={() => setActionType("ban")}
                className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25"
              >
                Banear
              </button>
            )}
            <button
              type="button"
              onClick={() => setActionType("edit")}
              className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Editar correo
            </button>
          </div>
        </div>
      }
    >
      <div className={`space-y-6 ${DASHBOARD_PALETTE.text}`}>
        <div className="grid gap-3 rounded-xl border border-slate-600/40 bg-slate-800/30 p-4 sm:grid-cols-2">
          <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
            <span className="font-medium text-slate-300">ID:</span> {selectedUser.id}
          </p>
          <p className={`text-sm ${DASHBOARD_PALETTE.textMuted}`}>
            <span className="font-medium text-slate-300">Usuario:</span>{" "}
            {selectedUser.username}
          </p>
        </div>

        {actionType === "edit" && (
          <div>
            <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
              Email
            </label>
            <input
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {actionType === "ban" && (
          <div className="space-y-4">
            <div>
              <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                Duración del ban
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Días", value: banDays, set: setBanDays },
                  { label: "Horas", value: banHours, set: setBanHours },
                  { label: "Min", value: banMinutes, set: setBanMinutes },
                  { label: "Seg", value: banSeconds, set: setBanSeconds },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={f.value}
                      onChange={(e) => f.set(Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-600/50 bg-slate-800/50 py-2 text-center text-white outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <span className={`text-xs ${DASHBOARD_PALETTE.textMuted}`}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                Razón
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                Nombre GM
              </label>
              <input
                type="text"
                value={gmName}
                onChange={(e) => setGmName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${DASHBOARD_PALETTE.label}`}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardModalShell>
  );
}
