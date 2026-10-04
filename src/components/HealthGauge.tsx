"use client";

import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: number; // 0–100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZE = { sm: 64, md: 96, lg: 128 };
const STROKE = { sm: 6, md: 8, lg: 10 };

function getColor(score: number) {
  if (score >= 70) return "#22c55e"; // green-500
  if (score >= 40) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

export default function HealthGauge({ score, size = "md", showLabel = true }: HealthGaugeProps) {
  const dim = SIZE[size];
  const stroke = STROKE[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270° arc (¾ circle) starting from bottom-left
  const arc = circumference * 0.75;
  const offset = arc - (Math.min(100, Math.max(0, score)) / 100) * arc;
  const color = getColor(score);

  // Rotate so arc starts at ~225° (bottom-left) and ends at ~-45° (bottom-right)
  const rotate = 135;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          style={{ transform: `rotate(${rotate}deg)` }}
        >
          {/* Track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circumference - arc}`}
            className="text-slate-200 dark:text-slate-700"
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${arc - offset} ${circumference - (arc - offset)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-bold tabular-nums leading-none",
              size === "sm" ? "text-sm" : size === "md" ? "text-xl" : "text-3xl"
            )}
            style={{ color }}
          >
            {score}
          </span>
          {size !== "sm" && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">/ 100</span>
          )}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Health Score
        </span>
      )}
    </div>
  );
}
