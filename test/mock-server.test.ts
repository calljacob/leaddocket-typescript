import { readFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vite-plus/test';

import {
  startLeadDocketMockServer,
  type LeadDocketMockServer,
  type LeadDocketMockServerOptions,
} from '../src/mock/server';

const openServers: LeadDocketMockServer[] = [];
const openReceivers: Server[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => server.close()));
  await Promise.all(
    openReceivers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          server.closeAllConnections();
        }),
    ),
  );
});

describe('Lead Docket mock HTTP server', () => {
  it('serves the mock API and admin UI and delivers UI-triggered webhooks', async () => {
    const received: unknown[] = [];
    const receiver = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        received.push(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        response.statusCode = 202;
        response.end();
      });
    });
    openReceivers.push(receiver);
    const receiverOrigin = await listen(receiver);

    const server = await startLeadDocketMockServer({
      port: 0,
      mock: {
        opportunityIntegrations: [
          {
            id: 28,
            accessKey: 'local-server-key',
            name: 'Server Integration Form',
          },
        ],
      },
    });
    openServers.push(server);

    expect(server.docsUrl).toBe(`${server.origin}/`);
    const docsResponse = await fetch(server.docsUrl);
    expect(docsResponse.ok).toBe(true);
    const docsHtml = await docsResponse.text();
    expect(docsHtml).toContain('Lead Docket Mock Server');
    expect(docsHtml).toContain("url: '/openapi.json'");
    expect(docsHtml).toContain('persistAuthorization: false');
    expect((await fetch(`${server.origin}/api/explore/index.html`)).ok).toBe(true);
    const swaggerCss = await fetch(`${server.origin}/__swagger/swagger-ui.css`);
    expect(swaggerCss.ok).toBe(true);
    expect(swaggerCss.headers.get('content-type')).toContain('text/css');

    const sourceDocument = JSON.parse(await readFile('openapi.json', 'utf8')) as {
      paths: unknown;
      components: unknown;
      info: { version: string };
    };
    const mockDocument = (await (await fetch(`${server.origin}/openapi.json`)).json()) as {
      paths: unknown;
      components: unknown;
      info: { title: string; version: string; description: string };
      servers: Array<{ url: string }>;
      'x-mock-server': boolean;
      'x-mock-webhook-payload-examples': Record<string, { value: unknown }>;
    };
    expect(mockDocument.paths).toEqual(sourceDocument.paths);
    expect(mockDocument.components).toEqual(sourceDocument.components);
    expect(mockDocument.info).toMatchObject({
      title: 'LeadDocket Mock Server',
      version: sourceDocument.info.version,
    });
    expect(mockDocument.servers).toEqual([
      { url: server.origin, description: 'Local Lead Docket mock server' },
    ]);
    expect(mockDocument['x-mock-server']).toBe(true);
    expect(Object.keys(mockDocument['x-mock-webhook-payload-examples'])).toHaveLength(15);

    const invalidIdResponse = await fetch(`${server.origin}/api/contacts/423343423424343442234234`);
    expect(invalidIdResponse.status).toBe(400);

    const apiResponse = await fetch(`${server.origin}/api/contacts/1`);
    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.headers.get('access-control-allow-origin')).toBe('*');
    expect(await apiResponse.json()).toMatchObject({ id: 1 });

    const adminResponse = await fetch(server.adminUrl);
    expect(adminResponse.ok).toBe(true);
    expect(adminResponse.headers.get('cache-control')).toBe('no-store');
    expect(await adminResponse.text()).toContain('Lead Docket Mock');

    const integrationForm = await fetch(
      `${server.origin}/opportunities/form/28?apikey=local-server-key`,
    );
    expect(integrationForm.ok).toBe(true);
    expect(await integrationForm.text()).toContain('Server Integration Form');

    const webhookResponse = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: server.origin,
      },
      body: JSON.stringify({
        targetUrl: `${receiverOrigin}/webhooks/leaddocket`,
        event: 'lead.status_changed',
        entity: 'lead',
        action: 'changed',
        data: { Id: 42, Status: 'Signed Up' },
      }),
    });
    expect(webhookResponse.ok).toBe(true);
    const webhookResult = (await webhookResponse.json()) as {
      event: { event: string };
      deliveries: Array<{ ok: boolean; status?: number }>;
    };
    expect(webhookResult.event.event).toBe('lead.status_changed');
    expect(webhookResult.deliveries).toEqual([expect.objectContaining({ ok: true, status: 202 })]);
    expect(received).toEqual([
      expect.objectContaining({
        event: 'lead.status_changed',
        entity: 'lead',
        data: { Id: 42, Status: 'Signed Up' },
      }),
    ]);

    const stateResponse = await fetch(`${server.origin}/__mock/state`);
    const state = (await stateResponse.json()) as {
      deliveries: Array<{ status?: number }>;
      presets: Array<{ event: string }>;
      integrations: Array<{
        id: string;
        name: string;
        fieldCount: number;
        url: string;
        previewUrl: string;
      }>;
      webhookExamples: Array<{ id: string; label: string; eventType: string }>;
    };
    expect(state.deliveries).toEqual([expect.objectContaining({ status: 202 })]);
    expect(state.presets).toEqual(
      expect.arrayContaining([expect.objectContaining({ event: 'contact.created' })]),
    );
    expect(state.integrations).toEqual([
      expect.objectContaining({
        id: '28',
        name: 'Server Integration Form',
        fieldCount: 5,
      }),
    ]);
    expect(state.integrations[0]?.url.toLowerCase()).toBe(
      `${server.origin}/opportunities/form/28?apikey=local-server-key`,
    );
    expect(state.integrations[0]?.previewUrl.toLowerCase()).toBe(
      `${server.origin}/opportunities/form/28?apikey=local-server-key&preview=true`,
    );
    expect(state.webhookExamples).toHaveLength(15);
    const webhookExample = await fetch(`${server.origin}/__mock/webhook-examples/lead-created`);
    expect(webhookExample.ok).toBe(true);
    expect(await webhookExample.json()).toMatchObject({
      id: 'lead-created',
      eventType: 'Lead Created',
      payload: { hostname: 'mock.leaddocket.local', ContactFirstName: 'Ada' },
    });
  });

  it('imports all pasted integration preview URLs and persists them through the server callback', async () => {
    const imported: Array<{ urls: string[]; accessKeys: string[] }> = [];
    const liveFetch: typeof fetch = async (input) => {
      const request = input instanceof Request ? input : new Request(input);
      expect(request.method).toBe('GET');
      expect(new URL(request.url).searchParams.get('preview')).toBe('true');
      const id = new URL(request.url).pathname.split('/').at(-1);
      return new Response(
        `<h1>Imported Form ${id}</h1><form><label for="first-${id}">First Name</label><input id="first-${id}" name="First" required /></form>`,
        { status: 200, headers: { 'content-type': 'text/html' } },
      );
    };
    const server = await startLeadDocketMockServer({
      port: 0,
      liveFetch,
      allowInsecureLiveUrls: true,
      onOpportunityIntegrationsImported: (urls, integrations) => {
        imported.push({
          urls,
          accessKeys: integrations.map((integration) => integration.accessKey),
        });
      },
    });
    openServers.push(server);
    const urls = [
      'http://live.example.test/Opportunities/Form/15?apikey=local-15',
      'http://live.example.test/Opportunities/Form/40?apikey=local-40',
    ];

    const response = await fetch(`${server.origin}/__mock/integrations/import`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: server.origin },
      body: JSON.stringify({ urls }),
    });
    expect(response.ok).toBe(true);
    expect(await response.json()).toMatchObject({ imported: 2 });
    expect(imported).toEqual([
      {
        urls,
        accessKeys: [expect.stringMatching(/^mock-15-/), expect.stringMatching(/^mock-40-/)],
      },
    ]);

    const state = (await (await fetch(`${server.origin}/__mock/state`)).json()) as {
      integrations: Array<{ id: string; name: string; previewUrl: string }>;
    };
    expect(state.integrations).toEqual([
      expect.objectContaining({ id: '15', name: 'Imported Form 15' }),
      expect.objectContaining({ id: '40', name: 'Imported Form 40' }),
    ]);
    expect(state.integrations[1]?.previewUrl).toMatch(
      new RegExp(`^${server.origin}/opportunities/form/40\\?apikey=mock-40-.*&preview=true$`, 'i'),
    );
    expect(JSON.stringify(state.integrations)).not.toContain('local-40');
  });

  it('generates deterministic startup data and appends more from the admin endpoint', async () => {
    const server = await startLeadDocketMockServer({
      port: 0,
      generatedData: {
        seed: 99,
        contacts: 2,
        leads: 1,
        opportunities: 1,
        tasks: 0,
        messages: 0,
        users: 1,
      },
      mock: {
        seed: { contacts: [{ Id: 77, FirstName: 'Configured', LastName: 'Contact' }] },
      },
    });
    openServers.push(server);
    expect(server.mock.getStore('contacts')).toHaveLength(3);
    expect(server.mock.getStore('contacts')).toEqual(
      expect.arrayContaining([expect.objectContaining({ Id: 77, FirstName: 'Configured' })]),
    );

    const response = await fetch(`${server.origin}/__mock/data/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: server.origin },
      body: JSON.stringify({
        seed: 100,
        contacts: 1,
        leads: 1,
        opportunities: 1,
        tasks: 1,
        messages: 1,
        users: 1,
      }),
    });
    expect(response.ok).toBe(true);
    expect(await response.json()).toMatchObject({
      added: {
        contacts: 1,
        leads: 1,
        opportunities: 1,
        tasks: 1,
        messages: 1,
        users: 1,
      },
      totals: { contacts: 4, leads: 2, opportunities: 2 },
    });
    const generatedContactIds = server.mock
      .getStore('contacts')
      .map((contact) => contact.Id)
      .filter((id) => typeof id === 'number' && id >= 10_000);
    expect(new Set(generatedContactIds).size).toBe(generatedContactIds.length);
    expect(server.mock.getWebhookEvents()).toHaveLength(0);
  });

  it('isolates admin mutations and reports delivery failures without crashing', async () => {
    const server = await startLeadDocketMockServer({ port: 0, maxBodyBytes: 512 });
    openServers.push(server);

    const forbidden = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
      body: JSON.stringify({ event: 'lead.created' }),
    });
    expect(forbidden.status).toBe(403);

    const response = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        targetUrl: 'http://127.0.0.1:1/unavailable',
        event: 'lead.created',
        entity: 'lead',
        action: 'created',
      }),
    });
    expect(response.ok).toBe(true);
    const result = (await response.json()) as {
      deliveries: Array<{ ok: boolean; error?: string }>;
    };
    expect(result.deliveries).toEqual([
      expect.objectContaining({ ok: false, error: expect.any(String) }),
    ]);

    const oversized = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'lead.created', data: 'x'.repeat(600) }),
    });
    expect(oversized.status).toBe(413);
  });

  it('authenticates every admin route and refuses unauthenticated non-loopback binding', async () => {
    await expect(startLeadDocketMockServer({ hostname: '0.0.0.0', port: 0 })).rejects.toThrow(
      'adminAuth is required',
    );

    const server = await startLeadDocketMockServer({
      port: 0,
      adminAuth: { username: 'operator', password: 'test-secret' },
    });
    openServers.push(server);
    const authorization = basicAuthorization('operator', 'test-secret');

    const unauthenticatedPage = await fetch(server.adminUrl);
    expect(unauthenticatedPage.status).toBe(401);
    expect(unauthenticatedPage.headers.get('www-authenticate')).toContain('Basic');
    expect(unauthenticatedPage.headers.get('cache-control')).toBe('no-store');

    const unauthenticatedRead = await fetch(`${server.origin}/__mock/state`);
    expect(unauthenticatedRead.status).toBe(401);
    expect(unauthenticatedRead.headers.get('cache-control')).toBe('no-store');

    const authenticatedRead = await fetch(`${server.origin}/__mock/state`, {
      headers: { authorization },
    });
    expect(authenticatedRead.ok).toBe(true);
    expect(authenticatedRead.headers.get('cache-control')).toBe('no-store');

    const unauthenticatedWrite = await fetch(`${server.origin}/__mock/data/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: server.origin },
      body: JSON.stringify({ contacts: 0 }),
    });
    expect(unauthenticatedWrite.status).toBe(401);

    const authenticatedWrite = await fetch(`${server.origin}/__mock/data/generate`, {
      method: 'POST',
      headers: {
        authorization,
        'content-type': 'application/json',
        origin: server.origin,
      },
      body: JSON.stringify({
        contacts: 0,
        leads: 0,
        opportunities: 0,
        tasks: 0,
        messages: 0,
        users: 0,
      }),
    });
    expect(authenticatedWrite.ok).toBe(true);
    expect(authenticatedWrite.headers.get('cache-control')).toBe('no-store');

    const crossOriginWrite = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: {
        authorization,
        'content-type': 'application/json',
        origin: 'https://attacker.example',
      },
      body: JSON.stringify({ event: 'lead.created' }),
    });
    expect(crossOriginWrite.status).toBe(403);
    expect((await fetch(`${server.origin}/api/contacts/1`)).ok).toBe(true);
  });

  it('restricts webhook egress, refuses redirects, and permits exact allowlisted origins', async () => {
    let receiverOrigin = '';
    let followedRedirect = false;
    const receiver = createServer((request, response) => {
      if (request.url === '/redirect') {
        response.statusCode = 302;
        response.setHeader('location', `${receiverOrigin}/followed`);
      } else {
        followedRedirect = true;
        response.statusCode = 204;
      }
      response.end();
    });
    openReceivers.push(receiver);
    receiverOrigin = await listen(receiver);

    const server = await startLeadDocketMockServer({ port: 0 });
    openServers.push(server);
    const redirected = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: server.origin },
      body: JSON.stringify({
        targetUrl: `${receiverOrigin}/redirect`,
        event: 'lead.created',
      }),
    });
    expect(redirected.ok).toBe(true);
    expect(await redirected.json()).toMatchObject({
      deliveries: [expect.objectContaining({ ok: false, error: expect.any(String) })],
    });
    expect(followedRedirect).toBe(false);

    const blocked = await fetch(`${server.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: server.origin },
      body: JSON.stringify({
        targetUrl: 'https://hooks.example.test/events',
        event: 'lead.created',
      }),
    });
    expect(blocked.status).toBe(403);

    let observedRedirect: RequestRedirect | undefined;
    const allowlistedServer = await startLeadDocketMockServer({
      port: 0,
      webhookEgress: { allowedOrigins: ['https://hooks.example.test'] },
      mock: {
        webhookFetch: async (_input, init) => {
          observedRedirect = init?.redirect;
          return new Response(undefined, { status: 204 });
        },
      },
    });
    openServers.push(allowlistedServer);
    const allowed = await fetch(`${allowlistedServer.origin}/__mock/webhooks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: allowlistedServer.origin },
      body: JSON.stringify({
        targetUrl: 'https://hooks.example.test/events',
        event: 'lead.created',
      }),
    });
    expect(allowed.ok).toBe(true);
    expect(observedRedirect).toBe('error');
  });

  it('does not commit imported integrations when persistence fails and recovers the queue', async () => {
    let persistenceAttempts = 0;
    const server = await startLeadDocketMockServer({
      port: 0,
      allowInsecureLiveUrls: true,
      liveFetch: async () =>
        new Response(
          '<h1>Imported Form 9</h1><form><label>Name<input name="Name" /></label></form>',
          { status: 200, headers: { 'content-type': 'text/html' } },
        ),
      mock: {
        opportunityIntegrations: [{ id: 5, accessKey: 'existing', name: 'Existing Form' }],
      },
      onOpportunityIntegrationsImported: () => {
        persistenceAttempts += 1;
        if (persistenceAttempts === 1) throw new Error('Persistence failed');
      },
    });
    openServers.push(server);

    const importIntegration = () =>
      fetch(`${server.origin}/__mock/integrations/import`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: server.origin },
        body: JSON.stringify({
          urls: ['http://live.example.test/Opportunities/Form/9?apikey=imported'],
        }),
      });

    const failed = await importIntegration();
    expect(failed.status).toBe(502);
    expect(server.mock.getOpportunityIntegrations()).toEqual([
      expect.objectContaining({ id: '5', name: 'Existing Form' }),
    ]);

    const recovered = await importIntegration();
    expect(recovered.ok).toBe(true);
    expect(server.mock.getOpportunityIntegrations()).toEqual([
      expect.objectContaining({ id: '9', name: 'Imported Form 9' }),
    ]);
  });

  it('closes its listener when initialization fails after listen', async () => {
    const probe = createServer();
    const probeOrigin = await listen(probe);
    const port = Number(new URL(probeOrigin).port);
    await closeServer(probe);

    const options = { port } as LeadDocketMockServerOptions;
    Object.defineProperty(options, 'mock', {
      get() {
        throw new Error('Post-listen initialization failed');
      },
    });
    await expect(startLeadDocketMockServer(options)).rejects.toThrow(
      'Post-listen initialization failed',
    );

    const replacement = createServer();
    openReceivers.push(replacement);
    await listen(replacement, port);
  });

  it('streams Fetch response bodies without calling arrayBuffer', async () => {
    const server = await startLeadDocketMockServer({ port: 0 });
    openServers.push(server);
    const originalArrayBuffer = Object.getOwnPropertyDescriptor(Response.prototype, 'arrayBuffer');
    Object.defineProperty(Response.prototype, 'arrayBuffer', {
      configurable: true,
      value: async () => {
        throw new Error('Response.arrayBuffer should not be called');
      },
    });
    try {
      const response = await fetch(`${server.origin}/api/contacts/1`);
      expect(response.ok).toBe(true);
      expect(await response.json()).toMatchObject({ id: 1 });
    } finally {
      if (originalArrayBuffer) {
        Object.defineProperty(Response.prototype, 'arrayBuffer', originalArrayBuffer);
      }
    }
  });
});

function basicAuthorization(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

async function listen(server: Server, port = 0): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

function closeServer(server: Server): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
}
