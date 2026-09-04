import type { APIRoute } from 'astro';
import { demoMode, asset } from '../lib/site';
export const GET: APIRoute = ({ site }) => {
  const ready = !demoMode && site && site.hostname !== 'example.invalid';
  return new Response(ready ? `User-agent: *\nAllow: /\nSitemap: ${new URL(asset('sitemap.xml'), site)}\n` : 'User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain' } });
};
