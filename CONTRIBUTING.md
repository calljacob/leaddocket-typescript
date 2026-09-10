# Contributing

Thanks for your interest in contributing to `@calljacob/leaddocket-typescript`.

## Development setup

```bash
vp install
vp check
vp test
vp pack
```

## Project structure

- `openapi.json` is the OpenAPI source schema.
- `src/client/` contains checked-in generated client code. The OpenAPI generator is not installed as a normal dev dependency.
- `src/mock/` contains the in-memory mock API, HTTP server, admin UI, and webhook simulator.
- `examples/webhooks/` contains sanitized Lead Docket webhook payload fixtures and a generated index.
- `test/` contains Vitest coverage for the generated client and mock API.

## Regenerating the API client

If the Lead Docket OpenAPI schema changes, update `openapi.json` and regenerate the client with:

```bash
vp dlx @hey-api/openapi-ts@0.99.0 -c openapi-ts.config.ts
```

The generator is intentionally invoked through `vp dlx` so day-to-day installs do not include the OpenAPI generation dependency tree. Regenerate mock route/schema metadata from the same source:

```bash
vp run generate:mock-metadata
vp run check:mock-metadata
```

After regenerating, run:

```bash
vp check --fix
vp test
vp pack
```

## Webhook payload examples

Never commit webhook captures directly. Place new JSON payloads in `examples/webhooks/`, then run:

```bash
vp run sanitize:webhook-examples
vp run check:webhook-examples
```

The sanitizer replaces personal identifiers and free text with controlled fictional values and regenerates `examples/webhooks/index.json`. Review the resulting diff before committing.

## Mock API changes

When adding or changing mock behavior:

1. Keep responses compatible with the generated TypeScript types where possible.
2. Prefer stateful behavior for common resources instead of one-off fixture responses.
3. Keep all OpenAPI routes covered by the mock route coverage test.
4. Add tests for any new webhook or custom-field behavior.

## Pull request checklist

Before opening a pull request, please verify:

- [ ] `vp check` passes.
- [ ] `vp run check:mock-metadata` passes.
- [ ] `vp run check:webhook-examples` passes.
- [ ] `vp test` passes.
- [ ] `vp pack` passes.
- [ ] `vp run check:package-contract` passes.
- [ ] Public API changes are documented in `README.md`.
- [ ] Notable changes are added to `CHANGELOG.md` when appropriate.

## Code style

This project uses Vite+ with Oxfmt and Oxlint. Run:

```bash
vp check --fix
```

Generated client files may have a different style than hand-written mock code. Avoid manual edits to generated files unless absolutely necessary.
