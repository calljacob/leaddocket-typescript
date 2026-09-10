# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added a Node HTTP mock server and dependency-free administration UI for triggering and inspecting webhooks.
- Added the `leaddocket-mock` CLI, JSON server configuration, and an example config.
- Added safe live custom-field discovery and credential-free local snapshots.
- Added webhook delivery history with HTTP status, duration, and failure details.
- Added configurable Lead Docket-style opportunity integration forms with canonical, custom, extra, static, and user-defined option values that persist submissions and emit `opportunity.created` webhooks.
- Added integration preview URLs and admin links that render forms without allowing opportunity creation or webhook delivery.
- Added a packaged `.dev.vars.example` and automatic `.dev.vars` loading for credentialed live metadata calls.
- Added read-only integration preview importing through config, CLI (`sync-integrations` / `sync-live`), and the admin page.
- Added self-hosted Swagger UI at the mock server root and `/api/explore/index.html`, backed by the source OpenAPI document.
- Added 15 sanitized Lead Docket webhook payload examples with an admin viewer, JSON endpoints, OpenAPI extension, and repeatable PII sanitizer.
- Added deterministic Faker-powered contacts, leads, opportunities, tasks, messages, and users through server config, an admin generator, and the `./mock/faker` subpath.
- Added privacy-filtered live reference-data synchronization for statuses, substatuses, roles, sources, lookups, Lead Forms, referral practice areas, and settings.
- Added operation-specific state handlers for critical parent/subresource, query-driven, filtering, paging, and command routes.
- Added an explicit 15-event Lead Docket webhook catalog with generated full-shape payload templates and flat wire projection.
- Added focused `./client`, `./mock`, and `./discovery` package entry points.
- Added deterministic mock metadata regeneration/drift checks and packed CJS/ESM contract checks.

### Changed

- Webhook delivery failures no longer turn successful mock API mutations into error responses.
- Corrected generated lead-form route handling so `/api/leads/forms` operations use the `leadForms` store and `leadForm` webhook entity.
- Corrected lookup type selection, referral group/practice-area routing, status envelopes, and nested substatus mutations.
- Bounded and redacted retained histories by default, hardened live discovery with host/deadline/size/concurrency policies, and replaced live integration keys with mock-only keys.
- Protected admin routes with optional Basic authentication and restricted non-loopback binding and webhook egress.

### Fixed

- Reject unsafe or out-of-range OpenAPI `int32` path IDs and return `404` for valid missing records instead of fabricating scientific-notation entities.
- Fixed canonical resource identity, destructive subresource routing, query/body-driven mutations, OpenAPI response casing/envelopes, binary media responses, malformed JSON handling, and required path/query/body validation.
- Fixed integration source-name preservation, multipart/repeated-value parsing, JSON error responses, grouped controls, and FormJson/FormJsonNested routes.
- Fixed Faker zero-parent relations/reference-date behavior and webhook sanitizer field misclassification.

## [1.1.0] - 2026-07-27

### Added

- Added a full in-memory Lead Docket mock API via `createLeadDocketMockApi()` and `createLeadDocketMockFetch()`.
- Added generated mock route and schema metadata covering all 114 OpenAPI operations.
- Added webhook simulation for API-driven mutation events and manually emitted events.
- Added webhook subscriptions with local handlers, event filters, wildcard filters, unsubscribe support, and optional outbound `POST` delivery.
- Added seed/reset helpers and in-memory stores for common Lead Docket resources.
- Added developer-defined custom field definitions and values for contacts, leads, and opportunities.
- Added mock support for Lead Docket custom-field update/read endpoints.
- Added community files: `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and `NOTICE.md`.
- Added GitHub Actions CI for lint, test, and build validation on Node 18, 20, and 22.

### Changed

- Updated package metadata with an `exports` map, Node engine requirement, `sideEffects: false`, and public scoped package publishing config.
- Removed `@hey-api/openapi-ts` from normal development dependencies; regeneration remains documented via `npx`.
- Added an npm override for `esbuild` to resolve audit advisories.
- Updated README installation, usage, mock API, custom field, and webhook documentation.

### Fixed

- Fixed mock route matching so more-specific static routes win over parameterized routes.
- Improved mock test coverage for route handling, webhook filtering, reset/history helpers, custom fields, and unknown-route responses.

## [1.0.0] - 2026-07-14

### Added

- Initial release of the Lead Docket TypeScript API Client.
- Auto-generated 114 endpoints using `@hey-api/openapi-ts` from the official OpenAPI schema.
- Native fetch-based client support.
- Fully typed parameters and responses.
