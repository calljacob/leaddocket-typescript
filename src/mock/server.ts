import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { isIP, type AddressInfo } from 'node:net';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

import { getAbsoluteFSPath as getSwaggerUiPath } from 'swagger-ui-dist';

import { renderLeadDocketMockAdminPage } from './admin';
import {
  generateLeadDocketMockData,
  type GenerateLeadDocketMockDataOptions,
  type GeneratedLeadDocketMockData,
} from './faker-core';
import { discoverLeadDocketIntegrations } from './live-integrations';
import {
  createLeadDocketMockApi,
  type LeadDocketMockApi,
  type LeadDocketMockApiOptions,
  type LeadDocketMockSeed,
  type MockWebhookAction,
  type MockOpportunityIntegration,
  type MockWebhookEvent,
  type MockWebhookSubscription,
} from './index';

const ADMIN_PATH = '/__mock';
const SWAGGER_PATH = '/__swagger';
const DEFAULT_MAX_BODY_BYTES = 1_048_576;
const SWAGGER_ASSETS = new Map([
  ['swagger-ui.css', 'text/css; charset=utf-8'],
  ['swagger-ui.css.map', 'application/json; charset=utf-8'],
  ['swagger-ui-bundle.js', 'text/javascript; charset=utf-8'],
  ['swagger-ui-bundle.js.map', 'application/json; charset=utf-8'],
  ['swagger-ui-standalone-preset.js', 'text/javascript; charset=utf-8'],
  ['swagger-ui-standalone-preset.js.map', 'application/json; charset=utf-8'],
]);
const swaggerAssetCache = new Map<string, Promise<Buffer>>();

type WebhookPayloadExample = {
  id: string;
  label: string;
  eventType: string;
  payload: Record<string, unknown>;
};
class MockServerHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MockServerHttpError';
  }
}

const WEBHOOK_ACTIONS = new Set<MockWebhookAction>([
  'created',
  'updated',
  'deleted',
  'completed',
  'sent',
  'started',
  'ended',
  'locked',
  'unlocked',
  'disregarded',
  'processed',
  'changed',
  'triggered',
]);

export type MockWebhookPreset = {
  label: string;
  event: string;
  entity: string;
  action: MockWebhookAction;
  data?: unknown;
};

export type LeadDocketMockAdminAuth = {
  username?: string;
  password: string;
};

export type LeadDocketMockWebhookEgressPolicy = {
  allowLoopback?: boolean;
  allowedOrigins?: string[];
};

export type LeadDocketMockServerOptions = {
  hostname?: string;
  port?: number;
  cors?: false | string;
  maxBodyBytes?: number;
  adminAuth?: LeadDocketMockAdminAuth;
  webhookEgress?: LeadDocketMockWebhookEgressPolicy;
  generatedData?: GenerateLeadDocketMockDataOptions;
  mock?: Omit<LeadDocketMockApiOptions, 'baseUrl'>;
  webhookPresets?: MockWebhookPreset[];
  liveFetch?: typeof fetch;
  allowInsecureLiveUrls?: boolean;
  onOpportunityIntegrationsImported?: (
    previewUrls: string[],
    integrations: MockOpportunityIntegration[],
  ) => void | Promise<void>;
};

export type LeadDocketMockServer = {
  readonly origin: string;
  readonly docsUrl: string;
  readonly adminUrl: string;
  readonly mock: LeadDocketMockApi;
  close(): Promise<void>;
};

export type LeadDocketMockServerConfig = {
  schemaVersion?: 1;
  server?: Pick<
    LeadDocketMockServerOptions,
    'hostname' | 'port' | 'cors' | 'maxBodyBytes' | 'adminAuth' | 'webhookEgress'
  >;
  seed?: LeadDocketMockApiOptions['seed'];
  historyLimit?: number;
  captureHistoryBodies?: boolean;
  maxRequestBodyBytes?: number;
  generatedData?: GenerateLeadDocketMockDataOptions;
  integrationPreviewUrls?: string[];
  opportunityIntegrations?: LeadDocketMockApiOptions['opportunityIntegrations'];
  webhookTimeoutMs?: number;
  webhookSubscriptions?: Array<
    Pick<MockWebhookSubscription, 'url' | 'events'> & { headers?: Record<string, string> }
  >;
  webhookPresets?: MockWebhookPreset[];
};

