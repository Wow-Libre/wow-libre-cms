"use client";

import { getUsersAllServer } from "@/api/dashboard/users";
import { AccountsServer } from "@/model/model";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dashboardSwal as Swal } from "@/components/dashboard/dashboardSwal";
import DashboardSection from "@/components/dashboard/layout/DashboardSection";
import WalletPagination from "@/components/dashboard/wallet/WalletPagination";
import UserActionModal from "./UserManagement";
import { UsersTable } from "./UsersTable";
import {
  UsersEmptyState,
  UsersErrorBanner,
  UsersTableSkeleton,
} from "./UsersTableStates";
import {
  EMPTY_FILTERS,
  UserFilters,
  UserSearchBar,
} from "./UserSearchBar";

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface UsersDashboardProps {
  token: string;
  serverId: number;
}

/**
 * Listado de usuarios del servidor.
 *
 * - Búsqueda con debounce de 300 ms entre lo que el usuario escribe
 *   (`searchInput`) y lo que dispara el fetch (`searchTerm`).
 * - Las respuestas fuera de orden se descartan con `requestIdRef`.
 * - Los filtros (online/banned/mute) son client-side sobre la página
 *   cargada; el backend solo expone el filtro libre.
 * - Paginación en base 0, alineada con `WalletPagination` y la API.
 */
const UsersDashboard: React.FC<UsersDashboardProps> = ({ token, serverId }) => {
  const [users, setUsers] = useState<AccountsServer[]>([]);
  const [selectedUser, setSelectedUser] = useState<AccountsServer | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(EMPTY_FILTERS);

  const requestIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const response = await getUsersAllServer(
        pageSize,
        page,
        serverId,
        searchTerm,
        token
      );
      // Descartar respuestas de peticiones canceladas por cambios posteriores.
      if (requestId !== requestIdRef.current) return;
      setUsers(response.accounts);
      setTotalElements(response.size);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const message =
        err instanceof Error ? err.message : "Inténtalo de nuevo en unos minutos.";
      setError(message);
      setUsers([]);
      setTotalElements(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [pageSize, page, serverId, searchTerm, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounce: confirma el término de búsqueda 300 ms después de la última tecla.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Si la página actual queda fuera de rango tras un cambio de tamaño/filtros,
  // recálcula y vuelve a una página válida.
  useEffect(() => {
    const pageCount = totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;
    if (pageCount > 0 && page >= pageCount) {
      setPage(pageCount - 1);
    }
  }, [totalElements, pageSize, page]);

  const handleSelectUser = (user: AccountsServer) => {
    setSelectedUser(user);
  };

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setPage(0);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(0);
  }, []);

  const filtersActive =
    filters.onlyOnline || filters.onlyBanned || filters.onlyMute;

  const visibleUsers = useMemo(() => {
    if (!filtersActive) return users;
    return users.filter((u) => {
      if (filters.onlyOnline && !u.online) return false;
      if (filters.onlyBanned && !u.banned) return false;
      if (filters.onlyMute && !u.mute) return false;
      return true;
    });
  }, [users, filters, filtersActive]);

  const pageCount = totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;
  const showEmptyState =
    !loading && !error && totalElements === 0 && searchTerm.length > 0;
  const showFiltersEmpty =
    !loading &&
    !error &&
    totalElements > 0 &&
    visibleUsers.length === 0 &&
    filtersActive;
  const showTable = !loading && !error && totalElements > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {selectedUser && (
        <UserActionModal
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          serverId={serverId}
          token={token}
          fetchData={fetchData}
          banned={selectedUser.banned}
        />
      )}

      <DashboardSection
        title="Buscar usuarios"
        description="Filtra por email o nombre de usuario y aplica filtros de estado."
        action={
          searchInput.length > 0 ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/60 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/60 hover:text-white"
            >
              Limpiar búsqueda
            </button>
          ) : null
        }
      >
        <UserSearchBar
          value={searchInput}
          onChange={setSearchInput}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </DashboardSection>

      <DashboardSection
        noPadding
        title="Lista de usuarios"
        description="Haz clic en una fila para abrir el panel de acciones del jugador."
        action={
          <span className="text-sm text-slate-400 tabular-nums">
            {totalElements > 0
              ? `${totalElements.toLocaleString()} ${
                  totalElements === 1 ? "usuario" : "usuarios"
                }`
              : null}
          </span>
        }
      >
        {error && <UsersErrorBanner message={error} onRetry={fetchData} />}

        {loading ? (
          <UsersTableSkeleton />
        ) : showEmptyState ? (
          <UsersEmptyState />
        ) : showFiltersEmpty ? (
          <UsersEmptyState filterActive onClearFilters={handleClearFilters} />
        ) : showTable ? (
          <UsersTable users={visibleUsers} onSelect={handleSelectUser} />
        ) : (
          <UsersEmptyState />
        )}
      </DashboardSection>

      <WalletPagination
        currentPage={page}
        pageCount={pageCount}
        totalItems={totalElements}
        itemsPerPage={pageSize}
        onPageChange={setPage}
        onItemsPerPageChange={handlePageSizeChange}
        itemLabel="usuarios"
        ariaLabel="Paginación de usuarios del servidor"
      />
    </div>
  );
};

export default UsersDashboard;
