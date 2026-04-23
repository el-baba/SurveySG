import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const groupBy = p.get("groupBy") ?? "subzone";

  const rpcName =
    groupBy === "planning_area"
      ? "count_personas_by_planning_area"
      : "count_personas_by_subzone";

  const rpcArgs = {
    p_sex: p.get("sex") ?? null,
    p_age_min: p.get("ageMin") ? Number(p.get("ageMin")) : null,
    p_age_max: p.get("ageMax") ? Number(p.get("ageMax")) : null,
    p_marital_status: p.get("maritalStatus") ? p.get("maritalStatus")!.split(",") : null,
    p_education_level: p.get("educationLevel") ? p.get("educationLevel")!.split(",") : null,
    p_planning_area: p.get("planningArea") ?? null,
    p_subzone: p.get("subzone") ?? null,
  };

  const { data, error } = await supabase.rpc(rpcName, rpcArgs);

  if (error) {
    console.error("count rpc error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
