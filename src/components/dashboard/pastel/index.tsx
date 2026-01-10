import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Registra los elementos necesarios de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Definimos los tipos de las props que el componente va a recibir
interface PieChartProps {
  labels: string[];
  dataValues: number[];
  backgroundColors: string[];
  legendPosition?: "top" | "left" | "bottom" | "right"; // Posición de la leyenda, predeterminada es "top"
  title?: string; // Título opcional
  legendColor?: string; // Color de las etiquetas de la leyenda
}

const PieChart: React.FC<PieChartProps> = ({
  labels,
  dataValues,
  backgroundColors,
  legendPosition = "top", // Valor por defecto "top"
  title,
  legendColor = "#ffffff", // Color de la leyenda predeterminado es blanco
}) => {
  const data = {
    labels, // Etiquetas personalizadas pasadas por props
    datasets: [
      {
        data: dataValues, // Valores de los segmentos pasados por props
        backgroundColor: backgroundColors, // Colores de los segmentos pasados por props
        borderColor: "#0f172a",
        borderWidth: 3,
        hoverBorderWidth: 5,
        hoverOffset: 8,
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
    plugins: {
      legend: {
        position: legendPosition, // Posición de la leyenda
        labels: {
          color: legendColor, // Color de las etiquetas de la leyenda
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
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
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
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
