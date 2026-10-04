"use client";

import { useState } from "react";
import { BellOff, Filter } from "lucide-react";
import { alerts as initialAlerts } from "@/data/mockData";
import AlertItem from "@/components/AlertItem";
import AppShell from "@/components/AppShell";

type SeverityFilter = "all" | "critical" | "warning" | "info";
type StatusFilter = "all" | "active" | "resolved";

export default function AlertsPage() {
  const [alertList, setAlertList] = useState(initialAlerts);
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  function handleResolve(id: string) {
    setAlertList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  }

  const filtered = alertList.filter((a) => {
    const matchSeverity = severity === "all" || a.severity === severity;
    const matchStatus =
      status === "all" ||
      (status === "active" && !a.resolved) ||
      (status === "resolved" && a.resolved);
    return matchSeverity && matchStatus;
  });

  const counts = {
    total: alertList.length,
    active: alertList.filter((a) => !a.resolved).length,
    critical: alertList.filter((a) => a.severity === "critical" && !a.resolved).length,
    warning: alertList.filter((a) => a.severity === "warning" && !a.resolved).length,
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {counts.active} active alert{counts.active !== 1 ? "s" : ""}
            {counts.critical > 0 && (
              <span className="ml-2 font-semibold text-red-600">· {counts.critical} critical</span>
            )}
            {counts.warning > 0 && (
              <span className="ml-2 font-semibold text-amber-600">· {counts.warning} warning</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          {(["all", "critical", "warning", "info"] as SeverityFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                severity === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          {(["all", "active", "resolved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                status === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-20 text-slate-400">
              <BellOff className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No alerts match your filter</p>
              <p className="text-xs mt-1">Try changing the severity or status filter above.</p>
            </div>
          ) : (
            filtered.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onResolve={handleResolve} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
