import type { APIRoute } from 'astro';
import { entries, articleUrl, pageUrl, demoMode } from '../lib/site';
import { languages } from '../i18n/ui';
import { escapeXml } from '../lib/content-core.mjs';
export const GET: APIRoute = ({ site }) => {
  const paths = demoMode || !site || site.hostname === 'example.invalid' ? [] : languages.flatMap(lang => [pageUrl(lang), pageUrl(lang, 'posts'), pageUrl(lang, 'trips'), ...entries.filter(entry => !entry.demo).map(entry => articleUrl(entry, lang))]);
  const urls = paths.map(path => `<url><loc>${escapeXml(new URL(path, site))}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
