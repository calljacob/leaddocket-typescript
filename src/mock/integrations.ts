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
  key: MockOpportunityIntegrationFieldKey;
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
  placeholder?: string;
  defaultValue?: string | number | boolean;
  checkedValue?: string | number | boolean;
  uncheckedValue?: string | number | boolean | null;
};

export type MockOpportunityIntegration = {
  id: string | number;
  accessKey: string;
  name: string;
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
      const url = new URL(`/opportunities/form/${encodeURIComponent(id)}`, origin);
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
      if (request.method === 'GET') {
        return htmlResponse(renderForm(integration, request.url, {}, [], preview), 200);
      }
      if (request.method !== 'POST') {
        return htmlResponse(renderMethodNotAllowed(), 405, { Allow: 'GET, POST' });
      }

      const submitted = parseSubmissionBody(request);
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
          ),
          409,
        );
      }
      const { opportunity, customFields, errors } = mapSubmission(integration, submitted);
      if (errors.length > 0) {
        return htmlResponse(renderForm(integration, request.url, submitted, errors, false), 422);
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
    if (seen.has(field.key)) {
      throw new TypeError(`Integration ${integration.id} contains duplicate field ${field.key}.`);
    }
    seen.add(field.key);
    if ((field.type === 'select' || field.type === 'radio') && !field.options?.length) {
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

function matchIntegrationPath(path: string): { id: string; success: boolean } | undefined {
  const match = /^\/opportunities\/form\/([^/]+?)(\/success)?\/?$/i.exec(path);
  if (!match) return undefined;
  try {
    return { id: decodeURIComponent(match[1]), success: Boolean(match[2]) };
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

function parseSubmissionBody(request: IntegrationRequest): Record<string, unknown> {
  if (request.body && typeof request.body === 'object' && !Array.isArray(request.body)) {
    return request.body as Record<string, unknown>;
  }
  if (typeof request.body !== 'string') return {};

  const contentType = request.request.headers.get('content-type') ?? '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(request.body));
  }
  return {};
}

function mapSubmission(
  integration: MockOpportunityIntegration & { fields?: MockOpportunityIntegrationField[] },
  submitted: Record<string, unknown>,
): {
  opportunity: Record<string, unknown>;
  customFields: Array<{ CustomFieldId: number; Value: string | null }>;
  errors: string[];
} {
  const opportunity: Record<string, unknown> = { ...integration.defaults };
  const customFields: Array<{ CustomFieldId: number; Value: string | null }> = [];
  const errors: string[] = [];

  for (const field of integration.fields ?? defaultFields()) {
    const rawValue =
      field.type === 'hidden' ? field.defaultValue : (submitted[field.key] ?? field.defaultValue);
    const value = normalizeFieldValue(field, rawValue);
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.label ?? humanizeFieldKey(field.key)} is required.`);
      continue;
    }
    if (value === undefined) continue;
    if (
      (field.type === 'select' || field.type === 'radio') &&
      value !== '' &&
      !optionValues(field.options).includes(String(value))
    ) {
      errors.push(`${field.label ?? humanizeFieldKey(field.key)} has an invalid value.`);
      continue;
    }

    if (field.key.startsWith('custom:')) {
      customFields.push({
        CustomFieldId: Number(field.key.slice('custom:'.length)),
        Value: value === null ? null : String(value),
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
): string | number | boolean | null | undefined {
  if (field.type === 'checkbox') {
    const checked = value === true || value === 'true' || value === 'on' || value === '1';
    return checked ? (field.checkedValue ?? true) : (field.uncheckedValue ?? false);
  }
  if (value === undefined || value === null) return value;
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
): string {
  const action = `${url.pathname}?apikey=${encodeURIComponent(integration.accessKey)}${preview ? '&preview=true' : ''}`;
  const fields = (integration.fields ?? defaultFields())
    .map((field) => renderField(field, values[field.key] ?? field.defaultValue))
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
      <form method="post" action="${escapeHtml(action)}">
        ${fields}
        ${preview ? '<button type="button" disabled>Preview only</button>' : `<button type="submit">${escapeHtml(integration.submitLabel ?? 'Submit')}</button>`}
      </form>
    </main>`,
  );
}

function renderField(field: MockOpportunityIntegrationField, value: unknown): string {
  const id = `field-${field.key.replace(/[^a-z0-9_-]/gi, '-')}`;
  const label = escapeHtml(field.label ?? humanizeFieldKey(field.key));
  const required = field.required ? ' required' : '';
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
  const stringValue = fieldValueString(value);

  if (field.type === 'hidden') {
    return `<input name="${escapeHtml(field.key)}" type="hidden" value="${escapeHtml(stringValue)}" />`;
  }
  if (field.type === 'textarea') {
    return `<label for="${id}">${label}${field.required ? ' *' : ''}</label><textarea id="${id}" name="${escapeHtml(field.key)}"${required}${placeholder}>${escapeHtml(stringValue)}</textarea>`;
  }
  if (field.type === 'select') {
    const options = (field.options ?? [])
      .map((option) => {
        const normalized = normalizeOption(option);
        return `<option value="${escapeHtml(normalized.value)}"${normalized.value === stringValue ? ' selected' : ''}>${escapeHtml(normalized.label)}</option>`;
      })
      .join('');
    return `<label for="${id}">${label}${field.required ? ' *' : ''}</label><select id="${id}" name="${escapeHtml(field.key)}"${required}><option value="">Select…</option>${options}</select>`;
  }
  if (field.type === 'radio') {
    const options = (field.options ?? [])
      .map((option, index) => {
        const normalized = normalizeOption(option);
        const optionId = `${id}-${index}`;
        const checked = normalized.value === stringValue ? ' checked' : '';
        return `<label class="radio" for="${optionId}"><input id="${optionId}" name="${escapeHtml(field.key)}" type="radio" value="${escapeHtml(normalized.value)}"${checked}${required} /> <span>${escapeHtml(normalized.label)}</span></label>`;
      })
      .join('');
    return `<fieldset><legend>${label}${field.required ? ' *' : ''}</legend>${options}</fieldset>`;
  }
  if (field.type === 'checkbox') {
    const checked = value === true || value === 'true' || value === 'on' ? ' checked' : '';
    return `<label class="checkbox" for="${id}"><input id="${id}" name="${escapeHtml(field.key)}" type="checkbox"${checked}${required} /> <span>${label}</span></label>`;
  }

  return `<label for="${id}">${label}${field.required ? ' *' : ''}</label><input id="${id}" name="${escapeHtml(field.key)}" type="${field.type ?? 'text'}" value="${escapeHtml(stringValue)}"${required}${placeholder} />`;
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
