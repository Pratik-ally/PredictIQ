"use client";

import { useState, useRef, useEffect, type KeyboardEvent, type CSSProperties } from "react";
import { Send, Bot, User, Loader2, MessageSquareText } from "lucide-react";
import AppShell from "@/components/AppShell";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS = [
  "Which machine is most likely to fail this week?",
  "Summarize all critical alerts right now.",
  "What should I schedule for maintenance first?",
  "How can I improve the health of Conveyor Motor D?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Append a placeholder for the streaming assistant reply
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          res.status === 503
            ? text || "AI service unavailable. Check GEMINI_API_KEY."
            : text || `Request failed with status ${res.status}`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable.");
      const decoder = new TextDecoder();
      let accumulated = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1)); // remove empty assistant bubble
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px]">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Assistant</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ask anything about your machines, alerts, and maintenance priorities.
          </p>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <MessageSquareText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Ask me about your equipment
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  I have real-time access to all machine data, sensor readings, and alerts.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-left text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.role === "assistant"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-slate-100 dark:bg-slate-700"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                )}
              >
                {msg.content || (
                  streaming && i === messages.length - 1 ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Thinking…</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          ))}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-700 dark:text-red-400">
              <strong>Error:</strong> {error}
              {error.includes("GEMINI_API_KEY") && (
                <p className="mt-1 text-xs">
                  Add your key to <code>.env.local</code>: <code>GEMINI_API_KEY=AIza-…</code>
                </p>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="mt-3 flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your machines… (Enter to send, Shift+Enter for newline)"
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 min-h-[48px] max-h-32"
            style={{ fieldSizing: "content" } as CSSProperties}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {streaming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
