import React from "react";

interface CardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-6 rounded-2xl border border-slate-600/30 shadow-lg hover:shadow-2xl hover:border-blue-400/50 transition-all duration-300 group">
      {/* Icono con fondo degradado */}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl w-14 h-14 mb-4 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
        <div className="text-blue-400 text-2xl group-hover:text-cyan-300 transition-colors duration-300">
          {icon}
        </div>
      </div>

      {/* Contenido */}
      <div className="text-left">
        <h2 className="text-sm text-slate-300 font-medium mb-2 group-hover:text-slate-200 transition-colors duration-300">
          {title}
        </h2>
        <p className="text-2xl text-white font-bold group-hover:text-blue-100 transition-colors duration-300">
          {value}
        </p>
      </div>
    </div>
  );
};

export default Card;
