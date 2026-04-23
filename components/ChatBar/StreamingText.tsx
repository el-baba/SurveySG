"use client";

export function StreamingText({ text, count }: { text: string; count: number }) {
  return (
    <div className="flex justify-start gap-3">
      <div
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
      >
        SG
      </div>
      <div className="max-w-[85%] text-sm leading-relaxed">
        {count > 0 && (
          <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-white/8 border border-white/10">
            {count} personas
          </span>
        )}
        <p className="text-slate-200 whitespace-pre-wrap">
          {text}
          <span className="inline-block w-1 h-3.5 ml-0.5 bg-blue-400 animate-pulse rounded-sm align-middle" />
        </p>
      </div>
    </div>
  );
}
