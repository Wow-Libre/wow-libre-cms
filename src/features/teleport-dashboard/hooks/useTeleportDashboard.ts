import { useState, useCallback, useEffect } from "react";
import { Teleport } from "@/model/teleport";
import { TeleportFormData, FormErrors } from "../types";
import { initialFormState } from "../constants";
import {
  getTeleports,
  createTeleport,
  deleteTeleport,
} from "../api/teleportApi";
import { validateForm, validateField } from "../utils/validation";
import { NUMERIC_FIELDS } from "../constants";
import Swal from "sweetalert2";

interface UseTeleportDashboardProps {
  token: string;
  realmId: number;
  t: (key: string) => string;
}

export const useTeleportDashboard = ({
  token,
  realmId,
  t,
}: UseTeleportDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [teleports, setTeleports] = useState<Teleport[]>([]);
  const [form, setForm] = useState<TeleportFormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeleports(0, realmId, token);
      setTeleports(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("teleport-dashboard.errors.fetch-teleport-title") || "Error",
        text: t("teleport-dashboard.errors.fetch-teleports"),
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  }, [token, realmId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    // Validate and convert value
    const isNumericField = NUMERIC_FIELDS.includes(
      name as (typeof NUMERIC_FIELDS)[number]
    );
    const processedValue = isNumericField
      ? value === ""
        ? 0
        : Number(value)
      : value;

    // Validate field
    const error = validateField(name, processedValue);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, newErrors } = validateForm(form, errors);
    setErrors(newErrors);

    if (!isValid) {
      // Crear lista de campos faltantes
      const missingFields = Object.keys(newErrors)
        .map((key) => {
          const fieldLabels: Record<string, string> = {
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
          return fieldLabels[key] || key;
        })
        .join(", ");

      Swal.fire({
        icon: "warning",
        title:
          t("teleport-dashboard.errors.validation-title") ||
          "Error de validación",
        html: `<p>${
          t("teleport-dashboard.errors.validation-message") ||
          "Por favor corrija los errores en el formulario"
        }</p><p class="mt-2 font-semibold text-blue-400">Campos faltantes: ${missingFields}</p>`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createTeleport(
        form.name.trim(),
        form.img_url.trim(),
        form.position_x,
        form.position_y,
        form.position_z,
        form.map,
        form.orientation,
        form.zone,
        realmId,
        form.area,
        form.faction,
        token
      );

      await Swal.fire({
        icon: "success",
        title: t("teleport-dashboard.success.add-teleport"),
        text: t("teleport-dashboard.success.text-teleport"),
        confirmButtonColor: "#3085d6",
        timer: 2000,
        timerProgressBar: true,
      });

      setForm(initialFormState);
      setErrors({});
      await fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: t("teleport-dashboard.errors.create-title") || "Error",
        text:
          err.message ||
          t("teleport-dashboard.errors.create-message") ||
          "Failed to create teleport",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (teleportId: number) => {
    const teleport = teleports.find((tp) => tp.id === teleportId);
    const teleportName = teleport?.name || "";

    const confirm = await Swal.fire({
      title: t("teleport-dashboard.question.title"),
      html: `<p>${t("teleport-dashboard.question.delete-teleport")}</p>${
        teleportName
          ? `<p class="mt-2 font-semibold text-blue-400">"${teleportName}"</p>`
          : ""
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("teleport-dashboard.question.btn.confirm"),
      cancelButtonText: t("teleport-dashboard.question.btn.cancel"),
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (confirm.isConfirmed) {
      try {
        setDeleting(teleportId);
        await deleteTeleport(teleportId, realmId, token);
        await Swal.fire({
          icon: "success",
          title: t("teleport-dashboard.success.delete-title") || "Deleted",
          text: t("teleport-dashboard.success.delete-teleport"),
          confirmButtonColor: "#3085d6",
          timer: 2000,
          timerProgressBar: true,
        });
        await fetchData();
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: t("teleport-dashboard.errors.delete-title") || "Error",
          text: err.message || t("teleport-dashboard.errors.delete-teleport"),
          confirmButtonColor: "#3085d6",
        });
      } finally {
        setDeleting(null);
      }
    }
  };

  return {
    loading,
    submitting,
    deleting,
    teleports,
    form,
    errors,
    handleChange,
    handleSubmit,
    handleDelete,
  };
};
