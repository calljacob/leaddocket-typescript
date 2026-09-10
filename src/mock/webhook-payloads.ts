import { webhookPayloadTemplates } from './webhook-templates.gen';

export const webhookKinds = [
  'contact-added',
  'contact-edited',
  'data-sync-completed',
  'email-received',
  'file-uploaded',
  'lead-created',
  'lead-edited',
  'lead-sent-to-external-system',
  'lead-status-changed',
  'note-added',
  'opportunity-converted-to-lead',
  'opportunity-created',
  'opportunity-disregarded',
  'tag-added-to-contact',
  'text-received',
] as const;

export type WebhookKind = (typeof webhookKinds)[number];

export type WebhookOperationMapping = {
  operationId: string;
  method: string;
  path: string;
};

export type WebhookCatalogEntry = {
  eventType: string;
  eventTypeId: number;
  operations: readonly WebhookOperationMapping[];
};

export const webhookCatalog: Readonly<Record<WebhookKind, WebhookCatalogEntry>> = {
  'contact-added': {
    eventType: 'Contact Added',
    eventTypeId: 6,
    operations: [{ operationId: 'contacts_add', method: 'POST', path: '/api/contacts' }],
  },
  'contact-edited': {
    eventType: 'Contact Edited',
    eventTypeId: 7,
    operations: [
      { operationId: 'contacts_update', method: 'PUT', path: '/api/contacts/{id}' },
      { operationId: 'contacts_updatecode', method: 'PUT', path: '/api/contacts/updatecode' },
      {
        operationId: 'contacts_putUpdateCustomFields',
        method: 'PATCH',
        path: '/api/contacts/updatecustomfields',
      },
    ],
  },
  'data-sync-completed': {
    eventType: 'Data Sync Completed',
    eventTypeId: 29,
    operations: [],
  },
  'email-received': { eventType: 'Email Received', eventTypeId: 12, operations: [] },
  'file-uploaded': {
    eventType: 'File Uploaded',
    eventTypeId: 15,
    operations: [
      {
        operationId: 'post /api/leads/{id}/files/upload',
        method: 'POST',
        path: '/api/leads/{id}/files/upload',
      },
      {
        operationId: 'post /api/leads/{id}/files/{fileId}finalizeupload',
        method: 'POST',
        path: '/api/leads/{id}/files/{fileId}finalizeupload',
      },
    ],
  },
  'lead-created': { eventType: 'Lead Created', eventTypeId: 1, operations: [] },
  'lead-edited': {
    eventType: 'Lead Edited',
    eventTypeId: 2,
    operations: [
      { operationId: 'Lead_Update', method: 'PATCH', path: '/api/leads/{id}' },
      { operationId: 'leads_putUpdateCode', method: 'PUT', path: '/api/leads/updatecode' },
      {
        operationId: 'leads_putUpdateCustomField',
        method: 'PUT',
        path: '/api/leads/updatecustomfield',
      },
      {
        operationId: 'leads_putUpdateCustomFields',
        method: 'PATCH',
        path: '/api/leads/updatecustomfields',
      },
    ],
  },
  'lead-sent-to-external-system': {
    eventType: 'Lead Sent to External System',
    eventTypeId: 25,
    operations: [
      {
        operationId: 'leads_putMarkAsProcessed',
        method: 'PUT',
        path: '/api/leads/markasprocessed',
      },
    ],
  },
  'lead-status-changed': {
    eventType: 'Lead Status Changed',
    eventTypeId: 3,
    operations: [
      {
        operationId: 'patch /api/leads/{id}/status/change',
        method: 'PATCH',
        path: '/api/leads/{id}/status/change',
      },
      {
        operationId: 'patch /api/leads/{id}/substatus/advance',
        method: 'PATCH',
        path: '/api/leads/{id}/substatus/advance',
      },
    ],
  },
  'note-added': {
    eventType: 'Note Added',
    eventTypeId: 4,
    operations: [
      {
        operationId: 'post /api/leads/{id}/notes',
        method: 'POST',
        path: '/api/leads/{id}/notes',
      },
    ],
  },
  'opportunity-converted-to-lead': {
    eventType: 'Opportunity Converted To Lead',
    eventTypeId: 19,
    operations: [],
  },
  'opportunity-created': {
    eventType: 'Opportunity Created',
    eventTypeId: 10,
    operations: [
      {
        operationId: 'integrationForm.submit',
        method: 'POST',
        path: '/opportunities/form/{id}',
      },
      {
        operationId: 'integrationForm.submit',
        method: 'POST',
        path: '/opportunities/formjson/{id}',
      },
      {
        operationId: 'integrationForm.submit',
        method: 'POST',
        path: '/opportunities/formjsonnested/{id}',
      },
      { operationId: 'integrationForm.submit', method: 'POST', path: '/formjson/{id}' },
      { operationId: 'integrationForm.submit', method: 'POST', path: '/formjsonnested/{id}' },
    ],
  },
  'opportunity-disregarded': {
    eventType: 'Opportunity Disregarded',
    eventTypeId: 20,
    operations: [
      {
        operationId: 'opportunities_Disregard',
        method: 'PATCH',
        path: '/api/opportunities/disregard',
      },
    ],
  },
  'tag-added-to-contact': {
    eventType: 'Tag Added To Contact',
    eventTypeId: 8,
    operations: [
      {
        operationId: 'contacts_addTag',
        method: 'PUT',
        path: '/api/contacts/{id}/tags/{tagId}',
      },
    ],
  },
  'text-received': { eventType: 'Text Received', eventTypeId: 11, operations: [] },
};

