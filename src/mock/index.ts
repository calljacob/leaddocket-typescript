import {
  createOpportunityIntegrationForms,
  type MockOpportunityIntegration,
  type OpportunityIntegrationForms,
} from './integrations';
import { dispatchMockOperation } from './operations';
import { mockComponentSchemas } from './schemas.gen';
import { mockRouteDefinitions, type MockRouteDefinition } from './routes.gen';
import {
  operationToWebhookKind,
  projectWebhook,
  type LeadDocketWebhookPayload,
  type WebhookKind,
} from './webhook-payloads';

export type MockHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class MockApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MockApiError';
  }
}

export type MockWebhookAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'sent'
  | 'started'
  | 'ended'
  | 'locked'
  | 'unlocked'
  | 'disregarded'
  | 'processed'
  | 'changed'
  | 'triggered';

export type MockWebhookEvent = {
  id: string;
  event: string;
  entity: string;
  action: MockWebhookAction;
  apiCallDriven: boolean;
  operationId?: string;
  method?: string;
  path?: string;
  pathParams?: Record<string, string>;
  query?: Record<string, string>;
  requestBody?: unknown;
  data?: unknown;
  payload?: LeadDocketWebhookPayload;
  occurredAt: string;
};

export type MockWebhookHandler = (event: MockWebhookEvent) => void | Promise<void>;

export type MockWebhookDelivery = {
  id: string;
  eventId: string;
  target: string;
  kind: 'handler' | 'http';
  attemptedAt: string;
  durationMs: number;
  ok: boolean;
  status?: number;
  error?: string;
};

export type MockWebhookSubscription = {
  url?: string;
  events?: string[];
  handler?: MockWebhookHandler;
  headers?: HeadersInit;
};

export type MockApiRequest = {
  id: string;
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  pathParams: Record<string, string>;
  operationId?: string;
  body?: unknown;
  at: string;
};

export type MockCustomFieldResource = 'contacts' | 'leads' | 'opportunities';

export type MockCustomFieldDefinition = Record<string, unknown> & {
  id?: number;
  Id?: number;
  name?: string;
  FieldName?: string;
  location?: string;
  Location?: string;
  code?: string;
  Code?: string;
  fieldType?: string;
  FieldType?: string;
  defaultValue?: unknown;
  DefaultValues?: string | null;
};

export type MockCustomFieldValueMap = Record<string, unknown>;

export type MockCustomFieldValues = Partial<
  Record<MockCustomFieldResource, Record<string, MockCustomFieldValueMap>>
>;

type LeadDocketMockStores = {
  contacts: Array<Record<string, unknown>>;
  leads: Array<Record<string, unknown>>;
  opportunities: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  statuses: Array<Record<string, unknown>>;
  substatuses: Array<Record<string, unknown>>;
  referrals: Array<Record<string, unknown>>;
  referralGroups: Array<Record<string, unknown>>;
  settlements: Array<Record<string, unknown>>;
  expenses: Array<Record<string, unknown>>;
  leadForms: Array<Record<string, unknown>>;
  messages: Array<Record<string, unknown>>;
  externalCalls: Array<Record<string, unknown>>;
  leadRoles: Array<Record<string, unknown>>;
  leadSources: Array<Record<string, unknown>>;
  customFields: MockCustomFieldDefinition[];
  contactCustomFields: MockCustomFieldDefinition[];
};

