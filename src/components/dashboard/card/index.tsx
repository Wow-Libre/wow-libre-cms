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
      iconBg: "bg-[#0071e3]/12",
      iconColor: "text-[#0071e3]",
      iconHoverClass: "group-hover:text-[#0077ed]",
      borderHover: "hover:border-[#0071e3]/35",
      valueHover: "group-hover:text-[#0071e3]",
    },
    green: {
      iconBg: "bg-[#34c759]/15",
      iconColor: "text-[#1f8a38]",
      iconHoverClass: "group-hover:text-[#248a3d]",
      borderHover: "hover:border-[#34c759]/40",
      valueHover: "group-hover:text-[#1f8a38]",
    },
    purple: {
      iconBg: "bg-[#af52de]/12",
      iconColor: "text-[#7d3caf]",
      iconHoverClass: "group-hover:text-[#8944ab]",
      borderHover: "hover:border-[#af52de]/35",
      valueHover: "group-hover:text-[#7d3caf]",
    },
    yellow: {
      iconBg: "bg-[#ff9f0a]/15",
      iconColor: "text-[#c77b00]",
      iconHoverClass: "group-hover:text-[#b25000]",
      borderHover: "hover:border-[#ff9f0a]/40",
      valueHover: "group-hover:text-[#c77b00]",
    },
    pink: {
      iconBg: "bg-[#ff2d55]/12",
      iconColor: "text-[#d70015]",
      iconHoverClass: "group-hover:text-[#ff3b30]",
      borderHover: "hover:border-[#ff2d55]/35",
      valueHover: "group-hover:text-[#d70015]",
    },
    cyan: {
      iconBg: "bg-[#0071e3]/12",
      iconColor: "text-[#0071e3]",
      iconHoverClass: "group-hover:text-[#0077ed]",
      borderHover: "hover:border-[#0071e3]/35",
      valueHover: "group-hover:text-[#0071e3]",
    },
  };

  const colors = colorConfig[colorScheme];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/[0.12] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_10px_28px_rgba(0,0,0,0.08)] transition ${colors.borderHover} group`}>
      <div className="relative z-10">
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-xl ${colors.iconBg}`}
        >
          <div className={`${colors.iconColor} ${colors.iconHoverClass} text-2xl`}>
            {icon}
          </div>
        </div>

        <div className="text-left">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6e6e73]">
            {title}
          </h2>
          <p className={`inline-block text-3xl font-bold tracking-tight text-[#1d1d1f] ${colors.valueHover}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;