export async function startLeadDocketMockServer(
  options: LeadDocketMockServerOptions = {},
): Promise<LeadDocketMockServer> {
  const hostname = options.hostname ?? '127.0.0.1';
  const port = options.port ?? 4010;
  const cors = options.cors === undefined ? '*' : options.cors;
  const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
  const adminAuth = normalizeAdminAuth(options.adminAuth);
  const webhookEgress = normalizeWebhookEgressPolicy(options.webhookEgress);
  const presets = options.webhookPresets ?? defaultWebhookPresets();

  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new RangeError('Mock server port must be an integer between 0 and 65535.');
  }
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes <= 0) {
    throw new RangeError('Mock server maxBodyBytes must be a positive integer.');
  }
  if (!isLoopbackHostname(hostname) && !adminAuth) {
    throw new TypeError('Mock server adminAuth is required when hostname is not loopback.');
  }

  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    const handleError = (error: Error) => reject(error);
    server.once('error', handleError);
    server.listen(port, hostname, () => {
      server.off('error', handleError);
      resolve();
    });
  });

  try {
    const address = server.address() as AddressInfo;
    const origin = `http://${formatHostname(address.address)}:${address.port}`;
    const webhookExamples = await loadWebhookPayloadExamples();
    const openApiDocument = await loadMockOpenApiDocument(origin, webhookExamples);
    const generatedData = options.generatedData
      ? generateLeadDocketMockData(options.generatedData)
      : undefined;
    const mockOptions = options.mock;
    const mock = createLeadDocketMockApi({
      ...mockOptions,
      baseUrl: origin,
      seed: mergeGeneratedSeed(generatedData, mockOptions?.seed),
      webhookFetch: createWebhookFetch(mockOptions?.webhookFetch, webhookEgress),
    });
    const enqueueIntegrationImport = createSerialTaskQueue();

    server.on('request', (request, response) => {
      void handleNodeRequest({
        request,
        response,
        origin,
        cors,
        maxBodyBytes,
        adminAuth,
        webhookEgress,
        openApiDocument,
        webhookExamples,
        mock,
        presets,
        subscriptions: mockOptions?.webhookSubscriptions ?? [],
        liveFetch: options.liveFetch,
        allowInsecureLiveUrls: options.allowInsecureLiveUrls ?? false,
        onOpportunityIntegrationsImported: options.onOpportunityIntegrationsImported,
        enqueueIntegrationImport,
      }).catch((error: unknown) => {
        if (response.headersSent) {
          response.destroy(error instanceof Error ? error : undefined);
          return;
        }
        writeJson(response, error instanceof MockServerHttpError ? error.status : 500, {
          message: error instanceof Error ? error.message : 'Mock server error',
        });
      });
    });

    return {
      origin,
      docsUrl: `${origin}/`,
      adminUrl: `${origin}${ADMIN_PATH}/`,
      mock,
      close: () => closeNodeServer(server),
    };
  } catch (error) {
    await closeNodeServer(server);
    throw error;
  }
}

type NormalizedAdminAuth = Required<LeadDocketMockAdminAuth>;
type NormalizedWebhookEgressPolicy = {
  allowLoopback: boolean;
  allowedOrigins: Set<string>;
};
type SerialTaskQueue = <T>(task: () => Promise<T>) => Promise<T>;

type NodeRequestContext = {
  request: IncomingMessage;
  response: ServerResponse;
  origin: string;
  cors: false | string;
  maxBodyBytes: number;
  adminAuth?: NormalizedAdminAuth;
  webhookEgress: NormalizedWebhookEgressPolicy;
  openApiDocument: Record<string, unknown>;
  webhookExamples: WebhookPayloadExample[];
  mock: LeadDocketMockApi;
  presets: MockWebhookPreset[];
  subscriptions: MockWebhookSubscription[];
  liveFetch?: typeof fetch;
  allowInsecureLiveUrls: boolean;
  onOpportunityIntegrationsImported?: LeadDocketMockServerOptions['onOpportunityIntegrationsImported'];
  enqueueIntegrationImport: SerialTaskQueue;
};

