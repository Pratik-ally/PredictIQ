/**
 * predict.ts – Lightweight failure-prediction engine.
 *
 * Strategy: rule-based threshold scoring + short-window trend analysis.
 * To swap in a real ML model, replace the body of `predictFailure()` with
 * an API call and return the same `PredictionResult` shape.
 */

import type { Machine, SensorReading } from "@/data/mockData";

// ─── Sensor thresholds (tunable per machine type) ─────────────────────────────

interface Thresholds {
  temp: { warning: number; critical: number };
  vibration: { warning: number; critical: number };
  current: { warning: number; critical: number };
}

const DEFAULT_THRESHOLDS: Thresholds = {
  temp: { warning: 80, critical: 95 },
  vibration: { warning: 2.5, critical: 4.5 },
  current: { warning: 20, critical: 28 },
};

// ─── Result type ──────────────────────────────────────────────────────────────

export interface PredictionResult {
  /** 0–100: overall failure risk percentage */
  riskPercent: number;
  /** Estimated days until failure; null if risk is low */
  daysToFailure: number | null;
  /** Human-readable most likely failure cause */
  likelyCause: string;
  /** Short recommended action */
  recommendedAction: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Computes a 0-1 score for a single sensor value against its thresholds.
 * Linearly interpolates between normal→warning (0→0.5) and warning→critical (0.5→1).
 */
function scoreSensor(value: number, warn: number, crit: number): number {
  if (value <= warn) return 0;
  if (value >= crit) return 1;
  return 0.5 + ((value - warn) / (crit - warn)) * 0.5;
}

/**
 * Calculates the linear regression slope of an array of numbers.
 * A positive slope means the value is trending upward over time.
 */
function trendSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Predict failure risk for a machine based on its recent sensor readings.
 *
 * Scoring breakdown:
 *  40% – current sensor values vs thresholds
 *  30% – upward trend in sensor readings (last 20 samples)
 *  20% – machine health score (inverse)
 *  10% – age of last maintenance
 *
 * ── SWAP POINT ──
 * Replace this function body with:
 *   const result = await fetch("https://your-ml-api/predict", { body: JSON.stringify(machine) })
 *   return await result.json() as PredictionResult
 */
export function predictFailure(machine: Machine): PredictionResult {
  const readings = machine.sensors;
  const latest: SensorReading = readings[readings.length - 1];
  const thr = DEFAULT_THRESHOLDS;

  // ── 1. Current value scores (0–1 each) ──────────────────────────────────────
  const tempScore = scoreSensor(latest.temperature, thr.temp.warning, thr.temp.critical);
  const vibScore = scoreSensor(latest.vibration, thr.vibration.warning, thr.vibration.critical);
  const currScore = scoreSensor(latest.current, thr.current.warning, thr.current.critical);
  const currentScore = (tempScore + vibScore + currScore) / 3; // 0–1

  // ── 2. Trend score (positive slope = higher risk) ────────────────────────────
  const temps = readings.map((r) => r.temperature);
  const vibs = readings.map((r) => r.vibration);
  const currents = readings.map((r) => r.current);
  const tempTrend = Math.max(0, Math.min(1, trendSlope(temps) / 0.5));
  const vibTrend = Math.max(0, Math.min(1, trendSlope(vibs) / 0.1));
  const currTrend = Math.max(0, Math.min(1, trendSlope(currents) / 0.3));
  const trendScore = (tempTrend + vibTrend + currTrend) / 3; // 0–1

  // ── 3. Health score (inverted) ───────────────────────────────────────────────
  const healthScore = (100 - machine.healthScore) / 100; // 0–1

  // ── 4. Maintenance staleness ─────────────────────────────────────────────────
  const daysSinceMaint =
    (Date.now() - new Date(machine.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24);
  const maintScore = Math.min(1, daysSinceMaint / 365); // 0–1; 1yr = max risk

  // ── 5. Weighted aggregate ────────────────────────────────────────────────────
  const raw = currentScore * 0.4 + trendScore * 0.3 + healthScore * 0.2 + maintScore * 0.1;
  const riskPercent = Math.round(Math.min(100, raw * 100));

  // ── 6. Estimated days to failure (rough heuristic) ───────────────────────────
  let daysToFailure: number | null = null;
  if (riskPercent >= 30) {
    // Linear model: 30% risk → ~30 days, 100% risk → ~1 day
    daysToFailure = Math.max(1, Math.round(30 - (riskPercent - 30) * (29 / 70)));
  }

  // ── 7. Likely cause & recommendation ─────────────────────────────────────────
  const scores = [
    { sensor: "temperature", score: tempScore + tempTrend, reading: latest.temperature },
    { sensor: "vibration", score: vibScore + vibTrend, reading: latest.vibration },
    { sensor: "current", score: currScore + currTrend, reading: latest.current },
  ].sort((a, b) => b.score - a.score);

  const topSensor = scores[0].sensor;
  const causeMap: Record<string, string> = {
    temperature: "Overheating – possible coolant loss, blocked vents, or bearing friction",
    vibration: "Mechanical imbalance or bearing wear causing excessive vibration",
    current: "Electrical overload – possible insulation breakdown or motor winding fault",
  };
  const actionMap: Record<string, string> = {
    temperature: "Check cooling system, clean air filters, inspect bearings for lubrication",
    vibration: "Inspect and replace worn bearings; check shaft alignment and balance",
    current: "Measure insulation resistance; inspect motor windings and electrical connections",
  };

  return {
    riskPercent,
    daysToFailure,
    likelyCause: riskPercent < 20 ? "No significant anomaly detected" : causeMap[topSensor],
    recommendedAction:
      riskPercent < 20 ? "Continue normal monitoring" : actionMap[topSensor],
  };
}
