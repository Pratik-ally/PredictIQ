/**
 * data.ts – Unified data-access layer.
 *
 * Every exported function tries MongoDB first. If MONGODB_URI is missing or
 * the connection/query fails it falls back to the in-memory mock data so the
 * app always renders something useful.
 */
import { getDb } from "@/lib/mongodb";
import {
  machines as mockMachines,
  alerts as mockAlerts,
  maintenanceTasks as mockTasks,
  type Machine,
  type Alert,
  type MaintenanceTask,
  type SensorReading,
} from "@/data/mockData";

// ─── Source indicator ─────────────────────────────────────────────────────────

export type DataSource = "live" | "demo";

export async function getDataSource(): Promise<DataSource> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return "live";
  } catch {
    return "demo";
  }
}

// ─── Machines ─────────────────────────────────────────────────────────────────

export async function getMachines(): Promise<Machine[]> {
  try {
    const db = await getDb();
    const docs = await db.collection("machines").find({}).toArray();
    if (docs.length === 0) return mockMachines;
    // Strip MongoDB _id; sensors are stored separately in sensorReadings
    return docs.map(({ _id: _omit, ...rest }) => ({ sensors: [], ...rest } as Machine));
  } catch {
    return mockMachines;
  }
}

export async function getMachineById(id: string): Promise<Machine | null> {
  try {
    const db = await getDb();
    const doc = await db.collection("machines").findOne({ id });
    if (!doc) return null;
    const { _id: _omit, ...rest } = doc;
    return { sensors: [], ...rest } as Machine;
  } catch {
    return mockMachines.find((m) => m.id === id) ?? null;
  }
}

export async function upsertMachine(machine: Machine): Promise<void> {
  try {
    const db = await getDb();
    await db
      .collection("machines")
      .updateOne({ id: machine.id }, { $set: machine }, { upsert: true });
  } catch (err) {
    throw new Error(`upsertMachine failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteMachine(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.collection("machines").deleteOne({ id });
  } catch (err) {
    throw new Error(`deleteMachine failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Sensor readings ──────────────────────────────────────────────────────────

export interface SensorReadingDoc extends SensorReading {
  machineId: string;
}

export async function getReadings(machineId: string, limit = 20): Promise<SensorReadingDoc[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("sensorReadings")
      .find({ machineId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    return docs.map(({ _id: _omit, ...rest }) => rest as SensorReadingDoc);
  } catch {
    const m = mockMachines.find((m) => m.id === machineId);
    return (m?.sensors ?? []).map((s) => ({ ...s, machineId }));
  }
}

export async function insertReading(reading: SensorReadingDoc): Promise<void> {
  try {
    const db = await getDb();
    await db.collection("sensorReadings").insertOne({ ...reading });
  } catch {
    // Fire-and-forget: silently drop if DB is unavailable
  }
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("alerts")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    if (docs.length === 0) return mockAlerts;
    return docs.map(({ _id: _omit, ...rest }) => rest as Alert);
  } catch {
    return mockAlerts;
  }
}

export async function upsertAlert(alert: Alert): Promise<void> {
  try {
    const db = await getDb();
    await db
      .collection("alerts")
      .updateOne({ id: alert.id }, { $set: alert }, { upsert: true });
  } catch (err) {
    throw new Error(`upsertAlert failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function resolveAlert(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db
      .collection("alerts")
      .updateOne({ id }, { $set: { resolved: true } });
  } catch (err) {
    throw new Error(`resolveAlert failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Maintenance tasks ────────────────────────────────────────────────────────

export async function getMaintenanceTasks(): Promise<MaintenanceTask[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection("maintenanceTasks")
      .find({})
      .sort({ scheduledDate: 1 })
      .toArray();
    if (docs.length === 0) return mockTasks;
    return docs.map(({ _id: _omit, ...rest }) => rest as MaintenanceTask);
  } catch {
    return mockTasks;
  }
}

export async function upsertMaintenanceTask(task: MaintenanceTask): Promise<void> {
  try {
    const db = await getDb();
    await db
      .collection("maintenanceTasks")
      .updateOne({ id: task.id }, { $set: task }, { upsert: true });
  } catch (err) {
    throw new Error(`upsertMaintenanceTask failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteMaintenanceTask(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.collection("maintenanceTasks").deleteOne({ id });
  } catch (err) {
    throw new Error(`deleteMaintenanceTask failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
