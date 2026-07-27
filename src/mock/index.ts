import { mockComponentSchemas } from './schemas.gen';
import { mockRouteDefinitions, type MockRouteDefinition } from './routes.gen';

export type MockHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
  occurredAt: string;
};

export type MockWebhookHandler = (event: MockWebhookEvent) => void | Promise<void>;

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

export type MockCustomFieldValues = Partial<Record<MockCustomFieldResource, Record<string, MockCustomFieldValueMap>>>;

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
const ROUTE_MATCHERS = ALL_ROUTES.map((route) => ({ route, matcher: createPathMatcher(route.path) })).sort(
  (a, b) => routeSpecificity(b.route.path) - routeSpecificity(a.route.path),
);

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
  private readonly subscriptions: MockWebhookSubscription[] = [];
  private readonly deliverWebhooks: boolean;
  private readonly latencyMs: number;
  private readonly stores: Record<MockStoreName, Array<Record<string, unknown>>>;
  private customFieldValues: Record<MockCustomFieldResource, Record<string, MockCustomFieldValueMap>>;
  private lookups: Record<string, unknown>;
  private settings: Record<string, unknown>;

  constructor(options: LeadDocketMockApiOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.deliverWebhooks = options.deliverWebhooks ?? true;
    this.latencyMs = options.latencyMs ?? 0;
    this.stores = createDefaultStores();
    this.customFieldValues = createEmptyCustomFieldValues();
    this.lookups = defaultLookups();
    this.settings = defaultSettings();
    this.fetch = this.handleFetch.bind(this) as typeof fetch;

    this.seed(options.seed);

    for (const subscription of options.webhookSubscriptions ?? []) {
      this.addWebhookSubscription(subscription);
    }
  }

  get routeDefinitions(): readonly MockRouteDefinition[] {
    return this.routes;
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
      this.customFieldValues = mergeCustomFieldValues(this.customFieldValues, seed.customFieldValues);
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

  setCustomFieldValues(resource: MockCustomFieldResource, recordId: string | number, values: MockCustomFieldValueMap): void {
    this.customFieldValues[resource][String(recordId)] = structuredCloneCompat(values);
  }

  getCustomFieldValues(resource: MockCustomFieldResource, recordId: string | number): MockCustomFieldValueMap {
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

    this.webhookEvents.push(structuredCloneCompat(webhookEvent));
    await this.deliverWebhook(webhookEvent);
    return webhookEvent;
  }

  private async handleFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (this.latencyMs > 0) {
      await delay(this.latencyMs);
    }

    const normalized = await normalizeRequest(input, init, this.baseUrl);
    const match = matchRoute(normalized.method, normalized.path);

    if (!match) {
      return jsonResponse(
        {
          message: `No Lead Docket mock route found for ${normalized.method} ${normalized.path}`,
          knownRoutes: this.routes.map((route) => `${route.method} ${route.path}`),
        },
        404,
      );
    }

    this.requests.push({
      id: `req_${this.allocateId()}`,
      method: normalized.method,
      url: normalized.url.toString(),
      path: normalized.path,
      query: normalized.query,
      pathParams: match.pathParams,
      operationId: match.route.operationId,
      body: normalized.body,
      at: new Date().toISOString(),
    });

    try {
      const ctx: RequestHandlerContext = { ...normalized, ...match };
      const data = await this.handleRequest(ctx);
      await this.maybeEmitApiWebhook(ctx, data);
      return jsonResponse(data, match.route.status || 200);
    } catch (error) {
      return jsonResponse(
        {
          message: error instanceof Error ? error.message : 'Mock API error',
        },
        500,
      );
    }
  }

  private async handleRequest(ctx: RequestHandlerContext): Promise<unknown> {
    const operation = ctx.route.operationId.toLowerCase();
    const path = ctx.route.path.toLowerCase();
    const tag = ctx.route.tags[0]?.toLowerCase() ?? '';

    if (path.includes('/api/settings')) {
      return this.settings;
    }

    if (path.includes('/api/lookups')) {
      if (path.includes('gettypes')) {
        return Object.keys(this.lookups);
      }
      return this.lookups;
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

    if (path.includes('/api/leads')) {
      return this.handleLeadRoutes(ctx);
    }

    if (path.includes('/api/opportunities')) {
      return this.handleCollection(ctx, 'opportunities');
    }

    if (path.includes('/api/tasks')) {
      return this.handleCollection(ctx, 'tasks');
    }

    if (path.includes('/api/referralgroups')) {
      return this.handleCollection(ctx, 'referralGroups');
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

    if (path.includes('/api/statuses') || tag === 'statuses') {
      return this.handleCollection(ctx, 'statuses');
    }

    if (path.includes('/api/substatus') || tag === 'substatuses') {
      return this.handleCollection(ctx, 'substatuses');
    }

    if (path.includes('/api/leadforms')) {
      return this.handleCollection(ctx, 'leadForms');
    }

    if (path.includes('/api/messages')) {
      return this.handleCollection(ctx, 'messages');
    }

    if (path.includes('/api/externalcalls')) {
      return this.handleCollection(ctx, 'externalCalls');
    }

    if (operation.includes('download') || operation.includes('recording') || operation.includes('transcription')) {
      return sampleFromSchema(ctx.route.responseSchema);
    }

    return sampleFromSchema(ctx.route.responseSchema);
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
    const id = firstDefinedPathParam(ctx.pathParams, ['id', 'leadId', 'contactId', 'opportunityId', 'taskId', 'referralId', 'statusId', 'subStatusId', 'settlementId', 'expenseId', 'formId', 'externalCallId']);
    const operation = ctx.route.operationId.toLowerCase();

    if (ctx.method === 'GET') {
      if (operation.includes('list') || operation.includes('search') || operation.includes('since') || operation.includes('all') || operation.includes('pending') || operation.includes('unprocessed') || !id) {
        return maybePagedResponse(ctx.route.responseSchema, this.withCustomFieldsForStore(store, collection));
      }

      return this.withCustomFieldsForStore(store, [findByAnyId(collection, id) ?? sampleRecordForStore(store, Number(id) || this.allocateId())])[0];
    }

    if (ctx.method === 'POST') {
      if (operation.includes('appendnote') || ctx.route.path.toLowerCase().includes('/notes')) {
        return createChildRecord(body, this.allocateId(), { leadId: ctx.pathParams.leadId ?? ctx.pathParams.id });
      }

      const created = normalizeRecord(body, () => this.allocateId(), sampleRecordForStore(store, this.allocateId()));
      collection.push(created);
      this.captureRecordCustomFields(store, created);
      return responseForMutation(ctx.route.responseSchema, this.withCustomFieldsForStore(store, [created])[0]);
    }

    if (ctx.method === 'PUT' || ctx.method === 'PATCH') {
      if (operation.includes('markcomplete')) {
        const task = upsertById(collection, id, { ...body, id: numberOrString(id), completed: true, completedDate: new Date().toISOString() });
        return responseForMutation(ctx.route.responseSchema, task);
      }

      if (operation.includes('lock') || operation.includes('unlock')) {
        const locked = operation.includes('lock') && !operation.includes('unlock');
        const record = upsertById(collection, id, { ...body, id: numberOrString(id), locked });
        return responseForMutation(ctx.route.responseSchema, record);
      }

      const updated = upsertById(collection, id, { ...body, id: numberOrString(id) });
      this.captureRecordCustomFields(store, updated);
      return responseForMutation(ctx.route.responseSchema, this.withCustomFieldsForStore(store, [updated])[0]);
    }

    if (ctx.method === 'DELETE') {
      if (id) {
        const index = collection.findIndex((record) => idMatches(record, id));
        if (index >= 0) {
          collection.splice(index, 1);
        }
      }
      return responseForMutation(ctx.route.responseSchema, { success: true });
    }

    return sampleFromSchema(ctx.route.responseSchema);
  }

  private withCustomFieldsForStore(store: MockStoreName, records: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    const resource = customFieldResourceForStore(store);
    if (!resource) {
      return structuredCloneCompat(records);
    }

    return records.map((record) => this.withCustomFields(resource, record));
  }

  private withCustomFields(resource: MockCustomFieldResource, record: Record<string, unknown>): Record<string, unknown> {
    const cloned = structuredCloneCompat(record);
    const recordId = getRecordIdentifier(cloned);
    const explicitValues = recordId === undefined ? {} : this.customFieldValues[resource][String(recordId)] ?? {};
    const existingValues = customFieldArrayToValueMap(cloned.CustomFields ?? cloned.customFields);
    const values = { ...existingValues, ...explicitValues };
    const definitions = this.customFieldDefinitionsForResource(resource);
    const customFields = definitions.map((definition) => customFieldValueForDefinition(definition, values));
    const unknownValues = Object.entries(values)
      .filter(([key]) => !definitions.some((definition) => customFieldDefinitionMatchesKey(definition, key)))
      .map(([key, value]) => ({ CustomFieldId: numericIdOrUndefined(key), Name: key, Value: stringifyCustomFieldValue(value) }));

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

  private customFieldDefinitionsForResource(resource: MockCustomFieldResource): MockCustomFieldDefinition[] {
    if (resource === 'contacts') {
      return this.stores.contactCustomFields as MockCustomFieldDefinition[];
    }

    const definitions = this.stores.customFields as MockCustomFieldDefinition[];
    if (resource === 'opportunities') {
      return definitions.filter((definition) => normalizeLocation(definition) === 'opportunity');
    }

    return definitions.filter((definition) => normalizeLocation(definition) !== 'opportunity');
  }

  private handleCustomFieldsUpdate(ctx: RequestHandlerContext, resource: MockCustomFieldResource): unknown {
    const body = asRecord(ctx.body);
    const recordId = body.Id ?? body.id ?? body.LeadId ?? body.leadId ?? body.ContactId ?? body.contactId ?? body.Code ?? body.code;
    if (recordId === undefined) {
      return { success: false, message: 'Mock custom field update requires Id or Code.' };
    }

    const values = customFieldArrayToValueMap(body.CustomFields ?? body.customFields);
    const store = storeForCustomFieldResource(resource);
    const record = findByAnyId(this.stores[store], String(recordId));
    const valueKey = String(record ? getRecordIdentifier(record) : recordId);
    this.customFieldValues[resource][valueKey] = {
      ...this.customFieldValues[resource][valueKey],
      ...values,
    };

    if (record) {
      Object.assign(record, this.withCustomFields(resource, record));
    }

    return { success: true, CustomFields: this.withCustomFields(resource, { id: valueKey }).CustomFields };
  }

  private handleSingleCustomFieldUpdate(ctx: RequestHandlerContext, resource: MockCustomFieldResource): unknown {
    const recordId = ctx.query.leadId;
    const fieldId = ctx.query.id;
    if (recordId === undefined || fieldId === undefined) {
      return { success: false, message: 'Mock custom field update requires leadId and id query parameters.' };
    }

    this.customFieldValues[resource][String(recordId)] = {
      ...this.customFieldValues[resource][String(recordId)],
      [fieldId]: ctx.query.value,
    };

    return { success: true, CustomFieldId: Number(fieldId), Value: ctx.query.value };
  }

  private getCustomFieldValue(resource: MockCustomFieldResource, recordId: string | undefined, fieldId: string | undefined): unknown {
    if (recordId === undefined || fieldId === undefined) {
      return undefined;
    }

    const values = this.customFieldValues[resource][String(recordId)] ?? {};
    const definition = this.customFieldDefinitionsForResource(resource).find((candidate) => customFieldDefinitionMatchesKey(candidate, fieldId));
    const value = getCustomFieldMapValue(values, definition, fieldId);

    return {
      CustomFieldId: Number(fieldId),
      Name: definition ? customFieldName(definition) : fieldId,
      Value: stringifyCustomFieldValue(value),
    };
  }

  private async maybeEmitApiWebhook(ctx: RequestHandlerContext, data: unknown): Promise<void> {
    if (ctx.method === 'GET') {
      return;
    }

    const entity = inferEntity(ctx.route);
    const action = inferAction(ctx);

    await this.emitWebhook({
      event: `${entity}.${action}`,
      entity,
      action,
      apiCallDriven: true,
      operationId: ctx.route.operationId,
      method: ctx.method,
      path: ctx.path,
      pathParams: ctx.pathParams,
      query: ctx.query,
      requestBody: ctx.body,
      data,
    });
  }

  private async deliverWebhook(event: MockWebhookEvent): Promise<void> {
    if (!this.deliverWebhooks) {
      return;
    }

    await Promise.all(
      this.subscriptions
        .filter((subscription) => !subscription.events || subscription.events.includes(event.event) || subscription.events.includes(`${event.entity}.*`) || subscription.events.includes('*'))
        .map(async (subscription) => {
          if (subscription.handler) {
            await subscription.handler(structuredCloneCompat(event));
          }

          if (subscription.url) {
            await globalThis.fetch(subscription.url, {
              method: 'POST',
              headers: {
                ...JSON_HEADERS,
                ...headersToObject(subscription.headers),
              },
              body: JSON.stringify(event),
            });
          }
        }),
    );
  }

  private allocateId(): number {
    this.nextId += 1;
    return this.nextId;
  }
}

export function createLeadDocketMockApi(options?: LeadDocketMockApiOptions): LeadDocketMockApi {
  return new LeadDocketMockApi(options);
}

export function createLeadDocketMockFetch(options?: LeadDocketMockApiOptions): typeof fetch {
  return createLeadDocketMockApi(options).fetch;
}

export { mockRouteDefinitions } from './routes.gen';

function createEmptyCustomFieldValues(): Record<MockCustomFieldResource, Record<string, MockCustomFieldValueMap>> {
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

function storeForCustomFieldResource(resource: MockCustomFieldResource): 'contacts' | 'leads' | 'opportunities' {
  return resource;
}

function getRecordIdentifier(record: Record<string, unknown>): string | number | undefined {
  const identifier = record.Id ?? record.id ?? record.ContactId ?? record.contactId ?? record.LeadId ?? record.leadId ?? record.OpportunityId ?? record.opportunityId ?? record.Code ?? record.code;
  return typeof identifier === 'string' || typeof identifier === 'number' ? identifier : undefined;
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
    const fieldValue = field.Value ?? field.value ?? field.CustomFieldValue ?? field.customFieldValue;

    if (fieldId !== undefined) {
      values[String(fieldId)] = fieldValue;
    }
    if (name !== undefined) {
      values[String(name)] = fieldValue;
    }
  }

  return values;
}

function customFieldValueForDefinition(definition: MockCustomFieldDefinition, values: MockCustomFieldValueMap): Record<string, unknown> {
  const id = customFieldId(definition);
  const name = customFieldName(definition);
  const value = getCustomFieldMapValue(values, definition, String(id ?? name)) ?? definition.defaultValue ?? definition.DefaultValues ?? null;

  return {
    CustomFieldId: id,
    Name: name,
    Value: stringifyCustomFieldValue(value),
  };
}

function getCustomFieldMapValue(values: MockCustomFieldValueMap, definition: MockCustomFieldDefinition | undefined, fallbackKey: string): unknown {
  if (definition) {
    const keys = [customFieldId(definition), customFieldName(definition), definition.Code, definition.code]
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

function customFieldDefinitionMatchesKey(definition: MockCustomFieldDefinition, key: string): boolean {
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
  return String(value);
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

function defaultLookups(): Record<string, unknown> {
  return {
    caseTypes: [{ id: 1, name: 'Personal Injury' }],
    statuses: [sampleStatus(1)],
    substatuses: [sampleSubstatus(1)],
    tags: [{ id: 1, name: 'VIP' }],
    referralSources: [sampleReferral(1)],
  };
}

function defaultSettings(): Record<string, unknown> {
  return {
    organizationName: 'Mock Lead Docket',
    timezone: 'America/New_York',
    apiMock: true,
  };
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
  return {
    id,
    contactId: id,
    firstName: 'Mock',
    lastName: `Contact ${id}`,
    name: `Mock Contact ${id}`,
    email: `contact${id}@example.com`,
    phone: '5551234567',
    code: `CONTACT-${id}`,
    createdDate: new Date(0).toISOString(),
    lastUpdated: new Date(0).toISOString(),
  };
}

function sampleLead(id: number): Record<string, unknown> {
  return {
    id,
    leadId: id,
    contactId: id,
    firstName: 'Mock',
    lastName: `Lead ${id}`,
    name: `Mock Lead ${id}`,
    statusId: 1,
    status: 'New',
    source: 'Website',
    code: `LEAD-${id}`,
    createdDate: new Date(0).toISOString(),
    lastUpdated: new Date(0).toISOString(),
  };
}

function sampleOpportunity(id: number): Record<string, unknown> {
  return {
    id,
    opportunityId: id,
    firstName: 'Mock',
    lastName: `Opportunity ${id}`,
    name: `Mock Opportunity ${id}`,
    status: 'Open',
    createdDate: new Date(0).toISOString(),
  };
}

function sampleTask(id: number): Record<string, unknown> {
  return {
    id,
    taskId: id,
    leadId: 1,
    subject: `Mock Task ${id}`,
    dueDate: new Date(0).toISOString(),
    completed: false,
  };
}

function sampleUser(id: number): Record<string, unknown> {
  return {
    id,
    userId: id,
    name: `Mock User ${id}`,
    email: `user${id}@example.com`,
    active: true,
  };
}

function sampleStatus(id: number): Record<string, unknown> {
  return { id, statusId: id, name: id === 1 ? 'New' : `Status ${id}`, sortOrder: id };
}

function sampleSubstatus(id: number): Record<string, unknown> {
  return { id, subStatusId: id, statusId: 1, name: `Substatus ${id}`, sortOrder: id };
}

function sampleReferral(id: number): Record<string, unknown> {
  return { id, referralId: id, name: `Mock Referral ${id}`, externalCode: `REF-${id}` };
}

function sampleSettlement(id: number): Record<string, unknown> {
  return { id, settlementId: id, leadId: 1, grossAmount: 10000, feeAmount: 3333.33 };
}

function sampleExpense(id: number): Record<string, unknown> {
  return { id, expenseId: id, leadId: 1, amount: 100, description: `Mock Expense ${id}` };
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
      pathParams: Object.fromEntries(matcher.names.map((name, index) => [name, decodeURIComponent(match[index + 1] ?? '')])),
    };
  }

  return undefined;
}

async function normalizeRequest(input: RequestInfo | URL, init: RequestInit | undefined, baseUrl: string): Promise<NormalizedRequest> {
  const request = input instanceof Request ? new Request(input, init) : new Request(new URL(String(input), baseUrl), init);
  const url = new URL(request.url, baseUrl);
  const body = await parseRequestBody(request);

  return {
    request,
    url,
    path: url.pathname,
    method: request.method.toUpperCase(),
    query: Object.fromEntries(url.searchParams.entries()),
    body,
  };
}

async function parseRequestBody(request: Request): Promise<unknown> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }

  const text = await request.clone().text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function jsonResponse(data: unknown, status: number): Response {
  if (status === 204 || status === 205) {
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
  if (normalized.id === undefined) {
    normalized.id = allocateId();
  }
  return normalized;
}

function createChildRecord(body: Record<string, unknown>, id: number, parent: Record<string, unknown>): Record<string, unknown> {
  return {
    id,
    ...parent,
    ...body,
    createdDate: new Date().toISOString(),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function firstDefinedPathParam(pathParams: Record<string, string>, names: string[]): string | undefined {
  for (const name of names) {
    if (pathParams[name] !== undefined) {
      return pathParams[name];
    }
  }

  return Object.values(pathParams)[0];
}

function findByAnyId(collection: Array<Record<string, unknown>>, id: string): Record<string, unknown> | undefined {
  return collection.find((record) => idMatches(record, id));
}

function upsertById(collection: Array<Record<string, unknown>>, id: string | undefined, patch: Record<string, unknown>): Record<string, unknown> {
  if (id) {
    const existing = collection.find((record) => idMatches(record, id));
    if (existing) {
      Object.assign(existing, patch, { lastUpdated: new Date().toISOString() });
      return existing;
    }
  }

  const created = normalizeRecord(patch, () => Number(id) || Date.now());
  collection.push(created);
  return created;
}

function idMatches(record: Record<string, unknown>, id: string): boolean {
  return (
    Object.entries(record).some(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      return (normalizedKey.endsWith('id') || normalizedKey === 'code') && String(value) === id;
    }) || String(record.id) === id
  );
}

function numberOrString(value: string | undefined): string | number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
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

  if (schemaName && !schemaName.toLowerCase().includes('list') && !schemaName.toLowerCase().includes('array')) {
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
    return Object.assign({}, ...resolved.allOf.map((item) => sampleFromSchema(item, seen)).filter((item) => item && typeof item === 'object'));
  }

  const type = 'type' in resolved ? resolved.type : undefined;

  if (type === 'array') {
    return [sampleFromSchema('items' in resolved ? resolved.items : undefined, seen)];
  }

  if (type === 'object' || 'properties' in resolved) {
    const properties = ('properties' in resolved && resolved.properties && typeof resolved.properties === 'object' ? resolved.properties : {}) as Record<string, unknown>;
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

function inferEntity(route: MockRouteDefinition): string {
  const path = route.path.toLowerCase();
  const tag = route.tags[0] ?? 'api';

  const pathEntityMap: Array<[string, string]> = [
    ['/contacts', 'contact'],
    ['/leadsources', 'leadSource'],
    ['/leadroles', 'leadRole'],
    ['/leads', 'lead'],
    ['/opportunities', 'opportunity'],
    ['/tasks', 'task'],
    ['/referralgroups', 'referralGroup'],
    ['/referrals', 'referral'],
    ['/settlements', 'settlement'],
    ['/expenses', 'expense'],
    ['/statuses', 'status'],
    ['/substatus', 'substatus'],
    ['/leadforms', 'leadForm'],
    ['/messages', 'message'],
    ['/externalcalls', 'externalCall'],
    ['/customfields', 'customField'],
  ];

  for (const [fragment, entity] of pathEntityMap) {
    if (path.includes(fragment)) {
      return entity;
    }
  }

  return tag.charAt(0).toLowerCase() + tag.slice(1);
}

function inferAction(ctx: RequestHandlerContext): MockWebhookAction {
  const operation = ctx.route.operationId.toLowerCase();

  if (ctx.method === 'DELETE' || operation.includes('delete')) return 'deleted';
  if (operation.includes('markcomplete')) return 'completed';
  if (operation.includes('send')) return 'sent';
  if (operation.includes('start')) return 'started';
  if (operation.includes('end')) return 'ended';
  if (operation.includes('unlock')) return 'unlocked';
  if (operation.includes('lock')) return 'locked';
  if (operation.includes('disregard')) return 'disregarded';
  if (operation.includes('processed')) return 'processed';
  if (operation.includes('statuschange') || operation.includes('advance')) return 'changed';
  if (ctx.method === 'POST') return 'created';
  if (ctx.method === 'PUT' || ctx.method === 'PATCH') return 'updated';
  return 'triggered';
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
