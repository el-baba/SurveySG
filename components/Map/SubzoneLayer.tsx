"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";
import { PlanningAreaBordersLayer } from "./PlanningAreaBordersLayer";

export function SubzoneLayer({ paCountMap }: { paCountMap: Map<string, number> }) {
  void paCountMap;

  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "subzones"],
    queryFn: () => fetch("/api/boundaries/subzones").then((r) => r.json()),
    staleTime: Infinity,
  });

  if (!geojson) return null;

  return (
    <>
      <Source id="subzones" type="geojson" data={geojson}>
        {/* Invisible fill — required for mouse hit-testing */}
        <Layer id="subzone-fill" type="fill" paint={{ "fill-opacity": 0 }} />
        <Layer
          id="subzone-outline"
          type="line"
          paint={{
            "line-color": "rgba(148, 163, 184, 0.3)",
            "line-width": 0.5,
          }}
        />
      </Source>
      <PlanningAreaBordersLayer />
    </>
  );
}
