import { en, Faker } from '@faker-js/faker';

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

type GeneratedRecord = Record<string, unknown> & {
  Id: number;
  id: number;
};

export type GeneratedLeadDocketContact = GeneratedRecord & {
  ContactId: number;
  contactId: number;
  FirstName: string;
  firstName: string;
  LastName: string;
  lastName: string;
  FullName: string;
  name: string;
  Email: string;
  MobilePhone: string;
  CreatedDate: string;
  createdDate: string;
};

export type GeneratedLeadDocketOpportunity = GeneratedRecord & {
  OpportunityId: number;
  opportunityId: number;
  OpportunityName: string;
  name: string;
  FirstName: string;
  LastName: string;
  Email: string;
  MobilePhone: string;
  CreatedDate: string;
  createdDate: string;
};

export type GeneratedLeadDocketLead = GeneratedRecord & {
  LeadId: number;
  leadId: number;
  ContactId?: number;
  OpportunityId?: number;
  FirstName: string;
  LastName: string;
  Email: string;
  MobilePhone: string;
  CreatedDate: string;
  createdDate: string;
  LastStatusChangeDate: string;
};

export type GeneratedLeadDocketTask = GeneratedRecord & {
  LeadId?: number;
  AssignedToId?: number;
  Name: string;
  Description: string;
  DueDate: string;
  Completed: boolean;
  completed: boolean;
};

export type GeneratedLeadDocketMessage = GeneratedRecord & {
  LeadId?: number;
  Subject: string;
  Body: string;
  SendFrom: string;
  SendTo: string;
  CreatedOn: string;
  HasBeenSent: boolean;
};

export type GeneratedLeadDocketUser = GeneratedRecord & {
  FirstName: string;
  LastName: string;
  Name: string;
  Email: string;
  Code: string;
  Active: boolean;
};

/**
 * Generated relationships use an omission invariant: if a requested child has no generated
 * parent to reference, its foreign-key property is omitted rather than populated with a phantom ID.
 */
export type GeneratedLeadDocketMockData = {
  contacts: GeneratedLeadDocketContact[];
  leads: GeneratedLeadDocketLead[];
  opportunities: GeneratedLeadDocketOpportunity[];
  tasks: GeneratedLeadDocketTask[];
  messages: GeneratedLeadDocketMessage[];
  users: GeneratedLeadDocketUser[];
};

const MAX_PER_RESOURCE = 500;
const MAX_ID_OFFSET = 1_000_000;
const MAX_SEED = 0xffff_ffff;
const DEFAULT_SEED = 12_345;
const DEFAULT_REFERENCE_DATE = '2025-01-15T12:00:00.000Z';

const ID_BASES = {
  contact: 10_000,
  lead: 20_000,
  opportunity: 30_000,
  task: 40_000,
  message: 50_000,
  user: 60_000,
} as const;

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
  const seed = validateSeed(options.seed ?? DEFAULT_SEED);
  const idOffset = validateIdOffset(options.idOffset ?? 0);
  const referenceDate = validateReferenceDate(options.referenceDate ?? DEFAULT_REFERENCE_DATE);
  const faker = new Faker({ locale: [en] });
  faker.seed(seed);
  faker.setDefaultRefDate(referenceDate);

  const users = Array.from({ length: counts.users }, (_, index) =>
    createUser(faker, index + idOffset),
  );
  const contacts = Array.from({ length: counts.contacts }, (_, index) =>
    createContact(faker, index + idOffset, referenceDate),
  );
  const opportunities = Array.from({ length: counts.opportunities }, (_, index) =>
    createOpportunity(faker, index + idOffset, referenceDate),
  );
  const leads = Array.from({ length: counts.leads }, (_, index) =>
    createLead(faker, index + idOffset, contacts, opportunities, referenceDate),
  );
  const tasks = Array.from({ length: counts.tasks }, (_, index) =>
    createTask(faker, index + idOffset, leads, users, referenceDate),
  );
  const messages = Array.from({ length: counts.messages }, (_, index) =>
    createMessage(faker, index + idOffset, leads, referenceDate),
  );

  return { contacts, leads, opportunities, tasks, messages, users };
}

