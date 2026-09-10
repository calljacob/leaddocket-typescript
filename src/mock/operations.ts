export type OperationRecord = Record<string, unknown>;

export type OperationStoreName =
  | 'contacts'
  | 'leads'
  | 'opportunities'
  | 'tasks'
  | 'users'
  | 'referrals'
  | 'settlements'
  | 'expenses'
  | 'leadForms'
  | 'messages';

export type OperationContext = {
  operationId: string;
  routePath?: string;
  pathParams?: Readonly<Record<string, string>>;
  query?: Readonly<Record<string, string>>;
  body?: unknown;
};

export type OperationDependencies = {
  getStore(store: OperationStoreName): OperationRecord[];
  allocateId(): number;
  now(): string;
  fail(status: number, message: string): never;
};

export type OperationDispatchResult = { handled: false } | { handled: true; data: unknown };

type OperationHandler = (
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) => unknown;

type NormalizedOperationContext = {
  operationId: string;
  routePath?: string;
  pathParams: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string>>;
  body: OperationRecord;
};

type IdentityDefinition = {
  canonical: string;
  aliases: readonly string[];
  entity: string;
};

const IDENTITIES: Record<OperationStoreName, IdentityDefinition> = {
  contacts: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'ContactId', 'contactId'],
    entity: 'contact',
  },
  leads: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'LeadId', 'leadId'],
    entity: 'lead',
  },
  opportunities: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'OpportunityId', 'opportunityId'],
    entity: 'opportunity',
  },
  tasks: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'TaskId', 'taskId'],
    entity: 'task',
  },
  users: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'UserId', 'userId'],
    entity: 'user',
  },
  referrals: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'ReferralId', 'referralId'],
    entity: 'referral',
  },
  settlements: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'SettlementId', 'settlementId'],
    entity: 'settlement',
  },
  expenses: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'ExpenseId', 'expenseId'],
    entity: 'expense',
  },
  leadForms: {
    canonical: 'LeadFormId',
    aliases: ['LeadFormId', 'leadFormId', 'Id', 'id'],
    entity: 'lead form',
  },
  messages: {
    canonical: 'Id',
    aliases: ['Id', 'id', 'MessageId', 'messageId'],
    entity: 'message',
  },
};

const OPERATIONS: Readonly<Record<string, OperationHandler>> = {
  contacts_getById: getContactById,
  contacts_getByCode: getContactByCode,
  contacts_search: searchContacts,
  contacts_recent_by_phone: getRecentContactsByPhone,
  contacts_update: updateContact,
  contacts_updatecode: updateContactCode,
  contacts_add: addContact,
  contacts_addTag: addContactTag,
  contacts_deleteTag: deleteContactTag,

  GetExpense: getExpense,
  GetExpenses: getExpenses,
  AddExpense: addExpense,
  Expenses_Delete: deleteExpense,

  LeadForms_GetAll: getAllLeadForms,
  LeadForms_Create: createLeadForm,
  LeadForms_GetById: getLeadFormById,
  LeadForms_Update: updateLeadForm,
  LeadForms_Delete: deleteLeadForm,
  LeadForms_AddField: addLeadFormField,
  LeadForms_UpdateField: updateLeadFormField,
  LeadForms_DeleteField: deleteLeadFormField,
  LeadForms_DeleteFields: deleteLeadFormFields,

  leads_getByStatus: getLeadsByStatus,
  leads_getById: getLeadById,
  leads_getBasicById: getLeadById,
  leads_getDetailedById: getLeadById,
  leads_getByCode: getLeadByCode,
  leads_getByOpportunityId: getLeadByOpportunityId,
  leads_getPendingExport: getPendingLeadIds,
  leads_getByLastStatusChangeSince: getLeadsByLastStatusChange,
  Lead_Update: updateLead,
  leads_putUpdateCode: updateLeadCode,
  leads_putMarkAsProcessed: markLeadProcessed,
  leads_postAddRelatedContact: addLeadRelatedContact,
  leads_patchUpdateLeadRoleUser: updateLeadRoleUser,
  'post /api/leads/{id}/notes': addLeadNote,
  'put /api/leads/{id}/notes/{noteId}': updateLeadNote,
  'delete /api/leads/{id}/notes/{noteId}': deleteLeadNote,

  CollectionSections_List: listCollectionSections,
  CollectionSections_Add: addCollectionSectionEntries,
  CollectionSections_Update: updateCollectionSectionEntries,
  CollectionSections_Delete: deleteCollectionSectionEntries,

  opportunities_GetOpportunityById: getOpportunityById,
  opportunities_getCreatedSince: getOpportunitiesCreatedSince,
  opportunities_getLastUpdatedSince: getOpportunitiesLastUpdatedSince,
  opportunities_getListUnprocessed: getUnprocessedOpportunities,
  opportunities_AppendNote: appendOpportunityNote,
  opportunities_ClearNote: clearOpportunityNote,
  opportunities_Disregard: disregardOpportunity,
  opportunities_Lock: lockOpportunity,
  opportunities_Unlock: unlockOpportunity,

  'post /api/messages': createMessage,
  'post /api/messages/sendtext': sendMessage,
  'post /api/messages/sendemail': sendMessage,

  referrals_GetById: getReferralById,
  referrals_Edit: editReferral,
  referrals_Delete: deleteReferral,
  referrals_GetByExternalCode: getReferralByExternalCode,
  referrals_GetList: getReferrals,
  referrals_UpdateCode: updateReferralCode,
  referrals_UpdateExternalCode: updateReferralExternalCode,
  referrals_Add: addReferral,

  Settlements_GetSettlement: getSettlement,
  GetSettlementsByLeadId: getSettlementsByLeadId,
  AddSettlement: addSettlement,

  task_add: addTask,
  'put /api/tasks': updateTask,
  'delete /api/tasks/{id}': deleteTask,
  'get /api/tasks/{id}': getTaskById,
  'get /api/tasks/leads/{leadId}': getTasksByLeadId,
  'put /api/tasks/markcomplete/{id}': markTaskComplete,

  users_list: getUsers,
  User_byId: getUserById,
  users_byRole: getUsersByRole,
  User_byCode: getUserByCode,
  User_byFilevineUserId: getUserByFilevineUserId,
};

