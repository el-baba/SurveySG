"use client";

import { PersonaAnswer } from "@/store/filterStore";

const ETHNICITY_COLORS: Record<string, string> = {
  Chinese: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  Malay: "linear-gradient(135deg, #22c55e, #15803d)",
  Indian: "linear-gradient(135deg, #f97316, #c2410c)",
  Others: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function PersonaCard({ answer }: { answer: PersonaAnswer }) {
  const avatarBg = ETHNICITY_COLORS[answer.ethnicity] ?? ETHNICITY_COLORS.Others;
  const occupation =
    answer.occupation.length > 22
      ? answer.occupation.slice(0, 22) + "…"
      : answer.occupation;

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
          style={{ background: avatarBg }}
        >
          {getInitials(answer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 text-xs font-semibold truncate">{answer.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-slate-400 text-[10px]">
              {answer.age} · {answer.sex}
            </span>
            <span
              className="px-1.5 py-0 rounded-full text-[10px] font-medium"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#94a3b8",
              }}
            >
              {answer.ethnicity}
            </span>
            <span className="text-slate-500 text-[10px] truncate">{occupation}</span>
          </div>
        </div>
      </div>

      {/* Answer text */}
      <p className="text-slate-200 text-xs leading-relaxed">{answer.answer}</p>
    </div>
  );
}
