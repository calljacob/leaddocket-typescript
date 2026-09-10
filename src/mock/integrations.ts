import type { OpportunityApi } from '../client/types.gen';

export type MockOpportunityIntegrationFieldKey =
  | 'FirstName'
  | 'MiddleName'
  | 'LastName'
  | 'Address1'
  | 'Address2'
  | 'City'
  | 'State'
  | 'Zip'
  | 'HomePhone'
  | 'WorkPhone'
  | 'MobilePhone'
  | 'Email'
  | 'Gender'
  | 'Language'
  | 'Birthdate'
  | 'LeadStatus'
  | 'SubStatus'
  | 'Office'
  | 'MarketingSource'
  | 'MarketingSourceDetails'
  | 'ContactSource'
  | 'Summary'
  | 'InjuryInformation'
  | 'IncidentDate'
  | 'Note'
  | 'ReferredBy'
  | 'SeverityLevel'
  | 'County'
  | 'AppointmentLocation'
  | 'AppointmentScheduledDate'
  | 'ReferringUrl'
  | 'CurrentUrl'
  | 'UTM'
  | 'ClientId'
  | 'ClickId'
  | 'Keywords'
  | 'Campaign'
  | `custom:${number}`
  | `extra:${string}`;

export type MockOpportunityIntegrationFieldOption =
  | string
  | {
      label: string;
      value: string;
    };

export type MockOpportunityIntegrationField = {
  /** Destination opportunity/custom/extra field. */
  key: MockOpportunityIntegrationFieldKey;
  /** Original HTML/JSON field name. Defaults to `key` for backward compatibility. */
  sourceName?: string;
  label?: string;
  type?:
    | 'text'
    | 'email'
    | 'tel'
    | 'date'
    | 'number'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'hidden';
  required?: boolean;
  options?: MockOpportunityIntegrationFieldOption[];
  /** Allows repeated form keys and array-valued JSON for selects and checkbox groups. */
  multiple?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean | Array<string | number | boolean>;
  checkedValue?: string | number | boolean;
  uncheckedValue?: string | number | boolean | null;
};

export type MockOpportunityIntegration = {
  id: string | number;
  accessKey: string;
  name: string;
  /** Form submission method imported from the live preview. Defaults to POST. */
  method?: 'get' | 'post';
  /** Form encoding imported from the live preview. */
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'application/json';
  /** Lead Docket endpoint style used when generating access URLs. */
  endpoint?: 'form' | 'formJson' | 'formJsonNested';
  description?: string;
  submitLabel?: string;
  successMessage?: string;
  fields?: MockOpportunityIntegrationField[];
  defaults?: Partial<OpportunityApi>;
};

export type MockOpportunityIntegrationSummary = {
  id: string;
  name: string;
  description?: string;
  fieldCount: number;
};

type IntegrationRequest = {
  request: Request;
  url: URL;
  path: string;
  method: string;
  query: Record<string, string>;
  body: unknown;
};

type IntegrationRequestRecord = {
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  pathParams: Record<string, string>;
  operationId: string;
  body?: unknown;
};

type IntegrationSubmission = {
  integration: MockOpportunityIntegration;
  opportunity: Record<string, unknown>;
  customFields: Array<{ CustomFieldId: number; Value: string | null }>;
  request: IntegrationRequestRecord;
};

type OpportunityIntegrationFormsOptions = {
  integrations: MockOpportunityIntegration[];
  recordRequest(request: IntegrationRequestRecord): void;
  submit(submission: IntegrationSubmission): Promise<Record<string, unknown>>;
};

export type OpportunityIntegrationForms = {
  readonly summaries: MockOpportunityIntegrationSummary[];
  accessUrl(origin: string, id: string, preview?: boolean): string | undefined;
  handle(request: IntegrationRequest): Promise<Response | undefined>;
};

