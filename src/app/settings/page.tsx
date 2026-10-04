"use client";

import { useState, useEffect } from "react";
import { Database, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import AppShell from "@/components/AppShell";

type SeedStatus = "idle" | "loading" | "success" | "error";

export default function SettingsPage() {
  const [seedStatus, setSeedStatus] = useState<SeedStatus>("idle");
  const [seedMessage, setSeedMessage] = useState("");
  const [dataSource, setDataSource] = useState<"live" | "demo" | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setDataSource(d.source))
      .catch(() => setDataSource("demo"));
  }, []);

  async function handleSeed() {
    setSeedStatus("loading");
    setSeedMessage("");
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (!res.ok) {
        setSeedStatus("error");
        setSeedMessage(data.error ?? "Seed failed");
      } else {
        setSeedStatus("success");
        const ins = data.inserted as Record<string, number>;
        const summary = Object.entries(ins)
          .map(([col, n]) => `${col}: +${n}`)
          .join(", ");
        setSeedMessage(data.message + (summary ? ` (${summary})` : ""));
        setDataSource("live");
      }
    } catch (err) {
      setSeedStatus("error");
      setSeedMessage("Network error – could not reach /api/seed");
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Database configuration and demo-data management.
          </p>
        </div>

        {/* Data source card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Data Source</h3>
            {dataSource === "live" && (
              <span className="ml-auto rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                Live DB
              </span>
            )}
            {dataSource === "demo" && (
              <span className="ml-auto rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                Demo Data
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {dataSource === "live"
              ? "Connected to MongoDB. All reads and writes go to your Atlas cluster."
              : "No MONGODB_URI detected. The app is running on in-memory mock data."}
          </p>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Seed Demo Data</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Inserts mock machines, sensor readings, alerts, and maintenance tasks into MongoDB.
              Collections that already contain data are left untouched.
            </p>
            <button
              onClick={handleSeed}
              disabled={seedStatus === "loading"}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {seedStatus === "loading" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {seedStatus === "loading" ? "Seeding…" : "Seed Demo Data"}
            </button>

            {seedStatus === "success" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-3">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">{seedMessage}</p>
              </div>
            )}
            {seedStatus === "error" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-3">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">{seedMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Environment info */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Required Environment Variables</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="pb-2 text-left font-medium text-slate-500 dark:text-slate-400">Variable</th>
                <th className="pb-2 text-left font-medium text-slate-500 dark:text-slate-400">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
              {[
                ["MONGODB_URI", "MongoDB Atlas connection string"],
                ["MONGODB_DB", "Database name (default: predictiq)"],
                ["GEMINI_API_KEY", "Google Gemini AI for the Assistant page"],
              ].map(([key, desc]) => (
                <tr key={key}>
                  <td className="py-2 font-mono text-xs">{key}</td>
                  <td className="py-2 text-xs">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
