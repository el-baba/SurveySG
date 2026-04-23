"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { StatsPanel } from "@/components/StatsPanel/StatsPanel";
import { PersonaAnswersPanel } from "@/components/PersonaAnswers/PersonaAnswersPanel";

type Tab = "stats" | "voices";

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const {
    subzone,
    planningArea,
    setSubzone,
    setPlanningArea,
    showAnswersPanel,
    personaAnswers,
    clearPersonaAnswers,
  } = useFilterStore();

  const selectedArea = subzone ?? planningArea;
  const isVisible = !!selectedArea || showAnswersPanel;

  // Auto-switch to voices tab when answers panel activates
  useEffect(() => {
    if (showAnswersPanel) setActiveTab("voices");
  }, [showAnswersPanel]);

  if (!isVisible) return null;

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
        maxHeight: "calc(100vh - 2rem)",
      }}
    >
      {/* Panel header with area name + close */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div>
          <p className="font-semibold text-white/90 text-sm">
            {selectedArea ?? "Voices"}
          </p>
        </div>
        <button
          onClick={() => {
            setSubzone(null);
            setPlanningArea(null);
            clearPersonaAnswers();
          }}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex px-4 pt-2 pb-0 gap-1 flex-shrink-0">
        <TabButton
          active={activeTab === "stats"}
          onClick={() => setActiveTab("stats")}
          disabled={!selectedArea}
        >
          Stats
        </TabButton>
        <TabButton
          active={activeTab === "voices"}
          onClick={() => setActiveTab("voices")}
        >
          Voices{voicesCount > 0 ? ` (${voicesCount})` : ""}
        </TabButton>
      </div>

    {/* Tab content */}
    <div className="flex-1 overflow-y-auto mask-fade custom-scrollbar min-h-0 pt-6">
      {activeTab === "stats" && <StatsPanel />}
      {activeTab === "voices" && <PersonaAnswersPanel />}
    </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-white/10 text-white border border-white/15"
          : "text-white/40 hover:text-white/70 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
