# Lead Docket TypeScript API Client

[![npm version](https://badge.fury.io/js/%40calljacob%2Fleaddocket-typescript.svg)](https://badge.fury.io/js/%40calljacob%2Fleaddocket-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A strongly-typed, auto-generated TypeScript API client library for the [Lead Docket API](https://{example}.leaddocket.com/api/explore/index.html).

This library provides full TypeScript definitions, autocomplete, and a native `fetch` implementation for all 114 Lead Docket API endpoints.

## Installation

```bash
npm install @calljacob/leaddocket-typescript
```

or

```bash
yarn add @calljacob/leaddocket-typescript
```

or

```bash
pnpm add @calljacob/leaddocket-typescript
```

## Usage

You can use the exported `client` instance to configure your credentials and base URL globally.

```typescript
import { client, leadsGetByStatus } from '@calljacob/leaddocket-typescript';

// 1. Configure the client
client.setConfig({
  baseUrl: 'https://{example}.leaddocket.com', // Replace {example} with your organization's subdomain
  headers: {
    Authorization: 'Bearer YOUR_API_TOKEN',
  },
});

// 2. Call an endpoint using one of the generated SDK functions
async function fetchLeads() {
  try {
    const { data, error } = await leadsGetByStatus({
      query: {
        status: 123,
      },
    });

    if (error) {
      console.error('Failed to fetch leads:', error);
      return;
    }

    console.log('Leads:', data);
  } catch (err) {
    console.error('Network Error:', err);
  }
}

fetchLeads();
```

## Features

- **Fully Typed:** Generated directly from the official OpenAPI v3 schema.
- **Portable Core:** The generated client and in-memory mock use the native web `fetch` API. They work in Node.js 24+, browsers, Edge runtime, Next.js, and Cloudflare Workers; the optional Node mock server adds self-hosted Swagger UI and Faker-powered fixture generation.
- **Comprehensive:** Covers all 114 endpoints across Leads, Contacts, Opportunities, External Calls, Settlements, and more.
- **Mockable:** Includes a full in-memory mock API that responds to every generated endpoint and emits webhook events for API-driven mutations.

## Mock API and Webhooks

Use `createLeadDocketMockApi()` in tests, local demos, or integration development when you want Lead Docket-compatible responses without calling a real account.

```typescript
import { client, contactsAdd, createLeadDocketMockApi } from '@calljacob/leaddocket-typescript';

const mock = createLeadDocketMockApi({
  seed: {
    contacts: [{ Id: 1, FirstName: 'Existing', LastName: 'Contact' }],
    contactCustomFields: [
      { Id: 101, FieldName: 'Preferred Language', Location: 'Contact', FieldType: 'Text' },
    ],
    customFieldValues: {
      contacts: {
        1: { 101: 'Spanish' },
      },
    },
  },
});

mock.onWebhook((event) => {
  console.log('Webhook:', event.event, event.data);
});

client.setConfig({
  baseUrl: mock.baseUrl,
  fetch: mock.fetch,
});

await contactsAdd({
  body: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  },
});

console.log(mock.getRequests());
console.log(mock.getWebhookEvents()); // includes contact.created
```

The mock supports:

- every operation in `openapi.json` via the same generated SDK methods;
- in-memory stores for common Lead Docket resources, including contacts, leads, opportunities, tasks, referrals, statuses, settlements, expenses, messages, external calls, users, and lead forms;
- seeding/resetting data with `seed`, `setStore`, `getStore`, and `reset`;
- developer-defined custom fields through `contactCustomFields`, `customFields`, and `customFieldValues`, returned as Lead Docket-style `CustomFields` arrays on contacts, leads, and opportunities;
- API-driven webhook events for non-`GET` calls, such as `contact.created`, `lead.updated`, `task.completed`, or `message.sent`;
- manually emitted webhooks with `mock.emitWebhook(...)` for events that originate outside an API call;
- webhook subscriptions via local handlers or outbound `POST` delivery to a URL.

## Local mock server and webhook UI

The Node-only server adapter exposes the in-memory mock over HTTP and includes an administration page for triggering webhook presets or custom payloads:

```typescript
import { startLeadDocketMockServer } from '@calljacob/leaddocket-typescript/mock/server';

const server = await startLeadDocketMockServer({
  port: 4010,
  mock: {
    seed: {
      contacts: [{ Id: 1, FirstName: 'Ada', LastName: 'Lovelace' }],
    },
    webhookSubscriptions: [
      {
        url: 'http://localhost:3000/webhooks/leaddocket',
        events: ['lead.*', 'contact.*', 'opportunity.*'],
      },
    ],
  },
});

console.log(server.origin); // http://127.0.0.1:4010
console.log(server.docsUrl); // http://127.0.0.1:4010/
console.log(server.adminUrl); // http://127.0.0.1:4010/__mock/

// Later:
await server.close();
```

The server binds to `127.0.0.1` by default, enables API CORS for local browser applications, limits request bodies, and prevents cross-origin admin mutations. Webhook HTTP statuses and failures are recorded without turning an otherwise successful mock API mutation into a `500` response.

### Swagger API documentation

Self-hosted Swagger UI is available at the mock server root:

```text
http://127.0.0.1:4010/
```

For parity with Lead Docket's live documentation URL, the same page is also served at:

```text
http://127.0.0.1:4010/api/explore/index.html
```

The raw runtime OpenAPI document is available at `/openapi.json`. Its paths, operations, schemas, and `api_key` security definition match the project's source `openapi.json`; only the title, description, `servers`, and mock-specific extension fields are overlaid so Swagger clearly identifies the mock and sends **Try it out** requests to the local server. Swagger UI assets are served from the package and do not require a CDN.

### Webhook payload examples

Sanitized examples of all 15 documented Lead Docket webhook payloads live under `examples/webhooks/`. The generated `examples/webhooks/index.json` records the event name and file for each payload.

The admin page includes an event selector, formatted JSON viewer, and copy button. Examples are also available as JSON:

```text
GET /__mock/webhook-examples
GET /__mock/webhook-examples/lead-created
```

The runtime OpenAPI document includes the same payloads under the `x-mock-webhook-payload-examples` extension without changing the original Lead Docket paths or schemas. All names, IDs, phone numbers, email addresses, URLs, dates, filenames, summaries, notes, and transcripts use controlled fictional values.

When adding or replacing examples, sanitize and verify them with:

```bash
vp run sanitize:webhook-examples
vp run check:webhook-examples
```

### CLI and config file

Within this repository, build and start the server with:

```bash
cp leaddocket.mock.example.json leaddocket.mock.json
vp run mock
```

When using the published package without installing it permanently:

```bash
npx --yes --package @calljacob/leaddocket-typescript leaddocket-mock
```

The default `leaddocket.mock.json` supports server options, generated and explicit mock data, opportunity integrations, webhook subscriptions, and UI presets. It is ignored by Git because copied account metadata may be sensitive; `leaddocket.mock.example.json` is the reviewable template.

### Generate realistic mock data with Faker

Configure deterministic startup data in `leaddocket.mock.json`:

```json
{
  "generatedData": {
    "seed": 12345,
    "contacts": 20,
    "leads": 20,
    "opportunities": 20,
    "tasks": 15,
    "messages": 10,
    "users": 5
  }
}
```

Generated records are created first and explicit arrays under `seed` are appended afterward. The admin page also provides per-resource counts and a **Generate and append** action for adding data to the running server. Admin batches automatically select a new reserved ID offset, so repeated deterministic generations do not introduce duplicate IDs. Fixture generation does not emit webhooks.

The generator is available separately from the portable package root:

```typescript
import { generateLeadDocketMockData } from '@calljacob/leaddocket-typescript/mock/faker';

const seed = generateLeadDocketMockData({
  seed: 42,
  contacts: 50,
  leads: 25,
  opportunities: 25,
});
```

Faker-generated contacts, leads, opportunities, tasks, messages, and users use relational IDs, `example.test` email addresses, and reserved `+1555` phone numbers. The same Faker version and seed reproduce the same records; Faker upgrades may change deterministic output.

### Opportunity integration forms

Configure Lead Docket-style public forms with local-only access keys:

```json
{
  "opportunityIntegrations": [
    {
      "id": 28,
      "accessKey": "local-integration-28",
      "name": "Website Case Evaluation",
      "fields": [
        { "key": "FirstName", "label": "First name", "required": true },
        { "key": "LastName", "label": "Last name", "required": true },
        { "key": "Email", "type": "email", "required": true },
        { "key": "Summary", "type": "textarea", "required": true },
        { "key": "custom:301", "label": "Potential case value", "type": "number" }
      ]
    }
  ]
}
```

Fields can target canonical opportunity properties, synchronized custom fields through `custom:<id>`, or integration-specific webhook data through `extra:<name>`. Select and radio options accept either plain strings or `{ "label", "value" }` objects when the displayed text should differ from the stored value. Checkbox controls support `checkedValue` and `uncheckedValue`, while `type: "hidden"` applies a non-user-editable configured value. See integration `40` in `leaddocket.mock.example.json` for a complete example.

After starting the mock server, the form is available at:

```text
http://127.0.0.1:4010/opportunities/form/28?apikey=local-integration-28
```

Every configured integration appears in the administration UI with separate **Open form** and **Preview** links. Preview URLs follow Lead Docket's convention:

```text
http://127.0.0.1:4010/opportunities/form/28?apikey=local-integration-28&preview=true
```

Preview mode renders the exact configured fields and user-defined values, but disables browser submission and rejects POST requests without creating an opportunity or webhook. A valid non-preview browser or JSON submission:

1. validates only the configured fields;
2. creates an unprocessed opportunity in the mock store;
3. applies configured defaults and `custom:<id>` values;
4. emits exactly one `opportunity.created` webhook to matching subscriptions; and
5. redirects browser submissions to a confirmation page.

Integration access keys are removed from request history and webhook metadata. Use mock-only values—not real Lead Docket integration keys—in local configuration.

### Synchronize a live setup

Lead Docket's REST API can list contact and lead/opportunity custom fields, but it does not expose an endpoint that lists Opportunity Integrations. Integration Definitions are available only as individual form URLs. Provide every Definitions/preview URL through `.dev.vars`, `integrationPreviewUrls` in the ignored mock config, or the admin import textarea.

Synchronization performs read-only requests only:

- `GET /api/contactcustomfields/list` and `/api/customfields/list`;
- `GET /api/statuses` for statuses and nested substatuses;
- `GET /api/leadroles` and `/api/leadsources/list`;
- `GET /api/lookups/gettypes`, followed by each allowed `/api/lookups?type=...` catalog;
- `GET /api/leads/forms` and `/api/leads/forms/{id}` for Lead Form definitions;
- `GET /api/referrals/listpracticeareas`;
- `GET /api/settings/get-options`; and
- `GET` for every configured integration URL with `preview=true` forced.

It never enumerates form IDs or submits a live opportunity.

Create a local credential file from the committed template:

```bash
cp .dev.vars.example .dev.vars
```

Then replace the placeholders in `.dev.vars`:

```dotenv
LEAD_DOCKET_BASE_URL=https://example.leaddocket.com
LEAD_DOCKET_API_KEY=your-live-api-key
LEAD_DOCKET_INTEGRATION_PREVIEW_URLS='["https://example.leaddocket.com/Opportunities/Form/28?apikey=your-form-key","https://example.leaddocket.com/Opportunities/Form/40?apikey=another-form-key"]'
```

Synchronize custom fields, safe reference metadata, and all supplied integration previews without putting credentials in command history:

```bash
npx --yes --package @calljacob/leaddocket-typescript \
  leaddocket-mock sync-live
```

You can also run `sync-custom-fields`, `sync-reference-data`, or `sync-integrations` independently. The admin page accepts the same integration URLs one per line and refreshes the running mock immediately; when the server is launched through the CLI, imported definitions are also written atomically to `leaddocket.mock.json`.

The CLI automatically loads `.dev.vars`. Variables already present in the process environment take precedence. If the live setup uses bearer authentication, comment out `LEAD_DOCKET_API_KEY` and set `LEAD_DOCKET_BEARER_TOKEN` instead; exactly one authentication method must be configured. Business tracking-phone lookup values are excluded by default; set `LEAD_DOCKET_INCLUDE_PHONE_NUMBERS=true` only when that metadata is required.

`sync-live` atomically updates custom fields, statuses/substatuses, roles, sources, allowed lookup catalogs, Lead Forms, referral practice areas, settings, `integrationPreviewUrls`, and `opportunityIntegrations` in `leaddocket.mock.json`, preserving unrelated settings. The preview importer maps recognizable incoming names to canonical opportunity fields, matches labels/codes against synchronized custom fields, preserves unknown fields as `extra:<incoming-name>`, and retains user-defined option label/value pairs. Review the generated mappings before relying on them in tests.

Because integration URLs contain per-form capability keys, both `.dev.vars` and `leaddocket.mock.json` are ignored by Git. Their committed example files contain placeholders only.

Discovery is also available programmatically and returns credential-free, mock-ready data. Reference synchronization strips creator identities, hypermedia links, contact/member fields, and phone lookups by default; it never downloads contacts, leads, opportunities, users, communications, files, calls, or financial records.

```typescript
import {
  createLeadDocketMockApi,
  discoverLeadDocketCustomFields,
  discoverLeadDocketReferenceData,
} from '@calljacob/leaddocket-typescript';

const snapshot = await discoverLeadDocketCustomFields({
  baseUrl: 'https://example.leaddocket.com',
  auth: { apiKey: process.env.LEAD_DOCKET_API_KEY! },
});

const reference = await discoverLeadDocketReferenceData({
  baseUrl: 'https://example.leaddocket.com',
  auth: { apiKey: process.env.LEAD_DOCKET_API_KEY! },
});

const mock = createLeadDocketMockApi({
  seed: { ...snapshot.seed, ...reference.seed },
});
```

## Development

This project uses [Vite+](https://viteplus.dev/) for dependency management, checks, tests, and library packaging. After installing the global `vp` CLI, run:

```bash
vp install
vp check
vp test
vp pack
```

The equivalent package scripts remain available for package-manager integrations.

## License

MIT