export type WebhookRecord = Readonly<Record<string, unknown>>;

export type WebhookCustomFields = WebhookRecord | readonly WebhookRecord[] | null | undefined;

export type WebhookObservabilityInput = {
  eventId?: string;
  apiCallDriven?: boolean;
  operationId?: string;
  method?: string;
  path?: string;
  occurredAt?: string;
};

export type WebhookProjectionFacts = {
  hostname?: string;
  record?: WebhookRecord | null;
  contact?: WebhookRecord | null;
  lead?: WebhookRecord | null;
  opportunity?: WebhookRecord | null;
  message?: WebhookRecord | null;
  file?: WebhookRecord | null;
  note?: WebhookRecord | null;
  dataSync?: WebhookRecord | null;
  externalSystem?: WebhookRecord | null;
  tag?: string | WebhookRecord | null;
  eventByUser?: unknown;
  customFields?: WebhookCustomFields;
  observability?: WebhookObservabilityInput;
};

export type LeadDocketWebhookPayload = Record<string, unknown> & {
  EventType: string;
  EventTypeId: number;
};

export type ProjectedWebhook = {
  payload: LeadDocketWebhookPayload;
  observability: WebhookObservabilityInput & {
    kind: WebhookKind;
    eventType: string;
    eventTypeId: number;
  };
};

export type WebhookOperation = {
  operationId?: string;
  method?: string;
  path?: string;
};

export function operationToWebhookKind(operationId: string, path?: string): WebhookKind | undefined;
export function operationToWebhookKind(operation: WebhookOperation): WebhookKind | undefined;
export function operationToWebhookKind(
  operation: string | WebhookOperation,
  path?: string,
): WebhookKind | undefined {
  const candidate: WebhookOperation =
    typeof operation === 'string' ? { operationId: operation, path } : operation;
  const operationId = candidate.operationId?.toLowerCase();
  const method = candidate.method?.toUpperCase();

  for (const kind of webhookKinds) {
    for (const mapping of webhookCatalog[kind].operations) {
      if (operationId && mapping.operationId.toLowerCase() === operationId) {
        return kind;
      }
      if (
        candidate.path &&
        (!method || mapping.method === method) &&
        pathMatches(mapping.path, candidate.path)
      ) {
        return kind;
      }
    }
  }

  return undefined;
}

