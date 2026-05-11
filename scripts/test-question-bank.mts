#!/usr/bin/env node
/**
 * Lightweight assertions for the question bank sampling logic.
 * Run with: pnpm test:bank (or `npx tsx scripts/test-question-bank.mts`).
 *
 * No vitest dependency on purpose — keeps the project zero-test-framework
 * footprint while still giving the sampler regression coverage.
 */
import {
  LENGTH_OPTIONS,
  getQuestionBank,
  getQuestionsForLength,
} from '../src/data/questionBank';
import { ALLOWED_QUESTION_SOURCES } from '../src/types';

let failed = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? `\n      ${detail}` : ''}`);
  }
}

function pairKey(domainA: string, domainB: string): string {
  return [domainA, domainB].sort().join('|');
}

console.log('question bank:');
const bank = getQuestionBank();
check('has version', typeof bank.version === 'string' && bank.version.length > 0);
check('has generatedAt', typeof bank.generatedAt === 'string');
check('has ≥ 100 questions', bank.questions.length >= 100, `got ${bank.questions.length}`);
check(
  'every question has required metadata fields',
  bank.questions.every(
    (q) =>
      typeof q.id === 'string' &&
      typeof q.domainA === 'string' &&
      typeof q.domainB === 'string' &&
      Array.isArray(q.themesA) &&
      Array.isArray(q.themesB) &&
      Array.isArray(q.tags) &&
      typeof q.source === 'string',
  ),
);
check(
  'every question source is in ALLOWED_QUESTION_SOURCES',
  bank.questions.every((q) => (ALLOWED_QUESTION_SOURCES as readonly string[]).includes(q.source)),
);
check(
  'question ids are unique',
  new Set(bank.questions.map((q) => q.id)).size === bank.questions.length,
);

for (const length of ['quick', 'standard', 'deep'] as const) {
  console.log(`length=${length}:`);
  const expected = LENGTH_OPTIONS[length].count;
  const subset = getQuestionsForLength(length);
  check(`returns exactly ${expected} questions`, subset.length === expected, `got ${subset.length}`);

  // Determinism
  const second = getQuestionsForLength(length);
  check(
    'is deterministic across calls',
    subset.map((q) => q.id).join(',') === second.map((q) => q.id).join(','),
  );

  // Pair balance: every pair count differs by at most 1
  if (length !== 'deep') {
    const counts = new Map<string, number>();
    for (const q of subset) {
      const k = pairKey(q.domainA, q.domainB);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const values = [...counts.values()];
    const min = Math.min(...values);
    const max = Math.max(...values);
    check(
      `domain-pair counts differ by ≤ 1 (min=${min}, max=${max})`,
      max - min <= 1,
      `pairs: ${JSON.stringify(Object.fromEntries(counts))}`,
    );
    check('uses all 6 domain pairs', counts.size === 6, `got ${counts.size} pairs`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nall question-bank checks passed');
