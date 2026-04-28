import { NextRequest } from "next/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/openai";

type IncomingMessage = { role: "user" | "persona"; content: string };

function buildSystemPrompt(persona: {
  name: string;
  age: number;
  sex: string;
  planningArea: string;
}): string {
  const singlishGuide =
    persona.age >= 50
      ? "Use heavy Singlish naturally — lah, leh, lor, sia, wah, aiyo, meh, hor, liao. This is how you talk."
      : persona.age >= 35
      ? "Use light Singlish — an occasional lah or lor is fine, but speak mostly casual standard English."
      : "Speak in casual standard English. Singlish particles (lah, lor) are rare for you — use them only if it feels very natural.";

  return `You are ${persona.name}, a ${persona.age}-year-old ${persona.sex} living in ${persona.planningArea}, Singapore.

Respond in first person as this specific individual. ${singlishGuide} Be direct and authentic to your background. Keep replies to 2–3 sentences.

Do NOT break character or reveal you are an AI. You are ${persona.name}.`;
}

export async function POST(req: NextRequest) {
  const { persona, messages } = await req.json();

  if (!persona || !messages) {
    return new Response(JSON.stringify({ error: "persona and messages required" }), { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(persona);

  const history = (messages as IncomingMessage[]).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  const stream = await getOpenAI().chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...history],
    stream: true,
    max_tokens: 200,
    temperature: 0.9,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
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