export function projectWebhook(
  kind: WebhookKind,
  facts: WebhookProjectionFacts = {},
): ProjectedWebhook {
  const catalog = webhookCatalog[kind];
  const records = resolveRecords(kind, facts);
  const payload: LeadDocketWebhookPayload = {
    ...webhookPayloadTemplates[kind],
    hostname: facts.hostname ?? 'mock.leaddocket.local',
    EventType: catalog.eventType,
    EventTypeId: catalog.eventTypeId,
  };

  if (includesEventByUser(kind)) {
    payload.EventByUser = firstValue(
      facts.eventByUser,
      read(records.record, 'EventByUser'),
      read(records.lead, 'EventByUser'),
      read(records.contact, 'EventByUser'),
      read(records.opportunity, 'EventByUser'),
      null,
    );
  }

  switch (kind) {
    case 'contact-added':
    case 'contact-edited':
      projectContact(payload, records.contact, 'standard');
      break;
    case 'tag-added-to-contact':
      projectContact(payload, records.contact, 'standard');
      put(payload, 'Tag', tagValue(facts.tag ?? records.record));
      break;
    case 'lead-created':
      projectContact(payload, records.contact, 'lead');
      projectLead(payload, records.lead);
      projectLeadOpportunity(payload, records.opportunity);
      break;
    case 'lead-edited':
    case 'lead-status-changed':
      projectContact(payload, records.contact, 'lead');
      projectLead(payload, records.lead);
      break;
    case 'note-added':
      projectContact(payload, records.contact, 'standard');
      projectLeadSummary(payload, records.lead);
      projectNote(payload, records.note);
      break;
    case 'file-uploaded':
      projectContact(payload, records.contact, 'identity');
      projectLeadSummary(payload, records.lead, true);
      projectFile(payload, records.file);
      break;
    case 'text-received':
    case 'email-received':
      projectContact(payload, records.contact, 'message');
      projectInboundMessage(payload, records.lead, records.message, kind === 'email-received');
      break;
    case 'opportunity-created':
    case 'opportunity-disregarded':
    case 'opportunity-converted-to-lead':
      projectOpportunity(payload, records.opportunity, kind);
      break;
    case 'lead-sent-to-external-system':
      copyFields(payload, records.externalSystem, [
        ['Id', 'Id', 'id', 'LeadId', 'leadId'],
        ['Code', 'Code', 'code'],
      ]);
      break;
    case 'data-sync-completed':
      copyFields(payload, records.dataSync, [
        ['FileName', 'FileName', 'fileName'],
        ['ReportName', 'ReportName', 'reportName'],
        ['ReportId', 'ReportId', 'reportId', 'Id', 'id'],
        ['CompletedDate', 'CompletedDate', 'completedDate'],
        ['Duration', 'Duration', 'duration'],
      ]);
      break;
  }

  flattenCustomFields(payload, [
    customFieldsOf(records.contact),
    customFieldsOf(records.lead),
    customFieldsOf(records.opportunity),
    facts.customFields,
  ]);

  return {
    payload,
    observability: {
      kind,
      eventType: catalog.eventType,
      eventTypeId: catalog.eventTypeId,
      ...facts.observability,
    },
  };
}

type ResolvedRecords = {
  record?: WebhookRecord;
  contact?: WebhookRecord;
  lead?: WebhookRecord;
  opportunity?: WebhookRecord;
  message?: WebhookRecord;
  file?: WebhookRecord;
  note?: WebhookRecord;
  dataSync?: WebhookRecord;
  externalSystem?: WebhookRecord;
};

type OutputField = readonly [output: string, ...sources: string[]];

