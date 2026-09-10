import { spawn } from 'node:child_process';
import { access, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { clearTimeout, setTimeout } from 'node:timers';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
const results = new Map();
let temporaryDirectory;

try {
  const currentManifest = await readManifest(projectRoot);
  await checkPackage('current dist', projectRoot, currentManifest);

  temporaryDirectory = await mkdtemp(join(tmpdir(), 'leaddocket-package-contract-'));
  const packedRoot = await packAndExtract(temporaryDirectory);
  await linkDependencies(packedRoot);
  const packedManifest = await readManifest(packedRoot);

  checkEqual('packed package name', packedManifest.name, currentManifest.name);
  checkEqual('packed package version', packedManifest.version, currentManifest.version);
  checkEqual('packed exports contract', packedManifest.exports, currentManifest.exports);
  checkEqual('packed bin contract', packedManifest.bin, currentManifest.bin);
  await checkPackage('packed package', packedRoot, packedManifest);
  compareCurrentAndPacked();

  if (failures.length > 0) {
    process.stderr.write(
      `Package contract check failed (${failures.length}):\n- ${[...new Set(failures)].sort(stringCompare).join('\n- ')}\n`,
    );
    process.exitCode = 1;
  } else {
    const exportCount = [...results.entries()]
      .filter(([key]) => key.startsWith('packed package:') && key.endsWith(':esm'))
      .reduce((count, [, value]) => count + value.length, 0);
    process.stdout.write(
      `Verified current and packed CJS/ESM contracts (${exportCount} runtime exports), package assets, mock server, faker, and CLI.\n`,
    );
  }
} catch (error) {
  process.stderr.write(`Package contract check could not complete: ${cleanError(error)}\n`);
  process.exitCode = 1;
} finally {
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
}

async function checkPackage(label, root, manifest) {
  const entries = packageEntries(manifest, root);
  for (const requiredSubpath of ['.', './mock/server', './mock/faker']) {
    if (!entries.some((entry) => entry.subpath === requiredSubpath)) {
      failures.push(`${label} does not expose required subpath ${requiredSubpath}`);
    }
  }

  const declarationPaths = [];
  for (const entry of entries) {
    for (const format of ['esm', 'cjs']) {
      const variant = entry[format];
      if (!variant.runtimePath) {
        failures.push(`${label} ${entry.subpath} has no ${format.toUpperCase()} runtime target`);
      } else if (!(await exists(variant.runtimePath))) {
        failures.push(
          `${label} ${entry.subpath} is missing ${displayPath(root, variant.runtimePath)}`,
        );
      }
      if (!variant.typesPath) {
        failures.push(
          `${label} ${entry.subpath} has no ${format.toUpperCase()} declaration target`,
        );
      } else if (!(await exists(variant.typesPath))) {
        failures.push(
          `${label} ${entry.subpath} is missing ${displayPath(root, variant.typesPath)}`,
        );
      } else {
        declarationPaths.push(variant.typesPath);
      }
    }
  }

  const documented = await declarationExports(declarationPaths);
  const probes = [];
  for (const entry of entries) {
    for (const format of ['esm', 'cjs']) {
      const variant = entry[format];
      if (!variant.runtimePath || !(await exists(variant.runtimePath))) continue;
      probes.push(
        smokeModule({
          label: `${label} ${entry.subpath} ${format.toUpperCase()}`,
          packageRoot: root,
          modulePath: variant.runtimePath,
          format,
          action: smokeAction(entry.subpath),
        }).then(
          (runtimeExports) => ({ entry, format, variant, runtimeExports }),
          (error) => {
            failures.push(cleanError(error));
            return undefined;
          },
        ),
      );
    }
  }

  const probeResults = (await Promise.all(probes)).filter(Boolean);
  for (const { entry, format, variant, runtimeExports } of probeResults) {
    const key = resultKey(label, entry.subpath, format);
    results.set(key, runtimeExports);
    const documentedExports = variant.typesPath ? documented.get(variant.typesPath) : undefined;
    if (documentedExports) {
      const undocumented = setDifference(runtimeExports, documentedExports);
      if (undocumented.length > 0) {
        failures.push(
          `${label} ${entry.subpath} ${format.toUpperCase()} has undocumented exports: ${undocumented.join(', ')}`,
        );
      }
    }
  }

  for (const entry of entries) {
    const esmExports = results.get(resultKey(label, entry.subpath, 'esm'));
    const cjsExports = results.get(resultKey(label, entry.subpath, 'cjs'));
    if (esmExports && cjsExports) {
      reportSetDifference(
        `${label} ${entry.subpath} ESM`,
        esmExports,
        `${label} ${entry.subpath} CJS`,
        cjsExports,
      );
    }
  }

  await checkBins(label, root, manifest.bin);
}

function packageEntries(manifest, root) {
  if (!manifest.exports || typeof manifest.exports !== 'object') {
    throw new TypeError('package.json exports must be an object.');
  }
  const entries = [];
  for (const [subpath, contract] of Object.entries(manifest.exports).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (subpath.includes('*')) {
      failures.push(`package export patterns are not supported by this check: ${subpath}`);
      continue;
    }
    entries.push({
      subpath,
      esm: packageVariant(root, contract, 'import'),
      cjs: packageVariant(root, contract, 'require'),
    });
  }
  return entries;
}

function packageVariant(root, contract, condition) {
  const conditional =
    isObject(contract) && contract[condition] !== undefined ? contract[condition] : contract;
  const runtimeTarget = conditionalTarget(conditional, 'default');
  const typesTarget =
    conditionalTarget(conditional, 'types') ??
    (isObject(contract) ? conditionalTarget(contract, 'types') : undefined);
  return {
    runtimePath: runtimeTarget ? safePackagePath(root, runtimeTarget) : undefined,
    typesPath: typesTarget ? safePackagePath(root, typesTarget) : undefined,
  };
}

function conditionalTarget(value, preferredCondition) {
  if (typeof value === 'string') return preferredCondition === 'default' ? value : undefined;
  if (!isObject(value)) return undefined;
  if (typeof value[preferredCondition] === 'string') return value[preferredCondition];
  if (preferredCondition === 'default') {
    for (const candidate of Object.values(value)) {
      if (typeof candidate === 'string') return candidate;
    }
  }
  return undefined;
}

function safePackagePath(root, target) {
  if (typeof target !== 'string' || !target.startsWith('./')) {
    throw new TypeError(`Package target must be relative and start with ./: ${String(target)}`);
  }
  const path = resolve(root, target);
  const relativePath = relative(root, path);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new TypeError(`Package target escapes the package root: ${target}`);
  }
  return path;
}

