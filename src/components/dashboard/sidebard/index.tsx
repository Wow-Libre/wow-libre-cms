"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  DASHBOARD_MENU_ITEMS,
  type DashboardMenuItem,
} from "../constants/menuConfig";

const SIDEBAR_WIDTH = "w-72 md:w-64 lg:w-56 xl:w-52 2xl:w-56";

function NavIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

interface SidebarProps {
  onOptionChange: (option: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOptionChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeOption = searchParams.get("activeOption") || "dashboard";

  const [reinoItems, servidorItems] = useMemo(() => {
    const reino = DASHBOARD_MENU_ITEMS.filter((i) => i.section === "reino");
    const servidor = DASHBOARD_MENU_ITEMS.filter((i) => i.section === "servidor");
    return [reino, servidor];
  }, []);

  const handleMenuClick = (option: string) => {
    onOptionChange(option);
  };

  const handleReturnPage = () => {
    router.push("/realms");
  };

  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  React.useEffect(() => {
    setIsMobileOpen(false);
  }, [activeOption]);

  const renderItem = (item: DashboardMenuItem) => {
    const isActive = activeOption === item.id;
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => handleMenuClick(item.id)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
            isActive
              ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
              : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-transparent"
          }`}
        >
          <NavIcon />
          <span>{item.label}</span>
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-600/50 bg-slate-800/95 text-white shadow-lg backdrop-blur md:hidden"
        aria-label="Abrir menú"
        aria-expanded={isMobileOpen}
      >
        <span
          className={`block h-0.5 w-5 bg-current transition-all ${
            isMobileOpen ? "translate-y-1 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-current transition-all ${
            isMobileOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-current transition-all ${
            isMobileOpen ? "-translate-y-1 -rotate-45" : ""
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
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-slate-700/40 bg-slate-900/98 shadow-xl backdrop-blur-md ${SIDEBAR_WIDTH} overflow-y-auto transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-6 flex flex-col items-center pt-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600/50 bg-slate-800/80">
              <span className="text-xl font-bold text-cyan-400">W</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">Panel Admin</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>

          <nav className="space-y-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Configuraciones del reino
            </p>
            <ul className="space-y-1">
              {reinoItems.map(renderItem)}
            </ul>

            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Servidor
            </p>
            <ul className="space-y-1">
              {servidorItems.map(renderItem)}
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-700/50 p-4">
          <button
            type="button"
            onClick={handleReturnPage}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Volver a reinos
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
