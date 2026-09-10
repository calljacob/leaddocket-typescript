#!/usr/bin/env node

import { randomUUID } from 'node:crypto';
import { chmodSync, statSync } from 'node:fs';
import { chmod, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

import { discoverLeadDocketCustomFields, type LeadDocketLiveAuth } from './custom-fields';
import { discoverLeadDocketIntegrations } from './live-integrations';
import { discoverLeadDocketReferenceData } from './reference-data';
import {
  startLeadDocketMockServer,
  type LeadDocketMockServerConfig,
  type LeadDocketMockServerOptions,
} from './server';

const DEFAULT_CONFIG_PATH = 'leaddocket.mock.json';

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.command === 'sync-custom-fields') {
    await syncCustomFields(args.configPath);
    return;
  }
  if (args.command === 'sync-integrations') {
    await syncIntegrations(args.configPath);
    return;
  }
  if (args.command === 'sync-reference-data') {
    await syncReferenceData(args.configPath);
    return;
  }
  if (args.command === 'sync-live') {
    await syncLive(args.configPath);
    return;
  }

  const config = await readConfig(args.configPath, false);
  const serverOptions: LeadDocketMockServerOptions = {
    ...config.server,
    port: args.port ?? config.server?.port,
    hostname: args.hostname ?? config.server?.hostname,
    generatedData: config.generatedData,
    mock: {
      seed: config.seed,
      historyLimit: config.historyLimit,
      captureHistoryBodies: config.captureHistoryBodies,
      maxRequestBodyBytes: config.maxRequestBodyBytes,
      opportunityIntegrations: config.opportunityIntegrations,
      webhookSubscriptions: config.webhookSubscriptions,
      webhookTimeoutMs: config.webhookTimeoutMs,
    },
    webhookPresets: config.webhookPresets,
    onOpportunityIntegrationsImported: async (_previewUrls, integrations) => {
      const current = await readConfig(args.configPath, true);
      await writeConfig(args.configPath, {
        ...current,
        schemaVersion: 1,
        opportunityIntegrations: integrations,
      });
    },
  };
  const server = await startLeadDocketMockServer(serverOptions);
  console.log(`Lead Docket mock API: ${server.origin}`);
  console.log(`Admin UI: ${server.adminUrl}`);
  console.log(`Config: ${resolve(args.configPath)}`);
  console.log('Press Ctrl+C to stop.');

  const stop = async () => {
    await server.close();
    process.exit(0);
  };
  process.once('SIGINT', () => void stop());
  process.once('SIGTERM', () => void stop());
}

type CliArgs = {
  command:
    | 'serve'
    | 'sync-custom-fields'
    | 'sync-integrations'
    | 'sync-reference-data'
    | 'sync-live';
  configPath: string;
  port?: number;
  hostname?: string;
  help: boolean;
};

function parseArgs(args: string[]): CliArgs {
  let command: CliArgs['command'] = 'serve';
  let configPath = DEFAULT_CONFIG_PATH;
  let port: number | undefined;
  let hostname: string | undefined;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (
      arg === 'serve' ||
      arg === 'sync-custom-fields' ||
      arg === 'sync-integrations' ||
      arg === 'sync-reference-data' ||
      arg === 'sync-live'
    ) {
      command = arg;
    } else if (arg === '--config' || arg === '-c') {
      configPath = requireArgValue(args, ++index, arg);
    } else if (arg === '--port' || arg === '-p') {
      port = Number(requireArgValue(args, ++index, arg));
      if (!Number.isInteger(port)) throw new TypeError('--port must be an integer.');
    } else if (arg === '--host') {
      hostname = requireArgValue(args, ++index, arg);
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    } else {
      throw new TypeError(`Unknown argument: ${arg}`);
    }
  }

  return { command, configPath, port, hostname, help };
}

function requireArgValue(args: string[], index: number, flag: string): string {
  const value = args[index];
  if (!value) throw new TypeError(`${flag} requires a value.`);
  return value;
}