/**
 * Dispatches only operations with explicit handlers. Callers can retain their existing
 * fallback for `{ handled: false }` while migrating away from broad CRUD inference.
 */
export function dispatchMockOperation(
  context: OperationContext,
  dependencies: OperationDependencies,
): OperationDispatchResult {
  const normalized: NormalizedOperationContext = {
    operationId: context.operationId,
    routePath: context.routePath,
    pathParams: context.pathParams ?? {},
    query: context.query ?? {},
    body: asRecord(context.body),
  };

  if (context.operationId === 'leads_getByLastUpdatedSince') {
    const handler = lastUpdatedHandler(context.routePath);
    return handler
      ? { handled: true, data: handler(normalized, dependencies) }
      : { handled: false };
  }

  const handler = OPERATIONS[context.operationId];
  return handler ? { handled: true, data: handler(normalized, dependencies) } : { handled: false };
}

function lastUpdatedHandler(routePath: string | undefined): OperationHandler | undefined {
  if (routePath === '/api/contacts/lastupdatedsince') return getContactsLastUpdatedSince;
  if (routePath === '/api/leads/lastupdatedsince') return getLeadsLastUpdatedSince;
  return undefined;
}

function getContactById(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'contacts', pathValue(context, 'id'));
}

function getContactByCode(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return requireByProperty(
    dependencies,
    'contacts',
    ['Code', 'code'],
    queryValue(context, dependencies, 'code'),
  );
}

function searchContacts(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): OperationRecord[] {
  const term = queryValue(context, dependencies, 'searchTerm').toLowerCase();
  const fields = [
    'FirstName',
    'firstName',
    'MiddleName',
    'middleName',
    'LastName',
    'lastName',
    'Email',
    'email',
    'HomePhone',
    'homePhone',
    'MobilePhone',
    'mobilePhone',
    'WorkPhone',
    'workPhone',
    'phone',
  ];
  return dependencies
    .getStore('contacts')
    .filter((contact) => fields.some((field) => stringValue(contact[field]).includes(term)));
}

function getRecentContactsByPhone(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): OperationRecord[] {
  const phone = normalizePhone(queryValue(context, dependencies, 'phone'));
  const contacts = dependencies
    .getStore('contacts')
    .filter((contact) =>
      [
        'HomePhone',
        'homePhone',
        'MobilePhone',
        'mobilePhone',
        'WorkPhone',
        'workPhone',
        'phone',
      ].some((field) => normalizePhone(contact[field]) === phone),
    );

  if (contacts.length === 0) return [];

  return [
    {
      LeadAndOpportunityCount: 0,
      ContactCount: contacts.length,
      LeadCount: 0,
      OpportunityCount: 0,
      IsCurrentClient: false,
      SearchUrl: `/api/contacts/search?searchTerm=${encodeURIComponent(phone)}`,
    },
  ];
}

function updateContact(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const contact = requireRecord(dependencies, 'contacts', pathValue(context, 'id'));
  Object.assign(contact, context.body);
  return contact;
}

function addContact(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const contact = { ...context.body, Id: dependencies.allocateId() };
  dependencies.getStore('contacts').push(contact);
  return contact;
}

