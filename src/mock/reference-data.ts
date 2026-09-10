import {
  getApiLeadroles,
  getApiLeadsourcesList,
  getApiLookups,
  getApiLookupsGettypes,
  leadFormsGetAll,
  leadFormsGetById,
  referralsPracticeAreas,
  settingsGetOptions,
  statusesGetAll,
} from '../client/sdk.gen';
import type { LookupTypes } from '../client/types.gen';
import type { LeadDocketLiveAuth } from './custom-fields';
import type { LeadDocketMockSeed } from './index';
import {
  createLeadDocketLiveRequestOptions,
  rejectUnknownProperties,
  throwSafeLeadDocketDiscoveryError,
  type LeadDocketLiveClientOptions,
  type LeadDocketLiveRequestOptions,
} from './live-client';

const DEFAULT_LOOKUP_TYPES: LookupTypes[] = [
  'LeadSource',
  'CaseType',
  'MarketingSource',
  'Statuses',
  'Offices',
  'Forms',
  'Tags',
];
const ALL_LOOKUP_TYPES = [...DEFAULT_LOOKUP_TYPES, 'PhoneNumbers'] satisfies LookupTypes[];
const DEFAULT_MAX_CONCURRENCY = 4;
const MAX_CONCURRENCY = 16;

const DATA_ENVELOPE_PROPERTIES = new Set(['Error', 'IsValid', 'Data', 'data', 'Actions', 'Links']);
const ARRAY_ENVELOPE_PROPERTIES = new Set([...DATA_ENVELOPE_PROPERTIES, 'Records', 'records']);
const STATUS_PROPERTIES = new Set([
  'Id',
  'Status',
  'StatusName',
  'StatusScript',
  'IsClosed',
  'IsCurrentClient',
  'IsReferrable',
  'IsSequenced',
  'IsScheduleable',
  'IsIncludedInSearch',
  'IsValueEnabled',
  'IsOnDashboard',
  'IsResolved',
  'IsWanted',
  'DisplayOrder',
  'Substatuses',
  'LeadRoleStatuses',
]);
const SUBSTATUS_PROPERTIES = new Set([
  'Id',
  'SubStatusName',
  'StatusScript',
  'Reasons',
  'IsClosed',
  'IsCurrentClient',
  'IsScheduleable',
  'IsIncludedInSearch',
  'IsValueEnabled',
  'IsOnDashboard',
  'IsResolved',
  'IsWanted',
  'ReferredType',
  'DisplayOrder',
]);
const LEAD_ROLE_STATUS_PROPERTIES = new Set(['LeadRoleId', 'VisibilityOnLead']);
const LEAD_ROLE_PROPERTIES = new Set([
  'LeadRoleId',
  'RoleName',
  'IsOwner',
  'IsDefault',
  'PriorityOrder',
]);
const LEAD_SOURCE_PROPERTIES = new Set([
  'Id',
  'Name',
  'Code',
  'Description',
  'DisplayOrder',
  'Disabled',
  'Enabled',
  'IsActive',
]);
const LEAD_FORM_PROPERTIES = new Set([
  'LeadFormId',
  'FormName',
  'CaseTypeId',
  'CaseTypeName',
  'Enabled',
  'DaysToExpiration',
]);
const LEAD_FORM_RESPONSE_PROPERTIES = new Set([
  ...LEAD_FORM_PROPERTIES,
  'CreatedDate',
  'CreatedById',
  'CreatedBy',
]);
const CASE_TYPE_PROPERTIES = new Set(['Id', 'Name', 'Code', 'Description']);
const MARKETING_SOURCE_PROPERTIES = new Set([
  'Id',
  'Name',
  'Code',
  'Description',
  'DisplayOrder',
  'Disabled',
  'Enabled',
  'IsActive',
]);
const OFFICE_PROPERTIES = new Set([
  'Id',
  'Name',
  'Code',
  'OfficeId',
  'OfficeName',
  'DisplayOrder',
  'Enabled',
]);
const TAG_PROPERTIES = new Set([
  'Id',
  'Name',
  'TagId',
  'TagName',
  'Color',
  'Description',
  'DisplayOrder',
  'Enabled',
]);
const PHONE_NUMBER_PROPERTIES = new Set([
  'Id',
  'Name',
  'PhoneNumber',
  'Number',
  'Description',
  'DisplayOrder',
  'Enabled',
]);
const SETTINGS_PROPERTIES = new Set(['Name', 'IsEnabled']);
const GENERIC_LOOKUP_PROPERTIES = [
  'Id',
  'Name',
  'Code',
  'Description',
  'DisplayOrder',
  'Enabled',
  'Disabled',
  'IsActive',
] as const;
const STATUS_LOOKUP_PROPERTIES = new Set([...STATUS_PROPERTIES, ...GENERIC_LOOKUP_PROPERTIES]);
const FORM_LOOKUP_PROPERTIES = new Set([...LEAD_FORM_PROPERTIES, ...GENERIC_LOOKUP_PROPERTIES]);
const FORM_LOOKUP_RESPONSE_PROPERTIES = new Set([
  ...LEAD_FORM_RESPONSE_PROPERTIES,
  ...GENERIC_LOOKUP_PROPERTIES,
]);

