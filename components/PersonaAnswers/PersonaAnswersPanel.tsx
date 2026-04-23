"use client";

import { useFilterStore } from "@/store/filterStore";
import { PersonaCard } from "./PersonaCard";

function SkeletonCard() {
  return (
    <div className="rounded-xl p-3 border border-white/8 animate-pulse">
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-full bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/3 bg-white/10 rounded" />
          <div className="h-2.5 w-1/2 bg-white/8 rounded" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-white/8 rounded" />
        <div className="h-2.5 w-5/6 bg-white/8 rounded" />
        <div className="h-2.5 w-4/6 bg-white/8 rounded" />
      </div>
    </div>
  );
}

export function PersonaAnswersPanel() {
  const { personaAnswers, isLoadingAnswers, currentQuestion, clearPersonaAnswers } =
    useFilterStore();

  const questionDisplay =
    currentQuestion.length > 60
      ? currentQuestion.slice(0, 60) + "…"
      : currentQuestion;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
        {currentQuestion && (
          <p className="text-slate-200 text-xs font-medium leading-relaxed">
            &ldquo;{questionDisplay}&rdquo;
          </p>
        )}
        <p className="text-slate-500 text-[10px] mt-0.5">
          {isLoadingAnswers
            ? "Getting individual responses…"
            : `${personaAnswers.length} persona${personaAnswers.length !== 1 ? "s" : ""} answered`}
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {isLoadingAnswers ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : personaAnswers.length > 0 ? (
          personaAnswers.map((a) => <PersonaCard key={a.personaId} answer={a} />)
        ) : (
          <div className="flex items-center justify-center h-20">
            <p className="text-slate-500 text-xs text-center">
              No responses yet. Ask a question to hear from individual personas.
            </p>
          </div>
        )}
      </div>

      {/* Clear button */}
      {!isLoadingAnswers && personaAnswers.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={clearPersonaAnswers}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear responses
          </button>
        </div>
      )}
    </div>
  );
}
