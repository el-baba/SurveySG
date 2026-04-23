import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const filters = { ...DEFAULT_FILTERS, ...parseFiltersFromSearchParams(p) };

  let query = supabase
    .from("personas")
    .select("sex,age,marital_status,education_level");

  query = applyFiltersToQuery(query, filters);

  const { data, error } = await query.limit(2000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];

  // Age buckets (5-year)
  const ageBuckets: Record<string, number> = {};
  for (const row of rows) {
    const bucket = `${Math.floor((row.age ?? 0) / 5) * 5}–${Math.floor((row.age ?? 0) / 5) * 5 + 4}`;
    ageBuckets[bucket] = (ageBuckets[bucket] ?? 0) + 1;
  }

  // Sex split
  const sexSplit: Record<string, number> = {};
  for (const row of rows) {
    if (row.sex) sexSplit[row.sex] = (sexSplit[row.sex] ?? 0) + 1;
  }

  // Education level split
  const educationSplit: Record<string, number> = {};
  for (const row of rows) {
    if (row.education_level) educationSplit[row.education_level] = (educationSplit[row.education_level] ?? 0) + 1;
  }

  return NextResponse.json({
    total: rows.length,
    ageBuckets: Object.entries(ageBuckets)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([bucket, count]) => ({ bucket, count })),
    sexSplit: Object.entries(sexSplit).map(([name, value]) => ({ name, value })),
    educationSplit: Object.entries(educationSplit).map(([name, value]) => ({ name, value })),
  });
}
