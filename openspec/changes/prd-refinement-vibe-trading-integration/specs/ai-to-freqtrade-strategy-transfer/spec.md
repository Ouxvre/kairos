## Purpose

Automates the conversion of AI-derived trading strategies into valid Python script files compatible with the Freqtrade execution engine.

## ADDED Requirements

### Requirement: Strategy Code Generation
The system SHALL parse AI chat output and generate a fully compliant Freqtrade Python strategy script (`.py`).

#### Scenario: User requests strategy export
- **WHEN** user approves an AI strategy and clicks "Generate Python Code"
- **THEN** the system generates a syntactically valid Freqtrade strategy file with custom populate_indicators and populate_buy_trend methods

### Requirement: Code Validation
The system SHALL validate the generated Python code structure before saving it to the execution directory.

#### Scenario: Invalid strategy logic detected
- **WHEN** generated strategy lacks required Freqtrade methods
- **THEN** the system prompts the AI to fix the code syntax before export