export type LeadDocketMockSeed = Partial<LeadDocketMockStores> & {
  customFieldValues?: MockCustomFieldValues;
  lookups?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export type LeadDocketMockApiOptions = {
  baseUrl?: string;
  seed?: LeadDocketMockSeed;
  webhookSubscriptions?: MockWebhookSubscription[];
  deliverWebhooks?: boolean;
  webhookFetch?: typeof fetch;
  webhookTimeoutMs?: number;
  opportunityIntegrations?: MockOpportunityIntegration[];
  historyLimit?: number;
  captureHistoryBodies?: boolean;
  maxRequestBodyBytes?: number;
  latencyMs?: number;
};

type MockStoreName = keyof LeadDocketMockStores;

type RouteMatch = {
  route: MockRouteDefinition;
  pathParams: Record<string, string>;
};

type NormalizedRequest = {
  request: Request;
  url: URL;
  path: string;
  method: string;
  query: Record<string, string>;
  body: unknown;
};

type RequestHandlerContext = NormalizedRequest & RouteMatch;

const JSON_HEADERS = { 'content-type': 'application/json' };
const ALL_ROUTES = [...mockRouteDefinitions];
const ROUTE_MATCHERS = ALL_ROUTES.map((route) => ({
  route,
  matcher: createPathMatcher(route.path),
})).sort((a, b) => routeSpecificity(b.route.path) - routeSpecificity(a.route.path));

const DEFAULT_BASE_URL = 'https://mock.leaddocket.local';

const STORE_TO_ENTITY: Record<MockStoreName, string> = {
  contacts: 'contact',
  leads: 'lead',
  opportunities: 'opportunity',
  tasks: 'task',
  users: 'user',
  statuses: 'status',
  substatuses: 'substatus',
  referrals: 'referral',
  referralGroups: 'referralGroup',
  settlements: 'settlement',
  expenses: 'expense',
  leadForms: 'leadForm',
  messages: 'message',
  externalCalls: 'externalCall',
  leadRoles: 'leadRole',
  leadSources: 'leadSource',
  customFields: 'customField',
  contactCustomFields: 'contactCustomField',
};

export class LeadDocketMockApi {
  readonly baseUrl: string;
  readonly fetch: typeof fetch;

  private nextId = 1000;
  private readonly routes = ALL_ROUTES;
  private readonly requests: MockApiRequest[] = [];
  private readonly webhookEvents: MockWebhookEvent[] = [];
  private readonly webhookDeliveries: MockWebhookDelivery[] = [];
  private readonly subscriptions: MockWebhookSubscription[] = [];
  private readonly deliverWebhooks: boolean;
  private readonly webhookFetch: typeof fetch;
  private readonly webhookTimeoutMs: number;
  private readonly historyLimit: number;
  private readonly captureHistoryBodies: boolean;
  private readonly maxRequestBodyBytes: number;
  private readonly latencyMs: number;
  private integrationForms: OpportunityIntegrationForms;
  private readonly stores: Record<MockStoreName, Array<Record<string, unknown>>>;
  private customFieldValues: Record<
    MockCustomFieldResource,
    Record<string, MockCustomFieldValueMap>
  >;
  private lookups: Record<string, unknown>;
  private settings: Record<string, unknown>;

  constructor(options: LeadDocketMockApiOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.deliverWebhooks = options.deliverWebhooks ?? true;
    this.webhookFetch = options.webhookFetch ?? globalThis.fetch;
    this.webhookTimeoutMs = options.webhookTimeoutMs ?? 10_000;
    this.historyLimit = normalizeHistoryLimit(options.historyLimit ?? 200);
    this.captureHistoryBodies = options.captureHistoryBodies ?? false;
    this.maxRequestBodyBytes = normalizeBodyLimit(options.maxRequestBodyBytes ?? 1_048_576);
    this.latencyMs = options.latencyMs ?? 0;
    this.stores = createDefaultStores();
    this.customFieldValues = createEmptyCustomFieldValues();
    this.lookups = defaultLookups();
    this.settings = defaultSettings();
    this.fetch = this.handleFetch.bind(this) as typeof fetch;
    this.integrationForms = this.createIntegrationForms(options.opportunityIntegrations ?? []);

    this.seed(options.seed);

    for (const subscription of options.webhookSubscriptions ?? []) {
      this.addWebhookSubscription(subscription);
    }
  }

  get routeDefinitions(): readonly MockRouteDefinition[] {
    return this.routes;
  }

  getOpportunityIntegrations() {
    return structuredCloneCompat(this.integrationForms.summaries);
  }

  setOpportunityIntegrations(integrations: MockOpportunityIntegration[]): void {
    this.integrationForms = this.createIntegrationForms(integrations);
  }

  getOpportunityIntegrationUrl(
    id: string | number,
    options: { preview?: boolean } = {},
  ): string | undefined {
    return this.integrationForms.accessUrl(this.baseUrl, String(id), options.preview);
  }

  getRequests(): MockApiRequest[] {
    return structuredCloneCompat(this.requests);
  }

  clearRequests(): void {
    this.requests.length = 0;
  }

  getWebhookEvents(): MockWebhookEvent[] {
    return structuredCloneCompat(this.webhookEvents);
  }

  clearWebhookEvents(): void {
    this.webhookEvents.length = 0;
  }

  getWebhookDeliveries(): MockWebhookDelivery[] {
    return structuredCloneCompat(this.webhookDeliveries);
  }

  clearWebhookDeliveries(): void {
    this.webhookDeliveries.length = 0;
  }

  addWebhookSubscription(subscription: MockWebhookSubscription): () => void {
    this.subscriptions.push(subscription);
    return () => {
      const index = this.subscriptions.indexOf(subscription);
      if (index >= 0) {
        this.subscriptions.splice(index, 1);
      }
    };
  }

  onWebhook(handler: MockWebhookHandler, events?: string[]): () => void {
    return this.addWebhookSubscription({ handler, events });
  }

  seed(seed: LeadDocketMockSeed = {}): void {
    for (const store of Object.keys(this.stores) as MockStoreName[]) {
      const values = seed[store];
      if (values) {
        this.stores[store] = values.map((value) => normalizeRecord(value, () => this.allocateId()));
        for (const record of this.stores[store]) {
          this.captureRecordCustomFields(store, record);
        }
      }
    }

    if (seed.customFieldValues) {
      this.customFieldValues = mergeCustomFieldValues(
        this.customFieldValues,
        seed.customFieldValues,
      );
    }

    if (seed.lookups) {
      this.lookups = structuredCloneCompat(seed.lookups);
    }

    if (seed.settings) {
      this.settings = structuredCloneCompat(seed.settings);
    }
  }

  reset(seed?: LeadDocketMockSeed): void {
    this.nextId = 1000;
    this.requests.length = 0;
    this.webhookEvents.length = 0;
    this.webhookDeliveries.length = 0;
    const defaults = createDefaultStores();
    for (const store of Object.keys(defaults) as MockStoreName[]) {
      this.stores[store] = defaults[store];
    }
    this.customFieldValues = createEmptyCustomFieldValues();
    this.lookups = defaultLookups();
    this.settings = defaultSettings();
    this.seed(seed);
  }

  getStore<T extends Record<string, unknown> = Record<string, unknown>>(store: MockStoreName): T[] {
    return this.withCustomFieldsForStore(store, this.stores[store]) as T[];
  }

  setStore(store: MockStoreName, records: Array<Record<string, unknown>>): void {
    this.stores[store] = records.map((record) => normalizeRecord(record, () => this.allocateId()));
  }

  setCustomFieldValues(
    resource: MockCustomFieldResource,
    recordId: string | number,
    values: MockCustomFieldValueMap,
  ): void {
    this.customFieldValues[resource][String(recordId)] = structuredCloneCompat(values);
  }

  getCustomFieldValues(
    resource: MockCustomFieldResource,
    recordId: string | number,
  ): MockCustomFieldValueMap {
    return structuredCloneCompat(this.customFieldValues[resource][String(recordId)] ?? {});
  }

  async emitWebhook(
    event: Omit<MockWebhookEvent, 'id' | 'occurredAt' | 'apiCallDriven'> &
      Partial<Pick<MockWebhookEvent, 'id' | 'occurredAt' | 'apiCallDriven'>>,
  ): Promise<MockWebhookEvent> {
    const webhookEvent: MockWebhookEvent = {
      ...event,
      id: event.id ?? `wh_${this.allocateId()}`,
      apiCallDriven: event.apiCallDriven ?? false,
      occurredAt: event.occurredAt ?? new Date().toISOString(),
    };

    const historyEvent = this.captureHistoryBodies
      ? webhookEvent
      : { ...webhookEvent, requestBody: undefined, data: undefined };
    pushBounded(this.webhookEvents, structuredCloneCompat(historyEvent), this.historyLimit);
    await this.deliverWebhook(webhookEvent);
    return webhookEvent;
  }

  private createIntegrationForms(
    integrations: MockOpportunityIntegration[],
  ): OpportunityIntegrationForms {
    return createOpportunityIntegrationForms({
      integrations,
      recordRequest: (request) => {
        pushBounded(
          this.requests,
          {
            id: `req_${this.allocateId()}`,
            at: new Date().toISOString(),
            ...request,
            body: this.captureHistoryBodies ? request.body : undefined,
          },
          this.historyLimit,
        );
      },
      submit: async ({ integration, opportunity, customFields, request }) => {
        const id = this.allocateId();
        const createdDate = new Date().toISOString();
        const firstName = typeof opportunity.FirstName === 'string' ? opportunity.FirstName : '';
        const lastName = typeof opportunity.LastName === 'string' ? opportunity.LastName : '';
        const created = {
          ...opportunity,
          Id: id,
          id,
          opportunityId: id,
          OpportunityName: `${firstName} ${lastName}`.trim() || `Opportunity ${id}`,
          name: `${firstName} ${lastName}`.trim() || `Opportunity ${id}`,
          Status: 'Open',
          status: 'Open',
          CreatedDate: createdDate,
          createdDate,
          Processed: false,
          processed: false,
          IsBeingEdited: false,
          isBeingEdited: false,
          OpportunityTypeId: opportunity.OpportunityTypeId ?? 'WebForm',
          IntegrationId: String(integration.id),
          CustomFields: customFields,
        };
        this.stores.opportunities.push(created);
        this.captureRecordCustomFields('opportunities', created);
        const hydrated = this.withCustomFields('opportunities', created);
        const projected = projectWebhook('opportunity-created', {
          opportunity: hydrated,
          observability: {
            apiCallDriven: false,
            operationId: request.operationId,
            method: request.method,
            path: request.path,
          },
        });
        await this.emitWebhook({
          event: 'opportunity.created',
          entity: 'opportunity',
          action: 'created',
          apiCallDriven: false,
          operationId: request.operationId,
          method: request.method,
          path: request.path,
          pathParams: request.pathParams,
          query: request.query,
          requestBody: request.body,
          data: hydrated,
          payload: projected.payload,
        });
        return hydrated;
      },
    });
  }

  private async handleFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (this.latencyMs > 0) {
      await delay(this.latencyMs);
    }

    let normalized: NormalizedRequest;
    try {
      normalized = await normalizeRequest(input, init, this.baseUrl, this.maxRequestBodyBytes);
    } catch (error) {
      return jsonResponse(
        { message: error instanceof Error ? error.message : 'Invalid request.' },
        400,
      );
    }
    const integrationResponse = await this.integrationForms.handle(normalized);
    if (integrationResponse) {
      return integrationResponse;
    }

    let match: RouteMatch | undefined;
    try {
      match = matchRoute(normalized.method, normalized.path);
    } catch {
      return jsonResponse({ message: 'Request path contains invalid encoding.' }, 400);
    }
    if (!match) {
      return jsonResponse(
        {
          message: `No Lead Docket mock route found for ${normalized.method} ${normalized.path}`,
          knownRoutes: this.routes.map((route) => `${route.method} ${route.path}`),
        },
        404,
      );
    }

    const invalidPathParameter = findInvalidIntegerPathParameter(match.pathParams);
    if (invalidPathParameter) {
      return jsonResponse(
        {
          message: `Invalid path parameter "${invalidPathParameter}": expected a 32-bit integer.`,
        },
        400,
      );
    }

    const requestBodyError = validateTopLevelRequestBody(
      match.route.requestSchema,
      normalized.body,
    );
    if (requestBodyError) {
      return jsonResponse({ message: requestBodyError }, 400);
    }

    pushBounded(
      this.requests,
      {
        id: `req_${this.allocateId()}`,
        method: normalized.method,
        url: normalized.url.toString(),
        path: normalized.path,
        query: normalized.query,
        pathParams: match.pathParams,
        operationId: match.route.operationId,
        body: this.captureHistoryBodies ? normalized.body : undefined,
        at: new Date().toISOString(),
      },
      this.historyLimit,
    );

    try {
      const ctx: RequestHandlerContext = { ...normalized, ...match };
      const data = await this.handleRequest(ctx);
      if (data instanceof Response) return data;
      await this.maybeEmitApiWebhook(ctx, data);
      return jsonResponse(data, match.route.status || 200);
    } catch (error) {
      return jsonResponse(
        {
          message: error instanceof Error ? error.message : 'Mock API error',
        },
        error instanceof MockApiError ? error.status : 500,
      );
    }
  }

  private async handleRequest(ctx: RequestHandlerContext): Promise<unknown> {
    const mediaResponse = this.handleMediaRoute(ctx);
    if (mediaResponse) return mediaResponse;

    const dispatched = dispatchMockOperation(
      {
        operationId: ctx.route.operationId,
        routePath: ctx.route.path,
        pathParams: ctx.pathParams,
        query: ctx.query,
        body: ctx.body,
      },
      {
        getStore: (store) => this.stores[store],
        allocateId: () => this.allocateId(),
        now: () => new Date().toISOString(),
        fail: (status, message) => {
          throw new MockApiError(status, message);
        },
      },
    );
    if (dispatched.handled) {
      return this.hydrateOperationResult(ctx, dispatched.data);
    }

    const operation = ctx.route.operationId.toLowerCase();
    const path = ctx.route.path.toLowerCase();
    const tag = ctx.route.tags[0]?.toLowerCase() ?? '';

    if (path.includes('/api/settings')) {
      return this.settings;
    }

    if (path.includes('/api/lookups')) {
      if (path.includes('gettypes')) {
        return Object.keys(this.lookups).filter((type) => type !== 'ReferralPracticeAreas');
      }
      return lookupByType(this.lookups, ctx.query.type);
    }

    if (path.includes('/api/customfields')) {
      return this.stores.customFields;
    }

    if (path.includes('/api/contactcustomfields')) {
      return this.stores.contactCustomFields;
    }

    if (operation.includes('updatecustomfields') && path.includes('/api/contacts')) {
      return this.handleCustomFieldsUpdate(ctx, 'contacts');
    }

    if (operation.includes('updatecustomfields') && path.includes('/api/leads')) {
      return this.handleCustomFieldsUpdate(ctx, 'leads');
    }

    if (operation.includes('updatecustomfield') && path.includes('/api/leads')) {
      return this.handleSingleCustomFieldUpdate(ctx, 'leads');
    }

    if (operation.includes('getcustomfield') && path.includes('/api/leads')) {
      return this.getCustomFieldValue('leads', ctx.query.leadId, ctx.query.id);
    }

    if (path.includes('/api/users')) {
      return this.handleCollection(ctx, 'users');
    }

    if (path.includes('/api/contacts')) {
      return this.handleCollection(ctx, 'contacts');
    }

    if (path.includes('/api/leadsources')) {
      return this.stores.leadSources;
    }

    if (path.includes('/api/leadroles')) {
      return this.handleCollection(ctx, 'leadRoles');
    }

    if (operation.startsWith('leadforms_')) {
      return this.handleLeadFormRoutes(ctx);
    }

    if (path.includes('/api/leads')) {
      return this.handleLeadRoutes(ctx);
    }

    if (path.includes('/api/opportunities')) {
      return this.handleCollection(ctx, 'opportunities');
    }

    if (path.includes('/api/tasks')) {
      return this.handleCollection(ctx, 'tasks');
    }

    if (operation.includes('referralgroups_getlist')) {
      return this.stores.referralGroups;
    }

    if (operation.includes('referrals_practiceareas')) {
      return lookupByType(this.lookups, 'ReferralPracticeAreas');
    }

    if (path.includes('/api/referrals')) {
      return this.handleCollection(ctx, 'referrals');
    }

    if (path.includes('/api/settlements')) {
      return this.handleCollection(ctx, 'settlements');
    }

    if (path.includes('/api/expenses')) {
      return this.handleCollection(ctx, 'expenses');
    }

    if (path.includes('/substatus') || tag === 'substatuses') {
      return this.handleSubstatusRoutes(ctx);
    }

    if (path.includes('/api/statuses') || tag === 'statuses') {
      return this.handleStatusRoutes(ctx);
    }

    if (path.includes('/api/messages')) {
      return this.handleCollection(ctx, 'messages');
    }

    if (path.includes('/api/externalcalls')) {
      return this.handleCollection(ctx, 'externalCalls');
    }

    if (
      operation.includes('download') ||
      operation.includes('recording') ||
      operation.includes('transcription')
    ) {
      return sampleFromSchema(ctx.route.responseSchema);
    }

    return sampleFromSchema(ctx.route.responseSchema);
  }

  private handleMediaRoute(ctx: RequestHandlerContext): Response | undefined {
    if (ctx.route.operationId === 'external_calls_getRecording') {
      return new Response(new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00]), {
        headers: { 'content-type': 'audio/mp3' },
      });
    }
    if (ctx.route.operationId === 'external_calls_getTranscription') {
      return new Response('Fictional call transcription generated by the Lead Docket mock.', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    if (ctx.route.operationId === 'DownloadFile') {
      return new Response(new TextEncoder().encode('Lead Docket mock file contents.\n'), {
        headers: {
          'content-type': 'application/octet-stream',
          'content-disposition': 'attachment; filename="mock-file.txt"',
        },
      });
    }
    return undefined;
  }

  private hydrateOperationResult(ctx: RequestHandlerContext, data: unknown): unknown {
    const path = ctx.route.path.toLowerCase();
    const resource: MockCustomFieldResource | undefined = path.includes('/api/contacts')
      ? 'contacts'
      : path.includes('/api/opportunities')
        ? 'opportunities'
        : path.includes('/api/leads') && !path.includes('/forms')
          ? 'leads'
          : undefined;
    if (!resource) return data;

    const hydrate = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(hydrate);
      if (!value || typeof value !== 'object') return value;
      const record = value as Record<string, unknown>;
      if (this.stores[resource].includes(record)) return this.withCustomFields(resource, record);
      if (Array.isArray(record.Records)) return { ...record, Records: record.Records.map(hydrate) };
      if (record.Data && typeof record.Data === 'object')
        return { ...record, Data: hydrate(record.Data) };
      return value;
    };
    return hydrate(data);
  }

  private handleLeadFormRoutes(ctx: RequestHandlerContext): unknown {
    if (ctx.method === 'GET') {
      const id = ctx.pathParams.id;
      if (id) {
        const form = findByStoreId(this.stores.leadForms, 'leadForms', id);
        return { IsValid: Boolean(form), Data: form };
      }
      return this.stores.leadForms.map((form) => ({ IsValid: true, Data: form }));
    }
    const result = this.handleCollection(ctx, 'leadForms');
    return { IsValid: true, Data: result };
  }

  private handleStatusRoutes(ctx: RequestHandlerContext): unknown {
    if (ctx.method === 'GET') {
      const id = ctx.pathParams.id;
      if (id) {
        const status = findByStoreId(this.stores.statuses, 'statuses', id);
        return { IsValid: Boolean(status), Data: status };
      }
      return {
        IsValid: true,
        Data: this.stores.statuses.map((status) => ({ IsValid: true, Data: status })),
      };
    }
    const result = this.handleCollection(ctx, 'statuses');
    return { IsValid: true, Data: result };
  }

  private handleSubstatusRoutes(ctx: RequestHandlerContext): unknown {
    const collection = this.stores.substatuses;
    const body = asRecord(ctx.body);
    const statusId = ctx.pathParams.statusId;
    const subStatusId = ctx.pathParams.subStatusId;
    if (ctx.method === 'POST') {
      const created = normalizeRecord({ ...body, StatusId: numberOrString(statusId) }, () =>
        this.allocateId(),
      );
      collection.push(created);
      return { IsValid: true, Data: created };
    }
    if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
      const updated = upsertById(collection, 'substatuses', subStatusId, body);
      return { IsValid: true, Data: updated };
    }
    if (ctx.method === 'DELETE') {
      const index = collection.findIndex((record) =>
        storeIdMatches('substatuses', record, subStatusId ?? ''),
      );
      if (index >= 0) collection.splice(index, 1);
      return { IsValid: true, Data: { success: true } };
    }
    return { IsValid: true, Data: collection };
  }

  private handleLeadRoutes(ctx: RequestHandlerContext): unknown {
    const path = ctx.route.path.toLowerCase();

    if (path.includes('/collectionsections')) {
      return this.handleCollection(ctx, 'leads');
    }

    if (path.includes('/settlements')) {
      return this.handleCollection(ctx, 'settlements');
    }

    if (path.includes('/expenses')) {
      return this.handleCollection(ctx, 'expenses');
    }

    if (path.includes('/tasks')) {
      return this.handleCollection(ctx, 'tasks');
    }

    return this.handleCollection(ctx, 'leads');
  }

  private handleCollection(ctx: RequestHandlerContext, store: MockStoreName): unknown {
    const collection = this.stores[store];
    const body = asRecord(ctx.body);
    const id = firstDefinedPathParam(ctx.pathParams, [
      'id',
      'leadId',
      'contactId',
      'opportunityId',
      'taskId',
      'referralId',
      'statusId',
      'subStatusId',
      'settlementId',
      'expenseId',
      'formId',
      'externalCallId',
    ]);
    const operation = ctx.route.operationId.toLowerCase();

    if (ctx.method === 'GET') {
      if (
        operation.includes('list') ||
        operation.includes('search') ||
        operation.includes('since') ||
        operation.includes('all') ||
        operation.includes('pending') ||
        operation.includes('unprocessed') ||
        !id
      ) {
        return maybePagedResponse(
          ctx.route.responseSchema,
          this.withCustomFieldsForStore(store, collection),
        );
      }

      const record = findByStoreId(collection, store, id);
      if (!record) {
        throw new MockApiError(404, `${STORE_TO_ENTITY[store]} ${id} was not found.`);
      }
      return this.withCustomFieldsForStore(store, [record])[0];
    }

    if (ctx.method === 'POST') {
      if (operation.includes('appendnote') || ctx.route.path.toLowerCase().includes('/notes')) {
        return createChildRecord(body, this.allocateId(), {
          leadId: ctx.pathParams.leadId ?? ctx.pathParams.id,
        });
      }

      const created = normalizeRecord(
        body,
        () => this.allocateId(),
        sampleRecordForStore(store, this.allocateId()),
      );
      collection.push(created);
      this.captureRecordCustomFields(store, created);
      return responseForMutation(
        ctx.route.responseSchema,
        this.withCustomFieldsForStore(store, [created])[0],
      );
    }

    if (ctx.method === 'PUT' || ctx.method === 'PATCH') {
      if (operation.includes('markcomplete')) {
        const task = upsertById(collection, store, id, {
          ...body,
          id: numberOrString(id),
          completed: true,
          completedDate: new Date().toISOString(),
        });
        return responseForMutation(ctx.route.responseSchema, task);
      }

      if (operation.includes('lock') || operation.includes('unlock')) {
        const locked = operation.includes('lock') && !operation.includes('unlock');
        const record = upsertById(collection, store, id, {
          ...body,
          id: numberOrString(id),
          locked,
        });
        return responseForMutation(ctx.route.responseSchema, record);
      }

      const updated = upsertById(collection, store, id, { ...body, id: numberOrString(id) });
      this.captureRecordCustomFields(store, updated);
      return responseForMutation(
        ctx.route.responseSchema,
        this.withCustomFieldsForStore(store, [updated])[0],
      );
    }

    if (ctx.method === 'DELETE') {
      if (id) {
        const index = collection.findIndex((record) => storeIdMatches(store, record, id));
        if (index >= 0) {
          collection.splice(index, 1);
        }
      }
      return responseForMutation(ctx.route.responseSchema, { success: true });
    }

    return sampleFromSchema(ctx.route.responseSchema);
  }

  private withCustomFieldsForStore(
    store: MockStoreName,
    records: Array<Record<string, unknown>>,
  ): Array<Record<string, unknown>> {
    const resource = customFieldResourceForStore(store);
    if (!resource) {
      return structuredCloneCompat(records);
    }

    return records.map((record) => this.withCustomFields(resource, record));
  }

  private withCustomFields(
    resource: MockCustomFieldResource,
    record: Record<string, unknown>,
  ): Record<string, unknown> {
    const cloned = structuredCloneCompat(record);
    const recordId = getRecordIdentifier(cloned);
    const explicitValues =
      recordId === undefined ? {} : (this.customFieldValues[resource][String(recordId)] ?? {});
    const existingValues = customFieldArrayToValueMap(cloned.CustomFields ?? cloned.customFields);
    const values = { ...existingValues, ...explicitValues };
    const definitions = this.customFieldDefinitionsForResource(resource);
    const customFields = definitions.map((definition) =>
      customFieldValueForDefinition(definition, values),
    );
    const unknownValues = Object.entries(values)
      .filter(
        ([key]) =>
          !definitions.some((definition) => customFieldDefinitionMatchesKey(definition, key)),
      )
      .map(([key, value]) => ({
        CustomFieldId: numericIdOrUndefined(key),
        Name: key,
        Value: stringifyCustomFieldValue(value),
      }));

    cloned.CustomFields = [...customFields, ...unknownValues];
    return cloned;
  }

  private captureRecordCustomFields(store: MockStoreName, record: Record<string, unknown>): void {
    const resource = customFieldResourceForStore(store);
    const recordId = getRecordIdentifier(record);
    if (!resource || recordId === undefined) {
      return;
    }

    const values = customFieldArrayToValueMap(record.CustomFields ?? record.customFields);
    if (Object.keys(values).length > 0) {
      this.customFieldValues[resource][String(recordId)] = {
        ...this.customFieldValues[resource][String(recordId)],
        ...values,
      };
    }
  }

  private customFieldDefinitionsForResource(
    resource: MockCustomFieldResource,
  ): MockCustomFieldDefinition[] {
    if (resource === 'contacts') {
      return this.stores.contactCustomFields as MockCustomFieldDefinition[];
    }

    const definitions = this.stores.customFields as MockCustomFieldDefinition[];
    if (resource === 'opportunities') {
      return definitions.filter((definition) => normalizeLocation(definition) === 'opportunity');
    }

    return definitions.filter((definition) => normalizeLocation(definition) !== 'opportunity');
  }

  private handleCustomFieldsUpdate(
    ctx: RequestHandlerContext,
    resource: MockCustomFieldResource,
  ): unknown {
    const body = asRecord(ctx.body);
    const recordId =
      body.Id ??
      body.id ??
      body.LeadId ??
      body.leadId ??
      body.ContactId ??
      body.contactId ??
      body.Code ??
      body.code;
    if (recordId === undefined) {
      return { success: false, message: 'Mock custom field update requires Id or Code.' };
    }

    const recordKey = stringifyPropertyKey(recordId);
    if (recordKey === undefined) {
      return { success: false, message: 'Mock custom field update requires a valid Id or Code.' };
    }

    const values = customFieldArrayToValueMap(body.CustomFields ?? body.customFields);
    const store = storeForCustomFieldResource(resource);
    const record = findByStoreId(this.stores[store], store, recordKey);
    const valueKey = String(record ? (getRecordIdentifier(record) ?? recordKey) : recordKey);
    this.customFieldValues[resource][valueKey] = {
      ...this.customFieldValues[resource][valueKey],
      ...values,
    };

    if (record) {
      Object.assign(record, this.withCustomFields(resource, record));
    }

    return {
      success: true,
      CustomFields: this.withCustomFields(resource, { id: valueKey }).CustomFields,
    };
  }

  private handleSingleCustomFieldUpdate(
    ctx: RequestHandlerContext,
    resource: MockCustomFieldResource,
  ): unknown {
    const recordId = ctx.query.leadId;
    const fieldId = ctx.query.id;
    if (recordId === undefined || fieldId === undefined) {
      return {
        success: false,
        message: 'Mock custom field update requires leadId and id query parameters.',
      };
    }

    this.customFieldValues[resource][String(recordId)] = {
      ...this.customFieldValues[resource][String(recordId)],
      [fieldId]: ctx.query.value,
    };

    return { success: true, CustomFieldId: Number(fieldId), Value: ctx.query.value };
  }

  private getCustomFieldValue(
    resource: MockCustomFieldResource,
    recordId: string | undefined,
    fieldId: string | undefined,
  ): unknown {
    if (recordId === undefined || fieldId === undefined) {
      return undefined;
    }

    const values = this.customFieldValues[resource][String(recordId)] ?? {};
    const definition = this.customFieldDefinitionsForResource(resource).find((candidate) =>
      customFieldDefinitionMatchesKey(candidate, fieldId),
    );
    const value = getCustomFieldMapValue(values, definition, fieldId);

    return {
      CustomFieldId: Number(fieldId),
      Name: definition ? customFieldName(definition) : fieldId,
      Value: stringifyCustomFieldValue(value),
    };
  }

  private async maybeEmitApiWebhook(ctx: RequestHandlerContext, data: unknown): Promise<void> {
    if (ctx.method === 'GET') return;
    const kind = operationToWebhookKind({
      operationId: ctx.route.operationId,
      method: ctx.method,
      path: ctx.route.path,
    });
    if (!kind) return;

    const descriptor = internalWebhookDescriptor(kind);
    const projected = projectWebhook(kind, {
      record: webhookRecord(data),
      eventByUser: asRecord(ctx.body).EventByUser,
      observability: {
        apiCallDriven: true,
        operationId: ctx.route.operationId,
        method: ctx.method,
        path: ctx.path,
      },
    });

    await this.emitWebhook({
      event: descriptor.event,
      entity: descriptor.entity,
      action: descriptor.action,
      apiCallDriven: true,
      operationId: ctx.route.operationId,
      method: ctx.method,
      path: ctx.path,
      pathParams: ctx.pathParams,
      query: ctx.query,
      requestBody: ctx.body,
      data,
      payload: projected.payload,
    });
  }

  private async deliverWebhook(event: MockWebhookEvent): Promise<void> {
    if (!this.deliverWebhooks) {
      return;
    }

    const subscriptions = this.subscriptions.filter(
      (subscription) =>
        !subscription.events ||
        subscription.events.includes(event.event) ||
        subscription.events.includes(`${event.entity}.*`) ||
        subscription.events.includes('*'),
    );

    await Promise.all(
      subscriptions.flatMap((subscription) => {
        const deliveries: Array<Promise<void>> = [];
        if (subscription.handler) {
          deliveries.push(
            this.recordWebhookDelivery(event, 'handler', 'in-process handler', async () => {
              await subscription.handler?.(structuredCloneCompat(event));
            }),
          );
        }
        if (subscription.url) {
          deliveries.push(
            this.recordWebhookDelivery(event, 'http', subscription.url, async () => {
              return this.webhookFetch(subscription.url!, {
                method: 'POST',
                headers: {
                  ...JSON_HEADERS,
                  ...headersToObject(subscription.headers),
                },
                body: JSON.stringify(event.payload ?? event),
                redirect: 'error',
                signal: AbortSignal.timeout(this.webhookTimeoutMs),
              });
            }),
          );
        }
        return deliveries;
      }),
    );
  }

  private async recordWebhookDelivery(
    event: MockWebhookEvent,
    kind: MockWebhookDelivery['kind'],
    target: string,
    deliver: () => Promise<Response | void>,
  ): Promise<void> {
    const startedAt = Date.now();
    const attemptedAt = new Date(startedAt).toISOString();
    try {
      const response = await deliver();
      pushBounded(
        this.webhookDeliveries,
        {
          id: `delivery_${this.allocateId()}`,
          eventId: event.id,
          target,
          kind,
          attemptedAt,
          durationMs: Date.now() - startedAt,
          ok: response ? response.ok : true,
          status: response?.status,
        },
        this.historyLimit,
      );
    } catch (error) {
      pushBounded(
        this.webhookDeliveries,
        {
          id: `delivery_${this.allocateId()}`,
          eventId: event.id,
          target,
          kind,
          attemptedAt,
          durationMs: Date.now() - startedAt,
          ok: false,
          error: error instanceof Error ? error.message : 'Webhook delivery failed',
        },
        this.historyLimit,
      );
    }
  }

  private allocateId(): number {
    this.nextId += 1;
    return this.nextId;
  }
}

