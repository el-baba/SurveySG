"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";

function getBBox(geometry: GeoJSON.Geometry): [number, number, number, number] | null {
  const coords: number[][] = [];
  if (geometry.type === "Polygon") {
    geometry.coordinates[0].forEach((c) => coords.push(c));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly[0].forEach((c) => coords.push(c)));
  }
  if (!coords.length) return null;
  const lngs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

function randomInBBox(bbox: [number, number, number, number]): [number, number] {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return [
    minLng + Math.random() * (maxLng - minLng),
    minLat + Math.random() * (maxLat - minLat),
  ];
}

type Persona = {
  id: string;
  name: string;
  age: number;
  sex: string;
  planning_area: string;
};

export function PersonaPinsLayer() {
  const filters = useFilterStore();

  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "planning-areas"],
    queryFn: () => fetch("/api/boundaries/planning-areas").then((r) => r.json()),
    staleTime: Infinity,
  });

  const params = filtersToSearchParams(filters);
  const { data: personas } = useQuery<Persona[]>({
    queryKey: ["personas", "pins", params.toString()],
    queryFn: () => fetch(`/api/personas/sample?n=200&${params}`).then((r) => r.json()),
    placeholderData: [],
  });

  const pinsGeoJSON = useMemo(() => {
    if (!geojson || !personas?.length) return null;

    const bboxMap = new Map<string, [number, number, number, number]>();
    (geojson.features as GeoJSON.Feature[]).forEach((f) => {
      const name = (f.properties?.name ?? "").toLowerCase();
      const bbox = getBBox(f.geometry as GeoJSON.Geometry);
      if (bbox) bboxMap.set(name, bbox);
    });

    const features: GeoJSON.Feature[] = personas.map((p) => {
      const bbox = bboxMap.get((p.planning_area ?? "").toLowerCase());
      const [lng, lat] = bbox ? randomInBBox(bbox) : [103.8198, 1.3521];
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [lng, lat] },
        properties: {
          id: p.id,
          name: p.name,
          age: p.age,
          sex: p.sex,
          planningArea: p.planning_area,
        },
      };
    });

    return { type: "FeatureCollection" as const, features };
  }, [geojson, personas]);

  if (!pinsGeoJSON) return null;

  return (
    <Source id="persona-pins" type="geojson" data={pinsGeoJSON}>
      {/* Pin shadow */}
      <Layer
        id="persona-pins-shadow"
        type="circle"
        paint={{
          "circle-radius": 5,
          "circle-color": "rgba(0,0,0,0.3)",
          "circle-blur": 1,
          "circle-translate": [1, 2],
        }}
      />
      {/* Pin dot */}
      <Layer
        id="persona-pins-circle"
        type="circle"
        paint={{
          "circle-radius": 4,
          "circle-color": "#ffffff",
          "circle-opacity": 0.95,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(0, 120, 200, 0.8)",
        }}
      />
    </Source>
  );
}
