# Lead Docket TypeScript API Client

[![npm version](https://badge.fury.io/js/leaddocket-typescript.svg)](https://badge.fury.io/js/leaddocket-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A strongly-typed, auto-generated TypeScript API client library for the [Lead Docket API](https://calljacob.leaddocket.com/api/explore/index.html).

This library provides full TypeScript definitions, autocomplete, and a native `fetch` implementation for all 114 Lead Docket API endpoints.

## Installation

```bash
npm install leaddocket-typescript
```
or
```bash
yarn add leaddocket-typescript
```
or
```bash
pnpm add leaddocket-typescript
```

## Usage

You can use the exported `client` instance to configure your credentials and base URL globally.

```typescript
import { client, ContactsService, LeadsService } from 'leaddocket-typescript';

// 1. Configure the client
client.setConfig({
  baseUrl: 'https://calljacob.leaddocket.com', // or your specific domain
  headers: {
    Authorization: 'Bearer YOUR_API_TOKEN',
  },
});

// 2. Call an endpoint using one of the generated services
async function fetchLeads() {
  try {
    const { data, error } = await LeadsService.leadsGetByStatus({
      statusId: 123,
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
