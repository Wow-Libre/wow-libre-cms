import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { FIELD_CONSTRAINTS } from "../constants";

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateField = (
  name: string,
  value: string,
  formData: RealmAdvertisement
): string | null => {
  const constraints = FIELD_CONSTRAINTS[name as keyof typeof FIELD_CONSTRAINTS];

  if (!constraints) return null;

  // TAG validation
  if (name === "tag") {
    const tagConstraints = constraints as {
      minLength: number;
      maxLength: number;
    };
    if (
      !value ||
      value.length < tagConstraints.minLength ||
      value.length > tagConstraints.maxLength
    ) {
      return `The tag must be between ${tagConstraints.minLength} and ${tagConstraints.maxLength} characters.`;
    }
  }

  // SUBTITLE validation
  if (name === "sub_title") {
    const subtitleConstraints = constraints as {
      minLength: number;
      maxLength: number;
    };
    if (!value || value.trim() === "") {
      return "The subtitle cannot be empty.";
    }
    if (value.length > subtitleConstraints.maxLength) {
      return `The subtitle must not exceed ${subtitleConstraints.maxLength} characters.`;
    }
  }

  // DESCRIPTION validation
  if (name === "description") {
    const descConstraints = constraints as {
      minLength: number;
      maxLength: number;
    };
    if (
      !value ||
      value.length < descConstraints.minLength ||
      value.length > descConstraints.maxLength
    ) {
      return `The description must be between ${descConstraints.minLength} and ${descConstraints.maxLength} characters.`;
    }
  }

  // CTA PRIMARY validation
  if (name === "cta_primary") {
    const ctaConstraints = constraints as {
      minLength: number;
      maxLength: number;
    };
    if (
      !value ||
      value.length < ctaConstraints.minLength ||
      value.length > ctaConstraints.maxLength
    ) {
      return `The button text must be between ${ctaConstraints.minLength} and ${ctaConstraints.maxLength} characters.`;
    }
  }

  // IMG URL validation
  if (name === "img_url") {
    if (!value || !isValidUrl(value)) {
      return "The image URL is required and must be valid.";
    }
    const imgConstraints = constraints as { maxLength: number };
    if (value.length > imgConstraints.maxLength) {
      return `The image URL must not exceed ${imgConstraints.maxLength} characters.`;
    }
  }

  // FOOTER DISCLAIMER validation
  if (name === "footer_disclaimer") {
    const disclaimerConstraints = constraints as {
      minLength: number;
      maxLength: number;
    };
    if (
      !value ||
      value.length < disclaimerConstraints.minLength ||
      value.length > disclaimerConstraints.maxLength
    ) {
      return `The disclaimer must be between ${disclaimerConstraints.minLength} and ${disclaimerConstraints.maxLength} characters.`;
    }
  }

  return null;
};

export const validateForm = (
  formData: RealmAdvertisement
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validate all fields
  Object.keys(FIELD_CONSTRAINTS).forEach((fieldName) => {
    const error = validateField(
      fieldName,
      formData[fieldName as keyof RealmAdvertisement] as string,
      formData
    );
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};
