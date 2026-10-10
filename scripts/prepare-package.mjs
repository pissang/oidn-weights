import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const manifest = JSON.parse(await readFile(new URL('weights-manifest.json', root), 'utf8'));
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const verifyOnly = process.argv.includes('--verify-only');
if (pkg.version.split('-')[0] !== manifest.oidnVersion) {
  throw new Error('Package version must match the OIDN version, with an optional packaging revision.');
}
await mkdir(output, { recursive: true });

async function verify(url, expected) {
  const bytes = await readFile(url);
  if (bytes.length !== expected.size || createHash('sha256').update(bytes).digest('hex') !== expected.sha256) {
    throw new Error(`Invalid weight file: ${fileURLToPath(url)}`);
  }
  if (bytes[0] !== 0xd7 || bytes[1] !== 0x41) throw new Error('Expected a TZA binary, not a Git LFS pointer.');
}

for (const [name, expected] of Object.entries(manifest.files)) {
  const target = new URL(name, output);
  try {
    await verify(target, expected);
  } catch (error) {
    if (verifyOnly) throw error;
    const partial = new URL(`${name}.partial`, output);
    await run('curl', [
      '--fail', '--location', '--silent', '--show-error', '--retry', '2',
      '--connect-timeout', '15', '--max-time', '180', '--output', fileURLToPath(partial),
      `https://media.githubusercontent.com/media/RenderKit/oidn-weights/${manifest.upstreamCommit}/${name}`
    ]);
    await verify(partial, expected);
    await rename(partial, target);
  }
  console.log(`Verified ${name}`);
}

for (const name of ['LICENSE.txt', 'README.md', 'weights-manifest.json']) {
  await copyFile(new URL(name, root), new URL(name, output));
}
const { scripts, ...published } = pkg;
await writeFile(new URL('package.json', output), `${JSON.stringify(published, null, 2)}\n`);
console.log(`Prepared ${pkg.name}@${pkg.version}: ${Object.keys(manifest.files).length} verified networks in dist/.`);
