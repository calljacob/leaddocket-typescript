import { en, Faker } from '@faker-js/faker';

import type { LeadDocketMockSeed } from './index';

export type GenerateLeadDocketMockDataOptions = {
  seed?: number;
  idOffset?: number;
  referenceDate?: string | Date;
  contacts?: number;
  leads?: number;
  opportunities?: number;
  tasks?: number;
  messages?: number;
  users?: number;
};

export type GeneratedLeadDocketMockData = Required<
  Pick<LeadDocketMockSeed, 'contacts' | 'leads' | 'opportunities' | 'tasks' | 'messages' | 'users'>
>;

const MAX_PER_RESOURCE = 500;

export function generateLeadDocketMockData(
  options: GenerateLeadDocketMockDataOptions = {},
): GeneratedLeadDocketMockData {
  const counts = {
    contacts: validateCount('contacts', options.contacts ?? 20),
    leads: validateCount('leads', options.leads ?? 20),
    opportunities: validateCount('opportunities', options.opportunities ?? 20),
    tasks: validateCount('tasks', options.tasks ?? 15),
    messages: validateCount('messages', options.messages ?? 10),
    users: validateCount('users', options.users ?? 5),
  };
  const idOffset = validateIdOffset(options.idOffset ?? 0);
  const faker = new Faker({ locale: [en] });
  faker.seed(options.seed ?? 12_345);
  faker.setDefaultRefDate(options.referenceDate ?? '2025-01-15T12:00:00.000Z');

  const users = Array.from({ length: counts.users }, (_, index) =>
    createUser(faker, index + idOffset),
  );
  const contacts = Array.from({ length: counts.contacts }, (_, index) =>
    createContact(faker, index + idOffset),
  );
  const opportunities = Array.from({ length: counts.opportunities }, (_, index) =>
    createOpportunity(faker, index + idOffset),
  );
  const leads = Array.from({ length: counts.leads }, (_, index) =>
    createLead(faker, index + idOffset, contacts, opportunities),
  );
  const tasks = Array.from({ length: counts.tasks }, (_, index) =>
    createTask(faker, index + idOffset, leads, users),
  );
  const messages = Array.from({ length: counts.messages }, (_, index) =>
    createMessage(faker, index + idOffset, leads),
  );

  return { contacts, leads, opportunities, tasks, messages, users };
}

function createContact(faker: Faker, index: number): Record<string, unknown> {
  const id = 10_000 + index;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const createdDate = faker.date
    .between({ from: '2024-01-01T00:00:00.000Z', to: '2025-01-15T12:00:00.000Z' })
    .toISOString();
  return {
    Id: id,
    id,
    ContactId: id,
    contactId: id,
    FirstName: firstName,
    firstName,
    LastName: lastName,
    lastName,
    FullName: `${firstName} ${lastName}`,
    name: `${firstName} ${lastName}`,
    Email: faker.internet.email({ firstName, lastName, provider: 'example.test' }).toLowerCase(),
    MobilePhone: mockPhone(faker),
    City: faker.location.city(),
    State: faker.location.state({ abbreviated: true }),
    Zip: faker.location.zipCode(),
    Language: 'English',
    Code: `CONTACT-${id}`,
    CreatedDate: createdDate,
    createdDate,
  };
}

function createOpportunity(faker: Faker, index: number): Record<string, unknown> {
  const id = 30_000 + index;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const createdDate = faker.date
    .between({ from: '2024-06-01T00:00:00.000Z', to: '2025-01-15T12:00:00.000Z' })
    .toISOString();
  return {
    Id: id,
    id,
    OpportunityId: id,
    opportunityId: id,
    OpportunityName: `${firstName} ${lastName}`,
    name: `${firstName} ${lastName}`,
    FirstName: firstName,
    LastName: lastName,
    Email: faker.internet.email({ firstName, lastName, provider: 'example.test' }).toLowerCase(),
    MobilePhone: mockPhone(faker),
    Summary: faker.lorem.sentence(),
    MarketingSource: faker.helpers.arrayElement(['Example Website', 'Referral', 'Web Chat']),
    Status: 'Open',
    status: 'Open',
    Processed: false,
    processed: false,
    IsBeingEdited: false,
    OpportunityTypeId: faker.helpers.arrayElement(['WebForm', 'WebChat', 'ReferralForm']),
    CreatedDate: createdDate,
    createdDate,
  };
}

