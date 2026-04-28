import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";

const MAX_N = 200;

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const filters = { ...DEFAULT_FILTERS, ...parseFiltersFromSearchParams(p) };

  // "estimated" uses PostgreSQL planner stats — near-instant, no full scan.
  // Accurate enough for proportional pin scaling.
  const [totalResult, filteredResult] = await Promise.all([
    supabase.from("personas").select("id", { count: "estimated" }).limit(1),
    (() => {
      let q = supabase.from("personas").select("id", { count: "estimated" }).limit(1);
      q = applyFiltersToQuery(q, filters);
      return q;
    })(),
  ]);

  const totalCount = totalResult.count ?? 0;
  const filteredCount = filteredResult.count ?? 0;

  // If nothing matches (or counts unavailable), fetch up to MAX_N and return all
  if (filteredCount === 0 && totalCount === 0) {
    let q = supabase
      .from("personas")
      .select("id,name,sex,age,marital_status,education_level,planning_area,subzone,traits");
    q = applyFiltersToQuery(q, filters);
    const { data, error } = await q.order("id").limit(MAX_N);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).sort(() => Math.random() - 0.5));
  }

  // Scale proportionally: e.g. 20% match the filter → show ~20% of MAX_N pins
  const n = totalCount > 0 && filteredCount > 0
    ? Math.min(Math.max(1, Math.round((filteredCount / totalCount) * MAX_N)), filteredCount, MAX_N)
    : Math.min(filteredCount || MAX_N, MAX_N);

  let query = supabase
    .from("personas")
    .select("id,name,sex,age,marital_status,education_level,planning_area,subzone,traits");
  query = applyFiltersToQuery(query, filters);

  const { data, error } = await query.order("id").limit(n);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).sort(() => Math.random() - 0.5));
}
