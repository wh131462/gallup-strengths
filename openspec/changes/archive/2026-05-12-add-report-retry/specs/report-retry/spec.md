## ADDED Requirements

### Requirement: Automatic retry on transient failures

The AI report generation SHALL automatically retry the underlying request when it fails due to transient errors. Transient errors are defined as network-layer failures (`TypeError` from fetch), HTTP status `429`, or HTTP status `>= 500`. Non-transient errors (configuration errors, HTTP `4xx` except `429`) MUST NOT be retried.

The system SHALL perform at most 2 automatic retries (3 total attempts) using exponential backoff `500ms * 2^(attempt-1)` with ±20% jitter, capped at 4000ms. If the response carries a `Retry-After` header with a value of 10 seconds or less, that value SHALL be honored instead of the computed backoff.

#### Scenario: Network error recovers on second attempt
- **WHEN** the first fetch call rejects with `TypeError` and the second call resolves successfully
- **THEN** `analyzeStrengths` SHALL resolve with the report markdown and SHALL NOT throw

#### Scenario: Rate limit triggers retry
- **WHEN** the first fetch resolves with HTTP `429` and the next attempt succeeds
- **THEN** the system SHALL wait at least the backoff (or `Retry-After`, whichever applies) before retrying, and SHALL return the eventual success

#### Scenario: Configuration error is not retried
- **WHEN** the service detects missing API key (`AIConfigError`)
- **THEN** the error SHALL be thrown immediately without any retry attempt

#### Scenario: 400 Bad Request is not retried
- **WHEN** the API returns HTTP `400`
- **THEN** the error SHALL be thrown immediately without any retry attempt

#### Scenario: All retries exhausted
- **WHEN** every attempt (initial + 2 retries) fails with a transient error
- **THEN** the system SHALL throw the most recent error to the caller

### Requirement: Retry progress callback

`analyzeStrengths` SHALL accept an optional `onAttempt` callback in its options object. The callback SHALL be invoked before each fetch attempt with `{ attempt: number, max: number, reason: 'initial' | 'retry' }`, where `attempt` is 1-based and `max` is the total attempt budget.

#### Scenario: First attempt reports initial
- **WHEN** `analyzeStrengths` is called with `onAttempt`
- **THEN** the callback SHALL fire once with `{ attempt: 1, max: 3, reason: 'initial' }` before the first fetch

#### Scenario: Retry attempt reports retry
- **WHEN** the first attempt fails transiently and a retry is scheduled
- **THEN** the callback SHALL fire again with `{ attempt: 2, max: 3, reason: 'retry' }` after the backoff and before the next fetch

### Requirement: Cancellable retry loop

`analyzeStrengths` SHALL accept an optional `AbortSignal`. When the signal is aborted, any in-flight fetch SHALL be cancelled and any pending backoff sleep SHALL be interrupted; the function SHALL throw an `AbortError`-shaped error and SHALL NOT invoke further `onAttempt` callbacks.

#### Scenario: Caller aborts during backoff
- **WHEN** the first attempt fails and the caller aborts the signal during the backoff sleep
- **THEN** the function SHALL reject with an abort error and SHALL NOT perform another fetch

#### Scenario: Caller aborts during fetch
- **WHEN** the signal is aborted while a fetch is in flight
- **THEN** the fetch SHALL be cancelled and the function SHALL reject with an abort error

### Requirement: Retry status surfaced in ResultsPage

While `analyzeStrengths` is retrying, the ResultsPage advisor card SHALL display a localized status line `Retrying ({{attempt}}/{{max}})` (key `common:retrying`) in place of the static skeleton. On the initial attempt the existing skeleton SHALL remain.

#### Scenario: First retry visible to user
- **WHEN** the report generation enters its 2nd attempt
- **THEN** the advisor card SHALL show the text bound to `common:retrying` interpolated with `{ attempt: 2, max: 3 }`

#### Scenario: Final failure surfaces error and manual retry
- **WHEN** all attempts fail
- **THEN** the advisor card SHALL render the error message and the existing manual `common:retry` button

### Requirement: User-initiated regeneration

When the report has been generated successfully, the ResultsPage advisor card AND the ReportReader overlay SHALL each expose a `common:regenerate` button. Activating it SHALL clear the current report, invoke `analyzeStrengths` again with the same top themes, and on success overwrite the `advisorReport` field of the corresponding history entry. The button SHALL be disabled and show `common:regenerating` while the new request is in flight.

#### Scenario: Regenerate from results card
- **WHEN** the user clicks `Regenerate` on the advisor card
- **THEN** the card SHALL enter the retry/loading state, eventually render the new report, and the matching history entry's `advisorReport` SHALL be updated

#### Scenario: Regenerate from reader overlay
- **WHEN** the user clicks `Regenerate` inside the ReportReader
- **THEN** the same regeneration flow SHALL run and the overlay SHALL display the refreshed markdown without being closed

#### Scenario: Regenerate is unavailable in readonly history view without saved themes
- **WHEN** the page is in readonly mode and no `savedThemes` are available
- **THEN** the regenerate button SHALL NOT be rendered
