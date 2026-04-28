"use client";

import { useState, useCallback } from "react";
import { Send, X } from "lucide-react";
import { useFilterStore, ChatMessage } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";
import { getAvatarGradient, getInitials } from "@/lib/avatar";
import { useQuery } from "@tanstack/react-query";

export function ChatBar() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const filters = useFilterStore();
  const params = filtersToSearchParams(filters);
  const { data: sampledPersonas } = useQuery<{ id: string }[]>({
    queryKey: ["personas", "pins", params.toString()],
    queryFn: () => fetch(`/api/personas/sample?${params}`).then((r) => r.json()),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: [],
  });
  const {
    currentQuestion,
    isLoadingAnswers,
    personaAnswers,
    setCurrentQuestion,
    setShowAnswersPanel,
    setIsLoadingAnswers,
    appendPersonaAnswers,
    setSummaryText,
    setIsSummaryLoading,
    clearPersonaAnswers,

    chatMode,
    privateChatPersona,
    privateChatMessages,
    isPrivateChatLoading,
    endPrivateChat,
    appendPrivateChatMessage,
    setIsPrivateChatLoading,
    setStreamingPersonaReply,
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

    // Fire persona answers as a stream — append each batch as it arrives
    const answersPromise = (async () => {
      try {
        const res = await fetch("/api/personas/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, filterParams, n: Math.min(sampledPersonas?.length || 50, 50) }),
        });
        if (!res.ok || !res.body) throw new Error("failed");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const payload = line.slice(6);
            if (payload === "[DONE]") continue;
            try {
              const { answers } = JSON.parse(payload);
              if (answers?.length) appendPersonaAnswers(answers);
            } catch {}
          }
        }
      } catch {
        // ignore — panel stays with whatever arrived
      } finally {
        setIsLoadingAnswers(false);
      }
    })();

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
    setIsLoadingAnswers, appendPersonaAnswers, setSummaryText, setIsSummaryLoading,
  ]);

  const handlePersonaSubmit = useCallback(async () => {
    const q = input.trim();
    if (!q || isPrivateChatLoading || !privateChatPersona) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: q, timestamp: Date.now() };
    appendPrivateChatMessage(userMsg);
    setIsPrivateChatLoading(true);
    setStreamingPersonaReply("");

    const history = [...privateChatMessages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/personas/private-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: {
            name: privateChatPersona.name,
            age: privateChatPersona.age,
            sex: privateChatPersona.sex,
            planningArea: privateChatPersona.planningArea,
          },
          messages: history,
        }),
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
              setStreamingPersonaReply(full);
            }
          } catch {}
        }
      }

      setStreamingPersonaReply("");
      appendPrivateChatMessage({ role: "persona", content: full, timestamp: Date.now() });
    } catch {
      setStreamingPersonaReply("");
      appendPrivateChatMessage({
        role: "persona",
        content: "Aiyah, cannot connect lah. Try again?",
        timestamp: Date.now(),
      });
    } finally {
      setIsPrivateChatLoading(false);
    }
  }, [
    input, isPrivateChatLoading, privateChatPersona, privateChatMessages,
    appendPrivateChatMessage, setIsPrivateChatLoading, setStreamingPersonaReply,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatMode === "persona" ? handlePersonaSubmit() : handleSubmit();
    }
  };

  const answered = !isLoadingAnswers && personaAnswers.length > 0;
  const isPersonaMode = chatMode === "persona";
  const isDisabled = isPersonaMode ? isPrivateChatLoading : loading;

  const { data: personaProfile } = useQuery<{ occupation?: string; persona?: string }>({
    queryKey: ["persona-profile", privateChatPersona?.personaId],
    queryFn: () => fetch(`/api/personas/${privateChatPersona!.personaId}`).then((r) => r.json()),
    enabled: isPersonaMode && !!privateChatPersona?.personaId,
    staleTime: Infinity,
  });

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 flex flex-col gap-2">
      {/* Survey mode: current question status pill */}
      {!isPersonaMode && currentQuestion && (
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

      {/* Survey mode: quick prompts */}
      {!isPersonaMode && !currentQuestion && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            "💭 Biggest daily challenge?",
            "🏙️ Future of Singapore?",
            "🍜 SG vs MY laksa?",
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
                setTimeout(() => handleSubmit(), 0);
              }}
              className="px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span className="text-white/70 hover:text-white">{prompt}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex flex-col rounded-2xl transition-all duration-200 overflow-hidden"
        style={{
          background: "rgba(20,20,20,0.85)",
          border: isPersonaMode ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* Persona mode header */}
        {isPersonaMode && privateChatPersona && (
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: "rgba(251,191,36,0.2)" }}
          >
            <div className="flex items-start gap-2.5 flex-1 overflow-hidden">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                style={{ background: getAvatarGradient(privateChatPersona.name), color: "#fff" }}
              >
                {getInitials(privateChatPersona.name)}
              </div>
              <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <div className="flex items-center gap-2">
                  <span className="text-white/90 text-sm font-medium">{privateChatPersona.name}</span>
                  {personaProfile?.occupation && (
                    <span className="text-white/40 text-xs truncate">{personaProfile.occupation}</span>
                  )}
                </div>
                {personaProfile?.persona && (
                  <p
                    className="text-white/40 text-[11px] leading-tight mt-0.5"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      width: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    {personaProfile.persona.replace(/^[A-Z][a-zA-Z]*(?: [A-Z][a-zA-Z]*)?,\s*/, "")}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={endPrivateChat}
              className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0 ml-2"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 px-5 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPersonaMode ? `Message ${privateChatPersona?.name ?? "persona"}…` : "Survey Singapore…"}
            disabled={isDisabled}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30 disabled:opacity-50"
            onFocus={(e) => {
              const outer = e.target.closest(".flex.flex-col") as HTMLElement;
              if (outer) {
                outer.style.borderColor = isPersonaMode
                  ? "rgba(251,191,36,0.7)"
                  : "rgba(255,255,255,0.35)";
              }
            }}
            onBlur={(e) => {
              const outer = e.target.closest(".flex.flex-col") as HTMLElement;
              if (outer) {
                outer.style.borderColor = isPersonaMode
                  ? "rgba(251,191,36,0.35)"
                  : "rgba(255,255,255,0.12)";
              }
            }}
          />
          <button
            onClick={isPersonaMode ? handlePersonaSubmit : handleSubmit}
            disabled={isDisabled || !input.trim()}
            className="flex-shrink-0 px-3 h-9 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: isPersonaMode
                ? "linear-gradient(135deg, rgba(251,191,36,0.35), rgba(249,115,22,0.20))"
                : "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))",
              border: isPersonaMode ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
