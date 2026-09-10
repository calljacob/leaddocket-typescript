import { describe, expect, it } from 'vite-plus/test';

import { createLeadDocketMockApi, type MockOpportunityIntegration } from '../src/index';

const integration: MockOpportunityIntegration = {
  id: 28,
  accessKey: 'local-form-key',
  name: 'Website Case Evaluation',
  fields: [
    { key: 'FirstName', required: true },
    { key: 'LastName', required: true },
    { key: 'Email', type: 'email' as const, required: true },
    { key: 'Summary', type: 'textarea' as const, required: true },
    { key: 'custom:301' as const, label: 'Potential case value', type: 'number' as const },
  ],
};

describe('Lead Docket opportunity integrations', () => {
  it('renders a protected form and creates an opportunity with one sanitized webhook', async () => {
    const delivered: unknown[] = [];
    const mock = createLeadDocketMockApi({
      opportunityIntegrations: [integration],
      seed: {
        customFields: [
          {
            Id: 301,
            FieldName: 'Potential Case Value',
            Location: 'Opportunity',
            FieldType: 'Currency',
          },
        ],
      },
    });
    mock.onWebhook(
      (event) => {
        delivered.push(event);
      },
      ['opportunity.*'],
    );

    const invalid = await mock.fetch('/opportunities/form/28?apikey=wrong');
    expect(invalid.status).toBe(404);

    const form = await mock.fetch('/opportunities/form/28?apikey=local-form-key');
    expect(form.status).toBe(200);
    expect(await form.text()).toContain('Website Case Evaluation');

    const submission = new URLSearchParams({
      FirstName: 'Ada',
      LastName: 'Lovelace',
      Email: 'ada@example.com',
      Summary: 'A local integration submission',
      'custom:301': '50000',
    });
    const response = await mock.fetch('/opportunities/form/28?apikey=local-form-key', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: submission,
      redirect: 'manual',
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/opportunities/form/28/success');
    const created = mock
      .getStore('opportunities')
      .find((opportunity) => opportunity.Email === 'ada@example.com');
    expect(created).toMatchObject({
      FirstName: 'Ada',
      LastName: 'Lovelace',
      OpportunityTypeId: 'WebForm',
      Processed: false,
      IntegrationId: '28',
      CustomFields: [
        expect.objectContaining({
          CustomFieldId: 301,
          Name: 'Potential Case Value',
          Value: '50000',
        }),
      ],
    });

    expect(mock.getWebhookEvents()).toHaveLength(1);
    expect(mock.getWebhookEvents()[0]).toMatchObject({
      event: 'opportunity.created',
      entity: 'opportunity',
      action: 'created',
      apiCallDriven: false,
      operationId: 'integrationForm.submit',
      query: {},
      data: expect.objectContaining({ Email: 'ada@example.com' }),
    });
    expect(delivered).toHaveLength(1);
    expect(mock.getRequests()).toHaveLength(3);
    expect(JSON.stringify(mock.getRequests())).not.toContain('local-form-key');
    expect(JSON.stringify(mock.getWebhookEvents())).not.toContain('local-form-key');
  });

  it('renders preview mode without allowing opportunity creation or webhooks', async () => {
    const mock = createLeadDocketMockApi({ opportunityIntegrations: [integration] });
    const initialCount = mock.getStore('opportunities').length;
    expect(mock.getOpportunityIntegrationUrl(28, { preview: true })).toBe(
      'https://mock.leaddocket.local/opportunities/form/28?apikey=local-form-key&preview=true',
    );

    const preview = await mock.fetch('/Opportunities/Form/28?apikey=local-form-key&preview=true');
    expect(preview.status).toBe(200);
    const previewHtml = await preview.text();
    expect(previewHtml).toContain('Preview mode');
    expect(previewHtml).toContain('Preview only');
    expect(previewHtml).toContain('disabled');

    const submission = await mock.fetch(
      '/opportunities/form/28?apikey=local-form-key&preview=true',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          FirstName: 'Preview',
          LastName: 'Only',
          Email: 'preview@example.com',
          Summary: 'This must not be saved',
        }),
      },
    );
    expect(submission.status).toBe(409);
    expect(await submission.json()).toEqual({
      success: false,
      message: 'Preview submissions are disabled.',
    });
    expect(mock.getStore('opportunities')).toHaveLength(initialCount);
    expect(mock.getWebhookEvents()).toHaveLength(0);
    expect(mock.getRequests()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operationId: 'integrationForm.preview',
          query: { preview: 'true' },
        }),
      ]),
    );
    expect(JSON.stringify(mock.getRequests())).not.toContain('local-form-key');
  });

  it('returns validation errors without creating an opportunity or webhook', async () => {
    const mock = createLeadDocketMockApi({ opportunityIntegrations: [integration] });
    const initialCount = mock.getStore('opportunities').length;

    const response = await mock.fetch('/opportunities/form/28?apikey=local-form-key', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ FirstName: 'Missing required values' }),
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain('Email is required');
    expect(mock.getStore('opportunities')).toHaveLength(initialCount);
    expect(mock.getWebhookEvents()).toHaveLength(0);
  });

  it('accepts JSON submissions for integration clients', async () => {
    const mock = createLeadDocketMockApi({ opportunityIntegrations: [integration] });
    const response = await mock.fetch('/opportunities/form/28?apikey=local-form-key', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        FirstName: 'Grace',
        LastName: 'Hopper',
        Email: 'grace@example.com',
        Summary: 'JSON integration submission',
      }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      success: true,
      opportunity: {
        FirstName: 'Grace',
        LastName: 'Hopper',
        OpportunityTypeId: 'WebForm',
      },
    });
  });

  it('supports user-defined labels, stored option values, static values, and extra fields', async () => {
    const customIntegration: MockOpportunityIntegration = {
      id: 40,
      accessKey: 'local-custom-form-key',
      name: 'Custom Intake',
      fields: [
        { key: 'FirstName', required: true },
        { key: 'LastName', required: true },
        {
          key: 'custom:302',
          label: 'Type of matter',
          type: 'select',
          required: true,
          options: [
            { label: 'Motor Vehicle Accident', value: 'mva' },
            { label: 'Workers Compensation', value: 'workers_comp' },
          ],
        },
        {
          key: 'extra:ReferralTier',
          label: 'Referral priority',
          type: 'radio',
          options: [
            { label: 'Standard review', value: 'standard' },
            { label: 'Priority review', value: 'priority' },
          ],
        },
        {
          key: 'custom:303',
          label: 'Consent to contact',
          type: 'checkbox',
          checkedValue: 'Accepted',
          uncheckedValue: 'Declined',
        },
        {
          key: 'MarketingSource',
          type: 'hidden',
          defaultValue: 'Custom Integration 40',
        },
      ],
    };
    const mock = createLeadDocketMockApi({
      opportunityIntegrations: [customIntegration],
      seed: {
        customFields: [
          { Id: 302, FieldName: 'Type of Matter', Location: 'Opportunity' },
          { Id: 303, FieldName: 'Consent to Contact', Location: 'Opportunity' },
        ],
      },
    });

    const form = await mock.fetch('/opportunities/form/40?apikey=local-custom-form-key');
    const formHtml = await form.text();
    expect(formHtml).toContain('Motor Vehicle Accident');
    expect(formHtml).toContain('value="mva"');
    expect(formHtml).toContain('Referral priority');

    const response = await mock.fetch('/opportunities/form/40?apikey=local-custom-form-key', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        FirstName: 'Alberto',
        LastName: 'Example',
        'custom:302': 'mva',
        'extra:ReferralTier': 'priority',
        'custom:303': 'on',
        MarketingSource: 'tampered value',
      }),
    });

    expect(response.status).toBe(201);
    const opportunity = mock
      .getStore('opportunities')
      .find((record) => record.FirstName === 'Alberto');
    expect(opportunity).toMatchObject({
      MarketingSource: 'Custom Integration 40',
      ReferralTier: 'priority',
      CustomFields: expect.arrayContaining([
        expect.objectContaining({ CustomFieldId: 302, Value: 'mva' }),
        expect.objectContaining({ CustomFieldId: 303, Value: 'Accepted' }),
      ]),
    });
    expect(mock.getWebhookEvents()[0].data).toMatchObject({
      MarketingSource: 'Custom Integration 40',
      ReferralTier: 'priority',
    });

    const invalidOption = await mock.fetch('/opportunities/form/40?apikey=local-custom-form-key', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        FirstName: 'Invalid',
        LastName: 'Option',
        'custom:302': 'not-configured',
      }),
    });
    expect(invalidOption.status).toBe(422);
  });

  it('routes generated lead-form operations to the leadForms store', async () => {
    const mock = createLeadDocketMockApi();
    const initialLeadCount = mock.getStore('leads').length;
    const initialFormCount = mock.getStore('leadForms').length;

    const response = await mock.fetch('/api/leads/forms', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ CaseTypeId: 7, FormName: 'Mock Lead Form' }),
    });

    expect(response.ok).toBe(true);
    expect(mock.getStore('leadForms')).toHaveLength(initialFormCount + 1);
    expect(mock.getStore('leads')).toHaveLength(initialLeadCount);
    expect(mock.getWebhookEvents()[0]).toMatchObject({
      event: 'leadForm.created',
      entity: 'leadForm',
      action: 'created',
    });
  });
});