function normalizeBodyLimit(value: number): number {
  if (!Number.isInteger(value) || value <= 0 || value > 10_485_760) {
    throw new RangeError('maxRequestBodyBytes must be an integer between 1 and 10485760.');
  }
  return value;
}

function normalizeHistoryLimit(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new RangeError('historyLimit must be an integer between 0 and 10000.');
  }
  return value;
}

function pushBounded<T>(values: T[], value: T, limit: number): void {
  if (limit === 0) return;
  values.push(value);
  if (values.length > limit) values.splice(0, values.length - limit);
}

export function createLeadDocketMockApi(options?: LeadDocketMockApiOptions): LeadDocketMockApi {
  return new LeadDocketMockApi(options);
}

export function createLeadDocketMockFetch(options?: LeadDocketMockApiOptions): typeof fetch {
  return createLeadDocketMockApi(options).fetch;
}

export * from './webhook-payloads';
export type {
  MockOpportunityIntegration,
  MockOpportunityIntegrationField,
  MockOpportunityIntegrationFieldKey,
  MockOpportunityIntegrationFieldOption,
  MockOpportunityIntegrationSummary,
} from './integrations';
export { mockRouteDefinitions } from './routes.gen';

function createEmptyCustomFieldValues(): Record<
  MockCustomFieldResource,
  Record<string, MockCustomFieldValueMap>
