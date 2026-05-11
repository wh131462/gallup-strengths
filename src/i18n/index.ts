import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enQuiz from './locales/en/quiz.json';
import enResults from './locales/en/results.json';
import enSettings from './locales/en/settings.json';
import enStrengths from './locales/en/strengths.json';
import enHistory from './locales/en/history.json';

import zhCommon from './locales/zh/common.json';
import zhLanding from './locales/zh/landing.json';
import zhQuiz from './locales/zh/quiz.json';
import zhResults from './locales/zh/results.json';
import zhSettings from './locales/zh/settings.json';
import zhStrengths from './locales/zh/strengths.json';
import zhHistory from './locales/zh/history.json';

export const SUPPORTED_LANGUAGES = ['en', 'zh'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const LANGUAGE_STORAGE_KEY = 'app.language';

export const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    quiz: enQuiz,
    results: enResults,
    settings: enSettings,
    strengths: enStrengths,
    history: enHistory,
  },
  zh: {
    common: zhCommon,
    landing: zhLanding,
    quiz: zhQuiz,
    results: zhResults,
    settings: zhSettings,
    strengths: zhStrengths,
    history: zhHistory,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    ns: ['common', 'landing', 'quiz', 'results', 'settings', 'strengths', 'history'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    returnNull: false,
  });

export default i18n;
