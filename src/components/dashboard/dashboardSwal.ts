import Swal from "sweetalert2";

/**
 * SweetAlert2 con estilo unificado del panel admin (slate + cyan).
 * Usar en todos los módulos bajo `components/dashboard/` en lugar de `Swal` directo.
 */
export const dashboardSwal = Swal.mixin({
  background: "#0f172a",
  color: "#e2e8f0",
  backdrop: "rgba(2, 6, 23, 0.82)",
  allowOutsideClick: true,
  customClass: {
    popup: "dashboard-swal-popup",
    title: "dashboard-swal-title",
    htmlContainer: "dashboard-swal-html",
    confirmButton: "dashboard-swal-btn dashboard-swal-btn-confirm",
    cancelButton: "dashboard-swal-btn dashboard-swal-btn-cancel",
    denyButton: "dashboard-swal-btn dashboard-swal-btn-cancel",
  },
  buttonsStyling: false,
  showClass: {
    popup: "dashboard-swal-popup-show",
  },
});
