// ─── Types ────────────────────────────────────────────────────────────────────

export type MachineStatus = "healthy" | "warning" | "critical";

export interface SensorReading {
  timestamp: string; // ISO string
  temperature: number; // °C
  vibration: number; // mm/s
  current: number; // A
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  location: string;
  installedDate: string; // ISO date
  healthScore: number; // 0–100
  status: MachineStatus;
  sensors: SensorReading[]; // last 20 readings
  lastMaintenance: string; // ISO date
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: string; // ISO string
  resolved: boolean;
}

export interface MaintenanceTask {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  description: string;
  scheduledDate: string; // ISO date
  status: "pending" | "in-progress" | "completed";
  assignee: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a historical array of sensor readings spanning the last `count` × 5 minutes. */
export function generateReadings(
  baseTemp: number,
  baseVib: number,
  baseCurrent: number,
  count = 20,
  trending: "up" | "stable" | "down" = "stable"
): SensorReading[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const trendFactor = trending === "up" ? i * 0.15 : trending === "down" ? -i * 0.1 : 0;
    const jitter = () => (Math.random() - 0.5) * 2;
    return {
      timestamp: new Date(now - (count - 1 - i) * 5 * 60 * 1000).toISOString(),
      temperature: +(baseTemp + trendFactor + jitter()).toFixed(1),
      vibration: +(baseVib + trendFactor * 0.05 + jitter() * 0.2).toFixed(2),
      current: +(baseCurrent + trendFactor * 0.1 + jitter() * 0.3).toFixed(2),
    };
  });
}

// ─── Machines ─────────────────────────────────────────────────────────────────

