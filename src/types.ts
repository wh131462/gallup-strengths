/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StrengthDomain = 'Executing' | 'Influencing' | 'Relationship Building' | 'Strategic Thinking';

export interface StrengthTheme {
  name: string;
  domain: StrengthDomain;
}

export interface Question {
  id: string;
  domainA: StrengthDomain;
  domainB: StrengthDomain;
  themesA: string[];
  themesB: string[];
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
}

export interface HistoryStore {
  version: number;
  entries: HistoryEntry[];
}