> {
  return {
    contacts: {},
    leads: {},
    opportunities: {},
  };
}

function mergeCustomFieldValues(
  current: Record<MockCustomFieldResource, Record<string, MockCustomFieldValueMap>>,
  next: MockCustomFieldValues,
): Record<MockCustomFieldResource, Record<string, MockCustomFieldValueMap>> {
  const merged = structuredCloneCompat(current);
  for (const resource of Object.keys(next) as MockCustomFieldResource[]) {
    merged[resource] = {
      ...merged[resource],
      ...structuredCloneCompat(next[resource] ?? {}),
    };
  }
  return merged;
}

function customFieldResourceForStore(store: MockStoreName): MockCustomFieldResource | undefined {
  if (store === 'contacts' || store === 'leads' || store === 'opportunities') {
    return store;
  }
  return undefined;
}

function storeForCustomFieldResource(
  resource: MockCustomFieldResource,
): 'contacts' | 'leads' | 'opportunities' {
  return resource;
}

function getRecordIdentifier(record: Record<string, unknown>): string | number | undefined {
  const identifier =
    record.Id ??
    record.id ??
    record.ContactId ??
    record.contactId ??
    record.LeadId ??
    record.leadId ??
    record.OpportunityId ??
    record.opportunityId ??
    record.Code ??
    record.code;
  return typeof identifier === 'string' || typeof identifier === 'number' ? identifier : undefined;
}

