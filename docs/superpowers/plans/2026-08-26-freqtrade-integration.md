# Freqtrade Integration & Error Handling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Server-side Freqtrade REST proxy with SWR client hooks and graceful offline UI, wired into the existing dashboard Bot + Trades pages.

**Architecture:** One catch-all API route (`/api/freqtrade/[...action]`) proxies a whitelist of actions to Freqtrade with Basic auth + 5s timeout, returning `{ok, data?, error?, code?}`. Client uses SWR (5s poll, 5 retries × 5s) via three hooks; on failure pages render `<BotOfflineFallback />`. Static export is removed (`output: "export"` deleted) because route handlers need a server runtime.

**Tech Stack:** Next.js 16 App Router (route handlers), React 19, Tailwind v4, SWR (~3KB, only new dep), Supabase MCP for schema migration.

**Spec:** `docs/superpowers/specs/2026-08-26-freqtrade-integration-design.md` (approved)

## Global Constraints

- Windows PowerShell: use `npm.cmd`, never bare `npm`.
- Verification = `npm.cmd run build` + `npm.cmd run lint` (+ visual pass). No test framework by design (AGENTS.md).
- No code comments unless marking a deliberate ceiling (`ponytail:` comment).
- Dashboard styling convention: `rounded-xl border border-white/10 bg-white/5 backdrop-blur-md` panels, `text-white/*` scale, `font-serif` headings — copy from existing pages.
- Only new dependency allowed: `swr`.
- Env vars are server-side only: `FREQTRADE_URL`, `FREQTRADE_USER`, `FREQTRADE_PASS` (no `NEXT_PUBLIC_` prefix).

---

### Task 1: Remove static export + env scaffolding

**Files:**
- Modify: `next.config.ts`
- Create: `.env.example`

**Interfaces:**
- Produces: server-capable Next build; `.env.example` documenting the three `FREQTRADE_*` vars consumed by Task 2.

- [ ] **Step 1: Edit `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

export default nextConfig;
```

(`output: "export"` line deleted; `images.unoptimized` kept — avoids adding sharp.)

- [ ] **Step 2: Create `.env.example`**

First read `.env.local` key names if it exists (values stay secret) and mirror them; then ensure this content:

```
# Supabase (client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Freqtrade REST API (server-side only — never exposed to browser)
FREQTRADE_URL=http://localhost:8080
FREQTRADE_USER=freqtrader
FREQTRADE_PASS=change_me
```

Also append the three `FREQTRADE_*` lines to your local `.env.local` with real values (defaults fine even without Freqtrade running).

- [ ] **Step 3: Verify build passes without export mode**

Run: `npm.cmd run build`
Expected: success, no "output: export" in output summary; route handlers now allowed.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts .env.example
git commit -m "build: drop static export for server runtime"
```

---

### Task 2: Freqtrade proxy lib + catch-all API route

**Files:**
- Create: `src/lib/freqtrade.ts`
- Create: `src/app/api/freqtrade/[...action]/route.ts`

**Interfaces:**
- Produces (server): `fetchFreqtrade<T>(path: string, init?: { method?: string; body?: unknown }): Promise<FtResponse<T>>`
- Produces (shared types): `FtErrorCode`, `FtResponse<T>`, `BotConfig`, `OpenTrade`, `ClosedTrade`, `ProfitSummary`
- Produces (HTTP): `GET /api/freqtrade/status|trades|profit`, `POST /api/freqtrade/start|stop|reload|exit/{id}` — all returning `FtResponse`.

- [ ] **Step 1: Create `src/lib/freqtrade.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/app/api/freqtrade/[...action]/route.ts`**

```ts
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
```

- [ ] **Step 3: Build + verify offline contract**

Run: `npm.cmd run build && npm.cmd run lint`
Expected: pass.

Then start dev server (`npm.cmd run dev`) and:
Run: `curl -s http://localhost:3000/api/freqtrade/status`
Expected: `{"ok":false,"code":"CONN_REFUSED","error":"..."}` (Freqtrade not running — this IS the designed offline path).

