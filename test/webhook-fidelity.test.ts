/// <reference types="node" />

import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vite-plus/test';
import {
  operationToWebhookKind,
  projectWebhook,
  webhookCatalog,
  webhookKinds,
  type WebhookKind,
  type WebhookProjectionFacts,
} from '../src/mock/webhook-payloads';

type ExampleIndex = {
  examples: Array<{ id: string; eventType: string; file: string }>;
};

const timestamp = '2025-01-15T12:00:00.000Z';

const contact = {
  Id: 1001,
  FirstName: 'Ada',
  MiddleName: null,
  LastName: 'Lovelace',
  Address1: null,
  Address2: null,
  City: null,
  County: null,
  State: 'Example value',
  Zip: null,
  Code: null,
  Birthdate: null,
  Email: null,
  Deceased: false,
  Minor: false,
  Gender: null,
  HomePhone: '+15550100001',
  WorkPhone: '+15550100001',
  MobilePhone: '+15550100001',
  Language: 'English',
  CreatedOn: timestamp,
  CreatedBy: 'Mock User',
  CustomFields: [
    {
      CustomFieldId: 101,
      Name: 'Does PC have an Emergency Contact listed?',
      Value: 'Example value',
    },
  ],
};

const opportunity = {
  Id: 3001,
  Name: 'Mock Opportunity',
  FirstName: 'Ada',
  MiddleName: null,
  LastName: 'Lovelace',
  Address1: null,
  Address2: null,
  City: null,
  County: null,
  State: null,
  Zip: null,
  Code: null,
  Birthdate: null,
  Email: null,
  Gender: null,
  HomePhone: null,
  WorkPhone: null,
  MobilePhone: '+15550100001',
  Language: null,
  CreatedDate: timestamp,
  ProcessedDate: timestamp,
  ProcessedByName: 'Mock User',
  DisregardReason: 'Duplicate test submission',
  SeverityLevelId: null,
  Summary: 'Fictional case summary for webhook testing.',
  InjuryInformation: null,
  ReferredBy: null,
  MarketingSource: 'Example Website',
  MarketingSourceDetails: 'Example Website',
  UTM: 'utm_source=example',
  Campaign: 'Example Campaign',
  ContactSource: 'Web Form',
  LeadId: 2001,
  CustomFields: [
    { Name: 'Call Type: - old', Value: 'Example value' },
    { Name: 'Duration:', Value: 'Example value' },
  ],
};

const lead = {
  Id: 2001,
  Code: null,
  Contact: contact,
  Opportunity: opportunity,
  PracticeArea: { Name: 'Example Case Type', Code: 'Example Case Type' },
  Status: 'New',
  SubStatus: 'New',
  SeverityLevel: 'Example value',
  SeverityLevelId: 1,
  Summary: 'Fictional case summary for webhook testing.',
  InjuryInformation: null,
  Office: 'Main Office',
  MarketingSource: 'Example Website',
  MarketingSourceDetails: 'Example Website',
  UTM: 'utm_source=example',
  Campaign: 'Example Campaign',
  ContactSource: 'Web Form',
  CreatedDate: timestamp,
  LastStatusChangeDate: timestamp,
  IncidentDate: timestamp,
  Intake: { Name: 'Mock Intake Team', Code: null, Email: 'intake@example.test' },
  Creator: { Name: 'Mock Creator', Code: null, Email: 'creator@example.test' },
  PhoneCall: {
    RecordingURL: '+15550100001',
    Duration: 100,
    FromNumber: '+15550100001',
    ToNumber: '+15550100002',
    Date: timestamp,
    Summary: null,
    Transcript: '+15550100001',
  },
  CustomFields: [{ Name: 'Rejected Deep Dive', Value: 'Example value' }],
};

const message = {
  Id: 4001,
  CreatedOn: timestamp,
  Subject: 'Example inbound message',
  SendTo: 'ada@example.test',
  SendFrom: 'ada@example.test',
  SendFromName: 'ada@example.test',
};

