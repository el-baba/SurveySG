"use client";

import { PersonaAnswer } from "@/store/filterStore";

const AVATAR_BG = "linear-gradient(135deg, #3b82f6, #6d28d9)";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PersonaCard({ answer }: { answer: PersonaAnswer }) {
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
          style={{ background: AVATAR_BG }}
        >
          {getInitials(answer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/90 text-xs font-semibold truncate">{answer.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-white/40 text-[10px]">
              {answer.age} · {answer.sex}
            </span>
            <span className="text-white/30 text-[10px] truncate">{answer.planningArea}</span>
          </div>
        </div>
      </div>

      {/* Answer text */}
      <p className="text-white/70 text-xs leading-relaxed">{answer.answer}</p>
    </div>
  );
}
