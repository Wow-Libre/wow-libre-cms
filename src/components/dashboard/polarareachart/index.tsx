import React from "react";
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

interface PolarAreaChartProps {
  labels: string[];
  dataValues: number[];
  backgroundColors: string[];
  legendPosition?: "top" | "left" | "bottom" | "right";
  title?: string;
  legendColor?: string;
  width?: number;
  height?: number;
}

const PolarAreaChart: React.FC<PolarAreaChartProps> = ({
  labels,
  dataValues,
  backgroundColors,
  legendPosition = "top",
  title = "",
  legendColor = "#ffffff",
  width = 600,
  height = 600,
}) => {
  // Convertir colores a versiones con transparencia para mejor efecto visual
  const backgroundColorWithOpacity = backgroundColors.map((color) => {
    // Si el color ya tiene formato rgba, mantenerlo, sino agregar opacidad
    if (color.startsWith("rgba")) return color;
    // Convertir hex a rgba con 70% de opacidad
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  });

  const borderColors = backgroundColors.map((color) => {
    if (color.startsWith("rgba")) {
      // Convertir rgba a rgb para el borde
      return color.replace(/rgba?\(([^)]+)\)/, "rgb($1)");
    }
    return color;
  });

  const data = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColorWithOpacity,
        borderColor: borderColors,
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1500,
      easing: "easeInOutQuart" as const,
    },
    scales: {
      r: {
        grid: {
          color: "rgba(148, 163, 184, 0.15)",
          lineWidth: 1,
        },
        pointLabels: {
          color: "#cbd5e1",
          font: {
            size: 12,
          },
        },
        ticks: {
          display: false,
          backdropColor: "transparent",
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: legendPosition,
        labels: {
          color: legendColor,
          font: {
            size: 13,
            weight: "bold" as const,
            family: "'Inter', sans-serif",
          },
          padding: 18,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(148, 163, 184, 0.3)",
        borderWidth: 1,
        padding: 12,
        titleFont: {
          size: 14,
          weight: "bold" as const,
        },
        bodyFont: {
          size: 13,
        },
        displayColors: true,
        boxPadding: 6,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed.r / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.r} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      className="w-full"
      style={{
        width: "100%",
        maxWidth: `${width}px`,
        height: `${height}px`,
        margin: "0 auto",
      }}
    >
      <PolarArea data={data} options={options} />
    </div>
  );
};

export default PolarAreaChart;
