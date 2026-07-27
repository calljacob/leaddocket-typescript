import { describe, expect, it } from 'vitest';
import {
  client,
  contactCustomFieldsGet,
  contactsAdd,
  contactsGetById,
  contactsPutUpdateCustomFields,
  createLeadDocketMockApi,
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
      if (response.status !== 204 && response.status !== 205) {
        await expect(response.json(), `${route.method} ${route.path}`).resolves.toBeDefined();
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
