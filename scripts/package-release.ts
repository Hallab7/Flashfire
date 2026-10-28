import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';

const outputRoot = '.release';
const siteRoot = join(outputRoot, 'site');
const sourceMapRoot = join(outputRoot, 'sourcemaps');

async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(path) : Promise.resolve([path]);
    }),
  );
  return nested.flat();
}

async function fingerprint(path: string, root: string): Promise<object> {
  const bytes = await readFile(path);
  return {
    path: relative(root, path).replaceAll('\\', '/'),
    bytes: (await stat(path)).size,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(sourceMapRoot, { recursive: true });
await cp('dist', siteRoot, { recursive: true });

for (const path of await filesUnder(siteRoot)) {
  if (!path.endsWith('.map')) continue;
  await rename(path, join(sourceMapRoot, basename(path)));
}

const packageDocument = JSON.parse(await readFile('package.json', 'utf8')) as { version: string };
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const siteFiles = await filesUnder(siteRoot);
const sourceMaps = await filesUnder(sourceMapRoot);
const manifest = {
  version: packageDocument.version,
  commit,
  site: await Promise.all(siteFiles.map((path) => fingerprint(path, siteRoot))),
  sourceMaps: await Promise.all(sourceMaps.map((path) => fingerprint(path, sourceMapRoot))),
};
await writeFile(join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(
  `Packaged ${siteFiles.length} deployable files and ${sourceMaps.length} separate source maps.\n`,
);
