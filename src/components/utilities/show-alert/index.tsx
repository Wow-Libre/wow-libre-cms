import React from "react";
import { useTranslation } from "react-i18next";

interface ErrorProps {
  error: { message: string };
  btn_primary_txt: string;
  btn_secondary_txt: string;
}

const showAlert = async (
  error: { message: string },
  btn_primary_txt: string,
  btn_secondary_txt: string
) => {
  try {
    // Carga diferida de sweetalert2 (~70 KiB) — solo se descarga cuando se necesita.
    const { default: Swal } = await import("sweetalert2");

    const result = await Swal.fire({
      icon: "error",
      title: "Oops...",
      text: `${error.message}`,
      color: "white",
      background: "#0B1218",
      showCancelButton: true,
      confirmButtonText: btn_primary_txt,
      cancelButtonText: btn_secondary_txt,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      customClass: {
        popup: "swal-dark-theme-popup",
        confirmButton: "swal-dark-theme-confirm-btn",
        cancelButton: "swal-dark-theme-cancel-btn",
      },
    });

    if (result.isConfirmed) {
      console.log("Usuario hizo clic en Aceptar");
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log("Usuario hizo clic en Reportar Problema");
    }
  } catch (err) {
    console.error("Error al mostrar la alerta:", err);
  }
};

const AlertComponent: React.FC<ErrorProps> = ({
  error,
  btn_primary_txt,
  btn_secondary_txt,
}) => {
  React.useEffect(() => {
    if (error && error.message) {
      showAlert(error, btn_primary_txt, btn_secondary_txt);
    }
  }, [error]);

  return null;
};

export default AlertComponent;
