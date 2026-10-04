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
const GENMODEL = 'http://www.eclipse.org/emf/2002/GenModel';

const op = (name: string, ...annotations: Array<[string, string]>) => `
    <eOperations name="${name}" lowerBound="1" eType="#//EString">
${annotations
  .map(
    ([source, body]) => `      <eAnnotations source="${source}"><details key="body" value="${body}"/></eAnnotations>`
  )
  .join('\n')}
    </eOperations>`;

/** An .ecore file with operation bodies in both annotation sources. */
const ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="bodies" nsURI="https://typemf.dev/test/bodies" nsPrefix="bod">
  <eClassifiers xsi:type="ecore:EDataType" name="EString" instanceClassName="java.lang.String">
    <eAnnotations source="${GENERATOR}"><details key="type" value="string"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="title" eType="#//EString"/>${op('onlyGenerator', [GENERATOR, "return (this.getTitle() ?? '') + '!';"])}${op('onlyGenModel', [GENMODEL, "return 'from-genmodel';"])}${op('both', [GENMODEL, "return 'genmodel-loses';"], [GENERATOR, "return 'typemf-wins';"])}${op('emptyFirst', [GENERATOR, ''], [GENMODEL, "return 'genmodel-fallback';"])}${op('neither')}${op('multiLine', [GENERATOR, "if ((this.getTitle() ?? '') === '') {&#10;  return 'untitled';&#10;}&#10;return this.getTitle() + '!';"])}
  </eClassifiers>
</ecore:EPackage>
`;

describe('operation bodies from an .ecore file', () => {
  let dir: string;
  let outDir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-bodies-'));
    outDir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-bodies-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  });

  async function generateFromFile() {
    const path = join(dir, 'bodies.ecore');
    await writeFile(path, ECORE, 'utf-8');
    return generate(await loadEcorePackage(path), typescriptTemplateSet, {});
  }

  it('uses the body of the generator annotation', async () => {
    const impl = (await generateFromFile()).find((f) => f.path === 'impl/BookImpl.ts')!.content;
    expect(impl).toContain("return (this.getTitle() ?? '') + '!';");
  });

  it('uses the GenModel body when there is no generator body', async () => {
    const impl = (await generateFromFile()).find((f) => f.path === 'impl/BookImpl.ts')!.content;
    expect(impl).toContain("return 'from-genmodel';");
  });

  it('prefers the generator body over the GenModel body', async () => {
    const impl = (await generateFromFile()).find((f) => f.path === 'impl/BookImpl.ts')!.content;
    expect(impl).toContain("return 'typemf-wins';");
    expect(impl).not.toContain('genmodel-loses');
  });

  it('falls back to the GenModel body when the generator body is empty', async () => {
    const impl = (await generateFromFile()).find((f) => f.path === 'impl/BookImpl.ts')!.content;
    expect(impl).toContain("return 'genmodel-fallback';");
  });

  it('generates a throwing stub that names the missing annotation when there is no body', async () => {
    const impl = (await generateFromFile()).find((f) => f.path === 'impl/BookImpl.ts')!.content;
    expect(impl).toMatch(
      /neither\(\): string \{\s+throw new Error\('Book\.neither\(\) has no `body` annotation - nothing to generate\.'\);/
    );
  });

  it('indents a multi-line body as a whole', async () => {
    const impl = (await generateFromFile()).find((f) => f.path === 'impl/BookImpl.ts')!.content;
    expect(impl).toContain(
      "  multiLine(): string {\n    if ((this.getTitle() ?? '') === '') {\n      return 'untitled';\n    }\n    return this.getTitle() + '!';\n  }"
    );
  });

  it('type-checks', async () => {
    const files = await generateFromFile();
    for (const file of files) {
      const tsPath = join(outDir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }
    const program = ts.createProgram(
      files.map((f) => join(outDir, f.path)),
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
      getCurrentDirectory: () => outDir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    expect(diagnostics, formatted).toHaveLength(0);
  });
});
