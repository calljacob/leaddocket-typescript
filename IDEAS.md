# Project Ideas

## Deploy the mock API to Cloudflare Workers

Status: deferred.

### Recommended architecture

- Add a separate Worker application under `apps/mock-worker/`.
- Keep the existing browser/edge-compatible `LeadDocketMockApi` as the mock engine.
- Route each mock scenario to a Durable Object, for example `default`, `demo`, or a test-suite name.
- Store versioned mock snapshots in Durable Object SQLite storage so state survives isolate eviction and deployments.
- Use Workers Static Assets for the admin UI, Swagger UI, `openapi.json`, and sanitized webhook examples.
- Keep the current Node adapter in `src/mock/server.ts`; add a separate Cloudflare adapter instead of adding Worker conditionals to the Node server.
- Put the admin hostname or `/__mock/*` routes behind Cloudflare Access.

### Core changes needed

1. Extract platform-neutral admin/API routing from `src/mock/server.ts` into a module that accepts and returns web-standard `Request` and `Response` objects.
2. Add `exportSnapshot()` and `restoreSnapshot()` to `LeadDocketMockApi`.
3. Include stores, custom-field values, lookups, settings, integrations, histories, and the next ID in a versioned serializable snapshot.
4. Persist URL webhook subscriptions, but never try to serialize in-process handler functions.
5. Cap request, webhook-event, and delivery histories.
6. Add Worker-runtime tests with `@cloudflare/vitest-plugin` and local Durable Object bindings.

### Live synchronization

- Store `LEAD_DOCKET_API_KEY` and `LEAD_DOCKET_INTEGRATION_PREVIEW_URLS` as Worker secrets.
- Keep `LEAD_DOCKET_BASE_URL` as a non-secret Worker variable.
- Never run live synchronization during cold start or an ordinary mock request.
- Add a protected `POST /__mock/sync-live` action that starts a Cloudflare Workflow and returns `202` with a workflow ID.
- Optionally trigger the same Workflow from a UTC Cron Trigger.
- Workflow steps should synchronize custom fields, safe reference metadata, and configured integration previews; validate and sanitize them; replace live integration keys with generated mock-only keys; then atomically install the completed snapshot in the Durable Object.
- Keep the previous snapshot active until every synchronization step succeeds.
- Never persist the live API key or raw integration preview URLs in Durable Object storage.
- Add strict response-size limits before running preview/reference importers in Workers because they currently buffer JSON or HTML responses.

### Worker-specific considerations

- Use a current `compatibility_date` and enable `nodejs_compat`.
- Generate binding types with `wrangler types`; do not hand-write `Env`.
- Add structured Workers observability.
- Keep Faker out of the default Worker bundle when possible. Prefer generating fixtures locally and uploading a snapshot, or use a separate optional generation entry.
- A deployed Worker cannot send webhooks to `localhost`; use a public development endpoint or Cloudflare Tunnel.
- Run `wrangler check startup` and `wrangler deploy --dry-run` before staging deployment.

### Suggested implementation order

1. Snapshot export/import and bounded histories.
2. Platform-neutral HTTP/control module.
3. Durable Object adapter and persistence.
4. Worker router and static assets.
5. Cloudflare Access policy for admin routes.
6. Manual synchronization Workflow.
7. Optional scheduled synchronization.
8. Worker-runtime tests and staging deployment.
