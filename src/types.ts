/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StrengthDomain = 'Executing' | 'Influencing' | 'Relationship Building' | 'Strategic Thinking';

export interface StrengthTheme {
  name: string;
  domain: StrengthDomain;
}

export const ALLOWED_QUESTION_SOURCES = [
  'public-pair-style',
  'adapted-from-original-pair',
  'author-original',
] as const;
export type QuestionSource = (typeof ALLOWED_QUESTION_SOURCES)[number];

export type QuestionDifficulty = 'easy' | 'standard' | 'deep';

export interface Question {
  id: string;
  domainA: StrengthDomain;
  domainB: StrengthDomain;
  themesA: string[];
  themesB: string[];
  tags: string[];
  source: QuestionSource;
  difficulty?: QuestionDifficulty;
}

export type QuizLength = 'quick' | 'standard' | 'deep';

export interface QuestionBankMeta {
  version: string;
  generatedAt: string;
}

export interface QuestionBank extends QuestionBankMeta {
  questions: Question[];
}

export interface QuizLengthOption {
  id: QuizLength;
  count: number;
  estMinutes: [number, number];
}

export interface QuizState {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, number>;
}

export interface FinalResult {
  topThemes: StrengthTheme[];
  domainScores: Record<StrengthDomain, number>;
}

export interface AdvisorReportSnapshot {
  markdown: string;
  model?: string;
  generatedAt: number;
}

export interface DomainScoreSnapshot {
  domain: StrengthDomain;
  value: number;
  full: number;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  updatedAt: number;
  language: string;
  answers: Record<string, number>;
  topThemes: StrengthTheme[];
  domainScores: DomainScoreSnapshot[];
  advisorReport?: AdvisorReportSnapshot;
  note?: string;
  quizLength: number;
  questionBankVersion: string;
}

export interface HistoryStore {
  version: number;
  entries: HistoryEntry[];
}