function getContactsLastUpdatedSince(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const records = filterSince(
    dependencies.getStore('contacts'),
    queryValue(context, dependencies, 'date'),
    ['LastUpdatedDTM', 'LastUpdateDate', 'lastUpdated'],
    context.query.sortOrder,
  );
  return paged(records, context.query);
}

function updateContactCode(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const contact = requireRecord(dependencies, 'contacts', queryValue(context, dependencies, 'id'));
  contact.Code = queryValue(context, dependencies, 'externalId');
  return undefined;
}

function addContactTag(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const contact = requireRecord(dependencies, 'contacts', pathValue(context, 'id'));
  const tagId = pathValue(context, 'tagId');
  const tags = childArray(contact, 'Tags', ['tags']);
  const duplicate = tags.some((tag) => propertyMatches(tag, ['TagId', 'tagId'], tagId));
  if (!duplicate) {
    tags.push({ Id: dependencies.allocateId(), TagId: numberOrString(tagId) });
  }
  return undefined;
}

function deleteContactTag(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const contact = requireRecord(dependencies, 'contacts', pathValue(context, 'id'));
  const contactTagId = pathValue(context, 'contactTagId');
  const tags = childArray(contact, 'Tags', ['tags']);
  removeWhere(tags, (tag) => propertyMatches(tag, ['Id', 'id', 'ContactTagId'], contactTagId));
  return undefined;
}

function getExpense(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'expenses', pathValue(context, 'id'));
}

function getExpenses(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): OperationRecord[] {
  const start = validTimestamp(context.query.startdate);
  const end = validTimestamp(context.query.enddate);
  if (start === undefined && end === undefined) return [...dependencies.getStore('expenses')];

  return dependencies.getStore('expenses').filter((expense) => {
    const timestamp = validTimestamp(
      primitiveString(propertyValue(expense, ['ExpenseDate', 'expenseDate'])),
    );
    return (
      timestamp !== undefined &&
      (start === undefined || timestamp >= start) &&
      (end === undefined || timestamp <= end)
    );
  });
}

function addExpense(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const expense = { ...context.body, Id: dependencies.allocateId() };
  dependencies.getStore('expenses').push(expense);
  return expense;
}

function deleteExpense(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  removeRecord(dependencies, 'expenses', pathValue(context, 'id'));
  return undefined;
}

function getAllLeadForms(
  _context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return dependencies.getStore('leadForms').map(hypermedia);
}

function createLeadForm(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const form = {
    ...context.body,
    LeadFormId: dependencies.allocateId(),
    CreatedDate: dependencies.now(),
  };
  dependencies.getStore('leadForms').push(form);
  return hypermedia(form);
}

function getLeadFormById(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return hypermedia(requireRecord(dependencies, 'leadForms', pathValue(context, 'id')));
}

function updateLeadForm(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const form = requireRecord(dependencies, 'leadForms', pathValue(context, 'id'));
  Object.assign(form, context.body);
  return hypermedia(form);
}

function deleteLeadForm(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  removeRecord(dependencies, 'leadForms', pathValue(context, 'id'));
  return undefined;
}

function addLeadFormField(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const formId = pathValue(context, 'id');
  const form = requireRecord(dependencies, 'leadForms', formId);
  const field: OperationRecord = {
    ...context.body,
    LeadFormFieldId: dependencies.allocateId(),
    LeadFormId: numberOrString(formId),
  };
  if (context.body.FieldNameOverride !== undefined) {
    field.DisplayNameOverride = context.body.FieldNameOverride;
  }
  if (context.body.DirectionsOverride !== undefined) {
    field.Directions = context.body.DirectionsOverride;
  }
  childArray(form, 'Fields', ['fields']).push(field);
  return hypermedia(field);
}

function updateLeadFormField(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const form = requireRecord(dependencies, 'leadForms', pathValue(context, 'id'));
  const fieldId = pathValue(context, 'fieldId');
  const field = requireChild(
    dependencies,
    childArray(form, 'Fields', ['fields']),
    ['LeadFormFieldId', 'leadFormFieldId', 'Id', 'id'],
    fieldId,
    'lead form field',
  );
  Object.assign(field, context.body);
  if (context.body.FieldNameOverride !== undefined) {
    field.DisplayNameOverride = context.body.FieldNameOverride;
  }
  if (context.body.DirectionsOverride !== undefined) {
    field.Directions = context.body.DirectionsOverride;
  }
  return undefined;
}

function deleteLeadFormField(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const form = requireRecord(dependencies, 'leadForms', pathValue(context, 'id'));
  const fieldId = pathValue(context, 'fieldId');
  const fields = childArray(form, 'Fields', ['fields']);
  removeWhere(fields, (field) =>
    propertyMatches(field, ['LeadFormFieldId', 'leadFormFieldId', 'Id', 'id'], fieldId),
  );
  return undefined;
}

