import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface ReleaseFile {
  path: string;
  bytes: number;
  sha256: string;
}
interface ReleaseManifest {
  version: string;
  commit: string;
  site: ReleaseFile[];
  sourceMaps: ReleaseFile[];
}

const manifest = JSON.parse(await readFile('.release/manifest.json', 'utf8')) as ReleaseManifest;
const packageDocument = JSON.parse(await readFile('package.json', 'utf8')) as { version: string };
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (manifest.version !== packageDocument.version) throw new Error('Release version mismatch.');
if (manifest.commit !== commit) throw new Error('Release artifact was not built from HEAD.');
if (manifest.sourceMaps.length === 0) throw new Error('No separately stored source maps found.');
if (manifest.site.some((file) => file.path.endsWith('.map'))) {
  throw new Error('A source map leaked into the deployable site.');
}

const assetNames = await readdir('.release/site/assets');
const productionAssets = assetNames.filter((name) => /\.(?:js|css)$/.test(name));
if (
  productionAssets.length === 0 ||
  productionAssets.some((name) => !/-[A-Za-z0-9_-]{8,}\.(?:js|css)$/.test(name))
) {
  throw new Error('Production assets are not content hashed.');
}

const headers = await readFile('.release/site/_headers', 'utf8');
if (!headers.includes('max-age=31536000, immutable') || !headers.includes('must-revalidate')) {
  throw new Error('Release cache policy is incomplete.');
}

for (const file of [...manifest.site, ...manifest.sourceMaps]) {
  const root = manifest.site.includes(file) ? '.release/site' : '.release/sourcemaps';
  const bytes = await readFile(join(root, file.path));
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== file.sha256 || bytes.byteLength !== file.bytes) {
    throw new Error(`Release fingerprint mismatch: ${file.path}`);
  }
}

process.stdout.write(
  `Verified release ${manifest.version} at ${manifest.commit.slice(0, 7)} with ${productionAssets.length} hashed assets.\n`,
);
