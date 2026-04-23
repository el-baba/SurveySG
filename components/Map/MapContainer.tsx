"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { MapRef, NavigationControl, MapMouseEvent } from "react-map-gl/mapbox";
import { useFilterStore } from "@/store/filterStore";
import { SubzoneLayer } from "./SubzoneLayer";
import { PlanningAreaLayer } from "./PlanningAreaLayer";
import { PersonaPinsLayer } from "./PersonaPinsLayer";
import { HoverTooltip } from "./HoverTooltip";
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
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLES>("dark");
  const { setSubzone, setPlanningArea } = useFilterStore();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setMapStyle(mq.matches ? "dark" : "streets");
    const handler = (e: MediaQueryListEvent) =>
      setMapStyle(e.matches ? "dark" : "streets");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleZoom = useCallback(() => {
    if (mapRef.current) setZoom(mapRef.current.getZoom());
  }, []);

  const handleMouseMove = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (feature) {
      setHoveredFeature({
        name: feature.properties?.name ?? "",
        personaCount: feature.properties?.personaCount ?? 0,
        x: e.point.x,
        y: e.point.y,
      });
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
    } else {
      setHoveredFeature(null);
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredFeature(null);
    if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
  }, []);

  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature?.properties?.name) return;
      const name = feature.properties.name as string;
      const layerId = feature.layer?.id ?? "";
      if (layerId === "subzone-fill") {
        setSubzone(name);
        setPlanningArea(null);
      } else {
        setPlanningArea(name);
        setSubzone(null);
      }
    },
    [setSubzone, setPlanningArea]
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
    <div className="w-full h-full">
      <Map
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
        interactiveLayerIds={["subzone-fill", "planning-area-fill"]}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <NavigationControl position="bottom-right" />

        {zoom >= 10 ? <SubzoneLayer /> : <PlanningAreaLayer />}

        <PersonaPinsLayer />

        {hoveredFeature && <HoverTooltip feature={hoveredFeature} />}
      </Map>
    </div>
  );
}
