"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { PersonaAnswersPanel } from "@/components/PersonaAnswers/PersonaAnswersPanel";

export function RightPanel() {
  const [isMinimized, setIsMinimized] = useState(true);
  const {
    subzone,
    planningArea,
    showAnswersPanel,
    personaAnswers,
    selectedPersonaId,
  } = useFilterStore();

  const selectedArea = subzone ?? planningArea;

  // Auto-expand when an area is selected on the map
  useEffect(() => {
    if (selectedArea) setIsMinimized(false);
  }, [selectedArea]);

  // Auto-expand when persona replies arrive
  useEffect(() => {
    if (showAnswersPanel || personaAnswers.length > 0) setIsMinimized(false);
  }, [showAnswersPanel, personaAnswers.length]);

  // Auto-expand when a persona pin is selected on the map
  useEffect(() => {
    if (selectedPersonaId) setIsMinimized(false);
  }, [selectedPersonaId]);

  const voicesCount = personaAnswers.length;

  return (
    <div
      className="absolute top-4 right-16 z-20 w-80 rounded-2xl overflow-hidden text-sm flex flex-col"
      style={{
        background: "var(--glass-bg-heavy)",
        border: "1px solid var(--glass-border)",
        borderTop: "1px solid var(--glass-border-highlight)",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--glass-shadow)",
        maxHeight: isMinimized ? undefined : "calc(100vh - 2rem)",
      }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div>
          <p className="font-semibold text-white/90 text-sm">
            {selectedArea ?? "Voices"}
          </p>
          {isMinimized && (
            <p className="text-[11px] text-white/30 mt-0.5">
              {voicesCount > 0 ? `${voicesCount} response${voicesCount !== 1 ? "s" : ""}` : "No responses yet"}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsMinimized((m) => !m)}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {!isMinimized && (
        <div className="flex-1 overflow-y-auto mask-fade custom-scrollbar min-h-0 pt-2">
          <PersonaAnswersPanel />
        </div>
      )}
    </div>
  );
}
