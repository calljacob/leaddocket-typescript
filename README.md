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
- **Zero Dependencies:** Built on the native web `fetch` API. Works in Node.js 18+, browsers, Edge runtime, Next.js, and Cloudflare Workers.
- **Comprehensive:** Covers all 114 endpoints across Leads, Contacts, Opportunities, External Calls, Settlements, and more.
- **Mockable:** Includes a full in-memory mock API that responds to every generated endpoint and emits webhook events for API-driven mutations.

## Mock API and Webhooks

Use `createLeadDocketMockApi()` in tests, local demos, or integration development when you want Lead Docket-compatible responses without calling a real account.

```typescript
import {
  client,
  contactsAdd,
  createLeadDocketMockApi,
} from '@calljacob/leaddocket-typescript';

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

## Development

To build the project locally:

```bash
npm install
npm run build
```

To run tests and linting:

```bash
npm run test
npm run lint
```

## License

MIT
