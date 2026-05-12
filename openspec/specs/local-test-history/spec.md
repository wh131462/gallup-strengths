## ADDED Requirements

### Requirement: Persist completed test results to local storage

The system SHALL persist every completed strengths assessment as a history entry in the browser's localStorage, including answers, computed top themes, domain scores, the locale used during assessment, and the AI advisor report when available.

#### Scenario: Auto-save on results page load
- **WHEN** the user finishes the quiz and the ResultsPage mounts with computed `topThemes` and `domainScores`
- **THEN** the system creates a new HistoryEntry with a unique id, current timestamp, current i18n language, raw answers, top themes, and domain scores, and writes it to localStorage under key `strengths-navigator:test-history`

#### Scenario: Update entry when AI report completes
- **WHEN** the AI advisor report finishes generating for the current results session
- **THEN** the system locates the existing entry by id and updates it with `advisorReport = { markdown, model, generatedAt }` and refreshed `updatedAt`

#### Scenario: Survive page reload
- **WHEN** the user reloads the browser after completing a test
- **THEN** the previously saved entry remains retrievable from localStorage with all fields intact

### Requirement: Schema versioning and safe load

The history store SHALL embed a numeric `version` field and recover gracefully when the stored data is missing, malformed, or from an unknown version.

#### Scenario: Empty storage
- **WHEN** no history key exists in localStorage
- **THEN** loading returns `{ version: 1, entries: [] }` without throwing

#### Scenario: Corrupted JSON
- **WHEN** the stored value cannot be parsed as JSON or fails schema validation
- **THEN** the system logs a warning, returns an empty store, and does not crash the UI

#### Scenario: Unknown future version
- **WHEN** the stored `version` is greater than the version the running app supports
- **THEN** the system returns an empty in-memory store and preserves the original raw value in localStorage (does not overwrite)

### Requirement: Capacity limit and quota recovery

The system SHALL cap the number of stored entries and recover from localStorage quota exhaustion without losing the most recent entry.

#### Scenario: Exceeding capacity
- **WHEN** the entry count would exceed the default cap of 50 after a new save
- **THEN** the oldest entries (smallest `createdAt`) are dropped until the count equals 50

#### Scenario: Quota exceeded on write
- **WHEN** writing to localStorage throws `QuotaExceededError`
- **THEN** the system drops the oldest half of entries and retries once; if it still fails, it surfaces a user-visible error and keeps the in-memory entry available for export

### Requirement: Browse history list

The system SHALL provide a UI surface (accessible from the LandingPage) that lists all saved history entries in reverse chronological order with a concise summary.

#### Scenario: Open history view
- **WHEN** the user clicks the history entry point on the LandingPage
- **THEN** the app navigates to the history view and renders entries sorted by `createdAt` descending, each showing localized timestamp, top 1-3 theme names, and whether an AI report is attached

#### Scenario: Empty history
- **WHEN** no entries are stored
- **THEN** the history view shows an empty state with an explanation that records are stored only in the local browser

### Requirement: View a history entry as read-only results

The system SHALL allow users to open any saved entry and view it using the existing results layout in read-only mode.

#### Scenario: Open detail
- **WHEN** the user clicks an entry in the history list
- **THEN** the ResultsPage renders using the entry's `topThemes`, `domainScores`, and `advisorReport`, without recomputing from answers

#### Scenario: Read-only controls
- **WHEN** ResultsPage is rendered in read-only mode for a history entry
- **THEN** the auto-save side effect is disabled and primary CTA changes to "Back to History"; a secondary action allows regenerating the AI report which overwrites the entry's `advisorReport`

#### Scenario: Locale preservation
- **WHEN** an entry recorded in language A is opened while the UI is set to language B
- **THEN** theme names render using the entry's stored `language` field so the saved content stays consistent

### Requirement: Delete and clear history

The system SHALL allow users to delete a single entry or clear all entries, each guarded by a confirmation step.

#### Scenario: Delete single entry
- **WHEN** the user clicks delete on an entry and confirms
- **THEN** the entry is removed from localStorage and the list re-renders without it

#### Scenario: Clear all
- **WHEN** the user clicks "Clear all" and confirms
- **THEN** all entries are removed and the history view shows the empty state

#### Scenario: Cancel confirmation
- **WHEN** the user dismisses the confirmation dialog
- **THEN** no entries are modified

### Requirement: Export history as JSON

The system SHALL allow users to export the entire history store as a downloadable JSON file.

#### Scenario: Export download
- **WHEN** the user clicks "Export"
- **THEN** the browser downloads a JSON file containing the full `HistoryStore` payload (version + entries) with a filename including the current date

### Requirement: Save-as-snapshot from results page

The system SHALL allow the user to explicitly save the current results as a new snapshot entry, independent of the auto-saved one, so they can preserve a frozen copy for later comparison.

#### Scenario: Create snapshot
- **WHEN** the user clicks "Save snapshot" on a non-read-only ResultsPage
- **THEN** a new HistoryEntry with a new id is appended, capturing the current state (including the AI report if already generated)

### Requirement: Privacy disclosure

The UI SHALL clearly communicate that history is stored only in the user's local browser and is never uploaded.

#### Scenario: History view shows disclaimer
- **WHEN** the history view renders (empty or populated)
- **THEN** a short notice is visible stating that all data is kept in the local browser and may be lost if site data is cleared
