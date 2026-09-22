"use client";

import React, { useState } from "react";
import { CreateBenefitPremiumDto, BenefitPremiumItemDto } from "../types";
import { createBenefitPremium } from "../api/premiumApi";
import { DashboardModalShell } from "@/components/dashboard/DashboardModalShell";
import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";

interface CreatePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  realmId: number;
  language: string;
}

const FIELD_LABEL = "mb-2.5 block text-lg font-semibold text-[#6e6e73]";
const FIELD_INPUT = `${DASHBOARD_PALETTE.input} text-lg py-4`;

const CreatePremiumModal: React.FC<CreatePremiumModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  realmId,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBenefitPremiumDto>({
    img: "",
    name: "",
    description: "",
    command: "",
    send_item: true,
    reactivable: false,
    btn_text: "Ver más",
    type: "ITEM",
    realm_id: realmId,
    language: language,
    items: [],
  });

  const [currentItem, setCurrentItem] = useState<BenefitPremiumItemDto>({
    code: "",
    quantity: 1,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const updated = { ...formData, [name]: value };
      if (name === "type") {
        updated.send_item = value === "ITEM";
        if (value !== "ITEM") {
          updated.items = [];
        }
      }
      setFormData(updated);
    }
  };

  const addItem = () => {
    if (currentItem.code.trim() && currentItem.quantity > 0) {
      setFormData((prev) => ({
        ...prev,
        items: [...(prev.items || []), { ...currentItem }],
      }));
      setCurrentItem({ code: "", quantity: 1 });
    }
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.img.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "La URL de la imagen es requerida",
        background: "#ffffff",
        color: "#1d1d1f",
      });
      return;
    }

    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "El nombre es requerido",
        background: "#ffffff",
        color: "#1d1d1f",
      });
      return;
    }

    if (formData.type !== "ITEM" && !formData.command.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "El comando es requerido",
        background: "#ffffff",
        color: "#1d1d1f",
      });
      return;
    }

    if (formData.type === "ITEM" && (!formData.items || formData.items.length === 0)) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "Debe agregar al menos un item cuando el tipo es ITEM",
        background: "#ffffff",
        color: "#1d1d1f",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: CreateBenefitPremiumDto = {
        ...formData,
        items: formData.type === "ITEM" ? formData.items : undefined,
      };

      await createBenefitPremium(payload, token);
      await Swal.fire({
        title: "¡Éxito!",
        text: "El paquete premium ha sido creado correctamente",
        icon: "success",
        background: "#ffffff",
        color: "#1d1d1f",
      });

      onSuccess();
      onClose();
      setFormData({
        img: "",
        name: "",
        description: "",
        command: "",
        send_item: true,
        reactivable: false,
        btn_text: "Ver más",
        type: "ITEM",
        realm_id: realmId,
        language: language,
        items: [],
      });
      setCurrentItem({ code: "", quantity: 1 });
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "No se pudo crear el paquete premium",
        background: "#ffffff",
        color: "#1d1d1f",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardModalShell
      open={isOpen}
      onClose={onClose}
      title="Nuevo paquete premium"
      subtitle="Completá los campos para publicar un beneficio en la tienda premium."
      maxWidthClass="max-w-4xl"
      accent="amber"
      zIndexClass="z-[200]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 bg-white px-6 py-3.5 text-lg font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="premium-form"
            disabled={loading}
            className={`text-lg disabled:opacity-50 ${DASHBOARD_PALETTE.btnPrimary}`}
          >
            {loading ? "Creando..." : "Crear paquete premium"}
          </button>
        </div>
      }
    >
      <form id="premium-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={FIELD_LABEL}>
            URL de imagen <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            type="text"
            name="img"
            value={formData.img}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            className={FIELD_INPUT}
            required
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>
            Nombre <span className="text-[#ff3b30]">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre del paquete"
            maxLength={30}
            className={FIELD_INPUT}
            required
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>
            Tipo <span className="text-[#ff3b30]">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={FIELD_INPUT}
            required
          >
            <option value="CHANGE_FACTION">Cambiar Facción</option>
            <option value="CHANGE_RACE">Cambiar Raza</option>
            <option value="CUSTOMIZE">Personalizar</option>
            <option value="ITEM">Item</option>
            <option value="LEVEL">Nivel</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={FIELD_LABEL}>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción del paquete premium"
            rows={3}
            className={`${FIELD_INPUT} resize-none`}
          />
        </div>

        {formData.type !== "ITEM" && (
          <div>
            <label className={FIELD_LABEL}>
              Comando <span className="text-[#ff3b30]">*</span>
            </label>
            <input
              type="text"
              name="command"
              value={formData.command}
              onChange={handleChange}
              placeholder=".comando ejemplo"
              className={`${FIELD_INPUT} font-mono`}
              required
            />
          </div>
        )}

        <div>
          <label className={FIELD_LABEL}>Texto del botón</label>
          <input
            type="text"
            name="btn_text"
            value={formData.btn_text}
            onChange={handleChange}
            placeholder="Ver más"
            className={FIELD_INPUT}
          />
        </div>

        <div>
          <label className={FIELD_LABEL}>
            Idioma <span className="text-[#ff3b30]">*</span>
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className={FIELD_INPUT}
            required
          >
            <option value="ES">Español</option>
            <option value="EN">Inglés</option>
            <option value="PT">Portugués</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-4">
            <input
              type="checkbox"
              name="reactivable"
              id="reactivable"
              checked={formData.reactivable}
              onChange={handleChange}
              className="mt-1 h-5 w-5 rounded border-black/20 text-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/25"
            />
            <span>
              <span className={`block text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
                Reactivable
              </span>
              <span className={`mt-1 block text-lg ${DASHBOARD_PALETTE.textMuted}`}>
                El jugador puede volver a reclamar este beneficio.
              </span>
            </span>
          </label>
        </div>

        {formData.type === "ITEM" && (
          <div className="md:col-span-2">
            <label className={FIELD_LABEL}>
              Items <span className="text-[#ff3b30]">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={currentItem.code}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  placeholder="Código del item (ej: 12345)"
                  className={`${FIELD_INPUT} flex-1`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                />
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  placeholder="Cantidad"
                  className={`${FIELD_INPUT} sm:w-32`}
                />
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!currentItem.code.trim() || currentItem.quantity <= 0}
                  className={`${DASHBOARD_PALETTE.btnPrimary} text-lg disabled:opacity-50`}
                >
                  Agregar
                </button>
              </div>
              {formData.items && formData.items.length > 0 ? (
                <div className="max-h-[min(40vh,280px)] space-y-2 overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#fbfbfd] p-2">
                  {formData.items.map((item, index) => (
                    <div
                      key={`${item.code}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-black/[0.08] bg-white px-4 py-3"
                    >
                      <p className={`text-lg ${DASHBOARD_PALETTE.text}`}>
                        Código{" "}
                        <span className="font-mono font-semibold">{item.code}</span>
                        <span className={`mx-2 ${DASHBOARD_PALETTE.textMuted}`}>·</span>
                        Cantidad{" "}
                        <span className="font-semibold">{item.quantity}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded-full p-1.5 text-[#ff3b30] transition hover:bg-[#ff3b30]/10"
                        title="Eliminar item"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-lg ${DASHBOARD_PALETTE.textMuted}`}>
                  No hay items. Agregá al menos uno para continuar.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </DashboardModalShell>
  );
};

export default CreatePremiumModal;