const keyFields: Record<WebhookKind, readonly string[]> = {
  'contact-added': [
    'EventType',
    'EventTypeId',
    'EventByUser',
    'ContactId',
    'ContactFullName',
    'ContactMobilePhone',
    'Does PC have an Emergency Contact listed?',
  ],
  'contact-edited': [
    'EventType',
    'EventTypeId',
    'EventByUser',
    'ContactId',
    'ContactFirstName',
    'ContactCreatedDate',
  ],
  'data-sync-completed': [
    'EventType',
    'EventTypeId',
    'FileName',
    'ReportName',
    'ReportId',
    'CompletedDate',
    'Duration',
  ],
  'email-received': [
    'EventType',
    'EventTypeId',
    'ContactFullName',
    'LeadDocketLeadId',
    'MessageId',
    'MessageSubject',
    'LeadIntakeEmail',
  ],
  'file-uploaded': [
    'EventType',
    'EventTypeId',
    'ContactId',
    'LeadId',
    'FileName',
    'Extension',
    'FileUrl',
    'FileCategory',
  ],
  'lead-created': [
    'EventType',
    'EventTypeId',
    'EventByUser',
    'ContactId',
    'LeadId',
    'OpportunityId',
    'LeadStatus',
    'LeadSummary',
    'Rejected Deep Dive',
  ],
  'lead-edited': [
    'EventType',
    'EventTypeId',
    'EventByUser',
    'LeadId',
    'LeadCaseType',
    'LeadSubstatus',
    'LeadIntakeName',
    'PhoneCallDuration',
  ],
  'lead-sent-to-external-system': ['EventType', 'EventTypeId', 'EventByUser', 'Id', 'Code'],
  'lead-status-changed': [
    'EventType',
    'EventTypeId',
    'EventByUser',
    'LeadId',
    'LeadStatus',
    'LastStatusChangeDate',
  ],
  'note-added': [
    'EventType',
    'EventTypeId',
    'EventByUser',
    'ContactId',
    'LeadId',
    'NoteSummary',
    'Note',
    'NoteEventType',
  ],
  'opportunity-converted-to-lead': [
    'EventType',
    'EventTypeId',
    'LeadId',
    'OpportunityId',
    'OpportunityName',
    'ProcessedBy',
    'DisregardReason',
  ],
  'opportunity-created': [
    'EventType',
    'EventTypeId',
    'OpportunityId',
    'OpportunityName',
    'FirstName',
    'MobilePhone',
    'CreatedDate',
    'Call Type: - old',
  ],
  'opportunity-disregarded': [
    'EventType',
    'EventTypeId',
    'OpportunityId',
    'OpportunityName',
    'ProcessedDate',
    'ProcessedBy',
    'DisregardReason',
    'ContactSource',
  ],
  'tag-added-to-contact': ['EventType', 'EventTypeId', 'ContactId', 'ContactFullName', 'Tag'],
  'text-received': [
    'EventType',
    'EventTypeId',
    'ContactFullName',
    'LeadDocketLeadId',
    'MessageId',
    'MessageSendFrom',
    'LeadCreatorEmail',
  ],
};

function factsFor(kind: WebhookKind): WebhookProjectionFacts {
  const common = { eventByUser: 'Mock User' };
  switch (kind) {
    case 'contact-added':
    case 'contact-edited':
      return { ...common, contact };
    case 'tag-added-to-contact':
      return { contact, tag: { TagText: 'Example Tag' } };
    case 'lead-created':
    case 'lead-edited':
    case 'lead-status-changed':
      return { ...common, contact, lead, opportunity };
    case 'note-added':
      return {
        ...common,
        contact,
        lead,
        note: {
          Summary: 'Fictional case summary for webhook testing.',
          Text: 'Fictional note with no personal information.',
          EventType: 1,
          CreatedBy: 'Mock User',
          CreatedOn: timestamp,
        },
      };
    case 'file-uploaded':
      return {
        contact,
        lead,
        file: {
          FileName: 'example-document.pdf',
          Extension: '.png',
          Url: 'https://files.example.test/mock/example-document.pdf',
          Category: 'Documents',
        },
      };
    case 'email-received':
    case 'text-received':
      return { contact, lead, message };
    case 'opportunity-created':
    case 'opportunity-disregarded':
    case 'opportunity-converted-to-lead':
      return { opportunity };
    case 'lead-sent-to-external-system':
      return {
        eventByUser: null,
        externalSystem: { Id: 9007, Code: 'MOCK-CODE' },
      };
    case 'data-sync-completed':
      return {
        dataSync: {
          FileName: 'example-document.pdf',
          ReportName: 'Example Data Sync Report',
          ReportId: 5001,
          CompletedDate: timestamp,
          Duration: 637.677,
        },
      };
  }
}

