import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { normalizeBase } from '../src/lib/content-core.mjs';
const dir = resolve(process.argv[2] || 'dist');
const base = normalizeBase(process.argv[3] || '/');
const demo = dir.endsWith('dist-demo');
function files(path) { return readdirSync(path, { withFileTypes: true }).flatMap(item => item.isDirectory() ? files(join(path, item.name)) : [join(path, item.name)]); }
let pages = 0;
for (const path of files(dir)) {
  const local = relative(dir, path);
  if (/(^|\/)(editorial|__qa|dev-qa)(\/|$)/.test(local)) throw new Error(`Non-public route leaked: ${local}`);
  if (!path.endsWith('.html')) continue;
  pages++;
  const html = readFileSync(path, 'utf8');
  if (!demo && /demo-forest-loop|demo-field-notes|first-draft|Pirmas juodraštis/.test(html)) throw new Error(`Draft/demo content leaked into ${local}`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const url = match[1];
    if (!url.startsWith(base)) throw new Error(`Incorrect project base ${url} in ${local}`);
    const target = join(dir, url.slice(base.length));
    if (!existsSync(target) && !existsSync(join(target, 'index.html'))) throw new Error(`Missing target ${url} in ${local}`);
  }
}
for (const lang of ['lt', 'en']) {
  const rss = readFileSync(join(dir, lang, 'rss.xml'), 'utf8');
  if (/demo-forest-loop|demo-field-notes|first-draft/.test(rss)) throw new Error('Draft/demo content leaked into RSS.');
}
console.log(`Verified ${pages} HTML pages, local targets, base path, and draft/demo exclusion.`);
