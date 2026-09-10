import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const openApiPath = join(projectRoot, 'openapi.json');
const routesPath = join(projectRoot, 'src', 'mock', 'routes.gen.ts');
const schemasPath = join(projectRoot, 'src', 'mock', 'schemas.gen.ts');
const HTTP_METHODS = new Set(['delete', 'get', 'head', 'options', 'patch', 'post', 'put', 'trace']);

try {
  const [openApiSource, routesSource, schemasSource] = await Promise.all([
    readFile(openApiPath, 'utf8'),
    readFile(routesPath, 'utf8'),
    readFile(schemasPath, 'utf8'),
  ]);
  const openApi = JSON.parse(openApiSource);
  const generatedRoutes = parseGeneratedConstant(routesSource, 'mockRouteDefinitions');
  const generatedSchemas = parseGeneratedConstant(schemasSource, 'mockComponentSchemas');

  if (!Array.isArray(generatedRoutes)) {
    throw new TypeError('mockRouteDefinitions must be an array.');
  }
  if (!isPlainObject(generatedSchemas)) {
    throw new TypeError('mockComponentSchemas must be an object.');
  }

  const expectedRoutes = collectOpenApiRoutes(openApi);
  const actualRoutes = generatedRoutes.map((route, index) => {
    if (
      !isPlainObject(route) ||
      typeof route.method !== 'string' ||
      typeof route.path !== 'string'
    ) {
      throw new TypeError(
        `mockRouteDefinitions[${index}] must contain string method and path fields.`,
      );
    }
    return `${route.method.toUpperCase()} ${route.path}`;
  });

  const failures = [];
  const duplicateRoutes = duplicates(actualRoutes);
  const missingRoutes = difference(expectedRoutes, actualRoutes);
  const unexpectedRoutes = difference(actualRoutes, expectedRoutes);

  if (duplicateRoutes.length > 0) {
    failures.push(`duplicate generated routes: ${formatList(duplicateRoutes)}`);
  }
  if (missingRoutes.length > 0) {
    failures.push(`routes missing from routes.gen.ts: ${formatList(missingRoutes)}`);
  }
  if (unexpectedRoutes.length > 0) {
    failures.push(`routes absent from openapi.json: ${formatList(unexpectedRoutes)}`);
  }

  const expectedSchemas = openApi.components?.schemas ?? {};
  if (!isPlainObject(expectedSchemas)) {
    failures.push('openapi.json components.schemas must be an object when present');
  } else {
    const schemaDifference = findDifference(
      expectedSchemas,
      generatedSchemas,
      'components.schemas',
    );
    if (schemaDifference) failures.push(`schema metadata differs at ${schemaDifference}`);
  }

  if (failures.length > 0) {
    throw new Error(
      `Mock metadata drift detected:\n- ${failures.sort(stringCompare).join('\n- ')}`,
    );
  }

  process.stdout.write(
    `Verified ${expectedRoutes.length} mock routes and ${Object.keys(expectedSchemas).length} component schemas against openapi.json.\n`,
  );
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

function collectOpenApiRoutes(openApi) {
  if (!isPlainObject(openApi.paths)) throw new TypeError('openapi.json paths must be an object.');
  const routes = [];
  for (const path of Object.keys(openApi.paths).sort(stringCompare)) {
    const pathItem = openApi.paths[path];
    if (!isPlainObject(pathItem)) continue;
    for (const method of Object.keys(pathItem).sort(stringCompare)) {
      if (HTTP_METHODS.has(method.toLowerCase())) routes.push(`${method.toUpperCase()} ${path}`);
    }
  }
  return routes.sort(stringCompare);
}

function parseGeneratedConstant(source, name) {
  const declaration = `export const ${name}`;
  const declarationIndex = source.indexOf(declaration);
  if (declarationIndex === -1) throw new Error(`Unable to find ${declaration}.`);
  const equalsIndex = source.indexOf('=', declarationIndex + declaration.length);
  if (equalsIndex === -1) throw new Error(`Unable to find the initializer for ${name}.`);

  let start = equalsIndex + 1;
  while (/\s/.test(source[start] ?? '')) start += 1;
  const opening = source[start];
  if (opening !== '[' && opening !== '{') {
    throw new Error(`${name} must use a JSON-shaped array or object initializer.`);
  }

  const stack = [];
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === '[' || character === '{') stack.push(character);
    else if (character === ']' || character === '}') {
      const expectedOpening = character === ']' ? '[' : '{';
      if (stack.pop() !== expectedOpening) throw new Error(`Unbalanced initializer for ${name}.`);
      if (stack.length === 0) {
        try {
          return JSON.parse(source.slice(start, index + 1));
        } catch (error) {
          throw new Error(`${name} is not a JSON-shaped initializer.`, { cause: error });
        }
      }
    }
  }
  throw new Error(`Unterminated initializer for ${name}.`);
}

function findDifference(expected, actual, path) {
  if (Object.is(expected, actual)) return undefined;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) return `${path} (expected array, received ${describe(actual)})`;
    if (expected.length !== actual.length) {
      return `${path}.length (expected ${expected.length}, received ${actual.length})`;
    }
    for (let index = 0; index < expected.length; index += 1) {
      const difference = findDifference(expected[index], actual[index], `${path}[${index}]`);
      if (difference) return difference;
    }
    return undefined;
  }
  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) return `${path} (expected object, received ${describe(actual)})`;
    const expectedKeys = Object.keys(expected).sort(stringCompare);
    const actualKeys = Object.keys(actual).sort(stringCompare);
    const missingKeys = difference(expectedKeys, actualKeys);
    if (missingKeys.length > 0) return `${path}.${missingKeys[0]} (missing)`;
    const extraKeys = difference(actualKeys, expectedKeys);
    if (extraKeys.length > 0) return `${path}.${extraKeys[0]} (unexpected)`;
    for (const key of expectedKeys) {
      const difference = findDifference(expected[key], actual[key], `${path}.${key}`);
      if (difference) return difference;
    }
    return undefined;
  }
  return `${path} (expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)})`;
}

function difference(left, right) {
  const rightSet = new Set(right);
  return [...new Set(left.filter((value) => !rightSet.has(value)))].sort(stringCompare);
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort(stringCompare);
}

function formatList(values) {
  const maximum = 20;
  const visible = values.slice(0, maximum).join(', ');
  return values.length > maximum ? `${visible}, ... (${values.length - maximum} more)` : visible;
}

function stringCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function describe(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
