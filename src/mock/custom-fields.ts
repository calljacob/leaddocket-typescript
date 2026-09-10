import { contactCustomFieldsGet, customFieldsGet } from '../client/sdk.gen';
import type { CustomFieldsApi } from '../client/types.gen';
import type { LeadDocketMockSeed, MockCustomFieldDefinition } from './index';

export type LeadDocketLiveAuth =
  | { apiKey: string; bearerToken?: never }
  | { apiKey?: never; bearerToken: string };

export type DiscoverLeadDocketCustomFieldsOptions = {
  baseUrl: string;
  auth: LeadDocketLiveAuth;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  allowInsecure?: boolean;
};

export type LeadDocketCustomFieldSnapshot = {
  schemaVersion: 1;
  seed: Required<Pick<LeadDocketMockSeed, 'customFields' | 'contactCustomFields'>>;
};

export async function discoverLeadDocketCustomFields(
  options: DiscoverLeadDocketCustomFieldsOptions,
): Promise<LeadDocketCustomFieldSnapshot> {
  const baseUrl = normalizeLiveBaseUrl(options.baseUrl, options.allowInsecure ?? false);
  const headers = liveAuthHeaders(options.auth);
  const requestOptions = {
    baseUrl,
    fetch: options.fetch,
    headers,
    redirect: 'error' as const,
    signal: options.signal,
    throwOnError: true as const,
  };

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
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new Error(
      'Unable to discover Lead Docket custom fields. Check the URL and credentials.',
      {
        cause: error,
      },
    );
  }
}

function normalizeLiveBaseUrl(value: string, allowInsecure: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError('Lead Docket baseUrl must be a valid absolute URL.');
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new TypeError(
      'Lead Docket baseUrl cannot include credentials, query parameters, or a hash.',
    );
  }
  if (url.protocol !== 'https:' && !(allowInsecure && url.protocol === 'http:')) {
    throw new TypeError('Lead Docket baseUrl must use HTTPS.');
  }
  if (url.pathname !== '/' && url.pathname !== '') {
    throw new TypeError('Lead Docket baseUrl must be an origin without a path.');
  }

  return url.origin;
}

function liveAuthHeaders(auth: LeadDocketLiveAuth): HeadersInit {
  if (auth.apiKey) {
    return { api_key: auth.apiKey };
  }
  if (auth.bearerToken) {
    return { Authorization: `Bearer ${auth.bearerToken}` };
  }
  throw new TypeError('Lead Docket authentication requires an API key or bearer token.');
}

function normalizeDefinitions(
  value: Array<CustomFieldsApi> | undefined,
  endpoint: string,
): MockCustomFieldDefinition[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`Lead Docket returned an invalid custom-field response from ${endpoint}.`);
  }

  return value.map((definition, index) => {
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
      throw new TypeError(`Lead Docket returned an invalid custom field at ${endpoint}[${index}].`);
    }

    return Object.fromEntries(
      Object.entries(definition).filter(([, property]) => property !== null),
    ) as MockCustomFieldDefinition;
  });
}
