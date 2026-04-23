"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";

export function PlanningAreaBordersLayer() {
  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "planning-areas"],
    queryFn: () => fetch("/api/boundaries/planning-areas").then((r) => r.json()),
    staleTime: Infinity,
  });

  if (!geojson) return null;

  return (
    <Source id="pa-borders" type="geojson" data={geojson}>
      <Layer
        id="pa-borders-outline"
        type="line"
        paint={{
          "line-color": "rgba(255, 255, 255, 0.55)",
          "line-width": 1.5,
        }}
      />
    </Source>
  );
}
