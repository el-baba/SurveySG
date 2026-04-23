import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";
import { PERSONA_SYSTEM_PROMPT, buildPersonaAnswerPrompt, PersonaProfile } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { question, filterParams, n: rawN } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  const n = Math.min(Math.max(Number(rawN ?? 8), 1), 10);

  const filters = {
    ...DEFAULT_FILTERS,
    ...parseFiltersFromSearchParams(new URLSearchParams(filterParams ?? "")),
  };

  let query = supabase
    .from("personas")
    .select("id,name,sex,age,ethnicity,occupation,planning_area,subzone,traits")
    .limit(50);

  query = applyFiltersToQuery(query, filters);
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pool = data ?? [];
  if (pool.length === 0) {
    return NextResponse.json({ answers: [], error: "no_personas" });
  }

  // Shuffle and take n
  const sample = pool.sort(() => Math.random() - 0.5).slice(0, n);

  const profiles: PersonaProfile[] = sample.map((p) => ({
    id: p.id,
    name: p.name ?? "Unknown",
    sex: p.sex ?? "?",
    age: p.age ?? 0,
    ethnicity: p.ethnicity ?? "?",
    occupation: p.occupation ?? "?",
    planningArea: p.planning_area ?? "Singapore",
    subzone: p.subzone ?? undefined,
    traits: p.traits ? JSON.stringify(p.traits) : undefined,
  }));

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: PERSONA_SYSTEM_PROMPT },
        { role: "user", content: buildPersonaAnswerPrompt(profiles, question) },
      ],
      response_format: { type: "json_object" },
      max_tokens: n * 120,
      temperature: 0.85,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    const rawAnswers: Array<{ personaId: string; name: string; answer: string }> =
      parsed.answers ?? [];

    // Enrich with demographic info from sample
    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const answers = rawAnswers.map((a) => {
      const p = profileMap.get(a.personaId);
      return {
        personaId: a.personaId,
        name: a.name,
        age: p?.age ?? 0,
        sex: p?.sex ?? "?",
        ethnicity: p?.ethnicity ?? "?",
        occupation: p?.occupation ?? "?",
        planningArea: p?.planningArea ?? "Singapore",
        answer: a.answer,
      };
    });

    return NextResponse.json({ answers });
  } catch {
    return NextResponse.json({ answers: [], error: "parse_failed" });
  }
}
