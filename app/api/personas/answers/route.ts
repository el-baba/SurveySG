import { NextRequest, NextResponse } from "next/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { applyFiltersToQuery, parseFiltersFromSearchParams, DEFAULT_FILTERS } from "@/lib/filters";
import { PERSONA_SYSTEM_PROMPT, buildPersonaAnswerPrompt, PersonaProfile } from "@/lib/prompts";

const BATCH_SIZE = 5;
const MAX_N = 200;

async function askBatch(profiles: PersonaProfile[], question: string) {
  const profileMap = new Map(profiles.map((p, i) => [String(i + 1), p]));
  const profileByDbId = new Map(profiles.map((p) => [String(p.id), p]));
  const profileByName = new Map(profiles.map((p) => [p.name.toLowerCase(), p]));

  const completion = await getOpenAI().chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: PERSONA_SYSTEM_PROMPT },
      { role: "user", content: buildPersonaAnswerPrompt(profiles, question) },
    ],
    response_format: { type: "json_object" },
    max_tokens: profiles.length * 150,
    temperature: 0.85,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  const rawAnswers: Array<{ personaId: string; name: string; answer: string; sentiment: string }> =
    parsed.answers ?? [];

  return rawAnswers.map((a) => {
    const llmName = (a.name ?? "").toLowerCase();
    const p =
      profileMap.get(String(a.personaId)) ??
      profileByDbId.get(String(a.personaId)) ??
      profileByName.get(llmName) ??
      profiles.find((profile) => llmName.startsWith(profile.name.toLowerCase()));
    // If p is still null, extract just the first 1–3 words of the LLM name as a last resort
    const fallbackName = a.name?.split(/[,.\s–-]/)[0]?.trim() ?? "Unknown";
    return {
      personaId: String(p?.id ?? a.personaId),
      name: p?.name ?? fallbackName,
      age: p?.age ?? 0,
      sex: p?.sex ?? "?",
      planningArea: p?.planningArea ?? "Singapore",
      answer: a.answer,
      sentiment: (a.sentiment === "negative" ? "negative" : "positive") as "positive" | "negative",
    };
  });
}

export async function POST(req: NextRequest) {
  const { question, filterParams, n: rawN } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  const n = Math.min(Math.max(Number(rawN ?? 8), 1), MAX_N);

  const filters = {
    ...DEFAULT_FILTERS,
    ageMax: 99,
    ...parseFiltersFromSearchParams(new URLSearchParams(filterParams ?? "")),
  };

  // Fetch enough personas to fill the requested n, with some extra for shuffling variety
  const poolSize = Math.min(n * 2, 200);

  let query = supabase
    .from("personas")
    .select("id,name,sex,age,marital_status,education_level,occupation,skills_and_expertise_list,persona,planning_area,subzone,traits")
    .limit(poolSize);

  query = applyFiltersToQuery(query, filters);
  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pool = data ?? [];
  if (pool.length === 0) {
    return NextResponse.json({ answers: [], error: "no_personas" });
  }

  const sample = pool.sort(() => Math.random() - 0.5).slice(0, n);

  const profiles: PersonaProfile[] = sample.map((p) => ({
    id: p.id,
    name: p.name ?? "Unknown",
    sex: p.sex ?? "?",
    age: p.age ?? 0,
    maritalStatus: p.marital_status ?? "?",
    educationLevel: p.education_level ?? "?",
    planningArea: p.planning_area ?? "Singapore",
    subzone: p.subzone ?? undefined,
    traits: p.traits ? JSON.stringify(p.traits) : undefined,
    occupation: p.occupation ?? undefined,
    skillsList: p.skills_and_expertise_list ?? undefined,
    personaDescription: p.persona ?? undefined,
  }));

  // Split into batches and run in parallel
  const batches: PersonaProfile[][] = [];
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    batches.push(profiles.slice(i, i + BATCH_SIZE));
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        await Promise.all(
          batches.map(async (b) => {
            const batchAnswers = await askBatch(b, question);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ answers: batchAnswers })}\n\n`)
            );
          })
        );
      } catch {
        // stream what we have
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
