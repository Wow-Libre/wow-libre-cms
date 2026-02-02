import { getMetricsServer } from "@/api/dashboard/home";
import { DashboardMetrics, RangeLevelDto } from "@/model/model";
import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaGamepad,
  FaGift,
  FaShieldAlt,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import BarChart from "../barchart";
import Card from "../card";
import { DashboardLoading, DashboardSection } from "../layout";
import PolarAreaChart from "../polarareachart";

interface HomeDashboardProps {
  token: string;
  serverId: number;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ token, serverId }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>();
  const [loading, setLoading] = useState(true);
  const [factions, setFactions] = useState<number[]>([]);
  const [charactersOnline, setCharactersOnline] = useState<number[]>([]);
  const [redeemedPromotions, setRedeemedPromotions] = useState<number[]>([]);
  const [levelChartData, setLevelChartData] = useState({
    labels: [] as string[],
    dataValues: [] as number[],
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getMetricsServer(serverId, token);
        setMetrics(data);
        setFactions([data.hordas, data.alianzas]);
        setCharactersOnline([
          data.online_users,
          data.total_users - data.online_users,
        ]);
        setRedeemedPromotions([
          data.redeemed_promotions,
          data.total_users - data.redeemed_promotions,
        ]);
        const labels = data.range_level.map(
          (range: RangeLevelDto) => `Lvl ${range.level_range}`
        );
        const dataValues = data.range_level.map(
          (range: RangeLevelDto) => range.user_count
        );
        setLevelChartData({ labels, dataValues });
      } catch (err: any) {
        setFactions([0, 0]);
        setCharactersOnline([0, 0]);
        setRedeemedPromotions([0, 0]);
        setLevelChartData({ labels: [], dataValues: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [serverId, token]);

  if (loading) {
    return (
      <div className="min-h-[50vh]">
        <DashboardLoading message="Preparando métricas del servidor..." />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 text-white">
      <DashboardSection
        title="Resumen general"
        description="Vista rápida de las métricas principales"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card
            title="Total de Usuarios"
            value={metrics?.total_users.toString() || "0"}
            icon={<FaUsers />}
            colorScheme="blue"
          />
          <Card
            title="Jugadores Conectados"
            value={metrics?.online_users.toString() || "0"}
            icon={<FaGamepad />}
            colorScheme="green"
          />
          <Card
            title="Número de Hermandades"
            value={metrics?.total_guilds.toString() || "0"}
            icon={<FaShieldAlt />}
            colorScheme="purple"
          />
          <Card
            title="Promociones Redimidas"
            value={metrics?.redeemed_promotions?.toString() || "0"}
            icon={<FaGift />}
            colorScheme="yellow"
          />
          <Card
            title="Usuarios Registrados por la Web"
            value={metrics?.external_registrations.toString() || "0"}
            icon={<FaClipboardList />}
            colorScheme="pink"
          />
          <Card
            title="Total de Personajes"
            value={metrics?.character_count.toString() || "0"}
            icon={<FaUserFriends />}
            colorScheme="cyan"
          />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Análisis de datos"
        description="Visualización detallada de distribuciones"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="group relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 rounded-3xl border border-slate-600/40 p-8 md:p-10 shadow-2xl hover:shadow-blue-500/30 hover:border-blue-400/60 transition-all duration-500 overflow-hidden backdrop-blur-sm">
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-500/10 transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 group-hover:from-blue-500/50 group-hover:via-cyan-500/70 group-hover:to-blue-500/50 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-bold text-white">
                    Distribución de Facciones
                  </h3>
                </div>
                <p className="text-sm text-slate-400 ml-5">
                  Análisis de jugadores por facción
                </p>
              </div>
              <div className="h-80">
                <BarChart
                  labels={["Horda", "Alianza"]}
                  dataValues={factions}
                  backgroundColors={["#FF4C4C", "#4C9AFF"]}
                  legendPosition={"top"}
                  title={"Distribución de Facciones"}
                />
              </div>
            </div>
          </div>
          <div className="group relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 rounded-3xl border border-slate-600/40 p-8 md:p-10 shadow-2xl hover:shadow-green-500/30 hover:border-green-400/60 transition-all duration-500 overflow-hidden backdrop-blur-sm">
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:via-emerald-500/5 group-hover:to-green-500/10 transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all duration-700"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 group-hover:from-green-500/50 group-hover:via-emerald-500/70 group-hover:to-green-500/50 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-bold text-white">
                    Distribución de Conexiones
                  </h3>
                </div>
                <p className="text-sm text-slate-400 ml-5">
                  Estado de conexión de los jugadores
                </p>
              </div>
              <div className="h-80">
                <BarChart
                  labels={["Online", "Offline"]}
                  dataValues={charactersOnline}
                  backgroundColors={["#32CD32", "#a855f7"]}
                  legendPosition={"top"}
                  title={"Distribución de conexiones"}
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Análisis detallado"
        description="Visualización avanzada de métricas"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="group relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 rounded-3xl border border-slate-600/40 p-5 md:p-6 shadow-2xl hover:shadow-yellow-500/30 hover:border-yellow-400/60 transition-all duration-500 overflow-hidden backdrop-blur-sm">
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:via-amber-500/5 group-hover:to-yellow-500/10 transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all duration-700"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 group-hover:from-yellow-500/50 group-hover:via-amber-500/70 group-hover:to-yellow-500/50 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-bold text-white">
                    Distribución de Promociones
                  </h3>
                </div>
                <p className="text-sm text-slate-400 ml-5">
                  Estado de las promociones redimidas
                </p>
              </div>
              <div className="h-80 flex items-center justify-center">
                <BarChart
                  labels={["Promociones", "Pendientes"]}
                  dataValues={redeemedPromotions}
                  backgroundColors={["#FFD700", "#2563eb"]}
                  legendPosition={"top"}
                  title={"Distribución de Promociones"}
                />
              </div>
            </div>
          </div>
          <div className="group relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 rounded-3xl border border-slate-600/40 p-5 md:p-6 shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/60 transition-all duration-500 overflow-hidden backdrop-blur-sm">
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-violet-500/5 group-hover:to-purple-500/10 transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-700"></div>
            
            {/* Línea decorativa superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 group-hover:from-purple-500/50 group-hover:via-violet-500/70 group-hover:to-purple-500/50 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-bold text-white">
                    Rango de Niveles
                  </h3>
                </div>
                <p className="text-sm text-slate-400 ml-5">
                  Distribución de jugadores por nivel
                </p>
              </div>
              <div className="min-h-[350px] sm:min-h-[380px] md:min-h-[400px] lg:min-h-[420px] xl:min-h-[440px] flex flex-col items-center justify-center overflow-visible">
                <div className="flex-1 flex items-center justify-center w-full mb-4">
                  <PolarAreaChart
                    labels={levelChartData.labels}
                    dataValues={levelChartData.dataValues}
                    backgroundColors={[
                      "#2563eb",
                      "#f59e0b",
                      "#22c55e",
                      "#ef4444",
                      "#a855f7",
                      "#14b8a6",
                      "#f87171",
                      "#fbbf24",
                    ]}
                    legendPosition="bottom"
                    title="Rango de Niveles"
                    legendColor="#ffffff"
                    width={550}
                    height={550}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
};

export default HomeDashboard;
