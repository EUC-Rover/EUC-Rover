import type { APIRoute } from 'astro';
import { entries, articleUrl } from '../../lib/site';
import { languages, type Lang } from '../../i18n/ui';
import { escapeXml } from '../../lib/content-core.mjs';
export const getStaticPaths = () => languages.map(lang => ({ params: { lang } }));
export const GET: APIRoute = ({ params, site }) => {
  const lang = params.lang as Lang;
  const origin = site ?? new URL('https://example.invalid');
  const items = entries.filter(entry => !entry.demo).map(entry => `<item><title>${escapeXml(entry[lang].title)}</title><link>${escapeXml(new URL(articleUrl(entry, lang), origin))}</link><guid isPermaLink="false">euc-rover:${escapeXml(entry.id)}:${lang}</guid><pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate><description>${escapeXml(entry[lang].description)}</description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>EUC ROVER — ${lang.toUpperCase()}</title><link>${escapeXml(origin)}</link><description>EUC ROVER</description><language>${lang}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