function deleteLeadFormFields(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): Array<string | number> {
  const form = requireRecord(dependencies, 'leadForms', pathValue(context, 'id'));
  const fieldType = queryValue(context, dependencies, 'fieldType');
  const fields = childArray(form, 'Fields', ['fields']);
  const deleted = fields.filter((field) =>
    propertyMatches(field, ['FieldType', 'fieldType', 'CustomFieldType'], fieldType),
  );
  removeWhere(fields, (field) => deleted.includes(field));
  return deleted
    .map((field) => propertyValue(field, ['LeadFormFieldId', 'leadFormFieldId', 'Id', 'id']))
    .filter((id): id is string | number => typeof id === 'string' || typeof id === 'number');
}

function getLeadsByStatus(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  let records = [...dependencies.getStore('leads')];
  if (context.query.status) {
    records = records.filter((lead) =>
      propertyMatches(
        lead,
        ['Status', 'status', 'StatusName', 'statusName', 'StatusId', 'statusId'],
        context.query.status,
      ),
    );
  }
  if (context.query.subStatusIds) {
    const substatuses = new Set(context.query.subStatusIds.split(',').map((value) => value.trim()));
    records = records.filter((lead) => {
      const value = primitiveString(propertyValue(lead, ['SubStatusId', 'subStatusId']));
      return value !== undefined && substatuses.has(value);
    });
  }
  return paged(records, context.query);
}

function getLeadById(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'leads', pathValue(context, 'id'));
}

function getLeadByCode(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireByProperty(
    dependencies,
    'leads',
    ['Code', 'code'],
    queryValue(context, dependencies, 'code'),
  );
}

function getLeadByOpportunityId(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return requireByProperty(
    dependencies,
    'leads',
    ['OpportunityId', 'opportunityId'],
    queryValue(context, dependencies, 'opportunityId'),
  );
}

function getPendingLeadIds(
  _context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): Array<string | number> {
  return dependencies
    .getStore('leads')
    .filter((lead) => !booleanValue(propertyValue(lead, ['Processed', 'processed'])))
    .map((lead) => identityValue('leads', lead))
    .filter((id): id is string | number => id !== undefined);
}

function getLeadsByLastStatusChange(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return paged(
    filterSince(
      dependencies.getStore('leads'),
      queryValue(context, dependencies, 'date'),
      ['LastStatusChangeDate', 'lastStatusChangeDate'],
      context.query.sortOrder,
    ),
    context.query,
  );
}

function getLeadsLastUpdatedSince(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return paged(
    filterSince(
      dependencies.getStore('leads'),
      queryValue(context, dependencies, 'date'),
      ['LastUpdateDate', 'LastUpdatedDTM', 'lastUpdated'],
      context.query.sortOrder,
    ),
    context.query,
  );
}

function updateLead(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const lead = requireRecord(dependencies, 'leads', pathValue(context, 'id'));
  Object.assign(lead, context.body);
  return undefined;
}

function updateLeadCode(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const lead = requireRecord(dependencies, 'leads', queryValue(context, dependencies, 'id'));
  lead.Code = queryValue(context, dependencies, 'externalId');
  return undefined;
}

function markLeadProcessed(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const lead = requireRecord(dependencies, 'leads', queryValue(context, dependencies, 'id'));
  lead.Processed = parseBoolean(context.query.markprocessed, true);
  return undefined;
}

function addLeadRelatedContact(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const lead = requireRecord(dependencies, 'leads', queryValue(context, dependencies, 'leadid'));
  const contact = requireRecord(
    dependencies,
    'contacts',
    queryValue(context, dependencies, 'contactid'),
  );
  childArray(lead, 'RelatedContacts', ['relatedContacts']).push({
    Relationship: queryValue(context, dependencies, 'relationship'),
    IsPlaintiff: parseBoolean(context.query.additionalplaintiff, false),
    Contact: contact,
  });
  return undefined;
}

function updateLeadRoleUser(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const lead = requireRecord(dependencies, 'leads', queryValue(context, dependencies, 'leadid'));
  const roleId = queryValue(context, dependencies, 'leadRoleId');
  const user = requireRecord(
    dependencies,
    'users',
    queryValue(context, dependencies, 'assignToUserId'),
  );
  const role = recordArray(propertyValue(user, ['Roles', 'roles'])).find((candidate) =>
    propertyMatches(candidate, ['LeadRoleId', 'leadRoleId', 'Id', 'id'], roleId),
  );
  const assignment: OperationRecord = {
    ...user,
    LeadRoleId: numberOrString(roleId),
  };
  const roleName = role && propertyValue(role, ['RoleName', 'roleName']);
  if (roleName !== undefined) assignment.RoleName = roleName;

  const assignments = childArray(lead, 'AssignedTo', ['assignedTo']);
  const existing = assignments.find((candidate) =>
    propertyMatches(candidate, ['LeadRoleId', 'leadRoleId'], roleId),
  );
  if (existing) Object.assign(existing, assignment);
  else assignments.push(assignment);
  return undefined;
}

