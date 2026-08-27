## Purpose

Manages the secure file transfer and hot-reloading of generated strategies into the Freqtrade execution container via REST API.

## ADDED Requirements

### Requirement: Automatic Strategy Storage
The system SHALL store generated strategy `.py` files into the Freqtrade user_data/strategies directory.

#### Scenario: User deploys strategy
- **WHEN** user confirms deployment of an AI strategy
- **THEN** backend saves the `.py` file to the strategies directory

### Requirement: Freqtrade Hot-Reload Trigger
The system SHALL invoke the Freqtrade REST API to reload configuration and activate the new strategy without container restart.

#### Scenario: Successful strategy deployment
- **WHEN** strategy file is saved successfully
- **THEN** system triggers `/api/v1/reload_config` on Freqtrade and returns active status
