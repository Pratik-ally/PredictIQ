import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMachines, upsertMachine, deleteMachine } from "@/lib/data";
import type { Machine } from "@/data/mockData";

const SensorReadingSchema = z.object({
  timestamp: z.string(),
  temperature: z.number(),
  vibration: z.number(),
  current: z.number(),
});

const MachineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  location: z.string().min(1),
  installedDate: z.string(),
  healthScore: z.number().min(0).max(100),
  status: z.enum(["healthy", "warning", "critical"]),
  // sensors are stored separately; allow empty array or omission
  sensors: z.array(SensorReadingSchema).optional().default([]),
  lastMaintenance: z.string(),
});

export async function GET() {
  try {
    const machines = await getMachines();
    return NextResponse.json(machines);
  } catch {
    return NextResponse.json({ error: "Failed to fetch machines" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = MachineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await upsertMachine(parsed.data as Machine);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save machine" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteMachine(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete machine" }, { status: 500 });
  }
}