function mergeGeneratedSeed(
  generated: GeneratedLeadDocketMockData | undefined,
  explicit: LeadDocketMockSeed | undefined,
): LeadDocketMockSeed | undefined {
  if (!generated) return explicit;
  return {
    ...explicit,
    contacts: [...generated.contacts, ...(explicit?.contacts ?? [])],
    leads: [...generated.leads, ...(explicit?.leads ?? [])],
    opportunities: [...generated.opportunities, ...(explicit?.opportunities ?? [])],
    tasks: [...generated.tasks, ...(explicit?.tasks ?? [])],
    messages: [...generated.messages, ...(explicit?.messages ?? [])],
    users: [...generated.users, ...(explicit?.users ?? [])],
  };
}

function appendGeneratedData(
  mock: LeadDocketMockApi,
  generated: GeneratedLeadDocketMockData,
): void {
  mock.setStore('contacts', [...mock.getStore('contacts'), ...generated.contacts]);
  mock.setStore('leads', [...mock.getStore('leads'), ...generated.leads]);
  mock.setStore('opportunities', [...mock.getStore('opportunities'), ...generated.opportunities]);
  mock.setStore('tasks', [...mock.getStore('tasks'), ...generated.tasks]);
  mock.setStore('messages', [...mock.getStore('messages'), ...generated.messages]);
  mock.setStore('users', [...mock.getStore('users'), ...generated.users]);
}

function nextGeneratedIdOffset(mock: LeadDocketMockApi): number {
  const stores = [
    ['contacts', 10_000],
    ['leads', 20_000],
    ['opportunities', 30_000],
    ['tasks', 40_000],
    ['messages', 50_000],
    ['users', 60_000],
  ] as const;
  let nextOffset = 0;
  for (const [store, base] of stores) {
    for (const record of mock.getStore(store)) {
      const id = typeof record.Id === 'number' ? record.Id : record.id;
      if (typeof id === 'number' && id >= base) {
        nextOffset = Math.max(nextOffset, id - base + 1);
      }
    }
  }
  return nextOffset;
}

function generatedDataCounts(data: GeneratedLeadDocketMockData): Record<string, number> {
  return {
    contacts: data.contacts.length,
    leads: data.leads.length,
    opportunities: data.opportunities.length,
    tasks: data.tasks.length,
    messages: data.messages.length,
    users: data.users.length,
  };
}

function mockDataStoreCounts(mock: LeadDocketMockApi): Record<string, number> {
  return {
    contacts: mock.getStore('contacts').length,
    leads: mock.getStore('leads').length,
    opportunities: mock.getStore('opportunities').length,
    tasks: mock.getStore('tasks').length,
    messages: mock.getStore('messages').length,
    users: mock.getStore('users').length,
  };
}

function parseGeneratedDataOptions(value: unknown): GenerateLeadDocketMockDataOptions {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MockServerHttpError(400, 'Generated data options must be a JSON object.');
  }
  const input = value as Record<string, unknown>;
  const options: GenerateLeadDocketMockDataOptions = {};
  for (const key of [
    'seed',
    'idOffset',
    'contacts',
    'leads',
    'opportunities',
    'tasks',
    'messages',
    'users',
  ] as const) {
    const count = input[key];
    if (count !== undefined) {
      if (typeof count !== 'number') {
        throw new MockServerHttpError(400, `${key} must be a number.`);
      }
      options[key] = count;
    }
  }
  if (typeof input.referenceDate === 'string') options.referenceDate = input.referenceDate;
  return options;
}

