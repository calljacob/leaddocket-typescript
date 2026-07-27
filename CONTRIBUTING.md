# Contributing

Thanks for your interest in contributing to `@calljacob/leaddocket-typescript`.

## Development setup

```bash
npm install
npm run build
npm run test
npm run lint
```

## Project structure

- `openapi.json` is the OpenAPI source schema.
- `src/client/` contains checked-in generated client code. The OpenAPI generator is not installed as a normal dev dependency.
- `src/mock/` contains the in-memory mock API and webhook simulator.
- `test/` contains Vitest coverage for the generated client and mock API.

## Regenerating the API client

If the Lead Docket OpenAPI schema changes, update `openapi.json` and regenerate the client with:

```bash
npx @hey-api/openapi-ts@0.99.0 -c openapi-ts.config.ts
```

The generator is intentionally invoked through `npx` so day-to-day installs do not include the OpenAPI generation dependency tree.

After regenerating, run:

```bash
npm run format
npm run lint
npm run test
npm run build
```

## Mock API changes

When adding or changing mock behavior:

1. Keep responses compatible with the generated TypeScript types where possible.
2. Prefer stateful behavior for common resources instead of one-off fixture responses.
3. Keep all OpenAPI routes covered by the mock route coverage test.
4. Add tests for any new webhook or custom-field behavior.

## Pull request checklist

Before opening a pull request, please verify:

- [ ] `npm run lint` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] Public API changes are documented in `README.md`.
- [ ] Notable changes are added to `CHANGELOG.md` when appropriate.

## Code style

This project uses Prettier and ESLint. Run:

```bash
npm run format
npm run lint
```

Generated client files may have a different style than hand-written mock code. Avoid manual edits to generated files unless absolutely necessary.