Run: `curl -s http://localhost:3000/api/freqtrade/bogus`
Expected: `{"ok":false,"code":"FTD_ERROR","error":"Unknown endpoint: GET /bogus"}` with HTTP 404.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/lib/freqtrade.ts src/app/api/freqtrade
git commit -m "feat: freqtrade REST proxy with timeout + standardized errors"
```

---

### Task 3: SWR client layer

**Files:**
- Create: `src/lib/swr.ts`
- Modify: `package.json` (adds `swr`)

**Interfaces:**
- Consumes: types from `src/lib/freqtrade.ts`.
- Produces (client): `useBotConfig(): SWR response of BotConfig`, `useTrades(): SWR response of { open: OpenTrade[]; closed: ClosedTrade[] }`, `ftAction(action: string): Promise<void>` (POST + throw `FtError`), class `FtError extends Error { code: string }`, export `swrConfig`.

- [ ] **Step 1: Install swr**

Run: `npm.cmd install swr`
Expected: added to dependencies.

- [ ] **Step 2: Create `src/lib/swr.ts`**

```ts
import useSWR, { type SWRConfiguration } from "swr";

import type { BotConfig, ClosedTrade, OpenTrade } from "@/lib/freqtrade";

export class FtError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "FtError";
  }
}

export interface TradesPayload {
  open: OpenTrade[];
  closed: ClosedTrade[];
}

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  dedupingInterval: 5000,
  refreshInterval: 5000,
  errorRetryCount: 5,
  errorRetryInterval: 5000,
};

async function ftFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const payload = await res.json();
  if (!payload.ok) throw new FtError(payload.code ?? "FTD_ERROR", payload.error);
  return payload.data as T;
}

export function useBotConfig() {
  return useSWR<BotConfig>("/api/freqtrade/status", ftFetcher, swrConfig);
}

export function useTrades() {
  return useSWR<TradesPayload>("/api/freqtrade/trades", ftFetcher, swrConfig);
}