async function handleNodeRequest(context: NodeRequestContext): Promise<void> {
  const { request, response, origin } = context;
  const url = requestUrl(request, origin);

  if (isAdminPath(url.pathname)) {
    response.setHeader('cache-control', 'no-store');
    assertAdminAuthenticated(request, response, context.adminAuth);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method ?? 'GET')) {
      assertAdminOrigin(request, origin);
    }
  }

  if (
    request.method === 'GET' &&
    (url.pathname === '/' ||
      url.pathname === '/api/explore' ||
      url.pathname === '/api/explore/' ||
      url.pathname === '/api/explore/index.html')
  ) {
    writeSwaggerHtml(response, renderSwaggerUiPage());
    return;
  }

  if (request.method === 'GET' && url.pathname === '/openapi.json') {
    writeJson(response, 200, context.openApiDocument);
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith(`${SWAGGER_PATH}/`)) {
    await writeSwaggerAsset(response, url.pathname.slice(SWAGGER_PATH.length + 1));
    return;
  }

  if (url.pathname === ADMIN_PATH || url.pathname === `${ADMIN_PATH}/`) {
    writeHtml(response, renderLeadDocketMockAdminPage());
    return;
  }

  if (url.pathname === `${ADMIN_PATH}/state` && request.method === 'GET') {
    writeJson(response, 200, {
      origin,
      presets: context.presets,
      requests: context.mock.getRequests(),
      webhookEvents: context.mock.getWebhookEvents(),
      deliveries: context.mock.getWebhookDeliveries(),
      subscriptions: context.subscriptions
        .filter((subscription) => subscription.url)
        .map((subscription) => ({ url: subscription.url, events: subscription.events })),
      integrations: context.mock.getOpportunityIntegrations().map((integration) => ({
        ...integration,
        url: context.mock.getOpportunityIntegrationUrl(integration.id),
        previewUrl: context.mock.getOpportunityIntegrationUrl(integration.id, { preview: true }),
      })),
      webhookExamples: context.webhookExamples.map(({ payload: _payload, ...example }) => example),
      storeCounts: mockDataStoreCounts(context.mock),
    });
    return;
  }

  if (url.pathname === `${ADMIN_PATH}/data/generate` && request.method === 'POST') {
    const generateOptions = parseGeneratedDataOptions(
      await readJsonBody(request, context.maxBodyBytes),
    );
    generateOptions.idOffset ??= nextGeneratedIdOffset(context.mock);
    const generated = generateLeadDocketMockData(generateOptions);
    appendGeneratedData(context.mock, generated);
    writeJson(response, 200, {
      added: generatedDataCounts(generated),
      totals: mockDataStoreCounts(context.mock),
    });
    return;
  }

  if (url.pathname === `${ADMIN_PATH}/webhook-examples` && request.method === 'GET') {
    writeJson(response, 200, context.webhookExamples);
    return;
  }

  const webhookExampleMatch = /^\/__mock\/webhook-examples\/([a-z0-9-]+)$/i.exec(url.pathname);
  if (webhookExampleMatch && request.method === 'GET') {
    const example = context.webhookExamples.find(
      (candidate) => candidate.id === webhookExampleMatch[1],
    );
    if (!example) {
      writeJson(response, 404, { message: 'Unknown webhook payload example.' });
      return;
    }
    writeJson(response, 200, example);
    return;
  }

  if (url.pathname === `${ADMIN_PATH}/webhooks` && request.method === 'POST') {
    const body = await readJsonBody(request, context.maxBodyBytes);
    const webhook = parseAdminWebhook(body);
    let removeTarget: (() => void) | undefined;
    if (webhook.targetUrl) {
      removeTarget = context.mock.addWebhookSubscription({
        url: normalizeWebhookTarget(webhook.targetUrl, context.webhookEgress),
        events: [webhook.event],
      });
    }

    let event: MockWebhookEvent;
    try {
      event = await context.mock.emitWebhook({
        event: webhook.event,
        entity: webhook.entity,
        action: webhook.action,
        data: webhook.data,
      });
    } finally {
      removeTarget?.();
    }

    const deliveries = context.mock
      .getWebhookDeliveries()
      .filter((delivery) => delivery.eventId === event.id);
    writeJson(response, 200, { event, deliveries });
    return;
  }

  if (url.pathname === `${ADMIN_PATH}/integrations/import` && request.method === 'POST') {
    const previewUrls = parseIntegrationPreviewUrls(
      await readJsonBody(request, context.maxBodyBytes),
    );
    try {
      const integrations = await context.enqueueIntegrationImport(async () => {
        const snapshot = await discoverLeadDocketIntegrations({
          previewUrls,
          customFields: context.mock.getStore('customFields'),
          fetch: context.liveFetch,
          allowInsecure: context.allowInsecureLiveUrls,
        });
        const mockIntegrations = snapshot.opportunityIntegrations.map((integration) => ({
          ...integration,
          accessKey: `mock-${integration.id}-${randomUUID()}`,
        }));
        await context.onOpportunityIntegrationsImported?.(previewUrls, mockIntegrations);
        context.mock.setOpportunityIntegrations(mockIntegrations);
        return context.mock.getOpportunityIntegrations();
      });
      writeJson(response, 200, {
        imported: integrations.length,
        integrations,
      });
    } catch (error) {
      throw new MockServerHttpError(
        502,
        error instanceof Error ? error.message : 'Unable to import integration previews.',
      );
    }
    return;
  }

  if (url.pathname.startsWith(`${ADMIN_PATH}/`)) {
    writeJson(response, 404, { message: 'Unknown mock administration route.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    writeCorsPreflight(response, context.cors);
    return;
  }

  const fetchRequest = await toFetchRequest(request, url, context.maxBodyBytes);
  const fetchResponse = await context.mock.fetch(fetchRequest);
  await writeFetchResponse(response, fetchResponse, context.cors);
}

function requestUrl(request: IncomingMessage, origin: string): URL {
  const path = request.url ?? '/';
  if (!path.startsWith('/')) {
    throw new MockServerHttpError(400, 'Mock server requests must use an origin-relative URL.');
  }
  return new URL(path, origin);
}

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}