const LOOKUP_PROPERTIES: Record<Exclude<LookupTypes, 'Statuses' | 'Forms'>, ReadonlySet<string>> = {
  LeadSource: LEAD_SOURCE_PROPERTIES,
  CaseType: CASE_TYPE_PROPERTIES,
  MarketingSource: MARKETING_SOURCE_PROPERTIES,
  Offices: OFFICE_PROPERTIES,
  Tags: TAG_PROPERTIES,
  PhoneNumbers: PHONE_NUMBER_PROPERTIES,
};

export type DiscoverLeadDocketReferenceDataOptions = LeadDocketLiveClientOptions & {
  includePhoneNumbers?: boolean;
  /** Maximum concurrent lookup and lead-form detail requests. Defaults to 4; maximum 16. */
  maxConcurrency?: number;
};

export type LeadDocketReferenceDataSnapshot = {
  schemaVersion: 1;
  seed: Pick<
    LeadDocketMockSeed,
    'statuses' | 'substatuses' | 'leadRoles' | 'leadSources' | 'leadForms' | 'lookups' | 'settings'
  >;
};

export async function discoverLeadDocketReferenceData(
  options: DiscoverLeadDocketReferenceDataOptions,
): Promise<LeadDocketReferenceDataSnapshot> {
  const requestOptions = createLeadDocketLiveRequestOptions(options);
  const maxConcurrency = normalizeConcurrency(options.maxConcurrency);

  try {
    const [
      statusesResult,
      rolesResult,
      sourcesResult,
      lookupTypesResult,
      formsResult,
      practiceAreasResult,
      settingsResult,
    ] = await Promise.all([
      statusesGetAll(requestOptions),
      getApiLeadroles(requestOptions),
      getApiLeadsourcesList(requestOptions),
      getApiLookupsGettypes(requestOptions),
      leadFormsGetAll(requestOptions),
      referralsPracticeAreas(requestOptions),
      settingsGetOptions(requestOptions),
    ]);

    const statuses = normalizeStatuses(statusesResult.data);
    const availableLookupTypes = normalizeLookupTypes(lookupTypesResult.data);
    const allowedLookupTypes = (
      options.includePhoneNumbers ? ALL_LOOKUP_TYPES : DEFAULT_LOOKUP_TYPES
    ).filter((type) => availableLookupTypes.includes(type));
    const lookupEntries = await mapWithConcurrency(
      allowedLookupTypes,
      maxConcurrency,
      async (type) => {
        const result = await getApiLookups({ ...requestOptions, query: { type } });
        return [type, normalizeLookupValue(result.data, type)] as const;
      },
    );
    const leadForms = await normalizeLeadForms(formsResult.data, requestOptions, maxConcurrency);

    return {
      schemaVersion: 1,
      seed: {
        statuses: statuses.statuses,
        substatuses: statuses.substatuses,
        leadRoles: normalizeReferenceArray(
          rolesResult.data,
          LEAD_ROLE_PROPERTIES,
          '/api/leadroles',
        ),
        leadSources: normalizeReferenceArray(
          sourcesResult.data,
          LEAD_SOURCE_PROPERTIES,
          '/api/leadsources/list',
        ),
        leadForms,
        lookups: {
          ...Object.fromEntries(lookupEntries),
          ReferralPracticeAreas: normalizeStringArray(
            practiceAreasResult.data,
            '/api/referrals/listpracticeareas',
          ),
        },
        settings: normalizeSettings(settingsResult.data),
      },
    };
  } catch (error) {
    throwSafeLeadDocketDiscoveryError(
      error,
      'Unable to discover Lead Docket reference data. Check the URL, credentials, and API permissions.',
    );
  }
}

