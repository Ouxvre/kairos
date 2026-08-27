## Purpose

Synchronizes live trading performance and PnL history from Freqtrade back to the main user dashboard portfolio view.

## ADDED Requirements

### Requirement: Real-time PnL Tracking
The system SHALL fetch current open trades and closed trade history from Freqtrade REST API to display unified portfolio PnL.

#### Scenario: User opens dashboard
- **WHEN** user navigates to the dashboard portfolio tab
- **THEN** system fetches `/api/v1/status` and `/api/v1/profit` and updates portfolio summary cards
