import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";

const MAX_N = 200;
// Rough upper bound for personas table — used to pick a random page offset.
// Keeps us from always showing the same first-N rows while avoiding ORDER BY random() full scans.
const ESTIMATED_TOTAL = 100_000;

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const n = Math.min(Number(p.get("n") ?? 200), MAX_N);

  const filters = { ...DEFAULT_FILTERS, ...parseFiltersFromSearchParams(p) };

  // Pick a random starting offset so different personas appear on each load.
  // Falls back to offset 0 when filters narrow the result set enough that
  // the offset would land past the end (detected by empty data).
  const hasFilters =
    filters.sex !== "All" ||
    filters.ageMin > 0 ||
    filters.ageMax < 100 ||
    filters.maritalStatus.length > 0 ||
    filters.educationLevel.length > 0 ||
    !!filters.subzone ||
    !!filters.planningArea;

  const offset = hasFilters ? 0 : Math.floor(Math.random() * (ESTIMATED_TOTAL - n));

  let query = supabase
    .from("personas")
    .select("id,name,sex,age,marital_status,education_level,planning_area,subzone,traits");

  query = applyFiltersToQuery(query, filters);

  const { data, error } = await query.range(offset, offset + n - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Shuffle within the fetched slice for varied pin placement order
  const shuffled = (data ?? []).sort(() => Math.random() - 0.5);

  return NextResponse.json(shuffled);
}