const CONTACT_FIELDS: readonly OutputField[] = [
  ['ContactId', 'ContactId', 'contactId', 'Id', 'id'],
  ['ContactFirstName', 'ContactFirstName', 'FirstName', 'firstName'],
  ['ContactMiddleName', 'ContactMiddleName', 'MiddleName', 'middleName'],
  ['ContactLastName', 'ContactLastName', 'LastName', 'lastName'],
  ['ContactFullName', 'ContactFullName', 'FullName', 'fullName', 'Name', 'name'],
  ['ContactAddress1', 'ContactAddress1', 'Address1', 'address1'],
  ['ContactAddress2', 'ContactAddress2', 'Address2', 'address2'],
  ['ContactCity', 'ContactCity', 'City', 'city'],
  ['ContactCounty', 'ContactCounty', 'County', 'county'],
  ['ContactState', 'ContactState', 'State', 'state'],
  ['ContactZip', 'ContactZip', 'Zip', 'zip'],
  ['ContactCode', 'ContactCode', 'Code', 'code'],
  ['ContactBirthdate', 'ContactBirthdate', 'Birthdate', 'birthdate'],
  ['ContactEmail', 'ContactEmail', 'Email', 'email'],
  ['ContactDeceased', 'ContactDeceased', 'Deceased', 'deceased'],
  ['ContactMinor', 'ContactMinor', 'Minor', 'minor'],
  ['ContactGender', 'ContactGender', 'Gender', 'gender'],
  ['ContactHomePhone', 'ContactHomePhone', 'HomePhone', 'homePhone', 'Phone', 'phone'],
  ['ContactWorkPhone', 'ContactWorkPhone', 'WorkPhone', 'workPhone'],
  ['ContactMobilePhone', 'ContactMobilePhone', 'MobilePhone', 'mobilePhone', 'Phone', 'phone'],
  ['ContactLanguage', 'ContactLanguage', 'Language', 'language'],
  ['ContactCreatedDate', 'ContactCreatedDate', 'CreatedDate', 'CreatedOn', 'createdDate'],
  ['ContactCreatedBy', 'ContactCreatedBy', 'CreatedBy', 'createdBy'],
];

const LEAD_FIELDS: readonly OutputField[] = [
  ['LeadId', 'LeadId', 'leadId', 'Id', 'id'],
  ['LeadCode', 'LeadCode', 'Code', 'code'],
  [
    'LeadCaseType',
    'LeadCaseType',
    'CaseType',
    'caseType',
    'PracticeArea.Name',
    'PracticeArea.name',
  ],
  ['LeadCaseTypeCode', 'LeadCaseTypeCode', 'CaseTypeCode', 'caseTypeCode', 'PracticeArea.Code'],
  ['LeadStatus', 'LeadStatus', 'Status', 'status', 'StatusName'],
  ['LeadSubstatus', 'LeadSubstatus', 'SubStatus', 'subStatus', 'SubStatusName'],
  ['LeadSeverityLevel', 'LeadSeverityLevel', 'SeverityLevel', 'severityLevel'],
  ['LeadSeverityLevelId', 'LeadSeverityLevelId', 'SeverityLevelId', 'severityLevelId'],
  ['LeadSummary', 'LeadSummary', 'Summary', 'summary'],
  ['LeadInjuryInformation', 'LeadInjuryInformation', 'InjuryInformation', 'injuryInformation'],
  ['OfficeName', 'OfficeName', 'Office', 'office'],
  [
    'LeadMarketingSource',
    'LeadMarketingSource',
    'MarketingSource',
    'marketingSource',
    'Source',
    'source',
  ],
  ['LeadMarketingSourceDetails', 'LeadMarketingSourceDetails', 'MarketingSourceDetails'],
  ['ReferringUrl', 'ReferringUrl', 'referringUrl'],
  ['CurrentUrl', 'CurrentUrl', 'currentUrl'],
  ['UTM', 'UTM', 'utm'],
  ['ClientId', 'ClientId', 'clientId'],
  ['ClickId', 'ClickId', 'clickId'],
  ['Keywords', 'Keywords', 'keywords'],
  ['Campaign', 'Campaign', 'campaign'],
  ['LeadContactSource', 'LeadContactSource', 'ContactSource', 'contactSource'],
  ['LeadCreatedDate', 'LeadCreatedDate', 'CreatedDate', 'CreatedOn', 'createdDate'],
  ['LastStatusChangeDate', 'LastStatusChangeDate', 'lastStatusChangeDate'],
  ['LeadIncidentDate', 'LeadIncidentDate', 'IncidentDate', 'incidentDate'],
  ['LeadIncidentDateWithTime', 'LeadIncidentDateWithTime', 'IncidentDateWithTime'],
  ['Files', 'Files', 'files'],
];

