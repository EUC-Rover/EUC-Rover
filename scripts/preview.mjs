import { spawn } from 'node:child_process';
import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

if (!existsSync('dist-demo/index.html')) throw new Error('Run npm run build:demo first.');

const packageRoot = resolve('node_modules', 'astro');
const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const relativeBin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.astro;
if (!relativeBin) throw new Error('Cannot find the Astro executable.');

const child = spawn(process.execPath, [resolve(packageRoot, relativeBin), 'preview', '--host', '0.0.0.0', ...process.argv.slice(2)], {
  env: { ...process.env, EUC_BUILD_MODE: 'demo' }, stdio: 'inherit', shell: false,
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 0; });
