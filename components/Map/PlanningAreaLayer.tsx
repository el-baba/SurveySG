"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";

export function PlanningAreaLayer({ paCountMap }: { paCountMap: Map<string, number> }) {
  void paCountMap;

  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "planning-areas"],
    queryFn: () => fetch("/api/boundaries/planning-areas").then((r) => r.json()),
    staleTime: Infinity,
  });

  if (!geojson) return null;

  return (
    <Source id="planning-areas" type="geojson" data={geojson}>
      {/* Invisible fill — required for mouse hit-testing */}
      <Layer id="planning-area-fill" type="fill" paint={{ "fill-opacity": 0 }} />
      <Layer
        id="planning-area-outline"
        type="line"
        paint={{
          "line-color": "rgba(148, 163, 184, 0.4)",
          "line-width": 1,
        }}
      />
    </Source>
  );
}
