## 1. Setup & Dependencies

- [x] 1.1 Add `i18next`, `react-i18next`, and `i18next-browser-languagedetector` to `package.json`
- [x] 1.2 Create `src/i18n/` directory with `index.ts` bootstrap and `locales/{en,zh}/` folders
- [x] 1.3 Configure i18next with language detector (order: `localStorage` → `navigator` → fallback `zh`), `localStorage` key `app.language`, and namespaces: `common`, `landing`, `quiz`, `results`, `settings`, `strengths`
- [x] 1.4 Import the i18n bootstrap in `src/main.tsx` before `<App />` renders
- [x] 1.5 Add `react-i18next.d.ts` module augmentation to type translation keys from the `en` resource

## 2. Resource Files (English source-of-truth + Chinese)

- [x] 2.1 Create `locales/en/common.json` (buttons, labels, generic strings) and mirror in `locales/zh/common.json`
- [x] 2.2 Create `locales/en/landing.json` and `locales/zh/landing.json` (LandingPage strings)
- [x] 2.3 Create `locales/en/quiz.json` and `locales/zh/quiz.json` (QuizPage chrome — instructions, navigation, progress)
- [x] 2.4 Create `locales/en/results.json` and `locales/zh/results.json` (ResultsPage chrome)
- [x] 2.5 Create `locales/en/settings.json` and `locales/zh/settings.json` (SettingsModal labels including language switcher)
- [x] 2.6 Create `locales/en/strengths.json` and `locales/zh/strengths.json` containing all quiz questions, answer options, and strength names/descriptions keyed by stable IDs
- [x] 2.7 Add a small Node script (e.g., `scripts/check-i18n.mjs`) that fails if any key in `en/*.json` is missing from `zh/*.json`

## 3. Refactor `constants.ts`

- [x] 3.1 Replace inline question/answer text with stable IDs and translation key references
- [x] 3.2 Replace inline strength names/descriptions with translation key references; keep IDs, weights, and ordering in code
- [x] 3.3 Update `src/types.ts` if needed so consumers expect IDs/keys rather than literal strings

## 4. Component Refactor

- [x] 4.1 Refactor `LandingPage.tsx` to use `useTranslation('landing')` and replace all hardcoded strings
- [x] 4.2 Refactor `QuizPage.tsx` to use `useTranslation(['quiz','strengths','common'])` and resolve question/option text via `t()`
- [x] 4.3 Refactor `ResultsPage.tsx` to use `useTranslation(['results','strengths','common'])` and resolve strength names/descriptions via `t()`
- [x] 4.4 Refactor `SettingsModal.tsx` to use `useTranslation('settings')` and embed the language switcher control
- [x] 4.5 Refactor `App.tsx` (and any remaining string literals) to consume translations

## 5. Language Switcher UI

- [x] 5.1 Implement a `LanguageSwitcher` component with EN/中文 options that calls `i18n.changeLanguage(code)`
- [x] 5.2 Mount the switcher in `SettingsModal`
- [x] 5.3 Add a compact icon-button variant in the landing page header
- [x] 5.4 Verify selection is persisted to `localStorage` and survives reload

## 6. AI Service Locale Awareness

- [x] 6.1 Update each function in `src/services/` to read the active locale from `i18n.language` (or accept it as a parameter)
- [x] 6.2 Inject a language directive at the top of LLM prompts (e.g., `Respond in English.` / `请用中文回答。`)
- [x] 6.3 Manually verify generated content matches the active locale for both `en` and `zh`

## 7. Verification

- [x] 7.1 Run `npm run lint` (tsc) — no type errors, especially around translation keys
- [x] 7.2 Run the i18n key-parity check script — passes
- [x] 7.3 Start dev server and walk landing → quiz → results in `zh`; verify all strings localized
- [x] 7.4 Switch to `en` and repeat the walk; verify no Chinese strings leak through and layouts handle longer English text
- [x] 7.5 Reload the app and confirm the chosen locale persists
- [x] 7.6 Switch locale mid-quiz and confirm answers/progress are preserved
- [x] 7.7 Trigger an AI-generated result in each locale and confirm the response language matches