function addLeadNote(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const leadId = pathValue(context, 'id');
  const lead = requireRecord(dependencies, 'leads', leadId);
  const note: OperationRecord = {
    Id: dependencies.allocateId(),
    LeadId: numberOrString(leadId),
    Note: context.body.Text ?? null,
    Summary: context.body.Summary ?? null,
    IsUserNote: primitiveString(context.body.IsUserNote) ?? null,
    CreatedOn: dependencies.now(),
  };
  childArray(lead, 'Notes', ['notes']).push(note);
  return note;
}

function updateLeadNote(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const lead = requireRecord(dependencies, 'leads', pathValue(context, 'id'));
  const noteId = pathValue(context, 'noteId');
  const note = requireChild(
    dependencies,
    childArray(lead, 'Notes', ['notes']),
    ['Id', 'id', 'NoteId', 'noteId'],
    noteId,
    'lead note',
  );
  if (context.body.Text !== undefined) note.Note = context.body.Text;
  if (context.body.Summary !== undefined) note.Summary = context.body.Summary;
  return note;
}

function deleteLeadNote(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const lead = requireRecord(dependencies, 'leads', pathValue(context, 'id'));
  const noteId = pathValue(context, 'noteId');
  const notes = childArray(lead, 'Notes', ['notes']);
  removeWhere(notes, (note) => propertyMatches(note, ['Id', 'id', 'NoteId', 'noteId'], noteId));
  return undefined;
}

function listCollectionSections(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const leadId = pathValue(context, 'leadId');
  const lead = requireRecord(dependencies, 'leads', leadId);
  return collectionSectionResponse(leadId, lead);
}

function addCollectionSectionEntries(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const { leadId, lead, section } = collectionSectionContext(context, dependencies, true);
  const entries = childArray(section, 'Entries', ['entries']);
  for (const requestEntry of recordArray(context.body.Entries ?? context.body.entries)) {
    entries.push({
      Id: dependencies.allocateId(),
      CreatedDate: dependencies.now(),
      Values: recordArray(requestEntry.Values ?? requestEntry.values).map((value) => ({
        Id: dependencies.allocateId(),
        ...value,
      })),
    });
  }
  return collectionSectionResponse(leadId, lead);
}

function updateCollectionSectionEntries(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const { leadId, lead, section } = collectionSectionContext(context, dependencies, false);
  const entries = childArray(section, 'Entries', ['entries']);
  for (const requestEntry of recordArray(context.body.Entries ?? context.body.entries)) {
    const entryId = primitiveString(propertyValue(requestEntry, ['Id', 'id']));
    if (entryId === undefined) {
      dependencies.fail(400, 'Collection section entry update requires Id.');
    }
    const entry = requireChild(
      dependencies,
      entries,
      ['Id', 'id'],
      entryId,
      'collection section entry',
    );
    const values = childArray(entry, 'Values', ['values']);
    for (const requestValue of recordArray(requestEntry.Values ?? requestEntry.values)) {
      const customFieldId = primitiveString(
        propertyValue(requestValue, ['CustomFieldId', 'customFieldId']),
      );
      const existing = customFieldId
        ? values.find((value) =>
            propertyMatches(value, ['CustomFieldId', 'customFieldId'], customFieldId),
          )
        : undefined;
      if (existing) Object.assign(existing, requestValue);
      else values.push({ Id: dependencies.allocateId(), ...requestValue });
    }
  }
  return collectionSectionResponse(leadId, lead);
}

function deleteCollectionSectionEntries(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const { leadId, lead, section } = collectionSectionContext(context, dependencies, false);
  const ids = new Set(
    arrayValue(context.body.EntryIds ?? context.body.entryIds)
      .map(primitiveString)
      .filter((id): id is string => id !== undefined),
  );
  const entries = childArray(section, 'Entries', ['entries']);
  removeWhere(entries, (entry) => {
    const id = primitiveString(propertyValue(entry, ['Id', 'id']));
    return id !== undefined && ids.has(id);
  });
  return collectionSectionResponse(leadId, lead);
}

function getOpportunityById(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return requireRecord(dependencies, 'opportunities', pathValue(context, 'id'));
}

function getOpportunitiesCreatedSince(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const records = context.query.date
    ? filterSince(dependencies.getStore('opportunities'), context.query.date, [
        'CreatedDate',
        'createdDate',
      ])
    : [...dependencies.getStore('opportunities')];
  return paged(records, context.query);
}

