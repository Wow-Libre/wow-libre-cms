import { webProps } from "@/constants/configs";

const DiscordWidget = () => {
  return (
    <div className="relative flex justify-center px-4">
      {/* Efecto de luz/rayos detrás del widget */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Rayos de luz animados */}
        <div className="absolute h-[500px] w-full max-w-[600px] sm:h-[600px]">
          {/* Rayo central principal */}
          <div className="absolute left-1/2 top-1/2 h-full w-2 -translate-x-1/2 -translate-y-1/2 animate-pulse bg-gradient-to-b from-transparent via-purple-500/20 to-transparent blur-sm" />
          
          {/* Rayos radiales */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {/* Rayo 1 - Superior */}
            <div className="absolute left-1/2 top-0 h-1/2 w-1 -translate-x-1/2 bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent blur-sm" />
            
            {/* Rayo 2 - Inferior */}
            <div className="absolute bottom-0 left-1/2 h-1/2 w-1 -translate-x-1/2 bg-gradient-to-t from-purple-500/20 via-blue-500/10 to-transparent blur-sm" />
            
            {/* Rayo 3 - Izquierda */}
            <div className="absolute left-0 top-1/2 h-1 w-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-transparent blur-sm" />
            
            {/* Rayo 4 - Derecha */}
            <div className="absolute right-0 top-1/2 h-1 w-1/2 -translate-y-1/2 bg-gradient-to-l from-purple-500/20 via-blue-500/10 to-transparent blur-sm" />
            
            {/* Rayos diagonales */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent blur-md" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-500/20 via-transparent to-transparent blur-md" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-500/20 via-transparent to-transparent blur-md" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent blur-md" />
          </div>
          
          {/* Halo de luz central */}
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-radial from-purple-500/15 via-blue-500/8 to-transparent blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, rgba(59, 130, 246, 0.08) 30%, transparent 70%)",
            }}
          />
          
          {/* Partículas de luz flotantes */}
          <div className="absolute left-1/4 top-1/4 h-2 w-2 animate-pulse rounded-full bg-purple-400/30 blur-sm" style={{ animationDelay: "0s", animationDuration: "3s" }} />
          <div className="absolute right-1/4 top-3/4 h-2 w-2 animate-pulse rounded-full bg-blue-400/30 blur-sm" style={{ animationDelay: "1s", animationDuration: "3s" }} />
          <div className="absolute bottom-1/4 left-1/3 h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300/40 blur-sm" style={{ animationDelay: "2s", animationDuration: "4s" }} />
        </div>
      </div>
      
      {/* Widget de Discord con efecto glassmorphism */}
      <div className="relative z-10 w-full max-w-[550px]">
        <div className="pointer-events-none absolute -inset-3 rounded-2xl border border-white/10 bg-slate-900/25 backdrop-blur-md" />
        <iframe
          src={webProps.discordWidget}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="Discord Widget"
          className="relative h-[400px] w-full rounded-xl bg-slate-900/30 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-[1px] sm:h-[500px]"
        ></iframe>
      </div>
    </div>
  );
};

export default DiscordWidget;
