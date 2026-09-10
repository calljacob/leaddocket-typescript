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
          expect.objectContaining({ key: 'FirstName', required: true }),
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

    expect(integration.fields).toHaveLength(5);
    expect(integration.fields).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'extra:__RequestVerificationToken' }),
      ]),
    );
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
