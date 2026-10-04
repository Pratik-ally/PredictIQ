"use client";

import { useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { machines as initialMachines, generateReadings, type Machine, type MachineStatus } from "@/data/mockData";
import MachineCard from "@/components/MachineCard";
import AppShell from "@/components/AppShell";

function newId() {
  return "m" + Math.random().toString(36).slice(2, 7);
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    installedDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.type.trim()) e.type = "Type is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.installedDate) e.installedDate = "Install date is required";
    return e;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const machine: Machine = {
      id: newId(),
      name: form.name,
      type: form.type,
      location: form.location,
      installedDate: form.installedDate,
      healthScore: 90,
      status: "healthy" as MachineStatus,
      lastMaintenance: new Date().toISOString().slice(0, 10),
      sensors: generateReadings(68, 1.0, 12.0, 20, "stable"),
    };
    setMachines((prev) => [machine, ...prev]);
    setForm({ name: "", type: "", location: "", installedDate: "" });
    setErrors({});
    setShowForm(false);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Machines</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {machines.length} machine{machines.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Machine"}
          </button>
        </div>

        {/* Add machine form */}
        {showForm && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Register New Machine</h3>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Machine Name", placeholder: "e.g. Compressor Unit A" },
                { key: "type", label: "Machine Type", placeholder: "e.g. Air Compressor" },
                { key: "location", label: "Location", placeholder: "e.g. Plant Floor 1" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[key] && (
                    <p className="text-xs text-red-500 mt-1">{errors[key]}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Install Date
                </label>
                <input
                  type="date"
                  value={form.installedDate}
                  onChange={(e) => setForm((f) => ({ ...f, installedDate: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.installedDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.installedDate}</p>
                )}
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Machine
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Machine grid */}
        {machines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-600 py-20 text-slate-400">
            <p className="text-sm">No machines yet. Add your first machine above.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {machines.map((m) => (
              <MachineCard key={m.id} machine={m} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
