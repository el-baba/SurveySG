"use client";

import { useState, useRef, useCallback } from "react";
import { MessageCircle, ChevronDown, Send } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";
import { ChatBubble, Message } from "./ChatBubble";
import { StreamingText } from "./StreamingText";

export function ChatBar() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingCount, setStreamingCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const filters = useFilterStore();
  const {
    setCurrentQuestion,
    setShowAnswersPanel,
    setIsLoadingAnswers,
    setPersonaAnswers,
  } = useFilterStore();

  const handleSubmit = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setLoading(true);
    setStreamingText("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);

    const filterParams = filtersToSearchParams(filters).toString();

    // Trigger persona answers panel immediately
    setCurrentQuestion(q);
    setShowAnswersPanel(true);
    setIsLoadingAnswers(true);

    // Fire aggregate stream + persona answers fetch in parallel
    const answersPromise = fetch("/api/personas/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, filterParams, n: 8 }),
    })
      .then((r) => r.json())
      .then(({ answers }) => {
        setPersonaAnswers(answers ?? []);
        setIsLoadingAnswers(false);
      })
      .catch(() => setIsLoadingAnswers(false));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, filterParams }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === "meta") setStreamingCount(parsed.count);
            if (parsed.type === "text") {
              full += parsed.text;
              setStreamingText(full);
            }
          } catch {}
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: full, personaCount: streamingCount },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again.", error: true },
      ]);
    } finally {
      setLoading(false);
      setStreamingText("");
      await answersPromise;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 50);
    }
  }, [
    input, loading, filters, streamingCount,
    setCurrentQuestion, setShowAnswersPanel, setIsLoadingAnswers, setPersonaAnswers,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl">
      {/* Toggle button (collapsed state) */}
      {!open && (
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
            style={{
              background: "var(--glass-bg-heavy)",
              border: "1px solid var(--glass-border)",
              borderTop: "1px solid var(--glass-border-highlight)",
              backdropFilter: "blur(20px)",
              boxShadow: "var(--glass-shadow)",
              color: "#f1f5f9",
            }}
          >
            <MessageCircle size={15} className="text-blue-400" />
            Ask the population…
          </button>
        </div>
      )}

      {/* Expanded chat */}
      {open && (
        <div
          className="rounded-t-2xl overflow-hidden flex flex-col"
          style={{
            background: "var(--glass-bg-heavy)",
            border: "1px solid var(--glass-border)",
            borderTop: "1px solid var(--glass-border-highlight)",
            borderBottom: "none",
            backdropFilter: "blur(20px)",
            boxShadow: "var(--glass-shadow)",
            maxHeight: "50vh",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <MessageCircle size={15} className="text-blue-400" />
              Ask the Population
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0"
            style={{ maxHeight: "30vh" }}
          >
            {messages.length === 0 && (
              <p className="text-slate-600 text-xs text-center py-4">
                Ask anything about the filtered population — e.g. &quot;What are their commuting habits?&quot;
              </p>
            )}
            {messages.map((m, i) => (
              <ChatBubble key={i} message={m} />
            ))}
            {loading && streamingText && (
              <StreamingText text={streamingText} count={streamingCount} />
            )}
            {loading && !streamingText && (
              <div className="flex gap-1 justify-start pl-9">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/10 flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the population a question…"
              disabled={loading}
              className="flex-1 text-slate-200 text-sm rounded-full px-4 py-2 outline-none transition-colors placeholder:text-slate-500 disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
