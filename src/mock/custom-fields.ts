import { contactCustomFieldsGet, customFieldsGet } from '../client/sdk.gen';
import type { LeadDocketMockSeed, MockCustomFieldDefinition } from './index';
import {
  createLeadDocketLiveRequestOptions,
  rejectUnknownProperties,
  throwSafeLeadDocketDiscoveryError,
  type LeadDocketLiveClientOptions,
} from './live-client';

export type { LeadDocketLiveAuth } from './live-client';

const CUSTOM_FIELD_PROPERTIES = new Set([
  'Id',
  'FieldName',
  'Location',
  'Directions',
  'DisplayOrder',
  'DefaultValues',
  'Code',
  'CaseTypes',
  'DependsOn',
  'FieldType',
  'Disabled',
  'ReadOnly',
  'Hidden',
  'Required',
]);
const CASE_TYPE_PROPERTIES = new Set(['Id', 'Name', 'Code', 'Description']);

export type DiscoverLeadDocketCustomFieldsOptions = LeadDocketLiveClientOptions;

export type LeadDocketCustomFieldSnapshot = {
  schemaVersion: 1;
  seed: Required<Pick<LeadDocketMockSeed, 'customFields' | 'contactCustomFields'>>;
};

export async function discoverLeadDocketCustomFields(
  options: DiscoverLeadDocketCustomFieldsOptions,
): Promise<LeadDocketCustomFieldSnapshot> {
  const requestOptions = createLeadDocketLiveRequestOptions(options);

  try {
    const [contactResult, customResult] = await Promise.all([
      contactCustomFieldsGet(requestOptions),
      customFieldsGet(requestOptions),
    ]);

    return {
      schemaVersion: 1,
      seed: {
        contactCustomFields: normalizeDefinitions(
          contactResult.data,
          '/api/contactcustomfields/list',
        ),
        customFields: normalizeDefinitions(customResult.data, '/api/customfields/list'),
      },
    };
  } catch (error) {
    throwSafeLeadDocketDiscoveryError(
      error,
      'Unable to discover Lead Docket custom fields. Check the URL and credentials.',
    );
  }
}

function normalizeDefinitions(value: unknown, endpoint: string): MockCustomFieldDefinition[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`Lead Docket returned an invalid custom-field response from ${endpoint}.`);
  }

  return value.map((definition) => {
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      throw new TypeError(`Lead Docket returned an invalid custom field from ${endpoint}.`);
    }
    rejectUnknownProperties(definition, CUSTOM_FIELD_PROPERTIES, endpoint);

    const normalized: Record<string, unknown> = {};
    for (const [property, item] of Object.entries(definition)) {
      if (item === null || item === undefined) continue;
      if (property === 'CaseTypes') {
        if (!Array.isArray(item)) throw invalidShape(endpoint);
        normalized[property] = item.map((caseType) => normalizeCaseType(caseType, endpoint));
      } else {
        if (!isJsonPrimitive(item)) throw invalidShape(endpoint);
        normalized[property] = item;
      }
    }
    return normalized as MockCustomFieldDefinition;
  });
}

function normalizeCaseType(value: unknown, endpoint: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalidShape(endpoint);
  rejectUnknownProperties(value, CASE_TYPE_PROPERTIES, endpoint);
  return Object.fromEntries(
    Object.entries(value).flatMap(([property, item]) => {
      if (item === null || item === undefined) return [];
      if (!isJsonPrimitive(item)) throw invalidShape(endpoint);
      return [[property, item]];
    }),
  );
}

function isJsonPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function invalidShape(endpoint: string): Error {
  return new TypeError(`Lead Docket returned an invalid custom-field response from ${endpoint}.`);
}
