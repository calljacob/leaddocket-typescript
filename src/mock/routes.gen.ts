// Generated from openapi.json for the mock API. Do not edit by hand.

export type MockRouteDefinition = {
  method: string;
  path: string;
  operationId: string;
  tags: string[];
  summary: string;
  parameters: readonly unknown[];
  requestBodyRequired: boolean;
  status: number;
  responseSchema: unknown;
  responseContentType: string | null;
  requestSchema: unknown;
};

export const mockRouteDefinitions = [
  {
    "method": "GET",
    "path": "/api/leads/{leadId}/collectionsections",
    "operationId": "CollectionSections_List",
    "tags": [
      "CollectionSections"
    ],
    "summary": "Retrieve all Collection Sections and section entries for a Lead",
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "ID of the Lead",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "responseContentType": "application/json",
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "ID of the Lead",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "sectionId",
        "in": "path",
        "description": "ID of the Collection Section",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/CollectionSectionUpdateApi"
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
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "ID of the Lead",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "sectionId",
        "in": "path",
        "description": "ID of the Collection Section",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/CollectionSectionUpdateApi"
    },
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
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "ID of the Lead",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "sectionId",
        "in": "path",
        "description": "ID of the Collection Section",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadCollectionSectionApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/CollectionSectionDeleteApi"
    },
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/contactcustomfields/list",
    "operationId": "ContactCustomFields_Get",
    "tags": [
      "ContactCustomFields"
    ],
    "summary": "Returns a list of contact custom fields",
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CustomFieldsApi"
      }
    },
    "responseContentType": "application/json",
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Contact ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Contact ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/ContactUpdateApi"
    },
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
    "parameters": [
      {
        "name": "code",
        "in": "query",
        "description": "Case Tracker Code",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "searchTerm",
        "in": "query",
        "description": "Search Term",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ContactApi"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Lead Docket Contact ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "externalId",
        "in": "query",
        "description": "Case Tracker Code from external system",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": {
      "$ref": "#/components/schemas/CustomFieldsUpdateApi"
    },
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/ContactApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/ContactUpdateApi"
    },
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
    "parameters": [
      {
        "name": "phone",
        "in": "query",
        "description": "Phone Number",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CheckForRecentByPhoneModel"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "date",
        "in": "query",
        "description": "Contacts updated since this date.",
        "required": true,
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      },
      {
        "name": "page",
        "in": "query",
        "description": "Page of the record set. Defaults to 1 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 1
        }
      },
      {
        "name": "itemsPerPage",
        "in": "query",
        "description": "Number of items per page request. Maximum is 500, defaults to 500 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 500
        }
      },
      {
        "name": "sortOrder",
        "in": "query",
        "description": "Order by Last Updated ascending or descending.",
        "schema": {
          "$ref": "#/components/schemas/SortOrder"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Contact ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "tagId",
        "in": "path",
        "description": "Tag ID to add",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Contact ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "contactTagId",
        "in": "path",
        "description": "Contact Tag ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/CustomFieldsApi"
      }
    },
    "responseContentType": "application/json",
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/expenses/{id}",
    "operationId": "GetExpense",
    "tags": [
      "Expenses"
    ],
    "summary": "Returns expense details by expense Id",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Expense Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ExpenseApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "startdate",
        "in": "query",
        "description": "Start of range",
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      },
      {
        "name": "enddate",
        "in": "query",
        "description": "End of range",
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ExpenseApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/ExpenseApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/ExpenseAddApi"
    },
    "status": 201
  },
  {
    "method": "DELETE",
    "path": "/api/expenses/delete/{id}",
    "operationId": "Expenses_Delete",
    "tags": [
      "Expenses"
    ],
    "summary": "Delete an Expense from the system.",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the Expense to delete",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/CallEventResponse"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/StartExternalCallRequest"
    },
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/CallEventResponse"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/EndExternalCallRequest"
    },
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Unified phone call ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ExternalPhoneCall"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "External phone call ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": "audio/mp3",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "External phone call ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": "text/plain",
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormInvitationApiApiHypermedia"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "contactMethod",
        "in": "query",
        "description": "contact method to send the invitation; if not specified, uses Email",
        "schema": {
          "$ref": "#/components/schemas/ContactMethods"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormInvitationApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": null,
    "status": 201
  },
  {
    "method": "GET",
    "path": "/api/leads/forms",
    "operationId": "LeadForms_GetAll",
    "tags": [
      "LeadForms"
    ],
    "summary": "Get a list of all LeadForms set up for this host. Does not include fields; use `GetById` to see the fields on a form.",
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormCreateApi"
    },
    "status": 201
  },
  {
    "method": "GET",
    "path": "/api/leads/forms/{id}",
    "operationId": "LeadForms_GetById",
    "tags": [
      "LeadForms"
    ],
    "summary": "Get detailed info about the given LeadForm",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormUpdateApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/leads/forms/{id}",
    "operationId": "LeadForms_Delete",
    "tags": [
      "LeadForms"
    ],
    "summary": "Delete a LeadForm from the system.",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm to delete",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm to add the field to",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFormFieldApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormFieldAddApi"
    },
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fieldId",
        "in": "path",
        "description": "ID of the LeadFormField to update",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": {
      "$ref": "#/components/schemas/LeadFormFieldUpdateApi"
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fieldId",
        "in": "path",
        "description": "ID of the LeadFormField to delete",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadForm",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fieldType",
        "in": "query",
        "description": "FieldType of the fields to delete (`Lead` and `Contact` are custom fields)",
        "required": true,
        "schema": {
          "$ref": "#/components/schemas/FieldType"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "integer",
        "format": "int32"
      }
    },
    "responseContentType": "application/json",
    "requestSchema": null,
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the Lead Role to delete",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "status",
        "in": "query",
        "description": "The status ID for the Leads to get.",
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "subStatusIds",
        "in": "query",
        "description": "Optional comma separated list of sub statuses to get.",
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "page",
        "in": "query",
        "description": "Page of the record set. Defaults to 1 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 1
        }
      },
      {
        "name": "itemsPerPage",
        "in": "query",
        "description": "Number of items per paged request. Maximum is 500, defaults to 500 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 500
        }
      },
      {
        "name": "sortOrder",
        "in": "query",
        "description": "Order by Last Status Change Date ascending or descending",
        "schema": {
          "$ref": "#/components/schemas/SortOrder"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadDocket.Core.Models.Lead",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": {
      "$ref": "#/components/schemas/LeadUpdateApi"
    },
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "flags",
        "in": "query",
        "description": "Bitwise flags indicating which related entities to include.\r\nPlease opt into the specific details you require.\r\nPossible values (combine using bitwise OR):\r\n            \r\n| Flag                                      | Description\r\n|-------------------------------------------|-------------------------------------------------------------\r\n| Sources                                   | Include lead source information.\r\n| SeverityLevel                             | Include severity level information.\r\n| PhoneCalls                                | Include phone call information.\r\n| Office                                    | Include office information.\r\n| Opportunity                               | Include opportunity information.\r\n| Creator                                   | Include lead creator information.\r\n| ReferredTo                                | Include referred to contact information.\r\n| ReferredBy                                | Include referred by contact information.\r\n| LeadStatusHistory                         | Include lead status history.\r\n| RelatedContacts                           | Include related contacts.\r\n| ContactCustomFields                       | Include contact custom fields.\r\n| LeadCustomFields                          | Include lead custom fields.\r\n| LeadNotes                                 | Include lead notes.\r\n| Tasks                                     | Include tasks.\r\n| Messages                                  | Include messages.\r\n| LeadFiles                                 | Include lead files.\r\n| EsignDocuments                            | Include esign documents.\r\n| Settlements                               | Include settlements.\r\n| CollectionSectionEntries                  | Include collection section entries.",
        "schema": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/LeadRelatedEntityTypeAPI"
          }
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "code",
        "in": "query",
        "description": "Case Tracker Code",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "opportunityId",
        "in": "query",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "integer",
        "format": "int32"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "date",
        "in": "query",
        "description": "Leads with a status change since this date",
        "required": true,
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      },
      {
        "name": "page",
        "in": "query",
        "description": "Page of the record set. Defaults to 1 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 1
        }
      },
      {
        "name": "itemsPerPage",
        "in": "query",
        "description": "Number of items per paged request. Maximum is 500, defaults to 500 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 500
        }
      },
      {
        "name": "sortOrder",
        "in": "query",
        "description": "Order by Last Status Change Date ascending or descending",
        "schema": {
          "$ref": "#/components/schemas/SortOrder"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "date",
        "in": "query",
        "description": "Leads updated since this date",
        "required": true,
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      },
      {
        "name": "page",
        "in": "query",
        "description": "Page of the record set. Defaults to 1 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 1
        }
      },
      {
        "name": "itemsPerPage",
        "in": "query",
        "description": "Number of items per paged request. Maximum is 500, defaults to 500 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 500
        }
      },
      {
        "name": "sortOrder",
        "in": "query",
        "description": "Order by Last Updated ascending or descending",
        "schema": {
          "$ref": "#/components/schemas/SortOrder"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadApiFlatApiPagedResponse"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Lead Docket Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "externalId",
        "in": "query",
        "description": "Case Tracker Code from external system",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Custom Field Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "leadId",
        "in": "query",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "value",
        "in": "query",
        "description": "Custom Field Value",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Custom Field Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "leadId",
        "in": "query",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": {
      "$ref": "#/components/schemas/CustomFieldsUpdateApi"
    },
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Lead Docket Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "markprocessed",
        "in": "query",
        "description": "True/False of if it should be marked processed",
        "schema": {
          "type": "boolean",
          "default": true
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "uploadedBy",
        "in": "query",
        "description": "Name of uploader",
        "schema": {
          "type": "string",
          "default": ""
        }
      },
      {
        "name": "allowDuplicateFilesOnLead",
        "in": "query",
        "description": "Allow creation of duplicate files",
        "schema": {
          "type": "boolean",
          "default": true
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFileUploadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fileName",
        "in": "query",
        "description": "filename with extension",
        "required": true,
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "uploadedBy",
        "in": "query",
        "description": "Name of uploader",
        "schema": {
          "type": "string",
          "default": ""
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/BlobUrlResponseModel"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fileId",
        "in": "path",
        "description": "File ID returned from getuploadurl",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFileUploadApi"
    },
    "responseContentType": "application/json",
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fileId",
        "in": "path",
        "description": "Uploaded File Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "fieldId",
        "in": "path",
        "description": "Custom Field Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadFileUploadApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "File ID",
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "The id of the lead for which note is being added.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadNoteApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/LeadNoteAddApi"
    },
    "status": 201
  },
  {
    "method": "PUT",
    "path": "/api/leads/{id}/notes/{noteId}",
    "operationId": "put /api/leads/{id}/notes/{noteId}",
    "tags": [
      "Leads"
    ],
    "summary": "Updates an existing lead note.",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "The id of the lead.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "noteId",
        "in": "path",
        "description": "The id of the note to update.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/LeadNoteApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/LeadNoteUpdateApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/leads/{id}/notes/{noteId}",
    "operationId": "delete /api/leads/{id}/notes/{noteId}",
    "tags": [
      "Leads"
    ],
    "summary": "Deletes a lead note.",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "The id of the lead.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "noteId",
        "in": "path",
        "description": "The id of the note to delete.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
    "status": 204
  },
  {
    "method": "PATCH",
    "path": "/api/leads/{id}/appointments/schedule",
    "operationId": "patch /api/leads/{id}/appointments/schedule",
    "tags": [
      "Leads"
    ],
    "summary": "Creates an appointment for the specified lead.",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "The id of the lead for which appointment is to be scheduled.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": {
      "$ref": "#/components/schemas/ScheduleAppointmentApi"
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "The id of the lead for which status is being changed.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "The id of the lead to move.",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "currentStatusId",
        "in": "query",
        "description": "Current Status ID",
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "currentSubstatusId",
        "in": "query",
        "description": "Current Substatus ID",
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "POST",
    "path": "/api/leads/addrelatedcontact",
    "operationId": "leads_postAddRelatedContact",
    "tags": [
      "Leads"
    ],
    "summary": "Add related contact to a lead",
    "parameters": [
      {
        "name": "leadid",
        "in": "query",
        "description": "Lead Docket Lead ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "contactid",
        "in": "query",
        "description": "Lead Docket Contact ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "relationship",
        "in": "query",
        "description": "Relationship to the lead",
        "required": true,
        "schema": {
          "type": "string"
        }
      },
      {
        "name": "additionalplaintiff",
        "in": "query",
        "description": "Is this an additional plaintiff",
        "schema": {
          "type": "boolean",
          "default": false
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "leadid",
        "in": "query",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "leadRoleId",
        "in": "query",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "assignToUserId",
        "in": "query",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "type",
        "in": "query",
        "description": "The type of lookup data to retrieve",
        "required": true,
        "schema": {
          "$ref": "#/components/schemas/LookupTypes"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/MessageApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/MessageAddApi"
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/MessageApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/SendTextMessageApi"
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/MessageApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/SendEmailMessageApi"
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "date",
        "in": "query",
        "description": "Opportunities created since this date.",
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      },
      {
        "name": "page",
        "in": "query",
        "description": "Page of the record set. Defaults to 1 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 1
        }
      },
      {
        "name": "itemsPerPage",
        "in": "query",
        "description": "Number of items per paged request. Maximum is 500, defaults to 500 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 500
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApiFlatApiPagedResponse"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "date",
        "in": "query",
        "description": "Opportunities last updated since this date.",
        "schema": {
          "type": "string",
          "format": "date-time"
        }
      },
      {
        "name": "page",
        "in": "query",
        "description": "Page of the record set. Defaults to 1 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 1
        }
      },
      {
        "name": "itemsPerPage",
        "in": "query",
        "description": "Number of items per paged request. Maximum is 500, defaults to 500 if not specified.",
        "schema": {
          "type": "integer",
          "format": "int32",
          "default": 500
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApiFlatApiPagedResponse"
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/OpportunityApiFlat"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "opportunityId",
        "in": "query",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "note",
        "in": "query",
        "description": "Note text to add",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "opportunityId",
        "in": "query",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "reason",
        "in": "query",
        "description": "Disregard Reason",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Opportunity Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/OpportunityApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Referral Source Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Referral ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket Referral ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "externalCode",
        "in": "query",
        "description": "ExternalCode",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ReferralSourceApi"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Lead Docket Referral ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "code",
        "in": "query",
        "description": "Case Tracker Code from external system",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "query",
        "description": "Lead Docket Referral ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "externalCode",
        "in": "query",
        "description": "Code from external system",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ReferralGroupApi"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/ReferralSourceAddApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/ReferralSourceAddApi"
    },
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/SettingsOptions"
    },
    "responseContentType": "application/json",
    "requestSchema": null,
    "status": 200
  },
  {
    "method": "GET",
    "path": "/api/settlements/{id}",
    "operationId": "Settlements_GetSettlement",
    "tags": [
      "Settlements"
    ],
    "summary": "Returns settlement details by settlement Id",
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Settlement Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/SettlementApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/SettlementApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/SettlementApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/SettlementAddApi"
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Status Id",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "ID of the LeadDocket.Core.Models.Status",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/StatusUpdateApi"
    },
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermediaListApiHypermedia"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "type",
        "in": "query",
        "description": "The LeadDocket.Core.Models.Api.Request.CreateStatusRecipe value for this LeadDocket.Core.Models.Status",
        "required": true,
        "schema": {
          "$ref": "#/components/schemas/CreateStatusRecipe"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/StatusCreateApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/StatusCreateApi"
    },
    "status": 201
  },
  {
    "method": "POST",
    "path": "/api/statuses/{statusId}/substatus",
    "operationId": "SubStatus_Create",
    "tags": [
      "Statuses"
    ],
    "summary": "Create one or more new LeadDocket.Core.Models.Substatuses on a LeadDocket.Core.Models.Status",
    "parameters": [
      {
        "name": "statusId",
        "in": "path",
        "description": "Id of the LeadDocket.Core.Models.Status",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/SubStatusCreateApi"
      }
    },
    "status": 201
  },
  {
    "method": "PATCH",
    "path": "/api/statuses/{statusId}/substatus/{subStatusId}",
    "operationId": "SubStatus_Update",
    "tags": [
      "Statuses"
    ],
    "summary": "Update properties of an existing LeadDocket.Core.Models.Substatus.",
    "parameters": [
      {
        "name": "statusId",
        "in": "path",
        "description": "ID of the LeadDocket.Core.Models.Status which the LeadDocket.Core.Models.Substatus is associated with",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "subStatusId",
        "in": "path",
        "description": "ID of the LeadDocket.Core.Models.Substatus being updated",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/StatusApiApiHypermedia"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/SubStatusUpdateApi"
    },
    "status": 200
  },
  {
    "method": "DELETE",
    "path": "/api/statuses/{statusId}/substatus/{substatusId}",
    "operationId": "Substatus_Delete",
    "tags": [
      "Statuses"
    ],
    "summary": "Delete a Substatus from a Status",
    "parameters": [
      {
        "name": "statusId",
        "in": "path",
        "description": "ID of the LeadDocket.Core.Models.Status which the LeadDocket.Core.Models.Substatus is associated with",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      },
      {
        "name": "substatusId",
        "in": "path",
        "description": "ID of the LeadDocket.Core.Models.Substatus being updated",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/TaskApi"
    },
    "responseContentType": "application/json",
    "requestSchema": null,
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [
      {
        "name": "leadId",
        "in": "path",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/TaskApi"
      }
    },
    "responseContentType": "application/json",
    "requestSchema": null,
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/TaskApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [],
    "requestBodyRequired": true,
    "responseSchema": {
      "$ref": "#/components/schemas/TaskApi"
    },
    "responseContentType": "application/json",
    "requestSchema": {
      "$ref": "#/components/schemas/TaskUpdateApi"
    },
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": null,
    "responseContentType": null,
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
    "parameters": [],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserApi"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Lead Docket User ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/UserApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "leadRoleId",
        "in": "query",
        "description": "Role ID from /api/leadroles",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/UserApi"
      }
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "code",
        "in": "path",
        "description": "Case Tracker Code",
        "required": true,
        "schema": {
          "type": "string"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/UserApi"
    },
    "responseContentType": "application/json",
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
    "parameters": [
      {
        "name": "id",
        "in": "path",
        "description": "Filevine User ID",
        "required": true,
        "schema": {
          "type": "integer",
          "format": "int32"
        }
      }
    ],
    "requestBodyRequired": false,
    "responseSchema": {
      "$ref": "#/components/schemas/UserApi"
    },
    "responseContentType": "application/json",
    "requestSchema": null,
    "status": 200
  }
] as const satisfies readonly MockRouteDefinition[];
