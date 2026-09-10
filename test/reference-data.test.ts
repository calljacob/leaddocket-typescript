import { describe, expect, it } from 'vite-plus/test';

import { createLeadDocketMockApi, discoverLeadDocketReferenceData } from '../src/index';

function response(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('live Lead Docket reference-data discovery', () => {
  it('synchronizes allowlisted tenant metadata', async () => {
    const requests: Request[] = [];
    const liveFetch: typeof fetch = async (input, init) => {
      const request =
        input instanceof Request ? new Request(input, init) : new Request(input, init);
      requests.push(request);
      const url = new URL(request.url);
      if (url.pathname === '/api/statuses') {
        return response({
          IsValid: true,
          Data: [
            {
              IsValid: true,
              Data: {
                Id: 1,
                Status: 'New',
                DisplayOrder: 1,
                Substatuses: [{ Id: 11, SubStatusName: 'Awaiting Review', DisplayOrder: 1 }],
              },
              Links: [{ Href: 'https://live.example.test/status/1' }],
            },
          ],
        });
      }
      if (url.pathname === '/api/leadroles') {
        return response([
          {
            LeadRoleId: 2,
            RoleName: 'Attorney',
            IsOwner: true,
          },
        ]);
      }
      if (url.pathname === '/api/leadsources/list') {
        return response({ Data: [{ Id: 3, Name: 'Website' }] });
      }
      if (url.pathname === '/api/lookups/gettypes') {
        return response([
          'LeadSource',
          'CaseType',
          'MarketingSource',
          'Statuses',
          'Offices',
          'Forms',
          'Tags',
          'PhoneNumbers',
        ]);
      }
      if (url.pathname === '/api/lookups') {
        return response([{ Id: 10, Name: `${url.searchParams.get('type')} option` }]);
      }
      if (url.pathname === '/api/leads/forms') {
        return response([
          {
            IsValid: true,
            Data: { LeadFormId: 4, FormName: 'Client Intake', CreatedBy: 'Live Employee' },
          },
        ]);
      }
      if (url.pathname === '/api/leads/forms/4') {
        return response({
          IsValid: true,
          Data: {
            LeadFormId: 4,
            FormName: 'Client Intake',
            CaseTypeId: 10,
            CreatedById: 99,
            CreatedBy: 'Live Employee',
          },
          Links: [{ Href: 'https://live.example.test/forms/4' }],
        });
      }
      if (url.pathname === '/api/referrals/listpracticeareas') {
        return response(['Personal Injury', 'Workers Compensation']);
      }
      if (url.pathname === '/api/settings/get-options') {
        return response({ Name: 'Example Feature', IsEnabled: true });
      }
      return response({ message: `Unexpected request: ${url.pathname}` });
    };

    const snapshot = await discoverLeadDocketReferenceData({
      baseUrl: 'http://live.example.test',
      auth: { apiKey: 'live-api-key' },
      fetch: liveFetch,
      allowInsecure: true,
    });

    expect(requests.every((request) => request.method === 'GET')).toBe(true);
    expect(requests.every((request) => request.headers.get('api_key') === 'live-api-key')).toBe(
      true,
    );
    expect(requests.every((request) => request.redirect === 'error')).toBe(true);
    expect(
      requests.some((request) => new URL(request.url).searchParams.get('type') === 'PhoneNumbers'),
    ).toBe(false);
    expect(snapshot.seed.statuses).toEqual([
      expect.objectContaining({
        Id: 1,
        Status: 'New',
        Substatuses: [expect.objectContaining({ Id: 11, SubStatusName: 'Awaiting Review' })],
      }),
    ]);
    expect(snapshot.seed.substatuses).toEqual([expect.objectContaining({ Id: 11, StatusId: 1 })]);
    expect(snapshot.seed.leadRoles).toEqual([
      {
        LeadRoleId: 2,
        RoleName: 'Attorney',
        IsOwner: true,
      },
    ]);
    expect(snapshot.seed.leadSources).toEqual([{ Id: 3, Name: 'Website' }]);
    expect(snapshot.seed.leadForms).toEqual([
      { LeadFormId: 4, FormName: 'Client Intake', CaseTypeId: 10 },
    ]);
    expect(snapshot.seed.lookups).toMatchObject({
      CaseType: [{ Id: 10, Name: 'CaseType option' }],
      ReferralPracticeAreas: ['Personal Injury', 'Workers Compensation'],
    });
    expect(snapshot.seed.settings).toEqual({ Name: 'Example Feature', IsEnabled: true });
    expect(JSON.stringify(snapshot)).not.toContain('employee@live.example');
    expect(JSON.stringify(snapshot)).not.toContain('5551234567');
    expect(JSON.stringify(snapshot)).not.toContain('live.example.test/forms');
  });

  it('rejects unknown sensitive shapes without reporting properties, values, or credentials', async () => {
    const apiKey = 'reference-data-secret';
    const liveFetch: typeof fetch = async (input) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.pathname === '/api/statuses') return response({ Data: [] });
      if (url.pathname === '/api/leadroles') {
        return response([
          { LeadRoleId: 2, RoleName: 'Attorney', UserEmail: 'private-person@example.test' },
        ]);
      }
      if (url.pathname === '/api/leadsources/list') return response({ Data: [] });
      if (url.pathname === '/api/lookups/gettypes') return response([]);
      if (url.pathname === '/api/leads/forms') return response([]);
      if (url.pathname === '/api/referrals/listpracticeareas') return response([]);
      if (url.pathname === '/api/settings/get-options') return response({});
      return response([]);
    };

    let caught: unknown;
    try {
      await discoverLeadDocketReferenceData({
        baseUrl: 'https://live.example.test',
        auth: { apiKey },
        fetch: liveFetch,
        allowCustomHost: true,
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(String(caught)).toContain('/api/leadroles');
    expect(String(caught)).not.toContain('UserEmail');
    expect(String(caught)).not.toContain('private-person@example.test');
    expect(String(caught)).not.toContain(apiKey);
    expect(caught).not.toHaveProperty('cause');
  });

  it('bounds lookup and lead-form detail concurrency', async () => {
    let active = 0;
    let maximumActive = 0;
    let boundedRequestCount = 0;
    const enterBoundedRequest = async () => {
      boundedRequestCount += 1;
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
    };
    const liveFetch: typeof fetch = async (input) => {
      const url = new URL(input instanceof Request ? input.url : input.toString());
      if (url.pathname === '/api/statuses') return response({ Data: [] });
      if (url.pathname === '/api/leadroles') return response([]);
      if (url.pathname === '/api/leadsources/list') return response({ Data: [] });
      if (url.pathname === '/api/lookups/gettypes') {
        return response([
          'LeadSource',
          'CaseType',
          'MarketingSource',
          'Statuses',
          'Offices',
          'Forms',
          'Tags',
        ]);
      }
      if (url.pathname === '/api/lookups') {
        await enterBoundedRequest();
        return response(['option']);
      }
      if (url.pathname === '/api/leads/forms') {
        return response(
          Array.from({ length: 6 }, (_, index) => ({
            Data: { LeadFormId: index + 1, FormName: `Form ${index + 1}` },
          })),
        );
      }
      if (url.pathname.startsWith('/api/leads/forms/')) {
        await enterBoundedRequest();
        const id = Number(url.pathname.split('/').at(-1));
        return response({ Data: { LeadFormId: id, FormName: `Form ${id}` } });
      }
      if (url.pathname === '/api/referrals/listpracticeareas') return response([]);
      if (url.pathname === '/api/settings/get-options') return response({});
      return response([]);
    };

    await discoverLeadDocketReferenceData({
      baseUrl: 'https://live.example.test',
      auth: { apiKey: 'secret' },
      fetch: liveFetch,
      allowCustomHost: true,
      maxConcurrency: 2,
    });

    expect(maximumActive).toBe(2);
    expect(boundedRequestCount).toBe(13);
  });

  it('feeds synchronized envelopes and lookup catalogs into the mock endpoints', async () => {
    const mock = createLeadDocketMockApi({
      seed: {
        statuses: [
          {
            Id: 1,
            Status: 'New',
            Substatuses: [{ Id: 11, SubStatusName: 'Awaiting Review' }],
          },
        ],
        substatuses: [{ Id: 11, StatusId: 1, SubStatusName: 'Awaiting Review' }],
        leadForms: [{ LeadFormId: 4, FormName: 'Client Intake' }],
        referralGroups: [{ Id: 7, GroupName: 'Example Group' }],
        lookups: {
          CaseType: [{ Id: 10, Name: 'Personal Injury' }],
          ReferralPracticeAreas: ['Personal Injury'],
        },
      },
    });

    expect(await (await mock.fetch('/api/lookups?type=CaseType')).json()).toEqual([
      { Id: 10, Name: 'Personal Injury' },
    ]);
    expect(await (await mock.fetch('/api/referrals/listpracticeareas')).json()).toEqual([
      'Personal Injury',
    ]);
    expect(await (await mock.fetch('/api/referrals/listgroups')).json()).toEqual([
      expect.objectContaining({ Id: 7, GroupName: 'Example Group' }),
    ]);
    expect(await (await mock.fetch('/api/statuses')).json()).toMatchObject({
      IsValid: true,
      Data: [{ IsValid: true, Data: { Id: 1, Status: 'New' } }],
    });
    expect(await (await mock.fetch('/api/statuses/1')).json()).toMatchObject({
      IsValid: true,
      Data: { Id: 1, Status: 'New' },
    });
    expect(await (await mock.fetch('/api/leads/forms')).json()).toEqual([
      { IsValid: true, Data: expect.objectContaining({ LeadFormId: 4 }) },
    ]);
  });
});
