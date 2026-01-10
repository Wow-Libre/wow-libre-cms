import React from "react";

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorScheme?: "blue" | "green" | "purple" | "yellow" | "pink" | "cyan";
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  icon, 
  colorScheme = "blue" 
}) => {
  const colorConfig = {
    blue: {
      iconBg: "from-blue-500/20 via-blue-600/20 to-cyan-500/20",
      iconBgHover: "from-blue-500/30 via-blue-600/30 to-cyan-500/30",
      iconColor: "text-blue-400",
      iconHoverClass: "group-hover:text-cyan-300",
      borderHover: "hover:border-blue-400/60",
      shadowHover: "hover:shadow-blue-500/20",
      valueHover: "group-hover:text-blue-100",
      glow: "group-hover:shadow-blue-500/30",
    },
    green: {
      iconBg: "from-emerald-500/20 via-green-600/20 to-teal-500/20",
      iconBgHover: "from-emerald-500/30 via-green-600/30 to-teal-500/30",
      iconColor: "text-emerald-400",
      iconHoverClass: "group-hover:text-teal-300",
      borderHover: "hover:border-emerald-400/60",
      shadowHover: "hover:shadow-emerald-500/20",
      valueHover: "group-hover:text-emerald-100",
      glow: "group-hover:shadow-emerald-500/30",
    },
    purple: {
      iconBg: "from-purple-500/20 via-violet-600/20 to-fuchsia-500/20",
      iconBgHover: "from-purple-500/30 via-violet-600/30 to-fuchsia-500/30",
      iconColor: "text-purple-400",
      iconHoverClass: "group-hover:text-fuchsia-300",
      borderHover: "hover:border-purple-400/60",
      shadowHover: "hover:shadow-purple-500/20",
      valueHover: "group-hover:text-purple-100",
      glow: "group-hover:shadow-purple-500/30",
    },
    yellow: {
      iconBg: "from-amber-500/20 via-yellow-600/20 to-orange-500/20",
      iconBgHover: "from-amber-500/30 via-yellow-600/30 to-orange-500/30",
      iconColor: "text-amber-400",
      iconHoverClass: "group-hover:text-orange-300",
      borderHover: "hover:border-amber-400/60",
      shadowHover: "hover:shadow-amber-500/20",
      valueHover: "group-hover:text-amber-100",
      glow: "group-hover:shadow-amber-500/30",
    },
    pink: {
      iconBg: "from-pink-500/20 via-rose-600/20 to-red-500/20",
      iconBgHover: "from-pink-500/30 via-rose-600/30 to-red-500/30",
      iconColor: "text-pink-400",
      iconHoverClass: "group-hover:text-rose-300",
      borderHover: "hover:border-pink-400/60",
      shadowHover: "hover:shadow-pink-500/20",
      valueHover: "group-hover:text-pink-100",
      glow: "group-hover:shadow-pink-500/30",
    },
    cyan: {
      iconBg: "from-cyan-500/20 via-sky-600/20 to-blue-500/20",
      iconBgHover: "from-cyan-500/30 via-sky-600/30 to-blue-500/30",
      iconColor: "text-cyan-400",
      iconHoverClass: "group-hover:text-sky-300",
      borderHover: "hover:border-cyan-400/60",
      shadowHover: "hover:shadow-cyan-500/20",
      valueHover: "group-hover:text-cyan-100",
      glow: "group-hover:shadow-cyan-500/30",
    },
  };

  const colors = colorConfig[colorScheme];

  return (
    <div className={`relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 
      p-6 rounded-2xl border border-slate-600/40 
      shadow-xl hover:shadow-2xl ${colors.borderHover} ${colors.glow}
      transition-all duration-500 group overflow-hidden
      backdrop-blur-sm`}>
      
      {/* Efecto de brillo animado en el fondo */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.iconBg} 
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 
        blur-2xl -z-0`}></div>
      
      {/* Línea decorativa superior */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r 
        ${colors.iconBg} opacity-0 group-hover:opacity-100 
        transition-opacity duration-500`}></div>

      <div className="relative z-10">
        {/* Icono con fondo degradado mejorado */}
        <div className={`flex items-center justify-center 
          bg-gradient-to-br ${colors.iconBg} 
          p-4 rounded-xl w-16 h-16 mb-5 
          group-hover:bg-gradient-to-br ${colors.iconBgHover}
          transition-all duration-500 
          shadow-lg group-hover:shadow-xl
          group-hover:scale-110 group-hover:rotate-3`}>
          <div className={`${colors.iconColor} ${colors.iconHoverClass} text-2xl 
            transition-all duration-500 
            group-hover:scale-110`}>
            {icon}
          </div>
        </div>

        {/* Contenido */}
        <div className="text-left">
          <h2 className="text-xs uppercase tracking-wider text-slate-400 
            font-semibold mb-3 group-hover:text-slate-300 
            transition-colors duration-300">
            {title}
          </h2>
          <p className={`text-3xl text-white font-bold 
            ${colors.valueHover} 
            transition-all duration-500
            group-hover:scale-105 inline-block`}>
            {value}
          </p>
        </div>
      </div>

      {/* Partículas decorativas */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full 
        bg-slate-600/30 group-hover:bg-slate-500/50 
        transition-all duration-500"></div>
      <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full 
        bg-slate-600/30 group-hover:bg-slate-500/50 
        transition-all duration-500 delay-75"></div>
    </div>
  );
};

export default Card;