function createLead(
  faker: Faker,
  index: number,
  contacts: Array<Record<string, unknown>>,
  opportunities: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const id = 20_000 + index;
  const contact = contacts.length ? contacts[index % contacts.length] : createContact(faker, index);
  const opportunity = opportunities.length
    ? opportunities[index % opportunities.length]
    : undefined;
  const createdDate = faker.date
    .between({ from: '2024-06-01T00:00:00.000Z', to: '2025-01-15T12:00:00.000Z' })
    .toISOString();
  return {
    Id: id,
    id,
    LeadId: id,
    leadId: id,
    ContactId: contact.Id,
    OpportunityId: opportunity?.Id,
    FirstName: contact.FirstName,
    LastName: contact.LastName,
    Email: contact.Email,
    MobilePhone: contact.MobilePhone,
    CaseType: faker.helpers.arrayElement(['Example Case Type', 'Auto Accident', 'General Intake']),
    Status: faker.helpers.arrayElement(['New', 'Pending', 'Signed Up']),
    status: 'Open',
    Summary: faker.lorem.sentence(),
    MarketingSource: faker.helpers.arrayElement(['Example Website', 'Referral', 'Organic Search']),
    Code: `LEAD-${id}`,
    CreatedDate: createdDate,
    createdDate,
    LastStatusChangeDate: createdDate,
  };
}

function createTask(
  faker: Faker,
  index: number,
  leads: Array<Record<string, unknown>>,
  users: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const id = 40_000 + index;
  const lead = leads[index % Math.max(leads.length, 1)];
  const user = users[index % Math.max(users.length, 1)];
  const completed = faker.datatype.boolean({ probability: 0.25 });
  return {
    Id: id,
    id,
    LeadId: lead?.Id ?? 1,
    AssignedToId: user?.Id ?? 1,
    Name: faker.helpers.arrayElement([
      'Follow up with potential client',
      'Review intake details',
      'Request supporting documents',
    ]),
    Description: faker.lorem.sentence(),
    DueDate: faker.date.soon({ days: 30, refDate: '2025-01-15T12:00:00.000Z' }).toISOString(),
    Completed: completed,
    completed,
  };
}

function createMessage(
  faker: Faker,
  index: number,
  leads: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const id = 50_000 + index;
  const lead = leads[index % Math.max(leads.length, 1)];
  return {
    Id: id,
    id,
    LeadId: lead?.Id ?? 1,
    Subject: faker.helpers.arrayElement([
      'Following up on your inquiry',
      'Additional information requested',
      'Appointment confirmation',
    ]),
    Body: faker.lorem.paragraph(),
    SendFrom: 'intake@example.test',
    SendTo: typeof lead?.Email === 'string' ? lead.Email : 'client@example.test',
    CreatedOn: faker.date.recent({ days: 30, refDate: '2025-01-15T12:00:00.000Z' }).toISOString(),
    HasBeenSent: true,
  };
}

function createUser(faker: Faker, index: number): Record<string, unknown> {
  const id = 60_000 + index;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    Id: id,
    id,
    FirstName: firstName,
    LastName: lastName,
    Name: `${firstName} ${lastName}`,
    Email: faker.internet.email({ firstName, lastName, provider: 'example.test' }).toLowerCase(),
    Code: `USER-${id}`,
    Active: true,
  };
}

function mockPhone(faker: Faker): string {
  return `+1555${faker.string.numeric(7)}`;
}

function validateIdOffset(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 1_000_000) {
    throw new RangeError('idOffset must be an integer between 0 and 1000000.');
  }
  return value;
}

function validateCount(resource: string, value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > MAX_PER_RESOURCE) {
    throw new RangeError(`${resource} count must be an integer between 0 and ${MAX_PER_RESOURCE}.`);
  }
  return value;
}
