export type FtErrorCode =
  | "TIMEOUT"
  | "CONN_REFUSED"
  | "AUTH_FAIL"
  | "FTD_ERROR";

export interface FtResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: FtErrorCode;
}

export interface BotConfig {
  state: string;
  dry_run: boolean;
  dry_run_wallet?: number;
  exchange: string;
  strategy: string;
  bot_name?: string;
  max_open_trades?: number;
}

export interface OpenTrade {
  trade_id: number;
  pair: string;
  open_rate: number;
  current_rate?: number;
  profit_ratio?: number;
  profit_abs?: number;
  open_date: string;
}

export interface ClosedTrade {
  trade_id: number;
  pair: string;
  open_rate: number;
  close_rate?: number;
  close_profit?: number;
  close_profit_abs?: number;
  open_date: string;
  close_date?: string;
  exit_reason?: string;
}

export interface ProfitSummary {
  profit_closed_fiat?: number;
  profit_all_fiat?: number;
  profit_closed_ratio_mean?: number;
  trade_count?: number;
  closed_trade_count?: number;
  winning_trades?: number;
  losing_trades?: number;
}

const FT_URL = process.env.FREQTRADE_URL;
const FT_AUTH =
  process.env.FREQTRADE_USER && process.env.FREQTRADE_PASS
    ? `Basic ${Buffer.from(
        `${process.env.FREQTRADE_USER}:${process.env.FREQTRADE_PASS}`,
      ).toString("base64")}`
    : "";

const TIMEOUT_MS = 5000;

export async function fetchFreqtrade<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<FtResponse<T>> {
  if (!FT_URL) {
    return {
      ok: false,
      code: "CONN_REFUSED",
      error: "FREQTRADE_URL not configured (.env.local)",
    };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${FT_URL.replace(/\/$/, "")}/api/v1${path}`, {
      method: init?.method ?? "GET",
      headers: {
        ...(FT_AUTH ? { Authorization: FT_AUTH } : {}),
        ...(init?.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        code: res.status === 401 ? "AUTH_FAIL" : "FTD_ERROR",
        error: `Freqtrade returned ${res.status}`,
      };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      code: aborted ? "TIMEOUT" : "CONN_REFUSED",
      error: aborted
        ? `No response within ${TIMEOUT_MS / 1000}s`
        : e instanceof Error
          ? e.message
          : "Connection failed",
    };
  } finally {
    clearTimeout(timer);
  }
}
