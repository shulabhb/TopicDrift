import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

test.describe('extension shell build artifacts', () => {
  test('production manifest stays minimal and privacy-preserving', async () => {
    const manifestPath = resolve('.output/chrome-mv3/manifest.json');
    const raw = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw) as {
      name: string;
      manifest_version: number;
      permissions?: string[];
      host_permissions?: string[];
      content_scripts?: Array<{ matches: string[] }>;
    };

    expect(manifest.name).toBe('TopicDrift');
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.permissions?.sort()).toEqual(['storage']);
    expect(manifest.host_permissions).toEqual(['https://meet.google.com/*']);
    expect(manifest.content_scripts?.[0]?.matches).toEqual([
      'https://meet.google.com/*',
    ]);
  });
});
