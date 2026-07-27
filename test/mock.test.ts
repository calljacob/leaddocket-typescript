import { describe, expect, it } from 'vitest';
import {
  client,
  contactCustomFieldsGet,
  contactsAdd,
  contactsGetById,
  contactsPutUpdateCustomFields,
  createLeadDocketMockApi,
  customFieldsGet,
  leadsGetById,
  leadsGetCustomField,
  leadsPutUpdateCustomField,
  mockRouteDefinitions,
} from '../src/index';

function concretePath(path: string): string {
  return path.replace(/\{([^}]+)\}/g, (_match, name: string) => {
    if (name.toLowerCase().includes('code')) return 'MOCK-CODE';
    if (name.toLowerCase().includes('phone')) return '5551234567';
    return '1';
  });
}

describe('Lead Docket mock API', () => {
  it('responds to every generated OpenAPI operation', async () => {
    const mock = createLeadDocketMockApi({ deliverWebhooks: false });

    for (const route of mockRouteDefinitions) {
      const response = await mock.fetch(`${mock.baseUrl}${concretePath(route.path)}?mock=true`, {
        method: route.method,
        headers: { 'content-type': 'application/json' },
        body: route.method === 'GET' ? undefined : JSON.stringify({ name: 'Mock Request' }),
      });

      expect(response.ok, `${route.method} ${route.path}`).toBe(true);
      const responseText = await response.text();
      if (responseText) {
        expect(() => JSON.parse(responseText), `${route.method} ${route.path}`).not.toThrow();
      }
    }
  });

  it('can back the generated SDK and emit API-driven webhooks', async () => {
    const mock = createLeadDocketMockApi();
    const webhookEvents: string[] = [];
    mock.onWebhook((event) => webhookEvents.push(event.event));

    client.setConfig({
      baseUrl: mock.baseUrl,
      fetch: mock.fetch,
    });

    const { data, error } = await contactsAdd({
      body: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      } as never,
    });

    expect(error).toBeUndefined();
    expect(data).toMatchObject({ firstName: 'Ada', lastName: 'Lovelace' });
    expect(mock.getRequests()).toHaveLength(1);
    expect(webhookEvents).toEqual(['contact.created']);
    expect(mock.getWebhookEvents()[0]).toMatchObject({
      event: 'contact.created',
      entity: 'contact',
      action: 'created',
      apiCallDriven: true,
      operationId: 'contacts_add',
    });
  });

  it('returns developer-defined custom fields on mock records', async () => {
    const mock = createLeadDocketMockApi({
      seed: {
        contacts: [{ Id: 1, FirstName: 'Ada', LastName: 'Lovelace', Code: 'ADA' }],
        contactCustomFields: [
          { Id: 101, FieldName: 'Preferred Language', Location: 'Contact', FieldType: 'Text' },
          { Id: 102, FieldName: 'VIP', Location: 'Contact', FieldType: 'TrueFalse', defaultValue: false },
        ],
        customFieldValues: {
          contacts: {
            1: {
              101: 'Spanish',
            },
          },
        },
      },
    });

    client.setConfig({ baseUrl: mock.baseUrl, fetch: mock.fetch });

    const fieldList = await contactCustomFieldsGet();
    expect(fieldList.data).toEqual(expect.arrayContaining([expect.objectContaining({ Id: 101, FieldName: 'Preferred Language' })]));

    const contact = await contactsGetById({ path: { id: 1 } });
    expect(contact.data).toMatchObject({
      Id: 1,
      CustomFields: [
        { CustomFieldId: 101, Name: 'Preferred Language', Value: 'Spanish' },
        { CustomFieldId: 102, Name: 'VIP', Value: 'false' },
      ],
    });

    await contactsPutUpdateCustomFields({
      body: {
        Id: 1,
        CustomFields: [{ CustomFieldId: 102, CustomFieldValue: 'true' }],
      },
    });

    const updated = await contactsGetById({ path: { id: 1 } });
    expect(updated.data).toMatchObject({
      CustomFields: expect.arrayContaining([{ CustomFieldId: 102, Name: 'VIP', Value: 'true' }]),
    });
  });

  it('supports lead custom field definitions, values, and single-field updates', async () => {
    const mock = createLeadDocketMockApi({
      seed: {
        leads: [{ Id: 10, FirstName: 'Grace', LastName: 'Hopper', Code: 'LEAD-10' }],
        customFields: [{ Id: 201, FieldName: 'Estimated Case Value', Location: 'Lead', FieldType: 'Currency' }],
        customFieldValues: {
          leads: {
            10: {
              201: '5000',
            },
          },
        },
      },
    });

    client.setConfig({ baseUrl: mock.baseUrl, fetch: mock.fetch });

    const definitions = await customFieldsGet();
    expect(definitions.data).toEqual(expect.arrayContaining([expect.objectContaining({ Id: 201, FieldName: 'Estimated Case Value' })]));

    const lead = await leadsGetById({ path: { id: 10 } });
    expect(lead.data).toMatchObject({
      Id: 10,
      CustomFields: [{ CustomFieldId: 201, Name: 'Estimated Case Value', Value: '5000' }],
    });

    await leadsPutUpdateCustomField({ query: { id: 201, leadId: 10, value: '7500' } });

    const field = await leadsGetCustomField({ query: { id: 201, leadId: 10 } });
    expect(field.data).toMatchObject({ CustomFieldId: 201, Name: 'Estimated Case Value', Value: '7500' });

    const updated = await leadsGetById({ path: { id: 10 } });
    expect(updated.data).toMatchObject({
      CustomFields: [{ CustomFieldId: 201, Name: 'Estimated Case Value', Value: '7500' }],
    });
  });

  it('filters webhook subscriptions and supports unsubscribe', async () => {
    const mock = createLeadDocketMockApi();
    const received: string[] = [];
    const unsubscribe = mock.onWebhook((event) => received.push(event.event), ['contact.*']);

    await mock.emitWebhook({ event: 'contact.created', entity: 'contact', action: 'created' });
    await mock.emitWebhook({ event: 'lead.created', entity: 'lead', action: 'created' });
    unsubscribe();
    await mock.emitWebhook({ event: 'contact.updated', entity: 'contact', action: 'updated' });

    expect(received).toEqual(['contact.created']);
    expect(mock.getWebhookEvents().map((event) => event.event)).toEqual(['contact.created', 'lead.created', 'contact.updated']);
  });

  it('tracks and clears request history and can reset seeded state', async () => {
    const mock = createLeadDocketMockApi({
      seed: {
        contacts: [{ Id: 7, FirstName: 'Original', LastName: 'Contact' }],
      },
    });

    client.setConfig({ baseUrl: mock.baseUrl, fetch: mock.fetch });

    await contactsGetById({ path: { id: 7 } });
    expect(mock.getRequests()).toHaveLength(1);

    mock.clearRequests();
    expect(mock.getRequests()).toHaveLength(0);

    mock.setStore('contacts', [{ Id: 8, FirstName: 'Replacement', LastName: 'Contact' }]);
    expect(mock.getStore('contacts')).toEqual([expect.objectContaining({ Id: 8 })]);

    mock.reset({ contacts: [{ Id: 9, FirstName: 'Reset', LastName: 'Contact' }] });
    expect(mock.getRequests()).toHaveLength(0);
    expect(mock.getWebhookEvents()).toHaveLength(0);
    expect(mock.getStore('contacts')).toEqual([expect.objectContaining({ Id: 9, FirstName: 'Reset' })]);
  });

  it('returns a useful 404 response for unknown routes', async () => {
    const mock = createLeadDocketMockApi();

    const response = await mock.fetch(`${mock.baseUrl}/api/not-a-real-route`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({ message: 'No Lead Docket mock route found for GET /api/not-a-real-route' });
    expect(body.knownRoutes).toContain('GET /api/contacts/{id}');
  });

  it('supports manually emitted non-API webhooks', async () => {
    const mock = createLeadDocketMockApi();
    const received: string[] = [];
    mock.onWebhook((event) => received.push(event.event), ['lead.status_changed']);

    await mock.emitWebhook({
      event: 'lead.status_changed',
      entity: 'lead',
      action: 'changed',
      data: { id: 1, status: 'Signed Up' },
    });

    expect(received).toEqual(['lead.status_changed']);
    expect(mock.getWebhookEvents()[0].apiCallDriven).toBe(false);
  });
});
