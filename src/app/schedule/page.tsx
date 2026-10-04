"use client";

import { useState, type FormEvent } from "react";
import type { ReactNode } from "react";
import { Plus, X, Calendar, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { maintenanceTasks as initialTasks, machines, type MaintenanceTask } from "@/data/mockData";
import AppShell from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";

function newId() {
  return "t" + Math.random().toString(36).slice(2, 7);
}

const STATUS_STYLES: Record<MaintenanceTask["status"], string> = {
  pending: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_ICONS: Record<MaintenanceTask["status"], ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5" />,
  "in-progress": <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
};

export default function SchedulePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"upcoming" | "past" | "all">("upcoming");
  const [form, setForm] = useState({
    machineId: "",
    title: "",
    description: "",
    scheduledDate: "",
    assignee: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.machineId) e.machineId = "Select a machine";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.scheduledDate) e.scheduledDate = "Date is required";
    if (!form.assignee.trim()) e.assignee = "Assignee is required";
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const machine = machines.find((m) => m.id === form.machineId);
    const task: MaintenanceTask = {
      id: newId(),
      machineId: form.machineId,
      machineName: machine?.name ?? "Unknown",
      title: form.title,
      description: form.description,
      scheduledDate: form.scheduledDate,
      status: "pending",
      assignee: form.assignee,
    };
    setTasks((prev) => [task, ...prev].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)));
    setForm({ machineId: "", title: "", description: "", scheduledDate: "", assignee: "" });
    setErrors({});
    setShowForm(false);
  }

  function updateStatus(id: string, status: MaintenanceTask["status"]) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  const filtered = tasks.filter((t) => {
    const d = new Date(t.scheduledDate);
    if (view === "upcoming") return !isPast(d) || isToday(d);
    if (view === "past") return isPast(d) && !isToday(d);
    return true;
  });

  const upcomingCount = tasks.filter((t) => {
    const d = new Date(t.scheduledDate);
    return !isPast(d) || isToday(d);
  }).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Schedule</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {upcomingCount} upcoming task{upcomingCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Task"}
          </button>
        </div>

        {/* Add task form */}
        {showForm && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">New Maintenance Task</h3>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Machine</label>
                <select
                  value={form.machineId}
                  onChange={(e) => setForm((f) => ({ ...f, machineId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select machine…</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {errors.machineId && <p className="text-xs text-red-500 mt-1">{errors.machineId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Oil Change"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details about the task…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
                <input
                  type="text"
                  placeholder="Technician name"
                  value={form.assignee}
                  onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.assignee && <p className="text-xs text-red-500 mt-1">{errors.assignee}</p>}
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Schedule Task
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View toggle */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
          {(["upcoming", "past", "all"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                view === v
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-20 text-slate-400">
            <Calendar className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No tasks in this view</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => {
              const d = new Date(task.scheduledDate);
              const overdue = isPast(d) && !isToday(d) && task.status !== "completed";
              return (
                <div
                  key={task.id}
                  className={cn(
                    "rounded-xl border bg-white dark:bg-slate-800 p-4 transition-colors",
                    overdue
                      ? "border-red-200 dark:border-red-800"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                        {overdue && (
                          <span className="rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                            Overdue
                          </span>
                        )}
                        {isToday(d) && task.status !== "completed" && (
                          <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{task.machineName}</p>
                      {task.description && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {format(d, "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                          <Clock className="h-3 w-3" /> {task.assignee}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[task.status])}>
                        {STATUS_ICONS[task.status]}
                        {task.status}
                      </span>
                      {/* Status progression buttons */}
                      {task.status === "pending" && (
                        <button
                          onClick={() => updateStatus(task.id, "in-progress")}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {task.status === "in-progress" && (
                        <button
                          onClick={() => updateStatus(task.id, "completed")}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
