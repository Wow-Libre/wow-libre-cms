import { DASHBOARD_PALETTE } from "@/components/dashboard/styles/dashboardPalette";

/**
 * Skeleton de carga para la tabla de usuarios. Muestra seis filas con bloques
 * animados que imitan la estructura visual (avatar + nombre + email + badges
 * + metadatos) para reservar el alto y reducir el "salto" al cargar datos.
 */
export function UsersTableSkeleton() {
  return (
    <div className="space-y-3 p-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-5 rounded-xl border border-slate-700/40 bg-slate-800/30 px-6 py-5"
        >
          <div className="h-12 w-12 shrink-0 rounded-full bg-slate-700/60" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-40 rounded bg-slate-700/60" />
            <div className="h-4 w-56 rounded bg-slate-700/40" />
          </div>
          <div className="h-8 w-32 rounded-full bg-slate-700/50" />
          <div className="hidden h-4 w-36 rounded bg-slate-700/40 sm:block" />
        </div>
      ))}
    </div>
  );
}

interface UsersEmptyStateProps {
  /** Cuando hay filtros activos en cliente (online/banned/mute). */
  filterActive?: boolean;
  onClearFilters?: () => void;
}

/**
 * Estado vacío contextual. Dos variantes:
 * - Sin resultados de búsqueda/filtros: sugiere limpiar o cambiar criterios.
 * - Servidor sin usuarios: mensaje neutro.
 */
export function UsersEmptyState({ filterActive, onClearFilters }: UsersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/70 text-slate-500"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      {filterActive ? (
        <>
          <h3 className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
            Ningún usuario coincide con los filtros
          </h3>
          <p className={`max-w-md text-sm ${DASHBOARD_PALETTE.textMuted}`}>
            Los filtros se aplican sobre la página actual. Limpia los filtros o
            ajusta la búsqueda para ver más resultados.
          </p>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className={DASHBOARD_PALETTE.btnPrimary}
            >
              Limpiar filtros
            </button>
          )}
        </>
      ) : (
        <>
          <h3 className={`text-lg font-semibold ${DASHBOARD_PALETTE.text}`}>
            No hay usuarios para mostrar
          </h3>
          <p className={`max-w-md text-sm ${DASHBOARD_PALETTE.textMuted}`}>
            Cuando los jugadores se registren en el servidor aparecerán aquí.
            También puedes buscar por email o nombre de usuario.
          </p>
        </>
      )}
    </div>
  );
}

interface UsersErrorBannerProps {
  message: string;
  onRetry: () => void;
}

/**
 * Banner de error inline con botón "Reintentar". Se muestra sobre la tabla
 * y mantiene los datos previos visibles debajo si los hubiera.
 */
export function UsersErrorBanner({ message, onRetry }: UsersErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="m-3 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p className="text-base font-semibold">No se pudieron obtener los usuarios</p>
          <p className="text-sm text-red-200/80">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-red-300/40 bg-red-500/20 px-4 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/30"
      >
        Reintentar
      </button>
    </div>
  );
}
