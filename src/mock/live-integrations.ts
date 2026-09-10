import type { MockCustomFieldDefinition } from './index';
import type {
  MockOpportunityIntegration,
  MockOpportunityIntegrationField,
  MockOpportunityIntegrationFieldKey,
  MockOpportunityIntegrationFieldOption,
} from './integrations';

export type DiscoverLeadDocketIntegrationsOptions = {
  previewUrls: string[];
  customFields?: MockCustomFieldDefinition[];
  fetch?: typeof fetch;
  signal?: AbortSignal;
  allowInsecure?: boolean;
};

export type LeadDocketIntegrationSnapshot = {
  schemaVersion: 1;
  opportunityIntegrations: MockOpportunityIntegration[];
};

export async function discoverLeadDocketIntegrations(
  options: DiscoverLeadDocketIntegrationsOptions,
): Promise<LeadDocketIntegrationSnapshot> {
  if (options.previewUrls.length === 0 || options.previewUrls.length > 100) {
    throw new RangeError('Integration discovery requires between 1 and 100 preview URLs.');
  }
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const integrations = await Promise.all(
    options.previewUrls.map(async (value) => {
      const source = normalizePreviewUrl(value, options.allowInsecure ?? false);
      const id = integrationId(source);
      try {
        const response = await fetchImplementation(source, {
          method: 'GET',
          redirect: 'error',
          signal: options.signal,
          headers: { accept: 'text/html' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return parseLeadDocketIntegrationPreview(
          await response.text(),
          source,
          options.customFields ?? [],
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') throw error;
        throw new Error(`Unable to import Lead Docket integration ${id} from its preview page.`, {
          cause: error,
        });
      }
    }),
  );

  const ids = new Set<string>();
  for (const integration of integrations) {
    const id = String(integration.id);
    if (ids.has(id)) throw new TypeError(`Duplicate Lead Docket integration preview id: ${id}`);
    ids.add(id);
  }
  return { schemaVersion: 1, opportunityIntegrations: integrations };
}

export function parseLeadDocketIntegrationPreview(
  html: string,
  sourceUrl: URL,
  customFields: MockCustomFieldDefinition[] = [],
): MockOpportunityIntegration {
  const id = integrationId(sourceUrl);
  const accessKey = sourceUrl.searchParams.get('apikey');
  if (!accessKey) throw new TypeError(`Lead Docket integration ${id} is missing its access key.`);
  const formHtml = /<form\b[^>]*>([\s\S]*?)<\/form>/i.exec(html)?.[1] ?? html;
  const fields = mapControls(extractControls(formHtml), customFields);
  if (fields.length === 0) {
    throw new TypeError(`Lead Docket integration ${id} preview did not contain importable fields.`);
  }
  return {
    id,
    accessKey,
    name: extractText(html, 'h1') ?? extractText(html, 'title') ?? `Lead Docket Integration ${id}`,
    description: 'Imported from a read-only Lead Docket integration preview.',
    fields,
  };
}

type Attributes = Record<string, string>;
type LiveControl = {
  name: string;
  label: string;
  type: MockOpportunityIntegrationField['type'];
  required: boolean;
  placeholder?: string;
  defaultValue?: string | boolean;
  checkedValue?: string | boolean;
  uncheckedValue?: false;
  options?: MockOpportunityIntegrationFieldOption[];
  customFieldId?: number;
};

function normalizePreviewUrl(value: string, allowInsecure: boolean): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError('Lead Docket integration preview URLs must be valid absolute URLs.');
  }
  if (url.username || url.password || url.hash) {
    throw new TypeError(
      'Lead Docket integration preview URLs cannot contain credentials or hashes.',
    );
  }
  if (url.protocol !== 'https:' && !(allowInsecure && url.protocol === 'http:')) {
    throw new TypeError('Lead Docket integration preview URLs must use HTTPS.');
  }
  if (!allowInsecure && !url.hostname.toLowerCase().endsWith('.leaddocket.com')) {
    throw new TypeError('Lead Docket integration preview URLs must use a leaddocket.com host.');
  }
  integrationId(url);
  if (!url.searchParams.get('apikey')) {
    throw new TypeError('Each Lead Docket integration preview URL must include its apikey value.');
  }
  url.searchParams.set('preview', 'true');
  return url;
}

function integrationId(url: URL): string {
  const match = /^\/opportunities\/form\/([^/]+?)\/?$/i.exec(url.pathname);
  if (!match) throw new TypeError('Integration URLs must use /Opportunities/Form/{id}.');
  try {
    return decodeURIComponent(match[1]);
  } catch {
    throw new TypeError('Integration URL contains an invalid form id.');
  }
}

function extractControls(html: string): LiveControl[] {
  const labels = new Map<string, string>();
  for (const match of html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)) {
    const attributes = parseAttributes(match[1]);
    if (attributes.for) labels.set(attributes.for, stripHtml(match[2]));
  }

  const controls: LiveControl[] = [];
  for (const match of html.matchAll(/<input\b([^>]*)>/gi)) {
    const attributes = parseAttributes(match[1]);
    const name = attributes.name;
    const inputType = (attributes.type ?? 'text').toLowerCase();
    if (
      !name ||
      isFrameworkField(name) ||
      ['submit', 'button', 'reset', 'image', 'file'].includes(inputType)
    )
      continue;
    const label = labels.get(attributes.id) ?? attributes.placeholder ?? humanize(name);
    const common = {
      name,
      label,
      required: 'required' in attributes,
      placeholder: attributes.placeholder,
      customFieldId: explicitCustomFieldId(attributes),
    };
    if (inputType === 'radio') {
      const option = { label, value: attributes.value ?? label };
      const existing = controls.find(
        (control) => control.name === name && control.type === 'radio',
      );
      if (existing) existing.options?.push(option);
      else controls.push({ ...common, type: 'radio', options: [option] });
    } else if (inputType === 'checkbox') {
      controls.push({
        ...common,
        type: 'checkbox',
        checkedValue: attributes.value && attributes.value !== 'on' ? attributes.value : true,
        uncheckedValue: false,
        defaultValue: 'checked' in attributes,
      });
    } else if (inputType === 'hidden') {
      controls.push({ ...common, type: 'hidden', defaultValue: attributes.value ?? '' });
    } else {
      controls.push({
        ...common,
        type: normalizeInputType(inputType),
        defaultValue: attributes.value,
      });
    }
  }

  for (const match of html.matchAll(/<textarea\b([^>]*)>([\s\S]*?)<\/textarea>/gi)) {
    const attributes = parseAttributes(match[1]);
    if (!attributes.name || isFrameworkField(attributes.name)) continue;
    controls.push({
      name: attributes.name,
      label: labels.get(attributes.id) ?? attributes.placeholder ?? humanize(attributes.name),
      type: 'textarea',
      required: 'required' in attributes,
      placeholder: attributes.placeholder,
      defaultValue: stripHtml(match[2]),
      customFieldId: explicitCustomFieldId(attributes),
    });
  }

  for (const match of html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/gi)) {
    const attributes = parseAttributes(match[1]);
    if (!attributes.name || isFrameworkField(attributes.name)) continue;
    const optionMatches = [...match[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)];
    const options = optionMatches
      .map((option) => {
        const optionAttributes = parseAttributes(option[1]);
        const label = stripHtml(option[2]);
        return { label, value: optionAttributes.value ?? label };
      })
      .filter((option) => option.value !== '');
    const selected = optionMatches.find((option) => 'selected' in parseAttributes(option[1]));
    controls.push({
      name: attributes.name,
      label: labels.get(attributes.id) ?? humanize(attributes.name),
      type: 'select',
      required: 'required' in attributes,
      options,
      defaultValue: selected
        ? (parseAttributes(selected[1]).value ?? stripHtml(selected[2]))
        : undefined,
      customFieldId: explicitCustomFieldId(attributes),
    });
  }
  return controls;
}