const OPPORTUNITY_FIELDS: readonly OutputField[] = [
  ['OpportunityId', 'OpportunityId', 'opportunityId', 'Id', 'id'],
  ['OpportunityName', 'OpportunityName', 'Name', 'name'],
  ['FirstName', 'FirstName', 'firstName'],
  ['MiddleName', 'MiddleName', 'middleName'],
  ['LastName', 'LastName', 'lastName'],
  ['Address1', 'Address1', 'address1'],
  ['Address2', 'Address2', 'address2'],
  ['City', 'City', 'city'],
  ['County', 'County', 'county'],
  ['State', 'State', 'state'],
  ['Zip', 'Zip', 'zip'],
  ['Code', 'Code', 'code'],
  ['Birthdate', 'Birthdate', 'birthdate'],
  ['Email', 'Email', 'email'],
  ['Gender', 'Gender', 'gender'],
  ['HomePhone', 'HomePhone', 'homePhone'],
  ['WorkPhone', 'WorkPhone', 'workPhone'],
  ['MobilePhone', 'MobilePhone', 'mobilePhone', 'Phone', 'phone'],
  ['Language', 'Language', 'language'],
  ['CreatedDate', 'CreatedDate', 'CreatedOn', 'createdDate'],
  ['ProcessedDate', 'ProcessedDate', 'processedDate'],
  ['ProcessedBy', 'ProcessedByName', 'ProcessedBy.Name', 'processedBy'],
  ['DisregardReason', 'DisregardReason', 'disregardReason'],
  ['SeverityLevelId', 'SeverityLevelId', 'SeverityLevel', 'severityLevelId'],
  ['Summary', 'Summary', 'summary'],
  ['InjuryInformation', 'InjuryInformation', 'injuryInformation'],
  ['ReferredBy', 'ReferredBy.Name', 'ReferredBy', 'referredBy'],
  ['MarketingSource', 'MarketingSource', 'marketingSource'],
  ['MarketingSourceDetails', 'MarketingSourceDetails', 'marketingSourceDetails'],
  ['ReferringUrl', 'ReferringUrl', 'referringUrl'],
  ['CurrentUrl', 'CurrentUrl', 'currentUrl'],
  ['UTM', 'UTM', 'utm'],
  ['ClientId', 'ClientId', 'clientId'],
  ['ClickId', 'ClickId', 'clickId'],
  ['Keywords', 'Keywords', 'keywords'],
  ['Campaign', 'Campaign', 'campaign'],
  ['ContactSource', 'ContactSource', 'contactSource'],
];

function resolveRecords(kind: WebhookKind, facts: WebhookProjectionFacts): ResolvedRecords {
  const record = asRecord(facts.record);
  const lead = asRecord(facts.lead) ?? (isLeadKind(kind) ? record : undefined);
  const opportunity =
    asRecord(facts.opportunity) ??
    asRecord(read(lead, 'Opportunity')) ??
    (isOpportunityKind(kind) ? record : undefined);
  const contact =
    asRecord(facts.contact) ??
    asRecord(read(lead, 'Contact')) ??
    (isContactKind(kind) ? record : undefined);

  return {
    record,
    contact,
    lead,
    opportunity,
    message: asRecord(facts.message) ?? (kind.endsWith('-received') ? record : undefined),
    file: asRecord(facts.file) ?? (kind === 'file-uploaded' ? record : undefined),
    note: asRecord(facts.note) ?? (kind === 'note-added' ? record : undefined),
    dataSync: asRecord(facts.dataSync) ?? (kind === 'data-sync-completed' ? record : undefined),
    externalSystem:
      asRecord(facts.externalSystem) ??
      (kind === 'lead-sent-to-external-system' ? (record ?? lead) : undefined),
  };
}