function getOpportunitiesLastUpdatedSince(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const records = context.query.date
    ? filterSince(dependencies.getStore('opportunities'), context.query.date, [
        'LastUpdateDate',
        'LastUpdatedDTM',
        'lastUpdated',
      ])
    : [...dependencies.getStore('opportunities')];
  return paged(records, context.query);
}

function getUnprocessedOpportunities(
  _context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return dependencies
    .getStore('opportunities')
    .filter((opportunity) => !booleanValue(propertyValue(opportunity, ['Processed', 'processed'])));
}

function appendOpportunityNote(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const opportunity = requireRecord(
    dependencies,
    'opportunities',
    queryValue(context, dependencies, 'opportunityId'),
  );
  const next = queryValue(context, dependencies, 'note');
  const current = propertyValue(opportunity, ['Note', 'note']);
  opportunity.Note =
    typeof current === 'string' && current.length > 0 ? `${current}\n${next}` : next;
  return undefined;
}

function clearOpportunityNote(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const opportunity = requireRecord(
    dependencies,
    'opportunities',
    queryValue(context, dependencies, 'opportunityId'),
  );
  opportunity.Note = null;
  return undefined;
}

function disregardOpportunity(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const opportunity = requireRecord(
    dependencies,
    'opportunities',
    queryValue(context, dependencies, 'id'),
  );
  opportunity.DisregardReason = queryValue(context, dependencies, 'reason');
  opportunity.Processed = true;
  return opportunity;
}

function lockOpportunity(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const opportunity = requireRecord(
    dependencies,
    'opportunities',
    queryValue(context, dependencies, 'id'),
  );
  opportunity.IsBeingEdited = true;
  return opportunity;
}

function unlockOpportunity(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const opportunity = requireRecord(
    dependencies,
    'opportunities',
    queryValue(context, dependencies, 'id'),
  );
  opportunity.IsBeingEdited = false;
  return opportunity;
}

function createMessage(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return persistMessage(context, dependencies, false);
}

function sendMessage(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return persistMessage(context, dependencies, true);
}

function persistMessage(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
  hasBeenSent: boolean,
) {
  const leadId = requiredBodyIdentifier(context, dependencies, ['LeadId', 'leadId'], 'LeadId');
  requireRecord(dependencies, 'leads', leadId);
  const message: OperationRecord = {
    ...context.body,
    Id: dependencies.allocateId(),
    LeadId: numberOrString(leadId),
    SendFrom: context.body.SendFrom ?? context.body.sendFrom ?? null,
    SendTo: context.body.SendTo ?? context.body.sendTo ?? null,
    SendCC: context.body.SendCC ?? context.body.sendCC ?? null,
    Subject: context.body.Subject ?? context.body.subject ?? null,
    Body: context.body.Body ?? context.body.body ?? null,
    CreatedOn: dependencies.now(),
    DueForSendingOn: null,
    IsInbound: false,
    HasBeenSent: hasBeenSent,
  };
  dependencies.getStore('messages').push(message);
  return message;
}

function getReferralById(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'referrals', pathValue(context, 'id'));
}

function editReferral(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const referral = requireRecord(dependencies, 'referrals', pathValue(context, 'id'));
  Object.assign(referral, context.body);
  return referral;
}

function deleteReferral(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  removeRecord(dependencies, 'referrals', pathValue(context, 'id'));
  return undefined;
}

function getReferralByExternalCode(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return requireByProperty(
    dependencies,
    'referrals',
    ['ExternalCode', 'externalCode'],
    queryValue(context, dependencies, 'externalCode'),
  );
}

function getReferrals(_context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return [...dependencies.getStore('referrals')];
}

function updateReferralCode(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const referral = requireRecord(
    dependencies,
    'referrals',
    queryValue(context, dependencies, 'id'),
  );
  referral.Code = queryValue(context, dependencies, 'code');
  return undefined;
}

function updateReferralExternalCode(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const referral = requireRecord(
    dependencies,
    'referrals',
    queryValue(context, dependencies, 'id'),
  );
  referral.ExternalCode = queryValue(context, dependencies, 'externalCode');
  return undefined;
}

function addReferral(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const referral = { ...context.body, Id: dependencies.allocateId() };
  dependencies.getStore('referrals').push(referral);
  return referral;
}

function getSettlement(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'settlements', pathValue(context, 'id'));
}

function getSettlementsByLeadId(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const leadId = pathValue(context, 'id');
  return dependencies
    .getStore('settlements')
    .filter((settlement) => propertyMatches(settlement, ['LeadId', 'leadId'], leadId));
}

