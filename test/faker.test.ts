import { describe, expect, it } from 'vite-plus/test';

import {
  generateLeadDocketMockData,
  type GenerateLeadDocketMockDataOptions,
} from '../src/mock/faker';

const DAY_IN_MS = 24 * 60 * 60 * 1_000;
const MAX_SEED = 0xffff_ffff;
const MAX_ID_OFFSET = 1_000_000;
const RESOURCE_NAMES = [
  'contacts',
  'leads',
  'opportunities',
  'tasks',
  'messages',
  'users',
] as const;

const ZERO_COUNTS = {
  contacts: 0,
  leads: 0,
  opportunities: 0,
  tasks: 0,
  messages: 0,
  users: 0,
} satisfies GenerateLeadDocketMockDataOptions;

function expectDateInRange(value: string, from: Date, to: Date): void {
  const timestamp = new Date(value).getTime();
  expect(Number.isFinite(timestamp)).toBe(true);
  expect(timestamp).toBeGreaterThanOrEqual(from.getTime());
  expect(timestamp).toBeLessThanOrEqual(to.getTime());
}

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
    expect(first.messages[0]).toMatchObject({ LeadId: first.leads[0].Id });
    expect(first.contacts[0].Email).toMatch(/@example\.test$/);
    expect(first.contacts[0].MobilePhone).toMatch(/^\+1555\d{7}$/);
  });

  it('changes generated values when the seed changes', () => {
    const first = generateLeadDocketMockData({ ...ZERO_COUNTS, seed: 1, contacts: 1 });
    const second = generateLeadDocketMockData({ ...ZERO_COUNTS, seed: 2, contacts: 1 });
    expect(first.contacts[0].FullName).not.toBe(second.contacts[0].FullName);
  });

  it('omits foreign keys instead of inventing records when parent collections are empty', () => {
    const leadsWithoutParents = generateLeadDocketMockData({
      ...ZERO_COUNTS,
      seed: 91,
      leads: 2,
    });
    const childrenWithoutParents = generateLeadDocketMockData({
      ...ZERO_COUNTS,
      seed: 91,
      tasks: 2,
      messages: 2,
    });

    for (const lead of leadsWithoutParents.leads) {
      expect(lead).not.toHaveProperty('ContactId');
      expect(lead).not.toHaveProperty('OpportunityId');
      expect(lead.FirstName).not.toBe('');
      expect(lead.Email).toMatch(/@example\.test$/);
    }
    for (const task of childrenWithoutParents.tasks) {
      expect(task).not.toHaveProperty('LeadId');
      expect(task).not.toHaveProperty('AssignedToId');
    }
    for (const message of childrenWithoutParents.messages) {
      expect(message).not.toHaveProperty('LeadId');
    }
  });

  it('includes each foreign key independently only when that parent exists', () => {
    const generated = generateLeadDocketMockData({
      ...ZERO_COUNTS,
      contacts: 1,
      leads: 1,
      tasks: 1,
      messages: 1,
    });

    expect(generated.leads[0]).toMatchObject({ ContactId: generated.contacts[0].Id });
    expect(generated.leads[0]).not.toHaveProperty('OpportunityId');
    expect(generated.tasks[0]).toMatchObject({ LeadId: generated.leads[0].Id });
    expect(generated.tasks[0]).not.toHaveProperty('AssignedToId');
    expect(generated.messages[0]).toMatchObject({ LeadId: generated.leads[0].Id });
  });

  it('uses referenceDate for every generated past and future date range', () => {
    const referenceDate = new Date('2020-02-03T04:05:06.000Z');
    const generated = generateLeadDocketMockData({
      seed: 17,
      referenceDate,
      contacts: 2,
      leads: 2,
      opportunities: 2,
      tasks: 2,
      messages: 2,
      users: 2,
    });

    for (const contact of generated.contacts) {
      expectDateInRange(
        contact.CreatedDate,
        new Date(referenceDate.getTime() - 380 * DAY_IN_MS),
        referenceDate,
      );
      expect(contact.createdDate).toBe(contact.CreatedDate);
    }
    for (const opportunity of generated.opportunities) {
      expectDateInRange(
        opportunity.CreatedDate,
        new Date(referenceDate.getTime() - 230 * DAY_IN_MS),
        referenceDate,
      );
      expect(opportunity.createdDate).toBe(opportunity.CreatedDate);
    }
    for (const lead of generated.leads) {
      expectDateInRange(
        lead.CreatedDate,
        new Date(referenceDate.getTime() - 230 * DAY_IN_MS),
        referenceDate,
      );
      expect(lead.createdDate).toBe(lead.CreatedDate);
      expect(lead.LastStatusChangeDate).toBe(lead.CreatedDate);
    }
    for (const task of generated.tasks) {
      expectDateInRange(
        task.DueDate,
        referenceDate,
        new Date(referenceDate.getTime() + 30 * DAY_IN_MS),
      );
    }
    for (const message of generated.messages) {
      expectDateInRange(
        message.CreatedOn,
        new Date(referenceDate.getTime() - 30 * DAY_IN_MS),
        referenceDate,
      );
    }

    expect(referenceDate.toISOString()).toBe('2020-02-03T04:05:06.000Z');
  });

  it('accepts referenceDate as an equivalent ISO string or Date', () => {
    const referenceDate = '2032-04-05T06:07:08.000Z';
    const options = { ...ZERO_COUNTS, seed: 8, contacts: 2 };

    expect(generateLeadDocketMockData({ ...options, referenceDate })).toEqual(
      generateLeadDocketMockData({ ...options, referenceDate: new Date(referenceDate) }),
    );
  });

  it.each(['not-a-date', '', '2025-99-99T00:00:00.000Z'])(
    'rejects invalid referenceDate %j',
    (referenceDate) => {
      expect(() => generateLeadDocketMockData({ ...ZERO_COUNTS, referenceDate })).toThrow(
        'referenceDate must be a valid date.',
      );
    },
  );

  it('rejects an invalid Date object', () => {
    expect(() =>
      generateLeadDocketMockData({ ...ZERO_COUNTS, referenceDate: new Date(Number.NaN) }),
    ).toThrow('referenceDate must be a valid date.');
  });

  it.each([0, MAX_SEED])('accepts seed boundary %d', (seed) => {
    expect(() => generateLeadDocketMockData({ ...ZERO_COUNTS, seed })).not.toThrow();
  });

  it.each([-1, MAX_SEED + 1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid seed %s',
    (seed) => {
      expect(() => generateLeadDocketMockData({ ...ZERO_COUNTS, seed })).toThrow(
        `seed must be an integer between 0 and ${MAX_SEED}.`,
      );
    },
  );

  it.each([0, MAX_ID_OFFSET])('accepts idOffset boundary %d', (idOffset) => {
    expect(() => generateLeadDocketMockData({ ...ZERO_COUNTS, idOffset })).not.toThrow();
  });

  it.each([-1, MAX_ID_OFFSET + 1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid idOffset %s',
    (idOffset) => {
      expect(() => generateLeadDocketMockData({ ...ZERO_COUNTS, idOffset })).toThrow(
        `idOffset must be an integer between 0 and ${MAX_ID_OFFSET}.`,
      );
    },
  );

  it.each(RESOURCE_NAMES)('accepts %s count boundaries', (resource) => {
    const atMinimum = generateLeadDocketMockData({ ...ZERO_COUNTS, [resource]: 0 });
    const atMaximum = generateLeadDocketMockData({ ...ZERO_COUNTS, [resource]: 500 });

    expect(atMinimum[resource]).toHaveLength(0);
    expect(atMaximum[resource]).toHaveLength(500);
  });

  it.each(RESOURCE_NAMES)('rejects invalid %s counts', (resource) => {
    for (const count of [-1, 501, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => generateLeadDocketMockData({ ...ZERO_COUNTS, [resource]: count })).toThrow(
        `${resource} count must be an integer between 0 and 500.`,
      );
    }
  });

  it('keeps maximum-sized resource ID ranges unique at the maximum offset', () => {
    const generated = generateLeadDocketMockData({
      seed: MAX_SEED,
      idOffset: MAX_ID_OFFSET,
      contacts: 500,
      leads: 500,
      opportunities: 500,
      tasks: 500,
      messages: 500,
      users: 500,
    });
    const records = [
      ...generated.contacts,
      ...generated.leads,
      ...generated.opportunities,
      ...generated.tasks,
      ...generated.messages,
      ...generated.users,
    ];
    const ids = records.map((record) => record.Id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(generated.contacts.at(0)?.Id).toBe(1_010_000);
    expect(generated.contacts.at(-1)?.Id).toBe(1_010_499);
    expect(generated.leads.at(0)?.Id).toBe(1_020_000);
    expect(generated.opportunities.at(0)?.Id).toBe(1_030_000);
    expect(generated.tasks.at(0)?.Id).toBe(1_040_000);
    expect(generated.messages.at(0)?.Id).toBe(1_050_000);
    expect(generated.users.at(-1)?.Id).toBe(1_060_499);
  });
});
