#!/usr/bin/env node
/**
 * Compatibility tests for historyStorage's legacy-entry normalization.
 * Runs in Node with a minimal localStorage shim — no jsdom needed.
 */
import { strict as assert } from 'node:assert';

// Minimal localStorage polyfill on globalThis BEFORE importing the module.
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = String(v);
  },
  removeItem: (k: string) => {
    delete store[k];
  },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k];
  },
};

const { loadHistory, saveEntry, STORAGE_KEY, HISTORY_VERSION } = await import(
  '../src/services/historyStorage'
);

let pass = 0;
let fail = 0;
function t(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    pass++;
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(e);
    fail++;
  }
}

console.log('historyStorage compatibility:');

// --- legacy entry without quizLength/questionBankVersion ---
t('reads legacy entry and back-fills quizLength + questionBankVersion', () => {
  localStorage.clear();
  const legacy = {
    version: HISTORY_VERSION,
    entries: [
      {
        id: 'legacy_1',
        createdAt: 1000,
        updatedAt: 1000,
        language: 'en',
        answers: { '1': 1, '2': -2, '3': 0 },
        topThemes: [],
        domainScores: [],
      },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  const store = loadHistory();
  assert.equal(store.entries.length, 1);
  const e = store.entries[0];
  assert.equal(e.quizLength, 3, 'quizLength should be inferred from answer count');
  assert.equal(e.questionBankVersion, 'legacy');
  // Original answers untouched.
  assert.deepEqual(e.answers, { '1': 1, '2': -2, '3': 0 });
});

// --- new entry round-trip ---
t('saves and reads new entry preserving new fields', () => {
  localStorage.clear();
  saveEntry({
    id: 'new_1',
    createdAt: 2000,
    updatedAt: 2000,
    language: 'zh',
    answers: { '1': 1 },
    topThemes: [],
    domainScores: [],
    quizLength: 30,
    questionBankVersion: '1.0.0',
  });
  const store = loadHistory();
  const e = store.entries[0];
  assert.equal(e.quizLength, 30);
  assert.equal(e.questionBankVersion, '1.0.0');
});

// --- mixed entries ---
t('normalizes mixed legacy + new entries on load', () => {
  localStorage.clear();
  const mixed = {
    version: HISTORY_VERSION,
    entries: [
      { id: 'a', createdAt: 1, updatedAt: 1, language: 'en', answers: { '1': 1 }, topThemes: [], domainScores: [] },
      { id: 'b', createdAt: 2, updatedAt: 2, language: 'en', answers: { '1': 1, '2': 1 }, topThemes: [], domainScores: [], quizLength: 60, questionBankVersion: '1.0.0' },
    ],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mixed));
  const out = loadHistory();
  const byId = Object.fromEntries(out.entries.map((e) => [e.id, e]));
  assert.equal(byId['a'].quizLength, 1);
  assert.equal(byId['a'].questionBankVersion, 'legacy');
  assert.equal(byId['b'].quizLength, 60);
  assert.equal(byId['b'].questionBankVersion, '1.0.0');
});

if (fail > 0) {
  console.error(`\n${fail} test(s) failed (${pass} passed)`);
  process.exit(1);
}
console.log(`\nall ${pass} historyStorage tests passed`);
