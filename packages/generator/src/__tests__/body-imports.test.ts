import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

const GENERATOR = 'https://typemf.dev/generator';
const IMPORT = 'https://typemf.dev/generator/import';

const importOf = (type: string, details: { from?: string; internalFrom?: string }) =>
  `<eAnnotations source="${IMPORT}"><details key="type" value="${type}"/>` +
  (details.from !== undefined ? `<details key="from" value="${details.from}"/>` : '') +
  (details.internalFrom !== undefined ? `<details key="internal-from" value="${details.internalFrom}"/>` : '') +
  '</eAnnotations>';

const op = (name: string, body: string | undefined, ...imports: string[]) => `
    <eOperations name="${name}" lowerBound="1" eType="#//EString">
      ${body !== undefined ? `<eAnnotations source="${GENERATOR}"><details key="body" value="${body}"/></eAnnotations>` : ''}
      ${imports.join('\n      ')}
    </eOperations>`;

const model = (...ops: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="imports" nsURI="https://typemf.dev/test/imports" nsPrefix="imp">
  <eClassifiers xsi:type="ecore:EDataType" name="EString" instanceClassName="java.lang.String">
    <eAnnotations source="${GENERATOR}"><details key="type" value="string"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="title" eType="#//EString"/>${ops.join('')}
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Author">${ops.slice(0, 1).join('')}
  </eClassifiers>
</ecore:EPackage>
`;

describe('operation body imports, declared with the import annotation on the operation', () => {
  let dir: string;
  let outDir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-bodyimports-'));
    outDir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-bodyimports-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  });

  async function generated(xml: string, options: Record<string, unknown> = {}) {
    const path = join(dir, 'imports.ecore');
    await writeFile(path, xml, 'utf-8');
    const files = generate(await loadEcorePackage(path), typescriptTemplateSet, options);
    return { files, content: (p: string) => files.find((f) => f.path === p)!.content };
  }

  it('an import annotation on an operation registers an import in the file that contains its body - internal-from, relative to the folder', async () => {
    const { content } = await generated(model(op('shout', "return helper(this.getTitle() ?? '');", importOf('helper', { from: 'my-lib', internalFrom: './util/Helper' }))));
    expect(content('impl/BookImpl.ts')).toContain("import { helper } from '../util/Helper';");
    expect(content('impl/BookImpl.ts')).toContain("return helper(this.getTitle() ?? '');");
  });

  it('an operation can declare several imports: one annotation per import', async () => {
    const { content } = await generated(
      model(
        op(
          'both',
          'return helper(new Other().label);',
          importOf('helper', { internalFrom: './util/Helper' }),
          importOf('Other', { internalFrom: './util/Other' })
        )
      )
    );
    const impl = content('impl/BookImpl.ts');
    expect(impl).toContain("import { helper } from '../util/Helper';");
    expect(impl).toContain("import { Other } from '../util/Other';");
    expect(impl).toContain('return helper(new Other().label);');
  });

  it('without internal-from it falls back to from (a body only ever belongs to the package being generated)', async () => {
    const { content } = await generated(model(op('viaLib', 'return ext();', importOf('ext', { from: 'ext-lib' }))));
    expect(content('impl/BookImpl.ts')).toContain("import { ext } from 'ext-lib';");
  });

  it('the same symbol requested by several operations is imported once', async () => {
    const helper = importOf('helper', { internalFrom: './util/Helper' });
    const { content } = await generated(model(op('a', "return helper('a');", helper), op('b', "return helper('b');", helper)));
    expect(content('impl/BookImpl.ts').match(/import \{[^}]*\bhelper\b[^}]*\}/g)).toHaveLength(1);
    expect(content('impl/BookImpl.ts')).toContain("return helper('a');");
    expect(content('impl/BookImpl.ts')).toContain("return helper('b');");
  });

  it('only files that emit the body get the import: not the interface, not other classes\' files', async () => {
    const { files, content } = await generated(model(op('shout', "return helper('x');", importOf('helper', { internalFrom: './util/Helper' }))));
    expect(content('types/Book.ts')).not.toContain('helper');
    // Author has an operation too (the first one is reused there): its own impl gets it, unrelated files do not.
    expect(content('impl/AuthorImpl.ts')).toContain("import { helper } from '../util/Helper';");
    for (const path of ['impl/BookFactoryImpl.ts', 'impl/ImportsPackageImpl.ts', 'ImportsPackage.ts']) {
      if (files.some((f) => f.path === path)) expect(content(path), path).not.toMatch(/import \{[^}]*\bhelper\b/);
    }
  });

  it('an operation with NO body (the throwing stub) imports nothing, even if it declares imports', async () => {
    const { content } = await generated(model(op('stubbed', undefined, importOf('helper', { internalFrom: './util/Helper' }))));
    expect(content('impl/BookImpl.ts')).toContain('has no `body` annotation');
    expect(content('impl/BookImpl.ts')).not.toContain('helper');
  });

  it('an import annotation without a `type` is ignored, like everywhere else', async () => {
    const { content } = await generated(
      model(op('noType', "return 'x';", `<eAnnotations source="${IMPORT}"><details key="internal-from" value="./util/Nothing"/></eAnnotations>`))
    );
    expect(content('impl/BookImpl.ts')).not.toContain('Nothing');
  });

  it('a symbol two bodies want from DIFFERENT modules is a reported collision', async () => {
    await expect(
      generated(
        model(
          op('a', "return helper('a');", importOf('helper', { internalFrom: './util/One' })),
          op('b', "return helper('b');", importOf('helper', { internalFrom: './util/Two' }))
        )
      )
    ).rejects.toThrow(/"helper" was requested from/);
  });

  it('the generated code, bodies and their imports included, type-checks with zero errors', async () => {
    const { files } = await generated(
      model(
        op('shout', 'return helper(new Other().label);', importOf('helper', { internalFrom: './util/Helper' }), importOf('Other', { internalFrom: './util/Other' }))
      )
    );
    for (const file of files) {
      const tsPath = join(outDir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }
    await mkdir(join(outDir, 'util'), { recursive: true });
    await writeFile(join(outDir, 'util', 'Helper.ts'), 'export function helper(s: string): string { return s.toUpperCase(); }\n', 'utf-8');
    await writeFile(join(outDir, 'util', 'Other.ts'), "export class Other { label = 'x'; }\n", 'utf-8');

    const program = ts.createProgram([...files.map((f) => join(outDir, f.path)), join(outDir, 'util', 'Helper.ts'), join(outDir, 'util', 'Other.ts')], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => outDir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    expect(diagnostics, formatted).toHaveLength(0);
  });
});
