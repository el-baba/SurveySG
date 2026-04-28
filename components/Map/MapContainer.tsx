"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import MapGL, { MapRef, NavigationControl, MapMouseEvent } from "react-map-gl/mapbox";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/filterStore";
import { filtersToSearchParams } from "@/lib/filters";
import { SubzoneLayer } from "./SubzoneLayer";
import { PlanningAreaLayer } from "./PlanningAreaLayer";
import { SentimentLayer } from "./SentimentLayer";
import { PersonaPinsLayer } from "./PersonaPinsLayer";
import { HoverTooltip } from "./HoverTooltip";
import { PrivateChatBubbles } from "./PrivateChatBubbles";
import {
  SINGAPORE_CENTER,
  SINGAPORE_ZOOM,
  SINGAPORE_BOUNDS,
  MAP_STYLES,
} from "@/lib/mapbox";

export type HoveredFeature = {
  name: string;
  personaCount: number;
  x: number;
  y: number;
} | null;

export function MapContainer() {
  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(SINGAPORE_ZOOM);
  const [hoveredFeature, setHoveredFeature] = useState<HoveredFeature>(null);
  const mapStyle: keyof typeof MAP_STYLES = "dark";
  const filters = useFilterStore();
  const { setSubzone, setPlanningArea } = filters;
  const chatMode = useFilterStore((s) => s.chatMode);
  const focusedPersonaId = useFilterStore((s) => s.focusedPersonaId);
  const personaCoordinates = useFilterStore((s) => s.personaCoordinates);
  const setFocusedPersonaId = useFilterStore((s) => s.setFocusedPersonaId);
  const setSelectedPersonaId = useFilterStore((s) => s.setSelectedPersonaId);
  const selectedPersonaId = useFilterStore((s) => s.selectedPersonaId);
  const personaAnswers = useFilterStore((s) => s.personaAnswers);
  const resetViewCounter = useFilterStore((s) => s.resetViewCounter);

  useEffect(() => {
    if (!focusedPersonaId || !mapRef.current) return;
    const coords = personaCoordinates[focusedPersonaId];
    if (!coords) return;
    mapRef.current.flyTo({ center: coords, zoom: 14, duration: 1000 });
    setFocusedPersonaId(null);
  }, [focusedPersonaId, personaCoordinates, setFocusedPersonaId]);

  useEffect(() => {
    if (resetViewCounter === 0 || !mapRef.current) return;
    mapRef.current.flyTo({ center: SINGAPORE_CENTER, zoom: SINGAPORE_ZOOM, duration: 1000 });
  }, [resetViewCounter]);

  const params = filtersToSearchParams(filters);

  // Same queryKey as PersonaPinsLayer — hits the cache, no extra request
  const { data: sampledPersonas } = useQuery<Array<{ planning_area: string }>>({
    queryKey: ["personas", "pins", params.toString()],
    queryFn: () => fetch(`/api/personas/sample?${params}`).then((r) => r.json()),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: [],
  });

  // Same queryKey as SubzoneLayer — hits the cache, no extra request
  const { data: subzoneGeojson } = useQuery({
    queryKey: ["boundaries", "subzones"],
    queryFn: () => fetch("/api/boundaries/subzones").then((r) => r.json()),
    staleTime: Infinity,
  });

  const paCountMap = useMemo((): Map<string, number> => {
    const source = personaAnswers.length > 0
      ? personaAnswers.map((a) => a.planningArea)
      : (sampledPersonas ?? []).map((p) => p.planning_area);
    const m = new Map<string, number>();
    for (const area of source) {
      const key = (area ?? "").toLowerCase();
      if (key) m.set(key, (m.get(key) ?? 0) + 1);
    }
    return m;
  }, [sampledPersonas, personaAnswers]);

  // Subzone name (lowercase) → planning area (lowercase), built from static GeoJSON
  const subzoneToPa = useMemo((): Map<string, string> => {
    const features = (subzoneGeojson as { features?: Array<{ properties?: { name?: string; planning_area?: string } }> })?.features ?? [];
    const entries = features
      .filter((f) => f.properties?.name && f.properties?.planning_area)
      .map((f) => [f.properties!.name!.toLowerCase(), f.properties!.planning_area!.toLowerCase()] as [string, string]);
    return new Map(entries);
  }, [subzoneGeojson]);

  // Refs so the stable mousemove handler always reads latest data
  const paCountMapRef = useRef(paCountMap);
  const subzoneToPaRef = useRef(subzoneToPa);
  useEffect(() => { paCountMapRef.current = paCountMap; }, [paCountMap]);
  useEffect(() => { subzoneToPaRef.current = subzoneToPa; }, [subzoneToPa]);

  const handleZoom = useCallback(() => {
    if (mapRef.current) setZoom(mapRef.current.getZoom());
  }, []);

  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0];
    const layerId = feature?.layer?.id ?? "";
    if (feature && layerId !== "persona-pins-circle") {
      const name = feature.properties?.name ?? "";
      const paKey = layerId === "subzone-fill"
        ? (subzoneToPaRef.current.get(name.toLowerCase()) ?? name.toLowerCase())
        : name.toLowerCase();
      const personaCount = paCountMapRef.current.get(paKey) ?? 0;
      setHoveredFeature({ name, personaCount, x: e.point.x, y: e.point.y });
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
    } else {
      setHoveredFeature(null);
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = feature ? "pointer" : "";
    }
  }, []); // stable — reads latest data via refs

  const handleMouseLeave = useCallback(() => {
    setHoveredFeature(null);
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
  }, []);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const layerId = feature.layer?.id ?? "";
      if (layerId === "persona-pins-circle") {
        const id = feature.properties?.id as string | undefined;
        if (!id) return;
        if (id === selectedPersonaId) {
          setSelectedPersonaId(null);
        } else {
          setFocusedPersonaId(id);
          setSelectedPersonaId(id);
        }
        return;
      }
      if (!feature.properties?.name) return;
      const name = feature.properties.name as string;
      if (layerId === "subzone-fill") {
        setSubzone(name);
        setPlanningArea(null);
      } else {
        setPlanningArea(name);
        setSubzone(null);
      }
    },
    [setSubzone, setPlanningArea, setFocusedPersonaId, setSelectedPersonaId, selectedPersonaId]
  );

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/90 text-white/40">
        <p>Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local to display the map.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <PrivateChatBubbles />
      <MapGL
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          longitude: SINGAPORE_CENTER[0],
          latitude: SINGAPORE_CENTER[1],
          zoom: SINGAPORE_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[mapStyle]}
        maxBounds={SINGAPORE_BOUNDS}
        onZoom={handleZoom}
        interactiveLayerIds={["subzone-fill", "planning-area-fill", "persona-pins-circle"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <NavigationControl position="bottom-right" />

        {zoom >= 10 ? <SubzoneLayer paCountMap={paCountMap} /> : <PlanningAreaLayer paCountMap={paCountMap} />}

        <SentimentLayer />

        <PersonaPinsLayer zoom={zoom} />

        {hoveredFeature && chatMode !== "persona" && !focusedPersonaId && !filters.selectedPersonaId && <HoverTooltip feature={hoveredFeature} />}
      </MapGL>
    </div>
  );
}
