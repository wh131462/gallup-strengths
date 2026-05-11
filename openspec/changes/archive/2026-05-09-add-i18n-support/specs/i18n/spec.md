## ADDED Requirements

### Requirement: Locale Support
The system SHALL support English (`en`) and Chinese (`zh`) locales for all user-facing text, with an architecture that allows additional locales to be added without modifying consuming components.

#### Scenario: Locale codes available
- **WHEN** the i18n module initializes
- **THEN** both `en` and `zh` locales are registered and selectable

#### Scenario: Adding a future locale
- **WHEN** a developer adds a new locale resource directory under `src/i18n/locales/<code>/`
- **THEN** the locale becomes available without changes to existing components

### Requirement: Translation Lookup
The system SHALL provide a typed translation function (e.g., `t(key)`) that returns the string for the active locale, supports parameter interpolation, and falls back to the source locale (`en`) if a key is missing in the active locale.

#### Scenario: Resolves key in active locale
- **WHEN** the active locale is `zh` and a component calls `t('landing.title')`
- **THEN** the function returns the Chinese translation defined in the `zh` resource

#### Scenario: Falls back when key missing
- **WHEN** a key exists in `en` but is missing in `zh` and the active locale is `zh`
- **THEN** the function returns the `en` value rather than the raw key

#### Scenario: Interpolation
- **WHEN** a translation contains `{{name}}` and `t('greeting', { name: 'Ada' })` is called
- **THEN** the returned string contains `Ada` substituted in place of the placeholder

### Requirement: Language Switching
The system SHALL allow the user to change the active locale at runtime through a UI control, and all rendered text SHALL update without a page reload.

#### Scenario: User switches from Chinese to English
- **WHEN** the user selects English in the language switcher
- **THEN** all visible UI text re-renders in English within the same session

#### Scenario: Switching during the quiz preserves answers
- **WHEN** the user changes the locale while in the middle of the quiz
- **THEN** previously selected answers and quiz progress are preserved and only display strings change

### Requirement: Persistence and Default Detection
The system SHALL persist the user's selected locale in `localStorage` and SHALL determine the initial locale on first visit using, in order: (1) a previously persisted value, (2) the browser's preferred language if it matches a supported locale, (3) `zh` as fallback.

#### Scenario: Returning user with stored preference
- **WHEN** a user previously selected `en` and reopens the app
- **THEN** the app loads in English without requiring re-selection

#### Scenario: First visit with English browser
- **WHEN** a first-time user's `navigator.language` starts with `en` and no preference is stored
- **THEN** the app loads in English

#### Scenario: First visit with unsupported browser language
- **WHEN** a first-time user's `navigator.language` is neither English nor Chinese and no preference is stored
- **THEN** the app loads in Chinese

### Requirement: Localized Quiz and Strength Content
The system SHALL render quiz questions, answer options, strength names, and strength descriptions in the active locale by resolving translation keys at render time. Structural data (IDs, weights, ordering) SHALL remain in code and not be duplicated per locale.

#### Scenario: Quiz questions display in active locale
- **WHEN** the active locale is `en` and the quiz page renders
- **THEN** every question prompt and answer option appears in English

#### Scenario: Strength descriptions display in active locale
- **WHEN** the user views the results page in `zh`
- **THEN** strength names and descriptions appear in Chinese

### Requirement: AI Service Locale Awareness
The system SHALL pass the active locale to AI/LLM service calls so that generated content is returned in the user's selected language.

#### Scenario: Generated content matches active locale
- **WHEN** the user is in `en` and triggers an AI-generated description
- **THEN** the request includes a language directive for English and the response is rendered in English

#### Scenario: Locale change before next AI call
- **WHEN** the user switches from `zh` to `en` and then triggers a new AI request
- **THEN** the new request uses `en` as the locale directive

### Requirement: No Hardcoded User-Facing Strings
The system SHALL NOT contain hardcoded user-facing strings in TSX components or shared constants once this change is complete; all such strings SHALL be sourced from locale resource files.

#### Scenario: Component string audit
- **WHEN** a code review inspects any component under `src/components/`
- **THEN** no Chinese or English literal user-facing string is found outside of `src/i18n/locales/`
