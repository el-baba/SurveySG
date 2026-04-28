"use client";

import { useEffect, useRef } from "react";
import { useFilterStore } from "@/store/filterStore";
import { getAvatarGradient, getInitials } from "@/lib/avatar";

export function PrivateChatBubbles() {
  const chatMode = useFilterStore((s) => s.chatMode);
  const persona = useFilterStore((s) => s.privateChatPersona);
  const messages = useFilterStore((s) => s.privateChatMessages);
  const streaming = useFilterStore((s) => s.streamingPersonaReply);
  const isLoading = useFilterStore((s) => s.isPrivateChatLoading);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  if (chatMode !== "persona" || (!messages.length && !isLoading)) return null;

  const avatarInitial = persona ? getInitials(persona.name) : "?";
  const avatarGradient = persona ? getAvatarGradient(persona.name) : "linear-gradient(135deg, #f97316, #fbbf24)";

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 flex flex-col gap-2"
      style={{ bottom: "148px" }}
    >
      {/* Fade mask: bubbles dissolve upward into the map */}
      <div
        className="relative flex flex-col gap-3 px-4 py-4 overflow-y-auto no-scrollbar"
        style={{
          maxHeight: "38vh",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 18%)",
        }}
      >
        {messages.map((msg, i) =>
          msg.role === "persona" ? (
            <div key={i} className="flex items-end gap-2.5">
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mb-0.5"
                style={{ background: avatarGradient, color: "#fff" }}
              >
                {avatarInitial}
              </div>
              <div
                className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                style={{
                  background: "rgba(40,35,25,0.9)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  color: "rgba(255,255,255,0.88)",
                  maxWidth: "78%",
                }}
              >
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div
                className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.22)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  color: "rgba(255,255,255,0.95)",
                  maxWidth: "78%",
                }}
              >
                {msg.content}
              </div>
            </div>
          )
        )}

        {/* Streaming in-progress bubble */}
        {(streaming || (isLoading && !streaming)) && (
          <div className="flex items-end gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mb-0.5"
              style={{ background: avatarGradient, color: "#fff" }}
            >
              {avatarInitial}
            </div>
            <div
              className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
              style={{
                background: "rgba(40,35,25,0.9)",
                border: "1px solid rgba(251,191,36,0.2)",
                color: "rgba(255,255,255,0.88)",
                maxWidth: "78%",
                minWidth: "48px",
              }}
            >
              {streaming || (
                <span className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
