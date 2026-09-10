import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const examplesDirectory = join(projectRoot, 'examples', 'webhooks');
const checkOnly = process.argv.includes('--check');
const files = (await readdir(examplesDirectory))
  .filter((file) => file.endsWith('.json') && file !== 'index.json')
  .sort();
const index = {
  schemaVersion: 1,
  description:
    'Sanitized Lead Docket webhook payload examples. All people and identifiers are fictional.',
  examples: [],
};
const templates = {};
let changed = false;

for (const [fileIndex, file] of files.entries()) {
  const path = join(examplesDirectory, file);
  const original = JSON.parse(await readFile(path, 'utf8'));
  const sanitized = sanitize(original, '', fileIndex);
  const formatted = `${JSON.stringify(sanitized, null, 2)}\n`;
  const current = await readFile(path, 'utf8');
  if (current !== formatted) {
    changed = true;
    if (!checkOnly) await writeFile(path, formatted);
  }
  templates[file.replace(/\.json$/, '')] = Object.fromEntries(
    Object.entries(sanitized).filter(([key]) => !key.startsWith('_request_')),
  );
  index.examples.push({
    id: file.replace(/\.json$/, ''),
    label: titleCase(file.replace(/\.json$/, '')),
    eventType: typeof sanitized.EventType === 'string' ? sanitized.EventType : titleCase(file),
    file,
  });
}

const indexPath = join(examplesDirectory, 'index.json');
const indexContents = `${JSON.stringify(index, null, 2)}\n`;
let currentIndex = '';
try {
  currentIndex = await readFile(indexPath, 'utf8');
} catch (error) {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') {
    throw error;
  }
}
if (currentIndex !== indexContents) {
  changed = true;
  if (!checkOnly) await writeFile(indexPath, indexContents);
}

const templatesPath = join(projectRoot, 'src', 'mock', 'webhook-templates.gen.ts');
const templatesContents = `// Generated from sanitized examples/webhooks payloads. Do not edit by hand.\n\nexport const webhookPayloadTemplates = ${JSON.stringify(templates, null, 2)} as const;\n`;
let currentTemplates = '';
try {
  currentTemplates = await readFile(templatesPath, 'utf8');
} catch (error) {
  if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') {
    throw error;
  }
}
if (currentTemplates !== templatesContents) {
  changed = true;
  if (!checkOnly) await writeFile(templatesPath, templatesContents);
}

if (checkOnly && changed) {
  throw new Error('Webhook examples are not sanitized or the index is stale. Run the sanitizer.');
}
process.stdout.write(
  `${checkOnly ? 'Verified' : 'Sanitized'} ${files.length} webhook payload examples.\n`,
);

function sanitize(value, key, fileIndex) {
  if (Array.isArray(value)) return value.map((item) => sanitize(item, key, fileIndex));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitize(childValue, childKey, fileIndex),
      ]),
    );
  }
  if (value === null || typeof value === 'boolean') return value;

  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (typeof value === 'number') {
    if (normalized === 'eventtypeid' || normalized.includes('duration')) return value;
    if (normalized.includes('severitylevelid')) return 1;
    if (normalized.endsWith('id')) return exampleId(normalized, fileIndex);
    return value;
  }
  if (typeof value !== 'string') return value;

  if (normalized === 'eventtype' || normalized === 'extension') return value;
  if (normalized === 'hostname') return 'mock.leaddocket.local';
  if (normalized === 'requestpath') return '/webhooks/lead-docket';
  if (normalized === 'phonecallrecordingurl')
    return 'https://media.example.test/mock/example-recording.mp3';
  if (normalized === 'phonecalltranscript') return 'Fictional call transcript for webhook testing.';
  if (normalized === 'contacttimezone') return 'America/Los_Angeles';
  if (normalized === 'messagesendfromname') return 'Ada Lovelace';
  if (normalized.includes('date') || normalized.includes('time')) return '2025-01-15T12:00:00.000Z';
  if (
    normalized.includes('email') ||
    normalized.includes('sendto') ||
    normalized.includes('sendfrom')
  ) {
    return `${normalized.includes('intake') ? 'intake' : normalized.includes('creator') ? 'creator' : 'ada'}@example.test`;
  }
  if (
    normalized.includes('phone') ||
    normalized.includes('number') ||
    normalized.includes('calledfrom')
  ) {
    return normalized.includes('to') ? '+15550100002' : '+15550100001';
  }
  if (normalized.includes('url')) {
    if (normalized.includes('file')) return 'https://files.example.test/mock/example-document.pdf';
    if (normalized.includes('recording'))
      return 'https://media.example.test/mock/example-recording.mp3';
    return 'https://www.example.test/mock-source';
  }
  if (normalized.includes('firstname')) return 'Ada';
  if (normalized.includes('middlename')) return null;
  if (normalized.includes('lastname')) return 'Lovelace';
  if (normalized.includes('fullname')) return 'Ada Lovelace';
  if (normalized.includes('opportunityname')) return 'Mock Opportunity';
  if (
    normalized.includes('createdby') ||
    normalized.includes('processedby') ||
    normalized.includes('eventbyuser')
  )
    return 'Mock User';
  if (normalized.includes('intakename')) return 'Mock Intake Team';
  if (normalized.includes('creatorname')) return 'Mock Creator';
  if (normalized.includes('filename')) return 'example-document.pdf';
  if (normalized.includes('reportname')) return 'Example Data Sync Report';
  if (normalized.includes('subject')) return 'Example inbound message';
  if (normalized.includes('transcript')) return 'Fictional call transcript for webhook testing.';
  if (normalized.includes('summary')) return 'Fictional case summary for webhook testing.';
  if (normalized === 'note' || normalized.includes('notes'))
    return 'Fictional note with no personal information.';
  if (normalized.includes('address')) return '123 Example Street';
  if (normalized === 'city') return 'Example City';
  if (normalized === 'county') return 'Example County';
  if (normalized === 'state') return 'CA';
  if (normalized === 'zip') return '00000';
  if (normalized.includes('language')) return 'English';
  if (normalized.includes('casetype')) return 'Example Case Type';
  if (normalized.includes('status')) return 'New';
  if (normalized.includes('office')) return 'Main Office';
  if (normalized.includes('marketingsource')) return 'Example Website';
  if (normalized.includes('contactsource')) return 'Web Form';
  if (normalized.includes('campaign')) return 'Example Campaign';
  if (normalized === 'utm') return 'utm_source=example';
  if (normalized.includes('tag')) return 'Example Tag';
  if (normalized.includes('code')) return 'MOCK-CODE';
  if (normalized.includes('disregardreason')) return 'Duplicate test submission';
  if (normalized.includes('filecategory')) return 'Documents';
  return 'Example value';
}

function exampleId(key, fileIndex) {
  if (key.includes('contact')) return 1001;
  if (key.includes('lead')) return 2001;
  if (key.includes('opportunity')) return 3001;
  if (key.includes('message')) return 4001;
  if (key.includes('report')) return 5001;
  return 9000 + fileIndex;
}

function titleCase(value) {
  return value
    .replace(/\.json$/, '')
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
