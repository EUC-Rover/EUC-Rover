import { z } from 'zod';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const localizedText = z.object({ lt: z.string().trim().min(1), en: z.string().trim().min(1) }).strict();
const translation = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  body: z.string().trim().min(1),
}).strict();
const realDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Use a real calendar date.');
const instant = z.iso.datetime({ offset: true });

export const publicationSchema = z.object({
  schemaVersion: z.literal(1),
  id,
  slug: id,
  type: z.enum(['post', 'trip']),
  status: z.literal('published'),
  demo: z.boolean().default(false),
  publishedAt: instant,
  updatedAt: instant.optional(),
  trip: z.object({
    start: realDate,
    end: realDate.optional(),
    timezone: z.string().refine(value => {
      try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
    }, 'Use an IANA time zone.'),
  }).strict().optional(),
  categoryIds: z.array(id).default([]),
  tagIds: z.array(id).default([]),
  metrics: z.array(z.object({
    id,
    label: localizedText,
    value: z.number().finite(),
    unit: z.enum(['km', 'm', 'h', 'min', 'km/h', 'Wh', 'Wh/km', '%', '°C']),
    decimals: z.number().int().min(0).max(2).default(0),
    priority: z.number().int().min(0).default(0),
  }).strict()).default([]),
  lt: translation,
  en: translation,
}).strict().superRefine((entry, context) => {
  if (entry.type === 'trip' && !entry.trip) context.addIssue({ code: 'custom', message: 'Trips require an actual trip date and time zone.' });
  if (entry.type === 'post' && entry.trip) context.addIssue({ code: 'custom', message: 'General posts do not have trip dates.' });
  if (entry.trip?.end && entry.trip.end < entry.trip.start) context.addIssue({ code: 'custom', message: 'Trip end precedes its start.' });
  if (entry.updatedAt && Date.parse(entry.updatedAt) < Date.parse(entry.publishedAt)) context.addIssue({ code: 'custom', message: 'Update precedes first publication.' });
  if (new Set(entry.metrics.map(metric => metric.id)).size !== entry.metrics.length) context.addIssue({ code: 'custom', message: 'Duplicate metric ID.' });
  for (const metric of entry.metrics) if (['distance', 'duration', 'ascent'].includes(metric.id) && metric.value < 0) context.addIssue({ code: 'custom', message: `Metric ${metric.id} cannot be negative.` });
});

export const taxonomySchema = z.object({
  groups: z.array(z.object({ id, label: localizedText }).strict()),
  categories: z.array(z.object({ id, groupId: id, label: localizedText }).strict()),
  tags: z.array(z.object({ id, label: localizedText }).strict()).default([]),
}).strict();

export function validatePublication(value, { allowDemo = false } = {}) {
  const result = publicationSchema.parse(value);
  if (result.demo && !allowDemo) throw new Error(`Demo content cannot be published: ${result.id}`);
  return result;
}

export function loadPublications(root, { demo = false } = {}) {
  // Editorial content is deliberately never traversed by the public reader.
  const dirs = ['content/published/posts', 'content/published/trips'];
  if (demo) dirs.push('content/demo');
  const entries = dirs.flatMap(dir => readdirSync(join(root, dir), { withFileTypes: true })
    .filter(file => file.isFile() && file.name.endsWith('.json'))
    .map(file => validatePublication(JSON.parse(readFileSync(join(root, dir, file.name), 'utf8')), { allowDemo: dir === 'content/demo' })));
  const identities = new Set();
  const routes = new Set();
  for (const entry of entries) {
    if (identities.has(entry.id)) throw new Error(`Duplicate publication ID: ${entry.id}`);
    const route = `${entry.type}/${entry.slug}`;
    if (routes.has(route)) throw new Error(`Duplicate publication route: ${route}`);
    identities.add(entry.id); routes.add(route);
  }
  return entries.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}

export { chooseLanguage } from './language.mjs';

export function normalizeBase(base = '/') {
  if (!/^\/[a-zA-Z0-9/_-]*\/?$/.test(base) || base.includes('//')) throw new Error('SITE_BASE must be a plain path such as /euc-rover/.');
  return base === '/' ? '/' : `${base.replace(/\/$/, '')}/`;
}

export function joinBase(base, path = '') {
  return `${normalizeBase(base)}${path.replace(/^\//, '')}`;
}

export function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]);
}
