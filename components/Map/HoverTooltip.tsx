"use client";

import { HoveredFeature } from "./MapContainer";

export function HoverTooltip({ feature }: { feature: NonNullable<HoveredFeature> }) {
  return (
    <div
      className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg text-sm shadow-xl"
      style={{
        left: feature.x + 12,
        top: feature.y - 8,
        background: "rgba(15, 23, 42, 0.92)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        color: "#f1f5f9",
        backdropFilter: "blur(8px)",
      }}
    >
      <p className="font-semibold">{feature.name}</p>
      <p className="text-white/40 text-xs">{feature.personaCount} Voices</p>
    </div>
  );
}
