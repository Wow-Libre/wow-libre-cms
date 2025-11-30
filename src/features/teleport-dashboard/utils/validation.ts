import { FieldConstraints, FieldConstraint } from "../types";
import { FIELD_CONSTRAINTS } from "../constants";

// Mapeo de nombres de campos a nombres legibles
const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  img_url: "URL de imagen",
  position_x: "Posición X",
  position_y: "Posición Y",
  position_z: "Posición Z",
  map: "Mapa",
  orientation: "Orientación",
  zone: "Zona",
  area: "Área",
  faction: "Facción",
};

export const validateField = (
  name: string,
  value: string | number,
  constraints?: FieldConstraint
): string => {
  const fieldConstraints =
    constraints || (FIELD_CONSTRAINTS[name] as FieldConstraint);
  if (!fieldConstraints) return "";

  // Validar campo requerido
  if (fieldConstraints.required) {
    if (typeof value === "string") {
      if (!value.trim()) {
        const fieldLabel = FIELD_LABELS[name] || name;
        return `${fieldLabel} es requerido`;
      }
    }
    if (typeof value === "number") {
      const canBeZero = ["map", "zone", "area"].includes(name);
      if (value === 0 && !canBeZero) {
        const fieldLabel = FIELD_LABELS[name] || name;
        return `${fieldLabel} es requerido`;
      }
    }
  }

  if (typeof value === "string") {
    if (
      fieldConstraints.maxLength &&
      value.length > fieldConstraints.maxLength
    ) {
      return `La longitud máxima es ${fieldConstraints.maxLength} caracteres`;
    }
    if (
      name === "img_url" &&
      value &&
      fieldConstraints.pattern &&
      !fieldConstraints.pattern.test(value)
    ) {
      return "Por favor ingrese una URL válida que comience con http:// o https://";
    }
  }

  if (typeof value === "number") {
    if (fieldConstraints.min !== undefined && value < fieldConstraints.min) {
      return `El valor mínimo es ${fieldConstraints.min}`;
    }
    if (fieldConstraints.max !== undefined && value > fieldConstraints.max) {
      return `El valor máximo es ${fieldConstraints.max}`;
    }
  }

  return "";
};

export const validateForm = (
  form: Record<string, string | number>,
  errors: Record<string, string>
): { isValid: boolean; newErrors: Record<string, string> } => {
  const newErrors: Record<string, string> = {};

  Object.keys(form).forEach((key) => {
    const value = form[key];
    const error = validateField(key, value);
    if (error) {
      newErrors[key] = error;
    }
  });

  return {
    isValid: Object.keys(newErrors).length === 0,
    newErrors,
  };
};
