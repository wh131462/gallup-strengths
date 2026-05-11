## 1. Storage layer

- [x] 1.1 Create `src/services/historyStorage.ts` with `HistoryEntry` / `HistoryStore` types and `STORAGE_KEY = 'strengths-navigator:test-history'`
- [x] 1.2 Implement `loadHistory()` with JSON parse, schema validation, version check, graceful empty fallback
- [x] 1.3 Implement `saveEntry(entry)`, `updateEntry(id, patch)`, `deleteEntry(id)`, `clearAll()`, sorting entries by `createdAt` desc
- [x] 1.4 Implement capacity cap (default 50) and `QuotaExceededError` recovery (drop oldest half, retry once)
- [x] 1.5 Implement `exportHistoryAsJson()` returning a Blob URL + filename helper
- [x] 1.6 Add a small id generator (timestamp + random suffix; no new deps)

## 2. Type extensions

- [x] 2.1 Extend `src/types.ts` (or a new file) with `HistoryEntry`, `HistoryStore`, and `AdvisorReportSnapshot` types referenced by the storage layer

## 3. i18n

- [x] 3.1 Create `src/i18n/locales/zh/history.json` and `en/history.json` with keys: title, empty state, privacy notice, list item labels (top themes / time / has-AI), actions (view, delete, clear all, export, save-snapshot, regenerate), confirm dialog texts
- [x] 3.2 Register the `history` namespace in `src/i18n/index.ts`
- [x] 3.3 Run `npm run check-i18n` and fix any missing keys

## 4. App routing state

- [x] 4.1 Extend `AppState` in [src/App.tsx](src/App.tsx) to include `'history'`
- [x] 4.2 Add state for currently selected history entry id and helpers `openHistory()`, `openHistoryEntry(id)`, `backToHistory()`
- [x] 4.3 Wire navigation so the brand/logo click resets to landing without clobbering history view unintentionally

## 5. History list UI

- [x] 5.1 Create `src/components/HistoryList.tsx` rendering entries (timestamp via `Intl.DateTimeFormat`, top-3 theme names, AI badge)
- [x] 5.2 Add per-entry actions: view, delete (with confirm)
- [x] 5.3 Add toolbar actions: clear all (with confirm), export JSON
- [x] 5.4 Add empty state with privacy notice
- [x] 5.5 Style consistent with existing zinc / dark-mode design language

## 6. Landing page entry point

- [x] 6.1 Add a "History" button/card to [src/components/LandingPage.tsx](src/components/LandingPage.tsx) that calls `openHistory()`
- [x] 6.2 Show a small badge with the count of saved entries (hidden when zero) — optional polish

## 7. ResultsPage integration

- [x] 7.1 Add `readonly?: boolean` and `entry?: HistoryEntry` props to [src/components/ResultsPage.tsx](src/components/ResultsPage.tsx)
- [x] 7.2 When `entry` is provided, skip recomputation and seed `topThemes` / `domainScores` / advisor report from the entry; respect entry's stored `language` for theme name lookup
- [x] 7.3 In non-readonly mode, on first computation auto-create a HistoryEntry and keep its id in state
- [x] 7.4 When the AI report finishes, call `updateEntry(id, { advisorReport })`
- [x] 7.5 Add "Save snapshot" button (non-readonly) that creates a new entry with a fresh id
- [x] 7.6 In readonly mode, replace primary CTA with "Back to history" and add "Regenerate AI report" that overwrites `entry.advisorReport`
- [x] 7.7 Suppress auto-save in readonly mode

## 8. Confirm dialog

- [x] 8.1 Add a minimal confirmation dialog (reuse existing modal styling from `SettingsModal` or build a small one) for delete / clear-all actions

## 9. QA

- [x] 9.1 Manual test: complete a quiz, reload, verify entry appears in history list with correct timestamp and themes
- [x] 9.2 Manual test: generate AI report, verify same entry updates with `advisorReport`
- [x] 9.3 Manual test: open a history entry, verify read-only ResultsPage renders correctly in both languages
- [x] 9.4 Manual test: delete single, clear all, export JSON download
- [x] 9.5 Manual test: simulate quota by populating large dummy entries; verify recovery path keeps newest entry
- [x] 9.6 Run `npm run lint` (tsc --noEmit) and fix type errors
- [x] 9.7 Verify dark mode styling on the new UI
