import { cn } from "@/lib/utils";
import type { MachineStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: MachineStatus | "info" | "warning" | "critical";
  className?: string;
}

const config = {
  healthy: {
    label: "Healthy",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  info: {
    label: "Info",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  warning: {
    label: "Warning",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: colorClass } = config[status] ?? config.info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        colorClass,
        className
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-green-500": status === "healthy",
          "bg-blue-500": status === "info",
          "bg-amber-500": status === "warning",
          "bg-red-500": status === "critical",
        })}
      />
      {label}
    </span>
  );
}