async function declarationExports(paths) {
  const exportsByPath = new Map();
  await Promise.all(
    [...new Set(paths)].map(async (path) => {
      const source = await readFile(path, 'utf8');
      const names = new Set();
      const declarationPattern =
        /\bexport\s+(?:declare\s+)?(?:abstract\s+)?(?:class|enum|function|interface|type|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
      for (const match of source.matchAll(declarationPattern)) names.add(match[1]);

      const exportListPattern = /\bexport\s*\{([\s\S]*?)\}\s*(?:from\s*['"][^'"]+['"]\s*)?;/g;
      for (const match of source.matchAll(exportListPattern)) {
        for (const specifier of match[1].split(',')) {
          const normalized = specifier.trim().replace(/^type\s+/, '');
          if (!normalized) continue;
          const parts = normalized.split(/\s+as\s+/);
          const exportedName = parts.at(-1)?.trim();
          if (/^[A-Za-z_$][\w$]*$/.test(exportedName ?? '')) names.add(exportedName);
        }
      }
      exportsByPath.set(path, [...names].sort(stringCompare));
    }),
  );
  return exportsByPath;
}

async function smokeModule(specification) {
  const command = await runCommand(
    process.execPath,
    ['--input-type=module', '--eval', smokeRunnerSource(), JSON.stringify(specification)],
    {
      cwd: specification.packageRoot,
      label: specification.label,
      timeoutMs: specification.action === 'server' ? 15_000 : 8_000,
    },
  );
  try {
    const result = JSON.parse(command.stdout.trim());
    if (
      !Array.isArray(result.exports) ||
      !result.exports.every((name) => typeof name === 'string')
    ) {
      throw new TypeError('invalid smoke output');
    }
    return result.exports.sort(stringCompare);
  } catch (error) {
    throw new Error(`${specification.label} returned invalid smoke output`, { cause: error });
  }
}

async function checkBins(label, root, bin) {
  const bins = typeof bin === 'string' ? { cli: bin } : bin;
  if (!isObject(bins) || Object.keys(bins).length === 0) {
    failures.push(`${label} does not declare a CLI bin`);
    return;
  }
  for (const [name, target] of Object.entries(bins).sort(([a], [b]) => a.localeCompare(b))) {
    if (typeof target !== 'string') {
      failures.push(`${label} bin ${name} does not have a string target`);
      continue;
    }
    const binPath = safePackagePath(root, target);
    if (!(await exists(binPath))) {
      failures.push(`${label} bin ${name} is missing ${displayPath(root, binPath)}`);
      continue;
    }
    try {
      const command = await runCommand(process.execPath, [binPath, '--help'], {
        cwd: root,
        label: `${label} bin ${name} --help`,
        timeoutMs: 8_000,
      });
      if (!command.stdout.includes('Usage:') || !command.stdout.includes('leaddocket-mock')) {
        failures.push(`${label} bin ${name} --help did not print the expected usage`);
      }
    } catch (error) {
      failures.push(cleanError(error));
    }
  }
}

async function packAndExtract(directory) {
  const packed = await runCommand(
    'pnpm',
    ['--config.ignore-scripts=true', 'pack', '--json', '--pack-destination', directory],
    { cwd: projectRoot, label: 'pnpm pack (lifecycle scripts disabled)', timeoutMs: 60_000 },
  );
  let metadata;
  try {
    metadata = JSON.parse(packed.stdout);
  } catch (error) {
    throw new Error('pnpm pack did not return JSON metadata.', { cause: error });
  }
  const filename = metadata?.filename;
  if (typeof filename !== 'string') throw new Error('pnpm pack did not report a tarball filename.');
  const tarballPath = isAbsolute(filename) ? filename : join(directory, filename);
  await runCommand('tar', ['-xzf', tarballPath, '-C', directory], {
    cwd: projectRoot,
    label: 'extract packed package',
    timeoutMs: 30_000,
  });
  const packedRoot = join(directory, 'package');
  if (!(await exists(join(packedRoot, 'package.json')))) {
    throw new Error('Extracted package does not contain package.json.');
  }
  return packedRoot;
}

async function linkDependencies(packedRoot) {
  const source = join(projectRoot, 'node_modules');
  if (!(await exists(source))) {
    throw new Error(
      'node_modules is required to smoke-test the packed package without network access.',
    );
  }
  await symlink(source, join(packedRoot, 'node_modules'), 'dir');
}

function compareCurrentAndPacked() {
  for (const [key, currentExports] of results) {
    if (!key.startsWith('current dist:')) continue;
    const packedKey = key.replace('current dist:', 'packed package:');
    const packedExports = results.get(packedKey);
    if (packedExports) {
      reportSetDifference(key, currentExports, packedKey, packedExports);
    }
  }
}

function reportSetDifference(leftLabel, left, rightLabel, right) {
  const leftOnly = setDifference(left, right);
  const rightOnly = setDifference(right, left);
  if (leftOnly.length > 0)
    failures.push(`${leftLabel} has undocumented/unmatched exports: ${leftOnly.join(', ')}`);
  if (rightOnly.length > 0)
    failures.push(`${leftLabel} is missing exports from ${rightLabel}: ${rightOnly.join(', ')}`);
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return [...new Set(left.filter((value) => !rightSet.has(value)))].sort(stringCompare);
}

function stringCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function smokeAction(subpath) {
  if (subpath === '.') return 'root';
  if (subpath === './mock/server') return 'server';
  if (subpath === './mock/faker') return 'faker';
  return 'import';
}

function resultKey(label, subpath, format) {
  return `${label}:${subpath}:${format}`;
}

async function readManifest(root) {
  return JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
}

function checkEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    failures.push(`${label} differs from the source package`);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function displayPath(root, path) {
  return relative(root, path).split('\\').join('/');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replaceAll(projectRoot, '<project>')
    .replace(/\/[^\s]*leaddocket-package-contract-[^\s/]*/g, '<temporary-package>')
    .replace(/\s+/g, ' ')
    .trim();
}

function runCommand(command, args, { cwd, label, timeoutMs }) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      rejectPromise(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.once('error', (error) => {
      clearTimeout(timer);
      rejectPromise(new Error(`${label} could not start: ${error.message}`));
    });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }
      const detail = stderr.trim() || stdout.trim() || `exit ${code ?? signal}`;
      rejectPromise(new Error(`${label} failed: ${detail}`));
    });
  });
}