function stringifyPropertyKey(value: unknown): string | undefined {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

function customFieldArrayToValueMap(value: unknown): MockCustomFieldValueMap {
  if (!Array.isArray(value)) {
    return {};
  }

  const values: MockCustomFieldValueMap = {};
  for (const item of value) {
    const field = asRecord(item);
    const fieldId = field.CustomFieldId ?? field.customFieldId ?? field.Id ?? field.id;
    const name = field.Name ?? field.name ?? field.FieldName ?? field.fieldName;
    const fieldValue =
      field.Value ?? field.value ?? field.CustomFieldValue ?? field.customFieldValue;

    const fieldIdKey = stringifyPropertyKey(fieldId);
    const nameKey = stringifyPropertyKey(name);
    if (fieldIdKey !== undefined) {
      values[fieldIdKey] = fieldValue;
    }
    if (nameKey !== undefined) {
      values[nameKey] = fieldValue;
    }
  }

  return values;
}

function customFieldValueForDefinition(
  definition: MockCustomFieldDefinition,
  values: MockCustomFieldValueMap,
): Record<string, unknown> {
  const id = customFieldId(definition);
  const name = customFieldName(definition);
  const value =
    getCustomFieldMapValue(values, definition, String(id ?? name)) ??
    definition.defaultValue ??
    definition.DefaultValues ??
    null;

  return {
    CustomFieldId: id,
    Name: name,
    Value: stringifyCustomFieldValue(value),
  };
}

function getCustomFieldMapValue(
  values: MockCustomFieldValueMap,
  definition: MockCustomFieldDefinition | undefined,
  fallbackKey: string,
): unknown {
  if (definition) {
    const keys = [
      customFieldId(definition),
      customFieldName(definition),
      definition.Code,
      definition.code,
    ]
      .filter((key): key is string | number => key !== undefined && key !== null)
      .map(String);

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        return values[key];
      }
    }
  }

  return values[fallbackKey];
}

