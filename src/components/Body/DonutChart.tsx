import type { FC } from "react";

interface DonutChartProps {
  value: number; // 0-100
  label: string;
}

export const DonutChart: FC<DonutChartProps> = ({ value, label }) => {
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div style={{ paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0077b6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Roboto, sans-serif"
          fontSize="44"
          fill="#FFF"
          style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}
        >
          {value}%
        </text>
      </svg>
      <span
        style={{
          marginTop: -60,
          marginBottom: 46,
          fontFamily: "Roboto, sans-serif",
          color: "#9EADB8",
          fontSize: 10,
          fontWeight: 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}; 