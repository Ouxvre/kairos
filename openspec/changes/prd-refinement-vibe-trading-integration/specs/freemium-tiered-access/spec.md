## Purpose

Enforces access boundaries between free tier users and paid subscribers regarding custom AI strategy deployment.

## ADDED Requirements

### Requirement: Tier-Based Strategy Restriction
The system SHALL restrict custom AI strategy generation and 1-click deployment to Paid Tier subscribers.

#### Scenario: Free tier user attempts 1-click deploy
- **WHEN** free user clicks "Deploy to Freqtrade" on an AI strategy
- **THEN** system blocks the action and displays a paywall upgrade modal
