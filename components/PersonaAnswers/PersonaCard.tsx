"use client";

import { useRef, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { PersonaAnswer, useFilterStore } from "@/store/filterStore";

import { getAvatarGradient, getInitials } from "@/lib/avatar";

export function PersonaCard({ answer }: { answer: PersonaAnswer }) {
  const dynamicBg = getAvatarGradient(answer.name);
  const setFocusedPersonaId = useFilterStore((s) => s.setFocusedPersonaId);
  const setSelectedPersonaId = useFilterStore((s) => s.setSelectedPersonaId);
  const selectedPersonaId = useFilterStore((s) => s.selectedPersonaId);
  const incrementResetView = useFilterStore((s) => s.incrementResetView);
  const isSelected = selectedPersonaId === answer.personaId;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      className="rounded-xl p-3 border transition-colors cursor-pointer hover:border-white/20 hover:bg-white/10"
      style={{
        background: isSelected ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.05)",
        borderColor: isSelected ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.08)",
      }}
      onClick={() => {
        if (isSelected) {
          setSelectedPersonaId(null);
          incrementResetView();
        } else {
          setFocusedPersonaId(answer.personaId);
          setSelectedPersonaId(answer.personaId);
        }
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
