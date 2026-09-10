import { describe, expect, it } from 'vite-plus/test';

import { createLeadDocketMockApi, discoverLeadDocketCustomFields } from '../src/index';

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('Lead Docket custom-field discovery', () => {
  it('fetches live definitions without retaining credentials and returns mock-ready seed data', async () => {
    const requests: Request[] = [];
    const liveFetch: typeof fetch = async (input) => {
      const request = input instanceof Request ? input : new Request(input);
      requests.push(request);
      if (new URL(request.url).pathname === '/api/contactcustomfields/list') {
        return jsonResponse([
          {
            Id: 101,
            FieldName: 'Preferred Language',
            Location: 'Contact',
            FieldType: 'Text',
            Code: null,
          },
        ]);
      }
      return jsonResponse([
        {
          Id: 201,
          FieldName: 'Estimated Case Value',
          Location: 'Lead',
          FieldType: 'Currency',
        },
        {
          Id: 301,
          FieldName: 'Potential Value',
          Location: 'Opportunity',
          FieldType: 'Currency',
        },
      ]);
    };

    const snapshot = await discoverLeadDocketCustomFields({
      baseUrl: 'http://live.example.test',
      auth: { apiKey: 'secret-api-key' },
      fetch: liveFetch,
      allowInsecure: true,
    });

    expect(requests).toHaveLength(2);
    expect(requests.map((request) => new URL(request.url).pathname).sort()).toEqual([
      '/api/contactcustomfields/list',
      '/api/customfields/list',
    ]);
    expect(requests.every((request) => request.headers.get('api_key') === 'secret-api-key')).toBe(
      true,
    );
    expect(requests.every((request) => request.redirect === 'error')).toBe(true);
    expect(snapshot.seed.contactCustomFields[0]).not.toHaveProperty('Code');
    expect(JSON.stringify(snapshot)).not.toContain('secret-api-key');
    expect(JSON.stringify(snapshot)).not.toContain('live.example.test');

    const mock = createLeadDocketMockApi({ seed: snapshot.seed });
    expect(mock.getStore('contactCustomFields')).toEqual([
      expect.objectContaining({ Id: 101, FieldName: 'Preferred Language' }),
    ]);
    expect(mock.getStore('customFields')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ Id: 201, Location: 'Lead' }),
        expect.objectContaining({ Id: 301, Location: 'Opportunity' }),
      ]),
    );
  });

  it('supports explicit bearer authentication', async () => {
    const headers: string[] = [];
    const liveFetch: typeof fetch = async (input) => {
      const request = input instanceof Request ? input : new Request(input);
      headers.push(request.headers.get('authorization') ?? '');
      return jsonResponse([]);
    };

    await discoverLeadDocketCustomFields({
      baseUrl: 'https://example.leaddocket.com',
      auth: { bearerToken: 'token' },
      fetch: liveFetch,
    });

    expect(headers).toEqual(['Bearer token', 'Bearer token']);
  });

  it('rejects insecure live URLs by default', async () => {
    await expect(
      discoverLeadDocketCustomFields({
        baseUrl: 'http://example.leaddocket.com',
        auth: { apiKey: 'secret' },
      }),
    ).rejects.toThrow('must use HTTPS');
  });

  it('requires a Lead Docket tenant host unless a custom test host is explicit', async () => {
    const liveFetch: typeof fetch = async () => jsonResponse([]);

    await expect(
      discoverLeadDocketCustomFields({
        baseUrl: 'https://live.example.test',
        auth: { apiKey: 'secret' },
        fetch: liveFetch,
      }),
    ).rejects.toThrow('must use a *.leaddocket.com host');

    await expect(
      discoverLeadDocketCustomFields({
        baseUrl: 'https://live.example.test',
        auth: { apiKey: 'secret' },
        fetch: liveFetch,
        allowCustomHost: true,
      }),
    ).resolves.toMatchObject({ schemaVersion: 1 });
  });

  it('enforces response-size limits and request deadlines', async () => {
    await expect(
      discoverLeadDocketCustomFields({
        baseUrl: 'https://live.example.test',
        auth: { apiKey: 'secret' },
        fetch: async () => jsonResponse([{ Id: 1 }]),
        allowCustomHost: true,
        maxResponseBytes: 4,
      }),
    ).rejects.toThrow('exceeded the 4-byte limit');

    await expect(
      discoverLeadDocketCustomFields({
        baseUrl: 'https://live.example.test',
        auth: { apiKey: 'secret' },
        fetch: async () => new Promise<Response>(() => undefined),
        allowCustomHost: true,
        timeoutMs: 5,
      }),
    ).rejects.toThrow('timed out after 5ms');
  });

  it('rejects unknown response properties without exposing values or credentials', async () => {
    const apiKey = 'never-report-this-api-key';
    let caught: unknown;
    try {
      await discoverLeadDocketCustomFields({
        baseUrl: 'https://live.example.test',
        auth: { apiKey },
        fetch: async () => jsonResponse([{ Id: 1, CustomerEmail: 'private-person@example.test' }]),
        allowCustomHost: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(String(caught)).toContain('/api/');
    expect(String(caught)).not.toContain('CustomerEmail');
    expect(String(caught)).not.toContain('private-person@example.test');
    expect(String(caught)).not.toContain(apiKey);
    expect(caught).not.toHaveProperty('cause');
  });

  it('does not retain credential-bearing fetch failures as error causes', async () => {
    const apiKey = 'fetch-error-secret';
    let caught: unknown;
    try {
      await discoverLeadDocketCustomFields({
        baseUrl: 'https://example.leaddocket.com',
        auth: { apiKey },
        fetch: async () => {
          throw new Error(`upstream rejected ${apiKey}`);
        },
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(String(caught)).not.toContain(apiKey);
    expect(caught).not.toHaveProperty('cause');
  });
});
