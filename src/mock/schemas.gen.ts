// Generated from openapi.json for the mock API. Do not edit by hand.

export const mockComponentSchemas = {
  "AllPhoneCallsModel": {
    "type": "object",
    "properties": {
      "CallSID": {
        "type": "string",
        "nullable": true
      },
      "CallTo": {
        "type": "string",
        "nullable": true
      },
      "CallFrom": {
        "type": "string",
        "nullable": true
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time"
      },
      "CallStatus": {
        "type": "string",
        "nullable": true
      },
      "CallDuration": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "RecordingUrl": {
        "type": "string",
        "nullable": true
      },
      "CallFromName": {
        "type": "string",
        "nullable": true
      },
      "CallToName": {
        "type": "string",
        "nullable": true
      },
      "Direction": {
        "$ref": "#/components/schemas/CallDirection"
      },
      "NumberName": {
        "type": "string",
        "nullable": true
      },
      "Provider": {
        "$ref": "#/components/schemas/PhoneCallProvider"
      },
      "PhoneCallId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "UnifiedPhoneCallId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "CallType": {
        "type": "string",
        "nullable": true
      },
      "PhoneCallLeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "IsPrimary": {
        "type": "boolean"
      },
      "CallSummary": {
        "type": "string",
        "nullable": true
      },
      "CallTranscript": {
        "type": "string",
        "nullable": true
      },
      "TranscriptionPath": {
        "type": "string",
        "nullable": true
      },
      "AssociationId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Reviewed": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "ApiHypermediaLink": {
    "type": "object",
    "properties": {
      "Rel": {
        "type": "string",
        "nullable": true
      },
      "Href": {
        "type": "string",
        "nullable": true
      },
      "Method": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ApiLeadFile": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Name": {
        "type": "string",
        "nullable": true
      },
      "Url": {
        "type": "string",
        "nullable": true
      },
      "Message": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ApiMessageAttachment": {
    "type": "object",
    "properties": {
      "Filename": {
        "type": "string",
        "nullable": true
      },
      "Base64Data": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "AssignUserApi": {
    "type": "object",
    "properties": {
      "LeadRoleId": {
        "type": "integer",
        "format": "int32"
      },
      "UserId": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "AudioCallProcessingStatus": {
    "enum": [
      "NotStarted",
      "DataEnrichment",
      "AudioProcessing",
      "AudioTranscription",
      "Retrying",
      "Failed",
      "Completed"
    ],
    "type": "string",
    "format": "int32"
  },
  "BlobUrlResponseModel": {
    "type": "object",
    "properties": {
      "UploadUrl": {
        "type": "string",
        "nullable": true
      },
      "LeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "FileId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Headers": {
        "type": "object",
        "additionalProperties": {
          "type": "string"
        },
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "ErrorMessage": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CallDirection": {
    "enum": [
      "Inbound",
      "Outbound",
      "Unknown"
    ],
    "type": "string",
    "format": "int32"
  },
  "CallEventResponse": {
    "type": "object",
    "properties": {
      "Success": {
        "type": "boolean"
      },
      "ErrorMessage": {
        "type": "string",
        "nullable": true
      },
      "Timestamp": {
        "type": "string",
        "format": "date-time"
      },
      "Id": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CaseTypeApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Name": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "Description": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ChangeLeadStatusApi": {
    "required": [
      "Status"
    ],
    "type": "object",
    "properties": {
      "Status": {
        "type": "integer",
        "format": "int32"
      },
      "Substatus": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "SubstatusReason": {
        "maxLength": 200,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "SeverityLevel": {
        "maximum": 2147483647,
        "minimum": 0,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "AssignUsers": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/AssignUserApi"
        },
        "nullable": true
      },
      "AppointmentDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "AppointmentLocation": {
        "maxLength": 100,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "ReferredToId": {
        "maximum": 2147483647,
        "minimum": 0,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "ReferralGroupId": {
        "maximum": 2147483647,
        "minimum": 0,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Notes": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CheckForRecentByPhoneModel": {
    "type": "object",
    "properties": {
      "LeadAndOpportunityCount": {
        "type": "integer",
        "format": "int32",
        "readOnly": true
      },
      "ContactCount": {
        "type": "integer",
        "format": "int32"
      },
      "LeadCount": {
        "type": "integer",
        "format": "int32"
      },
      "OpportunityCount": {
        "type": "integer",
        "format": "int32"
      },
      "IsCurrentClient": {
        "type": "boolean"
      },
      "LatestLeadCreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "LatestLeadUrl": {
        "type": "string",
        "nullable": true
      },
      "LatestLeadName": {
        "type": "string",
        "nullable": true
      },
      "LatestOpportunityCreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "LatestOpportunityUrl": {
        "type": "string",
        "nullable": true
      },
      "LatestOpportunityName": {
        "type": "string",
        "nullable": true
      },
      "SearchUrl": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Name": {
        "type": "string",
        "nullable": true
      },
      "Entries": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CollectionSectionEntryApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionDeleteApi": {
    "type": "object",
    "properties": {
      "EntryIds": {
        "type": "array",
        "items": {
          "type": "integer",
          "format": "int32"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionEntryApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time"
      },
      "Values": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CollectionSectionFieldValueApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionEntryUpdateApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Values": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CollectionSectionValueUpdateApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionFieldValueApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "CustomFieldId": {
        "type": "integer",
        "format": "int32"
      },
      "FieldName": {
        "type": "string",
        "nullable": true
      },
      "Value": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionUpdateApi": {
    "type": "object",
    "properties": {
      "Entries": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CollectionSectionEntryUpdateApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CollectionSectionValueUpdateApi": {
    "type": "object",
    "properties": {
      "CustomFieldId": {
        "type": "integer",
        "format": "int32"
      },
      "Value": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ContactApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "FirstName": {
        "type": "string",
        "nullable": true
      },
      "MiddleName": {
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "type": "string",
        "nullable": true
      },
      "Address1": {
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "type": "string",
        "nullable": true
      },
      "City": {
        "type": "string",
        "nullable": true
      },
      "State": {
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "type": "string",
        "nullable": true
      },
      "County": {
        "type": "string",
        "nullable": true
      },
      "HomePhone": {
        "type": "string",
        "nullable": true
      },
      "MobilePhone": {
        "type": "string",
        "nullable": true
      },
      "WorkPhone": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "PreferredContactMethod": {
        "type": "string",
        "nullable": true
      },
      "Birthdate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Longitude": {
        "type": "string",
        "nullable": true
      },
      "Latitude": {
        "type": "string",
        "nullable": true
      },
      "SubscribeToMailingList": {
        "type": "boolean"
      },
      "BadAddress": {
        "type": "boolean"
      },
      "Deceased": {
        "type": "boolean",
        "nullable": true
      },
      "Gender": {
        "type": "string",
        "nullable": true
      },
      "Minor": {
        "type": "boolean",
        "nullable": true
      },
      "Language": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "DoNotText": {
        "type": "boolean"
      },
      "CreatedOn": {
        "type": "string",
        "format": "date-time"
      },
      "CreatedBy": {
        "type": "string",
        "nullable": true
      },
      "CreatedById": {
        "type": "integer",
        "format": "int32"
      },
      "PendingGeocode": {
        "type": "boolean"
      },
      "LeadIds": {
        "type": "array",
        "items": {
          "type": "integer",
          "format": "int32"
        },
        "nullable": true
      },
      "CustomFields": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ContactCustomFieldsValueApi"
        },
        "nullable": true
      },
      "LastUpdatedDTM": {
        "type": "string",
        "format": "date-time"
      },
      "Tags": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ContactTagApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ContactCustomFieldsValueApi": {
    "type": "object",
    "properties": {
      "CustomFieldId": {
        "type": "integer",
        "format": "int32"
      },
      "Value": {
        "type": "string",
        "nullable": true
      },
      "Name": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ContactMethods": {
    "enum": [
      "MobilePhone",
      "HomePhone",
      "WorkPhone",
      "Email",
      "Text",
      "Mail"
    ],
    "type": "string",
    "format": "int32"
  },
  "ContactTagApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time"
      },
      "TagText": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ContactUpdateApi": {
    "required": [
      "FirstName",
      "LastName"
    ],
    "type": "object",
    "properties": {
      "FirstName": {
        "maxLength": 50,
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      },
      "MiddleName": {
        "maxLength": 50,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "maxLength": 50,
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      },
      "Address1": {
        "maxLength": 100,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "maxLength": 100,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "City": {
        "maxLength": 50,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "State": {
        "maxLength": 50,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "maxLength": 10,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "County": {
        "maxLength": 50,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "HomePhone": {
        "maxLength": 20,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "MobilePhone": {
        "maxLength": 20,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "WorkPhone": {
        "maxLength": 20,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "Email": {
        "maxLength": 100,
        "pattern": "^(?=[^@]{1,64}@)[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~]+(\\.[a-zA-Z0-9!#$%&'*+\\-/=?^_`{|}~]+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$",
        "type": "string",
        "nullable": true
      },
      "PreferredContactMethod": {
        "maxLength": 50,
        "type": "string",
        "nullable": true
      },
      "Birthdate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "SubscribeToMailingList": {
        "type": "boolean"
      },
      "BadAddress": {
        "type": "boolean"
      },
      "Deceased": {
        "type": "boolean",
        "nullable": true
      },
      "DeathDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Gender": {
        "maxLength": 1,
        "type": "string",
        "nullable": true
      },
      "Minor": {
        "type": "boolean",
        "nullable": true
      },
      "Language": {
        "maxLength": 20,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "Code": {
        "maxLength": 50,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "DoNotText": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "CreateStatusRecipe": {
    "enum": [
      "Standard",
      "Schedulable",
      "Sequenceable"
    ],
    "type": "string",
    "format": "int32"
  },
  "CustomDatatypes": {
    "enum": [
      "Text",
      "TrueFalse",
      "DropDownList",
      "TextArea",
      "Date",
      "YesNo",
      "Currency",
      "Percentage",
      "Radio",
      "Checkbox",
      "Section",
      "Link",
      "FilevineContact",
      "FileUpload",
      "TextDescription",
      "SectionBreak",
      "Hidden",
      "Number",
      "Decimal",
      "CollectionSection",
      "AISummary",
      "WebhookTrigger",
      "Boolean",
      "DateOnly",
      "UnitTesting"
    ],
    "type": "string",
    "format": "int32"
  },
  "CustomFieldUpdateModel": {
    "type": "object",
    "properties": {
      "CustomFieldId": {
        "type": "integer",
        "format": "int32"
      },
      "CustomFieldValue": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CustomFieldsApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "FieldName": {
        "type": "string",
        "nullable": true
      },
      "Location": {
        "type": "string",
        "nullable": true
      },
      "Directions": {
        "type": "string",
        "nullable": true
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32"
      },
      "DefaultValues": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "CaseTypes": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CaseTypeApi"
        },
        "nullable": true
      },
      "DependsOn": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "FieldType": {
        "type": "string",
        "nullable": true
      },
      "Disabled": {
        "type": "boolean"
      },
      "ReadOnly": {
        "type": "boolean"
      },
      "Hidden": {
        "type": "boolean"
      },
      "Required": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "CustomFieldsUpdateApi": {
    "type": "object",
    "properties": {
      "Id": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "CustomFields": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CustomFieldUpdateModel"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "CustomFieldsValueApi": {
    "type": "object",
    "properties": {
      "CustomFieldId": {
        "type": "integer",
        "format": "int32"
      },
      "Value": {
        "type": "string",
        "nullable": true
      },
      "Name": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "EndExternalCallRequest": {
    "type": "object",
    "properties": {
      "ProviderName": {
        "type": "string",
        "nullable": true
      },
      "ProviderId": {
        "type": "string",
        "nullable": true
      },
      "Direction": {
        "$ref": "#/components/schemas/CallDirection"
      },
      "CallStatus": {
        "type": "string",
        "nullable": true
      },
      "StartCallDTM": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CallerNumber": {
        "type": "string",
        "nullable": true
      },
      "CallerName": {
        "type": "string",
        "nullable": true
      },
      "CallerCity": {
        "type": "string",
        "nullable": true
      },
      "CallerState": {
        "type": "string",
        "nullable": true
      },
      "CallerZip": {
        "type": "string",
        "nullable": true
      },
      "CallerCountry": {
        "type": "string",
        "nullable": true
      },
      "CalleeNumber": {
        "type": "string",
        "nullable": true
      },
      "ReferrerUrl": {
        "type": "string",
        "nullable": true
      },
      "keywords": {
        "type": "string",
        "nullable": true
      },
      "CurrentUrl": {
        "type": "string",
        "nullable": true
      },
      "utm_source": {
        "type": "string",
        "nullable": true
      },
      "medium": {
        "type": "string",
        "nullable": true
      },
      "utm_medium": {
        "type": "string",
        "nullable": true
      },
      "utm_term": {
        "type": "string",
        "nullable": true
      },
      "utm_content": {
        "type": "string",
        "nullable": true
      },
      "utm_campaign": {
        "type": "string",
        "nullable": true
      },
      "ga": {
        "type": "string",
        "nullable": true
      },
      "gclid": {
        "type": "string",
        "nullable": true
      },
      "fbclid": {
        "type": "string",
        "nullable": true
      },
      "msclkid": {
        "type": "string",
        "nullable": true
      },
      "campaign": {
        "type": "string",
        "nullable": true
      },
      "EndCallDTM": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "DurationSeconds": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "RecordingUrl": {
        "type": "string",
        "nullable": true
      },
      "TranscriptionText": {
        "type": "string",
        "nullable": true
      },
      "CallSummary": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "EsignDocumentApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "EnvelopeId": {
        "type": "string",
        "nullable": true
      },
      "Title": {
        "type": "string",
        "nullable": true
      },
      "Status": {
        "type": "string",
        "nullable": true
      },
      "DateSent": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "DateDelivered": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "DateCompleted": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "DateDeclined": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "DateVoided": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "EmailUsed": {
        "type": "string",
        "nullable": true
      },
      "NameUsed": {
        "type": "string",
        "nullable": true
      },
      "SentBy": {
        "$ref": "#/components/schemas/EsignSendTypes"
      },
      "PhoneUsed": {
        "type": "string",
        "nullable": true
      },
      "ContactId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "EsignSendTypes": {
    "enum": [
      "Unknown",
      "Email",
      "Sms"
    ],
    "type": "string",
    "format": "int32"
  },
  "ExpenseAddApi": {
    "required": [
      "Amount",
      "ExpenseDate",
      "MarketingSourceId",
      "Vendor"
    ],
    "type": "object",
    "properties": {
      "Amount": {
        "minimum": 0,
        "type": "number",
        "format": "double"
      },
      "ExpenseDate": {
        "type": "string",
        "format": "date-time"
      },
      "ExpenseDescription": {
        "maxLength": 200,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "MarketingSourceId": {
        "maximum": 2147483647,
        "minimum": 0,
        "type": "integer",
        "format": "int32"
      },
      "CaseTypeId": {
        "maximum": 2147483647,
        "minimum": 0,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "OfficeId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Vendor": {
        "maxLength": 20,
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      }
    },
    "additionalProperties": false
  },
  "ExpenseApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Amount": {
        "type": "number",
        "format": "double"
      },
      "ExpenseDate": {
        "type": "string",
        "format": "date-time"
      },
      "ExpenseDescription": {
        "type": "string",
        "nullable": true
      },
      "MarketingSourceId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "CaseTypeId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "OfficeId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Vendor": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ExternalPhoneCall": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "ProviderName": {
        "type": "string",
        "nullable": true
      },
      "ProviderId": {
        "type": "string",
        "nullable": true
      },
      "CallSID": {
        "type": "string",
        "nullable": true
      },
      "StartCallDTM": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "EndCallDTM": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Direction": {
        "$ref": "#/components/schemas/CallDirection"
      },
      "DurationSeconds": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "CallerName": {
        "type": "string",
        "nullable": true
      },
      "CallerCity": {
        "type": "string",
        "nullable": true
      },
      "CallerState": {
        "type": "string",
        "nullable": true
      },
      "CallerCountry": {
        "type": "string",
        "nullable": true
      },
      "RecordingUrl": {
        "type": "string",
        "nullable": true
      },
      "ReferrerUrl": {
        "type": "string",
        "nullable": true
      },
      "Metadata": {
        "type": "string",
        "nullable": true
      },
      "CallTo": {
        "type": "string",
        "nullable": true
      },
      "CallFrom": {
        "type": "string",
        "nullable": true
      },
      "CallStatus": {
        "type": "string",
        "nullable": true
      },
      "ProcessingStatus": {
        "$ref": "#/components/schemas/AudioCallProcessingStatus"
      },
      "TranscriptionPath": {
        "type": "string",
        "nullable": true
      },
      "CallSummary": {
        "type": "string",
        "nullable": true
      },
      "CreatedDTM": {
        "type": "string",
        "format": "date-time"
      },
      "UpdatedDTM": {
        "type": "string",
        "format": "date-time"
      },
      "UTM": {
        "type": "string",
        "nullable": true
      },
      "Keywords": {
        "type": "string",
        "nullable": true
      },
      "Campaign": {
        "type": "string",
        "nullable": true
      },
      "ClientId": {
        "type": "string",
        "nullable": true
      },
      "ClickId": {
        "type": "string",
        "nullable": true
      },
      "CurrentUrl": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "FieldType": {
    "enum": [
      "Lead",
      "Contact",
      "LeadRole",
      "Standard",
      "None",
      "LeadFormOther",
      "Status"
    ],
    "type": "string",
    "format": "int32"
  },
  "FormFieldListItem": {
    "type": "object",
    "properties": {
      "Text": {
        "type": "string",
        "nullable": true
      },
      "Value": {
        "type": "string",
        "nullable": true
      },
      "Disabled": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "LeadApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Summary": {
        "type": "string",
        "nullable": true
      },
      "InjuryInformation": {
        "type": "string",
        "nullable": true
      },
      "Status": {
        "type": "string",
        "nullable": true
      },
      "SubStatus": {
        "type": "string",
        "nullable": true
      },
      "SeverityLevel": {
        "type": "string",
        "nullable": true
      },
      "SeverityLevelId": {
        "type": "integer",
        "format": "int32"
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "Contact": {
        "$ref": "#/components/schemas/ContactApi"
      },
      "PracticeArea": {
        "$ref": "#/components/schemas/CaseTypeApi"
      },
      "MarketingSource": {
        "type": "string",
        "nullable": true
      },
      "ContactSource": {
        "type": "string",
        "nullable": true
      },
      "TalkedToOtherAttorneys": {
        "type": "boolean",
        "nullable": true
      },
      "FoundUsNotes": {
        "type": "string",
        "nullable": true
      },
      "UTM": {
        "type": "string",
        "nullable": true
      },
      "CurrentUrl": {
        "type": "string",
        "nullable": true
      },
      "ReferringUrl": {
        "type": "string",
        "nullable": true
      },
      "ClickId": {
        "type": "string",
        "nullable": true
      },
      "ClientId": {
        "type": "string",
        "nullable": true
      },
      "Keywords": {
        "type": "string",
        "nullable": true
      },
      "Campaign": {
        "type": "string",
        "nullable": true
      },
      "AppointmentLocation": {
        "type": "string",
        "nullable": true
      },
      "Office": {
        "type": "string",
        "nullable": true
      },
      "OfficeCode": {
        "type": "string",
        "nullable": true
      },
      "MarketingCampaign": {
        "type": "string",
        "nullable": true
      },
      "MarketingCampaignKey": {
        "type": "string",
        "format": "uuid",
        "nullable": true
      },
      "ReferredTo": {
        "$ref": "#/components/schemas/ReferredToApi"
      },
      "ReferralGroupId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "ReferredByName": {
        "type": "string",
        "nullable": true
      },
      "ReferredBy": {
        "$ref": "#/components/schemas/ReferredByApi"
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time"
      },
      "IncidentDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "AppointmentScheduledDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "SignedUpDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CaseClosedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "ReferredDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "LastStatusChangeDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "SourceLeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "FilevineTeamIds": {
        "type": "string",
        "nullable": true
      },
      "Intake": {
        "$ref": "#/components/schemas/UserApi"
      },
      "Paralegal": {
        "$ref": "#/components/schemas/UserApi"
      },
      "Investigator": {
        "$ref": "#/components/schemas/UserApi"
      },
      "Attorney": {
        "$ref": "#/components/schemas/UserApi"
      },
      "AssignedTo": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadRoleUserApi"
        },
        "nullable": true
      },
      "Creator": {
        "$ref": "#/components/schemas/UserApi"
      },
      "RelatedContacts": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/RelatedContactApi"
        },
        "nullable": true
      },
      "Messages": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/MessageApi"
        },
        "nullable": true
      },
      "Notes": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadNoteApi"
        },
        "nullable": true
      },
      "Opportunity": {
        "$ref": "#/components/schemas/OpportunityLimitedApi"
      },
      "PhoneCall": {
        "$ref": "#/components/schemas/PhoneCallApi"
      },
      "Files": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadFileApi"
        },
        "nullable": true
      },
      "CustomFields": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CustomFieldsValueApi"
        },
        "nullable": true
      },
      "Settlements": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SettlementApi"
        },
        "nullable": true
      },
      "LeadStatusHistory": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadStatusHistoryApi"
        },
        "nullable": true
      },
      "CollectionSections": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CollectionSectionApi"
        },
        "nullable": true
      },
      "PhoneCalls": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/AllPhoneCallsModel"
        },
        "nullable": true
      },
      "Tasks": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/TaskApi"
        },
        "nullable": true
      },
      "EsignDocuments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/EsignDocumentApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadApiFlat": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "ContactId": {
        "type": "integer",
        "format": "int32"
      },
      "PhoneNumber": {
        "type": "string",
        "nullable": true
      },
      "MobilePhone": {
        "type": "string",
        "nullable": true
      },
      "HomePhone": {
        "type": "string",
        "nullable": true
      },
      "WorkPhone": {
        "type": "string",
        "nullable": true
      },
      "PreferredContactMethod": {
        "$ref": "#/components/schemas/ContactMethods"
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "FirstName": {
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "type": "string",
        "nullable": true
      },
      "StatusId": {
        "type": "integer",
        "format": "int32"
      },
      "StatusName": {
        "type": "string",
        "nullable": true
      },
      "SubStatusId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "SubStatusName": {
        "type": "string",
        "nullable": true
      },
      "CaseType": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "LastStatusChangeDate": {
        "type": "string",
        "format": "date-time"
      },
      "LastUpdateDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadApiFlatApiPagedResponse": {
    "type": "object",
    "properties": {
      "Page": {
        "type": "integer",
        "format": "int32"
      },
      "ItemsPerPage": {
        "type": "integer",
        "format": "int32"
      },
      "TotalRecordCount": {
        "type": "integer",
        "format": "int32"
      },
      "TotalPages": {
        "type": "integer",
        "format": "int32",
        "readOnly": true
      },
      "Records": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadApiFlat"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadCollectionSectionApi": {
    "type": "object",
    "properties": {
      "LeadId": {
        "type": "integer",
        "format": "int32"
      },
      "Sections": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CollectionSectionApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFileApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "FileUrl": {
        "type": "string",
        "nullable": true
      },
      "FileName": {
        "type": "string",
        "nullable": true
      },
      "UploadOn": {
        "type": "string",
        "format": "date-time"
      }
    },
    "additionalProperties": false
  },
  "LeadFileUploadApi": {
    "type": "object",
    "properties": {
      "TotalFilesSent": {
        "type": "integer",
        "format": "int32"
      },
      "UploadSuccessCount": {
        "type": "integer",
        "format": "int32",
        "readOnly": true
      },
      "UploadedFiles": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiLeadFile"
        },
        "nullable": true
      },
      "FailedFiles": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiLeadFile"
        },
        "nullable": true
      },
      "UploadFailCount": {
        "type": "integer",
        "format": "int32",
        "readOnly": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormApi": {
    "type": "object",
    "properties": {
      "LeadFormId": {
        "type": "integer",
        "format": "int32"
      },
      "FormName": {
        "type": "string",
        "nullable": true
      },
      "CaseTypeId": {
        "type": "integer",
        "format": "int32"
      },
      "CaseTypeName": {
        "type": "string",
        "nullable": true
      },
      "Enabled": {
        "type": "boolean"
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time"
      },
      "CreatedById": {
        "type": "integer",
        "format": "int32"
      },
      "CreatedBy": {
        "type": "string",
        "nullable": true
      },
      "DaysToExpiration": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "LeadFormApiApiHypermedia": {
    "type": "object",
    "properties": {
      "Error": {
        "type": "string",
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "Data": {
        "$ref": "#/components/schemas/LeadFormApi"
      },
      "Actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      },
      "Links": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormCreateApi": {
    "required": [
      "CaseTypeId"
    ],
    "type": "object",
    "properties": {
      "CaseTypeId": {
        "type": "integer",
        "format": "int32"
      },
      "Enabled": {
        "type": "boolean"
      },
      "DaysToExpiration": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "LeadFormFieldAddApi": {
    "required": [
      "FieldId"
    ],
    "type": "object",
    "properties": {
      "LeadFormId": {
        "type": "integer",
        "format": "int32"
      },
      "FieldId": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32"
      },
      "FieldNameOverride": {
        "type": "string",
        "nullable": true
      },
      "DirectionsOverride": {
        "type": "string",
        "nullable": true
      },
      "Required": {
        "type": "boolean",
        "nullable": true
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Columns": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "ReadOnly": {
        "type": "boolean",
        "nullable": true
      },
      "LayoutOption": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormFieldApi": {
    "type": "object",
    "properties": {
      "LeadFormFieldId": {
        "type": "integer",
        "format": "int32"
      },
      "FieldId": {
        "type": "integer",
        "format": "int32"
      },
      "FieldType": {
        "$ref": "#/components/schemas/CustomDatatypes"
      },
      "LayoutOption": {
        "$ref": "#/components/schemas/SectionHeadingLayoutOption"
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32"
      },
      "DisplayName": {
        "type": "string",
        "nullable": true
      },
      "DisplayNameOverride": {
        "type": "string",
        "nullable": true
      },
      "Directions": {
        "type": "string",
        "nullable": true
      },
      "Required": {
        "type": "boolean"
      },
      "ReadOnly": {
        "type": "boolean"
      },
      "Columns": {
        "type": "integer",
        "format": "int32"
      },
      "DependsOn": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "DependsOnName": {
        "type": "string",
        "nullable": true
      },
      "DependsOnValue": {
        "type": "string",
        "nullable": true
      },
      "Value": {
        "type": "string",
        "nullable": true
      },
      "ListItems": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/FormFieldListItem"
        },
        "nullable": true
      },
      "AlwaysRequired": {
        "type": "boolean"
      },
      "AlwaysReadOnly": {
        "type": "boolean"
      },
      "RequiredHidden": {
        "type": "boolean"
      },
      "ReadOnlyHidden": {
        "type": "boolean"
      },
      "DirectionsHidden": {
        "type": "boolean"
      },
      "FormControlName": {
        "type": "string",
        "nullable": true
      },
      "DisplayLabel": {
        "type": "string",
        "nullable": true,
        "readOnly": true
      },
      "CustomFieldType": {
        "$ref": "#/components/schemas/FieldType"
      },
      "Values": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "nullable": true,
        "readOnly": true
      },
      "LeadFormId": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "LeadFormFieldApiApiHypermedia": {
    "type": "object",
    "properties": {
      "Error": {
        "type": "string",
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "Data": {
        "$ref": "#/components/schemas/LeadFormFieldApi"
      },
      "Actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      },
      "Links": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormFieldUpdateApi": {
    "type": "object",
    "properties": {
      "FieldId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "FieldNameOverride": {
        "type": "string",
        "nullable": true
      },
      "DirectionsOverride": {
        "type": "string",
        "nullable": true
      },
      "Required": {
        "type": "boolean",
        "nullable": true
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Columns": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "ReadOnly": {
        "type": "boolean",
        "nullable": true
      },
      "LayoutOption": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormInvitationApi": {
    "type": "object",
    "properties": {
      "LeadFormId": {
        "type": "integer",
        "format": "int32"
      },
      "LeadId": {
        "type": "integer",
        "format": "int32"
      },
      "ContactId": {
        "type": "integer",
        "format": "int32"
      },
      "InvitationGuid": {
        "type": "string",
        "nullable": true
      },
      "InvitationUrl": {
        "type": "string",
        "nullable": true
      },
      "Status": {
        "type": "string",
        "nullable": true
      },
      "SentDate": {
        "type": "string",
        "format": "date-time"
      },
      "SentVia": {
        "type": "string",
        "nullable": true
      },
      "ExpirationDate": {
        "type": "string",
        "format": "date-time"
      },
      "LastViewedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CreatedById": {
        "type": "integer",
        "format": "int32"
      },
      "ErrorMessage": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormInvitationApiApiHypermedia": {
    "type": "object",
    "properties": {
      "Error": {
        "type": "string",
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "Data": {
        "$ref": "#/components/schemas/LeadFormInvitationApi"
      },
      "Actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      },
      "Links": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadFormUpdateApi": {
    "type": "object",
    "properties": {
      "CaseTypeId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Enabled": {
        "type": "boolean",
        "nullable": true
      },
      "DaysToExpiration": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadNoteAddApi": {
    "required": [
      "Text"
    ],
    "type": "object",
    "properties": {
      "Text": {
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      },
      "Summary": {
        "maxLength": 500,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      },
      "IsUserNote": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "LeadNoteApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "LeadId": {
        "type": "integer",
        "format": "int32"
      },
      "Note": {
        "type": "string",
        "nullable": true
      },
      "Summary": {
        "type": "string",
        "nullable": true
      },
      "CreatedOn": {
        "type": "string",
        "format": "date-time"
      },
      "CreatedBy": {
        "type": "string",
        "nullable": true
      },
      "IsUserNote": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadNoteUpdateApi": {
    "required": [
      "Text"
    ],
    "type": "object",
    "properties": {
      "Text": {
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      },
      "Summary": {
        "maxLength": 500,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadRelatedEntityTypeAPI": {
    "enum": [
      "Sources",
      "SeverityLevel",
      "PhoneCalls",
      "Office",
      "Opportunity",
      "Creator",
      "ReferredTo",
      "ReferredBy",
      "LeadStatusHistory",
      "RelatedContacts",
      "ContactCustomFields",
      "LeadCustomFields",
      "LeadNotes",
      "Tasks",
      "Messages",
      "LeadFiles",
      "EsignDocuments",
      "Settlements",
      "CollectionSectionEntries"
    ],
    "type": "string",
    "format": "int32"
  },
  "LeadRoleApi": {
    "type": "object",
    "properties": {
      "LeadRoleId": {
        "type": "integer",
        "format": "int32"
      },
      "RoleName": {
        "type": "string",
        "nullable": true
      },
      "IsOwner": {
        "type": "boolean"
      },
      "IsDefault": {
        "type": "boolean"
      },
      "PriorityOrder": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "LeadRoleStatusApi": {
    "type": "object",
    "properties": {
      "LeadRoleId": {
        "type": "integer",
        "format": "int32"
      },
      "VisibilityOnLead": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "LeadRoleStatusCreateApi": {
    "type": "object",
    "properties": {
      "LeadRoleId": {
        "type": "integer",
        "format": "int32"
      },
      "VisibilityOnLead": {
        "maximum": 2,
        "minimum": 0,
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "LeadRoleUserApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "FirstName": {
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "Roles": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadRoleApi"
        },
        "nullable": true
      },
      "Permissions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PermissionApi"
        },
        "nullable": true
      },
      "LeadRoleId": {
        "type": "integer",
        "format": "int32"
      },
      "RoleName": {
        "type": "string",
        "nullable": true
      },
      "IsOwner": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "LeadStatusHistoryApi": {
    "type": "object",
    "properties": {
      "Timestamp": {
        "type": "string",
        "format": "date-time"
      },
      "ChangedBy": {
        "type": "string",
        "nullable": true
      },
      "StatusId": {
        "type": "integer",
        "format": "int32"
      },
      "SubStatusId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "LeadStatus": {
        "type": "string",
        "nullable": true
      },
      "SubStatus": {
        "type": "string",
        "nullable": true
      },
      "SubstatusReason": {
        "type": "string",
        "nullable": true
      },
      "ReferredToName": {
        "type": "string",
        "nullable": true
      },
      "ReferredToAttn": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LeadUpdateApi": {
    "type": "object",
    "properties": {
      "CaseTypeId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Summary": {
        "maxLength": 30000,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "IncidentDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "OfficeId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "SourceId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "ContactSourceId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "FoundUsNotes": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "UTM": {
        "maxLength": 500,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "ReferringUrl": {
        "maxLength": 500,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "CurrentUrl": {
        "maxLength": 500,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "ReferredBy": {
        "maxLength": 100,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "ClientId": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "ClickId": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Keywords": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Campaign": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "TeamIDs": {
        "type": "array",
        "items": {
          "type": "integer",
          "format": "int32"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "LookupTypes": {
    "enum": [
      "LeadSource",
      "CaseType",
      "MarketingSource",
      "Statuses",
      "Offices",
      "Forms",
      "Tags",
      "PhoneNumbers"
    ],
    "type": "string",
    "format": "int32"
  },
  "MessageAddApi": {
    "required": [
      "LeadId",
      "SendFrom",
      "SendTo",
      "Subject"
    ],
    "type": "object",
    "properties": {
      "LeadId": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32"
      },
      "SendFrom": {
        "maxLength": 100,
        "minLength": 1,
        "type": "string"
      },
      "SendTo": {
        "maxLength": 500,
        "minLength": 1,
        "type": "string"
      },
      "SendCC": {
        "maxLength": 500,
        "type": "string",
        "nullable": true
      },
      "Subject": {
        "maxLength": 1600,
        "minLength": 1,
        "type": "string"
      },
      "Body": {
        "type": "string",
        "nullable": true
      },
      "HtmlBody": {
        "type": "string",
        "nullable": true
      },
      "SendFromName": {
        "maxLength": 100,
        "type": "string",
        "nullable": true
      },
      "Attachments": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiMessageAttachment"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "MessageApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "SendFrom": {
        "type": "string",
        "nullable": true
      },
      "SendTo": {
        "type": "string",
        "nullable": true
      },
      "SendCC": {
        "type": "string",
        "nullable": true
      },
      "Subject": {
        "type": "string",
        "nullable": true
      },
      "Body": {
        "type": "string",
        "nullable": true
      },
      "CreatedOn": {
        "type": "string",
        "format": "date-time"
      },
      "DueForSendingOn": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "IsInbound": {
        "type": "boolean"
      },
      "HasBeenSent": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "OpportunityApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "FirstName": {
        "type": "string",
        "nullable": true
      },
      "MiddleName": {
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "type": "string",
        "nullable": true
      },
      "Address1": {
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "type": "string",
        "nullable": true
      },
      "City": {
        "type": "string",
        "nullable": true
      },
      "State": {
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "type": "string",
        "nullable": true
      },
      "HomePhone": {
        "type": "string",
        "nullable": true
      },
      "WorkPhone": {
        "type": "string",
        "nullable": true
      },
      "MobilePhone": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "Gender": {
        "type": "string",
        "nullable": true
      },
      "Language": {
        "type": "string",
        "nullable": true
      },
      "Birthdate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "PreferredContactMethod": {
        "$ref": "#/components/schemas/ContactMethods"
      },
      "LeadStatus": {
        "type": "string",
        "nullable": true
      },
      "SubStatus": {
        "type": "string",
        "nullable": true
      },
      "Office": {
        "type": "string",
        "nullable": true
      },
      "MarketingSource": {
        "type": "string",
        "nullable": true
      },
      "MarketingSourceDetails": {
        "type": "string",
        "nullable": true
      },
      "ContactSource": {
        "type": "string",
        "nullable": true
      },
      "Summary": {
        "type": "string",
        "nullable": true
      },
      "InjuryInformation": {
        "type": "string",
        "nullable": true
      },
      "IncidentDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "LeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Note": {
        "type": "string",
        "nullable": true
      },
      "ReferredBy": {
        "type": "string",
        "nullable": true
      },
      "SeverityLevel": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "County": {
        "type": "string",
        "nullable": true
      },
      "AppointmentLocation": {
        "type": "string",
        "nullable": true
      },
      "AppointmentScheduledDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "ReferringUrl": {
        "type": "string",
        "nullable": true
      },
      "CurrentUrl": {
        "type": "string",
        "nullable": true
      },
      "UTM": {
        "type": "string",
        "nullable": true
      },
      "ClientId": {
        "type": "string",
        "nullable": true
      },
      "ClickId": {
        "type": "string",
        "nullable": true
      },
      "Keywords": {
        "type": "string",
        "nullable": true
      },
      "Campaign": {
        "type": "string",
        "nullable": true
      },
      "Processed": {
        "type": "boolean"
      },
      "ProcessedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "ProcessedByName": {
        "type": "string",
        "nullable": true
      },
      "OpportunityTypeId": {
        "$ref": "#/components/schemas/OpportunityType"
      },
      "DisregardReason": {
        "type": "string",
        "nullable": true
      },
      "IsBeingEdited": {
        "type": "boolean"
      },
      "CustomFields": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/CustomFieldsValueApi"
        },
        "nullable": true
      },
      "AssignedTo": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadRoleUserApi"
        },
        "nullable": true
      },
      "ProcessedBy": {
        "$ref": "#/components/schemas/UserApi"
      }
    },
    "additionalProperties": false
  },
  "OpportunityApiFlat": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "FirstName": {
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "type": "string",
        "nullable": true
      },
      "MobilePhone": {
        "type": "string",
        "nullable": true
      },
      "HomePhone": {
        "type": "string",
        "nullable": true
      },
      "WorkPhone": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "CaseType": {
        "type": "string",
        "nullable": true
      },
      "OpportunitySource": {
        "type": "string",
        "nullable": true
      },
      "MarketingSource": {
        "type": "string",
        "nullable": true
      },
      "Status": {
        "type": "string",
        "nullable": true
      },
      "IsBeingEdited": {
        "type": "boolean"
      },
      "Processed": {
        "type": "boolean"
      },
      "ProcessedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "ProcessedByName": {
        "type": "string",
        "nullable": true
      },
      "DisregardReason": {
        "type": "string",
        "nullable": true
      },
      "LeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "LastUpdateDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "OpportunityApiFlatApiPagedResponse": {
    "type": "object",
    "properties": {
      "Page": {
        "type": "integer",
        "format": "int32"
      },
      "ItemsPerPage": {
        "type": "integer",
        "format": "int32"
      },
      "TotalRecordCount": {
        "type": "integer",
        "format": "int32"
      },
      "TotalPages": {
        "type": "integer",
        "format": "int32",
        "readOnly": true
      },
      "Records": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/OpportunityApiFlat"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "OpportunityLimitedApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "OpportunityName": {
        "type": "string",
        "nullable": true
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "ProcessedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "ProcessedById": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "OpportunityType": {
    "enum": [
      "ManualEntry",
      "WebForm",
      "WebChat",
      "PhoneCall",
      "AnsweringService",
      "Other",
      "LeadGenerationService",
      "TextMessage",
      "ReceptionForm",
      "Email",
      "ReferralForm"
    ],
    "type": "string",
    "format": "int32"
  },
  "PermissionApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Name": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "PhoneCallApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "CallFrom": {
        "type": "string",
        "nullable": true
      },
      "CallTo": {
        "type": "string",
        "nullable": true
      },
      "CallSID": {
        "type": "string",
        "nullable": true
      },
      "Label": {
        "type": "string",
        "nullable": true
      },
      "RecordingUrl": {
        "type": "string",
        "nullable": true
      },
      "CreatedDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CallSummary": {
        "type": "string",
        "nullable": true
      },
      "CallTranscript": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "PhoneCallProvider": {
    "enum": [
      "Native",
      "CallRail",
      "CTM",
      "Api",
      "Manual",
      "Unknown"
    ],
    "type": "string",
    "format": "int32"
  },
  "ReferralGroupApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "GroupName": {
        "type": "string",
        "nullable": true
      },
      "ReferralGroupMembers": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ReferralGroupMemberApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ReferralGroupMemberApi": {
    "type": "object",
    "properties": {
      "ReferralSourceId": {
        "type": "integer",
        "format": "int32"
      },
      "FirmName": {
        "type": "string",
        "nullable": true
      },
      "City": {
        "type": "string",
        "nullable": true
      },
      "State": {
        "type": "string",
        "nullable": true
      },
      "PhoneNumber": {
        "type": "string",
        "nullable": true
      },
      "Attn": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ReferralSourceAddApi": {
    "required": [
      "Name",
      "PracticeArea"
    ],
    "type": "object",
    "properties": {
      "Name": {
        "maxLength": 100,
        "minLength": 0,
        "type": "string"
      },
      "PracticeArea": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string"
      },
      "PhoneNumber": {
        "maxLength": 20,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Attn": {
        "maxLength": 100,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Address1": {
        "maxLength": 50,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "maxLength": 50,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "City": {
        "maxLength": 50,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "State": {
        "maxLength": 29,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "maxLength": 10,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Email": {
        "maxLength": 500,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Enabled": {
        "type": "boolean"
      },
      "Code": {
        "maxLength": 50,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "ExternalCode": {
        "maxLength": 50,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "Incoming": {
        "type": "boolean"
      },
      "Outgoing": {
        "type": "boolean"
      },
      "Priority": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Notes": {
        "maxLength": 500,
        "minLength": 0,
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ReferralSourceApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Name": {
        "type": "string",
        "nullable": true
      },
      "Type": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "ExternalCode": {
        "type": "string",
        "nullable": true
      },
      "PracticeArea": {
        "type": "string",
        "nullable": true
      },
      "PracticeAreas": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "nullable": true,
        "readOnly": true
      },
      "PhoneNumber": {
        "type": "string",
        "nullable": true
      },
      "Address1": {
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "type": "string",
        "nullable": true
      },
      "City": {
        "type": "string",
        "nullable": true
      },
      "State": {
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "Incoming": {
        "type": "boolean"
      },
      "Outgoing": {
        "type": "boolean"
      },
      "Priority": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Notes": {
        "type": "string",
        "nullable": true
      },
      "Attn": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ReferredByApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Name": {
        "type": "string",
        "nullable": true
      },
      "Type": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "CityAndState": {
        "type": "string",
        "nullable": true,
        "readOnly": true
      },
      "PreferredContactMethod": {
        "$ref": "#/components/schemas/ContactMethods"
      },
      "TagsList": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "nullable": true
      },
      "Address1": {
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "type": "string",
        "nullable": true
      },
      "City": {
        "type": "string",
        "nullable": true
      },
      "State": {
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "HomePhone": {
        "type": "string",
        "nullable": true
      },
      "WorkPhone": {
        "type": "string",
        "nullable": true
      },
      "MobilePhone": {
        "type": "string",
        "nullable": true
      },
      "FullMailingAddress": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "ReferredSubstatusType": {
    "enum": [
      "ReferredOther",
      "ReferredDeclined",
      "ReferredPending",
      "ReferredAccepted",
      "ReferredClosed",
      "ReferredSigned",
      "ReferredNoFollowUp",
      "ReferredShowToReferralPartners"
    ],
    "type": "string",
    "format": "int32"
  },
  "ReferredToApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Name": {
        "type": "string",
        "nullable": true
      },
      "Type": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "PracticeAreas": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "nullable": true,
        "readOnly": true
      },
      "PhoneNumber": {
        "type": "string",
        "nullable": true
      },
      "Address1": {
        "type": "string",
        "nullable": true
      },
      "Address2": {
        "type": "string",
        "nullable": true
      },
      "City": {
        "type": "string",
        "nullable": true
      },
      "State": {
        "type": "string",
        "nullable": true
      },
      "Zip": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "Incoming": {
        "type": "boolean"
      },
      "Outgoing": {
        "type": "boolean"
      },
      "Priority": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Notes": {
        "type": "string",
        "nullable": true
      },
      "Attn": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "RelatedContactApi": {
    "type": "object",
    "properties": {
      "Relationship": {
        "type": "string",
        "nullable": true
      },
      "Notes": {
        "type": "string",
        "nullable": true
      },
      "IsPlaintiff": {
        "type": "boolean"
      },
      "ContactType": {
        "type": "string",
        "nullable": true
      },
      "PromotedLeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Contact": {
        "$ref": "#/components/schemas/ContactApi"
      }
    },
    "additionalProperties": false
  },
  "ScheduleAppointmentApi": {
    "required": [
      "Date",
      "Location"
    ],
    "type": "object",
    "properties": {
      "Location": {
        "maxLength": 100,
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      },
      "Date": {
        "type": "string",
        "format": "date-time"
      },
      "Status": {
        "maximum": 99,
        "minimum": 1,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Substatus": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "AssignUsers": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/AssignUserApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "SectionHeadingLayoutOption": {
    "enum": [
      "Heading1",
      "Heading2",
      "InfoMessage",
      "WarningMessage",
      "InfoBox",
      "WarningBox"
    ],
    "type": "string",
    "format": "int32"
  },
  "SendEmailMessageApi": {
    "required": [
      "Body",
      "LeadId",
      "SendFrom",
      "SendTo",
      "Subject"
    ],
    "type": "object",
    "properties": {
      "LeadId": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32"
      },
      "SendFrom": {
        "maxLength": 100,
        "minLength": 1,
        "type": "string",
        "format": "email"
      },
      "SendFromName": {
        "maxLength": 100,
        "type": "string",
        "nullable": true
      },
      "SendTo": {
        "maxLength": 500,
        "minLength": 1,
        "type": "string",
        "format": "email"
      },
      "SendCC": {
        "maxLength": 500,
        "type": "string",
        "nullable": true
      },
      "Subject": {
        "maxLength": 1600,
        "minLength": 1,
        "type": "string"
      },
      "Body": {
        "minLength": 1,
        "type": "string"
      }
    },
    "additionalProperties": false
  },
  "SendTextMessageApi": {
    "required": [
      "Body",
      "LeadId",
      "SendTo"
    ],
    "type": "object",
    "properties": {
      "LeadId": {
        "maximum": 2147483647,
        "minimum": 1,
        "type": "integer",
        "format": "int32"
      },
      "SendFrom": {
        "maxLength": 50,
        "type": "string",
        "nullable": true
      },
      "SendTo": {
        "maxLength": 50,
        "minLength": 1,
        "type": "string"
      },
      "Body": {
        "minLength": 1,
        "type": "string"
      }
    },
    "additionalProperties": false
  },
  "SettingsOptions": {
    "type": "object",
    "properties": {
      "Name": {
        "type": "string",
        "nullable": true
      },
      "IsEnabled": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "SettlementAddApi": {
    "required": [
      "Fee",
      "LeadId",
      "Summary"
    ],
    "type": "object",
    "properties": {
      "LeadId": {
        "maximum": 2147483647,
        "minimum": 0,
        "type": "integer",
        "format": "int32"
      },
      "Fee": {
        "minimum": 0,
        "type": "number",
        "format": "double"
      },
      "Date": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Amount": {
        "minimum": 0,
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Summary": {
        "maxLength": 50,
        "minLength": 1,
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string"
      },
      "ReferralFee": {
        "minimum": 0,
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Expenses": {
        "minimum": 0,
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Notes": {
        "pattern": "^[-\\w\\s\\\"\\'=!@#%&,:;\\.\\$\\{\\[\\(\\|\\)\\]\\}\\*\\+\\?/\\\\'\"]*$",
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "SettlementApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "LeadId": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Fee": {
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Date": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Amount": {
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Summary": {
        "type": "string",
        "nullable": true
      },
      "ReferralFee": {
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Expenses": {
        "type": "number",
        "format": "double",
        "nullable": true
      },
      "Notes": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "SortOrder": {
    "enum": [
      "Ascending",
      "Descending"
    ],
    "type": "string",
    "format": "int32"
  },
  "StartExternalCallRequest": {
    "type": "object",
    "properties": {
      "ProviderName": {
        "type": "string",
        "nullable": true
      },
      "ProviderId": {
        "type": "string",
        "nullable": true
      },
      "Direction": {
        "$ref": "#/components/schemas/CallDirection"
      },
      "CallStatus": {
        "type": "string",
        "nullable": true
      },
      "StartCallDTM": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "CallerNumber": {
        "type": "string",
        "nullable": true
      },
      "CallerName": {
        "type": "string",
        "nullable": true
      },
      "CallerCity": {
        "type": "string",
        "nullable": true
      },
      "CallerState": {
        "type": "string",
        "nullable": true
      },
      "CallerZip": {
        "type": "string",
        "nullable": true
      },
      "CallerCountry": {
        "type": "string",
        "nullable": true
      },
      "CalleeNumber": {
        "type": "string",
        "nullable": true
      },
      "ReferrerUrl": {
        "type": "string",
        "nullable": true
      },
      "keywords": {
        "type": "string",
        "nullable": true
      },
      "CurrentUrl": {
        "type": "string",
        "nullable": true
      },
      "utm_source": {
        "type": "string",
        "nullable": true
      },
      "medium": {
        "type": "string",
        "nullable": true
      },
      "utm_medium": {
        "type": "string",
        "nullable": true
      },
      "utm_term": {
        "type": "string",
        "nullable": true
      },
      "utm_content": {
        "type": "string",
        "nullable": true
      },
      "utm_campaign": {
        "type": "string",
        "nullable": true
      },
      "ga": {
        "type": "string",
        "nullable": true
      },
      "gclid": {
        "type": "string",
        "nullable": true
      },
      "fbclid": {
        "type": "string",
        "nullable": true
      },
      "msclkid": {
        "type": "string",
        "nullable": true
      },
      "campaign": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "StatusApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "Status": {
        "type": "string",
        "nullable": true
      },
      "StatusName": {
        "type": "string",
        "nullable": true
      },
      "StatusScript": {
        "type": "string",
        "nullable": true
      },
      "IsClosed": {
        "type": "boolean"
      },
      "IsCurrentClient": {
        "type": "boolean"
      },
      "IsReferrable": {
        "type": "boolean"
      },
      "IsSequenced": {
        "type": "boolean"
      },
      "IsScheduleable": {
        "type": "boolean"
      },
      "IsIncludedInSearch": {
        "type": "boolean"
      },
      "IsValueEnabled": {
        "type": "boolean"
      },
      "IsOnDashboard": {
        "type": "boolean"
      },
      "IsResolved": {
        "type": "boolean"
      },
      "IsWanted": {
        "type": "boolean"
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32"
      },
      "Substatuses": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SubStatusApi"
        },
        "nullable": true
      },
      "LeadRoleStatuses": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadRoleStatusApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "StatusApiApiHypermedia": {
    "type": "object",
    "properties": {
      "Error": {
        "type": "string",
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "Data": {
        "$ref": "#/components/schemas/StatusApi"
      },
      "Actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      },
      "Links": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "StatusApiApiHypermediaListApiHypermedia": {
    "type": "object",
    "properties": {
      "Error": {
        "type": "string",
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "Data": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/StatusApiApiHypermedia"
        },
        "nullable": true
      },
      "Actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      },
      "Links": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "StatusCreateApi": {
    "required": [
      "LeadStatus"
    ],
    "type": "object",
    "properties": {
      "LeadStatus": {
        "maxLength": 50,
        "minLength": 0,
        "pattern": "^[a-zA-Z0-9\\s-]+$",
        "type": "string"
      },
      "StatusScript": {
        "type": "string",
        "nullable": true
      },
      "IsIncludedInSearch": {
        "type": "boolean"
      },
      "IsOnDashboard": {
        "type": "boolean"
      },
      "IsWanted": {
        "type": "boolean"
      },
      "IsResolved": {
        "type": "boolean"
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "Substatuses": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/SubStatusCreateApi"
        },
        "nullable": true
      },
      "LeadRoleStatuses": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadRoleStatusCreateApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "StatusCreateApiApiHypermedia": {
    "type": "object",
    "properties": {
      "Error": {
        "type": "string",
        "nullable": true
      },
      "IsValid": {
        "type": "boolean",
        "readOnly": true
      },
      "Data": {
        "$ref": "#/components/schemas/StatusCreateApi"
      },
      "Actions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      },
      "Links": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ApiHypermediaLink"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "StatusUpdateApi": {
    "type": "object",
    "properties": {
      "LeadStatus": {
        "maxLength": 50,
        "minLength": 0,
        "pattern": "^[a-zA-Z0-9\\s-]+$",
        "type": "string",
        "nullable": true
      },
      "StatusScript": {
        "type": "string",
        "nullable": true
      },
      "IsIncludedInSearch": {
        "type": "boolean",
        "nullable": true
      },
      "IsOnDashboard": {
        "type": "boolean",
        "nullable": true
      },
      "IsWanted": {
        "type": "boolean",
        "nullable": true
      },
      "IsResolved": {
        "type": "boolean",
        "nullable": true
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "SubStatusApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "SubStatusName": {
        "type": "string",
        "nullable": true
      },
      "StatusScript": {
        "type": "string",
        "nullable": true
      },
      "Reasons": {
        "type": "string",
        "nullable": true
      },
      "IsClosed": {
        "type": "boolean"
      },
      "IsCurrentClient": {
        "type": "boolean"
      },
      "IsScheduleable": {
        "type": "boolean"
      },
      "IsIncludedInSearch": {
        "type": "boolean"
      },
      "IsValueEnabled": {
        "type": "boolean"
      },
      "IsOnDashboard": {
        "type": "boolean"
      },
      "IsResolved": {
        "type": "boolean"
      },
      "IsWanted": {
        "type": "boolean"
      },
      "ReferredType": {
        "$ref": "#/components/schemas/ReferredSubstatusType"
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32"
      }
    },
    "additionalProperties": false
  },
  "SubStatusCreateApi": {
    "required": [
      "SubStatusName"
    ],
    "type": "object",
    "properties": {
      "SubStatusName": {
        "maxLength": 50,
        "minLength": 0,
        "pattern": "^[a-zA-Z0-9\\s-\\\\/]+$",
        "type": "string"
      },
      "SubStatusScript": {
        "type": "string",
        "nullable": true
      },
      "Reasons": {
        "type": "string",
        "nullable": true
      },
      "IsIncludedInSearch": {
        "type": "boolean"
      },
      "IsOnDashboard": {
        "type": "boolean"
      },
      "IsWanted": {
        "type": "boolean"
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "SubStatusUpdateApi": {
    "type": "object",
    "properties": {
      "SubStatusName": {
        "maxLength": 50,
        "minLength": 0,
        "pattern": "^[a-zA-Z0-9\\s-\\\\/]+$",
        "type": "string",
        "nullable": true
      },
      "SubStatusScript": {
        "type": "string",
        "nullable": true
      },
      "Reasons": {
        "type": "string",
        "nullable": true
      },
      "IsIncludedInSearch": {
        "type": "boolean",
        "nullable": true
      },
      "IsOnDashboard": {
        "type": "boolean",
        "nullable": true
      },
      "IsWanted": {
        "type": "boolean",
        "nullable": true
      },
      "DisplayOrder": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "TaskApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "LeadId": {
        "type": "integer",
        "format": "int32"
      },
      "Summary": {
        "type": "string",
        "nullable": true
      },
      "TaskStartDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "TaskCompletionDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "UserAssigned": {
        "type": "integer",
        "format": "int32"
      },
      "TaskType": {
        "type": "string",
        "nullable": true
      },
      "Details": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "TaskCreateApi": {
    "required": [
      "LeadId",
      "Summary",
      "TaskStartDate",
      "TaskType",
      "UserAssigned"
    ],
    "type": "object",
    "properties": {
      "LeadId": {
        "type": "integer",
        "format": "int32"
      },
      "Summary": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string"
      },
      "TaskStartDate": {
        "type": "string",
        "format": "date-time"
      },
      "UserAssigned": {
        "type": "integer",
        "format": "int32"
      },
      "TaskType": {
        "minLength": 1,
        "type": "string"
      },
      "Details": {
        "type": "string",
        "nullable": true
      },
      "AssociateWithEmail": {
        "type": "boolean"
      }
    },
    "additionalProperties": false
  },
  "TaskUpdateApi": {
    "type": "object",
    "properties": {
      "TaskId": {
        "type": "integer",
        "format": "int32"
      },
      "Summary": {
        "maxLength": 200,
        "minLength": 0,
        "type": "string",
        "nullable": true
      },
      "TaskStartDate": {
        "type": "string",
        "format": "date-time",
        "nullable": true
      },
      "Completed": {
        "type": "boolean",
        "nullable": true
      },
      "UserAssigned": {
        "type": "integer",
        "format": "int32",
        "nullable": true
      },
      "TaskType": {
        "type": "string",
        "nullable": true
      },
      "Details": {
        "type": "string",
        "nullable": true
      }
    },
    "additionalProperties": false
  },
  "UserApi": {
    "type": "object",
    "properties": {
      "Id": {
        "type": "integer",
        "format": "int32"
      },
      "FirstName": {
        "type": "string",
        "nullable": true
      },
      "LastName": {
        "type": "string",
        "nullable": true
      },
      "Email": {
        "type": "string",
        "nullable": true
      },
      "Code": {
        "type": "string",
        "nullable": true
      },
      "Roles": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/LeadRoleApi"
        },
        "nullable": true
      },
      "Permissions": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/PermissionApi"
        },
        "nullable": true
      }
    },
    "additionalProperties": false
  }
} as const;