async function syncCustomFields(configPath: string): Promise<void> {
  loadDevVars();
  const snapshot = await discoverCustomFieldsFromEnvironment();
  const existing = await readConfig(configPath, true);
  const next: LeadDocketMockServerConfig = {
    ...existing,
    schemaVersion: 1,
    seed: {
      ...existing.seed,
      ...snapshot.seed,
    },
  };
  await writeConfig(configPath, next);
  console.log(
    `Saved ${snapshot.seed.contactCustomFields.length} contact and ${snapshot.seed.customFields.length} lead/opportunity custom fields to ${resolve(configPath)}.`,
  );
}

async function syncIntegrations(configPath: string): Promise<void> {
  loadDevVars();
  const existing = await readConfig(configPath, true);
  const previewUrls = integrationPreviewUrls(existing);
  const snapshot = await discoverLeadDocketIntegrations({
    previewUrls,
    customFields: existing.seed?.customFields,
  });
  await writeConfig(configPath, {
    ...existing,
    schemaVersion: 1,
    opportunityIntegrations: withMockAccessKeys(snapshot.opportunityIntegrations),
  });
  console.log(
    `Saved ${snapshot.opportunityIntegrations.length} opportunity integrations to ${resolve(configPath)}.`,
  );
}

async function syncReferenceData(configPath: string): Promise<void> {
  loadDevVars();
  const existing = await readConfig(configPath, true);
  const referenceData = await discoverReferenceDataFromEnvironment();
  await writeConfig(configPath, {
    ...existing,
    schemaVersion: 1,
    seed: mergeLiveSeed(existing.seed, referenceData.seed),
  });
  console.log(`Saved live reference metadata to ${resolve(configPath)}.`);
}

async function syncLive(configPath: string): Promise<void> {
  loadDevVars();
  const existing = await readConfig(configPath, true);
  const customFields = await discoverCustomFieldsFromEnvironment();
  const referenceData = await discoverReferenceDataFromEnvironment();
  const previewUrls = integrationPreviewUrls(existing);
  const integrations = await discoverLeadDocketIntegrations({
    previewUrls,
    customFields: customFields.seed.customFields,
  });
  await writeConfig(configPath, {
    ...existing,
    schemaVersion: 1,
    seed: mergeLiveSeed(existing.seed, customFields.seed, referenceData.seed),
    opportunityIntegrations: withMockAccessKeys(integrations.opportunityIntegrations),
  });
  console.log(
    `Saved ${customFields.seed.contactCustomFields.length} contact fields, ${customFields.seed.customFields.length} lead/opportunity fields, live reference metadata, and ${integrations.opportunityIntegrations.length} integrations to ${resolve(configPath)}.`,
  );
}

async function discoverCustomFieldsFromEnvironment() {
  return discoverLeadDocketCustomFields(liveConnectionFromEnvironment());
}

async function discoverReferenceDataFromEnvironment() {
  return discoverLeadDocketReferenceData({
    ...liveConnectionFromEnvironment(),
    includePhoneNumbers: process.env.LEAD_DOCKET_INCLUDE_PHONE_NUMBERS === 'true',
  });
}

function liveConnectionFromEnvironment(): { baseUrl: string; auth: LeadDocketLiveAuth } {
  const baseUrl = process.env.LEAD_DOCKET_BASE_URL;
  const apiKey = process.env.LEAD_DOCKET_API_KEY;
  const bearerToken = process.env.LEAD_DOCKET_BEARER_TOKEN;
  if (!baseUrl) throw new TypeError('Set LEAD_DOCKET_BASE_URL before synchronizing live data.');
  if ((apiKey ? 1 : 0) + (bearerToken ? 1 : 0) !== 1) {
    throw new TypeError(
      'Set exactly one of LEAD_DOCKET_API_KEY or LEAD_DOCKET_BEARER_TOKEN before synchronizing.',
    );
  }
  return {
    baseUrl,
    auth: apiKey ? { apiKey } : { bearerToken: bearerToken! },
  };
}

function mergeLiveSeed(
  existing: LeadDocketMockServerConfig['seed'],
  ...updates: Array<NonNullable<LeadDocketMockServerConfig['seed']>>
): NonNullable<LeadDocketMockServerConfig['seed']> {
  return updates.reduce(
    (seed, update) => ({
      ...seed,
      ...update,
      lookups: { ...seed.lookups, ...update.lookups },
      settings: { ...seed.settings, ...update.settings },
    }),
    { ...existing },
  );
}

