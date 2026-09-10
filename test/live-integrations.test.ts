import { describe, expect, it } from 'vite-plus/test';

import { discoverLeadDocketIntegrations, parseLeadDocketIntegrationPreview } from '../src/index';

const previewHtml = `<!doctype html>
<html>
<head><title>Fallback title</title></head>
<body>
  <h1>Custom Website Intake</h1>
  <form method="post">
    <input type="hidden" name="__RequestVerificationToken" value="framework-secret" />
    <label for="first">First Name</label>
    <input id="first" name="First" required />
    <label for="last">Last Name</label>
    <input id="last" name="Last" required />
    <label for="matter">Type of Matter</label>
    <select id="matter" name="Matter_Type" required>
      <option value="">Select</option>
      <option value="mva">Motor Vehicle Accident</option>
      <option value="workers_comp">Workers Compensation</option>
    </select>
    <label for="source-detail">Vendor Source Detail</label>
    <input id="source-detail" name="Vendor_Source" value="Website" />
    <label for="summary">Case Summary</label>
    <textarea id="summary" name="Summary"></textarea>
  </form>
</body>
</html>`;

describe('live Lead Docket integration discovery', () => {
  it('imports configured preview URLs using GET and forces preview mode', async () => {
    const requests: Request[] = [];
    const liveFetch: typeof fetch = async (input, init) => {
      const request =
        input instanceof Request ? new Request(input, init) : new Request(input, init);
      requests.push(request);
      return new Response(previewHtml, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      });
    };

    const snapshot = await discoverLeadDocketIntegrations({
      previewUrls: [
        'https://example.leaddocket.com/Opportunities/Form/40?apikey=local-preview-key',
      ],
      customFields: [
        {
          Id: 302,
          FieldName: 'Type of Matter',
          Location: 'Opportunity',
          FieldType: 'DropDownList',
        },
      ],
      fetch: liveFetch,
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('GET');
    expect(requests[0].redirect).toBe('error');
    expect(new URL(requests[0].url).searchParams.get('preview')).toBe('true');
    expect(snapshot.opportunityIntegrations).toEqual([
      expect.objectContaining({
        id: '40',
        accessKey: 'local-preview-key',
        name: 'Custom Website Intake',
        fields: expect.arrayContaining([
          expect.objectContaining({ key: 'FirstName', sourceName: 'First', required: true }),
          expect.objectContaining({ key: 'LastName', required: true }),
          expect.objectContaining({
            key: 'custom:302',
            type: 'select',
            options: [
              { label: 'Motor Vehicle Accident', value: 'mva' },
              { label: 'Workers Compensation', value: 'workers_comp' },
            ],
          }),
          expect.objectContaining({ key: 'extra:Vendor_Source', defaultValue: 'Website' }),
          expect.objectContaining({ key: 'Summary', type: 'textarea' }),
        ]),
      }),
    ]);
    expect(JSON.stringify(snapshot)).not.toContain('framework-secret');
  });

  it('parses a preview without needing a live request', () => {
    const integration = parseLeadDocketIntegrationPreview(
      previewHtml,
      new URL(
        'https://example.leaddocket.com/Opportunities/Form/40?apikey=local-preview-key&preview=true',
      ),
    );

    expect(integration).toMatchObject({
      method: 'post',
      enctype: 'application/x-www-form-urlencoded',
      endpoint: 'form',
    });
    expect(integration.fields).toHaveLength(5);
    expect(integration.fields).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'extra:__RequestVerificationToken' }),
      ]),
    );
  });

  it('preserves form metadata, source names, multi-selects, and checkbox groups', () => {
    const html = `
      <h1>Rich form</h1>
      <form method="POST" enctype="multipart/form-data" action="/Opportunities/FormJson/44">
        <label for="first">Given name</label>
        <input id="first" name="Contact_Given" />
        <label for="topics">Topics</label>
        <select id="topics" name="TopicIds" multiple>
          <option value="a" selected>Alpha</option>
          <option value="b" selected>Beta</option>
        </select>
        <label for="email">Email updates</label>
        <input id="email" type="checkbox" name="Channels" value="email" checked required />
        <label for="sms">SMS updates</label>
        <input id="sms" type="checkbox" name="Channels" value="sms" required />
        <input type="hidden" name="Channels" value="false" />
      </form>`;
    const integration = parseLeadDocketIntegrationPreview(
      html,
      new URL('https://example.leaddocket.com/Opportunities/Form/44?apikey=key&preview=true'),
    );

    expect(integration).toMatchObject({
      id: '44',
      method: 'post',
      enctype: 'multipart/form-data',
      endpoint: 'formJson',
      fields: [
        expect.objectContaining({ key: 'extra:Contact_Given', sourceName: 'Contact_Given' }),
        expect.objectContaining({
          key: 'extra:TopicIds',
          sourceName: 'TopicIds',
          type: 'select',
          multiple: true,
          defaultValue: ['a', 'b'],
        }),
        expect.objectContaining({
          key: 'extra:Channels',
          sourceName: 'Channels',
          type: 'checkbox',
          multiple: true,
          required: true,
          defaultValue: ['email'],
          options: [
            { label: 'Email updates', value: 'email' },
            { label: 'SMS updates', value: 'sms' },
          ],
        }),
      ],
    });
  });

  it('bounds discovery concurrency without changing result order', async () => {
    let active = 0;
    let maximumActive = 0;
    const snapshot = await discoverLeadDocketIntegrations({
      previewUrls: [45, 46, 47, 48].map(
        (id) => `https://example.leaddocket.com/Opportunities/Form/${id}?apikey=key-${id}`,
      ),
      concurrency: 2,
      fetch: async () => {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        await new Promise((resolve) => setTimeout(resolve, 5));
        active -= 1;
        return new Response(previewHtml);
      },
    });

    expect(maximumActive).toBe(2);
    expect(snapshot.opportunityIntegrations.map(({ id }) => id)).toEqual(['45', '46', '47', '48']);
  });

  it('rejects oversized and timed-out preview responses', async () => {
    await expect(
      discoverLeadDocketIntegrations({
        previewUrls: ['https://example.leaddocket.com/Opportunities/Form/49?apikey=key'],
        maxResponseBytes: 16,
        fetch: async () => new Response(previewHtml),
      }),
    ).rejects.toThrow('Unable to import Lead Docket integration 49');

    await expect(
      discoverLeadDocketIntegrations({
        previewUrls: ['https://example.leaddocket.com/Opportunities/Form/50?apikey=key'],
        timeoutMs: 5,
        fetch: async (_input, init) =>
          await new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), {
              once: true,
            });
          }),
      }),
    ).rejects.toThrow('Unable to import Lead Docket integration 50');
  });

  it('does not include capability keys in discovery errors', async () => {
    const capabilityKey = 'do-not-echo-this-key';
    await expect(
      discoverLeadDocketIntegrations({
        previewUrls: [
          `https://example.leaddocket.com/Opportunities/Form/40?apikey=${capabilityKey}`,
        ],
        fetch: async () => new Response('Unavailable', { status: 500 }),
      }),
    ).rejects.not.toThrow(capabilityKey);
  });
});