function createContact(
  faker: Faker,
  index: number,
  referenceDate: Date,
): GeneratedLeadDocketContact {
  const id = ID_BASES.contact + index;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const createdDate = faker.date.recent({ days: 380, refDate: referenceDate }).toISOString();
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

function createOpportunity(
  faker: Faker,
  index: number,
  referenceDate: Date,
): GeneratedLeadDocketOpportunity {
  const id = ID_BASES.opportunity + index;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const createdDate = faker.date.recent({ days: 230, refDate: referenceDate }).toISOString();
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
  contacts: GeneratedLeadDocketContact[],
  opportunities: GeneratedLeadDocketOpportunity[],
  referenceDate: Date,
): GeneratedLeadDocketLead {
  const id = ID_BASES.lead + index;
  const contact = contacts.length > 0 ? contacts[index % contacts.length] : undefined;
  const opportunity =
    opportunities.length > 0 ? opportunities[index % opportunities.length] : undefined;
  const firstName = contact?.FirstName ?? faker.person.firstName();
  const lastName = contact?.LastName ?? faker.person.lastName();
  const email =
    contact?.Email ??
    faker.internet.email({ firstName, lastName, provider: 'example.test' }).toLowerCase();
  const mobilePhone = contact?.MobilePhone ?? mockPhone(faker);
  const createdDate = faker.date.recent({ days: 230, refDate: referenceDate }).toISOString();
  return {
    Id: id,
    id,
    LeadId: id,
    leadId: id,
    ...(contact ? { ContactId: contact.Id } : {}),
    ...(opportunity ? { OpportunityId: opportunity.Id } : {}),
    FirstName: firstName,
    LastName: lastName,
    Email: email,
    MobilePhone: mobilePhone,
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
  leads: GeneratedLeadDocketLead[],
  users: GeneratedLeadDocketUser[],
  referenceDate: Date,
): GeneratedLeadDocketTask {
  const id = ID_BASES.task + index;
  const lead = leads.length > 0 ? leads[index % leads.length] : undefined;
  const user = users.length > 0 ? users[index % users.length] : undefined;
  const completed = faker.datatype.boolean({ probability: 0.25 });
  return {
    Id: id,
    id,
    ...(lead ? { LeadId: lead.Id } : {}),
    ...(user ? { AssignedToId: user.Id } : {}),
    Name: faker.helpers.arrayElement([
      'Follow up with potential client',
      'Review intake details',
      'Request supporting documents',
    ]),
    Description: faker.lorem.sentence(),
    DueDate: faker.date.soon({ days: 30, refDate: referenceDate }).toISOString(),
    Completed: completed,
    completed,
  };
}

function createMessage(
  faker: Faker,
  index: number,
  leads: GeneratedLeadDocketLead[],
  referenceDate: Date,
): GeneratedLeadDocketMessage {
  const id = ID_BASES.message + index;
  const lead = leads.length > 0 ? leads[index % leads.length] : undefined;
  return {
    Id: id,
    id,
    ...(lead ? { LeadId: lead.Id } : {}),
    Subject: faker.helpers.arrayElement([
      'Following up on your inquiry',
      'Additional information requested',
      'Appointment confirmation',
    ]),
    Body: faker.lorem.paragraph(),
    SendFrom: 'intake@example.test',
    SendTo: lead?.Email ?? 'client@example.test',
    CreatedOn: faker.date.recent({ days: 30, refDate: referenceDate }).toISOString(),
    HasBeenSent: true,
  };
}

function createUser(faker: Faker, index: number): GeneratedLeadDocketUser {
  const id = ID_BASES.user + index;
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

function validateSeed(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_SEED) {
    throw new RangeError(`seed must be an integer between 0 and ${MAX_SEED}.`);
  }
  return value;
}

function validateIdOffset(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_ID_OFFSET) {
    throw new RangeError(`idOffset must be an integer between 0 and ${MAX_ID_OFFSET}.`);
  }
  return value;
}

function validateCount(resource: string, value: number): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > MAX_PER_RESOURCE) {
    throw new RangeError(`${resource} count must be an integer between 0 and ${MAX_PER_RESOURCE}.`);
  }
  return value;
}

function validateReferenceDate(value: string | Date): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError('referenceDate must be a valid date.');
  }
  return date;
}
