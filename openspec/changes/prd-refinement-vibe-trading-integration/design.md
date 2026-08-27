## Context

Current PRD (docs/PRD.md) describes KAIROS as a Freqtrade wrapper with planned phases: Landing (done), Auth + Dashboard, Market Data, Bot Integration, and News. However, it lacks:
- Clear technical workflow bridging AI strategy ideation to automated Freqtrade execution
- Monetization model tying feature access to subscription tiers
- Architecture clarity on how trading results feed back to portfolio dashboards
- Database schema for storing user strategies and subscription state

KAIROS currently runs locally (Next.js + Freqtrade Docker). Supabase handles auth and user data. Freqtrade runs as a separate service with REST API enabled.

## Goals / Non-Goals

**Goals:**
- Define dual-engine architecture: Vibe-Trading (AI analyst) + Freqtrade (execution engine)
- Establish closed-loop workflow: Chat ➔ Backtest ➔ Code Gen ➔ Deploy ➔ Trading ➔ Portfolio PnL
- Implement Freemium tiering (Free: built-in strategies; Paid: custom AI strategies + 1-click deploy)
- Update docs/PRD.md to reflect new capabilities and architecture
- Add database schema for UserSubscription and UserStrategy entities
- Clarify API boundaries and security isolation per user

**Non-Goals:**
- Implement actual Vibe-Trading AI backend (defer to Phase 6+)
- Build payment processing system (defer to Phase 6+)
- Support multi-tenant Freqtrade (single instance per user for now)
- Handle compliance/regulatory requirements (pre-launch work)

## Decisions

### 1. Dual-Engine Architecture (Vibe-Trading + Freqtrade)
**Decision:** Keep Next.js as a UI proxy layer; Vibe-Trading (AI backend, TBD service/library) and Freqtrade (Docker container) remain decoupled.

**Rationale:** Allows independent iteration on AI strategy lab while Freqtrade executes live. Clear boundary between ideation and execution.

**Alternatives considered:**
- Monolithic AI + execution service → tighter coupling, harder to swap Freqtrade for another bot
- Embedded AI in browser → insufficient compute, can't run backtests

### 2. Strategy Code Generation & Storage
**Decision:** Backend generates Python `.py` files validated against Freqtrade template, stores in shared volume (or via API), then triggers REST API reload.

**Rationale:** Freqtrade expects Python scripts in `user_data/strategies/` directory. File-based storage is simplest until we add multi-tenant isolation.

**Alternatives considered:**
- Database-backed strategy storage → adds complexity, Freqtrade still needs files on disk
- Template literals in JavaScript → fragile, harder to validate syntax

### 3. Freemium Paywall
**Decision:** Free tier gets built-in sample strategies only; Paid tier unlocks custom AI strategy generation and 1-click deploy button.

**Rationale:** Simple monetization lever. AI compute (backtest + code gen) costs real resources; restricting to paid makes sense. Built-in strategies give free users value without server load.

**Alternatives considered:**
- Separate "Deploy" product SKU → confusing, users expect deploy with strategy builder
- Rate-limit free tier (e.g., 3 backtests/day) → UX friction, harder to monitor

### 4. PnL Sync: Freqtrade REST API Polling vs WebSocket
**Decision:** Initial fetch via `/api/v1/profit` and `/api/v1/status` on dashboard load; defer WebSocket streaming to Phase 5+.

**Rationale:** RESTful is simpler for MVP, avoids persistent connection overhead. Acceptable for local prototype where latency is sub-second.

**Alternatives considered:**
- WebSocket streaming from Freqtrade → more real-time but adds complexity on both sides
- Server-Sent Events (SSE) → middle ground, defer if not needed

### 5. Database Schema: Supabase vs Local SQLite
**Decision:** Use Supabase PostgreSQL for UserSubscription, UserStrategy, and backtest history (shared user data). Freqtrade SQLite remains isolated for trade execution data.

**Rationale:** Supabase already integrated for auth. Keeps user metadata and subscription state in one place. Freqtrade trade data stays separate to avoid conflicts.

**Alternatives considered:**
- Store everything in Freqtrade SQLite → tight coupling, harder to isolate user data
- Separate microservice for strategy storage → overkill for MVP

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Python code generation errors** → Invalid Freqtrade syntax | Validate generated code structure server-side before save; unit test templates. Add "Preview Code" button for user review. |
| **Multi-user file collision** → Two users' strategy files overwrite each other | For MVP (single-user local), not a blocker. Pre-Phase 6: implement per-user strategy directories and API isolation. |
| **Freqtrade API downtime** → Deployment fails silently | Implement health check before deploy attempt. Show user error message with retry button. |
| **Paywall bypass** → User manually enables paid features in client | Mark features server-side in API response; never trust client tier state. Validate subscription on every deploy API call. |
| **Performance: Backtest on every chat interaction** → Latency spikes | Queue backtest jobs asynchronously; return "backtest in progress" to user. Show results when ready. |

## Migration Plan

**Phase 2-3 (Auth + Dashboard + Market Data):** Build baseline dashboard with portfolio stat cards. No strategy lab yet.

**Phase 4 (Bot Integration):** Add Freqtrade REST API integration; fetch and display bot status, open trades, PnL. Manual strategy management only (upload `.py` files directly).

**Phase 5 (Vibe-Trading AI Strategy Lab):** Implement chat interface, backtest execution, code generation, and 1-click deploy. Add UserSubscription and UserStrategy schema. Gate 1-click deploy with paywall.

**Phase 6+ (Monetization & Multi-Tenant):** Finalize payment processing, implement per-user strategy isolation, security hardening.

## Open Questions

- Vibe-Trading backend: Will it be an internal service (Node.js microservice), a library (Python package in next.js backend), or a third-party API (Claude API calls)? (Deferrable — design specs to allow any option.)
- Backtest execution environment: Run in-process or in a sandboxed container? (Deferrable — MVP can be in-process.)
- Strategy history & versioning: Should users be able to revert to previous strategy versions? (Deferrable — store all versions but don't expose UI yet.)
