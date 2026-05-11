## Context

The app is a Vite + React 19 + TypeScript SPA with all UI text and quiz content in Chinese, hardcoded across components and `constants.ts`. There is no existing i18n infrastructure. AI-generated content from `services/` returns text in whatever language the prompt is written in (currently Chinese). Users cannot switch languages.

## Goals / Non-Goals

**Goals:**
- Provide runtime language switching between English (`en`) and Chinese (`zh`) without page reload.
- Externalize all user-facing strings (UI chrome, quiz questions, strength names/descriptions) into per-locale resource files.
- Persist the user's choice across sessions and detect a sensible default from the browser.
- Ensure AI-generated text returns in the active locale.
- Keep bundle impact small and developer ergonomics good (typed keys, autocomplete-friendly).

**Non-Goals:**
- Supporting locales beyond `en` and `zh` in this change (architecture should allow it later).
- Right-to-left language support.
- Server-side rendering or route-based locale URLs.
- Translating backend/server logs.

## Decisions

### 1. Library: `react-i18next` + `i18next`
Mature, widely-adopted, supports namespaces, interpolation, lazy loading, and has first-class React 19 hooks (`useTranslation`). Lightweight enough (~40KB gzipped combined).

**Alternatives considered:**
- **Custom Context-based solution**: Smaller bundle but reinvents pluralization, interpolation, and namespace logic. Rejected — not worth maintenance burden.
- **`react-intl` (FormatJS)**: Heavier, ICU-message-syntax-first, more verbose for a 2-locale app. Rejected.
- **`@lingui/react`**: Great DX but requires a build-time extraction step. Rejected — adds tooling complexity for a small app.

### 2. Resource organization
Locale files live at `src/i18n/locales/{en,zh}/{common,landing,quiz,results,settings,strengths}.json`. Namespaces map to feature areas so each component imports only what it needs. Keys use `dot.notation` and English-readable identifiers (not Chinese).

### 3. Locale detection & persistence
Use `i18next-browser-languagedetector` with detection order: `localStorage` → `navigator` → fallback `zh`. Cache to `localStorage` under key `app.language`. Default fallback is `zh` (current user base) when neither English nor Chinese is detectable.

### 4. Typed translation keys
Generate a `Resources` type from the English JSON via TypeScript module augmentation (`react-i18next.d.ts`) so `t('key.path')` is autocompleted and typo-checked.

### 5. Quiz content & strength catalog
Move the question/strength data structures in `constants.ts` from inline strings to translation keys (e.g., `quiz.questions.q1.text`, `strengths.leadership.name`). Components resolve them via `t()` at render time. Numeric/structural data (IDs, score weights, ordering) stays in `constants.ts`.

### 6. AI prompt locale
Service functions in `src/services/` accept the active locale and inject an instruction like `"Respond in {language}"` into prompts. The active locale is read from `i18n.language` at call time (no need to thread through every component).

### 7. Language switcher UX
A compact dropdown/toggle in the `SettingsModal` (primary) and a small icon button in the landing page header (secondary). Switching is instant — `i18n.changeLanguage(code)` triggers re-render via the `useTranslation` hook.

## Risks / Trade-offs

- **Translation drift between locales** → Mitigation: keep `en` as the source-of-truth namespace; add a lint script (or simple Node check) that fails CI if `zh` is missing keys present in `en`.
- **AI may ignore the language instruction** → Mitigation: include locale at the very top of the system prompt and add a brief regenerate-with-language fallback if output language doesn't match.
- **Large quiz content blob increases bundle** → Mitigation: namespace splitting + i18next lazy `loadNamespaces` so the strengths catalog loads only when results render.
- **Mid-quiz language switch could disorient users** → Mitigation: switching is allowed but quiz answers/state are unaffected; only display strings change.
- **Hardcoded layouts may break with longer English strings** → Mitigation: visually QA each screen in both locales; rely on Tailwind's flex/wrap utilities already in use.

## Migration Plan

1. Add dependencies and i18n bootstrap module; wire into `main.tsx`.
2. Extract strings page-by-page (landing → quiz → results → settings) behind feature-by-feature commits so each is independently reviewable.
3. Migrate `constants.ts` quiz/strength content last (largest blob).
4. Update services to accept/use locale.
5. Add language switcher UI.
6. No data migration needed; persistence key is new.

**Rollback:** revert the commits — there is no schema/data change.