function addSettlement(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const leadId = requiredBodyIdentifier(context, dependencies, ['LeadId', 'leadId'], 'LeadId');
  requireRecord(dependencies, 'leads', leadId);
  const settlement = {
    ...context.body,
    Id: dependencies.allocateId(),
    LeadId: numberOrString(leadId),
  };
  dependencies.getStore('settlements').push(settlement);
  return settlement;
}

function addTask(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const task = { ...context.body, Id: dependencies.allocateId() };
  dependencies.getStore('tasks').push(task);
  return task;
}

function updateTask(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  const taskId = primitiveString(propertyValue(context.body, ['TaskId', 'taskId', 'Id', 'id']));
  if (taskId === undefined) {
    return dependencies.fail(400, 'Mock task update requires TaskId in the request body.');
  }
  const task = requireRecord(dependencies, 'tasks', taskId);
  Object.assign(task, context.body);
  return task;
}

function deleteTask(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  removeRecord(dependencies, 'tasks', pathValue(context, 'id'));
  return undefined;
}

function getTaskById(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'tasks', pathValue(context, 'id'));
}

function getTasksByLeadId(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const leadId = pathValue(context, 'leadId');
  return dependencies
    .getStore('tasks')
    .filter((task) => propertyMatches(task, ['LeadId', 'leadId'], leadId));
}

function markTaskComplete(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  const task = requireRecord(dependencies, 'tasks', pathValue(context, 'id'));
  task.Completed = true;
  task.TaskCompletionDate = dependencies.now();
  return undefined;
}

function getUsers(
  _context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): OperationRecord[] {
  return [...dependencies.getStore('users')];
}

function getUserById(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireRecord(dependencies, 'users', pathValue(context, 'id'));
}

function getUsersByRole(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
): OperationRecord[] {
  const roleId = queryValue(context, dependencies, 'leadRoleId');
  return dependencies
    .getStore('users')
    .filter((user) =>
      recordArray(propertyValue(user, ['Roles', 'roles'])).some((role) =>
        propertyMatches(role, ['LeadRoleId', 'leadRoleId', 'Id', 'id'], roleId),
      ),
    );
}

function getUserByCode(context: NormalizedOperationContext, dependencies: OperationDependencies) {
  return requireByProperty(dependencies, 'users', ['Code', 'code'], pathValue(context, 'code'));
}

function getUserByFilevineUserId(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
) {
  return requireByProperty(
    dependencies,
    'users',
    ['FilevineUserId', 'FilevineUserID', 'filevineUserId', 'filevineUserID'],
    pathValue(context, 'id'),
  );
}

function collectionSectionContext(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
  create: boolean,
): { leadId: string; lead: OperationRecord; section: OperationRecord } {
  const leadId = pathValue(context, 'leadId');
  const sectionId = pathValue(context, 'sectionId');
  const lead = requireRecord(dependencies, 'leads', leadId);
  const sections = childArray(lead, 'CollectionSections', ['collectionSections']);
  let section = sections.find((candidate) => propertyMatches(candidate, ['Id', 'id'], sectionId));
  if (!section && create) {
    section = { Id: numberOrString(sectionId), Entries: [] };
    sections.push(section);
  }
  if (!section) {
    return dependencies.fail(404, `collection section ${sectionId} was not found.`);
  }
  return { leadId, lead, section };
}

function collectionSectionResponse(leadId: string, lead: OperationRecord) {
  return {
    LeadId: numberOrString(leadId),
    Sections: childArray(lead, 'CollectionSections', ['collectionSections']),
  };
}

function paged(records: OperationRecord[], query: Readonly<Record<string, string>>) {
  const page = positiveInteger(query.page, 1);
  const itemsPerPage = positiveInteger(query.itemsPerPage, 500);
  const start = (page - 1) * itemsPerPage;
  return {
    Page: page,
    ItemsPerPage: itemsPerPage,
    TotalRecordCount: records.length,
    TotalPages: records.length === 0 ? 0 : Math.ceil(records.length / itemsPerPage),
    Records: records.slice(start, start + itemsPerPage),
  };
}

function hypermedia(data: OperationRecord) {
  return {
    Error: null,
    IsValid: true,
    Data: data,
    Actions: [],
    Links: [],
  };
}

function filterSince(
  records: OperationRecord[],
  since: string,
  fields: readonly string[],
  sortOrder?: string,
): OperationRecord[] {
  const threshold = Date.parse(since);
  const filtered = Number.isNaN(threshold)
    ? [...records]
    : records.filter((record) => {
        const value = propertyValue(record, fields);
        return typeof value === 'string' && Date.parse(value) >= threshold;
      });
  const direction = sortOrder?.toLowerCase().startsWith('desc') ? -1 : 1;
  return filtered.sort((left, right) => {
    const leftDate = Date.parse(primitiveString(propertyValue(left, fields)) ?? '');
    const rightDate = Date.parse(primitiveString(propertyValue(right, fields)) ?? '');
    return (
      ((Number.isNaN(leftDate) ? 0 : leftDate) - (Number.isNaN(rightDate) ? 0 : rightDate)) *
      direction
    );
  });
}

