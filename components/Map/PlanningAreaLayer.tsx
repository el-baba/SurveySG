"use client";

import { useCallback } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";
import { CHOROPLETH_COLORS, CHOROPLETH_STEPS } from "@/lib/mapbox";

export function PlanningAreaLayer() {
  const filters = useFilterStore();

  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "planning-areas"],
    queryFn: () => fetch("/api/boundaries/planning-areas").then((r) => r.json()),
    staleTime: Infinity,
  });

  const params = filtersToSearchParams(filters);
  const { data: counts } = useQuery({
    queryKey: ["personas", "count", "pa", params.toString()],
    queryFn: () =>
      fetch(`/api/personas/count?${params}&groupBy=planning_area`).then((r) =>
        r.json()
      ) as Promise<Array<{ planning_area: string; count: number }>>,
    placeholderData: [],
  });

  const enrichedGeoJSON = useCallback(() => {
    if (!geojson) return null;
    const countMap = new Map(
      (counts ?? []).map((c) => [c.planning_area?.toLowerCase(), c.count])
    );
    return {
      ...geojson,
      features: (geojson.features as GeoJSON.Feature[]).map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          personaCount:
            countMap.get((f.properties?.name ?? "").toLowerCase()) ?? 0,
        },
      })),
    };
  }, [geojson, counts]);

  const data = enrichedGeoJSON();
  if (!data) return null;

  const fillColor = [
    "step",
    ["get", "personaCount"],
    CHOROPLETH_COLORS[0],
    ...CHOROPLETH_STEPS.slice(1).flatMap((step, i) => [step, CHOROPLETH_COLORS[i + 1]]),
  ];

  return (
    <Source id="planning-areas" type="geojson" data={data}>
      <Layer
        id="planning-area-fill"
        type="fill"
        paint={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "fill-color": fillColor as any,
          "fill-opacity": 0.65,
        }}
      />
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