function projectContact(
  payload: Record<string, unknown>,
  contact: WebhookRecord | undefined,
  mode: 'standard' | 'lead' | 'message' | 'identity',
): void {
  const fields =
    mode === 'message'
      ? CONTACT_FIELDS.filter(([key]) =>
          [
            'ContactFirstName',
            'ContactMiddleName',
            'ContactLastName',
            'ContactFullName',
            'ContactHomePhone',
            'ContactWorkPhone',
            'ContactMobilePhone',
            'ContactLanguage',
          ].includes(key),
        )
      : mode === 'identity'
        ? CONTACT_FIELDS.filter(([key]) =>
            [
              'ContactId',
              'ContactFirstName',
              'ContactMiddleName',
              'ContactLastName',
              'ContactFullName',
            ].includes(key),
          )
        : CONTACT_FIELDS;

  copyFields(payload, contact, fields);
  deriveFullName(payload, 'ContactFullName', payload.ContactFirstName, payload.ContactLastName);

  if (mode === 'lead') {
    copyFields(payload, contact, [
      ['ContactPreferredContactMethod', 'ContactPreferredContactMethod', 'PreferredContactMethod'],
      ['ContactTimezone', 'ContactTimezone', 'Timezone', 'timezone'],
      ['ContactNotes', 'ContactNotes', 'Notes', 'notes'],
    ]);
  }
}

function projectLead(payload: Record<string, unknown>, lead: WebhookRecord | undefined): void {
  copyFields(payload, lead, LEAD_FIELDS);
  projectUser(payload, 'LeadIntake', lead, 'Intake');
  projectUser(payload, 'LeadCreator', lead, 'Creator');
  projectPhoneCall(payload, lead);
}

function projectLeadSummary(
  payload: Record<string, unknown>,
  lead: WebhookRecord | undefined,
  includeCaseType = false,
): void {
  copyFields(payload, lead, [
    ['LeadId', 'LeadId', 'leadId', 'Id', 'id'],
    ['LeadCode', 'LeadCode', 'Code', 'code'],
    ...(includeCaseType
      ? ([
          ['LeadCaseType', 'LeadCaseType', 'CaseType', 'PracticeArea.Name'],
          ['LeadCaseTypeCode', 'LeadCaseTypeCode', 'CaseTypeCode', 'PracticeArea.Code'],
        ] as const)
      : ([['LeadStatus', 'LeadStatus', 'Status', 'status']] as const)),
  ]);
}

function projectLeadOpportunity(
  payload: Record<string, unknown>,
  opportunity: WebhookRecord | undefined,
): void {
  copyFields(payload, opportunity, [
    ['OpportunityId', 'OpportunityId', 'opportunityId', 'Id', 'id'],
    ['OpportunityName', 'OpportunityName', 'Name', 'name'],
    ['OpportunityCreatedDate', 'OpportunityCreatedDate', 'CreatedDate', 'createdDate'],
    ['OpportunityProcessedDate', 'OpportunityProcessedDate', 'ProcessedDate', 'processedDate'],
  ]);
}

function projectInboundMessage(
  payload: Record<string, unknown>,
  lead: WebhookRecord | undefined,
  message: WebhookRecord | undefined,
  includeSubject: boolean,
): void {
  copyFields(payload, lead, [
    ['LeadDocketLeadId', 'LeadDocketLeadId', 'LeadId', 'leadId', 'Id', 'id'],
    ['CaseType', 'CaseType', 'LeadCaseType', 'PracticeArea.Name'],
    ['LeadStatus', 'LeadStatus', 'Status', 'status'],
    ['LeadSubstatus', 'LeadSubstatus', 'SubStatus', 'subStatus'],
  ]);
  copyFields(payload, message, [
    ['MessageId', 'MessageId', 'Id', 'id'],
    ['MessageCreatedDate', 'MessageCreatedDate', 'CreatedDate', 'CreatedOn', 'createdDate'],
    ...(includeSubject
      ? ([['MessageSubject', 'MessageSubject', 'Subject', 'subject']] as const)
      : []),
    ['MessageSendTo', 'MessageSendTo', 'SendTo', 'sendTo'],
    ['MessageSendFrom', 'MessageSendFrom', 'SendFrom', 'sendFrom'],
    ['MessageSendFromName', 'MessageSendFromName', 'SendFromName', 'sendFromName'],
  ]);
  projectUser(payload, 'LeadIntake', lead, 'Intake');
  projectUser(payload, 'LeadCreator', lead, 'Creator');
}

