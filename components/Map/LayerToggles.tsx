"use client";

import { useFilterStore } from "@/store/filterStore";

export function LayerToggles() {
  const { showMRT, showHDB, showSchools, toggleMRT, toggleHDB, toggleSchools } =
    useFilterStore();

  const layers = [
    { label: "MRT / LRT", color: "#ef4444", active: showMRT, toggle: toggleMRT },
    { label: "HDB Prices", color: "#f97316", active: showHDB, toggle: toggleHDB },
    { label: "Schools", color: "#22c55e", active: showSchools, toggle: toggleSchools },
  ];

  return (
    <div
      className="absolute top-4 right-4 z-20 rounded-xl px-4 py-3 flex flex-col gap-2 text-sm"
      style={{
        background: "var(--glass-bg-heavy)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-1">Layers</p>
      {layers.map((layer) => (
        <label key={layer.label} className="flex items-center gap-3 cursor-pointer select-none">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: layer.color }}
          />
          <span className="text-slate-200">{layer.label}</span>
          <button
            role="switch"
            aria-checked={layer.active}
            onClick={layer.toggle}
            className={`ml-auto relative w-9 h-5 rounded-full transition-colors duration-200 ${
              layer.active ? "bg-blue-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                layer.active ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </label>
      ))}
    </div>
  );
}
