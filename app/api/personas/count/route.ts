import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const groupBy = p.get("groupBy") ?? "subzone";
  const groupCol = groupBy === "planning_area" ? "planning_area" : "subzone";

  const filters = { ...DEFAULT_FILTERS, ...parseFiltersFromSearchParams(p) };

  let query = supabase
    .from("personas")
    .select(groupCol)
    .limit(200_000);

  query = applyFiltersToQuery(query, filters);

  const { data, error } = await query;

  if (error) {
    console.error("count error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by the selected column in JS
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = (row as Record<string, string>)[groupCol];
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }

  const result = Object.entries(counts).map(([key, count]) => ({
    [groupCol]: key,
    count,
  }));

  return NextResponse.json(result);
}
