import { getMetricsServer } from "@/api/dashboard/home";
import { DashboardMetrics, RangeLevelDto } from "@/model/model";
import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaGamepad,
  FaGift,
  FaShieldAlt,
  FaSpinner,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import BarChart from "../barchart";
import Card from "../card";
import PieChart from "../pastel";
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
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <FaSpinner className="animate-spin text-6xl text-blue-400 mx-auto mb-4" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Cargando Dashboard
          </h3>
          <p className="text-slate-300">Preparando métricas del servidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen overflow-y-auto">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border-b border-slate-600/30 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard del Servidor
        </h1>
        <p className="text-slate-300">Métricas y estadísticas en tiempo real</p>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 p-6">
        <Card
          title="Total de Usuarios"
          value={metrics?.total_users.toString() || "0"}
          icon={<FaUsers />}
        />
        <Card
          title="Jugadores Conectados"
          value={metrics?.online_users.toString() || "0"}
          icon={<FaGamepad />}
        />
        <Card
          title="Número de Hermandades"
          value={metrics?.total_guilds.toString() || "0"}
          icon={<FaShieldAlt />}
        />
        <Card
          title="Promociones Redimidas"
          value={metrics?.redeemed_promotions?.toString() || "0"}
          icon={<FaGift />}
        />
        <Card
          title="Usuarios Registrados por la Web"
          value={metrics?.external_registrations.toString() || "0"}
          icon={<FaClipboardList />}
        />
        <Card
          title="Total de Personajes"
          value={metrics?.character_count.toString() || "0"}
          icon={<FaUserFriends />}
        />
      </div>

      {/* Sección de Gráficos */}
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Análisis de Datos
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-600/30 p-6 shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300">
            <BarChart
              labels={["Horda", "Alianza"]}
              dataValues={factions}
              backgroundColors={["#FF4C4C", "#4C9AFF"]}
              legendPosition={"top"}
              title={"Distribución de Facciones"}
            />
          </div>
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-600/30 p-6 shadow-xl hover:shadow-2xl hover:border-green-400/50 transition-all duration-300">
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

      {/* Sección de Gráficos Circulares */}
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Análisis Detallado
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-600/30 p-6 shadow-xl hover:shadow-2xl hover:border-yellow-400/50 transition-all duration-300">
            <PieChart
              labels={["Promociones", "Pendientes"]}
              dataValues={redeemedPromotions}
              backgroundColors={["#FFD700", "#2563eb"]}
              legendPosition={"bottom"}
              title={"Distribución de Promociones"}
              legendColor={"#ffffff"}
            />
          </div>
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-600/30 p-6 shadow-xl hover:shadow-2xl hover:border-purple-400/50 transition-all duration-300">
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
              width={600}
              height={600}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
