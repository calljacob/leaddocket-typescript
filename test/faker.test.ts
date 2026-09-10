import { describe, expect, it } from 'vite-plus/test';

import { generateLeadDocketMockData } from '../src/mock/faker';

describe('Faker mock data generation', () => {
  it('generates deterministic, relational Lead Docket fixtures', () => {
    const options = {
      seed: 42,
      contacts: 3,
      leads: 3,
      opportunities: 2,
      tasks: 2,
      messages: 2,
      users: 2,
    };
    const first = generateLeadDocketMockData(options);
    const second = generateLeadDocketMockData(options);

    expect(first).toEqual(second);
    expect(first.contacts).toHaveLength(3);
    expect(first.leads).toHaveLength(3);
    expect(first.opportunities).toHaveLength(2);
    expect(first.tasks).toHaveLength(2);
    expect(first.messages).toHaveLength(2);
    expect(first.users).toHaveLength(2);
    expect(first.leads[0]).toMatchObject({
      ContactId: first.contacts[0].Id,
      OpportunityId: first.opportunities[0].Id,
    });
    expect(first.tasks[0]).toMatchObject({
      LeadId: first.leads[0].Id,
      AssignedToId: first.users[0].Id,
    });
    expect(String(first.contacts[0].Email)).toMatch(/@example\.test$/);
    expect(String(first.contacts[0].MobilePhone)).toMatch(/^\+1555\d{7}$/);
  });

  it('changes generated values when the seed changes', () => {
    const first = generateLeadDocketMockData({ seed: 1, contacts: 1 });
    const second = generateLeadDocketMockData({ seed: 2, contacts: 1 });
    expect(first.contacts[0].FullName).not.toBe(second.contacts[0].FullName);
  });

  it('enforces per-resource generation limits', () => {
    expect(() => generateLeadDocketMockData({ contacts: 501 })).toThrow(
      'contacts count must be an integer between 0 and 500',
    );
  });
});
