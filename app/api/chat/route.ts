import { NextRequest } from "next/server";
import { getOpenAI, CHAT_MODEL, MAX_PERSONAS_FOR_CHAT } from "@/lib/openai";
import { parseFiltersFromSearchParams, DEFAULT_FILTERS, applyFiltersToQuery } from "@/lib/filters";
import { supabase } from "@/lib/supabase";
import { buildAggregateSystemPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { question, filterParams } = await req.json();

  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: "question required" }), { status: 400 });
  }

  const filters = {
    ...DEFAULT_FILTERS,
    ...parseFiltersFromSearchParams(new URLSearchParams(filterParams ?? "")),
  };

  let query = supabase
    .from("personas")
    .select("name,sex,age,ethnicity,religion,marital_status,occupation,planning_area,subzone,traits")
    .limit(MAX_PERSONAS_FOR_CHAT);

  query = applyFiltersToQuery(query, filters);
  const { data: personas } = await query;

  const sample = (personas ?? []).sort(() => Math.random() - 0.5).slice(0, MAX_PERSONAS_FOR_CHAT);

  const personaContext = sample
    .map(
      (p, i) =>
        `Persona ${i + 1}: ${p.name ?? "Unknown"}, ${p.sex ?? "?"}, age ${p.age ?? "?"}, ` +
        `${p.ethnicity ?? "?"}, ${p.religion ?? "?"}, ${p.marital_status ?? "?"}, ` +
        `${p.occupation ?? "?"}, from ${p.subzone ?? p.planning_area ?? "Singapore"}.`
    )
    .join("\n");

  const systemPrompt = buildAggregateSystemPrompt(sample.length, personaContext);

  const stream = await getOpenAI().chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    stream: true,
    max_tokens: 600,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "meta", count: sample.length })}\n\n`
        )
      );

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
          );
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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
