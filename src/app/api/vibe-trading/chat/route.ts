import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const message = body.message || "";
  if (!message.trim()) {
    return new Response("Message required", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        const apiKey = process.env.GOOGLE_API_KEY || "";
        if (!apiKey) throw new Error("GOOGLE_API_KEY not configured");

        const model = "gemini-3.6-flash";
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        sendEvent("status", { message: "Thinking…" });

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: `You are Kairos, an AI assistant for crypto traders. You help with:
- General trading questions (strategy concepts, risk management, market analysis)
- Crypto market insights and technical analysis discussion
- Trading psychology and discipline
- Freqtrade bot configuration and usage questions
- General crypto/DeFi knowledge

You do NOT:
- Provide financial advice or investment recommendations
- Guarantee trading profits or success rates
- Make up trading statistics or backtest results
- Trade with user money
- Discuss non-trading topics at length

Keep responses concise, practical, and focused on trading education. If user asks for strategy backtest, direct them to use the Backtest feature instead.`
              }]
            },
            contents: [{
              parts: [{
                text: message
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          }),
        });

        if (!response.ok) {
          const errTxt = await response.text();
          throw new Error(`Gemini API ${response.status}: ${errTxt.slice(0, 200)}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (!text) throw new Error("Empty response from Gemini");

        sendEvent("result", {
          message,
          response: text,
          completed: true,
        });

        controller.close();
      } catch (err) {
        console.error("Chat stream error:", err);
        sendEvent("result", {
          message,
          response: `I encountered an issue: ${err instanceof Error ? err.message : "Network error"}. Please try again.`,
          completed: true,
          error: true,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
