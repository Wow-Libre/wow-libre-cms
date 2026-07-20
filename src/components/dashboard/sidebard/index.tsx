"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
} from "react-icons/fa";
import {
  DASHBOARD_CATEGORIES,
  type DashboardCategory,
  type DashboardMenuItem,
} from "../constants/menuConfig";

const COLLAPSED_CATEGORIES_STORAGE_KEY = "dashboard-sidebar-collapsed-categories";

/** Lee del storage la lista de IDs de categoría minimizadas por el usuario. */
function loadCollapsedCategories(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(COLLAPSED_CATEGORIES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((id): id is string => typeof id === "string"));
    }
  } catch {
    // localStorage no disponible o JSON inválido; ignorar.
  }
  return new Set();
}

interface SidebarProps {
  onOptionChange: (option: string) => void;
  /** Sidebar colapsado en desktop (no afecta al drawer móvil). */
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** Clase de ancho (derivada de `getDashboardSidebarWidthClass`). */
  widthClass?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onOptionChange,
  isCollapsed = false,
  onToggleCollapsed,
  widthClass = "w-72 md:w-80 lg:w-88 xl:w-96",
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeOption = searchParams.get("activeOption") || "dashboard";

  const [reinoCategories, servidorCategories] = useMemo(() => {
    const reino = DASHBOARD_CATEGORIES.filter((c) => c.section === "reino");
    const servidor = DASHBOARD_CATEGORIES.filter((c) => c.section === "servidor");
    return [reino, servidor];
  }, []);

  const handleMenuClick = (option: string) => {
    onOptionChange(option);
  };

