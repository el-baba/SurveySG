import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const n = Math.min(Number(p.get("n") ?? 50), 100);

  const filters = { ...DEFAULT_FILTERS, ...parseFiltersFromSearchParams(p) };
  let query = supabase
    .from("personas")
    .select("id,name,sex,age,ethnicity,religion,marital_status,occupation,planning_area,subzone,traits");

  query = applyFiltersToQuery(query, filters);

  const { data, error } = await query.limit(n);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Shuffle for randomness (Supabase free tier doesn't support ORDER BY RANDOM efficiently)
  const shuffled = (data ?? []).sort(() => Math.random() - 0.5).slice(0, n);

  return NextResponse.json(shuffled);
}
