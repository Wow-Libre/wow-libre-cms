import { FaSearch, FaTimes } from "react-icons/fa";

export interface UserFilters {
  onlyOnline: boolean;
  onlyBanned: boolean;
  onlyMute: boolean;
}

export const EMPTY_FILTERS: UserFilters = {
  onlyOnline: false,
  onlyBanned: false,
  onlyMute: false,
};

interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

/**
 * Barra de búsqueda + filtros del listado de usuarios.
 *
 * - El input controla lo que el usuario ve; el debounce a 300ms ocurre en el
 *   padre antes de disparar el fetch.
 * - Los filtros son client-side sobre la página cargada (el backend solo
 *   expone el filtro libre). Se muestra una nota explícita al respecto y un
 *   botón "Limpiar filtros" cuando alguno está activo.
 */
export function UserSearchBar({
  value,
  onChange,
  filters,
  onFiltersChange,
}: UserSearchBarProps) {
  const filtersActive =
    filters.onlyOnline || filters.onlyBanned || filters.onlyMute;

  const handleToggle = (key: keyof UserFilters) => () => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  const handleClearFilters = () => {
    onFiltersChange(EMPTY_FILTERS);
  };

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="users-search-input"
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          Buscar usuarios
        </label>
        <div className="relative">
          <FaSearch
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="users-search-input"
            type="text"
            placeholder="Buscar por email o nombre de usuario…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Buscar usuarios por email o nombre de usuario"
            className="w-full rounded-xl border border-slate-600/50 bg-slate-800/50 py-3 pl-11 pr-12 text-[15px] text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-700/60 hover:text-white"
            >
              <FaTimes className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-700/40 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Filtros de estado
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/20"
            >
              <FaTimes className="h-3 w-3" aria-hidden />
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros de estado">
          <FilterChip
            label="Solo online"
            active={filters.onlyOnline}
            onToggle={handleToggle("onlyOnline")}
            tone="emerald"
          />
          <FilterChip
            label="Solo baneados"
            active={filters.onlyBanned}
            onToggle={handleToggle("onlyBanned")}
            tone="red"
          />
          <FilterChip
            label="Solo muteados"
            active={filters.onlyMute}
            onToggle={handleToggle("onlyMute")}
            tone="amber"
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Los filtros se aplican a la página actual; cambia de página para
          ver más resultados.
        </p>
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  tone: "emerald" | "red" | "amber";
}

function FilterChip({ label, active, onToggle, tone }: FilterChipProps) {
  const toneStyles: Record<FilterChipProps["tone"], string> = {
    emerald: active
      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-100"
      : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-200",
    red: active
      ? "border-red-500/50 bg-red-500/15 text-red-100"
      : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-red-500/40 hover:text-red-200",
    amber: active
      ? "border-amber-500/50 bg-amber-500/15 text-amber-100"
      : "border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-amber-500/40 hover:text-amber-200",
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${toneStyles[tone]}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active
            ? tone === "emerald"
              ? "bg-emerald-300"
              : tone === "red"
              ? "bg-red-300"
              : "bg-amber-300"
            : "bg-slate-500"
        }`}
        aria-hidden
      />
      {label}
    </button>
  );
}
