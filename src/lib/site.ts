import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { loadPublications, publicationSchema, taxonomySchema, joinBase } from './content-core.mjs';
import { languages, segments, type Lang, type View } from '../i18n/ui';

export type Publication = z.infer<typeof publicationSchema>;
export const demoMode = process.env.EUC_BUILD_MODE === 'demo' || (import.meta.env.DEV && process.env.EUC_BUILD_MODE !== 'production');
export const entries: Publication[] = loadPublications(process.cwd(), { demo: demoMode });
export const taxonomy = taxonomySchema.parse(JSON.parse(readFileSync(join(process.cwd(), 'content/published/settings/taxonomy.json'), 'utf8')));
for (const entry of entries) for (const category of entry.categoryIds) {
  if (!taxonomy.categories.some(item => item.id === category)) throw new Error(`Unknown category ${category} in ${entry.id}`);
}
for (const entry of entries) for (const tag of entry.tagIds) {
  if (!taxonomy.tags.some(item => item.id === tag)) throw new Error(`Unknown tag ${tag} in ${entry.id}`);
}
export const base = import.meta.env.BASE_URL;
export const asset = (path: string) => joinBase(base, path);
export const pageUrl = (lang: Lang, view: View = 'home') => asset(`${lang}/${segments[lang][view]}${segments[lang][view] ? '/' : ''}`);
export const articleUrl = (entry: Publication, lang: Lang) => `${pageUrl(lang, entry.type === 'trip' ? 'trips' : 'posts')}${entry.slug}/`;
export const alternateLang = (lang: Lang): Lang => lang === 'lt' ? 'en' : 'lt';
export const categoryLabel = (id: string, lang: Lang) => taxonomy.categories.find(item => item.id === id)?.label[lang] ?? id;
export const tagLabel = (id: string, lang: Lang) => taxonomy.tags.find(item => item.id === id)?.label[lang] ?? id;
export const formatDate = (value: string, lang: Lang) => new Intl.DateTimeFormat(lang === 'lt' ? 'lt-LT' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Vilnius' }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
export const formatNumber = (value: number, decimals: number, lang: Lang) => new Intl.NumberFormat(lang === 'lt' ? 'lt-LT' : 'en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
export const allPagePaths = () => languages.flatMap(lang => (Object.keys(segments[lang]) as View[]).map(view => ({ lang, view, path: segments[lang][view] || undefined })));
export function clientCatalog(lang: Lang) {
  return entries.map(entry => ({ id: entry.id, type: entry.type, title: entry[lang].title, description: entry[lang].description, body: entry[lang].body, url: articleUrl(entry, lang), categories: entry.categoryIds, tags: entry.tagIds.map(id => tagLabel(id, lang)) }));
}