function assertAdminAuthenticated(
  request: IncomingMessage,
  response: ServerResponse,
  auth: NormalizedAdminAuth | undefined,
): void {
  if (!auth) return;
  const expected = Buffer.from(
    `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`,
  );
  const provided = Buffer.from(request.headers.authorization ?? '');
  if (expected.byteLength === provided.byteLength && timingSafeEqual(expected, provided)) return;
  response.setHeader('www-authenticate', 'Basic realm="Lead Docket Mock Admin", charset="UTF-8"');
  throw new MockServerHttpError(401, 'Mock administration authentication is required.');
}

function assertAdminOrigin(request: IncomingMessage, origin: string): void {
  const requestOrigin = request.headers.origin;
  const expectedOrigin = request.headers.host ? `http://${request.headers.host}` : origin;
  if (requestOrigin && requestOrigin !== expectedOrigin) {
    throw new MockServerHttpError(
      403,
      'Cross-origin mock administration requests are not allowed.',
    );
  }
}

async function toFetchRequest(
  request: IncomingMessage,
  url: URL,
  maxBodyBytes: number,
): Promise<Request> {
  const method = request.method ?? 'GET';
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(name, item);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await readBody(request, maxBodyBytes);
  return new Request(url, { method, headers, body });
}

async function readJsonBody(request: IncomingMessage, maxBodyBytes: number): Promise<unknown> {
  const body = await readBody(request, maxBodyBytes);
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new MockServerHttpError(400, 'Request body must be valid JSON.');
  }
}