export const machines: Machine[] = [
  {
    id: "m1",
    name: "Compressor Unit A",
    type: "Air Compressor",
    location: "Plant Floor 1",
    installedDate: "2019-03-15",
    healthScore: 88,
    status: "healthy",
    lastMaintenance: "2024-03-10",
    sensors: generateReadings(72, 1.2, 14.5, 20, "stable"),
  },
  {
    id: "m2",
    name: "Hydraulic Press B",
    type: "Hydraulic Press",
    location: "Plant Floor 2",
    installedDate: "2018-07-22",
    healthScore: 54,
    status: "warning",
    lastMaintenance: "2023-11-05",
    sensors: generateReadings(85, 3.1, 22.0, 20, "up"),
  },
  {
    id: "m3",
    name: "CNC Lathe C",
    type: "CNC Machine",
    location: "Machining Bay",
    installedDate: "2021-01-10",
    healthScore: 92,
    status: "healthy",
    lastMaintenance: "2024-05-20",
    sensors: generateReadings(65, 0.8, 11.2, 20, "stable"),
  },
  {
    id: "m4",
    name: "Conveyor Motor D",
    type: "Electric Motor",
    location: "Assembly Line",
    installedDate: "2017-11-30",
    healthScore: 21,
    status: "critical",
    lastMaintenance: "2023-06-18",
    sensors: generateReadings(102, 5.8, 31.0, 20, "up"),
  },
  {
    id: "m5",
    name: "Pump Station E",
    type: "Centrifugal Pump",
    location: "Utility Room",
    installedDate: "2020-08-14",
    healthScore: 76,
    status: "healthy",
    lastMaintenance: "2024-01-30",
    sensors: generateReadings(74, 1.5, 16.8, 20, "stable"),
  },
  {
    id: "m6",
    name: "Welding Robot F",
    type: "Industrial Robot",
    location: "Fabrication Bay",
    installedDate: "2022-04-05",
    healthScore: 63,
    status: "warning",
    lastMaintenance: "2024-02-14",
    sensors: generateReadings(78, 2.4, 19.5, 20, "up"),
  },
  {
    id: "m7",
    name: "Cooling Tower G",
    type: "Cooling System",
    location: "Roof Level",
    installedDate: "2016-06-01",
    healthScore: 45,
    status: "warning",
    lastMaintenance: "2023-09-22",
    sensors: generateReadings(88, 4.0, 25.5, 20, "up"),
  },
  {
    id: "m8",
    name: "Injection Molder H",
    type: "Injection Molding",
    location: "Plant Floor 3",
    installedDate: "2023-02-28",
    healthScore: 95,
    status: "healthy",
    lastMaintenance: "2024-06-01",
    sensors: generateReadings(68, 0.6, 12.0, 20, "stable"),
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const alerts: Alert[] = [
  {
    id: "a1",
    machineId: "m4",
    machineName: "Conveyor Motor D",
    severity: "critical",
    message: "Temperature exceeded critical threshold (102 °C). Immediate inspection required.",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: "a2",
    machineId: "m4",
    machineName: "Conveyor Motor D",
    severity: "critical",
    message: "Vibration level at 5.8 mm/s — bearing failure imminent.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: "a3",
    machineId: "m2",
    machineName: "Hydraulic Press B",
    severity: "warning",
    message: "Current draw rising trend detected over the past 2 hours.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: "a4",
    machineId: "m7",
    machineName: "Cooling Tower G",
    severity: "warning",
    message: "Temperature trending upward. Check coolant levels.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: "a5",
    machineId: "m6",
    machineName: "Welding Robot F",
    severity: "warning",
    message: "Vibration slightly above normal operating range.",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: "a6",
    machineId: "m1",
    machineName: "Compressor Unit A",
    severity: "info",
    message: "Scheduled preventive maintenance due in 7 days.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: "a7",
    machineId: "m3",
    machineName: "CNC Lathe C",
    severity: "info",
    message: "Lubrication check completed successfully.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: true,
  },
  {
    id: "a8",
    machineId: "m5",
    machineName: "Pump Station E",
    severity: "warning",
    message: "Minor pressure fluctuation detected — monitor closely.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: true,
  },
];

// ─── Maintenance Schedule ─────────────────────────────────────────────────────

export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: "t1",
    machineId: "m4",
    machineName: "Conveyor Motor D",
    title: "Bearing Replacement",
    description: "Replace worn bearings on main shaft. Critical priority.",
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "pending",
    assignee: "John Martinez",
  },
  {
    id: "t2",
    machineId: "m2",
    machineName: "Hydraulic Press B",
    title: "Hydraulic Fluid Change",
    description: "Full hydraulic fluid flush and replacement.",
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "pending",
    assignee: "Sarah Chen",
  },
  {
    id: "t3",
    machineId: "m7",
    machineName: "Cooling Tower G",
    title: "Coolant Level & Filter Check",
    description: "Inspect coolant levels and replace filters.",
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "pending",
    assignee: "Mike Thompson",
  },
  {
    id: "t4",
    machineId: "m1",
    machineName: "Compressor Unit A",
    title: "Preventive Maintenance",
    description: "Routine PM: oil change, belt inspection, air filter replacement.",
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "pending",
    assignee: "John Martinez",
  },
  {
    id: "t5",
    machineId: "m6",
    machineName: "Welding Robot F",
    title: "Joint Calibration",
    description: "Recalibrate robot arm joints and check servo motors.",
    scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "pending",
    assignee: "Sarah Chen",
  },
  {
    id: "t6",
    machineId: "m3",
    machineName: "CNC Lathe C",
    title: "Lubrication Service",
    description: "Full lubrication of all moving parts and spindle check.",
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "completed",
    assignee: "Mike Thompson",
  },
  {
    id: "t7",
    machineId: "m5",
    machineName: "Pump Station E",
    title: "Seal Inspection",
    description: "Inspect pump seals and gaskets for wear.",
    scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "completed",
    assignee: "John Martinez",
  },
  {
    id: "t8",
    machineId: "m8",
    machineName: "Injection Molder H",
    title: "Mold Cleaning",
    description: "Deep clean molds and inspect ejector pins.",
    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: "in-progress",
    assignee: "Sarah Chen",
  },
];
