## Why

Current PRD (docs/PRD.md) lacks clear technical workflow bridging AI-strategy creation with automated execution via Freqtrade, and lacks a structured monetization model for dual-engine capability (Vibe-Trading AI analyst + Freqtrade execution). The architecture section needs clarification about integration boundaries and how trading results feed back into the portfolio dashboard. This refinement establishes KAIROS as an end-to-end platform, not just a passive wrapper.

## What Changes

- **Architecture Update:** Introduce dual-engine architecture (Vibe-Trading AI Analyst & Strategist + Freqtrade Automated Execution Engine) as core technical paradigm.
- **Workflow Integration:** Define clear technical flow: AI Chat → Backtest → Python Code Generation → Auto-Save to Freqtrade Directory → Hot-reload via REST API → Trading Execution → Portfolio PnL History.
- **Monetization Model:** Implement Freemium tiering (Free: built-in strategies only; Paid: custom AI strategies + 1-click deploy to Freqtrade).
- **PRD Updates:** Update docs/PRD.md to reflect new architecture, workflow, and business model.
- **Database Schema:** Add entities for UserSubscription and UserStrategy storage.
- **Security Scope:** Clarify isolation per user for API keys and strategy files.

## Capabilities

### New Capabilities
- **vibe-trading-ai-strategy-lab:** Chat interface for strategy ideation and AI-assisted technical analysis.
- **ai-to-freqtrade-strategy-transfer:** Automated conversion of AI-derived logic to valid Freqtrade Python strategy files.
- **freqtrade-integration-workflow:** REST API integration for strategy file upload, bot reload, and status monitoring.
- **portfolio-pnl-history-sync:** Synchronization of trading results from Freqtrade back to dashboard for portfolio tracking.
- **freemium-tiered-access:** Paywall gating for custom AI strategies and 1-click deployment features.

### Modified Capabilities
- **architecture-system-overview:** Update to include dual-engine architecture and integration workflow.
- **user-dashboard:** Add UI components for strategy lab, deploy buttons, and paywall prompts.

## Impact

- **Frontend:** New UI components (Strategy Lab page, Deploy button, Paywall modal).
- **Backend:** New API endpoints for strategy generation, file management, and Freqtrade integration.
- **Database:** New tables (`UserSubscription`, `UserStrategy`).
- **Dependencies:** Potential new dependencies for Python code generation and Freqtrade client.
- **Security:** Enhanced sandboxing requirements for multi-user strategy isolation.