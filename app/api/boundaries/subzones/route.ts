import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export async function GET() {
  const { data, error } = await supabase
    .from("subzones_geojson")
    .select("name,planning_area,region,geom");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const geojson = {
    type: "FeatureCollection",
    features: (data ?? []).map((row) => ({
      type: "Feature",
      properties: {
        name: row.name,
        planning_area: row.planning_area,
        region: row.region,
      },
      geometry:
        typeof row.geom === "string" ? JSON.parse(row.geom) : row.geom,
    })),
  };

  return NextResponse.json(geojson, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