function withMockAccessKeys<T extends { id: string | number; accessKey: string }>(
  integrations: T[],
): T[] {
  return integrations.map((integration) => ({
    ...integration,
    accessKey: `mock-${integration.id}-${randomUUID()}`,
  }));
}

function integrationPreviewUrls(config: LeadDocketMockServerConfig): string[] {
  const raw = process.env.LEAD_DOCKET_INTEGRATION_PREVIEW_URLS;
  if (!raw) {
    if (config.integrationPreviewUrls?.length) return config.integrationPreviewUrls;
    throw new TypeError(
      'Set LEAD_DOCKET_INTEGRATION_PREVIEW_URLS in .dev.vars or integrationPreviewUrls in the mock config.',
    );
  }
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new TypeError('LEAD_DOCKET_INTEGRATION_PREVIEW_URLS must be a JSON array.', {
      cause: error,
    });
  }
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every((url) => typeof url === 'string')
  ) {
    throw new TypeError('LEAD_DOCKET_INTEGRATION_PREVIEW_URLS must be a non-empty string array.');
  }
  return value;
}

async function readConfig(
  configPath: string,
  allowMissing: boolean,
): Promise<LeadDocketMockServerConfig> {
  try {
    if (process.platform !== 'win32' && resolve(configPath) === resolve(DEFAULT_CONFIG_PATH)) {
      await chmod(configPath, 0o600).catch((error) => {
        if (!isFileNotFound(error)) throw error;
      });
    }
    const contents = await readFile(configPath, 'utf8');
    const value: unknown = JSON.parse(contents);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('Mock server config must contain a JSON object.');
    }
    const rawConfig = value as Record<string, unknown>;
    if (rawConfig.schemaVersion !== undefined && rawConfig.schemaVersion !== 1) {
      throw new TypeError('Unsupported mock server config schemaVersion; expected 1.');
    }
    return rawConfig as LeadDocketMockServerConfig;
  } catch (error) {
    if (allowMissing && isFileNotFound(error)) return {};
    if (!allowMissing && isFileNotFound(error)) return {};
    if (error instanceof SyntaxError) {
      throw new TypeError(`Mock server config is not valid JSON: ${resolve(configPath)}`, {
        cause: error,
      });
    }
    throw error;
  }
}

async function writeConfig(configPath: string, config: LeadDocketMockServerConfig): Promise<void> {
  const absolutePath = resolve(configPath);
  const temporaryPath = `${absolutePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryPath, absolutePath);
}

function loadDevVars(path = '.dev.vars'): void {
  try {
    if (process.platform !== 'win32') {
      const mode = statSync(path).mode & 0o777;
      if ((mode & 0o077) !== 0) chmodSync(path, 0o600);
    }
    loadEnvFile(path);
  } catch (error) {
    if (!isFileNotFound(error)) {
      throw new TypeError(`Unable to load live-call variables from ${resolve(path)}.`, {
        cause: error,
      });
    }
  }
}

function isFileNotFound(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT');
}

function printHelp(): void {
  console.log(`Lead Docket mock server

Usage:
  leaddocket-mock [serve] [--config FILE] [--host HOST] [--port PORT]
  leaddocket-mock sync-custom-fields [--config FILE]
  leaddocket-mock sync-integrations [--config FILE]
  leaddocket-mock sync-reference-data [--config FILE]
  leaddocket-mock sync-live [--config FILE]

Defaults:
  Config: ${DEFAULT_CONFIG_PATH}
  Host:   127.0.0.1
  Port:   4010

Live sync environment (loaded automatically from .dev.vars):
  LEAD_DOCKET_BASE_URL
  LEAD_DOCKET_API_KEY or LEAD_DOCKET_BEARER_TOKEN
  LEAD_DOCKET_INTEGRATION_PREVIEW_URLS (JSON array)
  LEAD_DOCKET_INCLUDE_PHONE_NUMBERS=true (optional)
`);
}