function customFieldDefinitionMatchesKey(
  definition: MockCustomFieldDefinition,
  key: string,
): boolean {
  return [customFieldId(definition), customFieldName(definition), definition.Code, definition.code]
    .filter((candidate) => candidate !== undefined && candidate !== null)
    .map(String)
    .includes(key);
}

function customFieldId(definition: MockCustomFieldDefinition): number | undefined {
  const id = definition.Id ?? definition.id;
  return typeof id === 'number' ? id : undefined;
}

function customFieldName(definition: MockCustomFieldDefinition): string {
  const name = definition.FieldName ?? definition.name ?? definition.Name ?? definition.fieldName;
  return typeof name === 'string' ? name : `Custom Field ${customFieldId(definition) ?? ''}`.trim();
}

function normalizeLocation(definition: MockCustomFieldDefinition): string {
  const location = definition.Location ?? definition.location;
  return typeof location === 'string' ? location.toLowerCase() : '';
}

function stringifyCustomFieldValue(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value) ?? null;
    } catch {
      return null;
    }
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'symbol') {
    return value.description ?? null;
  }
  if (typeof value === 'function') {
    return value.name || null;
  }
  return null;
}

function numericIdOrUndefined(value: string): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function createDefaultStores(): Record<MockStoreName, Array<Record<string, unknown>>> {
  return {
    contacts: [sampleContact(1)],
    leads: [sampleLead(1)],
    opportunities: [sampleOpportunity(1)],
    tasks: [sampleTask(1)],
    users: [sampleUser(1)],
    statuses: [sampleStatus(1)],
    substatuses: [sampleSubstatus(1)],
    referrals: [sampleReferral(1)],
    referralGroups: [{ id: 1, name: 'Mock Referral Group' }],
    settlements: [sampleSettlement(1)],
    expenses: [sampleExpense(1)],
    leadForms: [{ id: 1, name: 'Mock Lead Form', active: true }],
    messages: [{ id: 1, leadId: 1, subject: 'Mock message', body: 'Mock message body' }],
    externalCalls: [{ id: 1, leadId: 1, phoneNumber: '5551234567', status: 'Completed' }],
    leadRoles: [{ id: 1, name: 'Attorney' }],
    leadSources: [{ id: 1, name: 'Website' }],
    customFields: [{ id: 1, name: 'Mock Lead Custom Field', location: 'Lead' }],
    contactCustomFields: [{ id: 1, name: 'Mock Contact Custom Field' }],
  };
}

function lookupByType(lookups: Record<string, unknown>, type: string | undefined): unknown {
  if (!type) return [];
  const key = Object.keys(lookups).find(
    (candidate) => candidate.toLowerCase() === type.toLowerCase(),
  );
  return key ? structuredCloneCompat(lookups[key]) : [];
}

function defaultLookups(): Record<string, unknown> {
  return {
    LeadSource: [{ Id: 1, Name: 'Example Website' }],
    CaseType: [{ Id: 1, Name: 'Personal Injury' }],
    MarketingSource: [{ Id: 1, Name: 'Example Website' }],
    Statuses: [sampleStatus(1)],
    Offices: [{ Id: 1, Name: 'Main Office' }],
    Forms: [{ Id: 1, Name: 'Mock Form' }],
    Tags: [{ Id: 1, Name: 'VIP' }],
    ReferralPracticeAreas: ['Personal Injury'],
  };
}

function defaultSettings(): Record<string, unknown> {
  return { Name: 'Mock server', IsEnabled: true };
}

function sampleRecordForStore(store: MockStoreName, id: number): Record<string, unknown> {
  switch (store) {
    case 'contacts':
      return sampleContact(id);
    case 'leads':
      return sampleLead(id);
    case 'opportunities':
      return sampleOpportunity(id);
    case 'tasks':
      return sampleTask(id);
    case 'users':
      return sampleUser(id);
    case 'statuses':
      return sampleStatus(id);
    case 'substatuses':
      return sampleSubstatus(id);
    case 'referrals':
      return sampleReferral(id);
    case 'settlements':
      return sampleSettlement(id);
    case 'expenses':
      return sampleExpense(id);
    default:
      return { id, name: `Mock ${STORE_TO_ENTITY[store]} ${id}` };
  }
}

function sampleContact(id: number): Record<string, unknown> {
  const createdDate = new Date(0).toISOString();
  return {
    Id: id,
    id,
    ContactId: id,
    contactId: id,
    FirstName: 'Mock',
    firstName: 'Mock',
    LastName: `Contact ${id}`,
    lastName: `Contact ${id}`,
    FullName: `Mock Contact ${id}`,
    name: `Mock Contact ${id}`,
    Email: `contact${id}@example.test`,
    email: `contact${id}@example.test`,
    MobilePhone: '+15550100001',
    phone: '+15550100001',
    Code: `CONTACT-${id}`,
    code: `CONTACT-${id}`,
    CreatedDate: createdDate,
    createdDate,
    LastUpdateDate: createdDate,
    lastUpdated: createdDate,
  };
}

function sampleLead(id: number): Record<string, unknown> {
  const createdDate = new Date(0).toISOString();
  return {
    Id: id,
    id,
    LeadId: id,
    leadId: id,
    ContactId: id,
    contactId: id,
    FirstName: 'Mock',
    firstName: 'Mock',
    LastName: `Lead ${id}`,
    lastName: `Lead ${id}`,
    name: `Mock Lead ${id}`,
    StatusId: 1,
    statusId: 1,
    Status: 'New',
    status: 'New',
    MarketingSource: 'Example Website',
    source: 'Example Website',
    Code: `LEAD-${id}`,
    code: `LEAD-${id}`,
    CreatedDate: createdDate,
    createdDate,
    LastUpdateDate: createdDate,
    lastUpdated: createdDate,
  };
}

function sampleOpportunity(id: number): Record<string, unknown> {
  const createdDate = new Date(0).toISOString();
  return {
    Id: id,
    id,
    OpportunityId: id,
    opportunityId: id,
    FirstName: 'Mock',
    firstName: 'Mock',
    LastName: `Opportunity ${id}`,
    lastName: `Opportunity ${id}`,
    OpportunityName: `Mock Opportunity ${id}`,
    name: `Mock Opportunity ${id}`,
    Status: 'Open',
    status: 'Open',
    Processed: false,
    CreatedDate: createdDate,
    createdDate,
  };
}

function sampleTask(id: number): Record<string, unknown> {
  const dueDate = new Date(0).toISOString();
  return {
    Id: id,
    id,
    TaskId: id,
    taskId: id,
    LeadId: 1,
    leadId: 1,
    Name: `Mock Task ${id}`,
    subject: `Mock Task ${id}`,
    DueDate: dueDate,
    dueDate,
    Completed: false,
    completed: false,
  };
}

