"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";

export function ChatBar() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const filters = useFilterStore();
  const {
    currentQuestion,
    isLoadingAnswers,
    personaAnswers,
    setCurrentQuestion,
    setShowAnswersPanel,
    setIsLoadingAnswers,
    setPersonaAnswers,
    setSummaryText,
    setIsSummaryLoading,
    clearPersonaAnswers,
  } = useFilterStore();

  const handleSubmit = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setLoading(true);

    clearPersonaAnswers();

    const filterParams = filtersToSearchParams(filters).toString();

    setCurrentQuestion(q);
    setShowAnswersPanel(true);
    setIsLoadingAnswers(true);
    setIsSummaryLoading(true);
    setSummaryText("");

    // Fire persona answers + aggregate stream in parallel
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
            if (parsed.type === "text") {
              full += parsed.text;
              setSummaryText(full);
            }
          } catch {}
        }
      }
    } catch {
      setSummaryText("Sorry, couldn't load the summary. Individual responses may still appear below.");
    } finally {
      setIsSummaryLoading(false);
      setLoading(false);
      await answersPromise;
    }
  }, [
    input, loading, filters,
    clearPersonaAnswers, setCurrentQuestion, setShowAnswersPanel,
    setIsLoadingAnswers, setPersonaAnswers, setSummaryText, setIsSummaryLoading,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const answered = !isLoadingAnswers && personaAnswers.length > 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 flex flex-col gap-2">
      {/* Current question status pill */}
      {currentQuestion && (
        <div className="flex items-center justify-center">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs max-w-md"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="text-white/50 truncate">&ldquo;{currentQuestion}&rdquo;</span>
            {answered ? (
              <span className="flex-shrink-0 text-white/40">{personaAnswers.length} answered</span>
            ) : (
              <span className="flex gap-0.5 flex-shrink-0">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl"
        style={{
          background: "var(--glass-bg-heavy)",
          border: "1px solid var(--glass-border)",
          borderTop: "1px solid var(--glass-border-highlight)",
          backdropFilter: "blur(24px)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the population a question…"
          disabled={loading}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30 disabled:opacity-50"
          onFocus={(e) => {
            (e.target.closest("div") as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
          }}
          onBlur={(e) => {
            (e.target.closest("div") as HTMLElement).style.borderColor = "var(--glass-border)";
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.20)",
          }}
        >
          <Send size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}
