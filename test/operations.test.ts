import { describe, expect, it } from 'vite-plus/test';

import {
  dispatchMockOperation,
  type OperationContext,
  type OperationDependencies,
  type OperationRecord,
  type OperationStoreName,
} from '../src/mock/operations';

class TestOperationError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function harness(seed: Partial<Record<OperationStoreName, OperationRecord[]>> = {}): {
  stores: Record<OperationStoreName, OperationRecord[]>;
  dispatch(context: OperationContext): unknown;
} {
  let nextId = 100;
  const stores: Record<OperationStoreName, OperationRecord[]> = {
    contacts: seed.contacts ?? [],
    leads: seed.leads ?? [],
    opportunities: seed.opportunities ?? [],
    tasks: seed.tasks ?? [],
    users: seed.users ?? [],
    referrals: seed.referrals ?? [],
    settlements: seed.settlements ?? [],
    expenses: seed.expenses ?? [],
    leadForms: seed.leadForms ?? [],
    messages: seed.messages ?? [],
  };
  const dependencies: OperationDependencies = {
    getStore: (store) => stores[store],
    allocateId: () => nextId++,
    now: () => '2026-01-02T03:04:05.000Z',
    fail: (status, message) => {
      throw new TestOperationError(status, message);
    },
  };

  return {
    stores,
    dispatch(context) {
      const result = dispatchMockOperation(context, dependencies);
      expect(result.handled).toBe(true);
      return result.handled ? result.data : undefined;
    },
  };
}

