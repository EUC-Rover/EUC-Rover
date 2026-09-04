import { defineConfig } from 'astro/config';
import { existsSync } from 'node:fs';
import { normalizeBase } from './src/lib/content-core.mjs';
import { pagefindDev } from './scripts/pagefind-dev.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');
const site = process.env.SITE_URL || 'https://example.invalid';
const base = normalizeBase(process.env.SITE_BASE || '/');

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  outDir: process.env.EUC_BUILD_MODE === 'demo' ? './dist-demo' : './dist',
  devToolbar: { enabled: false },
  server: { host: true, allowedHosts: ['terminal.local'] },
  vite: { plugins: [pagefindDev()], server: { allowedHosts: ['terminal.local'] } },
});
