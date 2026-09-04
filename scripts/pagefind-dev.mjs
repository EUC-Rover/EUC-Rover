import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

// Make the last demo search index available to Astro dev without putting it in public/.
// This middleware is never part of static production output.
export function pagefindDev() {
  return {
    name: 'euc-rover-pagefind-development',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const base = (process.env.SITE_BASE || '/').replace(/\/$/, '');
        const prefix = `${base}/pagefind/`;
        const url = new URL(request.url || '/', 'http://localhost');
        if (!url.pathname.startsWith(prefix)) return next();
        const root = resolve('dist-demo/pagefind');
        const file = resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)));
        if (!file.startsWith(`${root}${sep}`)) { response.statusCode = 403; response.end(); return; }
        try {
          if (!(await stat(file)).isFile()) return next();
          const type = { '.js': 'text/javascript', '.json': 'application/json', '.wasm': 'application/wasm', '.css': 'text/css' }[extname(file)] || 'application/octet-stream';
          response.setHeader('Content-Type', type);
          response.setHeader('Cache-Control', 'no-store');
          response.end(await readFile(file));
        } catch { next(); }
      });
    },
  };
}
