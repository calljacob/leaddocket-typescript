import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const openApi = JSON.parse(await readFile(join(projectRoot, 'openapi.json'), 'utf8'));
const methods = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace']);
const routes = [];

for (const [path, pathItem] of Object.entries(openApi.paths ?? {})) {
  if (!pathItem || typeof pathItem !== 'object') continue;
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method.toLowerCase()) || !operation || typeof operation !== 'object') continue;
    const responses = operation.responses ?? {};
    const successEntry = Object.entries(responses).find(([status]) => /^2\d\d$/.test(status));
    const [status, success] = successEntry ?? ['200', {}];
    const parameters = [
      ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
      ...(Array.isArray(operation.parameters) ? operation.parameters : []),
    ];
    routes.push({
      method: method.toUpperCase(),
      path,
      operationId: operation.operationId ?? `${method.toLowerCase()} ${path}`,
      tags: Array.isArray(operation.tags) ? operation.tags : [],
      summary: typeof operation.summary === 'string' ? operation.summary : '',
      parameters,
      requestBodyRequired: operation.requestBody?.required === true,
      responseSchema: firstContentSchema(success),
      responseContentType: firstContentType(success),
      requestSchema: firstContentSchema(operation.requestBody),
      status: Number(status),
    });
  }
}

const routesSource = `// Generated from openapi.json for the mock API. Do not edit by hand.\n\nexport type MockRouteDefinition = {\n  method: string;\n  path: string;\n  operationId: string;\n  tags: string[];\n  summary: string;\n  parameters: readonly unknown[];\n  requestBodyRequired: boolean;\n  status: number;\n  responseSchema: unknown;\n  responseContentType: string | null;\n  requestSchema: unknown;\n};\n\nexport const mockRouteDefinitions = ${JSON.stringify(routes, null, 2)} as const satisfies readonly MockRouteDefinition[];\n`;
const schemasSource = `// Generated from openapi.json for the mock API. Do not edit by hand.\n\nexport const mockComponentSchemas = ${JSON.stringify(openApi.components?.schemas ?? {}, null, 2)} as const;\n`;

await Promise.all([
  writeFile(join(projectRoot, 'src', 'mock', 'routes.gen.ts'), routesSource),
  writeFile(join(projectRoot, 'src', 'mock', 'schemas.gen.ts'), schemasSource),
]);
process.stdout.write(
  `Generated ${routes.length} mock routes and ${Object.keys(openApi.components?.schemas ?? {}).length} component schemas.\n`,
);

function firstContentType(value) {
  if (!value || typeof value !== 'object') return null;
  const content = value.content;
  if (!content || typeof content !== 'object') return null;
  return Object.keys(content)[0] ?? null;
}

function firstContentSchema(value) {
  if (!value || typeof value !== 'object') return null;
  const content = value.content;
  if (!content || typeof content !== 'object') return null;
  for (const media of Object.values(content)) {
    if (media && typeof media === 'object' && media.schema !== undefined) return media.schema;
  }
  return null;
}
