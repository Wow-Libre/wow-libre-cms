import Swal from "sweetalert2";

/**
 * Tipo de la instancia de SweetAlert2 con la mezcla de estilos aplicada.
 * Equivale a `typeof Swal` cuando se usa sin `mixin`.
 */
export type DashboardSweetAlert = ReturnType<typeof Swal.mixin>;

/**
 * SweetAlert2 con estilo unificado del panel admin (slate + cyan).
 *
 * Se exporta como instancia sincrónica para que cualquier componente pueda
 * usarla directamente (`Swal.fire(...)`) sin necesidad de `await`. Si en el
 * futuro se quiere recuperar la carga diferida, basta con reemplazar esta
 * instancia por un proxy que delegue en `getDashboardSwal()`.
 */
export const dashboardSwal: DashboardSweetAlert = Swal.mixin({
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

/**
 * Variante async para compatibilidad con código previo. Devuelve siempre
 * la misma instancia cacheada.
 */
export async function getDashboardSwal(): Promise<DashboardSweetAlert> {
  return dashboardSwal;
}
