/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HistoryEntry, HistoryStore } from '../types';

export const STORAGE_KEY = 'strengths-navigator:test-history';
export const HISTORY_VERSION = 1 as const;
export const MAX_ENTRIES = 50;

export function generateId(): string {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyStore(): HistoryStore {
  return { version: HISTORY_VERSION, entries: [] };
}

function isValidStore(value: unknown): value is HistoryStore {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<HistoryStore>;
  return typeof v.version === 'number' && Array.isArray(v.entries);
}

// Back-compat: older entries (pre-optimize-quiz-question-flow) may lack
// `quizLength` and `questionBankVersion`. Fill them in on read so callers
// can treat HistoryEntry as fully populated. Original answers are never
// mutated; missing length is inferred from the answer count.
function normalizeEntry(entry: HistoryEntry): HistoryEntry {
  const filled: HistoryEntry = { ...entry };
  if (typeof filled.quizLength !== 'number') {
    filled.quizLength = entry.answers ? Object.keys(entry.answers).length : 0;
  }
  if (typeof filled.questionBankVersion !== 'string' || filled.questionBankVersion.length === 0) {
    filled.questionBankVersion = 'legacy';
  }
  return filled;
}

export function loadHistory(): HistoryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    if (!isValidStore(parsed)) {
      console.warn('[history] invalid store shape, returning empty');
      return emptyStore();
    }
    if (parsed.version > HISTORY_VERSION) {
      console.warn('[history] stored version newer than supported, returning empty (raw preserved)');
      return emptyStore();
    }
    parsed.entries = parsed.entries.map(normalizeEntry);
    parsed.entries.sort((a, b) => b.createdAt - a.createdAt);
    return parsed;
  } catch (err) {
    console.warn('[history] failed to load, returning empty', err);
    return emptyStore();
  }
}

function writeStore(store: HistoryStore): void {
  store.entries.sort((a, b) => b.createdAt - a.createdAt);
  if (store.entries.length > MAX_ENTRIES) {
    store.entries = store.entries.slice(0, MAX_ENTRIES);
  }
  const serialize = () => JSON.stringify(store);
  try {
    localStorage.setItem(STORAGE_KEY, serialize());
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      const half = Math.max(1, Math.floor(store.entries.length / 2));
      store.entries = store.entries.slice(0, half);
      try {
        localStorage.setItem(STORAGE_KEY, serialize());
      } catch (err2) {
        console.error('[history] quota still exceeded after pruning', err2);
        throw err2;
      }
    } else {
      throw err;
    }
  }
}

export function saveEntry(entry: HistoryEntry): HistoryEntry {
  const store = loadHistory();
  const idx = store.entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    store.entries[idx] = entry;
  } else {
    store.entries.unshift(entry);
  }
  writeStore(store);
  return entry;
}

export function updateEntry(id: string, patch: Partial<HistoryEntry>): HistoryEntry | null {
  const store = loadHistory();
  const idx = store.entries.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  const merged: HistoryEntry = { ...store.entries[idx], ...patch, id, updatedAt: Date.now() };
  store.entries[idx] = merged;
  writeStore(store);
  return merged;
}

export function deleteEntry(id: string): void {
  const store = loadHistory();
  store.entries = store.entries.filter((e) => e.id !== id);
  writeStore(store);
}

export function clearAll(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[history] failed to clear', err);
  }
}

export function getEntry(id: string): HistoryEntry | null {
  return loadHistory().entries.find((e) => e.id === id) ?? null;
}

export function exportHistoryAsJson(): { url: string; filename: string; revoke: () => void } {
  const store = loadHistory();
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  return {
    url,
    filename: `strengths-history-${date}.json`,
    revoke: () => URL.revokeObjectURL(url),
  };
}

export function downloadHistoryJson(): void {
  const { url, filename, revoke } = exportHistoryAsJson();
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(revoke, 0);
}
