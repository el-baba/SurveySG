"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PersonaAnswer } from "@/store/filterStore";

const AVATAR_COLORS = [
  "linear-gradient(135deg, #3b82f6, #2dd4bf)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #d946ef)",
  "linear-gradient(135deg, #10b981, #3b82f6)",
  "linear-gradient(135deg, #6366f1, #a855f7)",
];

function getAvatarGradient(name: string) {
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}


function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PersonaCard({ answer }: { answer: PersonaAnswer }) {
  const dynamicBg = getAvatarGradient(answer.name);
  return (
    <div
      className="rounded-xl p-3 border transition-colors"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Top row: avatar + name + demographics */}
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: dynamicBg }}
        >
          {getInitials(answer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{answer.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-white/25 text-[10px]">
              {answer.age} · {answer.sex}
            </span>
            <span className="text-white/25 text-[10px] truncate">{answer.planningArea}</span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-1">
          {answer.sentiment === "positive" ? (
            <ThumbsUp size={14} className="text-green-400" />
          ) : (
            <ThumbsDown size={14} className="text-red-400" />
          )}
        </div>
      </div>

      {/* Answer text */}
      <p className="text-white/70 text-xs leading-relaxed">{answer.answer}</p>
    </div>
  );
}
