import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAlerts, upsertAlert, resolveAlert } from "@/lib/data";

const AlertSchema = z.object({
  id: z.string().min(1),
  machineId: z.string(),
  machineName: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
  message: z.string().min(1),
  timestamp: z.string(),
  resolved: z.boolean(),
});

export async function GET() {
  try {
    const alerts = await getAlerts();
    return NextResponse.json(alerts);
  } catch {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await upsertAlert(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save alert" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await resolveAlert(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to resolve alert" }, { status: 500 });
  }
}