function select(source: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(keys.map((key) => [key, source[key]]));
}

describe('Lead Docket webhook fidelity', () => {
  it('catalogs the EventType and EventTypeId of all 15 sanitized examples', async () => {
    const index = JSON.parse(
      await readFile('examples/webhooks/index.json', 'utf8'),
    ) as ExampleIndex;

    expect(webhookKinds).toHaveLength(15);
    expect(index.examples.map(({ id }) => id)).toEqual([...webhookKinds]);

    for (const example of index.examples) {
      const kind = example.id as WebhookKind;
      const fixture = JSON.parse(
        await readFile(`examples/webhooks/${example.file}`, 'utf8'),
      ) as Record<string, unknown>;

      expect(webhookCatalog[kind]).toMatchObject({
        eventType: example.eventType,
        eventTypeId: fixture.EventTypeId,
      });
    }
  });

  it('maps every declared operationId and concrete path to its webhook kind', () => {
    for (const kind of webhookKinds) {
      for (const operation of webhookCatalog[kind].operations) {
        expect(operationToWebhookKind(operation.operationId), operation.operationId).toBe(kind);
        expect(
          operationToWebhookKind({
            method: operation.method,
            path: operation.path.replaceAll(/\{[^}]+\}/g, '123'),
          }),
          `${operation.method} ${operation.path}`,
        ).toBe(kind);
      }
    }

    expect(operationToWebhookKind('contacts_getById')).toBeUndefined();
    expect(operationToWebhookKind({ method: 'GET', path: '/api/contacts/123' })).toBeUndefined();
  });

  it('projects representative wire keys for every sanitized example', async () => {
    const index = JSON.parse(
      await readFile('examples/webhooks/index.json', 'utf8'),
    ) as ExampleIndex;

    for (const example of index.examples) {
      const kind = example.id as WebhookKind;
      const fixture = JSON.parse(
        await readFile(`examples/webhooks/${example.file}`, 'utf8'),
      ) as Record<string, unknown>;
      const projected = projectWebhook(kind, factsFor(kind));
      const keys = keyFields[kind];

      expect(select(projected.payload, keys), kind).toEqual(select(fixture, keys));
      expect(projected.payload, kind).not.toHaveProperty('Contact');
      expect(projected.payload, kind).not.toHaveProperty('CustomFields');
    }
  });

  it('keeps observability metadata out of the outbound wire payload', () => {
    const projected = projectWebhook('contact-added', {
      contact,
      observability: {
        eventId: 'wh_1000',
        apiCallDriven: true,
        operationId: 'contacts_add',
        method: 'POST',
        path: '/api/contacts',
        occurredAt: timestamp,
      },
    });

    expect(projected.observability).toMatchObject({
      kind: 'contact-added',
      eventId: 'wh_1000',
      operationId: 'contacts_add',
      path: '/api/contacts',
    });
    expect(projected.payload).not.toHaveProperty('kind');
    expect(projected.payload).not.toHaveProperty('eventId');
    expect(projected.payload).not.toHaveProperty('operationId');
    expect(projected.payload).not.toHaveProperty('path');
    expect(projected.payload).not.toHaveProperty('hostname');
    expect(projected.payload).not.toHaveProperty('_request_path');
    expect(projected.payload).not.toHaveProperty('_request_type_param');
  });

  it('flattens record and explicit custom fields without replacing contract keys', () => {
    const projected = projectWebhook('lead-edited', {
      lead: {
        ...lead,
        CustomFields: [
          { Name: 'Estimated Case Value', Value: '7500' },
          { Name: 'EventType', Value: 'Not the event type' },
        ],
      },
      customFields: {
        'Referral Qualified': true,
        'Estimated Case Value': '9000',
      },
    });

    expect(projected.payload).toMatchObject({
      EventType: 'Lead Edited',
      EventTypeId: 2,
      'Estimated Case Value': '9000',
      'Referral Qualified': true,
    });
    expect(projected.payload).not.toHaveProperty('CustomFields');
  });
});