function projectNote(payload: Record<string, unknown>, note: WebhookRecord | undefined): void {
  copyFields(payload, note, [
    ['NoteSummary', 'NoteSummary', 'Summary', 'summary'],
    ['Note', 'Note', 'Text', 'text'],
    ['NoteEventType', 'NoteEventType', 'EventType', 'eventType'],
    ['NoteCreatedBy', 'NoteCreatedBy', 'CreatedBy', 'createdBy'],
    ['NoteCreatedDate', 'NoteCreatedDate', 'CreatedDate', 'CreatedOn', 'createdDate'],
  ]);
}

function projectFile(payload: Record<string, unknown>, file: WebhookRecord | undefined): void {
  copyFields(payload, file, [
    ['FileName', 'FileName', 'fileName', 'Name', 'name'],
    ['Extension', 'Extension', 'extension'],
    ['FileUrl', 'FileUrl', 'Url', 'url'],
    ['DecodedFileUrl', 'DecodedFileUrl', 'FileUrl', 'Url', 'url'],
    ['FileCategory', 'FileCategory', 'Category', 'category'],
  ]);
}

function projectOpportunity(
  payload: Record<string, unknown>,
  opportunity: WebhookRecord | undefined,
  kind: 'opportunity-created' | 'opportunity-disregarded' | 'opportunity-converted-to-lead',
): void {
  const excluded = new Set<string>();
  if (kind === 'opportunity-created') {
    excluded.add('ProcessedDate');
    excluded.add('ProcessedBy');
    excluded.add('ContactSource');
  }
  copyFields(
    payload,
    opportunity,
    OPPORTUNITY_FIELDS.filter(([key]) => !excluded.has(key)),
  );
  if (kind === 'opportunity-converted-to-lead') {
    put(payload, 'LeadId', firstValue(read(opportunity, 'LeadId'), read(opportunity, 'leadId')));
  }
  deriveFullName(payload, 'OpportunityName', payload.FirstName, payload.LastName);
}

function projectUser(
  payload: Record<string, unknown>,
  outputPrefix: string,
  parent: WebhookRecord | undefined,
  sourceName: string,
): void {
  const user = asRecord(read(parent, sourceName));
  let name = firstValue(
    read(parent, `${outputPrefix}Name`),
    read(user, 'Name'),
    read(user, 'name'),
  );
  if (name === undefined) {
    const first = read(user, 'FirstName');
    const last = read(user, 'LastName');
    name = joinedName(first, last);
  }
  put(payload, `${outputPrefix}Name`, name);
  put(
    payload,
    `${outputPrefix}Code`,
    firstValue(read(parent, `${outputPrefix}Code`), read(user, 'Code'), read(user, 'code')),
  );
  put(
    payload,
    `${outputPrefix}Email`,
    firstValue(read(parent, `${outputPrefix}Email`), read(user, 'Email'), read(user, 'email')),
  );
}

function projectPhoneCall(payload: Record<string, unknown>, lead: WebhookRecord | undefined): void {
  const phoneCall = asRecord(read(lead, 'PhoneCall'));
  copyFields(payload, phoneCall ?? lead, [
    ['PhoneCallRecordingURL', 'PhoneCallRecordingURL', 'RecordingURL', 'RecordingUrl'],
    ['PhoneCallDuration', 'PhoneCallDuration', 'Duration', 'duration'],
    ['PhoneCallFromNumber', 'PhoneCallFromNumber', 'FromNumber', 'fromNumber'],
    ['PhoneCallToNumber', 'PhoneCallToNumber', 'ToNumber', 'toNumber'],
    ['PhoneCallDate', 'PhoneCallDate', 'Date', 'CreatedDate', 'createdDate'],
    ['PhoneCallSummary', 'PhoneCallSummary', 'Summary', 'summary'],
    ['PhoneCallTranscript', 'PhoneCallTranscript', 'Transcript', 'transcript'],
  ]);
}

function copyFields(
  target: Record<string, unknown>,
  source: WebhookRecord | undefined,
  fields: readonly OutputField[],
): void {
  for (const [output, ...candidates] of fields) {
    put(target, output, read(source, ...candidates));
  }
}

