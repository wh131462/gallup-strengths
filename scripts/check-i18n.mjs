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

// --- Extra check: every question id in the question bank has both
// statementA and statementB in strengths.json for each locale. The bank
// is a TS module so we parse the literal id list with a regex to keep
// this script dependency-free (no tsx invocation needed in CI).
const bankSrc = readFileSync(
  join(__dirname, '..', 'src', 'data', 'questionBank.ts'),
  'utf8',
);
const ids = [];
const idRe = /\{\s*id:\s*'(\d+)'/g;
let m;
while ((m = idRe.exec(bankSrc)) !== null) ids.push(m[1]);

if (ids.length === 0) {
  console.error('[questionBank] could not parse any question ids');
  failed = true;
}

for (const locale of [SOURCE_LOCALE, ...targets]) {
  let strengths;
  try {
    strengths = loadNamespace(locale, 'strengths.json');
  } catch (err) {
    console.error(`[${locale}/strengths.json] failed to load`, err.message);
    failed = true;
    continue;
  }
  const qmap = strengths.questions ?? {};
  const missing = [];
  for (const id of ids) {
    const item = qmap[id];
    if (!item || typeof item.statementA !== 'string' || typeof item.statementB !== 'string') {
      missing.push(id);
    }
  }
  if (missing.length) {
    failed = true;
    console.error(
      `[${locale}/strengths.json] missing statementA/B for ${missing.length} question id(s): ${missing.join(', ')}`,
    );
  }
}

// --- Extra check: every question's `source` value must be in the
// ALLOWED_QUESTION_SOURCES enum declared in src/types.ts.
const typesSrc = readFileSync(
  join(__dirname, '..', 'src', 'types.ts'),
  'utf8',
);
const allowedMatch = typesSrc.match(
  /ALLOWED_QUESTION_SOURCES\s*=\s*\[([\s\S]*?)\]\s*as\s+const/,
);
const allowedSources = allowedMatch
  ? [...allowedMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  : [];
if (allowedSources.length === 0) {
  console.error('[types] could not parse ALLOWED_QUESTION_SOURCES');
  failed = true;
}
const allowedSet = new Set(allowedSources);
const sourceRe = /source:\s*'([^']+)'/g;
const badSources = [];
let sm;
while ((sm = sourceRe.exec(bankSrc)) !== null) {
  if (!allowedSet.has(sm[1])) badSources.push(sm[1]);
}
if (badSources.length) {
  failed = true;
  console.error(
    `[questionBank] unknown source value(s): ${[...new Set(badSources)].join(', ')} (allowed: ${[...allowedSet].join(', ')})`,
  );
}

if (failed) {
  process.exit(1);
}
console.log('i18n key parity OK');
console.log(`questionBank: ${ids.length} ids covered in all locales; ${allowedSources.length} allowed sources`);

