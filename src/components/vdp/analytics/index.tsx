import { CardVdp } from "@/model/model";
import React from "react";

const ICONS: Record<number, JSX.Element> = {
  1: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 14a4 4 0 00-8 0M12 8a4 4 0 100-8 4 4 0 000 8zM2 20a10 10 0 0120 0"
      />
    </svg>
  ),
  2: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-4-4h-1m-6 6H3v-2a4 4 0 014-4h1m9-4a3 3 0 11-6 0 3 3 0 016 0zM7 10a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  3: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 22s8-4 8-10V4l-8-2-8 2v8c0 6 8 10 8 10z"
      />
    </svg>
  ),
};

interface ServerAnalyticsProps {
  cardData: CardVdp[];
}

const ServerAnalytics: React.FC<ServerAnalyticsProps> = ({ cardData }) => {
  return (
    <div className="contenedor grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto p-4">
      {cardData.map((card, index) => (
        <article
          key={card.id}
          className="group relative flex flex-col items-center sm:items-start gap-6 rounded-2xl border p-8 sm:p-12 min-h-[180px] shadow-xl
                   transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-slate-500/30 
                   border-slate-500/30 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90
                   backdrop-blur-sm hover:border-slate-400 overflow-hidden"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {/* Animated background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/0 via-slate-600/0 to-slate-500/0 group-hover:from-slate-500/10 group-hover:via-slate-600/10 group-hover:to-slate-500/10 transition-all duration-500"></div>

          {/* Content */}
          <div className="relative z-10 w-full">
            <span className="inline-block rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 text-slate-400 p-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-gradient-to-br group-hover:from-slate-500 group-hover:to-slate-600 group-hover:text-white shadow-lg">
              {ICONS[card.icon] || ICONS[1]}
            </span>

            <div className="text-center sm:text-left mt-4">
              <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-white pb-2 group-hover:from-slate-300 group-hover:via-slate-200 group-hover:to-slate-300 transition-all duration-500">
                {card.value}
              </p>
              <p className="text-lg sm:text-xl text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {card.description}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ServerAnalytics;
