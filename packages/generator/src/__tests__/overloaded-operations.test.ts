import { EClassImpl, EDataTypeImpl, EOperationImpl, EPackageImpl, EParameterImpl } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * Two EOperations sharing a name, same arity, different parameter types -
 * exactly the real Ecore.ecore shape (EEnum.getEEnumLiteral by name vs by
 * value). Neither has a body:typescript annotation, matching real
 * Ecore.ecore's own operations too.
 */
function buildOverloadMetamodel() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const eInt = new EDataTypeImpl();
  eInt.setName('EInt');
  const eWidget = new EClassImpl();
  eWidget.setName('Widget');

  const byName = new EOperationImpl();
  byName.setName('find');
  byName.setEType(eWidget);
  const nameParam = new EParameterImpl();
  nameParam.setName('name');
  nameParam.setEType(eString);
  byName.getEParameters().add(nameParam);
  eWidget.getEOperations().add(byName);

  const byValue = new EOperationImpl();
  byValue.setName('find');
  byValue.setEType(eWidget);
  const valueParam = new EParameterImpl();
  valueParam.setName('value');
  valueParam.setEType(eInt);
  byValue.getEParameters().add(valueParam);
  eWidget.getEOperations().add(byValue);

  const pkg = new EPackageImpl();
  pkg.setName('overloadtest');
  pkg.setNsURI('https://typemf.dev/test/overload');
  pkg.setNsPrefix('overload');
  pkg.getEClassifiers().add(eString);
  pkg.getEClassifiers().add(eInt);
  pkg.getEClassifiers().add(eWidget);
  for (const c of pkg.getEClassifiers()) c.setEPackage(pkg);

  return { pkg };
}

describe('overloaded EOperations (same name, same arity) - real compilation', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-overload-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generates two overload signatures plus one merged implementation signature, and it type-checks with zero errors', async () => {
    const { pkg } = buildOverloadMetamodel();
    const files = generate(pkg, typescriptTemplateSet, {});

    const widgetImpl = files.find((f) => f.path === 'impl/WidgetImpl.ts')!;
    // Two bodyless overload signatures...
    expect(widgetImpl.content).toContain('find(name: string): Widget | undefined;');
    expect(widgetImpl.content).toContain('find(value: number): Widget | undefined;');
    // ...and exactly one implementation, with the merged, union-typed
    // parameter name/type - not two separate method bodies (which is
    // exactly what was invalid before this fix).
    expect(widgetImpl.content).toContain('find(nameOrValue: string | number): Widget | undefined {');
    expect(widgetImpl.content).toContain('is overloaded with no body:typescript annotation');

    // The interface side needs no special handling - TS interfaces
    // support overloads natively.
    const widgetTypes = files.find((f) => f.path === 'types/Widget.ts')!;
    expect(widgetTypes.content).toContain('find(name: string): Widget | undefined;');
    expect(widgetTypes.content).toContain('find(value: number): Widget | undefined;');

    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }

    const program = ts.createProgram(
      files.map((f) => join(dir, f.path)),
      {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noEmit: true,
      }
    );
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => dir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    expect(diagnostics, formatted).toHaveLength(0);
  });
});
