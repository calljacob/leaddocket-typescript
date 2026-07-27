# Security Policy

## Supported versions

Security fixes are generally applied to the latest published version of `@calljacob/leaddocket-typescript`.

## Reporting a vulnerability

Please do not open a public GitHub issue for suspected security vulnerabilities.

Instead, report security concerns through one of these channels:

1. If GitHub private vulnerability reporting is enabled for the repository, use that feature.
2. Otherwise, contact the repository maintainer through the contact method listed on the npm package or GitHub profile.

Please include:

- a description of the vulnerability;
- steps to reproduce, if applicable;
- affected versions;
- potential impact;
- any suggested remediation.

## Scope

This package is a TypeScript API client and local mock API. It does not intentionally store credentials or communicate with Lead Docket unless you configure the generated client to do so.

When using this package:

- never hardcode API tokens in source control;
- prefer environment variables or a secret manager for credentials;
- avoid logging real Lead Docket API tokens, webhook payloads, or personally identifiable information;
- treat mock seed data as potentially sensitive if copied from production systems.
