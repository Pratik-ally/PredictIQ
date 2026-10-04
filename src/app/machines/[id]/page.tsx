"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Wrench,
  AlertTriangle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { machines as initialMachines, maintenanceTasks, type Machine } from "@/data/mockData";
import { predictFailure, type PredictionResult } from "@/lib/predict";
import SensorChart from "@/components/SensorChart";
import HealthGauge from "@/components/HealthGauge";
import StatusBadge from "@/components/StatusBadge";
import AppShell from "@/components/AppShell";
import { cn } from "@/lib/utils";

function tickMachine(m: Machine): Machine {
  const last = m.sensors[m.sensors.length - 1];
  const jitter = () => (Math.random() - 0.5) * 1.5;
  return {
    ...m,
    sensors: [
      ...m.sensors.slice(1),
      {
        timestamp: new Date().toISOString(),
        temperature: +(last.temperature + jitter()).toFixed(1),
        vibration: +(last.vibration + jitter() * 0.1).toFixed(2),
        current: +(last.current + jitter() * 0.2).toFixed(2),
      },
    ],
  };
}

interface Props {
  params: { id: string };
}

export default function MachineDetailPage({ params }: Props) {
  const router = useRouter();
  const base = initialMachines.find((m) => m.id === params.id);

  const [machine, setMachine] = useState<Machine | null>(base ?? null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(
    base ? predictFailure(base) : null
  );

  // Redirect to /machines if the id is not found
  useEffect(() => {
    if (!base) {
      router.replace("/machines");
    }
  }, [base, router]);

  // Live update every 5 s
  useEffect(() => {
    if (!base) return;
    const id = setInterval(() => {
      setMachine((m) => {
        if (!m) return m;
        const updated = tickMachine(m);
        setPrediction(predictFailure(updated));
        // Persist the latest reading (fire-and-forget)
        const latest = updated.sensors[updated.sensors.length - 1];
        fetch("/api/readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ machineId: m.id, ...latest }),
        }).catch(() => {/* ignore if DB is unavailable */});
        return updated;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [base]);

  if (!machine || !prediction) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Machine not found. Redirecting…
        </div>
      </AppShell>
    );
  }

  const latest = machine.sensors[machine.sensors.length - 1];
  const tasks = maintenanceTasks.filter((t) => t.machineId === params.id);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back + header */}
        <div>
          <Link
            href="/machines"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Machines
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{machine.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> {machine.location}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5" /> Installed {machine.installedDate}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Wrench className="h-3.5 w-3.5" /> Last service {machine.lastMaintenance}
                </span>
              </div>
            </div>
            <StatusBadge status={machine.status} className="text-sm px-3 py-1" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column: gauge + live readings + prediction */}
          <div className="space-y-5">
            {/* Health gauge */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col items-center">
              <HealthGauge score={machine.healthScore} size="lg" />
            </div>

            {/* Latest readings */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Latest Readings</h3>
              <div className="space-y-3">
                {[
                  { label: "Temperature", value: `${latest.temperature} °C`, warn: 80, crit: 95, v: latest.temperature },
                  { label: "Vibration", value: `${latest.vibration} mm/s`, warn: 2.5, crit: 4.5, v: latest.vibration },
                  { label: "Current", value: `${latest.current} A`, warn: 20, crit: 28, v: latest.current },
                ].map(({ label, value, warn, crit, v }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span
                        className={cn(
                          "font-semibold",
                          v >= crit ? "text-red-600" : v >= warn ? "text-amber-600" : "text-slate-900 dark:text-white"
                        )}
                      >
                        {value}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          v >= crit ? "bg-red-500" : v >= warn ? "bg-amber-500" : "bg-green-500"
                        )}
                        style={{ width: `${Math.min(100, (v / crit) * 100).toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Failure Prediction */}
            <div
              className={cn(
                "rounded-xl border p-5",
                prediction.riskPercent >= 70
                  ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
                  : prediction.riskPercent >= 40
                  ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
                  : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                {prediction.riskPercent >= 40 ? (
                  <AlertTriangle className={cn("h-5 w-5", prediction.riskPercent >= 70 ? "text-red-500" : "text-amber-500")} />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                )}
                <h3 className="font-semibold text-slate-900 dark:text-white">AI Failure Prediction</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Risk level</span>
                  <span
                    className={cn(
                      "font-bold",
                      prediction.riskPercent >= 70 ? "text-red-600" : prediction.riskPercent >= 40 ? "text-amber-600" : "text-green-600"
                    )}
                  >
                    {prediction.riskPercent}%
                  </span>
                </div>
                {prediction.daysToFailure && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Est. days to failure</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ~{prediction.daysToFailure} day{prediction.daysToFailure !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-0.5">Likely cause</p>
                  <p className="text-slate-800 dark:text-slate-200">{prediction.likelyCause}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-0.5">Recommended action</p>
                  <p className="text-slate-800 dark:text-slate-200">{prediction.recommendedAction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right columns: sensor chart + maintenance history */}
          <div className="lg:col-span-2 space-y-5">
            {/* Sensor trend chart */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Sensor Trends</h3>
                <span className="text-xs text-slate-400 dark:text-slate-500">Last 20 readings · updating live</span>
              </div>
              <SensorChart readings={machine.sensors} height={260} />
            </div>

            {/* Maintenance history */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Maintenance History</h3>
                <Link
                  href="/schedule"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5" /> Schedule Maintenance
                </Link>
              </div>
              {tasks.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No maintenance tasks recorded for this machine.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-700 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Calendar className="h-3 w-3" /> {task.scheduledDate}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                            <Clock className="h-3 w-3" /> {task.assignee}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          task.status === "completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        )}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
