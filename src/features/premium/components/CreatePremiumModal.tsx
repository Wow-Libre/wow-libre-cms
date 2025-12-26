"use client";

import React, { useState } from "react";
import { CreateBenefitPremiumDto, BenefitPremiumItemDto } from "../types";
import { createBenefitPremium } from "../api/premiumApi";
import Swal from "sweetalert2";

interface CreatePremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  realmId: number;
  language: string;
}

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
    send_item: true, // true porque el tipo por defecto es ITEM
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      const updated = { ...formData, [name]: value };
      // Si cambió el tipo, establecer sendItem automáticamente
      if (name === "type") {
        updated.send_item = value === "ITEM";
        // Si no es ITEM, limpiar items
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
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    if (!formData.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "El nombre es requerido",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    // El comando solo es requerido si el tipo NO es ITEM
    if (formData.type !== "ITEM" && !formData.command.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "El comando es requerido",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    if (
      formData.type === "ITEM" &&
      (!formData.items || formData.items.length === 0)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "Debe agregar al menos un item cuando el tipo es ITEM",
        background: "#0B1218",
        color: "white",
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
        background: "#0B1218",
        color: "white",
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        img: "",
        name: "",
        description: "",
        command: "",
        send_item: true, // true porque el tipo por defecto es ITEM
        reactivable: false,
        btn_text: "Ver más",
        type: "ITEM",
        realm_id: realmId,
        language: language,
        items: [],
      });
      setCurrentItem({ code: "", quantity: 1 });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear el paquete premium",
        background: "#0B1218",
        color: "white",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/70 rounded-xl shadow-2xl p-10 m-4">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200"
          aria-label="Cerrar modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Crear Nuevo Paquete Premium
            </h2>
          </div>
          <p className="text-slate-400 text-sm ml-4">
            Complete todos los campos requeridos para crear un nuevo paquete
            premium
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagen */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                URL de Imagen <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="img"
                value={formData.img}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200"
                required
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del paquete"
                maxLength={30}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200"
                required
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tipo <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none transition-all duration-200"
                required
              >
                <option value="CHANGE_FACTION">Cambiar Facción</option>
                <option value="CHANGE_RACE">Cambiar Raza</option>
                <option value="CUSTOMIZE">Personalizar</option>
                <option value="ITEM">Item</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción del paquete premium"
                rows={3}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200 resize-none"
              />
            </div>

            {/* Comando - Solo visible cuando el tipo NO es ITEM */}
            {formData.type !== "ITEM" && (
              <div>
                <label className="block text-base font-semibold text-slate-300 mb-2">
                  Comando <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="command"
                  value={formData.command}
                  onChange={handleChange}
                  placeholder=".comando ejemplo"
                  className="w-full px-4 py-3 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200 font-mono"
                  required
                />
              </div>
            )}

            {/* Texto del Botón */}
            <div>
              <label className="block text-base font-semibold text-slate-300 mb-2">
                Texto del Botón
              </label>
              <input
                type="text"
                name="btn_text"
                value={formData.btn_text}
                onChange={handleChange}
                placeholder="Ver más"
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200"
              />
            </div>

            {/* Idioma */}
            <div>
              <label className="block text-base font-semibold text-slate-300 mb-2">
                Idioma <span className="text-red-400">*</span>
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none transition-all duration-200"
                required
              >
                <option value="ES">Español</option>
                <option value="EN">Inglés</option>
                <option value="PT">Portugués</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="reactivable"
                  id="reactivable"
                  checked={formData.reactivable}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-slate-800/50 border-slate-700/50 text-amber-500 focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="reactivable"
                  className="text-base font-medium text-slate-300 cursor-pointer"
                >
                  Reactivable
                </label>
              </div>
            </div>

            {/* Items (solo cuando type es ITEM) */}
            {formData.type === "ITEM" && (
              <div className="md:col-span-2">
                <label className="block text-base font-semibold text-slate-300 mb-2">
                  Items <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
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
                      className="flex-1 px-4 py-2 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200"
                      onKeyPress={(e) => {
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
                          quantity: parseInt(e.target.value) || 1,
                        }))
                      }
                      placeholder="Cantidad"
                      className="w-32 px-4 py-2 text-base rounded-lg bg-slate-800/50 text-white border border-slate-700/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:outline-none placeholder:text-slate-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={
                        !currentItem.code.trim() || currentItem.quantity <= 0
                      }
                      className="px-4 py-2 text-base rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Agregar
                    </button>
                  </div>
                  {formData.items && formData.items.length > 0 && (
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base font-medium text-slate-300">
                              Código:{" "}
                              <span className="text-white font-mono">
                                {item.code}
                              </span>
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-base font-medium text-slate-300">
                              Cantidad:{" "}
                              <span className="text-white">
                                {item.quantity}
                              </span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Eliminar item"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                      ))}
                    </div>
                  )}
                  {(!formData.items || formData.items.length === 0) && (
                    <p className="text-base text-slate-400 italic">
                      No hay items agregados. Agrega al menos un item para
                      continuar.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-base rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-base rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creando...
                </>
              ) : (
                "Crear Paquete Premium"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePremiumModal;
