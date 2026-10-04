import Link from "next/link";
import {
  Zap,
  BarChart3,
  Bell,
  Wrench,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">PredictIQ</span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" />
        <div className="mx-auto max-w-6xl px-4 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 mb-6">
            <Zap className="h-3.5 w-3.5" /> AI-Powered Predictive Maintenance
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Stop Failures Before{" "}
            <span className="text-blue-600">They Happen</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            PredictIQ monitors your industrial equipment in real time, detects anomalies early,
            and tells you exactly which machine needs attention — before it breaks down.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
            >
              Open Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/machines"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-8 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              View Machines
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              { value: "8", label: "Machines Monitored" },
              { value: "94%", label: "Prediction Accuracy" },
              { value: "3×", label: "Fewer Breakdowns" },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-2xl font-bold text-blue-600">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-red-500 mb-3 block">
                The Problem
              </span>
              <h2 className="text-3xl font-bold mb-5">
                Unexpected Breakdowns Cost You Time &amp; Money
              </h2>
              <ul className="space-y-3">
                {[
                  "Unplanned downtime averages $250,000/hour in manufacturing",
                  "Reactive maintenance is 3–5× more expensive than preventive",
                  "Small facilities lack the team to monitor every machine manually",
                  "Failures rarely announce themselves — until it's too late",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-green-500 mb-3 block">
                The Solution
              </span>
              <h2 className="text-3xl font-bold mb-5">
                PredictIQ Sees Failure Coming Days in Advance
              </h2>
              <ul className="space-y-3">
                {[
                  "24/7 automated sensor monitoring — no manual checks needed",
                  "AI scores every machine's health score from 0 to 100",
                  "Alerts you days before a critical failure occurs",
                  "One-click AI explanations for every alert",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3 Key Features ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Everything You Need to Stay Ahead</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">
              Three core capabilities that turn raw sensor data into actionable maintenance intelligence.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
                title: "Real-Time Sensor Monitoring",
                description:
                  "Track temperature, vibration, and current for every machine. Sensor readings update every 5 seconds and trigger instant alerts when thresholds are crossed.",
              },
              {
                icon: TrendingDown,
                color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
                title: "AI Failure Prediction",
                description:
                  "Our prediction engine analyzes sensor trends and history to compute a risk score (0–100%) and estimate days to failure — with a clear reason and recommended fix.",
              },
              {
                icon: Bell,
                color: "bg-green-100 dark:bg-green-900/30 text-green-600",
                title: "Smart Alerts + AI Assistant",
                description:
                  "Receive severity-tiered alerts and ask the AI Assistant natural-language questions like 'Which machine is most likely to fail this week?' — powered by Gemini.",
              },
            ].map(({ icon: Icon, color, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-7 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-5 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3">Three steps from sensor to insight.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {[
              {
                step: "01",
                icon: BarChart3,
                title: "Ingest Sensor Data",
                description:
                  "PredictIQ continuously collects temperature, vibration, and current readings from all connected machines.",
              },
              {
                step: "02",
                icon: Clock,
                title: "Analyze & Score",
                description:
                  "The prediction engine compares readings against thresholds, detects trends, and computes a health score for each machine.",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "Act on Insights",
                description:
                  "Receive targeted alerts, schedule maintenance with one click, and ask the AI Assistant for guidance before failures occur.",
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold">
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 lg:px-8 text-center">
          <div className="rounded-2xl bg-blue-600 p-12 shadow-xl shadow-blue-200 dark:shadow-blue-900/30">
            <Wrench className="h-12 w-12 text-blue-200 mx-auto mb-5" />
            <h2 className="text-3xl font-bold text-white mb-3">
              Ready to Prevent Your Next Breakdown?
            </h2>
            <p className="text-blue-100 mb-8">
              Open the dashboard and see your machines' real-time health status right now.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Open Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="mx-auto max-w-6xl px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-bold">PredictIQ</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 PredictIQ. Built for small industrial facilities.
          </p>
        </div>
      </footer>
    </div>
  );
}
