import { webProps } from "@/constants/configs";

const DiscordWidget = () => {
  return (
    <div className="flex justify-center px-4 relative">
      {/* Efecto de luz/rayos detrás del widget */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Rayos de luz animados */}
        <div className="absolute w-full max-w-[600px] h-[500px] sm:h-[600px]">
          {/* Rayo central principal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-full bg-gradient-to-b from-transparent via-purple-500/40 to-transparent blur-sm animate-pulse" />
          
          {/* Rayos radiales */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {/* Rayo 1 - Superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-b from-purple-500/30 via-blue-500/20 to-transparent blur-sm" />
            
            {/* Rayo 2 - Inferior */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-t from-purple-500/30 via-blue-500/20 to-transparent blur-sm" />
            
            {/* Rayo 3 - Izquierda */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1/2 h-1 bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-transparent blur-sm" />
            
            {/* Rayo 4 - Derecha */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/2 h-1 bg-gradient-to-l from-purple-500/30 via-blue-500/20 to-transparent blur-sm" />
            
            {/* Rayos diagonales */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-500/20 via-transparent to-transparent blur-md" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-500/20 via-transparent to-transparent blur-md" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-500/20 via-transparent to-transparent blur-md" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/20 via-transparent to-transparent blur-md" />
          </div>
          
          {/* Halo de luz central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" 
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 30%, transparent 70%)'
            }}
          />
          
          {/* Partículas de luz flotantes */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/40 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-blue-400/40 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300/50 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        </div>
      </div>
      
      {/* Widget de Discord con efecto glassmorphism */}
      <div className="relative z-10 w-full max-w-[550px]">
        <iframe
          src={webProps.discordWidget}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="Discord Widget"
          className="w-full h-[400px] sm:h-[500px] rounded-xl shadow-2xl border border-purple-500/20 bg-slate-900/50 backdrop-blur-sm"
        ></iframe>
        
        {/* Borde brillante sutil */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 pointer-events-none opacity-50" />
      </div>
    </div>
  );
};

export default DiscordWidget;
