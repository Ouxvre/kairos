## Purpose

Provides an AI-powered chat lab where users can formulate, discuss, and analyze trading strategies using natural language before execution.

## ADDED Requirements

### Requirement: AI Strategy Chat Interface
The system SHALL provide a dedicated chat interface for users to converse with an AI assistant regarding technical indicators and trading logic.

#### Scenario: User requests strategy advice
- **WHEN** user submits a prompt asking for a moving average crossover strategy
- **THEN** the system returns a detailed strategy explanation with entry and exit rules

### Requirement: Automated Backtest Execution
The system SHALL execute technical backtests on user-defined strategies and present key performance metrics.

#### Scenario: User triggers strategy backtest
- **WHEN** user clicks "Run Backtest" on an AI-generated strategy
- **THEN** the system displays Win Rate, Max Drawdown, and Profitability Ratio metrics