function requireRecord(
  dependencies: OperationDependencies,
  store: OperationStoreName,
  id: string,
): OperationRecord {
  const record = dependencies
    .getStore(store)
    .find((candidate) => identityMatches(store, candidate, id));
  if (!record) {
    return dependencies.fail(404, `${IDENTITIES[store].entity} ${id} was not found.`);
  }
  ensureCanonicalIdentity(store, record);
  return record;
}

function requireByProperty(
  dependencies: OperationDependencies,
  store: OperationStoreName,
  properties: readonly string[],
  value: string,
): OperationRecord {
  const record = dependencies
    .getStore(store)
    .find((candidate) => propertyMatches(candidate, properties, value));
  if (!record) {
    return dependencies.fail(404, `${IDENTITIES[store].entity} ${value} was not found.`);
  }
  ensureCanonicalIdentity(store, record);
  return record;
}

function requireChild(
  dependencies: OperationDependencies,
  records: OperationRecord[],
  properties: readonly string[],
  value: string,
  entity: string,
): OperationRecord {
  const record = records.find((candidate) => propertyMatches(candidate, properties, value));
  return record ?? dependencies.fail(404, `${entity} ${value} was not found.`);
}

function removeRecord(
  dependencies: OperationDependencies,
  store: OperationStoreName,
  id: string,
): void {
  const records = dependencies.getStore(store);
  const index = records.findIndex((record) => identityMatches(store, record, id));
  if (index < 0) dependencies.fail(404, `${IDENTITIES[store].entity} ${id} was not found.`);
  records.splice(index, 1);
}

function identityMatches(store: OperationStoreName, record: OperationRecord, id: string): boolean {
  return propertyMatches(record, IDENTITIES[store].aliases, id);
}

function identityValue(
  store: OperationStoreName,
  record: OperationRecord,
): string | number | undefined {
  const value = propertyValue(record, IDENTITIES[store].aliases);
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function ensureCanonicalIdentity(store: OperationStoreName, record: OperationRecord): void {
  const identity = IDENTITIES[store];
  if (record[identity.canonical] === undefined) {
    const value = identityValue(store, record);
    if (value !== undefined) record[identity.canonical] = value;
  }
}

function propertyMatches(
  record: OperationRecord,
  properties: readonly string[],
  expected: string,
): boolean {
  const actual = primitiveString(propertyValue(record, properties));
  return actual !== undefined && actual.toLowerCase() === expected.toLowerCase();
}

function propertyValue(record: OperationRecord, properties: readonly string[]): unknown {
  for (const property of properties) {
    if (record[property] !== undefined) return record[property];
  }
  return undefined;
}

function requiredBodyIdentifier(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
  properties: readonly string[],
  name: string,
): string {
  const value = primitiveString(propertyValue(context.body, properties));
  return value === undefined || value === ''
    ? dependencies.fail(400, `Operation ${context.operationId} requires body property ${name}.`)
    : value;
}

function pathValue(context: NormalizedOperationContext, name: string): string {
  const value = context.pathParams[name];
  if (value === undefined || value === '') {
    throw new Error(`Operation ${context.operationId} requires path parameter ${name}.`);
  }
  return value;
}

function queryValue(
  context: NormalizedOperationContext,
  dependencies: OperationDependencies,
  name: string,
): string {
  const value = context.query[name];
  return value === undefined || value === ''
    ? dependencies.fail(400, `Operation ${context.operationId} requires query parameter ${name}.`)
    : value;
}

function childArray(
  record: OperationRecord,
  canonical: string,
  aliases: readonly string[],
): OperationRecord[] {
  const existing = propertyValue(record, [canonical, ...aliases]);
  const children = recordArray(existing);
  if (record[canonical] !== children) record[canonical] = children;
  return children;
}

function recordArray(value: unknown): OperationRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): OperationRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is OperationRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function removeWhere(records: OperationRecord[], predicate: (record: OperationRecord) => boolean) {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (predicate(records[index])) records.splice(index, 1);
  }
}

function numberOrString(value: string): number | string {
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : value;
}

function validTimestamp(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

function booleanValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return parseBoolean(value, false);
  return Boolean(value);
}

function normalizePhone(value: unknown): string {
  return (primitiveString(value) ?? '').replace(/\D/g, '');
}

function primitiveString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.toLowerCase() : '';
}
