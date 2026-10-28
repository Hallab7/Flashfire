import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Flashfire baseline', () => {
  it('uses Flashfire as the package and page identity', () => {
    const root = resolve(import.meta.dirname, '../..');
    const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    const page = readFileSync(resolve(root, 'index.html'), 'utf8');

    expect(packageJson.name).toBe('flashfire');
    expect(page).toContain('<title>Flashfire</title>');
    expect(page).not.toContain('SKYFIRE');
  });
});