export function createOpportunityIntegrationForms(
  options: OpportunityIntegrationFormsOptions,
): OpportunityIntegrationForms {
  const integrations = new Map<
    string,
    MockOpportunityIntegration & { fields: MockOpportunityIntegrationField[] }
  >();
  for (const candidate of options.integrations) {
    const integration = normalizeIntegration(candidate);
    const id = String(integration.id);
    if (integrations.has(id)) {
      throw new TypeError(`Duplicate opportunity integration id: ${id}`);
    }
    integrations.set(id, integration);
  }

  return {
    summaries: [...integrations.values()].map(({ id, name, description, fields }) => ({
      id: String(id),
      name,
      description,
      fieldCount: fields.length,
    })),
    accessUrl(origin, id, preview = false) {
      const integration = integrations.get(id);
      if (!integration) return undefined;
      const endpoint = integration.endpoint ?? 'form';
      const segment =
        endpoint === 'formJson'
          ? 'FormJson'
          : endpoint === 'formJsonNested'
            ? 'FormJsonNested'
            : 'form';
      const url = new URL(`/opportunities/${segment}/${encodeURIComponent(id)}`, origin);
      url.searchParams.set('apikey', integration.accessKey);
      if (preview) url.searchParams.set('preview', 'true');
      return url.toString();
    },
    async handle(request) {
      const match = matchIntegrationPath(request.path);
      if (!match) return undefined;

      const integration = integrations.get(match.id);
      const preview = request.query.preview?.toLowerCase() === 'true';
      const requestRecord = sanitizeRequest(request, match.id, match.success, preview);
      options.recordRequest(requestRecord);

      if (match.success && request.method === 'GET') {
        return htmlResponse(renderSuccess(integration), integration ? 200 : 404);
      }
      if (!integration || request.query.apikey !== integration.accessKey) {
        return htmlResponse(renderNotFound(), 404);
      }
      const configuredMethod = (integration.method ?? 'post').toUpperCase();
      const isGetSubmission =
        request.method === 'GET' &&
        configuredMethod === 'GET' &&
        hasSubmittedField(integration, request.query);
      if (request.method === 'GET' && !isGetSubmission) {
        return htmlResponse(renderForm(integration, request.url, {}, [], preview), 200);
      }
      if (request.method !== configuredMethod) {
        return htmlResponse(renderMethodNotAllowed(), 405, {
          Allow: `GET${configuredMethod === 'POST' ? ', POST' : ''}`,
        });
      }

      const submitted = isGetSubmission
        ? withoutFrameworkQuery(entriesToRecord(request.url.searchParams.entries()))
        : await parseSubmissionBody(request);
      if (preview) {
        if (wantsJson(request.request)) {
          return jsonResponse(
            { success: false, message: 'Preview submissions are disabled.' },
            409,
          );
        }
        return htmlResponse(
          renderForm(
            integration,
            request.url,
            submitted,
            ['Preview mode does not create opportunities or trigger webhooks.'],
            true,
            true,
          ),
          409,
        );
      }
      const { opportunity, customFields, errors } = mapSubmission(
        integration,
        submitted,
        match.endpoint === 'formJsonNested',
      );
      if (errors.length > 0) {
        if (wantsJson(request.request) || match.endpoint !== 'form') {
          return jsonResponse({ success: false, errors }, 422);
        }
        return htmlResponse(
          renderForm(integration, request.url, submitted, errors, false, true),
          422,
        );
      }

      const created = await options.submit({
        integration,
        opportunity,
        customFields,
        request: { ...requestRecord, body: submitted },
      });
      if (wantsJson(request.request)) {
        return jsonResponse({ success: true, opportunity: created }, 201);
      }

      return new Response(null, {
        status: 303,
        headers: {
          location: `/opportunities/form/${encodeURIComponent(match.id)}/success`,
        },
      });
    },
  };
}

function normalizeIntegration(
  integration: MockOpportunityIntegration,
): MockOpportunityIntegration & { fields: MockOpportunityIntegrationField[] } {
  if (!String(integration.id).trim()) throw new TypeError('Integration id is required.');
  if (!integration.accessKey)
    throw new TypeError(`Integration ${integration.id} needs an accessKey.`);
  if (!integration.name.trim()) throw new TypeError(`Integration ${integration.id} needs a name.`);
  const fields = integration.fields?.length ? integration.fields : defaultFields();
  const seen = new Set<string>();
  for (const field of fields) {
    const identity = `${field.key}\u0000${field.sourceName ?? ''}`;
    if (seen.has(identity)) {
      throw new TypeError(`Integration ${integration.id} contains duplicate field ${field.key}.`);
    }
    seen.add(identity);
    if (field.sourceName !== undefined && !field.sourceName.trim()) {
      throw new TypeError(`Integration field ${field.key} has an empty sourceName.`);
    }
    if (
      (field.type === 'select' ||
        field.type === 'radio' ||
        (field.type === 'checkbox' && field.multiple)) &&
      !field.options?.length
    ) {
      throw new TypeError(`Integration field ${field.key} needs at least one option.`);
    }
    if (field.key.startsWith('custom:') && !Number.isInteger(Number(field.key.slice(7)))) {
      throw new TypeError(`Integration field ${field.key} needs a numeric custom-field id.`);
    }
    if (field.key.startsWith('extra:') && !field.key.slice(6).trim()) {
      throw new TypeError('Integration extra field names cannot be empty.');
    }
  }
  return { ...integration, fields };
}