function smokeRunnerSource() {
  return String.raw`
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const specification = JSON.parse(process.argv[1]);
let server;
try {
  const module = specification.format === 'esm'
    ? await import(pathToFileURL(specification.modulePath).href)
    : createRequire(import.meta.url)(specification.modulePath);
  const exports = Object.keys(module).sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );

  if (specification.action === 'root') {
    if (typeof module.createLeadDocketMockApi !== 'function' || typeof module.client !== 'object') {
      throw new Error('root entry point is missing expected runtime APIs');
    }
  } else if (specification.action === 'faker') {
    if (typeof module.generateLeadDocketMockData !== 'function') {
      throw new Error('faker entry point is missing generateLeadDocketMockData');
    }
    const data = module.generateLeadDocketMockData({
      seed: 42,
      contacts: 1,
      leads: 1,
      opportunities: 1,
      tasks: 1,
      messages: 1,
      users: 1,
    });
    if (data.contacts.length !== 1 || data.leads[0].ContactId !== data.contacts[0].Id) {
      throw new Error('faker entry point returned invalid relational data');
    }
  } else if (specification.action === 'server') {
    if (typeof module.startLeadDocketMockServer !== 'function') {
      throw new Error('server entry point is missing startLeadDocketMockServer');
    }
    server = await module.startLeadDocketMockServer({ port: 0 });
    const request = (path) => fetch(server.origin + path, { signal: AbortSignal.timeout(5_000) });
    const docs = await request('/');
    if (!docs.ok || !(await docs.text()).includes('Lead Docket Mock Server')) {
      throw new Error('mock server docs smoke test failed');
    }
    const openApi = await request('/openapi.json');
    const document = await openApi.json();
    if (!openApi.ok || !document.paths || !document.components) {
      throw new Error('packaged openapi.json smoke test failed');
    }
    const swagger = await request('/__swagger/swagger-ui.css');
    if (!swagger.ok || !(swagger.headers.get('content-type') || '').includes('text/css')) {
      throw new Error('Swagger UI asset smoke test failed');
    }
    const admin = await request('/__mock/');
    if (!admin.ok || !(await admin.text()).includes('Lead Docket Mock')) {
      throw new Error('mock admin asset smoke test failed');
    }
  }

  process.stdout.write(JSON.stringify({ exports }));
} catch (error) {
  process.stderr.write(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (server) await server.close();
}
`;
}
