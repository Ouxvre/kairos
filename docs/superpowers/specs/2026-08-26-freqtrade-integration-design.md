# Design: Freqtrade Integration & Error Handling

Date: 2026-08-26
Status: Approved

## Summary

Next.js API proxy layer → Freqtrade REST API with SWR for client-side data fetching, conservative retry, and graceful offline UI state. Hybrid credentials: global `.env` during phases 1–2, per-user encrypted credentials from phase 4+.

## Decisions (approved)

| Decision | Value |
|----------|-------|
| Reconnect strategy | Conservative: 5s interval, max 5 retries (25s), then give up |
| Offline UI | Blank slate "Bot unreachable, waiting to reconnect..." |
| User action while offline | Reject immediately + error toast |
| Health polling | 5s while dashboard open |
| Timeout per call | 5s (`AbortController`) |
| Credentials approach | Hybrid — multi-user schema, single-bot implementation |
| Deployment | Full Next.js server — `output: "export"` removed (API routes need a runtime); host TBD (Cloudflare Workers/OpenNext, Vercel, or VPS Node) |

## Architecture

**Approach C: Thin Routes + SWR**

```
Browser ──(SWR, 5s poll)──▶ Next.js API routes ──(fetch, 5s timeout)──▶ Freqtrade :8080
                              │
                              ├─ /api/freqtrade/status   GET  → show_config + balance + status
                              ├─ /api/freqtrade/start    POST → /api/v1/start
                              ├─ /api/freqtrade/stop     POST → /api/v1/stop
                              ├─ /api/freqtrade/reload   POST → /api/v1/reload_config
                              ├─ /api/freqtrade/trades   GET  → status + trades
                              ├─ /api/freqtrade/profit   GET  → profit + daily
                              └─ /api/freqtrade/exit/[id] POST → /api/v1/forceexit
```

Freqtrade credentials never reach the browser. All bot traffic flows through Next.js API routes. Side effect: the browser never calls Freqtrade directly, so the PRD's Freqtrade-side CORS configuration becomes unnecessary.

## Components

### 1. API route wrapper — `lib/freqtrade.ts`

`fetchFreqtrade(path, opts)`:
- Reads credentials from `.env` (`FREQTRADE_URL`, `FREQTRADE_USER`, `FREQTRADE_PASS`) in phases 1–2; from `user_settings` in phase 4+
- 5s timeout via `AbortController`
- Auth: HTTP Basic header on every request (Freqtrade accepts Basic and JWT; Basic is stateless — no token cache, no refresh dance)
- Standardized response: `{ ok: boolean, data?: T, error?: string, code?: 'TIMEOUT'|'CONN_REFUSED'|'AUTH_FAIL'|'FTD_ERROR' }`

### 2. Client data layer — `lib/swr.ts`

Global SWR config:

```ts
{
  revalidateOnFocus: false,
  dedupingInterval: 5000,
  refreshInterval: 5000,
  errorRetryCount: 5,
  errorRetryInterval: 5000,
}
```

Per-feature hooks: `useBotStatus()`, `useOpenTrades()`, `useProfit()`.

New dependency: **swr (~3KB)** — the only package addition.

### 3. Fallback UI — `<BotOfflineFallback />`

On fetch failure: blank slate "Bot unreachable, waiting to reconnect..." with retry countdown indicator. Controls (start/stop/forceexit) disabled. No stale cached data shown (decision 2.b). Auto-recovery when connection returns.

### 4. Credentials schema (hybrid)

```sql
ALTER TABLE user_settings ADD COLUMN freqtrade_username_encrypted TEXT;
ALTER TABLE user_settings ADD COLUMN freqtrade_password_encrypted TEXT;
-- NULL until phase 4; .env used until then
```

Phase 4 enables per-user encryption (pgcrypto or AES with key from env). Migration path documented here; no retroactive schema changes needed later.

## Error Handling Flow

```
Client Action (Start/Stop)
        ↓
API Route Wrapper
        ↓
  ├─ Timeout 5s   → { ok:false, code:'TIMEOUT' }
  ├─ Conn refused → { ok:false, code:'CONN_REFUSED' }
  ├─ 401          → { ok:false, code:'AUTH_FAIL' } (check FREQTRADE_USER/PASS)
  ├─ 5xx          → { ok:false, code:'FTD_ERROR' }
  └─ Success      → { ok:true, data }

SWR Layer
        ↓
  ├─ ok=true  → update store/UI (running/stopped)
  └─ ok=false → toast "Bot disconnected" + blank slate + auto-retry 5s×5 then stop
```

## Testing

- Build verification (`npm run build`) + lint per AGENTS.md after each increment
- Manual integration: kill Freqtrade container → assert offline UI within ≤25s; restart container → auto-recovers on next poll cycle
- Action while offline → toast appears, no queued request fires

## Out of Scope (unchanged)

Offline action queueing, SSE/WebSocket push, encrypted credential storage implementation (phase 4), strategy logic, multi-tenant isolation.
