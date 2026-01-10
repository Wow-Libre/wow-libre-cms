import React, { useState, useEffect } from "react";
import LineChart from "../linechart";
import { FaUser } from "react-icons/fa";
import Cookies from "js-cookie";
import {
  enableLoans,
  getCreditLoansData,
  getCreditLoansServer,
} from "@/api/dashboard/bank";
import { BankPlans, CreditLoansUser } from "@/model/model";
import { getPlans } from "@/api/bank";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

interface BankDasboardProps {
  token: string;
  serverId: number;
}

const BankDashboard: React.FC<BankDasboardProps> = ({ token, serverId }) => {
  const [users, setUsers] = useState<CreditLoansUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [loanApproval, setLoanApproval] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [remainingLoans, setRemainingLoans] = useState<number>(0);
  const { user } = useUserContext();
  const [bankPlans, setBankPlans] = useState<BankPlans[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const router = useRouter();

  const [filteredData, setFilteredData] = useState<any>(null);

  useEffect(() => {
    setUsers([]);
    setPage(0);
    loadMoreUsers();
  }, []);

  const loadMoreUsers = async () => {
    if (isLoading || !serverId || !token) return;
    setIsLoading(true);

    try {
      const [usersResponse, plansResponse, creditLoansData] = await Promise.all(
        [
          getCreditLoansServer(
            10,
            page,
            serverId,
            filter,
            sortOrder === "asc" ? true : false,
            token
          ),
          getPlans(user.language),
          getCreditLoansData(serverId, token),
        ]
      );
      setBankPlans(plansResponse);
      setFilteredData(creditLoansData);

      if (usersResponse && usersResponse.users) {
        setUsers((prevUsers) => [...prevUsers, ...usersResponse.users]);
        setRemainingLoans(
          usersResponse.loans === null ? 0 : usersResponse.loans
        );
        if (usersResponse.users.length > 10) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Ha ocurrido un error innesperado",
        text: `${error.message}`,
        color: "white",
        background: "#0B1218",
        willClose: () => {
          router.push("/realms");
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/realms");
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoansEnable = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await enableLoans(Number(loanApproval), "BANK", serverId, token || "");

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("id", serverId.toString());
      searchParams.set("activeOption", "bank");
      router.push(`${window.location.pathname}?${searchParams.toString()}`);
      setRemainingLoans(Number(loanApproval));

      Swal.fire({
        icon: "success",
        title: "¡Créditos Actualizados!",
        html: `
          <p style="font-size: 16px; margin-bottom: 10px;">
            La cantidad de créditos ha sido aprobada y actualizada con éxito.
          </p>
        `,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Entendido",
        timer: 4500,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Opss!",
        text: `${error.message}`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !isLoading) {
      loadMoreUsers();
    }
  };

  useEffect(() => {
    setUsers([]);
    setPage(0);
    loadMoreUsers();
  }, [filter, sortOrder]);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6" >
        <h1 className="text-3xl font-bold text-white mb-2">
          Panel de Control: Préstamos y Pagos
        </h1>
        <p className="text-slate-300 text-lg">
          Visualiza la evolución de los préstamos otorgados, los saldos
          pendientes y los pagos recuperados en los últimos meses. También
          puedes consultar el listado de usuarios asociados a cada operación.
        </p>
      </div>

      <div className="p-8">
        <div className="max-w-8xl mx-auto space-y-8">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Formulario de aprobación */}
            <div className="xl:w-1/4 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-emerald-400/50 transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Aprobar Préstamos
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-cyan-400 mx-auto rounded-full"></div>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-400/30">
                <p className="text-lg font-semibold text-white mb-1">
                  Préstamos Restantes
                </p>
                <p className="text-3xl font-bold text-emerald-400">
                  {remainingLoans}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Planes Disponibles
                </h3>
                <div className="space-y-3">
                  {bankPlans.map((plan, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 rounded-xl border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mr-4">
                          <FaUser className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">
                            {plan.name}
                          </p>
                          <p className="text-sm text-slate-300 mb-1">
                            {plan.description}
                          </p>
                          <p className="text-sm font-semibold text-emerald-400">
                            {plan.price} - {plan.frecuency}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => updateLoansEnable(e)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="loanApproval"
                    className="block mb-3 font-semibold text-slate-200 text-lg"
                  >
                    Cantidad de préstamos a disponibilizar:
                  </label>
                  <input
                    id="loanApproval"
                    type="number"
                    value={loanApproval}
                    onChange={(e) => setLoanApproval(e.target.value)}
                    className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none text-white text-lg transition-all duration-300"
                    min="0"
                    max="200"
                    placeholder="Ingresa la cantidad"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-4 rounded-lg border border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 text-lg"
                >
                  Aprobar Préstamos
                </button>
              </form>
            </div>

            {/* Gráfica */}
            <div className="xl:w-1/2 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Análisis de Préstamos
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
              </div>
              <div className="w-full h-[600px]">
                <LineChart filteredData={filteredData} />
              </div>
            </div>

            {/* Lista de usuarios */}
            <div className="xl:w-1/4 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-orange-400/50 transition-all duration-300">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Gestión de Usuarios
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto rounded-full"></div>
              </div>

              {/* Filtros */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Filtros
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      filter === "all"
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilter("DEBTOR")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      filter === "DEBTOR"
                        ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                  >
                    Deudores
                  </button>
                  <button
                    onClick={() => setFilter("NON_DEBTOR")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      filter === "NON_DEBTOR"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                  >
                    No Deudores
                  </button>
                </div>
              </div>

              {/* Ordenar por fecha */}
              <div className="mb-6">
                <label className="block mb-3 font-semibold text-slate-200 text-lg">
                  Ordenar por fecha
                </label>
                <select
                  onChange={(e) => setSortOrder(e.target.value)}
                  value={sortOrder}
                  className="w-full p-4 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-white text-lg transition-all duration-300"
                >
                  <option value="desc">Más Reciente</option>
                  <option value="asc">Más Viejo</option>
                </select>
              </div>

              {/* Lista de usuarios */}
              <div
                className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700"
                onScroll={handleScroll}
              >
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-6 mb-4 rounded-xl border border-slate-600/30 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <FaUser className="text-white text-lg" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-white text-lg">
                              {user.id} - {user.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              Solicitud: {user.application_date}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.debtor
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {user.debtor ? "Deudor" : "Al día"}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-600/30 p-3 rounded-lg">
                            <p className="text-sm text-slate-300 mb-1">
                              Monto Prestado
                            </p>
                            <p className="text-lg font-bold text-emerald-400">
                              ${user.amount}
                            </p>
                          </div>
                          <div className="bg-slate-600/30 p-3 rounded-lg">
                            <p className="text-sm text-slate-300 mb-1">
                              Fecha de pago
                            </p>
                            <p className="text-sm font-semibold text-slate-200">
                              {user.payment_date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-6 w-6 text-orange-400"></div>
                      <span className="text-slate-300">
                        Cargando usuarios...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDashboard;
