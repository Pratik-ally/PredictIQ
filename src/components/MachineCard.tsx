import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { Machine } from "@/data/mockData";
import StatusBadge from "./StatusBadge";
import HealthGauge from "./HealthGauge";

interface MachineCardProps {
  machine: Machine;
}

export default function MachineCard({ machine }: MachineCardProps) {
  return (
    <Link
      href={`/machines/${machine.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {machine.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{machine.type}</p>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      {/* Gauge */}
      <div className="flex justify-center my-2">
        <HealthGauge score={machine.healthScore} size="md" />
      </div>

      {/* Meta */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{machine.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>Last service: {machine.lastMaintenance}</span>
        </div>
      </div>
    </Link>
  );
}