export async function ftAction(action: string): Promise<void> {
  const res = await fetch(`/api/freqtrade/${action}`, { method: "POST" });
  const payload = await res.json();
  if (!payload.ok) throw new FtError(payload.code ?? "FTD_ERROR", payload.error);
}
```

- [ ] **Step 3: Build + commit**

Run: `npm.cmd run build`
Expected: pass.

```bash
git add package.json package-lock.json src/lib/swr.ts
git commit -m "feat: swr client layer for freqtrade endpoints"
```

---

### Task 4: Offline fallback component

**Files:**
- Create: `src/components/dashboard/bot-offline-fallback.tsx`

**Interfaces:**
- Produces: `<BotOfflineFallback error?: string />` — blank-slate offline panel per spec decision 2.b.

- [ ] **Step 1: Create component**

```tsx
export function BotOfflineFallback({ error }: { error?: string }) {
  return (
    <section className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-md">
      <span className="relative flex size-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
        <span className="relative inline-flex size-3 rounded-full bg-red-500" />
      </span>
      <h2 className="mt-4 font-serif text-xl text-white">
        Bot unreachable, waiting to reconnect...
      </h2>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        Kairos retries every 5 seconds, up to 5 attempts. Make sure your
        Freqtrade container is running.
      </p>
      {error && (
        <p className="mt-3 break-all font-mono text-xs text-red-300">{error}</p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Lint + commit**

Run: `npm.cmd run lint`
Expected: pass.

```bash
git add src/components/dashboard/bot-offline-fallback.tsx
git commit -m "feat: bot offline fallback panel"
```

---

### Task 5: Bot control page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/bot/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useBotConfig()`, `ftAction()`, `FtError` from `@/lib/swr`; `BotOfflineFallback` from Task 4.
- Produces: working start/stop/reload controls with inline action errors.

- [ ] **Step 1: Rewrite page**

```tsx
"use client";

import { useState } from "react";

import { BotOfflineFallback } from "@/components/dashboard/bot-offline-fallback";
import { FtError, ftAction, useBotConfig } from "@/lib/swr";

type Action = "start" | "stop" | "reload";

const ACTIONS: { id: Action; label: string }[] = [
  { id: "start", label: "Start Bot" },
  { id: "stop", label: "Stop Bot" },
  { id: "reload", label: "Reload Config" },
];

export default function BotPage() {
  const { data: config, error, isLoading, mutate } = useBotConfig();
  const [busy, setBusy] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) return <BotOfflineFallback error={error.message} />;

  if (isLoading || !config) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/40 backdrop-blur-md">
        Loading bot status…
      </div>
    );
  }

  const running = config.state === "running";

  async function run(action: Action) {
    setBusy(action);
    setActionError(null);
    try {
      await ftAction(action);
      await mutate();
    } catch (e) {
      setActionError(e instanceof FtError ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-3xl text-white">Bot Control</h1>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-white">
              {config.bot_name || "Freqtrade"}
            </h2>
            <p className="mt-1 font-mono text-xs text-white/40">
              {config.exchange} · {config.strategy}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${
              running
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {running ? "Running" : "Stopped"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-white/10 px-2 py-1 text-white/70">
            {config.dry_run ? "Dry-run" : "Live"}
          </span>
          {config.dry_run_wallet != null && (
            <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-white/70">
              Paper wallet: {config.dry_run_wallet.toLocaleString()} USDT
            </span>
          )}
          {config.max_open_trades != null && (
            <span className="rounded-md bg-white/10 px-2 py-1 text-white/70">
              Max open trades: {config.max_open_trades}
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {ACTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => run(id)}
              disabled={busy !== null}
              className={`rounded-lg px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                id === "start"
                  ? "bg-emerald-600/80 text-white hover:bg-emerald-600"
                  : id === "stop"
                    ? "bg-red-600/80 text-white hover:bg-red-600"
                    : "border border-white/15 bg-transparent text-white/80 hover:bg-white/10"
              }`}
            >
              {busy === id ? "Working…" : label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Visual verification (offline path)**

Start `npm.cmd run dev`, log in, open `http://localhost:3000/dashboard/bot`.
Expected: after ≤25s the page shows `<BotOfflineFallback />` ("Bot unreachable, waiting to reconnect...") since Freqtrade isn't running. If Docker/Freqtrade IS available: expect live config card, Start toggles state badge to Running.

- [ ] **Step 3: Build + commit**

Run: `npm.cmd run build`
Expected: pass.

```bash
git add "src/app/(dashboard)/dashboard/bot/page.tsx"
git commit -m "feat: bot control page with live status + graceful offline state"
```

---

### Task 6: Trades page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/trades/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useTrades()`, `ftAction("exit/{id}")`, `FtError` from `@/lib/swr`; `BotOfflineFallback` from Task 4.
- Produces: open trades table with force-exit, closed trades table.

- [ ] **Step 1: Rewrite page**

```tsx
"use client";

import { useState } from "react";

import { BotOfflineFallback } from "@/components/dashboard/bot-offline-fallback";
import { FtError, ftAction, useTrades } from "@/lib/swr";

const fmtPrice = (v: number) =>
  v >= 1000 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v.toPrecision(6);

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

function duration(from: string, to?: string) {
  const ms = (to ? new Date(to) : Date.now()) - new Date(from).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.round((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function TradesPage() {
  const { data, error, isLoading, mutate } = useTrades();
  const [exiting, setExiting] = useState<number | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  if (error) return <BotOfflineFallback error={error.message} />;

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/40 backdrop-blur-md">
        Loading trades…
      </div>
    );
  }

  async function forceExit(tradeId: number) {
    if (!window.confirm(`Force exit trade #${tradeId}?`)) return;
    setExiting(tradeId);
    setPageError(null);
    try {
      await ftAction(`exit/${tradeId}`);
      await mutate();
    } catch (e) {
      setPageError(e instanceof FtError ? e.message : "Exit failed");
    } finally {
      setExiting(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif text-3xl text-white">Trades</h1>

      {pageError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
          {pageError}
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-4 font-serif text-lg text-white">Open Positions</h2>
        {data.open.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">
            No open positions. Start your bot to enter trades.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="pb-2 font-normal">#</th>
                <th className="pb-2 font-normal">Pair</th>
                <th className="pb-2 text-right font-normal">Entry</th>
                <th className="pb-2 text-right font-normal">Current</th>
                <th className="pb-2 text-right font-normal">P&amp;L</th>
                <th className="pb-2 text-right font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {data.open.map((t) => {
                const up = (t.profit_ratio ?? 0) >= 0;
                return (
                  <tr key={t.trade_id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-white/50">{t.trade_id}</td>
                    <td className="py-2 text-white/80">{t.pair}</td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {fmtPrice(t.open_rate)}
                    </td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {t.current_rate != null ? fmtPrice(t.current_rate) : "—"}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.profit_ratio != null ? fmtPct(t.profit_ratio) : "—"}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => forceExit(t.trade_id)}
                        disabled={exiting !== null}
                        className="rounded-md border border-red-400/30 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {exiting === t.trade_id ? "Exiting…" : "Exit"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-4 font-serif text-lg text-white">Trade History</h2>
        {data.closed.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">
            No closed trades yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="pb-2 font-normal">#</th>
                <th className="pb-2 font-normal">Pair</th>
                <th className="pb-2 text-right font-normal">Entry</th>
                <th className="pb-2 text-right font-normal">Exit</th>
                <th className="pb-2 text-right font-normal">Profit</th>
                <th className="pb-2 font-normal">Reason</th>
                <th className="pb-2 text-right font-normal">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.closed.map((t) => {
                const up = (t.close_profit ?? 0) >= 0;
                return (
                  <tr key={t.trade_id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-white/50">{t.trade_id}</td>
                    <td className="py-2 text-white/80">{t.pair}</td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {fmtPrice(t.open_rate)}
                    </td>
                    <td className="py-2 text-right font-mono text-white/80">
                      {t.close_rate != null ? fmtPrice(t.close_rate) : "—"}
                    </td>
                    <td
                      className={`py-2 text-right font-mono ${
                        up ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.close_profit != null ? fmtPct(t.close_profit) : "—"}
                    </td>
                    <td className="py-2 text-white/60">{t.exit_reason ?? "—"}</td>
                    <td className="py-2 text-right text-white/60">
                      {duration(t.open_date, t.close_date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm.cmd run build && npm.cmd run lint`
Expected: pass.

Visual: with dev server running, `/dashboard/trades` shows `<BotOfflineFallback />` when Freqtrade is down; tables render once Freqtrade is up (empty-state messages if no trades).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(dashboard)/dashboard/trades/page.tsx"
git commit -m "feat: trades page — open/closed tables with force-exit"
```

---

### Task 7: Supabase credential columns

**Files:**
- Remote migration via Supabase MCP (no repo file changes)

**Interfaces:**
- Produces: `user_settings.freqtrade_username_encrypted`, `user_settings.freqtrade_password_encrypted` (both TEXT, NULL until phase 4+).

- [ ] **Step 1: Inspect current schema**

Via Supabase MCP `list_tables` (public schema): check whether `user_settings` exists.

- [ ] **Step 2: Apply migration**

Name: `add_freqtrade_user_credential_columns`

If table exists:

```sql
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS freqtrade_username_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS freqtrade_password_encrypted TEXT;
```

If missing, create full table first (PRD schema + new columns):

```sql
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  freqtrade_url TEXT DEFAULT 'http://localhost:8080',
  freqtrade_username_encrypted TEXT,
  freqtrade_password_encrypted TEXT,
  preferred_pairs TEXT[] DEFAULT '{BTC/USDT,ETH/USDT}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

- [ ] **Step 3: Verify**

Query information_schema for the two columns; expected: both present, nullable.

---

## Self-Review Notes

- Spec coverage: proxy routes ✓ (Task 2), SWR layer + retry config ✓ (Task 3), fallback UI ✓ (Task 4), controls disabled while offline ✓ (Task 5 — buttons unmount entirely on offline, stricter than disabling), force-exit ✓ (Task 6), hybrid credential columns ✓ (Task 7), deployment flip ✓ (Task 1).
- Placeholder scan: none — all steps carry full code or SQL.
- Type consistency: `TradesPayload{open,closed}` matches route's combined shape; hook names (`useBotConfig`, `useTrades`) consistent across Tasks 3/5/6; `ftAction("exit/"+id)` matches `POST exit/[arg]` dispatch.