function flattenCustomFields(
  payload: Record<string, unknown>,
  sources: readonly WebhookCustomFields[],
): void {
  const coreKeys = new Set(Object.keys(payload));
  const flattened = new Map<string, unknown>();

  for (const source of sources) {
    collectCustomFields(source, flattened);
  }
  for (const [name, value] of flattened) {
    if (!coreKeys.has(name)) {
      payload[name] = value;
    }
  }
}

function collectCustomFields(source: WebhookCustomFields, output: Map<string, unknown>): void {
  if (!source) return;
  if (Array.isArray(source)) {
    for (const field of source) collectCustomFields(field, output);
    return;
  }

  const record = source as WebhookRecord;
  const name = firstValue(read(record, 'Name'), read(record, 'FieldName'), read(record, 'name'));
  if (typeof name === 'string' && name.trim()) {
    output.set(
      name,
      firstValue(
        read(record, 'Value'),
        read(record, 'CustomFieldValue'),
        read(record, 'value'),
        null,
      ),
    );
    return;
  }

  for (const [key, value] of Object.entries(record)) {
    output.set(key, value);
  }
}

function customFieldsOf(record: WebhookRecord | undefined): WebhookCustomFields {
  return (read(record, 'CustomFields') ?? read(record, 'customFields')) as WebhookCustomFields;
}

function tagValue(tag: string | WebhookRecord | undefined): unknown {
  if (typeof tag === 'string') return tag;
  return firstValue(read(tag, 'Tag'), read(tag, 'TagText'), read(tag, 'Name'), read(tag, 'name'));
}

function read(source: unknown, ...paths: string[]): unknown {
  const record = asRecord(source);
  if (!record) return undefined;

  for (const path of paths) {
    let current: unknown = record;
    let found = true;
    for (const segment of path.split('.')) {
      const currentRecord = asRecord(current);
      if (!currentRecord) {
        found = false;
        break;
      }
      const key = Object.keys(currentRecord).find(
        (candidate) => normalizeKey(candidate) === normalizeKey(segment),
      );
      if (key === undefined) {
        found = false;
        break;
      }
      current = currentRecord[key];
    }
    if (found && current !== undefined) return current;
  }

  return undefined;
}

function put(target: Record<string, unknown>, key: string, value: unknown): void {
  if (value !== undefined) target[key] = value;
}

function deriveFullName(
  payload: Record<string, unknown>,
  key: string,
  firstName: unknown,
  lastName: unknown,
): void {
  if (payload[key] === undefined) put(payload, key, joinedName(firstName, lastName));
}

function joinedName(firstName: unknown, lastName: unknown): string | undefined {
  const parts = [firstName, lastName].filter(
    (part): part is string => typeof part === 'string' && part.trim().length > 0,
  );
  return parts.length ? parts.join(' ') : undefined;
}

function firstValue(...values: unknown[]): unknown {
  return values.find((value) => value !== undefined);
}

function asRecord(value: unknown): WebhookRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as WebhookRecord)
    : undefined;
}

function normalizeKey(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function pathMatches(template: string, actual: string): boolean {
  const pattern = template
    .split(/(\{[^}]+\})/g)
    .map((part) => (part.startsWith('{') ? '[^/]+' : escapeRegExp(part)))
    .join('');
  return new RegExp(`^${pattern}/?$`, 'i').test(actual);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesEventByUser(kind: WebhookKind): boolean {
  return [
    'contact-added',
    'contact-edited',
    'lead-created',
    'lead-edited',
    'lead-sent-to-external-system',
    'lead-status-changed',
    'note-added',
  ].includes(kind);
}

function isContactKind(kind: WebhookKind): boolean {
  return kind === 'contact-added' || kind === 'contact-edited' || kind === 'tag-added-to-contact';
}

function isLeadKind(kind: WebhookKind): boolean {
  return [
    'lead-created',
    'lead-edited',
    'lead-status-changed',
    'lead-sent-to-external-system',
  ].includes(kind);
}

function isOpportunityKind(kind: WebhookKind): boolean {
  return kind.startsWith('opportunity-');
}
