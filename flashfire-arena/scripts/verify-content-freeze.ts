import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

interface FreezeManifest {
  version: string;
  files: Record<string, string>;
}

const manifest = JSON.parse(
  await readFile('release/content-freeze.json', 'utf8'),
) as FreezeManifest;
const packageDocument = JSON.parse(await readFile('package.json', 'utf8')) as { version: string };

if (manifest.version !== packageDocument.version) {
  throw new Error(`Content freeze is ${manifest.version}; package is ${packageDocument.version}.`);
}

for (const [file, expected] of Object.entries(manifest.files)) {
  const actual = createHash('sha256')
    .update(await readFile(file))
    .digest('hex');
  if (actual !== expected) throw new Error(`Frozen content changed: ${file}`);
}

process.stdout.write(`Verified ${Object.keys(manifest.files).length} frozen content files.\n`);
