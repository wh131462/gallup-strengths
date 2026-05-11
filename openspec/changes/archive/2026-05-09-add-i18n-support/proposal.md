## Why

The Strengths Navigator app currently has all UI text hardcoded in Chinese, limiting accessibility for English-speaking users. Adding internationalization (i18n) with English/Chinese switching expands the user base and provides a foundation for future locale support.

## What Changes

- Introduce an i18n system with translation resources for English (`en`) and Chinese (`zh`).
- Extract all hardcoded UI strings from `LandingPage`, `QuizPage`, `ResultsPage`, `SettingsModal`, and shared constants into translation files.
- Add a language switcher control (accessible from the landing page header and/or settings modal).
- Persist the user's language preference in `localStorage` and detect browser language as the initial default.
- Translate quiz question content and strength descriptions in `constants.ts` so assessment content is fully localized.
- Pass the active locale to AI/LLM prompts in `services/` so generated content is returned in the user's language.

## Capabilities

### New Capabilities
- `i18n`: Manages locale state, translation lookup, language switching, persistence, and exposes a hook/context for components to consume translated strings.

### Modified Capabilities
<!-- None — no existing specs in openspec/specs/ -->

## Impact

- **Code**: New `src/i18n/` directory (config, locales, hook/context). Updates across `src/components/*.tsx`, `src/App.tsx`, `src/constants.ts`, and `src/services/*` to consume translations.
- **Dependencies**: Add a lightweight i18n library (e.g., `react-i18next` + `i18next`) or a minimal in-house implementation.
- **AI prompts**: Service-layer prompts must include locale so generated descriptions match the selected language.
- **Storage**: New `localStorage` key for language preference.
