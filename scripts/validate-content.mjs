import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { loadPublications, taxonomySchema } from '../src/lib/content-core.mjs';

const ignored = new Set(['node_modules', '.git', '.astro', 'dist', 'dist-demo', 'test-results', 'playwright-report']);
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^(raw|red|private|private-audit)$/i.test(entry.name)) throw new Error(`Private source directory must stay outside this project: ${path}`);
      scan(path);
    } else if (/\.(gpx|csv|fit|tcx)$/i.test(entry.name)) throw new Error(`Source/export ingestion is not enabled in v0.1: ${path}`);
  }
}
scan(process.cwd());
const taxonomy = taxonomySchema.parse(JSON.parse(readFileSync('content/published/settings/taxonomy.json', 'utf8')));
const groupIds = new Set(taxonomy.groups.map(group => group.id));
const categoryIds = new Set(taxonomy.categories.map(category => category.id));
const tagIds = new Set(taxonomy.tags.map(tag => tag.id));
if (groupIds.size !== taxonomy.groups.length || categoryIds.size !== taxonomy.categories.length) throw new Error('Taxonomy IDs must be unique.');
if (tagIds.size !== taxonomy.tags.length) throw new Error('Tag IDs must be unique.');
for (const category of taxonomy.categories) if (!groupIds.has(category.groupId)) throw new Error(`Unknown category group: ${category.groupId}`);
const entries = loadPublications(process.cwd(), { demo: process.env.EUC_BUILD_MODE === 'demo' });
for (const entry of entries) for (const id of entry.categoryIds) if (!categoryIds.has(id)) throw new Error(`Unknown category: ${id}`);
for (const entry of entries) for (const id of entry.tagIds) if (!tagIds.has(id)) throw new Error(`Unknown tag: ${id}`);
console.log(`Content valid: ${entries.length} publications; editorial drafts excluded.`);
