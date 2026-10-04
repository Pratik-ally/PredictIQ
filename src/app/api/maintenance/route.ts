import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMaintenanceTasks, upsertMaintenanceTask, deleteMaintenanceTask } from "@/lib/data";

const TaskSchema = z.object({
  id: z.string().min(1),
  machineId: z.string(),
  machineName: z.string(),
  title: z.string().min(1),
  description: z.string(),
  scheduledDate: z.string(),
  status: z.enum(["pending", "in-progress", "completed"]),
  assignee: z.string(),
});

export async function GET() {
  try {
    const tasks = await getMaintenanceTasks();
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await upsertMaintenanceTask(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await deleteMaintenanceTask(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
