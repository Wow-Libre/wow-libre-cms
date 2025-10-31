"use client";

import React, { useState } from "react";
import { CreatePromotionDto, PromotionItemDto } from "../types";
import { createPromotion } from "../api/promosApi";
import Swal from "sweetalert2";

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
  realmId: number;
  language: string;
}

const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  realmId,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePromotionDto>({
    img_url: "",
    name: "",
    description: "",
    btn_text: "",
    send_item: false,
    type: "PERCENTAGE",
    min_level: 0,
    max_level: 100,
    amount: 0,
    realm_id: realmId,
    class_character: undefined,
    level: undefined,
    status: true,
    language: language,
    items: [],
  });

  const [items, setItems] = useState<PromotionItemDto[]>([]);
  const [currentItem, setCurrentItem] = useState<PromotionItemDto>({
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
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addItem = () => {
    if (currentItem.code.trim() && currentItem.quantity > 0) {
      setItems((prev) => [...prev, { ...currentItem }]);
      setCurrentItem({ code: "", quantity: 1 });
    }
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.img_url.trim()) {
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

    if (formData.name.length > 30) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "El nombre no puede exceder 30 caracteres",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    if (formData.description.length > 80) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "La descripción no puede exceder 80 caracteres",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    if (formData.min_level < 0 || formData.max_level < 0) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "Los niveles deben ser mayores o iguales a 0",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: CreatePromotionDto = {
        ...formData,
        items: items.length > 0 ? items : undefined,
      };

      await createPromotion(payload, token);
      await Swal.fire({
        title: "¡Éxito!",
        text: "La promoción ha sido creada correctamente",
        icon: "success",
        background: "#0B1218",
        color: "white",
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        img_url: "",
        name: "",
        description: "",
        btn_text: "",
        send_item: false,
        type: "PERCENTAGE",
        min_level: 0,
        max_level: 100,
        amount: 0,
        realm_id: realmId,
        class_character: undefined,
        level: undefined,
        status: true,
        language: language,
        items: [],
      });
      setItems([]);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo crear la promoción",
        background: "#0B1218",
        color: "white",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gaming-base-main border border-gaming-base-light/30 rounded-2xl shadow-2xl p-6 m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
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

        <h2 className="text-2xl font-bold text-white mb-6">
          Crear Nueva Promoción
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={30}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de Imagen <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="img_url"
                value={formData.img_url}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={80}
                rows={3}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none resize-none"
              />
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texto del Botón <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="btn_text"
                value={formData.btn_text}
                onChange={handleChange}
                maxLength={30}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              >
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED">Fijo</option>
              </select>
            </div>

            {/* Min Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nivel Mínimo <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="minLevel"
                value={formData.min_level}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Max Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nivel Máximo <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="maxLevel"
                value={formData.max_level}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad/Descuento
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount || ""}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Class Character */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID de Clase de Personaje
              </label>
              <input
                type="number"
                name="class_character"
                value={formData.class_character || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nivel
              </label>
              <input
                type="number"
                name="level"
                value={formData.level || ""}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
            </div>

            {/* Send Item */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="send_item"
                checked={formData.send_item}
                onChange={handleChange}
                className="w-4 h-4 rounded bg-slate-900 border-gaming-base-light/30 text-gaming-primary-main focus:ring-gaming-primary-main"
              />
              <label className="ml-2 text-sm font-medium text-gray-300">
                Enviar Item
              </label>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-4 h-4 rounded bg-slate-900 border-gaming-base-light/30 text-gaming-primary-main focus:ring-gaming-primary-main"
              />
              <label className="ml-2 text-sm font-medium text-gray-300">
                Activa
              </label>
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-6 border-t border-gaming-base-light/30 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">Items</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Código del item"
                value={currentItem.code}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, code: e.target.value })
                }
                maxLength={30}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Cantidad"
                value={currentItem.quantity}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    quantity: Number(e.target.value),
                  })
                }
                min="1"
                className="w-32 px-4 py-2 rounded-lg bg-slate-900/60 text-white border border-gaming-base-light/30 focus:ring-2 focus:ring-gaming-primary-main/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 rounded-lg bg-gaming-primary-main text-white hover:bg-gaming-primary-dark transition-colors"
              >
                Agregar
              </button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-900/40 rounded-lg"
                  >
                    <span className="text-white">
                      {item.code} x{item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gaming-base-light/30">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-gaming-primary-main to-gaming-primary-dark text-white hover:shadow-lg border border-gaming-primary-main/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Promoción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromotionModal;