function sampleUser(id: number): Record<string, unknown> {
  return {
    Id: id,
    id,
    UserId: id,
    userId: id,
    Name: `Mock User ${id}`,
    name: `Mock User ${id}`,
    Email: `user${id}@example.test`,
    email: `user${id}@example.test`,
    Active: true,
    active: true,
  };
}

function sampleStatus(id: number): Record<string, unknown> {
  const name = id === 1 ? 'New' : `Status ${id}`;
  return {
    Id: id,
    id,
    statusId: id,
    Status: name,
    StatusName: name,
    name,
    DisplayOrder: id,
    sortOrder: id,
    Substatuses: [sampleSubstatus(id)],
  };
}

function sampleSubstatus(id: number): Record<string, unknown> {
  return {
    Id: id,
    id,
    subStatusId: id,
    StatusId: 1,
    statusId: 1,
    SubStatusName: `Substatus ${id}`,
    name: `Substatus ${id}`,
    DisplayOrder: id,
    sortOrder: id,
  };
}

function sampleReferral(id: number): Record<string, unknown> {
  return {
    Id: id,
    id,
    ReferralId: id,
    referralId: id,
    Name: `Mock Referral ${id}`,
    name: `Mock Referral ${id}`,
    ExternalCode: `REF-${id}`,
    externalCode: `REF-${id}`,
  };
}

function sampleSettlement(id: number): Record<string, unknown> {
  return {
    Id: id,
    id,
    SettlementId: id,
    settlementId: id,
    LeadId: 1,
    leadId: 1,
    GrossAmount: 10_000,
    grossAmount: 10_000,
    FeeAmount: 3333.33,
    feeAmount: 3333.33,
  };
}

function sampleExpense(id: number): Record<string, unknown> {
  return {
    Id: id,
    id,
    ExpenseId: id,
    expenseId: id,
    LeadId: 1,
    leadId: 1,
    Amount: 100,
    amount: 100,
    Description: `Mock Expense ${id}`,
    description: `Mock Expense ${id}`,
  };
}

function routeSpecificity(path: string): number {
  const parameterCount = (path.match(/\{/g) ?? []).length;
  const literalLength = path.replace(/\{[^}]+\}/g, '').length;
  return literalLength * 10 - parameterCount;
}

function createPathMatcher(path: string): { regex: RegExp; names: string[] } {
  const names: string[] = [];
  let pattern = '';
  let cursor = 0;

  for (const match of path.matchAll(/\{([^}]+)\}/g)) {
    pattern += escapeRegExp(path.slice(cursor, match.index));
    names.push(match[1]);
    pattern += '([^/]+?)';
    cursor = match.index + match[0].length;
  }

  pattern += escapeRegExp(path.slice(cursor));

  return { regex: new RegExp(`^${pattern}/?$`, 'i'), names };
}

function matchRoute(method: string, path: string): RouteMatch | undefined {
  for (const { route, matcher } of ROUTE_MATCHERS) {
    if (route.method !== method) {
      continue;
    }

    const match = matcher.regex.exec(path);
    if (!match) {
      continue;
    }

    return {
      route,
      pathParams: Object.fromEntries(
        matcher.names.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? '')]),
      ),
    };
  }

  return undefined;
}

async function normalizeRequest(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  baseUrl: string,
  maxBodyBytes: number,
): Promise<NormalizedRequest> {
  const request =
    input instanceof Request
      ? new Request(input, init)
      : new Request(new URL(String(input), baseUrl), init);
  const url = new URL(request.url, baseUrl);
  const body = await parseRequestBody(request, maxBodyBytes);

  return {
    request,
    url,
    path: url.pathname,
    method: request.method.toUpperCase(),
    query: Object.fromEntries(url.searchParams.entries()),
    body,
  };
}

