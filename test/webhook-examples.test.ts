import { readdir, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vite-plus/test';

type ExampleIndex = {
  schemaVersion: number;
  examples: Array<{ id: string; label: string; eventType: string; file: string }>;
};

describe('sanitized webhook payload examples', () => {
  it('indexes every payload and contains no live contact data or hosts', async () => {
    const directory = 'examples/webhooks';
    const index = JSON.parse(await readFile(`${directory}/index.json`, 'utf8')) as ExampleIndex;
    const files = (await readdir(directory))
      .filter((file) => file.endsWith('.json') && file !== 'index.json')
      .sort();

    expect(index.schemaVersion).toBe(1);
    expect(index.examples).toHaveLength(15);
    expect(index.examples.map((example) => example.file).sort()).toEqual(files);

    for (const example of index.examples) {
      const payload = JSON.parse(await readFile(`${directory}/${example.file}`, 'utf8')) as Record<
        string,
        unknown
      >;
      expect(payload.EventType).toBe(example.eventType);
      const serialized = JSON.stringify(payload);
      expect(serialized.toLowerCase()).not.toContain('calljacob');
      expect(serialized.toLowerCase()).not.toContain('.leaddocket.com');
      for (const email of serialized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []) {
        expect(email.toLowerCase().endsWith('@example.test')).toBe(true);
      }
      for (const urlValue of serialized.match(/https?:\\?\/\\?\/[^"\\]+/gi) ?? []) {
        const url = new URL(urlValue.replaceAll('\\/', '/'));
        expect([
          'example.test',
          'www.example.test',
          'files.example.test',
          'media.example.test',
        ]).toContain(url.hostname);
      }
    }
  });
});
