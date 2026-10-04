"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { SensorReading } from "@/data/mockData";
import { format } from "date-fns";

interface SensorChartProps {
  readings: SensorReading[];
  /** Which sensors to display */
  sensors?: ("temperature" | "vibration" | "current")[];
  height?: number;
}

const SENSOR_CONFIG = {
  temperature: { color: "#ef4444", label: "Temp (°C)", yAxisId: "left" },
  vibration: { color: "#f59e0b", label: "Vibration (mm/s)", yAxisId: "right" },
  current: { color: "#3b82f6", label: "Current (A)", yAxisId: "left" },
};

export default function SensorChart({
  readings,
  sensors = ["temperature", "vibration", "current"],
  height = 240,
}: SensorChartProps) {
  const data = readings.map((r) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    temperature: r.temperature,
    vibration: r.vibration,
    current: r.current,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-slate-500 dark:fill-slate-400"
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-slate-500 dark:fill-slate-400"
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          className="fill-slate-500 dark:fill-slate-400"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--tooltip-bg, #fff)",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        {sensors.map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={SENSOR_CONFIG[key].label}
            stroke={SENSOR_CONFIG[key].color}
            yAxisId={SENSOR_CONFIG[key].yAxisId}
            dot={false}
            strokeWidth={2}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
