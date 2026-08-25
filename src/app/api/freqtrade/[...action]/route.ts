import type { NextRequest } from "next/server";

import {
  fetchFreqtrade,
  type BotConfig,
  type ClosedTrade,
  type OpenTrade,
  type ProfitSummary,
} from "@/lib/freqtrade";

// ponytail: no route-level auth yet — personal localhost/VPS deployment.
// Gate via Supabase session when multi-user work starts (spec phase 5).
export const dynamic = "force-dynamic";

const json = (r: unknown, status = 200) => Response.json(r, { status });

async function dispatch(method: string, segs: string[]): Promise<Response> {
  const [name, arg] = segs;

  switch (`${method} ${name ?? ""}`) {
    case "GET status":
      return json(await fetchFreqtrade<BotConfig>("/show_config"));
    case "POST start":
      return json(await fetchFreqtrade("/start", { method: "POST" }));
    case "POST stop":
      return json(await fetchFreqtrade("/stop", { method: "POST" }));
    case "POST reload":
      return json(await fetchFreqtrade("/reload_config", { method: "POST" }));
    case "GET trades": {
      const [open, closed] = await Promise.all([
        fetchFreqtrade<OpenTrade[]>("/status"),
        fetchFreqtrade<{ trades: ClosedTrade[] }>("/trades?limit=50"),
      ]);
      if (!open.ok || !closed.ok) {
        return json({
          ok: false,
          code: open.code ?? closed.code,
          error: open.error ?? closed.error,
        });
      }
      return json({
        ok: true,
        data: { open: open.data ?? [], closed: closed.data?.trades ?? [] },
      });
    }
    case "GET profit": {
      const [summary, daily] = await Promise.all([
        fetchFreqtrade<ProfitSummary>("/profit"),
        fetchFreqtrade<unknown[]>("/daily"),
      ]);
      if (!summary.ok || !daily.ok) {
        return json({
          ok: false,
          code: summary.code ?? daily.code,
          error: summary.error ?? daily.error,
        });
      }
      return json({
        ok: true,
        data: { summary: summary.data, daily: daily.data },
      });
    }
    case "POST exit": {
      const id = Number(arg);
      if (!Number.isInteger(id)) {
        return json({ ok: false, code: "FTD_ERROR", error: "Invalid trade id" }, 400);
      }
      return json(
        await fetchFreqtrade("/forceexit", {
          method: "POST",
          body: { tradeid: id },
        }),
      );
    }
    default:
      return json(
        {
          ok: false,
          code: "FTD_ERROR",
          error: `Unknown endpoint: ${method} /${segs.join("/")}`,
        },
        404,
      );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> },
) {
  const { action } = await params;
  return dispatch("GET", action);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ action: string[] }> },
) {
  const { action } = await params;
  return dispatch("POST", action);
}
