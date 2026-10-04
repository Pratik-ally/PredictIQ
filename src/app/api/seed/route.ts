import { NextResponse } from "next/server";
import { type Document } from "mongodb";
import { getDb } from "@/lib/mongodb";
import {
  machines as mockMachines,
  alerts as mockAlerts,
  maintenanceTasks as mockTasks,
} from "@/data/mockData";

/**
 * GET /api/seed
 *
 * Inserts mock data into MongoDB only when each collection is empty.
 * Requires MONGODB_URI to be set. Should be called from the Settings page.
 */
export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      { error: "MONGODB_URI is not configured. Cannot seed." },
      { status: 503 }
    );
  }

  try {
    const db = await getDb();

    const results: Record<string, number> = {};

    // machines (strip the sensors array — readings stored separately)
    const machineCount = await db.collection("machines").countDocuments();
    if (machineCount === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const docs = mockMachines.map(({ sensors: _sensors, ...rest }) => rest as Document);
      await db.collection("machines").insertMany(docs);
      results.machines = docs.length;
    } else {
      results.machines = 0;
    }

    // sensorReadings (flatten sensors from each machine)
    const readingCount = await db.collection("sensorReadings").countDocuments();
    if (readingCount === 0) {
      const readings = mockMachines.flatMap((m) =>
        m.sensors.map((s) => ({ ...s, machineId: m.id }))
      );
      await db.collection("sensorReadings").insertMany(readings);
      results.sensorReadings = readings.length;
    } else {
      results.sensorReadings = 0;
    }

    // alerts
    const alertCount = await db.collection("alerts").countDocuments();
    if (alertCount === 0) {
      await db.collection("alerts").insertMany([...mockAlerts]);
      results.alerts = mockAlerts.length;
    } else {
      results.alerts = 0;
    }

    // maintenanceTasks
    const taskCount = await db.collection("maintenanceTasks").countDocuments();
    if (taskCount === 0) {
      await db.collection("maintenanceTasks").insertMany([...mockTasks]);
      results.maintenanceTasks = mockTasks.length;
    } else {
      results.maintenanceTasks = 0;
    }

    return NextResponse.json({
      ok: true,
      inserted: results,
      message: "Seed complete. Collections that already had data were skipped.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
