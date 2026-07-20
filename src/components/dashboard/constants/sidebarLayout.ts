/**
 * Ancho del sidebar del panel admin.
 *
 * Es la única fuente de verdad para el ancho del `<aside>` (en
 * `sidebard/index.tsx`) y del espaciador que evita solapar el contenido (en
 * `administrator-server/page.tsx`). Aplicar siempre el resultado de
 * `getDashboardSidebarWidthClass(...)` en ambos sitios, derivando la clase
 * del estado `isSidebarCollapsed` controlado por el ancestro común.
 *
 * En móvil el sidebar siempre se renderiza como drawer expandido (`w-72`),
 * por lo que el helper solo aplica el cambio a partir de `md:`.
 */
export const DASHBOARD_SIDEBAR_WIDTH = {
  /** Móvil expandido → 320px (md) → 352px (lg) → 384px (xl+). */
  expanded: "w-72 md:w-80 lg:w-88 xl:w-96",
  /** Móvil expandido → 64px (md+). */
  collapsed: "w-72 md:w-16",
} as const;

export function getDashboardSidebarWidthClass(collapsed: boolean): string {
  return collapsed
    ? DASHBOARD_SIDEBAR_WIDTH.collapsed
    : DASHBOARD_SIDEBAR_WIDTH.expanded;
}
