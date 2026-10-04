"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle2 } from "lucide-react";
import type { Alert } from "@/data/mockData";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AlertItemProps {
  alert: Alert;
  onResolve: (id: string) => void;
}

export default function AlertItem({ alert, onResolve }: AlertItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function explainAlert() {
    if (explanation) { setExpanded(true); return; }
    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Explain this industrial equipment alert in plain English and suggest a fix:\n"${alert.message}"\nMachine: ${alert.machineName}`,
            },
          ],
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed (${res.status})`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable.");
      const decoder = new TextDecoder();
      let text = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setExplanation(text);
      }
    } catch {
      setExplanation("Could not generate explanation. Please check your API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-slate-800 transition-all",
        alert.resolved
          ? "border-slate-200 dark:border-slate-700 opacity-60"
          : alert.severity === "critical"
          ? "border-red-200 dark:border-red-800"
          : alert.severity === "warning"
          ? "border-amber-200 dark:border-amber-800"
          : "border-blue-200 dark:border-blue-800"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Severity badge */}
        <StatusBadge status={alert.severity} className="mt-0.5 shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{alert.message}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">{alert.machineName}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!alert.resolved && (
            <button
              onClick={() => explainAlert()}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              title="Explain this alert"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Explain</span>
            </button>
          )}
          {!alert.resolved && (
            <button
              onClick={() => onResolve(alert.id)}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          )}
          {explanation && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Explanation panel */}
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
          {loading && !explanation ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Generating explanation…
            </div>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
