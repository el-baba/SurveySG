"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/filterStore";

export function SentimentLayer() {
  const personaAnswers = useFilterStore((s) => s.personaAnswers);

  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "planning-areas"],
    queryFn: () => fetch("/api/boundaries/planning-areas").then((r) => r.json()),
    staleTime: Infinity,
  });

  const sentimentMap = useMemo(() => {
    const map = new Map<string, { pos: number; neg: number }>();
    for (const a of personaAnswers) {
      const key = a.planningArea.toLowerCase();
      const existing = map.get(key) ?? { pos: 0, neg: 0 };
      if (a.sentiment === "negative") existing.neg++;
      else existing.pos++;
      map.set(key, existing);
    }
    return map;
  }, [personaAnswers]);

  const enrichedGeoJSON = useMemo(() => {
    if (!geojson) return null;
    return {
      ...geojson,
      features: (geojson.features as GeoJSON.Feature[]).map((f) => {
        const key = (f.properties?.name ?? "").toLowerCase();
        const counts = sentimentMap.get(key);
        let sentimentColor = "rgba(0,0,0,0)"; // transparent for no-response areas
        if (counts) {
          if (counts.pos > 0 && counts.neg === 0) sentimentColor = "#22c55e";
          else if (counts.neg > 0 && counts.pos === 0) sentimentColor = "#ef4444";
          else sentimentColor = "#eab308";
        }
        return { ...f, properties: { ...f.properties, sentimentColor } };
      }),
    };
  }, [geojson, sentimentMap]);

  if (personaAnswers.length === 0 || !enrichedGeoJSON) return null;

  return (
    <Source id="sentiment" type="geojson" data={enrichedGeoJSON}>
      <Layer
        id="sentiment-fill"
        type="fill"
        beforeId="persona-pins-shadow"
        paint={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "fill-color": ["get", "sentimentColor"] as any,
          "fill-opacity": 0.55,
        }}
      />
    </Source>
  );
}
