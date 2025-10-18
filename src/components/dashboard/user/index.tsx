import { getUsersAllServer, updateMail } from "@/api/dashboard/users";
import { AccountsServer } from "@/model/model";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import UserActionModal from "./UserManagement";

interface UsersDashboardProps {
  token: string;
  serverId: number;
}

const UsersDashboard: React.FC<UsersDashboardProps> = ({ token, serverId }) => {
  const [users, setUsers] = useState<AccountsServer[]>([]);
  const [selectedUser, setSelectedUser] = useState<AccountsServer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchData = async () => {
    try {
      const response = await getUsersAllServer(
        itemsPerPage,
        currentPage - 1,
        serverId,
        searchTerm,
        token
      );
      setUsers(response.accounts);
      setTotalElements(response.size);
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudieron obtener los usuarios. Inténtelo más tarde.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, token]);

  useEffect(() => {
    const totalPages =
      totalElements && itemsPerPage
        ? Math.ceil(totalElements / itemsPerPage)
        : 0;

    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalElements, itemsPerPage]);

  const handleRowClick = (user: AccountsServer) => {
    setSelectedUser(user);
  };

  const fillEmptyRows = () => {
    const emptyRows = itemsPerPage - users.length;
    return Array.from({ length: emptyRows }, (_, i) => (
      <tr
        key={`empty-row-${i}`}
        className="h-10 bg-transparent border-none pointer-events-none"
        aria-hidden="true"
      >
        <td colSpan={9} className="border-none"></td>
      </tr>
    ));
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-slate-300 text-lg">
          Administra y supervisa todos los usuarios registrados en el servidor
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-8xl mx-auto space-y-8">
          {/* Barra de búsqueda */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Buscar Usuarios
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuario por email o username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-white text-lg transition-all duration-300"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Controles de navegación */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="itemsPerPage"
                  className="text-lg font-semibold text-slate-200"
                >
                  Mostrar:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white text-lg transition-all duration-300"
                >
                  <option value={10}>10 usuarios</option>
                  <option value={20}>20 usuarios</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || totalElements === 0}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <div className="px-4 py-2 bg-slate-700/50 text-white font-bold rounded-lg border border-slate-600/50">
                  Página {totalElements > 0 ? currentPage : 0} de{" "}
                  {Math.ceil(totalElements / itemsPerPage)}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(totalElements / itemsPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(totalElements / itemsPerPage) ||
                    totalElements === 0
                  }
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-orange-400/50 transition-all duration-300">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Lista de Usuarios
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto rounded-full"></div>
            </div>

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

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700/80 to-slate-800/80 text-white">
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      Última IP
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      Fallos
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      OS
                    </th>
                    <th className="px-6 py-4 text-left whitespace-nowrap font-bold">
                      Expansión
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                      className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 hover:from-slate-600/50 hover:to-slate-700/50 cursor-pointer transition-all duration-300 border-b border-slate-600/30"
                    >
                      <td className="px-6 py-4 text-left">
                        <span className="font-bold text-blue-400">
                          #{user.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-white">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-slate-300">{user.email}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex space-x-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.online
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {user.online ? "Online" : "Offline"}
                          </div>
                          {user.mute && (
                            <div className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                              Muteado
                            </div>
                          )}
                          {user.banned && (
                            <div className="px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                              Baneado
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-slate-300 font-mono text-sm">
                          {user.last_ip}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            Number(user.failed_logins) > 0
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {user.failed_logins}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-slate-300">{user.os}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-slate-300">{user.expansion}</span>
                      </td>
                    </tr>
                  ))}
                  {fillEmptyRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersDashboard;
