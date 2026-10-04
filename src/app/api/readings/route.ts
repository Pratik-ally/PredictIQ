import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getReadings, insertReading } from "@/lib/data";

const ReadingSchema = z.object({
  machineId: z.string().min(1),
  timestamp: z.string(),
  temperature: z.number(),
  vibration: z.number(),
  current: z.number(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const machineId = searchParams.get("machineId");
    if (!machineId) {
      return NextResponse.json({ error: "machineId is required" }, { status: 400 });
    }
    const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 20 : Math.min(rawLimit, 200);
    const readings = await getReadings(machineId, limit);
    return NextResponse.json(readings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReadingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await insertReading(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save reading" }, { status: 500 });
  }
}