async function readBody(request: IncomingMessage, maxBodyBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > maxBodyBytes) {
      throw new MockServerHttpError(413, `Request body exceeds the ${maxBodyBytes} byte limit.`);
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function writeFetchResponse(
  response: ServerResponse,
  fetchResponse: Response,
  cors: false | string,
): Promise<void> {
  response.statusCode = fetchResponse.status;
  fetchResponse.headers.forEach((value, name) => response.setHeader(name, value));
  applyCorsHeaders(response, cors);
  if (!fetchResponse.body) {
    response.end();
    return;
  }
  await pipeline(Readable.from(fetchResponse.body), response);
}

function writeCorsPreflight(response: ServerResponse, cors: false | string): void {
  response.statusCode = 204;
  applyCorsHeaders(response, cors);
  response.setHeader('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.setHeader('access-control-allow-headers', 'authorization, content-type, api_key');
  response.end();
}

function applyCorsHeaders(response: ServerResponse, cors: false | string): void {
  if (cors !== false) {
    response.setHeader('access-control-allow-origin', cors);
    response.setHeader('access-control-max-age', '86400');
  }
}

async function loadWebhookPayloadExamples(): Promise<WebhookPayloadExample[]> {
  const moduleDirectory = currentModuleDirectory();
  const candidates = [
    join(moduleDirectory, '..', 'examples', 'webhooks'),
    join(moduleDirectory, '..', '..', 'examples', 'webhooks'),
    join(process.cwd(), 'examples', 'webhooks'),
  ];
  for (const directory of new Set(candidates)) {
    try {
      const index = JSON.parse(await readFile(join(directory, 'index.json'), 'utf8')) as {
        examples?: Array<{ id: string; label: string; eventType: string; file: string }>;
      };
      if (!Array.isArray(index.examples)) throw new TypeError('Webhook example index is invalid.');
      return Promise.all(
        index.examples.map(async (example) => {
          if (!/^[a-z0-9-]+\.json$/.test(example.file)) {
            throw new TypeError('Webhook example index contains an invalid file name.');
          }
          return {
            id: example.id,
            label: example.label,
            eventType: example.eventType,
            payload: JSON.parse(await readFile(join(directory, example.file), 'utf8')) as Record<
              string,
              unknown
            >,
          };
        }),
      );
    } catch (error) {
      if (isFileNotFound(error)) continue;
      throw new Error(`Unable to load webhook examples from ${directory}.`, { cause: error });
    }
  }
  throw new Error('Unable to find the packaged webhook payload examples.');
}

async function loadMockOpenApiDocument(
  origin: string,
  webhookExamples: WebhookPayloadExample[],
): Promise<Record<string, unknown>> {
  const moduleDirectory = currentModuleDirectory();
  const candidates = [
    join(moduleDirectory, 'openapi.json'),
    join(moduleDirectory, '..', '..', 'openapi.json'),
    join(process.cwd(), 'openapi.json'),
  ];

  for (const path of new Set(candidates)) {
    try {
      const document = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
      const sourceInfo =
        document.info && typeof document.info === 'object'
          ? (document.info as Record<string, unknown>)
          : {};
      return {
        ...document,
        info: {
          ...sourceInfo,
          title: 'LeadDocket Mock Server',
          description:
            'Mock server generated from the Lead Docket OpenAPI document. Requests from Try it out are sent only to this local mock origin. Sanitized webhook payload examples are available from /__mock/webhook-examples.',
        },
        servers: [{ url: origin, description: 'Local Lead Docket mock server' }],
        'x-mock-server': true,
        'x-mock-webhook-payload-examples': Object.fromEntries(
          webhookExamples.map((example) => [
            example.id,
            {
              summary: example.label,
              eventType: example.eventType,
              value: example.payload,
            },
          ]),
        ),
      };
    } catch (error) {
      if (isFileNotFound(error)) continue;
      throw new Error(`Unable to load OpenAPI document from ${path}.`, { cause: error });
    }
  }
  throw new Error('Unable to find the packaged Lead Docket OpenAPI document.');
}

function currentModuleDirectory(): string {
  return typeof __dirname === 'string' ? __dirname : dirname(fileURLToPath(import.meta.url));
}

function renderSwaggerUiPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LeadDocket Mock Server API</title>
  <link rel="stylesheet" href="${SWAGGER_PATH}/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .mock-banner { display: flex; justify-content: space-between; gap: 20px; padding: 12px 20px; background: #5b21b6; color: white; font: 700 14px/1.4 system-ui, sans-serif; }
    .mock-banner a { color: #ddd6fe; }
  </style>
</head>
<body>
  <div class="mock-banner">
    <span>Lead Docket Mock Server — no requests are sent to a live Lead Docket account</span>
    <a href="${ADMIN_PATH}/">Mock admin</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="${SWAGGER_PATH}/swagger-ui-bundle.js"></script>
  <script src="${SWAGGER_PATH}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: '/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      displayRequestDuration: true,
      persistAuthorization: false,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: 'StandaloneLayout'
    });
  </script>
</body>
</html>`;
}

async function writeSwaggerAsset(response: ServerResponse, name: string): Promise<void> {
  const contentType = SWAGGER_ASSETS.get(name);
  if (!contentType) {
    writeJson(response, 404, { message: 'Unknown Swagger UI asset.' });
    return;
  }
  let asset = swaggerAssetCache.get(name);
  if (!asset) {
    asset = readFile(join(getSwaggerUiPath(), name));
    swaggerAssetCache.set(name, asset);
  }
  response.statusCode = 200;
  response.setHeader('content-type', contentType);
  response.setHeader('cache-control', 'public, max-age=31536000, immutable');
  response.setHeader('x-content-type-options', 'nosniff');
  response.end(await asset);
}

function writeSwaggerHtml(response: ServerResponse, body: string): void {
  response.statusCode = 200;
  response.setHeader('content-type', 'text/html; charset=utf-8');
  response.setHeader(
    'content-security-policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'",
  );
  response.setHeader('cache-control', 'no-store');
  response.setHeader('x-content-type-options', 'nosniff');
  response.end(body);
}

function isFileNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT');
}

function writeHtml(response: ServerResponse, body: string): void {
  response.statusCode = 200;
  response.setHeader('content-type', 'text/html; charset=utf-8');
  response.setHeader(
    'content-security-policy',
    "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'",
  );
  response.setHeader('cache-control', 'no-store');
  response.setHeader('x-content-type-options', 'nosniff');
  response.end(body);
}

function writeJson(response: ServerResponse, status: number, body: unknown): void {
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('x-content-type-options', 'nosniff');
  response.end(JSON.stringify(body));
}

function parseIntegrationPreviewUrls(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MockServerHttpError(400, 'Integration import request must be a JSON object.');
  }
  const urls = (value as Record<string, unknown>).urls;
  if (
    !Array.isArray(urls) ||
    urls.length === 0 ||
    urls.length > 100 ||
    !urls.every((url) => typeof url === 'string')
  ) {
    throw new MockServerHttpError(
      400,
      'Integration import requires between 1 and 100 URL strings.',
    );
  }
  const normalized = urls.map((url) => url.trim()).filter(Boolean);
  if (normalized.length === 0) {
    throw new MockServerHttpError(400, 'Integration import requires at least one non-empty URL.');
  }
  return normalized;
}

type AdminWebhookInput = {
  targetUrl?: string;
  event: string;
  entity: string;
  action: MockWebhookAction;
  data?: unknown;
};

function parseAdminWebhook(value: unknown): AdminWebhookInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MockServerHttpError(400, 'Webhook request must be a JSON object.');
  }
  const input = value as Record<string, unknown>;
  if (typeof input.event !== 'string' || !input.event.trim()) {
    throw new MockServerHttpError(400, 'Webhook event is required.');
  }
  const event = input.event.trim();
  const eventParts = event.split('.');
  const entity =
    typeof input.entity === 'string' && input.entity.trim()
      ? input.entity.trim()
      : (eventParts[0] ?? 'webhook');
  const inferredAction = eventParts.at(-1);
  const actionValue = typeof input.action === 'string' ? input.action : inferredAction;
  const action = WEBHOOK_ACTIONS.has(actionValue as MockWebhookAction)
    ? (actionValue as MockWebhookAction)
    : 'triggered';

  return {
    targetUrl:
      typeof input.targetUrl === 'string' && input.targetUrl.trim() ? input.targetUrl : undefined,
    event,
    entity,
    action,
    data: input.data,
  };
}

function normalizeAdminAuth(
  auth: LeadDocketMockAdminAuth | undefined,
): NormalizedAdminAuth | undefined {
  if (!auth) return undefined;
  const username = auth.username ?? 'admin';
  if (!username || username.includes(':') || /[\r\n]/.test(username)) {
    throw new TypeError(
      'Mock server adminAuth.username must be non-empty and cannot contain a colon.',
    );
  }
  if (typeof auth.password !== 'string' || !auth.password || /[\r\n]/.test(auth.password)) {
    throw new TypeError('Mock server adminAuth.password must be a non-empty string.');
  }
  return { username, password: auth.password };
}

function normalizeWebhookEgressPolicy(
  policy: LeadDocketMockWebhookEgressPolicy | undefined,
): NormalizedWebhookEgressPolicy {
  const allowedOrigins = new Set<string>();
  for (const value of policy?.allowedOrigins ?? []) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new TypeError(`Webhook egress allowed origin is invalid: ${value}`);
    }
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new TypeError(`Webhook egress allowlist entries must be HTTP(S) origins: ${value}`);
    }
    allowedOrigins.add(url.origin);
  }
  return {
    allowLoopback: policy?.allowLoopback ?? true,
    allowedOrigins,
  };
}

function createWebhookFetch(
  fetchImplementation: typeof fetch = globalThis.fetch,
  policy: NormalizedWebhookEgressPolicy,
): typeof fetch {
  return (async (input, init) => {
    const url = parseHttpUrl(
      input instanceof Request ? input.url : input.toString(),
      'Webhook target',
    );
    if (!isWebhookTargetAllowed(url, policy)) {
      throw new Error(
        `Webhook target origin ${url.origin} is not allowed by the mock server egress policy.`,
      );
    }
    return fetchImplementation(input, { ...init, redirect: 'error' });
  }) as typeof fetch;
}

function normalizeWebhookTarget(value: string, policy: NormalizedWebhookEgressPolicy): string {
  const url = parseHttpUrl(value, 'Webhook target');
  if (!isWebhookTargetAllowed(url, policy)) {
    throw new MockServerHttpError(
      403,
      `Webhook target origin ${url.origin} is not allowed by the mock server egress policy.`,
    );
  }
  return url.toString();
}

function parseHttpUrl(value: string, label: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new MockServerHttpError(400, `${label} must be a valid absolute URL.`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new MockServerHttpError(400, `${label} must use HTTP or HTTPS.`);
  }
  if (url.username || url.password) {
    throw new MockServerHttpError(400, `${label} cannot contain embedded credentials.`);
  }
  return url;
}

function isWebhookTargetAllowed(url: URL, policy: NormalizedWebhookEgressPolicy): boolean {
  return (
    policy.allowedOrigins.has(url.origin) ||
    (policy.allowLoopback && isLoopbackHostname(url.hostname))
  );
}

function isLoopbackHostname(value: string): boolean {
  const hostname = value
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true;
  const ipVersion = isIP(hostname);
  if (ipVersion === 4) return hostname.split('.')[0] === '127';
  if (ipVersion !== 6) return false;
  if (hostname === '::1') return true;
  if (hostname.startsWith('::ffff:')) return isLoopbackHostname(hostname.slice(7));
  const groups = hostname.split(':');
  return (
    groups.length === 8 &&
    groups.slice(0, 7).every((group) => Number.parseInt(group, 16) === 0) &&
    Number.parseInt(groups[7] ?? '', 16) === 1
  );
}

function createSerialTaskQueue(): SerialTaskQueue {
  let tail = Promise.resolve();
  return <T>(task: () => Promise<T>): Promise<T> => {
    const result = tail.then(task, task);
    tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
}

function closeNodeServer(server: Server): Promise<void> {
  if (!server.listening) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
}

function formatHostname(hostname: string): string {
  return hostname.includes(':') ? `[${hostname}]` : hostname;
}

function defaultWebhookPresets(): MockWebhookPreset[] {
  return [
    {
      label: 'Contact created',
      event: 'contact.created',
      entity: 'contact',
      action: 'created',
      data: { Id: 1001, FirstName: 'Ada', LastName: 'Lovelace' },
    },
    {
      label: 'Lead created',
      event: 'lead.created',
      entity: 'lead',
      action: 'created',
      data: { Id: 1002, FirstName: 'Grace', LastName: 'Hopper', Status: 'New' },
    },
    {
      label: 'Lead status changed',
      event: 'lead.status_changed',
      entity: 'lead',
      action: 'changed',
      data: { Id: 1002, PreviousStatus: 'New', Status: 'Signed Up' },
    },
    {
      label: 'Opportunity updated',
      event: 'opportunity.updated',
      entity: 'opportunity',
      action: 'updated',
      data: { Id: 1003, Status: 'Open' },
    },
    {
      label: 'Task completed',
      event: 'task.completed',
      entity: 'task',
      action: 'completed',
      data: { Id: 1004, Completed: true },
    },
    {
      label: 'Webhook trigger field',
      event: 'custom_field.triggered',
      entity: 'customField',
      action: 'triggered',
      data: { CustomFieldId: 1005, Value: 'Triggered from mock UI' },
    },
  ];
}
