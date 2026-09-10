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
import type {
  LeadFormApi,
  LeadRoleApi,
  LookupTypes,
  SettingsOptions,
  StatusApi,
} from '../client/types.gen';
import type { LeadDocketLiveAuth } from './custom-fields';
import type { LeadDocketMockSeed } from './index';

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
const PRIVATE_KEY =
  /(?:email|phone|address|contact|member|attention|createdby|processedby|user|url|href|link)/i;

export type DiscoverLeadDocketReferenceDataOptions = {
  baseUrl: string;
  auth: LeadDocketLiveAuth;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  includePhoneNumbers?: boolean;
  allowInsecure?: boolean;
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
  const baseUrl = normalizeBaseUrl(options.baseUrl, options.allowInsecure ?? false);
  const headers = authHeaders(options.auth);
  const requestOptions = {
    baseUrl,
    fetch: options.fetch,
    headers,
    redirect: 'error' as const,
    signal: options.signal,
    throwOnError: true as const,
  };

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
    const lookupEntries = await Promise.all(
      allowedLookupTypes.map(async (type) => {
        const result = await getApiLookups({ ...requestOptions, query: { type } });
        return [type, sanitizeReferenceValue(result.data)] as const;
      }),
    );
    const leadForms = await normalizeLeadForms(formsResult.data, requestOptions);

    return {
      schemaVersion: 1,
      seed: {
        statuses: statuses.statuses,
        substatuses: statuses.substatuses,
        leadRoles: normalizeReferenceArray<LeadRoleApi>(rolesResult.data, 'lead roles'),
        leadSources: normalizeReferenceArray<Record<string, unknown>>(
          sourcesResult.data,
          'lead sources',
        ),
        leadForms,
        lookups: {
          ...Object.fromEntries(lookupEntries),
          ReferralPracticeAreas: normalizeStringArray(
            practiceAreasResult.data,
            'referral practice areas',
          ),
        },
        settings: sanitizeSettings(settingsResult.data),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new Error(
      'Unable to discover Lead Docket reference data. Check the URL, credentials, and API permissions.',
      { cause: error },
    );
  }
}

function normalizeStatuses(value: unknown): {
  statuses: Array<Record<string, unknown>>;
  substatuses: Array<Record<string, unknown>>;
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Lead Docket returned an invalid status response.');
  }
  const data = (value as { Data?: unknown }).Data;
  if (!Array.isArray(data)) throw new TypeError('Lead Docket status response is missing Data.');
  const statuses: Array<Record<string, unknown>> = [];
  const substatuses: Array<Record<string, unknown>> = [];
  for (const wrapper of data) {
    const status = unwrapData<StatusApi>(wrapper);
    if (!status) continue;
    const sanitized = sanitizeReferenceObject(status);
    const nested = Array.isArray(status.Substatuses) ? status.Substatuses : [];
    sanitized.Substatuses = nested.map((item) => sanitizeReferenceObject(item));
    statuses.push(sanitized);
    for (const substatus of nested) {
      substatuses.push({
        ...sanitizeReferenceObject(substatus),
        StatusId: status.Id,
      } satisfies Record<string, unknown>);
    }
  }
  return { statuses, substatuses };
}

async function normalizeLeadForms(
  value: unknown,
  requestOptions: {
    baseUrl: string;
    fetch?: typeof fetch;
    headers: HeadersInit;
    redirect: 'error';
    signal?: AbortSignal;
    throwOnError: true;
  },
): Promise<Array<Record<string, unknown>>> {
  if (!Array.isArray(value)) throw new TypeError('Lead Docket returned an invalid Lead Form list.');
  const summaries = value
    .map((wrapper) => unwrapData<LeadFormApi>(wrapper))
    .filter((form): form is LeadFormApi => Boolean(form));
  const details = await Promise.all(
    summaries.slice(0, 100).map(async (summary) => {
      if (typeof summary.LeadFormId !== 'number') return summary;
      const result = await leadFormsGetById({
        ...requestOptions,
        path: { id: summary.LeadFormId },
      });
      return { ...summary, ...unwrapData<LeadFormApi>(result.data) };
    }),
  );
  return details.map((form) => {
    const sanitized = sanitizeReferenceObject(form);
    delete sanitized.CreatedBy;
    delete sanitized.CreatedById;
    return sanitized;
  });
}

function normalizeLookupTypes(value: unknown): LookupTypes[] {
  const items = unwrapArray(value);
  const normalized = items
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        return [record.Name, record.name, record.Value, record.value].find(
          (candidate): candidate is string => typeof candidate === 'string',
        );
      }
      return undefined;
    })
    .filter((item): item is string => Boolean(item));
  const canonical = new Map(ALL_LOOKUP_TYPES.map((type) => [type.toLowerCase(), type]));
  return [
    ...new Set(normalized.map((type) => canonical.get(type.toLowerCase())).filter(Boolean)),
  ] as LookupTypes[];
}

function normalizeReferenceArray<T extends object>(
  value: unknown,
  label: string,
): Array<Record<string, unknown>> {
  const values = unwrapArray(value);
  if (!values.length && !Array.isArray(value)) {
    throw new TypeError(`Lead Docket returned invalid ${label}.`);
  }
  return values
    .filter((item): item is T => Boolean(item && typeof item === 'object' && !Array.isArray(item)))
    .map((item) => sanitizeReferenceObject(item));
}

function normalizeStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new TypeError(`Lead Docket returned invalid ${label}.`);
  }
  return [...new Set(value)];
}

function sanitizeSettings(value: SettingsOptions | undefined): Record<string, unknown> {
  return value && typeof value === 'object' ? sanitizeReferenceObject(value) : {};
}

function unwrapData<T extends object>(value: unknown): T | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const data = record.Data ?? record.data;
  return data && typeof data === 'object' && !Array.isArray(data) ? (data as T) : (value as T);
}

function unwrapArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  const data = record.Data ?? record.data ?? record.Records ?? record.records;
  return Array.isArray(data) ? data : [];
}

function sanitizeReferenceValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeReferenceValue);
  if (value && typeof value === 'object') return sanitizeReferenceObject(value);
  return ['string', 'number', 'boolean'].includes(typeof value) || value === null
    ? value
    : undefined;
}

function sanitizeReferenceObject(value: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      if (PRIVATE_KEY.test(key)) return [];
      const sanitized = sanitizeReferenceValue(item);
      return sanitized === undefined ? [] : [[key, sanitized]];
    }),
  );
}

function normalizeBaseUrl(value: string, allowInsecure: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError('Lead Docket baseUrl must be a valid absolute URL.');
  }
  if (url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) {
    throw new TypeError('Lead Docket baseUrl must be an origin without credentials or parameters.');
  }
  if (url.protocol !== 'https:' && !(allowInsecure && url.protocol === 'http:')) {
    throw new TypeError('Lead Docket baseUrl must use HTTPS.');
  }
  return url.origin;
}

function authHeaders(auth: LeadDocketLiveAuth): HeadersInit {
  if (auth.apiKey) return { api_key: auth.apiKey };
  if (auth.bearerToken) return { Authorization: `Bearer ${auth.bearerToken}` };
  throw new TypeError('Lead Docket authentication requires an API key or bearer token.');
}
