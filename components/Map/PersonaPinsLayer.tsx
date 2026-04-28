"use client";

import { useMemo, useEffect } from "react";
import { Source, Layer, Marker } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useFilterStore, PersonaAnswer } from "@/store/filterStore";
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

function raycastRing(px: number, py: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(px: number, py: number, rings: number[][][]): boolean {
  // outer ring must contain the point; holes must not
  if (!raycastRing(px, py, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (raycastRing(px, py, rings[i])) return false;
  }
  return true;
}

function pointInGeometry(px: number, py: number, geometry: GeoJSON.Geometry): boolean {
  if (geometry.type === "Polygon") return pointInPolygon(px, py, geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.some((poly) => pointInPolygon(px, py, poly));
  return false;
}

function randomInGeometry(geometry: GeoJSON.Geometry, bbox: [number, number, number, number]): [number, number] {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  for (let i = 0; i < 100; i++) {
    const lng = minLng + Math.random() * (maxLng - minLng);
    const lat = minLat + Math.random() * (maxLat - minLat);
    if (pointInGeometry(lng, lat, geometry)) return [lng, lat];
  }
  // Fallback: first vertex of the outer ring (guaranteed inside)
  if (geometry.type === "Polygon") return geometry.coordinates[0][0] as [number, number];
  if (geometry.type === "MultiPolygon") return geometry.coordinates[0][0][0] as [number, number];
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
}

type Persona = {
  id: string;
  name: string;
  age: number;
  sex: string;
  planning_area: string;
};

export function PersonaPinsLayer({ zoom }: { zoom: number }) {
  const filters = useFilterStore();
  const setPersonaCoordinates = useFilterStore((s) => s.setPersonaCoordinates);
  const selectedPersonaId = useFilterStore((s) => s.selectedPersonaId);
  const personaAnswers = useFilterStore((s) => s.personaAnswers);
  const chatMode = useFilterStore((s) => s.chatMode);
  const startPrivateChat = useFilterStore((s) => s.startPrivateChat);

  const { data: geojson } = useQuery({
    queryKey: ["boundaries", "planning-areas"],
    queryFn: () => fetch("/api/boundaries/planning-areas").then((r) => r.json()),
    staleTime: Infinity,
  });

  const params = filtersToSearchParams(filters);
  const { data: sampledPersonas } = useQuery<Persona[]>({
    queryKey: ["personas", "pins", params.toString()],
    queryFn: () => fetch(`/api/personas/sample?${params}`).then((r) => r.json()),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: [],
  });

  // When there are answers, show only the personas who replied; otherwise show the sample.
  const personas = useMemo<Persona[]>(() => {
    if (personaAnswers.length > 0) {
      return personaAnswers.map((a) => ({
        id: a.personaId,
        name: a.name,
        age: a.age,
        sex: a.sex,
        planning_area: a.planningArea,
      }));
    }
    return sampledPersonas ?? [];
  }, [personaAnswers, sampledPersonas]);

  // Stable coordinate memo — does NOT include selectedPersonaId so random positions
  // don't regenerate on selection changes.
  const pinsGeoJSON = useMemo(() => {
    if (!geojson || !personas?.length) return null;

    type AreaShape = { geometry: GeoJSON.Geometry; bbox: [number, number, number, number] };
    const shapeMap = new Map<string, AreaShape>();
    (geojson.features as GeoJSON.Feature[]).forEach((f) => {
      const name = (f.properties?.name ?? "").toLowerCase();
      const geometry = f.geometry as GeoJSON.Geometry;
      const bbox = getBBox(geometry);
      if (bbox) shapeMap.set(name, { geometry, bbox });
    });

    const features: GeoJSON.Feature[] = personas.map((p) => {
      const shape = shapeMap.get((p.planning_area ?? "").toLowerCase());
      const [lng, lat] = shape
        ? randomInGeometry(shape.geometry, shape.bbox)
        : [103.8198, 1.3521];
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

  // Lightweight re-derivation that adds isSelected without touching coordinates.
  const displayGeoJSON = useMemo(() => {
    if (!pinsGeoJSON) return null;
    return {
      ...pinsGeoJSON,
      features: pinsGeoJSON.features.map((f) => ({
        ...f,
        properties: {
          ...f.properties,
          isSelected: f.properties?.id === selectedPersonaId ? 1 : 0,
        },
      })),
    };
  }, [pinsGeoJSON, selectedPersonaId]);

  useEffect(() => {
    if (!pinsGeoJSON) return;
    const coords: Record<string, [number, number]> = {};
    pinsGeoJSON.features.forEach((f) => {
      const id = f.properties?.id;
      if (id) coords[id] = (f.geometry as GeoJSON.Point).coordinates as [number, number];
    });
    setPersonaCoordinates(coords);
  }, [pinsGeoJSON, setPersonaCoordinates]);

  // Derive selected persona's screen coords + profile for the callout
  const selectedCallout = useMemo(() => {
    if (!selectedPersonaId || !pinsGeoJSON) return null;
    const feat = pinsGeoJSON.features.find((f) => f.properties?.id === selectedPersonaId);
    if (!feat) return null;
    const [lng, lat] = (feat.geometry as GeoJSON.Point).coordinates as [number, number];
    const p = feat.properties!;
    // Build a PersonaAnswer-compatible object from available properties
    const answer = personaAnswers.find((a) => a.personaId === selectedPersonaId);
    const personaForChat: PersonaAnswer = answer ?? {
      personaId: p.id,
      name: p.name,
      age: p.age,
      sex: p.sex,
      planningArea: p.planningArea,
      answer: "",
      sentiment: "positive",
    };
    return { lng, lat, personaForChat };
  }, [selectedPersonaId, pinsGeoJSON, personaAnswers]);

  if (!displayGeoJSON) return null;

  return (
    <>
      <Source id="persona-pins" type="geojson" data={displayGeoJSON}>
        {/* Shadow — slightly larger for selected */}
        <Layer
          id="persona-pins-shadow"
          type="circle"
          paint={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-radius": ["case", ["==", ["get", "isSelected"], 1], 10, 5] as any,
            "circle-color": "rgba(0,0,0,0.35)",
            "circle-blur": 1,
            "circle-translate": [1, 2],
          }}
        />
        {/* Halo ring for selected pin */}
        <Layer
          id="persona-pins-halo"
          type="circle"
          paint={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-radius": ["case", ["==", ["get", "isSelected"], 1], 14, 0] as any,
            "circle-color": "rgba(251,191,36,0.25)",
            "circle-stroke-width": 0,
          }}
        />
        {/* Pin dot */}
        <Layer
          id="persona-pins-circle"
          type="circle"
          paint={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-radius": ["case", ["==", ["get", "isSelected"], 1], 8, 4] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-color": ["case", ["==", ["get", "isSelected"], 1], "#fbbf24", "#ffffff"] as any,
            "circle-opacity": 0.97,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-stroke-width": ["case", ["==", ["get", "isSelected"], 1], 2.5, 1.5] as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            "circle-stroke-color": ["case", ["==", ["get", "isSelected"], 1], "#f97316", "rgba(0,120,200,0.8)"] as any,
          }}
        />
      </Source>

      {/* Chat callout — visible when zoomed in on a selected persona */}
      {zoom >= 13 && chatMode === "survey" && selectedCallout && (
        <Marker
          longitude={selectedCallout.lng}
          latitude={selectedCallout.lat}
          anchor="bottom"
          offset={[0, -20]}
        >
          <button
            onClick={() => startPrivateChat(selectedCallout.personaForChat)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(20,20,20,0.85)",
              border: "1px solid rgba(251,191,36,0.5)",
              backdropFilter: "blur(12px)",
              color: "#fbbf24",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            <MessageCircle size={13} />
            Chat with {selectedCallout.personaForChat.name}
          </button>
        </Marker>
      )}
    </>
  );
}