function matchIntegrationPath(
  path: string,
):
  | { id: string; success: boolean; endpoint: NonNullable<MockOpportunityIntegration['endpoint']> }
  | undefined {
  const match =
    /^\/opportunities\/(form|formjson|formjsonnested)\/([^/]+?)(\/success)?\/?$/i.exec(path) ??
    /^\/(formjson|formjsonnested)\/([^/]+?)(\/success)?\/?$/i.exec(path);
  if (!match) return undefined;
  try {
    const endpoint =
      match[1].toLowerCase() === 'formjson'
        ? 'formJson'
        : match[1].toLowerCase() === 'formjsonnested'
          ? 'formJsonNested'
          : 'form';
    return { id: decodeURIComponent(match[2]), success: Boolean(match[3]), endpoint };
  } catch {
    return undefined;
  }
}

function sanitizeRequest(
  request: IntegrationRequest,
  id: string,
  success: boolean,
  preview: boolean,
): IntegrationRequestRecord {
  const sanitizedUrl = new URL(request.url);
  sanitizedUrl.searchParams.delete('apikey');
  const { apikey: _accessKey, ...query } = request.query;
  return {
    method: request.method,
    url: sanitizedUrl.toString(),
    path: request.path,
    query,
    pathParams: { id },
    operationId: success
      ? 'integrationForm.success'
      : preview
        ? 'integrationForm.preview'
        : `integrationForm.${request.method === 'POST' ? 'submit' : 'render'}`,
  };
}

async function parseSubmissionBody(request: IntegrationRequest): Promise<Record<string, unknown>> {
  if (request.body && typeof request.body === 'object' && !Array.isArray(request.body)) {
    return request.body as Record<string, unknown>;
  }

  const contentType = (request.request.headers.get('content-type') ?? '').toLowerCase();
  if (contentType.includes('multipart/form-data')) {
    try {
      return entriesToRecord((await request.request.clone().formData()).entries());
    } catch {
      return {};
    }
  }
  if (typeof request.body !== 'string') return {};
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return entriesToRecord(new URLSearchParams(request.body).entries());
  }
  if (contentType.includes('application/json')) {
    try {
      const parsed: unknown = JSON.parse(request.body);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

function entriesToRecord(
  entries: IterableIterator<[string, FormDataEntryValue]> | IterableIterator<[string, string]>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, entry] of entries) {
    const value = typeof entry === 'string' ? entry : entry.name;
    const existing = result[key];
    result[key] =
      existing === undefined
        ? value
        : Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
  }
  return result;
}

function withoutFrameworkQuery(query: Record<string, unknown>): Record<string, unknown> {
  const { apikey: _accessKey, preview: _preview, ...submitted } = query;
  return submitted;
}

function hasSubmittedField(
  integration: MockOpportunityIntegration & { fields: MockOpportunityIntegrationField[] },
  query: Record<string, string>,
): boolean {
  return integration.fields.some(
    (field) => (field.sourceName ?? field.key) in query || field.key in query,
  );
}

function mapSubmission(
  integration: MockOpportunityIntegration & { fields?: MockOpportunityIntegrationField[] },
  submitted: Record<string, unknown>,
  nested = false,
): {
  opportunity: Record<string, unknown>;
  customFields: Array<{ CustomFieldId: number; Value: string | null }>;
  errors: string[];
} {
  const opportunity: Record<string, unknown> = { ...integration.defaults };
  const customFields: Array<{ CustomFieldId: number; Value: string | null }> = [];
  const errors: string[] = [];

  for (const field of integration.fields ?? defaultFields()) {
    const submittedValue = submittedFieldValue(submitted, field, nested);
    const rawValue =
      field.type === 'hidden'
        ? field.defaultValue
        : submittedValue.found
          ? submittedValue.value
          : field.type === 'checkbox'
            ? undefined
            : field.defaultValue;
    const value = normalizeFieldValue(field, rawValue);
    const missing =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (field.type === 'checkbox' && !field.multiple && value === (field.uncheckedValue ?? false));
    if (field.required && missing) {
      errors.push(`${field.label ?? humanizeFieldKey(field.key)} is required.`);
      continue;
    }
    if (value === undefined) continue;
    if (
      (field.type === 'select' ||
        field.type === 'radio' ||
        (field.type === 'checkbox' && field.multiple)) &&
      value !== '' &&
      !(Array.isArray(value) ? value : [value]).every((item) =>
        optionValues(field.options).includes(String(item)),
      )
    ) {
      errors.push(`${field.label ?? humanizeFieldKey(field.key)} has an invalid value.`);
      continue;
    }

    if (field.key.startsWith('custom:')) {
      customFields.push({
        CustomFieldId: Number(field.key.slice('custom:'.length)),
        Value:
          value === null
            ? null
            : Array.isArray(value)
              ? value.map(String).join(',')
              : String(value),
      });
    } else if (field.key.startsWith('extra:')) {
      opportunity[field.key.slice('extra:'.length)] = value;
    } else {
      opportunity[field.key] = value;
    }
  }

  return { opportunity, customFields, errors };
}

