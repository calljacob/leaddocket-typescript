// Generated from openapi.json for the mock API. Do not edit by hand.

export type MockRouteDefinition = {
  method: string;
  path: string;
  operationId: string;
  tags: string[];
  summary: string;
  status: number;
  responseSchema: unknown;
  requestSchema: unknown;
};

export const mockRouteDefinitions = [
  {
    "method": "GET",
    "path": "/api/contactcustomfields/list",
    "operationId": "ContactCustomFields_Get",
    "tags": [
      "ContactCustomFields"
    ],
    "summary": "Returns a list of contact custom fields",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CustomFieldsApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/contacts",
    "operationId": "contacts_add",
    "tags": [
      "Contacts"
    ],
    "summary": "Adds a new contact.",
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/ContactUpdateApi"
    },
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/contacts/{id}",
    "operationId": "contacts_getById",
    "tags": [
      "Contacts"
    ],
    "summary": "Returns a single contact",
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/contacts/{id}",
    "operationId": "contacts_update",
    "tags": [
      "Contacts"
    ],
    "summary": "Updates an exist contact.",
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/ContactUpdateApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/contacts/{id}/tags/{contactTagId}",
    "operationId": "contacts_deleteTag",
    "tags": [
      "Contacts"
    ],
    "summary": "Delete Tag from Contact",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/contacts/{id}/tags/{tagId}",
    "operationId": "contacts_addTag",
    "tags": [
      "Contacts"
    ],
    "summary": "Add Tag to Contact",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/contacts/checkforrecentbyphone",
    "operationId": "contacts_recent_by_phone",
    "tags": [
      "Contacts"
    ],
    "summary": "Search for most recent lead or opportunity by phone",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CheckForRecentByPhoneModel"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/contacts/getbycode",
    "operationId": "contacts_getByCode",
    "tags": [
      "Contacts"
    ],
    "summary": "Returns a single contact",
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/contacts/lastupdatedsince",
    "operationId": "leads_getByLastUpdatedSince",
    "tags": [
      "Contacts"
    ],
    "summary": "Get all contacts based on last updated date.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/contacts/search",
    "operationId": "contacts_search",
    "tags": [
      "Contacts"
    ],
    "summary": "Search for a contact by name, email, or phone",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ContactApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/contacts/updatecode",
    "operationId": "contacts_updatecode",
    "tags": [
      "Contacts"
    ],
    "summary": "Update Case Tracker Code on a Contact",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/contacts/updatecustomfields",
    "operationId": "contacts_putUpdateCustomFields",
    "tags": [
      "Contacts"
    ],
    "summary": "Updates custom fields on a contact",
    "responseSchema": null,
    "requestSchema": {
      "$ref": "#/components/schemas/CustomFieldsUpdateApi"
    },
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/customfields/list",
    "operationId": "CustomFields_Get",
    "tags": [
      "CustomFields"
    ],
    "summary": "Returns a list of lead custom fields",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CustomFieldsApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/expenses",
    "operationId": "AddExpense",
    "tags": [
      "Expenses"
    ],
    "summary": "Adds a new Expense",
    "responseSchema": {
      "$ref": "#/components/schemas/ExpenseApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/ExpenseAddApi"
    },
    "status": 201
  },
  {
    "method": "GET",
    "path": "/api/expenses/{id}",
    "operationId": "GetExpense",
    "tags": [
      "Expenses"
    ],
    "summary": "Returns expense details by expense Id",
    "responseSchema": {
      "$ref": "#/components/schemas/ExpenseApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/expenses/delete/{id}",
    "operationId": "Expenses_Delete",
    "tags": [
      "Expenses"
    ],
    "summary": "Delete an Expense from the system.",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/expenses/getlist",
    "operationId": "GetExpenses",
    "tags": [
      "Expenses"
    ],
    "summary": "Gets all expenses based in a given date range",
    "responseSchema": {
      "$ref": "#/components/schemas/ExpenseApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/externalcalls/{id}",
    "operationId": "external_calls_getById",
    "tags": [
      "ExternalCalls"
    ],
    "summary": "Gets an external phone call by its unified `dbo.PhoneCalls.Id`.",
    "responseSchema": {
      "$ref": "#/components/schemas/ExternalPhoneCall"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/externalcalls/{id}/recording",
    "operationId": "external_calls_getRecording",
    "tags": [
      "ExternalCalls"
    ],
    "summary": "Gets the recording file for an external phone call",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/externalcalls/{id}/transcription",
    "operationId": "external_calls_getTranscription",
    "tags": [
      "ExternalCalls"
    ],
    "summary": "Gets the transcription file for an external phone call",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/externalcalls/end",
    "operationId": "external_calls_end",
    "tags": [
      "ExternalCalls"
    ],
    "summary": "Ends an external phone call",
    "responseSchema": {
      "$ref": "#/components/schemas/CallEventResponse"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/EndExternalCallRequest"
    },
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/externalcalls/start",
    "operationId": "external_calls_start",
    "tags": [
      "ExternalCalls"
    ],
    "summary": "Starts an external phone call",
    "responseSchema": {
      "$ref": "#/components/schemas/CallEventResponse"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/StartExternalCallRequest"
    },
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leadroles",
    "operationId": "get /api/leadroles",
    "tags": [
      "LeadRoles"
    ],
    "summary": "Returns a list of all lead roles",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/leadroles/{id}",
    "operationId": "LeadRole_Delete",
    "tags": [
      "LeadRoles"
    ],
    "summary": "Delete a Lead Role",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads",
    "operationId": "leads_getByStatus",
    "tags": [
      "Leads"
    ],
    "summary": "Returns  all leads based on the provided lead status. This request is paged.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/{id}",
    "operationId": "leads_getById",
    "tags": [
      "Leads"
    ],
    "summary": "Returns a single lead with full information.\r\n - This endpoint will have strict throttling of 25 requests per minute by 11/1/2025.\r\n - Consider using either the `basic` or `detailed` endpoints for higher throughput",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/{id}",
    "operationId": "Lead_Update",
    "tags": [
      "Leads"
    ],
    "summary": "Update properties of an existing LeadDocket.Core.Models.Lead.",
    "responseSchema": null,
    "requestSchema": {
      "$ref": "#/components/schemas/LeadUpdateApi"
    },
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/{id}/appointments/schedule",
    "operationId": "patch /api/leads/{id}/appointments/schedule",
    "tags": [
      "Leads"
    ],
    "summary": "Creates an appointment for the specified lead.",
    "responseSchema": null,
    "requestSchema": {
      "$ref": "#/components/schemas/ScheduleAppointmentApi"
    },
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{id}/files/{fileId}/associatefilewithfield/{fieldId}",
    "operationId": "post /api/leads/{id}/files/{fileId}/associatefilewithfield/{fieldId}",
    "tags": [
      "Leads"
    ],
    "summary": "Associate an uploaded file with a custom field",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFileUploadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{id}/files/{fileId}finalizeupload",
    "operationId": "post /api/leads/{id}/files/{fileId}finalizeupload",
    "tags": [
      "Leads"
    ],
    "summary": "Completes large file upload after using getuploadurl",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFileUploadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{id}/files/getuploadurl",
    "operationId": "post /api/leads/{id}/files/getuploadurl",
    "tags": [
      "Leads"
    ],
    "summary": "Create a URL for a large file upload.Requires a call to finalizeupload after upload. Max file size allowed is 500MB.",
    "responseSchema": {
      "$ref": "#/components/schemas/BlobUrlResponseModel"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{id}/files/upload",
    "operationId": "post /api/leads/{id}/files/upload",
    "tags": [
      "Leads"
    ],
    "summary": "Uploads a file to a lead. Max file size allowed is 30MB",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFileUploadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{id}/notes",
    "operationId": "post /api/leads/{id}/notes",
    "tags": [
      "Leads"
    ],
    "summary": "Adds a new note for the specified lead.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadNoteApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/LeadNoteAddApi"
    },
    "status": 201
  },
  {
    "method": "DELETE",
    "path": "/api/leads/{id}/notes/{noteId}",
    "operationId": "delete /api/leads/{id}/notes/{noteId}",
    "tags": [
      "Leads"
    ],
    "summary": "Deletes a lead note.",
    "responseSchema": null,
    "requestSchema": null,
    "status": 204
  },
  {
    "method": "PUT",
    "path": "/api/leads/{id}/notes/{noteId}",
    "operationId": "put /api/leads/{id}/notes/{noteId}",
    "tags": [
      "Leads"
    ],
    "summary": "Updates an existing lead note.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadNoteApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/LeadNoteUpdateApi"
    },
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/{id}/status/change",
    "operationId": "patch /api/leads/{id}/status/change",
    "tags": [
      "Leads"
    ],
    "summary": "Change the status of the specified lead.",
    "responseSchema": null,
    "requestSchema": {
      "$ref": "#/components/schemas/ChangeLeadStatusApi"
    },
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/{id}/substatus/advance",
    "operationId": "patch /api/leads/{id}/substatus/advance",
    "tags": [
      "Leads"
    ],
    "summary": "Moves the leads to the next sub status if one is available. Accepts current Lead Status and Substatus to prevent unexpected status changes",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/{leadId}/collectionsections",
    "operationId": "CollectionSections_List",
    "tags": [
      "CollectionSections"
    ],
    "summary": "Retrieve all Collection Sections and section entries for a Lead",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/leads/{leadId}/collectionsections/{sectionId}",
    "operationId": "CollectionSections_Delete",
    "tags": [
      "CollectionSections"
    ],
    "summary": "Delete existing entries in a Collection Section for a Lead",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/CollectionSectionDeleteApi"
    },
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/{leadId}/collectionsections/{sectionId}",
    "operationId": "CollectionSections_Update",
    "tags": [
      "CollectionSections"
    ],
    "summary": "Update existing entries in a Collection Section for a Lead",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/CollectionSectionUpdateApi"
    },
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{leadId}/collectionsections/{sectionId}",
    "operationId": "CollectionSections_Add",
    "tags": [
      "CollectionSections"
    ],
    "summary": "Insert a new entry into a Collection Section for a Lead",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/CollectionSectionUpdateApi"
    },
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/{leadId}/forms",
    "operationId": "LeadForms_GetLeadFormInvitation",
    "tags": [
      "LeadForms"
    ],
    "summary": "Retrieve an invitation for a LeadForm for a given Lead",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormInvitationApiApiHypermedia"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/{leadId}/forms",
    "operationId": "LeadForms_CreateLeadFormInvitation",
    "tags": [
      "LeadForms"
    ],
    "summary": "Create an invitation for a LeadForm for a given Lead",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormInvitationApiApiHypermedia"
    },
    "requestSchema": null,
    "status": 201
  },
  {
    "method": "POST",
    "path": "/api/leads/addrelatedcontact",
    "operationId": "leads_postAddRelatedContact",
    "tags": [
      "Leads"
    ],
    "summary": "Add related contact to a lead",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/basic/{id}",
    "operationId": "leads_getBasicById",
    "tags": [
      "Leads"
    ],
    "summary": "Returns a single lead basic information by Id without notes, messages, and other lists",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/detailed/{id}",
    "operationId": "leads_getDetailedById",
    "tags": [
      "Leads"
    ],
    "summary": "Returns a single lead by Id with parameters to request additional lead details.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/files/download/{id}",
    "operationId": "DownloadFile",
    "tags": [
      "Leads"
    ],
    "summary": "Downloads a lead file by Id",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/forms",
    "operationId": "LeadForms_GetAll",
    "tags": [
      "LeadForms"
    ],
    "summary": "Get a list of all LeadForms set up for this host. Does not include fields; use `GetById` to see the fields on a form.",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/forms",
    "operationId": "LeadForms_Create",
    "tags": [
      "LeadForms"
    ],
    "summary": "Create a new LeadForm on the host for a given CaseType.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormCreateApi"
    },
    "status": 201
  },
  {
    "method": "DELETE",
    "path": "/api/leads/forms/{id}",
    "operationId": "LeadForms_Delete",
    "tags": [
      "LeadForms"
    ],
    "summary": "Delete a LeadForm from the system.",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/forms/{id}",
    "operationId": "LeadForms_GetById",
    "tags": [
      "LeadForms"
    ],
    "summary": "Get detailed info about the given LeadForm",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/forms/{id}",
    "operationId": "LeadForms_Update",
    "tags": [
      "LeadForms"
    ],
    "summary": "Update properties of an existing LeadForm",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormUpdateApi"
    },
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/forms/{id}/field",
    "operationId": "LeadForms_AddField",
    "tags": [
      "LeadForms"
    ],
    "summary": "Add a new field to an existing LeadForm.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormFieldApiApiHypermedia"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormFieldAddApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/leads/forms/{id}/field/{fieldId}",
    "operationId": "LeadForms_DeleteField",
    "tags": [
      "LeadForms"
    ],
    "summary": "Delete a LeadFormField from a LeadForm",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/forms/{id}/field/{fieldId}",
    "operationId": "LeadForms_UpdateField",
    "tags": [
      "LeadForms"
    ],
    "summary": "Update properties of an existing LeadFormField",
    "responseSchema": null,
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormFieldUpdateApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/leads/forms/{id}/fields",
    "operationId": "LeadForms_DeleteFields",
    "tags": [
      "LeadForms"
    ],
    "summary": "Delete all LeadFormFields from a LeadForm by FieldType",
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "integer",
        "format": "int32"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/getbycode",
    "operationId": "leads_getByCode",
    "tags": [
      "Leads"
    ],
    "summary": "Returns a single lead by Case Tracker Code",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/getbyopportunityid",
    "operationId": "leads_getByOpportunityId",
    "tags": [
      "Leads"
    ],
    "summary": "Returns a single lead by Opportunity Id",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/getcustomfield",
    "operationId": "leads_getCustomField",
    "tags": [
      "Leads"
    ],
    "summary": "Get the value of single custom field on a lead",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/laststatuschangesince",
    "operationId": "leads_getByLastStatusChangeSince",
    "tags": [
      "Leads"
    ],
    "summary": "Gets all leads based on last status change date",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/lastupdatedsince",
    "operationId": "leads_getByLastUpdatedSince",
    "tags": [
      "Leads"
    ],
    "summary": "Gets all leads based on last updated date. This covers status change and edit events.",
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/leads/markasprocessed",
    "operationId": "leads_putMarkAsProcessed",
    "tags": [
      "Leads"
    ],
    "summary": "Marks a lead as having been sent to the external case management system",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leads/pendingexportids",
    "operationId": "leads_getPendingExport",
    "tags": [
      "Leads"
    ],
    "summary": "Returns a list of Lead Ids eligible to export to Case Management System",
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "integer",
        "format": "int32"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/leads/updatecode",
    "operationId": "leads_putUpdateCode",
    "tags": [
      "Leads"
    ],
    "summary": "Update Case Tracker Code on a Lead",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/leads/updatecustomfield",
    "operationId": "leads_putUpdateCustomField",
    "tags": [
      "Leads"
    ],
    "summary": "Updates a single custom field on a lead",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/updatecustomfields",
    "operationId": "leads_putUpdateCustomFields",
    "tags": [
      "Leads"
    ],
    "summary": "Updates custom fields on a lead",
    "responseSchema": null,
    "requestSchema": {
      "$ref": "#/components/schemas/CustomFieldsUpdateApi"
    },
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/leads/updateleadroleuser",
    "operationId": "leads_patchUpdateLeadRoleUser",
    "tags": [
      "Leads"
    ],
    "summary": "Update a lead role user on a single lead",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/leadsources/list",
    "operationId": "get /api/leadsources/list",
    "tags": [
      "LeadSources"
    ],
    "summary": "Returns a list of all lead sources",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/lookups",
    "operationId": "get /api/lookups",
    "tags": [
      "Lookups"
    ],
    "summary": "Returns a list of items by lookup type",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/lookups/gettypes",
    "operationId": "get /api/lookups/gettypes",
    "tags": [
      "Lookups"
    ],
    "summary": "Returns a list of possible lookup types to be used in /api/lookups",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/messages",
    "operationId": "post /api/messages",
    "tags": [
      "Messages"
    ],
    "summary": "Create a new message/email related to a specific lead.",
    "responseSchema": {
      "$ref": "#/components/schemas/MessageApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/MessageAddApi"
    },
    "status": 201
  },
  {
    "method": "POST",
    "path": "/api/messages/sendemail",
    "operationId": "post /api/messages/sendemail",
    "tags": [
      "Messages"
    ],
    "summary": "Send an email message to a lead.",
    "responseSchema": {
      "$ref": "#/components/schemas/MessageApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/SendEmailMessageApi"
    },
    "status": 201
  },
  {
    "method": "POST",
    "path": "/api/messages/sendtext",
    "operationId": "post /api/messages/sendtext",
    "tags": [
      "Messages"
    ],
    "summary": "Send a text message to a lead. (SMS messages sent beyond plan limits will incur an overage charge.)",
    "responseSchema": {
      "$ref": "#/components/schemas/MessageApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/SendTextMessageApi"
    },
    "status": 201
  },
  {
    "method": "GET",
    "path": "/api/opportunities/{id}",
    "operationId": "opportunities_GetOpportunityById",
    "tags": [
      "Opportunities"
    ],
    "summary": "Returns an opportunity by Id",
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/opportunities/appendnote",
    "operationId": "opportunities_AppendNote",
    "tags": [
      "Opportunities"
    ],
    "summary": "Adds information to the notes field on an unprocessed Opportunity",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/opportunities/clearnote",
    "operationId": "opportunities_ClearNote",
    "tags": [
      "Opportunities"
    ],
    "summary": "Clears the note field for an opportunity",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/opportunities/createdsince",
    "operationId": "opportunities_getCreatedSince",
    "tags": [
      "Opportunities"
    ],
    "summary": "Gets all opportunities created since a specific date.",
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApiFlatApiPagedResponse"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/opportunities/disregard",
    "operationId": "opportunities_Disregard",
    "tags": [
      "Opportunities"
    ],
    "summary": "Marks an opportunity as disregarded. Optionally accepts a reason string",
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/opportunities/getlistunprocessed",
    "operationId": "opportunities_getListUnprocessed",
    "tags": [
      "Opportunities"
    ],
    "summary": "Gets all opportunities that haven't been processed",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/OpportunityApiFlat"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/opportunities/lastupdatedsince",
    "operationId": "opportunities_getLastUpdatedSince",
    "tags": [
      "Opportunities"
    ],
    "summary": "Gets all opportunities last updated since a specific date. This request is paged.",
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApiFlatApiPagedResponse"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/opportunities/lock",
    "operationId": "opportunities_Lock",
    "tags": [
      "Opportunities"
    ],
    "summary": "Lock an opportunity for 30 minutes. This prevents interactive users from opening this opportunity",
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/opportunities/unlock",
    "operationId": "opportunities_Unlock",
    "tags": [
      "Opportunities"
    ],
    "summary": "Unlock a locked opportunity. This allows interactive users to open this opportunity",
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/referrals",
    "operationId": "referrals_Add",
    "tags": [
      "Referrals"
    ],
    "summary": "Adds a new referral source",
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceAddApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/ReferralSourceAddApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/referrals/{id}",
    "operationId": "referrals_Delete",
    "tags": [
      "Referrals"
    ],
    "summary": "Deletes a referral source",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/referrals/{id}",
    "operationId": "referrals_GetById",
    "tags": [
      "Referrals"
    ],
    "summary": "Returns referral details by referral source Id",
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/referrals/{id}",
    "operationId": "referrals_Edit",
    "tags": [
      "Referrals"
    ],
    "summary": "Edits an existing referral source",
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/ReferralSourceAddApi"
    },
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/referrals/getbyexternalcode",
    "operationId": "referrals_GetByExternalCode",
    "tags": [
      "Referrals"
    ],
    "summary": "Returns referral details by external code. If more than one matches, returns the first",
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/referrals/list",
    "operationId": "referrals_GetList",
    "tags": [
      "Referrals"
    ],
    "summary": "Returns a list of referral sources",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ReferralSourceApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/referrals/listgroups",
    "operationId": "referralGroups_GetList",
    "tags": [
      "Referrals"
    ],
    "summary": "Returns a list of referral groups",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ReferralGroupApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/referrals/listpracticeareas",
    "operationId": "referrals_PracticeAreas",
    "tags": [
      "Referrals"
    ],
    "summary": "Unique practice areas list used on referral sources",
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/referrals/updatecode",
    "operationId": "referrals_UpdateCode",
    "tags": [
      "Referrals"
    ],
    "summary": "Update Case Tracker Code on a Referral Source",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/referrals/updateexternalcode",
    "operationId": "referrals_UpdateExternalCode",
    "tags": [
      "Referrals"
    ],
    "summary": "Update External Code on a Referral Source",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/settings/get-options",
    "operationId": "settings_get-options",
    "tags": [
      "Settings"
    ],
    "summary": "",
    "responseSchema": {
      "$ref": "#/components/schemas/SettingsOptions"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/settlements",
    "operationId": "AddSettlement",
    "tags": [
      "Settlements"
    ],
    "summary": "Adds a new settlement record for the specified lead.",
    "responseSchema": {
      "$ref": "#/components/schemas/SettlementApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/SettlementAddApi"
    },
    "status": 201
  },
  {
    "method": "GET",
    "path": "/api/settlements/{id}",
    "operationId": "Settlements_GetSettlement",
    "tags": [
      "Settlements"
    ],
    "summary": "Returns settlement details by settlement Id",
    "responseSchema": {
      "$ref": "#/components/schemas/SettlementApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/settlements/getbyleadid/{id}",
    "operationId": "GetSettlementsByLeadId",
    "tags": [
      "Settlements"
    ],
    "summary": "Returns list of settlement details by lead Id",
    "responseSchema": {
      "$ref": "#/components/schemas/SettlementApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/statuses",
    "operationId": "Statuses_GetAll",
    "tags": [
      "Statuses"
    ],
    "summary": "Get a list of all LeadDocket.Core.Models.Statuses",
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermediaListApiHypermedia"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/statuses",
    "operationId": "Status_Create",
    "tags": [
      "Statuses"
    ],
    "summary": "Create a new LeadDocket.Core.Models.Status and zero or more new LeadDocket.Core.Models.Substatuses that are associated with the LeadDocket.Core.Models.Status",
    "responseSchema": {
      "$ref": "#/components/schemas/StatusCreateApiApiHypermedia"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/StatusCreateApi"
    },
    "status": 201
  },
  {
    "method": "GET",
    "path": "/api/statuses/{id}",
    "operationId": "Statuses_GetById",
    "tags": [
      "Statuses"
    ],
    "summary": "Retrieve a LeadDocket.Core.Models.Status by id",
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/statuses/{id}",
    "operationId": "Status_Update",
    "tags": [
      "Statuses"
    ],
    "summary": "Update properties of an existing LeadDocket.Core.Models.Status.  You cannot update LeadDocket.Core.Models.Substatuses on this LeadDocket.Core.Models.Status using this method",
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/StatusUpdateApi"
    },
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/statuses/{statusId}/substatus",
    "operationId": "SubStatus_Create",
    "tags": [
      "Statuses"
    ],
    "summary": "Create one or more new LeadDocket.Core.Models.Substatuses on a LeadDocket.Core.Models.Status",
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "requestSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/SubStatusCreateApi"
      }
    },
    "status": 201
  },
  {
    "method": "DELETE",
    "path": "/api/statuses/{statusId}/substatus/{substatusId}",
    "operationId": "Substatus_Delete",
    "tags": [
      "Statuses"
    ],
    "summary": "Delete a Substatus from a Status",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PATCH",
    "path": "/api/statuses/{statusId}/substatus/{subStatusId}",
    "operationId": "SubStatus_Update",
    "tags": [
      "Statuses"
    ],
    "summary": "Update properties of an existing LeadDocket.Core.Models.Substatus.",
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/SubStatusUpdateApi"
    },
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/tasks",
    "operationId": "task_add",
    "tags": [
      "Tasks"
    ],
    "summary": "Create task on a lead",
    "responseSchema": {
      "$ref": "#/components/schemas/TaskApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/TaskCreateApi"
    },
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/tasks",
    "operationId": "put /api/tasks",
    "tags": [
      "Tasks"
    ],
    "summary": "Update a task",
    "responseSchema": {
      "$ref": "#/components/schemas/TaskApi"
    },
    "requestSchema": {
      "$ref": "#/components/schemas/TaskUpdateApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/tasks/{id}",
    "operationId": "delete /api/tasks/{id}",
    "tags": [
      "Tasks"
    ],
    "summary": "delete a task",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/tasks/{id}",
    "operationId": "get /api/tasks/{id}",
    "tags": [
      "Tasks"
    ],
    "summary": "Get task by Id",
    "responseSchema": {
      "$ref": "#/components/schemas/TaskApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/tasks/leads/{leadId}",
    "operationId": "get /api/tasks/leads/{leadId}",
    "tags": [
      "Tasks"
    ],
    "summary": "Get list of tasks for a lead",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/TaskApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "PUT",
    "path": "/api/tasks/markcomplete/{id}",
    "operationId": "put /api/tasks/markcomplete/{id}",
    "tags": [
      "Tasks"
    ],
    "summary": "Mark a task complete",
    "responseSchema": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/users",
    "operationId": "users_list",
    "tags": [
      "Users"
    ],
    "summary": "Returns a list of Lead Docket users",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/users/{id}",
    "operationId": "User_byId",
    "tags": [
      "Users"
    ],
    "summary": "Returns a single users by ID",
    "responseSchema": {
      "$ref": "#/components/schemas/UserApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/users/byrole",
    "operationId": "users_byRole",
    "tags": [
      "Users"
    ],
    "summary": "Returns a list of users with a given Role ID",
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserApi"
      }
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/users/getuserbycode/{code}",
    "operationId": "User_byCode",
    "tags": [
      "Users"
    ],
    "summary": "Returns a single users by code",
    "responseSchema": {
      "$ref": "#/components/schemas/UserApi"
    },
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/users/getuserbyfilevineuserid/{id}",
    "operationId": "User_byFilevineUserId",
    "tags": [
      "Users"
    ],
    "summary": "Returns a single users by Filevine User Id",
    "responseSchema": {
      "$ref": "#/components/schemas/UserApi"
    },
    "requestSchema": null,
    "status": 200
  }
] as const satisfies readonly MockRouteDefinition[];