function mapControls(
  controls: LiveControl[],
  customFields: MockCustomFieldDefinition[],
): MockOpportunityIntegrationField[] {
  const fields: MockOpportunityIntegrationField[] = [];
  const keys = new Set<string>();
  for (const control of controls) {
    let key = mapFieldKey(control, customFields);
    if (keys.has(key)) key = uniqueExtraKey(control.name, keys);
    keys.add(key);
    fields.push({
      key,
      label: control.label,
      type: control.type,
      required: control.required,
      options: control.options,
      placeholder: control.placeholder,
      defaultValue: control.defaultValue,
      checkedValue: control.checkedValue,
      uncheckedValue: control.uncheckedValue,
    });
  }
  return fields;
}

function mapFieldKey(
  control: LiveControl,
  customFields: MockCustomFieldDefinition[],
): MockOpportunityIntegrationFieldKey {
  if (control.customFieldId !== undefined) return `custom:${control.customFieldId}`;
  const normalizedName = normalizeName(control.name);
  const normalizedLabel = normalizeName(control.label);
  const standard = STANDARD_FIELDS[normalizedName] ?? STANDARD_FIELDS[normalizedLabel];
  if (standard) return standard;
  const custom = customFields.find((field) => {
    const id = typeof field.Id === 'number' ? field.Id : field.id;
    if (id === undefined) return false;
    return [field.FieldName, field.name, field.Code, field.code]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => [normalizedName, normalizedLabel].includes(normalizeName(value)));
  });
  const customId = custom && (typeof custom.Id === 'number' ? custom.Id : custom.id);
  return customId !== undefined ? `custom:${customId}` : `extra:${control.name}`;
}

