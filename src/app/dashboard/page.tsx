"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Search,
  ArrowRight,
} from "lucide-react";
import { machines as initialMachines, alerts, type Machine } from "@/data/mockData";
import { predictFailure } from "@/lib/predict";
import StatusBadge from "@/components/StatusBadge";
import SensorChart from "@/components/SensorChart";
import AlertItem from "@/components/AlertItem";
import AppShell from "@/components/AppShell";
import { cn } from "@/lib/utils";

// Simulate a live sensor tick by nudging the last reading
function tickSensors(machines: Machine[]): Machine[] {
  return machines.map((m) => {
    const last = m.sensors[m.sensors.length - 1];
    const jitter = () => (Math.random() - 0.5) * 1.5;
    const newReading = {
      timestamp: new Date().toISOString(),
      temperature: +(last.temperature + jitter()).toFixed(1),
      vibration: +(last.vibration + jitter() * 0.1).toFixed(2),
      current: +(last.current + jitter() * 0.2).toFixed(2),
    };
    // Optionally persist to MongoDB via API (fire-and-forget)
    fetch("/api/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ machineId: m.id, ...newReading }),
    }).catch(() => {/* ignore if DB is unavailable */});
    return { ...m, sensors: [...m.sensors.slice(1), newReading] };
  });
}

export default function DashboardPage() {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "healthy" | "warning" | "critical">("all");
  const [alertList, setAlertList] = useState(alerts);

  // Live sensor updates every 5 seconds
  useEffect(() => {
    const id = setInterval(() => setMachines((m) => tickSensors(m)), 5000);
    return () => clearInterval(id);
  }, []);

  const handleResolve = useCallback((id: string) => {
    setAlertList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  }, []);

  const healthy = machines.filter((m) => m.status === "healthy").length;
  const warning = machines.filter((m) => m.status === "warning").length;
  const critical = machines.filter((m) => m.status === "critical").length;
  const predictedFailures = machines.filter((m) => {
    const r = predictFailure(m);
    return r.daysToFailure !== null && r.daysToFailure <= 7;
  }).length;

  const filtered = machines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pick a featured machine for the live chart (worst health)
  const featuredMachine = [...machines].sort((a, b) => a.healthScore - b.healthScore)[0];

  const unresolvedAlerts = alertList.filter((a) => !a.resolved).slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time overview of all monitored equipment.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Machines", value: machines.length, icon: Cpu, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Healthy", value: healthy, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Warning", value: warning, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Critical", value: critical, icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Predicted Failures (7d)", value: predictedFailures, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
            >
              <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg mb-3", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Live sensor chart */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Live Sensors – {featuredMachine.name}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Updating every 5 s &middot; last 20 readings
              </p>
            </div>
            <StatusBadge status={featuredMachine.status} />
          </div>
          <SensorChart readings={featuredMachine.sensors} height={220} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Machine table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Machine Health</h3>
              <Link href="/machines" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {/* Search + filter */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search machines…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-2 text-left font-medium text-slate-500 dark:text-slate-400">Machine</th>
                    <th className="pb-2 text-left font-medium text-slate-500 dark:text-slate-400">Status</th>
                    <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 text-sm">
                        No machines match your filter.
                      </td>
                    </tr>
                  )}
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-2.5">
                        <Link href={`/machines/${m.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium text-slate-900 dark:text-white">
                          {m.name}
                        </Link>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{m.location}</p>
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "font-bold tabular-nums",
                            m.healthScore >= 70 ? "text-green-600" : m.healthScore >= 40 ? "text-amber-600" : "text-red-600"
                          )}
                        >
                          {m.healthScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent alerts */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Alerts</h3>
              <Link href="/alerts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {unresolvedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <CheckCircle2 className="h-8 w-8 mb-2 text-green-400" />
                  <p className="text-sm">All clear — no active alerts</p>
                </div>
              ) : (
                unresolvedAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} onResolve={handleResolve} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