async function parseRequestBody(request: Request, maxBodyBytes: number): Promise<unknown> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }

  const text = await request.clone().text();
  if (new TextEncoder().encode(text).byteLength > maxBodyBytes) {
    throw new RangeError(`Request body exceeds the ${maxBodyBytes} byte limit.`);
  }
  if (!text) {
    return undefined;
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('json')) {
    try {
      return JSON.parse(text);
    } catch {
      throw new TypeError('Request body must be valid JSON.');
    }
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function jsonResponse(data: unknown, status: number): Response {
  if (data === undefined || status === 204 || status === 205) {
    return new Response(null, { status });
  }

  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function normalizeRecord(
  record: Record<string, unknown>,
  allocateId: () => number,
  defaults: Record<string, unknown> = {},
): Record<string, unknown> {
  const normalized = { ...defaults, ...structuredCloneCompat(record) };
  const id = normalized.Id ?? normalized.id ?? allocateId();
  normalized.Id = id;
  normalized.id = id;
  return normalized;
}

function createChildRecord(
  body: Record<string, unknown>,
  id: number,
  parent: Record<string, unknown>,
): Record<string, unknown> {
  return {
    id,
    ...parent,
    ...body,
    createdDate: new Date().toISOString(),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstDefinedPathParam(
  pathParams: Record<string, string>,
  names: string[],
): string | undefined {
  for (const name of names) {
    if (pathParams[name] !== undefined) {
      return pathParams[name];
    }
  }

  return Object.values(pathParams)[0];
}

function validateTopLevelRequestBody(schema: unknown, body: unknown): string | undefined {
  if (!schema) return undefined;
  if (body === undefined) return 'Request body is required.';
  const resolved = resolveRequestSchema(schema);
  if (!resolved) return undefined;
  if (resolved.type === 'array' && !Array.isArray(body)) return 'Request body must be an array.';
  if (
    (resolved.type === 'object' || resolved.properties) &&
    (!body || typeof body !== 'object' || Array.isArray(body))
  ) {
    return 'Request body must be an object.';
  }
  if (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    Array.isArray(resolved.required)
  ) {
    const record = body as Record<string, unknown>;
    const missing = resolved.required.filter(
      (property): property is string =>
        typeof property === 'string' &&
        (record[property] === undefined || record[property] === null || record[property] === ''),
    );
    if (missing.length > 0)
      return `Request body is missing required fields: ${missing.join(', ')}.`;
  }
  return undefined;
}

function resolveRequestSchema(schema: unknown): Record<string, unknown> | undefined {
  if (!schema || typeof schema !== 'object') return undefined;
  const record = schema as Record<string, unknown>;
  if (typeof record.$ref === 'string') {
    const name = record.$ref.split('/').pop();
    const resolved = name
      ? mockComponentSchemas[name as keyof typeof mockComponentSchemas]
      : undefined;
    return resolved && typeof resolved === 'object'
      ? (resolved as Record<string, unknown>)
      : undefined;
  }
  return record;
}

function findInvalidIntegerPathParameter(pathParams: Record<string, string>): string | undefined {
  for (const [name, value] of Object.entries(pathParams)) {
    if (!name.toLowerCase().endsWith('id')) continue;
    if (!/^-?\d+$/.test(value)) return name;
    const numeric = Number(value);
    if (!Number.isInteger(numeric) || numeric < -2_147_483_648 || numeric > 2_147_483_647) {
      return name;
    }
  }
  return undefined;
}

function findByStoreId(
  collection: Array<Record<string, unknown>>,
  store: MockStoreName,
  id: string,
): Record<string, unknown> | undefined {
  return collection.find((record) => storeIdMatches(store, record, id));
}

function upsertById(
  collection: Array<Record<string, unknown>>,
  store: MockStoreName,
  id: string | undefined,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  if (id) {
    const existing = collection.find((record) => storeIdMatches(store, record, id));
    if (existing) {
      Object.assign(existing, patch, { lastUpdated: new Date().toISOString() });
      return existing;
    }
  }

  const created = normalizeRecord(patch, () => Number(id) || Date.now());
  collection.push(created);
  return created;
}

function storeIdMatches(
  store: MockStoreName,
  record: Record<string, unknown>,
  id: string,
): boolean {
  const identityKeys: Record<MockStoreName, string[]> = {
    contacts: ['Id', 'id', 'ContactId', 'contactId'],
    leads: ['Id', 'id', 'LeadId', 'leadId'],
    opportunities: ['Id', 'id', 'OpportunityId', 'opportunityId'],
    tasks: ['Id', 'id', 'TaskId', 'taskId'],
    users: ['Id', 'id', 'UserId', 'userId'],
    statuses: ['Id', 'id', 'StatusId', 'statusId'],
    substatuses: ['Id', 'id', 'SubStatusId', 'subStatusId', 'substatusId'],
    referrals: ['Id', 'id', 'ReferralId', 'referralId'],
    referralGroups: ['Id', 'id', 'ReferralGroupId', 'referralGroupId'],
    settlements: ['Id', 'id', 'SettlementId', 'settlementId'],
    expenses: ['Id', 'id', 'ExpenseId', 'expenseId'],
    leadForms: ['LeadFormId', 'leadFormId', 'Id', 'id'],
    messages: ['Id', 'id', 'MessageId', 'messageId'],
    externalCalls: ['Id', 'id', 'ExternalCallId', 'externalCallId'],
    leadRoles: ['LeadRoleId', 'leadRoleId', 'Id', 'id'],
    leadSources: ['LeadSourceId', 'leadSourceId', 'Id', 'id'],
    customFields: ['Id', 'id'],
    contactCustomFields: ['Id', 'id'],
  };
  return identityKeys[store].some((key) => String(record[key]) === id);
}

function numberOrString(value: string | undefined): string | number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isSafeInteger(numeric) ? numeric : value;
}

function maybePagedResponse(schema: unknown, collection: Array<Record<string, unknown>>): unknown {
  const schemaName = refName(schema);
  if (schemaName?.toLowerCase().includes('pagedresponse')) {
    return {
      data: collection,
      records: collection,
      items: collection,
      totalCount: collection.length,
      page: 1,
      pageSize: collection.length,
    };
  }

  if (
    schemaName &&
    !schemaName.toLowerCase().includes('list') &&
    !schemaName.toLowerCase().includes('array')
  ) {
    const sample = sampleFromSchema(schema);
    if (!Array.isArray(sample) && sample && typeof sample === 'object') {
      return sample;
    }
  }

  return collection;
}

function responseForMutation(schema: unknown, record: Record<string, unknown>): unknown {
  const sample = sampleFromSchema(schema);

  if (Array.isArray(sample)) {
    return [record];
  }

  if (sample && typeof sample === 'object') {
    return { ...(sample as Record<string, unknown>), ...record };
  }

  return record;
}

function sampleFromSchema(schema: unknown, seen = new Set<string>()): unknown {
  const resolved = resolveSchema(schema);

  if (!resolved) {
    return { success: true };
  }

  if ('$ref' in resolved && typeof resolved.$ref === 'string') {
    const name = resolved.$ref.split('/').pop() ?? '';
    if (seen.has(name)) {
      return {};
    }
    seen.add(name);
    return sampleFromSchema(mockComponentSchemas[name as keyof typeof mockComponentSchemas], seen);
  }

  if ('nullable' in resolved && resolved.nullable === true) {
    return null;
  }

  if ('enum' in resolved && Array.isArray(resolved.enum)) {
    return resolved.enum[0];
  }

  if ('oneOf' in resolved && Array.isArray(resolved.oneOf)) {
    return sampleFromSchema(resolved.oneOf[0], seen);
  }

  if ('anyOf' in resolved && Array.isArray(resolved.anyOf)) {
    return sampleFromSchema(resolved.anyOf[0], seen);
  }

  if ('allOf' in resolved && Array.isArray(resolved.allOf)) {
    return Object.assign(
      {},
      ...resolved.allOf
        .map((item) => sampleFromSchema(item, seen))
        .filter((item) => item && typeof item === 'object'),
    );
  }

  const type = 'type' in resolved ? resolved.type : undefined;

  if (type === 'array') {
    return [sampleFromSchema('items' in resolved ? resolved.items : undefined, seen)];
  }

  if (type === 'object' || 'properties' in resolved) {
    const properties = (
      'properties' in resolved && resolved.properties && typeof resolved.properties === 'object'
        ? resolved.properties
        : {}
    ) as Record<string, unknown>;
    const object: Record<string, unknown> = {};
    for (const [key, propertySchema] of Object.entries(properties)) {
      object[key] = sampleValueForProperty(key, propertySchema, seen);
    }
    return object;
  }

  if (type === 'integer' || type === 'number') {
    return 1;
  }

  if (type === 'boolean') {
    return true;
  }

  if (type === 'string') {
    return 'mock';
  }

  return { success: true };
}

function sampleValueForProperty(key: string, schema: unknown, seen: Set<string>): unknown {
  const lowerKey = key.toLowerCase();
  const resolved = resolveSchema(schema);

  if (lowerKey === 'id' || lowerKey.endsWith('id')) {
    return 1;
  }

  if (lowerKey.includes('date') || lowerKey.includes('time')) {
    return new Date(0).toISOString();
  }

  if (lowerKey.includes('email')) {
    return 'mock@example.com';
  }

  if (lowerKey.includes('phone')) {
    return '5551234567';
  }

  if (lowerKey.includes('amount') || lowerKey.includes('total') || lowerKey.includes('count')) {
    return 1;
  }

  if (lowerKey.includes('url')) {
    return 'https://mock.leaddocket.local/mock';
  }

  if (lowerKey.includes('name')) {
    return 'Mock Name';
  }

  if (resolved && 'format' in resolved && resolved.format === 'date-time') {
    return new Date(0).toISOString();
  }

  return sampleFromSchema(schema, seen);
}

function resolveSchema(schema: unknown): Record<string, unknown> | undefined {
  return schema && typeof schema === 'object' ? (schema as Record<string, unknown>) : undefined;
}

function refName(schema: unknown): string | undefined {
  const resolved = resolveSchema(schema);
  if (resolved?.$ref && typeof resolved.$ref === 'string') {
    return resolved.$ref.split('/').pop();
  }
  return undefined;
}

function webhookRecord(data: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(data)) {
    return data.find((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === 'object' && !Array.isArray(item)),
    );
  }
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  if (record.Data && typeof record.Data === 'object' && !Array.isArray(record.Data)) {
    return record.Data as Record<string, unknown>;
  }
  return record;
}

function internalWebhookDescriptor(kind: WebhookKind): {
  event: string;
  entity: string;
  action: MockWebhookAction;
} {
  const descriptors: Record<
    WebhookKind,
    { event: string; entity: string; action: MockWebhookAction }
  > = {
    'contact-added': { event: 'contact.created', entity: 'contact', action: 'created' },
    'contact-edited': { event: 'contact.updated', entity: 'contact', action: 'updated' },
    'data-sync-completed': { event: 'dataSync.completed', entity: 'dataSync', action: 'completed' },
    'email-received': { event: 'email.received', entity: 'email', action: 'triggered' },
    'file-uploaded': { event: 'file.uploaded', entity: 'file', action: 'created' },
    'lead-created': { event: 'lead.created', entity: 'lead', action: 'created' },
    'lead-edited': { event: 'lead.updated', entity: 'lead', action: 'updated' },
    'lead-sent-to-external-system': {
      event: 'lead.processed',
      entity: 'lead',
      action: 'processed',
    },
    'lead-status-changed': { event: 'lead.status_changed', entity: 'lead', action: 'changed' },
    'note-added': { event: 'note.created', entity: 'note', action: 'created' },
    'opportunity-converted-to-lead': {
      event: 'opportunity.converted',
      entity: 'opportunity',
      action: 'changed',
    },
    'opportunity-created': {
      event: 'opportunity.created',
      entity: 'opportunity',
      action: 'created',
    },
    'opportunity-disregarded': {
      event: 'opportunity.disregarded',
      entity: 'opportunity',
      action: 'disregarded',
    },
    'tag-added-to-contact': { event: 'contact.tag_added', entity: 'contact', action: 'updated' },
    'text-received': { event: 'text.received', entity: 'text', action: 'triggered' },
  };
  return descriptors[kind];
}

function headersToObject(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return headers as Record<string, string>;
}

function structuredCloneCompat<T>(value: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