function normalizeFieldValue(
  field: MockOpportunityIntegrationField,
  value: unknown,
): string | number | boolean | null | Array<string | number | boolean> | undefined {
  if (field.multiple) {
    const values = (
      Array.isArray(value)
        ? value
        : value === undefined || value === null || value === ''
          ? []
          : [value]
    )
      .filter(
        (item): item is string | number | boolean =>
          typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean',
      )
      .map((item) => (typeof item === 'string' ? item.trim() : item));
    return values;
  }
  if (field.type === 'checkbox') {
    const checkedValue = field.checkedValue ?? true;
    const values = Array.isArray(value) ? value : [value];
    const checked = values.some(
      (item) =>
        item === true ||
        item === 'true' ||
        item === 'on' ||
        item === '1' ||
        String(item) === String(checkedValue),
    );
    return checked ? checkedValue : (field.uncheckedValue ?? false);
  }
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) value = value.at(-1);
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    return undefined;
  }
  if (field.type === 'number') {
    if (value === '') return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }
  return typeof value === 'string' ? value.trim() : value;
}

function submittedFieldValue(
  submitted: Record<string, unknown>,
  field: MockOpportunityIntegrationField,
  nested: boolean,
): { found: boolean; value?: unknown } {
  const names =
    field.sourceName && field.sourceName !== field.key
      ? [field.sourceName, field.key]
      : [field.key];
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(submitted, name)) {
      return { found: true, value: submitted[name] };
    }
    const pathValue = valueAtPath(submitted, name);
    if (pathValue.found) return pathValue;
    if (nested) {
      const deepValue = findNestedProperty(submitted, name);
      if (deepValue.found) return deepValue;
    }
  }
  return { found: false };
}

