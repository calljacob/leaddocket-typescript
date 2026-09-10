const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESPONSE_BYTES = 1024 * 1024;
const MAX_TIMEOUT_MS = 2_147_483_647;

export type LeadDocketLiveAuth =
  | { apiKey: string; bearerToken?: never }
  | { apiKey?: never; bearerToken: string };

export type LeadDocketLiveClientOptions = {
  baseUrl: string;
  auth: LeadDocketLiveAuth;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  /**
   * Permits HTTP for local tests. For backward compatibility this also permits a custom host;
   * new callers should set allowCustomHost explicitly when that is their intent.
   */
  allowInsecure?: boolean;
  /** Permits a host outside *.leaddocket.com for an explicit test adapter. */
  allowCustomHost?: boolean;
  /** Per-request deadline in milliseconds. Defaults to 10 seconds. */
  timeoutMs?: number;
  /** Maximum decoded response body size in bytes. Defaults to 1 MiB. */
  maxResponseBytes?: number;
};

export type LeadDocketLiveRequestOptions = {
  baseUrl: string;
  fetch: typeof fetch;
  headers: HeadersInit;
  redirect: 'error';
  signal?: AbortSignal;
  throwOnError: true;
};

export class LeadDocketLiveSafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadDocketLiveError';
  }
}

export function createLeadDocketLiveRequestOptions(
  options: LeadDocketLiveClientOptions,
): LeadDocketLiveRequestOptions {
  const allowCustomHost = options.allowCustomHost ?? options.allowInsecure ?? false;
  const baseUrl = normalizeLeadDocketLiveBaseUrl(
    options.baseUrl,
    options.allowInsecure ?? false,
    allowCustomHost,
  );
  const timeoutMs = positiveInteger(
    options.timeoutMs,
    DEFAULT_TIMEOUT_MS,
    'timeoutMs',
    MAX_TIMEOUT_MS,
  );
  const maxResponseBytes = positiveInteger(
    options.maxResponseBytes,
    DEFAULT_MAX_RESPONSE_BYTES,
    'maxResponseBytes',
    Number.MAX_SAFE_INTEGER,
  );

  return {
    baseUrl,
    fetch: createBoundedFetch(options.fetch ?? globalThis.fetch, {
      baseUrl,
      maxResponseBytes,
      timeoutMs,
    }),
    headers: leadDocketLiveAuthHeaders(options.auth),
    redirect: 'error',
    signal: options.signal,
    throwOnError: true,
  };
}

export function rejectUnknownProperties(
  value: object,
  allowedProperties: ReadonlySet<string>,
  endpoint: string,
): void {
  if (Object.keys(value).some((property) => !allowedProperties.has(property))) {
    throw new LeadDocketLiveSafeError(
      `Lead Docket returned an unrecognized response shape from ${endpoint}; the snapshot was rejected.`,
    );
  }
}

export function isLeadDocketLiveSafeError(error: unknown): error is LeadDocketLiveSafeError {
  return error instanceof LeadDocketLiveSafeError;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export function throwSafeLeadDocketDiscoveryError(error: unknown, message: string): never {
  if (isAbortError(error) || isLeadDocketLiveSafeError(error)) throw error;
  throw new Error(message);
}

function normalizeLeadDocketLiveBaseUrl(
  value: string,
  allowInsecure: boolean,
  allowCustomHost: boolean,
): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError('Lead Docket baseUrl must be a valid absolute URL.');
  }

  if (url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) {
    throw new TypeError(
      'Lead Docket baseUrl must be an origin without credentials, query parameters, or a hash.',
    );
  }
  if (url.protocol !== 'https:' && !(allowInsecure && url.protocol === 'http:')) {
    throw new TypeError('Lead Docket baseUrl must use HTTPS.');
  }
  if (!allowCustomHost && !url.hostname.toLowerCase().endsWith('.leaddocket.com')) {
    throw new TypeError('Lead Docket baseUrl must use a *.leaddocket.com host.');
  }

  return url.origin;
}

function leadDocketLiveAuthHeaders(auth: LeadDocketLiveAuth): HeadersInit {
  if (auth.apiKey) return { api_key: auth.apiKey };
  if (auth.bearerToken) return { Authorization: `Bearer ${auth.bearerToken}` };
  throw new TypeError('Lead Docket authentication requires an API key or bearer token.');
}

function positiveInteger(
  value: number | undefined,
  fallback: number,
  name: string,
  maximum: number,
): number {
  const resolved = value ?? fallback;
  if (!Number.isSafeInteger(resolved) || resolved <= 0 || resolved > maximum) {
    throw new TypeError(
      `Lead Docket ${name} must be a positive integer no greater than ${maximum}.`,
    );
  }
  return resolved;
}

function createBoundedFetch(
  fetchImplementation: typeof fetch,
  policy: { baseUrl: string; maxResponseBytes: number; timeoutMs: number },
): typeof fetch {
  return async (input, init) => {
    const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== policy.baseUrl || request.method !== 'GET') {
      throw new LeadDocketLiveSafeError(
        'Lead Docket live discovery blocked an unexpected request.',
      );
    }
    if (request.redirect !== 'error') {
      throw new LeadDocketLiveSafeError(
        'Lead Docket live discovery requires redirects to be blocked.',
      );
    }

    const timeoutSignal = AbortSignal.timeout(policy.timeoutMs);
    const signal = AbortSignal.any([request.signal, timeoutSignal]);
    const boundedRequest = new Request(request, { signal });

    let response: Response;
    try {
      response = await withAbort(fetchImplementation(boundedRequest), signal);
    } catch {
      if (request.signal.aborted) throw safeAbortError();
      if (timeoutSignal.aborted) {
        throw new LeadDocketLiveSafeError(
          `Lead Docket live request timed out after ${policy.timeoutMs}ms.`,
        );
      }
      throw new LeadDocketLiveSafeError('Lead Docket live request failed.');
    }

    try {
      return await boundedResponse(response, policy.maxResponseBytes, signal);
    } catch (error) {
      if (request.signal.aborted) throw safeAbortError();
      if (timeoutSignal.aborted) {
        throw new LeadDocketLiveSafeError(
          `Lead Docket live request timed out after ${policy.timeoutMs}ms.`,
        );
      }
      if (isLeadDocketLiveSafeError(error)) throw error;
      throw new LeadDocketLiveSafeError('Lead Docket live response could not be read safely.');
    }
  };
}

async function boundedResponse(
  response: Response,
  maxResponseBytes: number,
  signal: AbortSignal,
): Promise<Response> {
  const declaredLength = response.headers.get('content-length');
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxResponseBytes) {
      throw responseTooLarge(maxResponseBytes);
    }
  }

  if (!response.body) return response;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await withAbort(reader.read(), signal);
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxResponseBytes) {
        await reader.cancel();
        throw responseTooLarge(maxResponseBytes);
      }
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const headers = new Headers(response.headers);
  headers.set('content-length', String(totalBytes));
  return new Response(
    response.status === 204 || response.status === 205 || response.status === 304 ? null : body,
    {
      headers,
      status: response.status,
      statusText: response.statusText,
    },
  );
}

function responseTooLarge(maxResponseBytes: number): LeadDocketLiveSafeError {
  return new LeadDocketLiveSafeError(
    `Lead Docket live response exceeded the ${maxResponseBytes}-byte limit.`,
  );
}

function safeAbortError(): DOMException {
  return new DOMException('The Lead Docket live request was aborted.', 'AbortError');
}

function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', abort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      },
    );
  });
}
