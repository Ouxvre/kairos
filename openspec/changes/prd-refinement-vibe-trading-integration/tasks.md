## 1. Update PRD Documentation

- [x] 1.1 Replace current PRD (docs/PRD.md) with updated dual-engine architecture and monetization model; verify file exists and contains sections: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes

- [x] 1.2 Add PRD Supplement section "Dual-Engine Strategy Architecture & Monetization Model" covering: Vibe-Trading AI Analyst, Freqtrade Execution Engine, AI-to-Freqtrade Strategy Transfer workflow, and Freemium tier table; verify supplement section is present with explicit workflow steps

## 2. Database Schema Additions (Supabase)

- [ ] 2.1 Create `UserSubscription` table with columns: `user_id` (FK to auth.users), `tier` (free/paid), `status` (active/canceled), `created_at`, `updated_at`; verify migration applies without errors and table appears in list_tables

- [ ] 2.2 Create `UserStrategy` table with columns: `id` (UUID), `user_id` (FK), `strategy_name` (text), `description` (text), `generated_python_code` (text), `backtest_metrics` (jsonb), `created_at`; verify migration applies and table appears

## 3. UI Components (Strategy Lab & Dashboard)

- [ ] 3.1 Create Strategy Lab page (`/app/strategy-lab/page.tsx`) with chat interface mock and strategy backtest button; verify page loads without errors and displays placeholder UI

- [ ] 3.2 Add "Deploy to Freqtrade Terminal" button component with paywall gating logic; verify button renders and toggles paywall modal based on mock subscription state

## 4. Backend Integration (Freqtrade API)

- [ ] 4.1 Implement API route (`/api/freqtrade/status`) that fetches Freqtrade bot status via `GET /api/v1/show_config`; verify endpoint returns valid JSON with bot status

- [ ] 4.2 Implement API route (`/api/freqtrade/deploy-strategy`) that accepts strategy Python code and saves to `user_data/strategies/`; verify file creation and logs confirm save location

## 5. Portfolio PnL Sync

- [ ] 5.1 Create dashboard portfolio component that fetches from `/api/freqtrade/profit` and `/api/freqtrade/status`; verify component displays mock PnL data without build errors

- [ ] 5.2 Implement API route (`/api/freqtrade/profit`) that fetches and caches profit data from Freqtrade REST API; verify endpoint returns profit summary JSON structure

## 6. Verification & Testing

- [ ] 6.1 Run `npm.cmd run build` and verify no TypeScript errors; confirm build completes successfully

- [ ] 6.2 Run `npm.cmd run lint` and fix any linting issues; confirm lint passes with zero warnings

- [ ] 6.3 Visual verification: Run dev server, navigate to /strategy-lab and confirm paywall modal appears for free tier users; confirm mock deploy button works