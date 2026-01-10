import React, { useRef, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  labels: string[];
  dataValues: number[];
  backgroundColors: string[];
  legendPosition?: "top" | "left" | "bottom" | "right";
  title?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  labels,
  dataValues,
  backgroundColors,
  legendPosition = "top",
  title,
}) => {
  const chartRef = useRef<any>(null);
  const [gradients, setGradients] = useState<string[]>([]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    if (!chartArea) return;

    const newGradients = backgroundColors.map((color) => {
      const gradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + "CC"); // 80% de opacidad
      return gradient as unknown as string;
    });

    setGradients(newGradients);
  }, [backgroundColors]);

  const data = {
    labels,
    datasets: [
      {
        label: title || "Facción",
        data: dataValues,
        backgroundColor:
          gradients.length > 0
            ? gradients
            : backgroundColors.map((color) => color + "CC"),
        borderColor: backgroundColors.map((color) => color),
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 80,
        maxBarThickness: 120,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 1500,
      easing: "easeInOutQuart" as const,
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: true,
        position: legendPosition,
        labels: {
          color: "#ffffff",
          font: {
            size: 13,
            weight: "bold" as const,
            family: "'Inter', sans-serif",
          },
          padding: 15,
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
            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.y} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#cbd5e1",
          font: {
            size: 12,
          },
        },
        border: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#cbd5e1",
          font: {
            size: 12,
          },
          padding: 10,
        },
        border: {
          color: "rgba(148, 163, 184, 0.2)",
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default BarChart;
