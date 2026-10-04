"use client";

import { Menu, Sun, Moon, Database } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title = "PredictIQ" }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dataSource, setDataSource] = useState<"live" | "demo" | null>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setDataSource(d.source))
      .catch(() => setDataSource("demo"));
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 lg:px-6">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-900 dark:text-white lg:hidden">
          {title}
        </h1>
      </div>

      {/* Right: DB badge + theme toggle */}
      <div className="flex items-center gap-2 ml-auto">
        {mounted && dataSource && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              dataSource === "live"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            }`}
          >
            <Database className="h-3 w-3" />
            {dataSource === "live" ? "Live DB" : "Demo Data"}
          </span>
        )}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