  const handleReturnPage = () => {
    router.push("/realms");
  };

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [collapsedCategories, setCollapsedCategories] = React.useState<Set<string>>(
    () => new Set()
  );

  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [activeOption]);

  // Hidratar desde localStorage tras montar en cliente.
  React.useEffect(() => {
    setCollapsedCategories(loadCollapsedCategories());
  }, []);

  // Persistir preferencia cada vez que cambie.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      COLLAPSED_CATEGORIES_STORAGE_KEY,
      JSON.stringify(Array.from(collapsedCategories))
    );
  }, [collapsedCategories]);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const renderItem = (item: DashboardMenuItem) => {
    const isActive = activeOption === item.id;
    const Icon = item.icon;
    return (
      <li key={item.id}>
        <div className="group relative">
          <button
            type="button"
            onClick={() => handleMenuClick(item.id)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            title={item.label}
            className={`flex w-full items-center rounded-xl border px-5 py-3.5 text-left text-lg font-medium transition-colors md:px-4 ${
              isCollapsed ? "md:justify-center md:px-2" : "gap-4"
            } ${
              isActive
                ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Icon
              className={`h-6 w-6 shrink-0 ${
                isActive ? "text-indigo-300" : ""
              }`}
              aria-hidden
            />
            <span
              className={`whitespace-nowrap transition-opacity duration-150 ${
                isCollapsed ? "sr-only md:opacity-0" : "opacity-100"
              }`}
            >
              {item.label}
            </span>
          </button>
          {isCollapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-700/60 bg-slate-900/95 px-3 py-1.5 text-base font-medium text-slate-100 shadow-lg shadow-black/40 backdrop-blur-sm group-hover:block group-focus-visible:block"
            >
              {item.label}
            </span>
          )}
        </div>
      </li>
    );
  };

  const renderCategory = (category: DashboardCategory) => {
    const CategoryIcon = category.icon;
    const isCategoryActive = category.items.some((i) => i.id === activeOption);
    const isCategoryCollapsed = collapsedCategories.has(category.id);
    const panelId = `sidebar-category-${category.id}`;
    return (
      <div key={category.id} className="mb-3 last:mb-0">
        <button
          type="button"
          onClick={() => toggleCategory(category.id)}
          aria-expanded={!isCategoryCollapsed}
          aria-controls={panelId}
          title={isCollapsed ? category.label : undefined}
          className={`group/header mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-800/40 ${
            isCategoryActive ? "text-indigo-300" : "text-slate-500 hover:text-slate-300"
          } ${isCollapsed ? "justify-center md:px-0" : ""}`}
        >
          <CategoryIcon
            className={`h-3.5 w-3.5 shrink-0 ${isCategoryActive ? "text-indigo-300" : "text-slate-500 group-hover/header:text-slate-300"}`}
            aria-hidden
          />
          <p
            className={`flex-1 text-sm font-semibold uppercase tracking-[0.12em] transition-opacity duration-150 ${
              isCollapsed ? "sr-only" : "opacity-100"
            }`}
          >
            {category.label}
          </p>
          <FaChevronDown
            className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-hover/header:text-slate-300 ${
              isCategoryCollapsed ? "-rotate-90" : "rotate-0"
            } ${isCollapsed ? "hidden" : ""}`}
            aria-hidden
          />
        </button>
        <div
          id={panelId}
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            isCategoryCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
        >
          <ul className="min-h-0 space-y-1.5 overflow-hidden">
            {category.items.map(renderItem)}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button - tamaño grande para área táctil (min 48px) */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 flex h-14 w-14 min-h-[3rem] min-w-[3rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-600/50 bg-slate-800/95 text-white shadow-lg backdrop-blur active:scale-95 transition-transform md:hidden"
        aria-label="Abrir menú"
        aria-expanded={isMobileOpen}
      >
        <span
          className={`block h-1 w-6 rounded-full bg-current transition-all duration-200 ${
            isMobileOpen ? "translate-y-1.5 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-1 w-6 rounded-full bg-current transition-all duration-200 ${
            isMobileOpen ? "opacity-0 scale-0" : ""
          }`}
        />
        <span
          className={`block h-1 w-6 rounded-full bg-current transition-all duration-200 ${
            isMobileOpen ? "-translate-y-1.5 -rotate-45" : ""
          }`}
        />
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-700/40 bg-slate-900/98 shadow-xl backdrop-blur-md transition-[width] duration-300 ease-in-out overflow-hidden ${widthClass} ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header / marca + toggle desktop */}
        <div
          className={`flex items-center border-b border-slate-700/40 ${
            isCollapsed
              ? "flex-col gap-2 px-2 py-4"
              : "justify-between gap-3 px-5 py-5"
          }`}
        >
          <div
            className={`flex min-w-0 items-center ${
              isCollapsed ? "flex-col gap-2" : "gap-3"
            }`}
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/20 to-violet-600/20 shadow-md shadow-indigo-500/20"
              aria-hidden
            >
              <span className="text-xl font-bold text-indigo-300">W</span>
            </div>
            <div
              className={`flex min-w-0 flex-col transition-opacity duration-150 ${
                isCollapsed ? "sr-only" : "opacity-100"
              }`}
            >
              <p className="text-lg font-semibold text-white">Panel Admin</p>
              <p className="text-sm text-slate-400">Administrador</p>
            </div>
          </div>
          {onToggleCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
              className={`hidden shrink-0 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/80 text-slate-300 transition-colors hover:border-indigo-500/40 hover:bg-slate-700/80 hover:text-indigo-300 md:inline-flex ${
                isCollapsed ? "h-8 w-8" : "h-10 w-10"
              }`}
            >
              {isCollapsed ? (
                <FaChevronRight className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <FaChevronLeft className="h-4 w-4" aria-hidden />
              )}
            </button>
          )}
        </div>

        <nav className="scrollbar-hide flex-1 overflow-y-auto px-4 py-5">
          <div>
            <p
              className={`mb-3 px-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 transition-opacity duration-150 ${
                isCollapsed ? "sr-only" : "opacity-100"
              }`}
            >
              Configuraciones del reino
            </p>
            {reinoCategories.map((category) => renderCategory(category))}
          </div>

          <div className="mt-8">
            <p
              className={`mb-3 px-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500 transition-opacity duration-150 ${
                isCollapsed ? "sr-only" : "opacity-100"
              }`}
            >
              Servidor
            </p>
            {servidorCategories.map((category) => renderCategory(category))}
          </div>
        </nav>

        <div className="border-t border-slate-700/50 px-4 py-5">
          <div className="group relative">
            <button
              type="button"
              onClick={handleReturnPage}
              aria-label="Volver a reinos"
              title="Volver a reinos"
              className={`flex w-full items-center rounded-xl px-5 py-3.5 text-lg font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 md:px-4 ${
                isCollapsed ? "md:justify-center md:px-2" : "gap-4"
              }`}
            >
              <FaSignOutAlt className="h-6 w-6 shrink-0" aria-hidden />
              <span
                className={`whitespace-nowrap transition-opacity duration-150 ${
                  isCollapsed ? "sr-only md:opacity-0" : "opacity-100"
                }`}
              >
                Volver a reinos
              </span>
            </button>
            {isCollapsed && (
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-700/60 bg-slate-900/95 px-3 py-1.5 text-base font-medium text-slate-100 shadow-lg shadow-black/40 backdrop-blur-sm group-hover:block group-focus-visible:block"
              >
                Volver a reinos
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
