import type { NextRequest } from "next/server";
import { chatQueries } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { action, data, userId, sessionId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }

    switch (action) {
      case "create_session": {
        const session = await chatQueries.createSession({
          ...data,
          user_id: userId,
        });
        return new Response(JSON.stringify(session), { status: 201 });
      }

      case "list_sessions": {
        const sessions = await chatQueries.getSessions(userId);
        return new Response(JSON.stringify(sessions), { status: 200 });
      }

      case "get_messages": {
        if (!sessionId) {
          return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400 });
        }
        const messages = await chatQueries.getMessages(sessionId);
        return new Response(JSON.stringify(messages), { status: 200 });
      }

      case "add_message": {
        if (!sessionId) {
          return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400 });
        }
        const message = await chatQueries.addMessage({
          ...data,
          session_id: sessionId,
        });
        return new Response(JSON.stringify(message), { status: 201 });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400 });
    }
  } catch (err) {
    console.error("History API error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500 }
    );
  }
}
