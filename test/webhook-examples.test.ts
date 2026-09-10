import { readdir, readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vite-plus/test';

type ExampleIndex = {
  schemaVersion: number;
  examples: Array<{ id: string; label: string; eventType: string; file: string }>;
};

type WebhookPayload = Record<string, unknown>;

const directory = 'examples/webhooks';
const expectedExamples = [
  { file: 'contact-added.json', eventType: 'Contact Added', eventTypeId: 6 },
  { file: 'contact-edited.json', eventType: 'Contact Edited', eventTypeId: 7 },
  { file: 'data-sync-completed.json', eventType: 'Data Sync Completed', eventTypeId: 29 },
  { file: 'email-received.json', eventType: 'Email Received', eventTypeId: 12 },
  { file: 'file-uploaded.json', eventType: 'File Uploaded', eventTypeId: 15 },
  { file: 'lead-created.json', eventType: 'Lead Created', eventTypeId: 1 },
  { file: 'lead-edited.json', eventType: 'Lead Edited', eventTypeId: 2 },
  {
    file: 'lead-sent-to-external-system.json',
    eventType: 'Lead Sent to External System',
    eventTypeId: 25,
  },
  { file: 'lead-status-changed.json', eventType: 'Lead Status Changed', eventTypeId: 3 },
  { file: 'note-added.json', eventType: 'Note Added', eventTypeId: 4 },
  {
    file: 'opportunity-converted-to-lead.json',
    eventType: 'Opportunity Converted To Lead',
    eventTypeId: 19,
  },
  { file: 'opportunity-created.json', eventType: 'Opportunity Created', eventTypeId: 10 },
  {
    file: 'opportunity-disregarded.json',
    eventType: 'Opportunity Disregarded',
    eventTypeId: 20,
  },
  { file: 'tag-added-to-contact.json', eventType: 'Tag Added To Contact', eventTypeId: 8 },
  { file: 'text-received.json', eventType: 'Text Received', eventTypeId: 11 },
] as const;

async function readPayload(file: string): Promise<WebhookPayload> {
  return JSON.parse(await readFile(`${directory}/${file}`, 'utf8')) as WebhookPayload;
}

function* keyedValues(value: unknown): Generator<[string, unknown]> {
  if (Array.isArray(value)) {
    for (const item of value) yield* keyedValues(item);
    return;
  }
  if (!value || typeof value !== 'object') return;

  for (const [key, childValue] of Object.entries(value)) {
    yield [key, childValue];
    yield* keyedValues(childValue);
  }
}

function valuesForKey(payloads: WebhookPayload[], key: string): unknown[] {
  return payloads.flatMap((payload) =>
    [...keyedValues(payload)].filter(([candidate]) => candidate === key).map(([, value]) => value),
  );
}

describe('sanitized webhook payload examples', () => {
  it('indexes the exact supported payload files', async () => {
    const index = JSON.parse(await readFile(`${directory}/index.json`, 'utf8')) as ExampleIndex;
    const payloadFiles = (await readdir(directory))
      .filter((file) => file.endsWith('.json') && file !== 'index.json')
      .sort();
    const expectedFiles = expectedExamples.map(({ file }) => file);

    expect(index.schemaVersion).toBe(1);
    expect(payloadFiles).toEqual(expectedFiles);
    expect(index.examples.map((example) => example.file)).toEqual(expectedFiles);
    expect(index.examples.map(({ file, eventType }) => ({ file, eventType }))).toEqual(
      expectedExamples.map(({ file, eventType }) => ({ file, eventType })),
    );
  });

  it('preserves every EventType and EventTypeId', async () => {
    for (const expected of expectedExamples) {
      const payload = await readPayload(expected.file);
      expect({ EventType: payload.EventType, EventTypeId: payload.EventTypeId }).toEqual({
        EventType: expected.eventType,
        EventTypeId: expected.eventTypeId,
      });
    }
  });

  it('uses the key-specific format for semantically specific fields', async () => {
    const payloads = await Promise.all(expectedExamples.map(({ file }) => readPayload(file)));

    expect(valuesForKey(payloads, 'PhoneCallRecordingURL')).toEqual(
      Array(3).fill('https://media.example.test/mock/example-recording.mp3'),
    );
    expect(valuesForKey(payloads, 'PhoneCallTranscript')).toEqual(
      Array(3).fill('Fictional call transcript for webhook testing.'),
    );
    expect(valuesForKey(payloads, 'ContactTimezone')).toEqual(Array(3).fill('America/Los_Angeles'));
    expect(valuesForKey(payloads, 'MessageSendFromName')).toEqual(Array(2).fill('Ada Lovelace'));
  });

  it('uses only PII-safe domains and sensitive values', async () => {
    const safeUrlHosts = new Set(['www.example.test', 'files.example.test', 'media.example.test']);
    const safePhoneNumbers = new Set(['+15550100001', '+15550100002']);

    for (const { file } of expectedExamples) {
      const payload = await readPayload(file);
      expect(payload.hostname).toBe('mock.leaddocket.local');

      const serialized = JSON.stringify(payload).toLowerCase();
      expect(serialized).not.toContain('calljacob');
      expect(serialized).not.toContain('.leaddocket.com');

      for (const [key, value] of keyedValues(payload)) {
        if (typeof value !== 'string') continue;
        const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (
          normalized.includes('email') ||
          normalized === 'messagesendto' ||
          normalized === 'messagesendfrom'
        ) {
          expect(value, `${file}:${key}`).toMatch(/^[A-Z0-9._%+-]+@example\.test$/i);
        }

        if (normalized.includes('url')) {
          expect(safeUrlHosts, `${file}:${key}`).toContain(new URL(value).hostname);
        }

        if (
          normalized.endsWith('phone') ||
          normalized === 'phonecallfromnumber' ||
          normalized === 'phonecalltonumber' ||
          normalized === 'calledfrom'
        ) {
          expect(safePhoneNumbers, `${file}:${key}`).toContain(value);
        }

        if (normalized.includes('firstname')) expect(value, `${file}:${key}`).toBe('Ada');
        if (normalized.includes('lastname')) expect(value, `${file}:${key}`).toBe('Lovelace');
        if (normalized.includes('fullname')) expect(value, `${file}:${key}`).toBe('Ada Lovelace');
      }
    }
  });
});
