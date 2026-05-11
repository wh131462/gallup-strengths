#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '..', 'src', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';

function collectKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function loadNamespace(locale, ns) {
  return JSON.parse(readFileSync(join(LOCALES_DIR, locale, ns), 'utf8'));
}

const namespaces = readdirSync(join(LOCALES_DIR, SOURCE_LOCALE)).filter((f) => f.endsWith('.json'));
const targets = readdirSync(LOCALES_DIR).filter((d) => d !== SOURCE_LOCALE);

let failed = false;
for (const target of targets) {
  for (const ns of namespaces) {
    const sourceKeys = collectKeys(loadNamespace(SOURCE_LOCALE, ns));
    const targetKeys = new Set(collectKeys(loadNamespace(target, ns)));
    const missing = sourceKeys.filter((k) => !targetKeys.has(k));
    if (missing.length) {
      failed = true;
      console.error(`[${target}/${ns}] missing ${missing.length} key(s):`);
      for (const k of missing) console.error(`  - ${k}`);
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log('i18n key parity OK');
