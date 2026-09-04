import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadPublications, validatePublication, chooseLanguage, joinBase } from '../src/lib/content-core.mjs';

const demo = JSON.parse(readFileSync(new URL('../content/demo/demo-forest-loop.json', import.meta.url), 'utf8'));
const publication = () => ({ ...structuredClone(demo), demo: false });
test('A draft and an unapproved language cannot be used as a public publication', () => {
  assert.throws(() => validatePublication({ ...publication(), status: 'draft' }));
  const missingEnglish = publication(); missingEnglish.en.body = '';
  assert.throws(() => validatePublication(missingEnglish));
  assert.throws(() => validatePublication({ ...publication(), latitude: 54.5 }));
});
test('Synthetic preview content is refused by the production validator', () => {
  assert.throws(() => validatePublication(demo), /Demo content cannot be published/);
  assert.equal(validatePublication(demo, { allowDemo: true }).id, demo.id);
});
test('Editing A or B does not change either published snapshot', () => {
  const root = mkdtempSync(join(tmpdir(), 'euc-publication-test-'));
  try {
    for (const folder of ['content/published/posts', 'content/published/trips', 'content/editorial/trips']) mkdirSync(join(root, folder), { recursive: true });
    const a = publication();
    const b = { ...publication(), id: 'another-trip', slug: 'another-trip' };
    for (const entry of [a, b]) writeFileSync(join(root, `content/published/trips/${entry.id}.json`), JSON.stringify(entry));
    const first = loadPublications(root);
    for (const entry of [a, b]) { entry.lt.title = 'Unapproved next revision'; writeFileSync(join(root, `content/editorial/trips/${entry.id}.json`), JSON.stringify(entry)); }
    assert.deepEqual(loadPublications(root), first);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('Impossible dates, ambiguous identities, and reversed date ranges fail', () => {
  const invalid = publication(); invalid.trip.start = '2026-02-30';
  assert.throws(() => validatePublication(invalid));
  const reversed = publication(); reversed.trip.end = '2026-08-01';
  assert.throws(() => validatePublication(reversed));
  const duplicateMetric = publication(); duplicateMetric.metrics.push(duplicateMetric.metrics[0]);
  assert.throws(() => validatePublication(duplicateMetric));
});
test('Language preferences use the first supported language and keep manual choice', () => {
  assert.equal(chooseLanguage(null, ['de-DE', 'lt-LT', 'en']), 'lt');
  assert.equal(chooseLanguage('lt', ['en-US']), 'lt');
  assert.equal(chooseLanguage(null, ['de', 'fr']), 'en');
  assert.equal(chooseLanguage(null, ['en-US', 'lt']), 'en');
});
test('Project paths stay under the configured GitHub Pages base', () => {
  assert.equal(joinBase('/euc-rover/', '/lt/keliones/'), '/euc-rover/lt/keliones/');
  assert.equal(joinBase('/euc-rover', 'fonts/a.woff2'), '/euc-rover/fonts/a.woff2');
  assert.equal(joinBase('/', 'en/'), '/en/');
  assert.throws(() => joinBase('//untrusted-host/', 'lt/'));
});
test('Subzero temperatures are valid while distances cannot be negative', () => {
  const cold = publication();
  cold.metrics.push({ id: 'temperature', label: { lt: 'Temperatūra', en: 'Temperature' }, value: -4, unit: '°C', decimals: 0, priority: 0 });
  assert.equal(validatePublication(cold).metrics.at(-1).value, -4);
  cold.metrics[0].value = -1;
  assert.throws(() => validatePublication(cold));
});
