/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Question,
  QuestionBank,
  QuizLength,
  QuizLengthOption,
  StrengthDomain,
} from '../types';
import { ALLOWED_QUESTION_SOURCES } from '../types';

export const QUESTION_BANK_VERSION = '1.0.0';
const GENERATED_AT = '2025-01-01T00:00:00.000Z';

/**
 * Raw question structure with metadata. Question text itself lives in
 * src/i18n/locales/{en,zh}/strengths.json under `questions.<id>.statementA/B`.
 * See openspec/changes/optimize-quiz-question-flow/SOURCES.md for the
 * provenance taxonomy used by the `source` field.
 */
const RAW_QUESTIONS: Question[] = [
  // Mixed initial set (10)
  { id: '1', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Discipline', 'Focus'], themesB: ['Adaptability'], tags: ['planning', 'flexibility'], source: 'adapted-from-original-pair' },
  { id: '2', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Woo'], themesB: ['Analytical'], tags: ['social', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '3', domainA: 'Relationship Building', domainB: 'Executing', themesA: ['Developer'], themesB: ['Consistency'], tags: ['growth', 'fairness'], source: 'adapted-from-original-pair' },
  { id: '4', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Command'], themesB: ['Empathy'], tags: ['authority', 'empathy'], source: 'adapted-from-original-pair' },
  { id: '5', domainA: 'Strategic Thinking', domainB: 'Executing', themesA: ['Futuristic', 'Ideation'], themesB: ['Responsibility'], tags: ['vision', 'ownership'], source: 'adapted-from-original-pair' },
  { id: '6', domainA: 'Strategic Thinking', domainB: 'Executing', themesA: ['Intellection'], themesB: ['Arranger'], tags: ['thinking', 'logistics'], source: 'adapted-from-original-pair' },
  { id: '7', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Competition'], themesB: ['Input'], tags: ['winning', 'collecting'], source: 'adapted-from-original-pair' },
  { id: '8', domainA: 'Relationship Building', domainB: 'Influencing', themesA: ['Adaptability'], themesB: ['Self-Assurance'], tags: ['flow', 'confidence'], source: 'adapted-from-original-pair' },
  { id: '9', domainA: 'Relationship Building', domainB: 'Executing', themesA: ['Individualization'], themesB: ['Deliberative'], tags: ['uniqueness', 'caution'], source: 'adapted-from-original-pair' },
  { id: '10', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Communication'], themesB: ['Context'], tags: ['expression', 'history'], source: 'adapted-from-original-pair' },

  // Executing vs Influencing (11-25)
  { id: '11', domainA: 'Executing', domainB: 'Influencing', themesA: ['Achiever', 'Responsibility'], themesB: ['Activator'], tags: ['hardwork', 'action'], source: 'adapted-from-original-pair' },
  { id: '12', domainA: 'Executing', domainB: 'Influencing', themesA: ['Discipline'], themesB: ['Command'], tags: ['order', 'authority'], source: 'adapted-from-original-pair' },
  { id: '13', domainA: 'Executing', domainB: 'Influencing', themesA: ['Belief'], themesB: ['Communication'], tags: ['values', 'expression'], source: 'adapted-from-original-pair' },
  { id: '14', domainA: 'Executing', domainB: 'Influencing', themesA: ['Achiever'], themesB: ['Competition'], tags: ['hardwork', 'winning'], source: 'adapted-from-original-pair' },
  { id: '15', domainA: 'Executing', domainB: 'Influencing', themesA: ['Restorative'], themesB: ['Maximizer'], tags: ['fixing', 'excellence'], source: 'adapted-from-original-pair' },
  { id: '16', domainA: 'Executing', domainB: 'Influencing', themesA: ['Responsibility'], themesB: ['Self-Assurance'], tags: ['ownership', 'confidence'], source: 'adapted-from-original-pair' },
  { id: '17', domainA: 'Executing', domainB: 'Influencing', themesA: ['Focus'], themesB: ['Significance'], tags: ['direction', 'impact'], source: 'adapted-from-original-pair' },
  { id: '18', domainA: 'Executing', domainB: 'Influencing', themesA: ['Consistency'], themesB: ['Woo'], tags: ['fairness', 'social'], source: 'adapted-from-original-pair' },
  { id: '19', domainA: 'Executing', domainB: 'Influencing', themesA: ['Deliberative', 'Responsibility'], themesB: ['Activator'], tags: ['caution', 'action'], source: 'adapted-from-original-pair' },
  { id: '20', domainA: 'Executing', domainB: 'Influencing', themesA: ['Arranger'], themesB: ['Command'], tags: ['logistics', 'authority'], source: 'adapted-from-original-pair' },
  { id: '21', domainA: 'Executing', domainB: 'Influencing', themesA: ['Achiever'], themesB: ['Significance'], tags: ['hardwork', 'impact'], source: 'adapted-from-original-pair' },
  { id: '22', domainA: 'Executing', domainB: 'Influencing', themesA: ['Discipline'], themesB: ['Communication'], tags: ['order', 'expression'], source: 'adapted-from-original-pair' },
  { id: '23', domainA: 'Executing', domainB: 'Influencing', themesA: ['Restorative'], themesB: ['Competition'], tags: ['fixing', 'winning'], source: 'adapted-from-original-pair' },
  { id: '24', domainA: 'Executing', domainB: 'Influencing', themesA: ['Belief'], themesB: ['Maximizer'], tags: ['values', 'excellence'], source: 'adapted-from-original-pair' },
  { id: '25', domainA: 'Executing', domainB: 'Influencing', themesA: ['Focus'], themesB: ['Self-Assurance'], tags: ['direction', 'confidence'], source: 'adapted-from-original-pair' },

  // Executing vs Relationship Building (26-40)
  { id: '26', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Achiever'], themesB: ['Empathy'], tags: ['hardwork', 'empathy'], source: 'adapted-from-original-pair' },
  { id: '27', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Arranger'], themesB: ['Harmony'], tags: ['logistics', 'peace'], source: 'adapted-from-original-pair' },
  { id: '28', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Discipline'], themesB: ['Adaptability'], tags: ['order', 'flow'], source: 'adapted-from-original-pair' },
  { id: '29', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Belief'], themesB: ['Connectedness'], tags: ['values', 'connection'], source: 'adapted-from-original-pair' },
  { id: '30', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Consistency'], themesB: ['Includer'], tags: ['fairness', 'inclusion'], source: 'adapted-from-original-pair' },
  { id: '31', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Restorative'], themesB: ['Developer'], tags: ['fixing', 'growth'], source: 'adapted-from-original-pair' },
  { id: '32', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Responsibility'], themesB: ['Relator'], tags: ['ownership', 'closeness'], source: 'adapted-from-original-pair' },
  { id: '33', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Focus'], themesB: ['Positivity'], tags: ['direction', 'optimism'], source: 'adapted-from-original-pair' },
  { id: '34', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Deliberative'], themesB: ['Adaptability'], tags: ['caution', 'flow'], source: 'adapted-from-original-pair' },
  { id: '35', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Achiever'], themesB: ['Positivity'], tags: ['hardwork', 'optimism'], source: 'adapted-from-original-pair' },
  { id: '36', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Arranger'], themesB: ['Individualization'], tags: ['logistics', 'uniqueness'], source: 'adapted-from-original-pair' },
  { id: '37', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Discipline'], themesB: ['Connectedness'], tags: ['order', 'connection'], source: 'adapted-from-original-pair' },
  { id: '38', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Belief'], themesB: ['Empathy'], tags: ['values', 'empathy'], source: 'adapted-from-original-pair' },
  { id: '39', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Restorative'], themesB: ['Harmony'], tags: ['fixing', 'peace'], source: 'adapted-from-original-pair' },
  { id: '40', domainA: 'Executing', domainB: 'Relationship Building', themesA: ['Consistency'], themesB: ['Relator'], tags: ['fairness', 'closeness'], source: 'adapted-from-original-pair' },

  // Executing vs Strategic Thinking (41-55)
  { id: '41', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Achiever'], themesB: ['Learner'], tags: ['hardwork', 'learning'], source: 'adapted-from-original-pair' },
  { id: '42', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Arranger', 'Deliberative'], themesB: ['Strategic'], tags: ['logistics', 'paths'], source: 'adapted-from-original-pair' },
  { id: '43', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Discipline'], themesB: ['Ideation'], tags: ['order', 'ideas'], source: 'adapted-from-original-pair' },
  { id: '44', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Belief'], themesB: ['Intellection'], tags: ['values', 'thinking'], source: 'adapted-from-original-pair' },
  { id: '45', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Consistency'], themesB: ['Analytical'], tags: ['fairness', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '46', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Deliberative'], themesB: ['Futuristic'], tags: ['caution', 'vision'], source: 'adapted-from-original-pair' },
  { id: '47', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Focus'], themesB: ['Input'], tags: ['direction', 'collecting'], source: 'adapted-from-original-pair' },
  { id: '48', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Responsibility'], themesB: ['Strategic'], tags: ['ownership', 'paths'], source: 'adapted-from-original-pair' },
  { id: '49', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Restorative'], themesB: ['Analytical'], tags: ['fixing', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '50', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Achiever'], themesB: ['Ideation'], tags: ['hardwork', 'ideas'], source: 'adapted-from-original-pair' },
  { id: '51', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Arranger'], themesB: ['Context'], tags: ['logistics', 'history'], source: 'adapted-from-original-pair' },
  { id: '52', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Discipline'], themesB: ['Learner'], tags: ['order', 'learning'], source: 'adapted-from-original-pair' },
  { id: '53', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Belief'], themesB: ['Futuristic'], tags: ['values', 'vision'], source: 'adapted-from-original-pair' },
  { id: '54', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Consistency'], themesB: ['Intellection'], tags: ['fairness', 'thinking'], source: 'adapted-from-original-pair' },
  { id: '55', domainA: 'Executing', domainB: 'Strategic Thinking', themesA: ['Focus'], themesB: ['Context'], tags: ['direction', 'history'], source: 'adapted-from-original-pair' },

  // Influencing vs Relationship Building (56-70)
  { id: '56', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Activator'], themesB: ['Harmony'], tags: ['action', 'peace'], source: 'adapted-from-original-pair' },
  { id: '57', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Command'], themesB: ['Empathy', 'Individualization'], tags: ['authority', 'empathy'], source: 'adapted-from-original-pair' },
  { id: '58', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Communication'], themesB: ['Relator'], tags: ['expression', 'closeness'], source: 'adapted-from-original-pair' },
  { id: '59', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Competition'], themesB: ['Includer'], tags: ['winning', 'inclusion'], source: 'adapted-from-original-pair' },
  { id: '60', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Maximizer'], themesB: ['Developer'], tags: ['excellence', 'growth'], source: 'adapted-from-original-pair' },
  { id: '61', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Self-Assurance'], themesB: ['Adaptability'], tags: ['confidence', 'flow'], source: 'adapted-from-original-pair' },
  { id: '62', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Significance'], themesB: ['Connectedness'], tags: ['impact', 'connection'], source: 'adapted-from-original-pair' },
  { id: '63', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Woo'], themesB: ['Individualization'], tags: ['social', 'uniqueness'], source: 'adapted-from-original-pair' },
  { id: '64', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Activator'], themesB: ['Positivity'], tags: ['action', 'optimism'], source: 'adapted-from-original-pair' },
  { id: '65', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Command'], themesB: ['Harmony'], tags: ['authority', 'peace'], source: 'adapted-from-original-pair' },
  { id: '66', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Communication'], themesB: ['Empathy'], tags: ['expression', 'empathy'], source: 'adapted-from-original-pair' },
  { id: '67', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Maximizer'], themesB: ['Includer'], tags: ['excellence', 'inclusion'], source: 'adapted-from-original-pair' },
  { id: '68', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Significance'], themesB: ['Relator'], tags: ['impact', 'closeness'], source: 'adapted-from-original-pair' },
  { id: '69', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Woo'], themesB: ['Connectedness'], tags: ['social', 'connection'], source: 'adapted-from-original-pair' },
  { id: '70', domainA: 'Influencing', domainB: 'Relationship Building', themesA: ['Self-Assurance'], themesB: ['Developer', 'Individualization'], tags: ['confidence', 'growth'], source: 'adapted-from-original-pair' },

  // Influencing vs Strategic Thinking (71-85)
  { id: '71', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Activator'], themesB: ['Intellection'], tags: ['action', 'thinking'], source: 'adapted-from-original-pair' },
  { id: '72', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Command'], themesB: ['Strategic'], tags: ['authority', 'paths'], source: 'adapted-from-original-pair' },
  { id: '73', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Communication'], themesB: ['Input'], tags: ['expression', 'collecting'], source: 'adapted-from-original-pair' },
  { id: '74', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Competition'], themesB: ['Analytical'], tags: ['winning', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '75', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Maximizer'], themesB: ['Learner'], tags: ['excellence', 'learning'], source: 'adapted-from-original-pair' },
  { id: '76', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Self-Assurance'], themesB: ['Ideation'], tags: ['confidence', 'ideas'], source: 'adapted-from-original-pair' },
  { id: '77', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Significance'], themesB: ['Futuristic'], tags: ['impact', 'vision'], source: 'adapted-from-original-pair' },
  { id: '78', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Woo'], themesB: ['Context'], tags: ['social', 'history'], source: 'adapted-from-original-pair' },
  { id: '79', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Activator'], themesB: ['Strategic'], tags: ['action', 'paths'], source: 'adapted-from-original-pair' },
  { id: '80', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Command'], themesB: ['Analytical'], tags: ['authority', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '81', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Communication'], themesB: ['Futuristic'], tags: ['expression', 'vision'], source: 'adapted-from-original-pair' },
  { id: '82', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Competition'], themesB: ['Ideation'], tags: ['winning', 'ideas'], source: 'adapted-from-original-pair' },
  { id: '83', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Maximizer'], themesB: ['Intellection'], tags: ['excellence', 'thinking'], source: 'adapted-from-original-pair' },
  { id: '84', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Significance'], themesB: ['Input'], tags: ['impact', 'collecting'], source: 'adapted-from-original-pair' },
  { id: '85', domainA: 'Influencing', domainB: 'Strategic Thinking', themesA: ['Woo'], themesB: ['Learner'], tags: ['social', 'learning'], source: 'adapted-from-original-pair' },

  // Relationship Building vs Strategic Thinking (86-100)
  { id: '86', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Empathy'], themesB: ['Analytical'], tags: ['empathy', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '87', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Harmony'], themesB: ['Strategic'], tags: ['peace', 'paths'], source: 'adapted-from-original-pair' },
  { id: '88', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Includer'], themesB: ['Ideation'], tags: ['inclusion', 'ideas'], source: 'adapted-from-original-pair' },
  { id: '89', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Developer'], themesB: ['Learner'], tags: ['growth', 'learning'], source: 'adapted-from-original-pair' },
  { id: '90', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Adaptability'], themesB: ['Futuristic'], tags: ['flow', 'vision'], source: 'adapted-from-original-pair' },
  { id: '91', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Connectedness'], themesB: ['Context'], tags: ['connection', 'history'], source: 'adapted-from-original-pair' },
  { id: '92', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Individualization'], themesB: ['Analytical'], tags: ['uniqueness', 'analysis'], source: 'adapted-from-original-pair' },
  { id: '93', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Positivity'], themesB: ['Intellection'], tags: ['optimism', 'thinking'], source: 'adapted-from-original-pair' },
  { id: '94', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Relator'], themesB: ['Input'], tags: ['closeness', 'collecting'], source: 'adapted-from-original-pair' },
  { id: '95', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Empathy'], themesB: ['Futuristic'], tags: ['empathy', 'vision'], source: 'adapted-from-original-pair' },
  { id: '96', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Harmony'], themesB: ['Ideation'], tags: ['peace', 'ideas'], source: 'adapted-from-original-pair' },
  { id: '97', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Includer'], themesB: ['Learner'], tags: ['inclusion', 'learning'], source: 'adapted-from-original-pair' },
  { id: '98', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Developer'], themesB: ['Strategic'], tags: ['growth', 'paths'], source: 'adapted-from-original-pair' },
  { id: '99', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Connectedness'], themesB: ['Intellection'], tags: ['connection', 'thinking'], source: 'adapted-from-original-pair' },
  { id: '100', domainA: 'Relationship Building', domainB: 'Strategic Thinking', themesA: ['Positivity'], themesB: ['Context'], tags: ['optimism', 'history'], source: 'adapted-from-original-pair' },
];

export const questionBank: QuestionBank = {
  version: QUESTION_BANK_VERSION,
  generatedAt: GENERATED_AT,
  questions: RAW_QUESTIONS,
};

// Runtime validation: fail loudly during dev/build if any question carries
// an unrecognized `source` value. Matches the CI guard in
// scripts/check-i18n.mjs but catches issues at module load too.
(function validateQuestionBank() {
  const allowed = new Set<string>(ALLOWED_QUESTION_SOURCES);
  const offenders = RAW_QUESTIONS.filter((q) => !allowed.has(q.source));
  if (offenders.length > 0) {
    const ids = offenders.map((q) => `${q.id}=${q.source}`).join(', ');
    throw new Error(
      `[questionBank] invalid 'source' value(s): ${ids}. ` +
        `Allowed: ${[...allowed].join(', ')}.`,
    );
  }
})();

export function getQuestionBank(): QuestionBank {
  return questionBank;
}

export const LENGTH_OPTIONS: Record<QuizLength, QuizLengthOption> = {
  quick: { id: 'quick', count: 30, estMinutes: [3, 5] },
  standard: { id: 'standard', count: 60, estMinutes: [6, 10] },
  deep: { id: 'deep', count: 100, estMinutes: [10, 15] },
};

function pairKey(q: Question): string {
  // Canonicalize the pair so e.g. "E-R" and "R-E" group together. Original
  // data already uses a consistent A/B convention per pair, but normalizing
  // makes the grouping resilient if ordering ever drifts.
  const [a, b] = [q.domainA as string, q.domainB as string].sort();
  return `${a}|${b}`;
}

/**
 * Returns a deterministic subset of questions sized for the requested length.
 *
 * Strategy:
 *  - Group questions by domain pair (6 pairs across 4 domains).
 *  - Within each group, sort by numeric id ascending.
 *  - Take ceil(N/6) from the head of each group.
 *  - Concatenate, sort by numeric id, and slice to exactly N items.
 *
 * For `deep`, the entire bank is returned.
 */
export function getQuestionsForLength(length: QuizLength): Question[] {
  const target = LENGTH_OPTIONS[length].count;
  if (length === 'deep' || target >= questionBank.questions.length) {
    return [...questionBank.questions].sort((a, b) => Number(a.id) - Number(b.id));
  }

  const groups = new Map<string, Question[]>();
  for (const q of questionBank.questions) {
    const key = pairKey(q);
    const arr = groups.get(key) ?? [];
    arr.push(q);
    groups.set(key, arr);
  }
  for (const arr of groups.values()) {
    arr.sort((a, b) => Number(a.id) - Number(b.id));
  }

  const numGroups = groups.size || 1;
  const perGroup = Math.ceil(target / numGroups);
  const collected: Question[] = [];
  for (const arr of groups.values()) {
    collected.push(...arr.slice(0, perGroup));
  }
  collected.sort((a, b) => Number(a.id) - Number(b.id));
  return collected.slice(0, target);
}

export const STRENGTH_DOMAINS: StrengthDomain[] = [
  'Executing',
  'Influencing',
  'Relationship Building',
  'Strategic Thinking',
];
