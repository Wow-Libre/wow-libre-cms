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

// Enum de clases de World of Warcraft
const WOW_CLASSES = [
  { id: 0, name: "Todos los personajes", icon: "https://via.placeholder.com/50" },
  { id: 1, name: "Warrior", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_warrior.jpg" },
  { id: 2, name: "Paladin", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_paladin.jpg" },
  { id: 3, name: "Hunter", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_hunter.jpg" },
  { id: 4, name: "Rogue", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_rogue.jpg" },
  { id: 5, name: "Priest", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_priest.jpg" },
  { id: 6, name: "Death Knight", icon: "https://wow.zamimg.com/images/wow/icons/large/spell_deathknight_classicon.jpg" },
  { id: 7, name: "Shaman", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_shaman.jpg" },
  { id: 8, name: "Mage", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_mage.jpg" },
  { id: 9, name: "Warlock", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_warlock.jpg" },
  { id: 10, name: "Monk", icon: "https://wow.zamimg.com/images/wow/icons/large/classicon_monk.jpg" },
];

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
    type: "MONEY",
    min_level: 0,
    max_level: 100,
    amount: 0,
    realm_id: realmId,
    class_character: 0, // Todos los personajes por defecto
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
      // Si se desmarca "send_item", limpiar los items
      if (name === "send_item" && !checked) {
        setItems([]);
      }
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      const newValue = value;
      setFormData((prev) => {
        const updated = { ...prev, [name]: newValue };
        // Si es el select de class_character, convertir a número
        if (name === "class_character") {
          updated.class_character = Number(newValue);
        }
        // Si cambió el tipo, limpiar campos que no aplican
        if (name === "type") {
          if (newValue !== "MONEY") {
            updated.amount = 0;
          }
          if (newValue !== "LEVEL") {
            updated.level = undefined;
          }
          if (newValue !== "ITEM") {
            updated.send_item = false;
            setItems([]);
          } else {
            updated.send_item = true;
          }
        }
        return updated;
      });
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

    if (formData.type === "LEVEL" && (!formData.level || formData.level <= 0)) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "El nivel es requerido y debe ser mayor a 0 cuando el tipo es 'Subir de Nivel'",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    if (formData.type === "ITEM" && items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validación",
        text: "Debe agregar al menos un item cuando el tipo es 'Enviar Items'",
        background: "#0B1218",
        color: "white",
      });
      return;
    }

    setLoading(true);

    try {
      const payload: CreatePromotionDto = {
        ...formData,
        status: true, // Siempre true
        amount: formData.type === "MONEY" ? (formData.amount || 0) : 0, // Solo enviar amount si es MONEY, sino 0
        items: formData.type === "ITEM" && items.length > 0 ? items : undefined,
        send_item: formData.type === "ITEM", // send_item es true solo si type es ITEM
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
        type: "MONEY",
        min_level: 0,
        max_level: 100,
        amount: 0,
        realm_id: realmId,
        class_character: 0, // Todos los personajes por defecto
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/70 rounded-xl shadow-2xl p-8 m-4">
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
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Crear Nueva Promoción
            </h2>
          </div>
          <p className="text-slate-400 text-sm ml-4">Complete todos los campos requeridos para crear una nueva promoción</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={30}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                placeholder="Ingrese el nombre de la promoción"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                URL de Imagen <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="img_url"
                value={formData.img_url}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Descripción <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={80}
                rows={3}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 resize-none transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                placeholder="Descripción breve de la promoción (máx. 80 caracteres)"
              />
              <p className="mt-1 text-xs text-slate-400 font-medium">{formData.description.length}/80 caracteres</p>
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Texto del Botón <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="btn_text"
                value={formData.btn_text}
                onChange={handleChange}
                maxLength={30}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                placeholder="Ej: Ver más, Comprar ahora"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tipo <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none transition-all duration-200 hover:border-slate-500/80 cursor-pointer shadow-sm"
              >
                <option value="ITEM">Enviar Items</option>
                <option value="LEVEL">Subir de Nivel</option>
                <option value="MONEY">Enviar dinero</option>
              </select>
            </div>

            {/* Min Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nivel Mínimo <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="min_level"
                value={formData.min_level}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                placeholder="0"
              />
            </div>

            {/* Max Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nivel Máximo <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="max_level"
                value={formData.max_level}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                placeholder="100"
              />
            </div>

            {/* Amount - Solo visible si type es MONEY */}
            {formData.type === "MONEY" && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Oro a enviar
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Class Character */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Clase de Personaje
              </label>
              <select
                name="class_character"
                value={formData.class_character || 0}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none transition-all duration-200 hover:border-slate-500/80 cursor-pointer shadow-sm"
              >
                {WOW_CLASSES.map((wowClass) => (
                  <option key={wowClass.id} value={wowClass.id}>
                    {wowClass.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level - Solo visible si type es LEVEL */}
            {formData.type === "LEVEL" && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Nivel <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="level"
                  value={formData.level || ""}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                  placeholder="Ingrese el nivel"
                />
              </div>
            )}
          </div>

          {/* Items Section - Solo visible si type es ITEM */}
          {formData.type === "ITEM" && (
            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Items</h3>
              </div>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Código del item"
                  value={currentItem.code}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, code: e.target.value })
                  }
                  maxLength={30}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
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
                  className="w-32 px-4 py-2.5 rounded-lg bg-slate-800/90 text-white border border-slate-600/70 focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400 transition-all duration-200 hover:border-slate-500/80 shadow-sm"
                />
                <button
                  type="button"
                  onClick={addItem}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar
                </button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-800/70 rounded-lg border border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-800/80 transition-colors duration-200 shadow-sm"
                    >
                      <span className="text-slate-200 font-medium">
                        <span className="text-indigo-400">{item.code}</span> × <span className="text-slate-400">{item.quantity}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Crear Promoción
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePromotionModal;
