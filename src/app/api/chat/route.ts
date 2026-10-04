import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { machines, alerts } from "@/data/mockData";
import { predictFailure } from "@/lib/predict";
import { generateAIResponse } from "@/lib/ai";

export const runtime = "edge";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

// Build a short machine-context summary to include in every prompt
function buildContext(): string {
  const machineSummaries = machines
    .map((m) => {
      const pred = predictFailure(m);
      const latest = m.sensors[m.sensors.length - 1];
      return `- ${m.name} (${m.type}, ${m.location}): health ${m.healthScore}/100, status ${m.status}, risk ${pred.riskPercent}%, days-to-failure ${pred.daysToFailure ?? "N/A"}, temp ${latest.temperature}°C, vib ${latest.vibration} mm/s, current ${latest.current}A`;
    })
    .join("\n");

  const activeAlerts = alerts
    .filter((a) => !a.resolved)
    .map((a) => `- [${a.severity.toUpperCase()}] ${a.machineName}: ${a.message}`)
    .join("\n");

  return `
=== MACHINE STATUS ===
${machineSummaries}

=== ACTIVE ALERTS ===
${activeAlerts || "No active alerts"}
`.trim();
}

export async function POST(req: NextRequest) {
  // 1. Parse and validate request body
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return new NextResponse("Invalid JSON in request body.", { status: 400 });
  }

  const parsed = BodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return new NextResponse(
      `Bad request: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      { status: 400 }
    );
  }

  const { messages } = parsed.data;

  // 2. Build system prompt with live machine context
  const systemPrompt = `You are PredictIQ Assistant, an expert in industrial equipment maintenance and predictive analytics.
You have access to real-time machine data. Always be concise, practical, and action-oriented.
Keep responses under 200 words. Prioritize safety-critical issues.

${buildContext()}`;

  // 3. Stream from Gemini (falls back to rule-based answer automatically)
  const stream = await generateAIResponse(systemPrompt, messages);

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
