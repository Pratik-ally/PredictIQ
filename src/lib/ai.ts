/**
 * ai.ts – Gemini AI helper with rule-based fallback.
 *
 * Exports a single function: generateAIResponse(prompt, context)
 * Returns a ReadableStream so callers can stream the response to the client.
 * Falls back to a rule-based answer when GEMINI_API_KEY is absent or the
 * API call fails.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { machines } from "@/data/mockData";
import { predictFailure } from "@/lib/predict";

// ── Model constant – change here to switch models ────────────────────────────
export const GEMINI_MODEL = "gemini-2.0-flash";

// ── Rule-based fallback ───────────────────────────────────────────────────────

/**
 * Builds a plain-text answer using only local machine data.
 * Lists the top-3 machines by risk score and suggests inspections.
 */
function buildRuleBasedAnswer(): string {
  const ranked = machines
    .map((m) => ({ m, pred: predictFailure(m) }))
    .sort((a, b) => b.pred.riskPercent - a.pred.riskPercent)
    .slice(0, 3);

  const lines = ranked.map(({ m, pred }) => {
    const latest = m.sensors[m.sensors.length - 1];
    return (
      `• ${m.name} (${m.location}) — risk ${pred.riskPercent}%` +
      (pred.daysToFailure ? `, ~${pred.daysToFailure} day(s) to failure` : "") +
      `\n  Sensor: temp ${latest.temperature}°C, vib ${latest.vibration} mm/s, current ${latest.current} A` +
      `\n  Cause: ${pred.likelyCause}` +
      `\n  Action: ${pred.recommendedAction}`
    );
  });

  return (
    "⚠️ AI offline, showing rule-based answer\n\n" +
    "Top machines requiring attention:\n\n" +
    lines.join("\n\n")
  );
}

/** Wraps a plain string in a ReadableStream so callers get a uniform type. */
function stringToStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

// ── Main helper ───────────────────────────────────────────────────────────────

export interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * Calls the Gemini API and returns a streaming response.
 *
 * @param systemPrompt – the system / context preamble
 * @param messages     – conversation history (last item is the latest user message)
 *
 * On any failure (missing key, network error, API error) returns a
 * ReadableStream containing the rule-based fallback answer.
 */
export async function generateAIResponse(
  systemPrompt: string,
  messages: Message[]
): Promise<ReadableStream<Uint8Array>> {
  if (!process.env.GEMINI_API_KEY) {
    return stringToStream(buildRuleBasedAnswer());
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    // Build Gemini history (all turns except the last user message)
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch {
          controller.enqueue(
            encoder.encode("\n\n⚠️ AI offline, showing rule-based answer\n\n" + buildRuleBasedAnswer())
          );
        } finally {
          controller.close();
        }
      },
    });
  } catch {
    return stringToStream(buildRuleBasedAnswer());
  }
}