describe('operation-specific mock dispatch', () => {
  it('adds and deletes contact tags without treating either operation as contact CRUD', () => {
    const contact = {
      Id: 1,
      LeadId: 77,
      FirstName: 'Ada',
      Tags: [{ Id: 12, TagId: 3, TagText: 'Existing' }],
    };
    const mock = harness({ contacts: [contact] });

    expect(
      mock.dispatch({
        operationId: 'contacts_addTag',
        pathParams: { id: '1', tagId: '9' },
      }),
    ).toBeUndefined();
    expect(mock.stores.contacts).toHaveLength(1);
    expect(contact).toMatchObject({ Id: 1, FirstName: 'Ada' });
    expect(contact.Tags).toEqual([
      { Id: 12, TagId: 3, TagText: 'Existing' },
      { Id: 100, TagId: 9 },
    ]);

    expect(
      mock.dispatch({
        operationId: 'contacts_deleteTag',
        pathParams: { id: '1', contactTagId: '12' },
      }),
    ).toBeUndefined();
    expect(mock.stores.contacts).toEqual([contact]);
    expect(contact.Tags).toEqual([{ Id: 100, TagId: 9 }]);

    expect(() =>
      mock.dispatch({ operationId: 'contacts_getById', pathParams: { id: '77' } }),
    ).toThrowError(TestOperationError);
  });

  it('persists lead note children while preserving the lead identity and fields', () => {
    const lead: OperationRecord = { Id: 5, Code: 'L-5', FirstName: 'Grace', Notes: [] };
    const mock = harness({ leads: [lead] });

    const created = mock.dispatch({
      operationId: 'post /api/leads/{id}/notes',
      pathParams: { id: '5' },
      body: { Text: 'Initial note', Summary: 'Summary', IsUserNote: true },
    });
    expect(created).toEqual({
      Id: 100,
      LeadId: 5,
      Note: 'Initial note',
      Summary: 'Summary',
      IsUserNote: 'true',
      CreatedOn: '2026-01-02T03:04:05.000Z',
    });
    expect(mock.stores.leads).toEqual([lead]);

    expect(
      mock.dispatch({
        operationId: 'put /api/leads/{id}/notes/{noteId}',
        pathParams: { id: '5', noteId: '100' },
        body: { Text: 'Revised note', Summary: 'Revised' },
      }),
    ).toMatchObject({ Id: 100, LeadId: 5, Note: 'Revised note', Summary: 'Revised' });
    expect(lead).toMatchObject({ Id: 5, Code: 'L-5', FirstName: 'Grace' });

    expect(
      mock.dispatch({
        operationId: 'delete /api/leads/{id}/notes/{noteId}',
        pathParams: { id: '5', noteId: '100' },
      }),
    ).toBeUndefined();
    expect(lead.Notes).toEqual([]);
    expect(mock.stores.leads).toHaveLength(1);
  });

  it('uses exact hypermedia and contentless serializers for lead-form field CRUD', () => {
    const form: OperationRecord = {
      LeadFormId: 8,
      FormName: 'Intake',
      Fields: [{ LeadFormFieldId: 20, FieldType: 'Lead', DisplayName: 'Existing' }],
    };
    const mock = harness({ leadForms: [form] });

    const added = mock.dispatch({
      operationId: 'LeadForms_AddField',
      pathParams: { id: '8' },
      body: { FieldId: 55, FieldNameOverride: 'Favorite color', Required: true },
    });
    expect(added).toEqual({
      Error: null,
      IsValid: true,
      Data: {
        LeadFormFieldId: 100,
        LeadFormId: 8,
        FieldId: 55,
        FieldNameOverride: 'Favorite color',
        DisplayNameOverride: 'Favorite color',
        Required: true,
      },
      Actions: [],
      Links: [],
    });
    expect(mock.stores.leadForms).toEqual([form]);

    expect(
      mock.dispatch({
        operationId: 'LeadForms_UpdateField',
        pathParams: { id: '8', fieldId: '100' },
        body: { Required: false, DirectionsOverride: 'Choose one' },
      }),
    ).toBeUndefined();
    expect(form.Fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          LeadFormFieldId: 100,
          Required: false,
          Directions: 'Choose one',
        }),
      ]),
    );

    expect(
      mock.dispatch({
        operationId: 'LeadForms_DeleteField',
        pathParams: { id: '8', fieldId: '100' },
      }),
    ).toBeUndefined();
    expect(form.Fields).toEqual([
      { LeadFormFieldId: 20, FieldType: 'Lead', DisplayName: 'Existing' },
    ]);
    expect(mock.stores.leadForms).toHaveLength(1);
  });

  it('deletes lead-form fields by query fieldType and returns only deleted child IDs', () => {
    const form: OperationRecord = {
      LeadFormId: 9,
      Fields: [
        { LeadFormFieldId: 1, FieldType: 'Lead' },
        { LeadFormFieldId: 2, FieldType: 'Contact' },
        { LeadFormFieldId: 3, FieldType: 'Lead' },
      ],
    };
    const mock = harness({ leadForms: [form] });

    expect(
      mock.dispatch({
        operationId: 'LeadForms_DeleteFields',
        pathParams: { id: '9' },
        query: { fieldType: 'Lead' },
      }),
    ).toEqual([1, 3]);
    expect(form.Fields).toEqual([{ LeadFormFieldId: 2, FieldType: 'Contact' }]);
    expect(mock.stores.leadForms).toEqual([form]);
  });

  it('adds, updates, and deletes collection-section entries rather than the lead', () => {
    const lead: OperationRecord = {
      Id: 4,
      FirstName: 'Katherine',
      CollectionSections: [
        {
          Id: 30,
          Name: 'Damages',
          Entries: [{ Id: 40, Values: [{ Id: 41, CustomFieldId: 7, Value: 'old' }] }],
        },
      ],
    };
    const mock = harness({ leads: [lead] });

    const added = mock.dispatch({
      operationId: 'CollectionSections_Add',
      pathParams: { leadId: '4', sectionId: '30' },
      body: { Entries: [{ Values: [{ CustomFieldId: 7, Value: 'new' }] }] },
    });
    expect(added).toMatchObject({
      LeadId: 4,
      Sections: [
        {
          Id: 30,
          Entries: [{ Id: 40 }, { Id: 100, Values: [{ Id: 101, CustomFieldId: 7, Value: 'new' }] }],
        },
      ],
    });

    mock.dispatch({
      operationId: 'CollectionSections_Update',
      pathParams: { leadId: '4', sectionId: '30' },
      body: { Entries: [{ Id: 100, Values: [{ CustomFieldId: 7, Value: 'updated' }] }] },
    });
    expect(lead.CollectionSections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Entries: expect.arrayContaining([
            expect.objectContaining({
              Id: 100,
              Values: [expect.objectContaining({ CustomFieldId: 7, Value: 'updated' })],
            }),
          ]),
        }),
      ]),
    );

    mock.dispatch({
      operationId: 'CollectionSections_Delete',
      pathParams: { leadId: '4', sectionId: '30' },
      body: { EntryIds: [40] },
    });
    expect(mock.stores.leads).toEqual([lead]);
    expect(lead).toMatchObject({ Id: 4, FirstName: 'Katherine' });
    expect((lead.CollectionSections as OperationRecord[])[0].Entries).toEqual([
      expect.objectContaining({ Id: 100 }),
    ]);
  });

  it('takes opportunity IDs and note text from query parameters', () => {
    const first: OperationRecord = { Id: 1, LeadId: 2, Note: 'first' };
    const second: OperationRecord = { Id: 2, Note: null };
    const mock = harness({ opportunities: [first, second] });

    expect(mock.dispatch({ operationId: 'opportunities_Lock', query: { id: '2' } })).toBe(second);
    expect(first.IsBeingEdited).toBeUndefined();
    expect(second.IsBeingEdited).toBe(true);

    expect(
      mock.dispatch({
        operationId: 'opportunities_AppendNote',
        query: { opportunityId: '1', note: 'second' },
      }),
    ).toBeUndefined();
    expect(first.Note).toBe('first\nsecond');

    expect(
      mock.dispatch({
        operationId: 'opportunities_ClearNote',
        query: { opportunityId: '1' },
      }),
    ).toBeUndefined();
    expect(first.Note).toBeNull();

    expect(
      mock.dispatch({
        operationId: 'opportunities_Disregard',
        query: { id: '2', reason: 'Duplicate' },
      }),
    ).toMatchObject({ Id: 2, DisregardReason: 'Duplicate', Processed: true });
    expect(mock.stores.opportunities).toHaveLength(2);

    mock.dispatch({ operationId: 'opportunities_Unlock', query: { id: '2' } });
    expect(second.IsBeingEdited).toBe(false);
  });

  it('uses query IDs for code and processed updates and returns no response content', () => {
    const contact = { Id: 3, Code: 'OLD-CONTACT' };
    const lead = { Id: 7, Code: 'OLD-LEAD', Processed: false };
    const mock = harness({ contacts: [contact], leads: [lead] });

    expect(
      mock.dispatch({
        operationId: 'contacts_updatecode',
        query: { id: '3', externalId: 'C-NEW' },
      }),
    ).toBeUndefined();
    expect(
      mock.dispatch({
        operationId: 'leads_putUpdateCode',
        query: { id: '7', externalId: 'L-NEW' },
      }),
    ).toBeUndefined();
    expect(
      mock.dispatch({
        operationId: 'leads_putMarkAsProcessed',
        query: { id: '7', markprocessed: 'true' },
      }),
    ).toBeUndefined();

    expect(contact).toEqual({ Id: 3, Code: 'C-NEW' });
    expect(lead).toEqual({ Id: 7, Code: 'L-NEW', Processed: true });
  });

  it('uses body TaskId for updates and store-specific IDs for task selectors', () => {
    const first: OperationRecord = { Id: 1, LeadId: 2, Summary: 'Wrong identity match' };
    const second: OperationRecord = { Id: 2, LeadId: 8, Summary: 'Update me' };
    const mock = harness({ tasks: [first, second] });

    expect(
      mock.dispatch({
        operationId: 'put /api/tasks',
        body: { TaskId: 2, Summary: 'Updated' },
      }),
    ).toBe(second);
    expect(first.Summary).toBe('Wrong identity match');
    expect(second.Summary).toBe('Updated');

    expect(
      mock.dispatch({
        operationId: 'get /api/tasks/leads/{leadId}',
        pathParams: { leadId: '2' },
      }),
    ).toEqual([first]);

    expect(
      mock.dispatch({
        operationId: 'put /api/tasks/markcomplete/{id}',
        pathParams: { id: '2' },
      }),
    ).toBeUndefined();
    expect(second).toMatchObject({
      Completed: true,
      TaskCompletionDate: '2026-01-02T03:04:05.000Z',
    });

    expect(
      mock.dispatch({
        operationId: 'task_add',
        body: { LeadId: 8, Summary: 'New task' },
      }),
    ).toEqual({ Id: 100, LeadId: 8, Summary: 'New task' });
    expect(mock.stores.tasks).toHaveLength(3);

    expect(
      mock.dispatch({
        operationId: 'delete /api/tasks/{id}',
        pathParams: { id: '1' },
      }),
    ).toBeUndefined();
    expect(mock.stores.tasks).not.toContain(first);
  });

  it('uses query-specific GET selectors and exact paged response property names', () => {
    const contacts = [
      { Id: 1, Code: 'ADA', FirstName: 'Ada', LastUpdatedDTM: '2026-01-01T00:00:00Z' },
      { Id: 2, Code: 'GRACE', FirstName: 'Grace', LastUpdatedDTM: '2026-01-02T00:00:00Z' },
      { Id: 3, Code: 'KAT', FirstName: 'Katherine', LastUpdatedDTM: '2026-01-03T00:00:00Z' },
    ];
    const leads = [
      { Id: 10, Code: 'LEAD-A', OpportunityId: 91, Processed: false },
      { Id: 11, Code: 'LEAD-B', OpportunityId: 92, Processed: true },
    ];
    const mock = harness({ contacts, leads });

    expect(mock.dispatch({ operationId: 'contacts_getByCode', query: { code: 'GRACE' } })).toBe(
      contacts[1],
    );
    expect(mock.dispatch({ operationId: 'leads_getByCode', query: { code: 'LEAD-A' } })).toBe(
      leads[0],
    );
    expect(
      mock.dispatch({
        operationId: 'leads_getByOpportunityId',
        query: { opportunityId: '92' },
      }),
    ).toBe(leads[1]);
    expect(mock.dispatch({ operationId: 'leads_getPendingExport' })).toEqual([10]);

    expect(
      mock.dispatch({
        operationId: 'leads_getByLastUpdatedSince',
        routePath: '/api/contacts/lastupdatedsince',
        query: {
          date: '2026-01-01T00:00:00Z',
          page: '2',
          itemsPerPage: '1',
          sortOrder: 'Ascending',
        },
      }),
    ).toEqual({
      Page: 2,
      ItemsPerPage: 1,
      TotalRecordCount: 3,
      TotalPages: 3,
      Records: [contacts[1]],
    });
  });

  it('selects users by Lead Docket ID, role, code, and Filevine user ID', () => {
    const intake = {
      Id: 1,
      FirstName: 'Ada',
      Code: 'ADA',
      FilevineUserId: 501,
      Roles: [{ LeadRoleId: 7, RoleName: 'Intake' }],
    };
    const attorney = {
      Id: 2,
      FirstName: 'Grace',
      Code: 'GRACE',
      FilevineUserId: 502,
      Roles: [{ LeadRoleId: 9, RoleName: 'Attorney' }],
    };
    const mock = harness({ users: [intake, attorney] });

    expect(mock.dispatch({ operationId: 'users_list' })).toEqual([intake, attorney]);
    expect(mock.dispatch({ operationId: 'User_byId', pathParams: { id: '2' } })).toBe(attorney);
    expect(mock.dispatch({ operationId: 'users_byRole', query: { leadRoleId: '7' } })).toEqual([
      intake,
    ]);
    expect(mock.dispatch({ operationId: 'User_byCode', pathParams: { code: 'grace' } })).toBe(
      attorney,
    );
    expect(mock.dispatch({ operationId: 'User_byFilevineUserId', pathParams: { id: '501' } })).toBe(
      intake,
    );
  });

  it('handles referral selectors, code commands, and explicit CRUD identities', () => {
    const first = { Id: 1, Name: 'North Firm', Code: 'NORTH', ExternalCode: 'EXT-1' };
    const second = { Id: 2, Name: 'South Firm', ExternalCode: 'EXT-2' };
    const mock = harness({ referrals: [first, second] });

    expect(mock.dispatch({ operationId: 'referrals_GetList' })).toEqual([first, second]);
    expect(mock.dispatch({ operationId: 'referrals_GetById', pathParams: { id: '2' } })).toBe(
      second,
    );
    expect(
      mock.dispatch({
        operationId: 'referrals_GetByExternalCode',
        query: { externalCode: 'ext-1' },
      }),
    ).toBe(first);

    expect(
      mock.dispatch({ operationId: 'referrals_UpdateCode', query: { id: '2', code: 'SOUTH' } }),
    ).toBeUndefined();
    expect(
      mock.dispatch({
        operationId: 'referrals_UpdateExternalCode',
        query: { id: '2', externalCode: 'EXT-NEW' },
      }),
    ).toBeUndefined();
    expect(second).toMatchObject({ Code: 'SOUTH', ExternalCode: 'EXT-NEW' });

    expect(
      mock.dispatch({
        operationId: 'referrals_Edit',
        pathParams: { id: '1' },
        body: { Name: 'North Firm Updated', PracticeArea: 'Injury' },
      }),
    ).toBe(first);
    expect(
      mock.dispatch({
        operationId: 'referrals_Add',
        body: { Name: 'West Firm', PracticeArea: 'Employment' },
      }),
    ).toMatchObject({ Id: 100, Name: 'West Firm' });
    expect(
      mock.dispatch({ operationId: 'referrals_Delete', pathParams: { id: '2' } }),
    ).toBeUndefined();
    expect(mock.stores.referrals).toEqual([first, expect.objectContaining({ Id: 100 })]);
  });

  it('persists created and sent messages with distinct send state', () => {
    const messages: OperationRecord[] = [];
    const mock = harness({ leads: [{ Id: 8 }], messages });

    expect(
      mock.dispatch({
        operationId: 'post /api/messages',
        body: {
          LeadId: 8,
          SendFrom: 'intake@example.com',
          SendTo: 'client@example.com',
          Subject: 'Welcome',
          Body: 'Draft body',
        },
      }),
    ).toMatchObject({
      Id: 100,
      LeadId: 8,
      CreatedOn: '2026-01-02T03:04:05.000Z',
      IsInbound: false,
      HasBeenSent: false,
    });
    expect(
      mock.dispatch({
        operationId: 'post /api/messages/sendtext',
        body: { LeadId: 8, SendTo: '5551234567', Body: 'Sent text' },
      }),
    ).toMatchObject({
      Id: 101,
      LeadId: 8,
      Subject: null,
      HasBeenSent: true,
    });
    expect(
      mock.dispatch({
        operationId: 'post /api/messages/sendemail',
        body: {
          LeadId: 8,
          SendFrom: 'intake@example.com',
          SendTo: 'client@example.com',
          Subject: 'Sent email',
          Body: 'Sent body',
        },
      }),
    ).toMatchObject({ Id: 102, LeadId: 8, Subject: 'Sent email', HasBeenSent: true });
    expect(messages).toHaveLength(3);
  });

  it('uses expense date ranges and settlement lead IDs for selectors and mutations', () => {
    const early = { Id: 1, ExpenseDate: '2026-01-01T00:00:00Z', Amount: 10 };
    const middle = { Id: 2, ExpenseDate: '2026-01-15T00:00:00Z', Amount: 20 };
    const late = { Id: 3, ExpenseDate: '2026-02-01T00:00:00Z', Amount: 30 };
    const firstSettlement = { Id: 20, LeadId: 8, Fee: 1000 };
    const otherSettlement = { Id: 21, LeadId: 9, Fee: 2000 };
    const mock = harness({
      leads: [{ Id: 8 }, { Id: 9 }],
      expenses: [early, middle, late],
      settlements: [firstSettlement, otherSettlement],
    });

    expect(mock.dispatch({ operationId: 'GetExpense', pathParams: { id: '2' } })).toBe(middle);
    expect(
      mock.dispatch({
        operationId: 'GetExpenses',
        query: { startdate: '2026-01-10T00:00:00Z', enddate: '2026-01-31T00:00:00Z' },
      }),
    ).toEqual([middle]);
    expect(
      mock.dispatch({
        operationId: 'AddExpense',
        body: {
          Amount: 40,
          ExpenseDate: '2026-02-15T00:00:00Z',
          MarketingSourceId: 4,
          Vendor: 'Filing service',
        },
      }),
    ).toMatchObject({ Id: 100, Amount: 40 });
    mock.dispatch({ operationId: 'Expenses_Delete', pathParams: { id: '1' } });
    expect(mock.stores.expenses).not.toContain(early);

    expect(
      mock.dispatch({ operationId: 'Settlements_GetSettlement', pathParams: { id: '20' } }),
    ).toBe(firstSettlement);
    expect(
      mock.dispatch({ operationId: 'GetSettlementsByLeadId', pathParams: { id: '8' } }),
    ).toEqual([firstSettlement]);
    expect(
      mock.dispatch({
        operationId: 'AddSettlement',
        body: { LeadId: 8, Fee: 3000, Summary: 'Resolved' },
      }),
    ).toMatchObject({ Id: 101, LeadId: 8, Fee: 3000 });
  });

  it('uses explicit path and query identities for updates and lead relationships', () => {
    const contact = { Id: 3, FirstName: 'Old', LastName: 'Name' };
    const lead: OperationRecord = { Id: 7, Summary: 'Old summary' };
    const user = {
      Id: 11,
      FirstName: 'Attorney',
      Roles: [{ LeadRoleId: 9, RoleName: 'Attorney' }],
    };
    const mock = harness({ contacts: [contact], leads: [lead], users: [user] });

    expect(
      mock.dispatch({
        operationId: 'contacts_update',
        pathParams: { id: '3' },
        body: { FirstName: 'Updated' },
      }),
    ).toBe(contact);
    expect(
      mock.dispatch({
        operationId: 'Lead_Update',
        pathParams: { id: '7' },
        body: { Summary: 'Updated summary' },
      }),
    ).toBeUndefined();
    expect(
      mock.dispatch({
        operationId: 'leads_postAddRelatedContact',
        query: {
          leadid: '7',
          contactid: '3',
          relationship: 'Spouse',
          additionalplaintiff: 'true',
        },
      }),
    ).toBeUndefined();
    expect(
      mock.dispatch({
        operationId: 'leads_patchUpdateLeadRoleUser',
        query: { leadid: '7', leadRoleId: '9', assignToUserId: '11' },
      }),
    ).toBeUndefined();

    expect(contact.FirstName).toBe('Updated');
    expect(lead.Summary).toBe('Updated summary');
    expect(lead.RelatedContacts).toEqual([
      { Relationship: 'Spouse', IsPlaintiff: true, Contact: contact },
    ]);
    expect(lead.AssignedTo).toEqual([
      expect.objectContaining({ Id: 11, LeadRoleId: 9, RoleName: 'Attorney' }),
    ]);
  });

  it('does not claim unregistered operations through substring inference', () => {
    const dependencies: OperationDependencies = {
      getStore: () => [],
      allocateId: () => 1,
      now: () => '2026-01-01T00:00:00.000Z',
      fail: (status, message) => {
        throw new TestOperationError(status, message);
      },
    };

    expect(
      dispatchMockOperation(
        { operationId: 'contacts_deleteSomethingUnrelated', pathParams: { id: '1' } },
        dependencies,
      ),
    ).toEqual({ handled: false });
    expect(
      dispatchMockOperation(
        {
          operationId: 'leads_getByLastUpdatedSince',
          routePath: '/api/not-the-duplicated-route',
        },
        dependencies,
      ),
    ).toEqual({ handled: false });
  });
});
