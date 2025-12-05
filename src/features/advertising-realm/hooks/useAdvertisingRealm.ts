import { useState, useEffect, useCallback } from "react";
import { RealmAdvertisement } from "@/model/RealmAdvertising";
import { FormErrors } from "../types";
import { emptyRealmAdvertisement } from "../constants";
import {
  getRealmAdvertisementById,
  createAdvertisementById,
} from "../api/advertisingRealmApi";
import { validateForm, validateField } from "../utils/validation";
import Swal from "sweetalert2";

interface UseAdvertisingRealmProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}

export const useAdvertisingRealm = ({
  token,
  realmId,
  t,
}: UseAdvertisingRealmProps) => {
  const [formData, setFormData] = useState<RealmAdvertisement>(
    emptyRealmAdvertisement
  );
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"ES" | "EN" | "PT">("ES");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getRealmAdvertisementById(
        realmId,
        language,
        token
      );
      if (response) {
        setFormData(response);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0f172a",
        timer: 43500,
      });
    } finally {
      setLoading(false);
    }
  }, [realmId, token, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Validate length constraints
    if (
      (name === "tag" && value.length > 10) ||
      (name === "sub_title" && value.length > 40) ||
      (name === "description" && value.length > 40) ||
      (name === "footer_disclaimer" && value.length > 40) ||
      (name === "cta_primary" && value.length > 20)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Exceeds maximum length. Please enter a valid value.",
      });
      return;
    }

    // Validate field
    const error = validateField(name, value, formData);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const firstError = Object.values(formErrors)[0];
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: firstError,
      });
      return;
    }

    try {
      await createAdvertisementById(
        realmId,
        token,
        formData.title,
        formData.tag,
        formData.sub_title,
        formData.description,
        formData.cta_primary,
        formData.img_url,
        formData.footer_disclaimer,
        language
      );

      Swal.fire({
        title: t("adversing-realm.success.title"),
        text: t("adversing-realm.success.description"),
        icon: "success",
        confirmButtonText: t("adversing-realm.success.action"),
        customClass: {
          confirmButton:
            "bg-indigo-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error.message}`,
        color: "white",
        background: "#0f172a",
        timer: 43500,
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "ES" | "EN" | "PT");
  };

  return {
    formData,
    copied,
    language,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleCopy,
    handleLanguageChange,
  };
};
