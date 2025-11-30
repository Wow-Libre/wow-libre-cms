import { FieldConstraints, FieldConstraint } from "../types";
import { FIELD_CONSTRAINTS } from "../constants";

export const validateField = (
  name: string,
  value: string | number,
  constraints?: FieldConstraint
): string => {
  const fieldConstraints =
    constraints || (FIELD_CONSTRAINTS[name] as FieldConstraint);
  if (!fieldConstraints) return "";

  if (typeof value === "string") {
    if (
      fieldConstraints.maxLength &&
      value.length > fieldConstraints.maxLength
    ) {
      return `Maximum length is ${fieldConstraints.maxLength} characters`;
    }
    if (
      name === "img_url" &&
      value &&
      fieldConstraints.pattern &&
      !fieldConstraints.pattern.test(value)
    ) {
      return "Please enter a valid URL starting with http:// or https://";
    }
    if (name === "name" && fieldConstraints.required && !value.trim()) {
      return "Name is required";
    }
  }

  if (typeof value === "number") {
    if (fieldConstraints.min !== undefined && value < fieldConstraints.min) {
      return `Minimum value is ${fieldConstraints.min}`;
    }
    if (fieldConstraints.max !== undefined && value > fieldConstraints.max) {
      return `Maximum value is ${fieldConstraints.max}`;
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