function valueAtPath(
  submitted: Record<string, unknown>,
  path: string,
): { found: boolean; value?: unknown } {
  const segments = path
    .replace(/\[([^\]]+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  if (segments.length < 2) return { found: false };
  let current: unknown = submitted;
  for (const segment of segments) {
    if (
      !current ||
      typeof current !== 'object' ||
      Array.isArray(current) ||
      !(segment in current)
    ) {
      return { found: false };
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return { found: true, value: current };
}

function findNestedProperty(value: unknown, name: string): { found: boolean; value?: unknown } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { found: false };
  const record = value as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(record, name))
    return { found: true, value: record[name] };
  for (const child of Object.values(record)) {
    const found = findNestedProperty(child, name);
    if (found.found) return found;
  }
  return { found: false };
}

function defaultFields(): MockOpportunityIntegrationField[] {
  return [
    { key: 'FirstName', label: 'First name', required: true },
    { key: 'LastName', label: 'Last name', required: true },
    { key: 'Email', label: 'Email', type: 'email', required: true },
    { key: 'MobilePhone', label: 'Phone', type: 'tel' },
    { key: 'Summary', label: 'How can we help?', type: 'textarea', required: true },
  ];
}

function renderForm(
  integration: MockOpportunityIntegration & { fields?: MockOpportunityIntegrationField[] },
  url: URL,
  values: Record<string, unknown>,
  errors: string[],
  preview: boolean,
  submittedAttempt = false,
): string {
  const action = `${url.pathname}?apikey=${encodeURIComponent(integration.accessKey)}${preview ? '&preview=true' : ''}`;
  const method = integration.method ?? 'post';
  const enctype = integration.enctype ?? 'application/x-www-form-urlencoded';
  const frameworkFields =
    method === 'get'
      ? `<input name="apikey" type="hidden" value="${escapeHtml(integration.accessKey)}" />${preview ? '<input name="preview" type="hidden" value="true" />' : ''}`
      : '';
  const fields = (integration.fields ?? defaultFields())
    .map((field) => {
      const submitted = submittedFieldValue(values, field, false);
      return renderField(
        field,
        submitted.found || (submittedAttempt && field.type === 'checkbox')
          ? submitted.value
          : field.defaultValue,
      );
    })
    .join('');
  const errorList = errors.length
    ? `<div class="errors" role="alert"><strong>Please fix the following:</strong><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul></div>`
    : '';

  return page(
    integration.name,
    `<main class="form-card">
      <p class="eyebrow">Opportunity integration</p>
      <h1>${escapeHtml(integration.name)}</h1>
      ${integration.description ? `<p class="description">${escapeHtml(integration.description)}</p>` : ''}
      ${preview ? '<div class="preview-banner"><strong>Preview mode</strong><span>Submissions and webhooks are disabled.</span></div>' : ''}
      ${errorList}
      <form method="${method}" enctype="${escapeHtml(enctype)}" action="${escapeHtml(action)}">
        ${frameworkFields}${fields}
        ${preview ? '<button type="button" disabled>Preview only</button>' : `<button type="submit">${escapeHtml(integration.submitLabel ?? 'Submit')}</button>`}
      </form>
    </main>`,
  );
}

function renderField(field: MockOpportunityIntegrationField, value: unknown): string {
  const sourceName = field.sourceName ?? field.key;
  const id = `field-${sourceName.replace(/[^a-z0-9_-]/gi, '-')}`;
  const label = escapeHtml(field.label ?? humanizeFieldKey(field.key));
  const required = field.required ? ' required' : '';
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
  const stringValue = fieldValueString(value);

  if (field.type === 'hidden') {
    return `<input name="${escapeHtml(sourceName)}" type="hidden" value="${escapeHtml(stringValue)}" />`;
  }
  if (field.type === 'textarea') {
    return `<label for="${id}">${label}${field.required ? ' *' : ''}</label><textarea id="${id}" name="${escapeHtml(sourceName)}"${required}${placeholder}>${escapeHtml(stringValue)}</textarea>`;
  }
  if (field.type === 'select') {
    const options = (field.options ?? [])
      .map((option) => {
        const normalized = normalizeOption(option);
        const selected = (Array.isArray(value) ? value.map(String) : [stringValue]).includes(
          normalized.value,
        );
        return `<option value="${escapeHtml(normalized.value)}"${selected ? ' selected' : ''}>${escapeHtml(normalized.label)}</option>`;
      })
      .join('');
    return `<label for="${id}">${label}${field.required ? ' *' : ''}</label><select id="${id}" name="${escapeHtml(sourceName)}"${field.multiple ? ' multiple' : ''}${required}>${field.multiple ? '' : '<option value="">Select…</option>'}${options}</select>`;
  }
  if (field.type === 'radio') {
    const options = (field.options ?? [])
      .map((option, index) => {
        const normalized = normalizeOption(option);
        const optionId = `${id}-${index}`;
        const checked = normalized.value === stringValue ? ' checked' : '';
        return `<label class="radio" for="${optionId}"><input id="${optionId}" name="${escapeHtml(sourceName)}" type="radio" value="${escapeHtml(normalized.value)}"${checked}${required} /> <span>${escapeHtml(normalized.label)}</span></label>`;
      })
      .join('');
    return `<fieldset><legend>${label}${field.required ? ' *' : ''}</legend>${options}</fieldset>`;
  }
  if (field.type === 'checkbox') {
    if (field.multiple) {
      const selected = new Set(
        (Array.isArray(value) ? value : value === undefined ? [] : [value]).map(String),
      );
      const options = (field.options ?? [])
        .map((option, index) => {
          const normalized = normalizeOption(option);
          const optionId = `${id}-${index}`;
          return `<label class="checkbox" for="${optionId}"><input id="${optionId}" name="${escapeHtml(sourceName)}" type="checkbox" value="${escapeHtml(normalized.value)}"${selected.has(normalized.value) ? ' checked' : ''} /> <span>${escapeHtml(normalized.label)}</span></label>`;
        })
        .join('');
      return `<fieldset${field.required ? ' aria-required="true"' : ''}><legend>${label}${field.required ? ' *' : ''}</legend>${options}</fieldset>`;
    }
    const checkedValue = field.checkedValue ?? true;
    const checked =
      value === true || value === 'true' || value === 'on' || String(value) === String(checkedValue)
        ? ' checked'
        : '';
    return `<label class="checkbox" for="${id}"><input id="${id}" name="${escapeHtml(sourceName)}" type="checkbox" value="${escapeHtml(String(checkedValue))}"${checked}${required} /> <span>${label}</span></label>`;
  }

  return `<label for="${id}">${label}${field.required ? ' *' : ''}</label><input id="${id}" name="${escapeHtml(sourceName)}" type="${field.type ?? 'text'}" value="${escapeHtml(stringValue)}"${required}${placeholder} />`;
}

function renderSuccess(integration: MockOpportunityIntegration | undefined): string {
  if (!integration) return renderNotFound();
  return page(
    'Submission received',
    `<main class="form-card success"><p class="eyebrow">Opportunity created</p><h1>Thank you</h1><p>${escapeHtml(integration.successMessage ?? 'Your information was submitted successfully.')}</p></main>`,
  );
}

function renderNotFound(): string {
  return page(
    'Integration not found',
    '<main class="form-card"><h1>Form unavailable</h1><p>This integration link is invalid or no longer active.</p></main>',
  );
}

function renderMethodNotAllowed(): string {
  return page(
    'Method not allowed',
    '<main class="form-card"><h1>Method not allowed</h1><p>Use this form in a browser or submit it with POST.</p></main>',
  );
}

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172038; background: #eef3fb; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at top, #fff 0, #eef3fb 55%); }
    .form-card { width: min(620px, 100%); padding: clamp(24px, 6vw, 48px); border: 1px solid #d9e1ef; border-radius: 22px; background: white; box-shadow: 0 24px 70px rgba(38, 57, 91, 0.14); }
    .eyebrow { margin: 0 0 8px; color: #47658f; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 7vw, 3.25rem); letter-spacing: -0.05em; }
    .description, .success p { margin: 0 0 28px; color: #56657d; line-height: 1.6; }
    form { display: grid; gap: 10px; }
    label { margin-top: 8px; font-size: 0.86rem; font-weight: 750; }
    input, textarea, select { width: 100%; border: 1px solid #b9c6d9; border-radius: 10px; padding: 12px 13px; background: #fbfcff; color: inherit; font: inherit; }
    textarea { min-height: 130px; resize: vertical; }
    input:focus, textarea:focus, select:focus { outline: 3px solid #b9dcff; border-color: #2874c6; }
    fieldset { display: grid; gap: 8px; margin: 8px 0 0; padding: 12px; border: 1px solid #d5deec; border-radius: 10px; }
    legend { padding: 0 4px; font-size: 0.86rem; font-weight: 750; }
    .checkbox, .radio { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
    .checkbox input, .radio input { width: auto; }
    button { margin-top: 16px; border: 0; border-radius: 11px; padding: 13px 18px; background: #1b64b1; color: white; font: inherit; font-weight: 800; cursor: pointer; }
    button:disabled { background: #8b98aa; cursor: not-allowed; }
    .preview-banner { display: grid; gap: 4px; margin: 20px 0; padding: 14px 16px; border: 1px solid #edc66f; border-radius: 10px; background: #fff8df; color: #74520d; }
    .errors { margin: 20px 0; padding: 14px 16px; border: 1px solid #e8a4ad; border-radius: 10px; background: #fff2f4; color: #8c2637; }
    .errors ul { margin-bottom: 0; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function normalizeOption(option: MockOpportunityIntegrationFieldOption): {
  label: string;
  value: string;
} {
  return typeof option === 'string' ? { label: option, value: option } : option;
}

function optionValues(options: MockOpportunityIntegrationFieldOption[] | undefined): string[] {
  return (options ?? []).map((option) => normalizeOption(option).value);
}

function fieldValueString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value.toString();
  return '';
}

function wantsJson(request: Request): boolean {
  return (
    request.headers.get('accept')?.includes('application/json') === true ||
    request.headers.get('content-type')?.includes('application/json') === true
  );
}

function htmlResponse(body: string, status: number, headers?: HeadersInit): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy':
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'",
      'x-content-type-options': 'nosniff',
      ...Object.fromEntries(new Headers(headers).entries()),
    },
  });
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function humanizeFieldKey(key: string): string {
  if (key.startsWith('custom:')) return `Custom field ${key.slice('custom:'.length)}`;
  if (key.startsWith('extra:'))
    return key.slice('extra:'.length).replace(/([a-z])([A-Z])/g, '$1 $2');
  return key.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character] ?? character;
  });
}