function normalizeStatuses(value: unknown): {
  statuses: Array<Record<string, unknown>>;
  substatuses: Array<Record<string, unknown>>;
} {
  const endpoint = '/api/statuses';
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalidResponse(endpoint);
  rejectUnknownProperties(value, DATA_ENVELOPE_PROPERTIES, endpoint);
  const data =
    (value as { Data?: unknown; data?: unknown }).Data ?? (value as { data?: unknown }).data;
  if (!Array.isArray(data)) throw invalidResponse(endpoint);

  const statuses: Array<Record<string, unknown>> = [];
  const substatuses: Array<Record<string, unknown>> = [];
  for (const wrapper of data) {
    const statusValue = unwrapDataObject(wrapper, endpoint);
    if (!statusValue) throw invalidResponse(endpoint);
    const status = normalizeStatus(statusValue, endpoint);
    const nested = Array.isArray(status.Substatuses)
      ? (status.Substatuses as Array<Record<string, unknown>>)
      : [];
    statuses.push(status);
    for (const substatus of nested) {
      substatuses.push({ ...substatus, StatusId: status.Id });
    }
  }
  return { statuses, substatuses };
}

async function normalizeLeadForms(
  value: unknown,
  requestOptions: LeadDocketLiveRequestOptions,
  maxConcurrency: number,
): Promise<Array<Record<string, unknown>>> {
  const endpoint = '/api/leads/forms';
  if (!Array.isArray(value)) throw invalidResponse(endpoint);
  const summaries = value.map((wrapper) => {
    const form = unwrapDataObject(wrapper, endpoint);
    if (!form) throw invalidResponse(endpoint);
    return normalizePrimitiveRecord(
      form,
      LEAD_FORM_PROPERTIES,
      endpoint,
      LEAD_FORM_RESPONSE_PROPERTIES,
    );
  });

  return mapWithConcurrency(summaries.slice(0, 100), maxConcurrency, async (summary) => {
    if (typeof summary.LeadFormId !== 'number') return summary;
    const detailEndpoint = '/api/leads/forms/{id}';
    const result = await leadFormsGetById({
      ...requestOptions,
      path: { id: summary.LeadFormId },
    });
    const detail = unwrapDataObject(result.data, detailEndpoint);
    if (!detail) throw invalidResponse(detailEndpoint);
    return {
      ...summary,
      ...normalizePrimitiveRecord(
        detail,
        LEAD_FORM_PROPERTIES,
        detailEndpoint,
        LEAD_FORM_RESPONSE_PROPERTIES,
      ),
    };
  });
}

function normalizeLookupTypes(value: unknown): LookupTypes[] {
  const endpoint = '/api/lookups/gettypes';
  const items = unwrapArray(value, endpoint);
  const normalized = items.map((item) => {
    if (typeof item === 'string') return item;
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw invalidResponse(endpoint);
    const properties = new Set(['Name', 'name', 'Value', 'value']);
    rejectUnknownProperties(item, properties, endpoint);
    const record = item as Record<string, unknown>;
    const candidate = [record.Name, record.name, record.Value, record.value].find(
      (entry): entry is string => typeof entry === 'string',
    );
    if (!candidate) throw invalidResponse(endpoint);
    return candidate;
  });
  const canonical = new Map(ALL_LOOKUP_TYPES.map((type) => [type.toLowerCase(), type]));
  return [
    ...new Set(normalized.map((type) => canonical.get(type.toLowerCase())).filter(Boolean)),
  ] as LookupTypes[];
}

function normalizeReferenceArray(
  value: unknown,
  allowedProperties: ReadonlySet<string>,
  endpoint: string,
): Array<Record<string, unknown>> {
  return unwrapArray(value, endpoint).map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw invalidResponse(endpoint);
    return normalizePrimitiveRecord(item, allowedProperties, endpoint);
  });
}

function normalizeStringArray(value: unknown, endpoint: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw invalidResponse(endpoint);
  }
  return [...new Set(value)];
}

function normalizeSettings(value: unknown): Record<string, unknown> {
  const endpoint = '/api/settings/get-options';
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) throw invalidResponse(endpoint);
  return normalizePrimitiveRecord(value, SETTINGS_PROPERTIES, endpoint);
}

