import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { normalizeBase, loadPublications } from '../src/lib/content-core.mjs';

if (existsSync('.env')) process.loadEnvFile('.env');
const mode = process.argv[2] || 'production';
if (!['production', 'demo'].includes(mode)) throw new Error('Use production or demo.');
const env = { ...process.env, EUC_BUILD_MODE: mode, ASTRO_TELEMETRY_DISABLED: '1' };
normalizeBase(env.SITE_BASE || '/');
if (env.SITE_URL && !/^https?:\/\/[^/]+\/?$/.test(env.SITE_URL)) throw new Error('SITE_URL must be an origin without a path.');

function packageBin(packageName, commandName) {
  const packageRoot = resolve('node_modules', ...packageName.split('/'));
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  const relativeBin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[commandName];
  if (!relativeBin) throw new Error(`Cannot find ${commandName} in ${packageName}.`);
  return resolve(packageRoot, relativeBin);
}

async function run(command, args) {
  await new Promise((accept, reject) => {
    const child = spawn(command, args, { env, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? accept() : reject(new Error(`${command} exited with ${code}`)));
  });
}
await run(process.execPath, ['scripts/validate-content.mjs']);
await run(process.execPath, [packageBin('astro', 'astro'), 'build']);
if (loadPublications(process.cwd(), { demo: mode === 'demo' }).length > 0) {
  await run(process.execPath, [packageBin('pagefind', 'pagefind'), '--site', mode === 'demo' ? 'dist-demo' : 'dist', '--root-selector', '[data-pagefind-body]']);
} else {
  console.log('No published articles yet; no search index is generated.');
}
console.log(`Built ${mode} output in ${join(process.cwd(), mode === 'demo' ? 'dist-demo' : 'dist')}.`);