const STANDARD_FIELDS: Record<string, MockOpportunityIntegrationFieldKey> = {
  first: 'FirstName',
  firstname: 'FirstName',
  middle: 'MiddleName',
  middlename: 'MiddleName',
  last: 'LastName',
  lastname: 'LastName',
  email: 'Email',
  phone: 'MobilePhone',
  mobile: 'MobilePhone',
  mobilephone: 'MobilePhone',
  homephone: 'HomePhone',
  workphone: 'WorkPhone',
  summary: 'Summary',
  casesummary: 'Summary',
  address: 'Address1',
  address1: 'Address1',
  address2: 'Address2',
  city: 'City',
  state: 'State',
  zip: 'Zip',
  zipcode: 'Zip',
  postalcode: 'Zip',
  incidentdate: 'IncidentDate',
  dateofincident: 'IncidentDate',
  marketingsource: 'MarketingSource',
  contactsource: 'ContactSource',
  note: 'Note',
  language: 'Language',
  gender: 'Gender',
  birthdate: 'Birthdate',
  county: 'County',
};

function parseAttributes(value: string): Attributes {
  const attributes: Attributes = {};
  for (const match of value.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function explicitCustomFieldId(attributes: Attributes): number | undefined {
  const value =
    attributes['data-custom-field-id'] ?? attributes.customfieldid ?? attributes['data-field-id'];
  if (!value) return undefined;
  const id = Number(value);
  return Number.isInteger(id) ? id : undefined;
}

function normalizeInputType(value: string): MockOpportunityIntegrationField['type'] {
  return ['email', 'tel', 'date', 'number'].includes(value)
    ? (value as 'email' | 'tel' | 'date' | 'number')
    : 'text';
}

function uniqueExtraKey(name: string, keys: Set<string>): `extra:${string}` {
  let suffix = 2;
  let key: `extra:${string}` = `extra:${name}`;
  while (keys.has(key)) key = `extra:${name}_${suffix++}`;
  return key;
}

function isFrameworkField(name: string): boolean {
  const normalized = name.toLowerCase();
  return (
    normalized.startsWith('__') ||
    normalized.includes('requestverificationtoken') ||
    normalized === 'apikey'
  );
}

function extractText(html: string, tag: string): string | undefined {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(html);
  const value = match ? stripHtml(match[1]) : '';
  return value || undefined;
}

function stripHtml(value: string): string {
  return decodeHtml(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)));
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}