function normalizeLookupValue(value: unknown, type: LookupTypes): unknown {
  const endpoint = `/api/lookups?type=${type}`;
  const items = isArrayEnvelope(value) ? unwrapArray(value, endpoint) : value;
  if (!Array.isArray(items)) throw invalidResponse(endpoint);

  return items.map((item) => {
    if (isJsonPrimitive(item) || item === null) return item;
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw invalidResponse(endpoint);
    if (type === 'Statuses') return normalizeStatus(item, endpoint, STATUS_LOOKUP_PROPERTIES);
    if (type === 'Forms') {
      return normalizePrimitiveRecord(
        item,
        FORM_LOOKUP_PROPERTIES,
        endpoint,
        FORM_LOOKUP_RESPONSE_PROPERTIES,
      );
    }
    return normalizePrimitiveRecord(item, LOOKUP_PROPERTIES[type], endpoint);
  });
}

function normalizeStatus(
  value: object,
  endpoint: string,
  allowedProperties: ReadonlySet<string> = STATUS_PROPERTIES,
): Record<string, unknown> {
  rejectUnknownProperties(value, allowedProperties, endpoint);
  return Object.fromEntries(
    Object.entries(value).map(([property, item]) => {
      if (property === 'Substatuses') {
        if (item === null) return [property, null];
        if (!Array.isArray(item)) throw invalidResponse(endpoint);
        return [
          property,
          item.map((entry) => {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
              throw invalidResponse(endpoint);
            }
            return normalizePrimitiveRecord(entry, SUBSTATUS_PROPERTIES, endpoint);
          }),
        ];
      }
      if (property === 'LeadRoleStatuses') {
        if (item === null) return [property, null];
        if (!Array.isArray(item)) throw invalidResponse(endpoint);
        return [
          property,
          item.map((entry) => {
            if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
              throw invalidResponse(endpoint);
            }
            return normalizePrimitiveRecord(entry, LEAD_ROLE_STATUS_PROPERTIES, endpoint);
          }),
        ];
      }
      if (!isJsonPrimitive(item) && item !== null) throw invalidResponse(endpoint);
      return [property, item];
    }),
  );
}

function normalizePrimitiveRecord(
  value: object,
  allowedProperties: ReadonlySet<string>,
  endpoint: string,
  acceptedProperties: ReadonlySet<string> = allowedProperties,
): Record<string, unknown> {
  rejectUnknownProperties(value, acceptedProperties, endpoint);
  const normalized: Record<string, unknown> = {};
  for (const [property, item] of Object.entries(value)) {
    if (!allowedProperties.has(property)) continue;
    if (!isJsonPrimitive(item) && item !== null) throw invalidResponse(endpoint);
    normalized[property] = item;
  }
  return normalized;
}

function unwrapDataObject(value: unknown, endpoint: string): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  if ('Data' in record || 'data' in record) {
    rejectUnknownProperties(value, DATA_ENVELOPE_PROPERTIES, endpoint);
    const data = record.Data ?? record.data;
    return data && typeof data === 'object' && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : undefined;
  }
  return record;
}

function unwrapArray(value: unknown, endpoint: string): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') throw invalidResponse(endpoint);
  rejectUnknownProperties(value, ARRAY_ENVELOPE_PROPERTIES, endpoint);
  const record = value as Record<string, unknown>;
  const data = record.Data ?? record.data ?? record.Records ?? record.records;
  if (!Array.isArray(data)) throw invalidResponse(endpoint);
  return data;
}

function isArrayEnvelope(value: unknown): boolean {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ['Data', 'data', 'Records', 'records'].some((property) => property in value),
  );
}

function isJsonPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function invalidResponse(endpoint: string): TypeError {
  return new TypeError(`Lead Docket returned an invalid response from ${endpoint}.`);
}

function normalizeConcurrency(value: number | undefined): number {
  const resolved = value ?? DEFAULT_MAX_CONCURRENCY;
  if (!Number.isInteger(resolved) || resolved < 1 || resolved > MAX_CONCURRENCY) {
    throw new TypeError(
      `Lead Docket maxConcurrency must be an integer between 1 and ${MAX_CONCURRENCY}.`,
    );
  }
  return resolved;
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = Array.from({ length: values.length }, () => undefined as R);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, values.length) }, async () => {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index]!);
    }
  });
  await Promise.all(workers);
  return results;
}

export type { LeadDocketLiveAuth };
