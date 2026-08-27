import type { NextRequest } from "next/server";
import { strategyQueries } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { action, data, userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    switch (action) {
      case "create": {
        const strategy = await strategyQueries.createStrategy({
          ...data,
          user_id: userId,
        });
        return new Response(JSON.stringify(strategy), { status: 201 });
      }

      case "list": {
        const strategies = await strategyQueries.getStrategies(userId);
        return new Response(JSON.stringify(strategies), { status: 200 });
      }

      case "update": {
        const { id, ...updates } = data;
        const strategy = await strategyQueries.updateStrategy(id, updates);
        return new Response(JSON.stringify(strategy), { status: 200 });
      }

      case "delete": {
        const { id } = data;
        await strategyQueries.deleteStrategy(id);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
    }
  } catch (err) {
    console.error("Strategy API error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500 }
    );
  }
}
