import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { GeneratedFile } from '../generated-file.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

const SHAPES = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="shapes" nsURI="https://typemf.dev/test/shapes" nsPrefix="shp">
  <eClassifiers xsi:type="ecore:EClass" name="Shape"/>
  <eClassifiers xsi:type="ecore:EEnum" name="Color">
    <eLiterals name="RED"/>
  </eClassifiers>
</ecore:EPackage>
`;

/** References a class of shapes.ecore by name, an enum by position, and a class of Ecore. */
const DRAWING = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="drawing" nsURI="https://typemf.dev/test/drawing" nsPrefix="drw">
  <eClassifiers xsi:type="ecore:EClass" name="Canvas">
    <eStructuralFeatures xsi:type="ecore:EReference" name="shape" eType="ecore:EClass shapes.ecore#//Shape"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="color">
      <eType xsi:type="ecore:EEnum" href="shapes.ecore#//@eClassifiers.1"/>
    </eStructuralFeatures>
    <eStructuralFeatures xsi:type="ecore:EReference" name="element"
        eType="ecore:EClass http://www.eclipse.org/emf/2002/Ecore#//EModelElement"/>
  </eClassifiers>
</ecore:EPackage>
`;

const SHAPES_NS_URI = 'https://typemf.dev/test/shapes';

describe('references to classifiers of another .ecore file', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-package-imports-'));
    await writeFile(join(dir, 'shapes.ecore'), SHAPES, 'utf-8');
    await writeFile(join(dir, 'drawing.ecore'), DRAWING, 'utf-8');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const generateFile = async (name: string, packageImports: Record<string, string> = {}) =>
    generate(await loadEcorePackage(join(dir, `${name}.ecore`)), typescriptTemplateSet, {
      'package-imports': packageImports,
    });

  const content = (files: GeneratedFile[], path: string) => files.find((f) => f.path === path)!.content;

  async function writeAll(files: GeneratedFile[], folder: string, transform = false): Promise<string[]> {
    const paths: string[] = [];
    for (const file of files) {
      const path = join(dir, folder, transform ? file.path.replace(/\.ts$/, '.js') : file.path);
      const text = transform
        ? ts.transpileModule(file.content, {
            compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
          }).outputText
        : file.content;
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, text, 'utf-8');
      paths.push(path);
    }
    return paths;
  }

  it('imports the types of a package from its location relative to the generated package', async () => {
    const files = await generateFile('drawing', { [SHAPES_NS_URI]: '../shapes' });
    const api = content(files, 'types/Canvas.ts');
    expect(api).toContain("import { Color } from '../../shapes/types/Color.js';");
    expect(api).toContain("import { Shape } from '../../shapes/types/Shape.js';");
    expect(api).toContain("import { EModelElement, EObject } from '@typemf/core';");
    const packageImpl = content(files, 'impl/DrawingPackageImpl.ts');
    expect(packageImpl).toContain("import { ShapesPackageImpl } from '../../shapes/impl/ShapesPackageImpl.js';");
    expect(packageImpl).toContain('setEType(ShapesPackageImpl.eINSTANCE.getShape())');
  });

  it('imports everything from a module name', async () => {
    const files = await generateFile('drawing', { [SHAPES_NS_URI]: '@acme/shapes' });
    expect(content(files, 'types/Canvas.ts')).toContain("import { Color, Shape } from '@acme/shapes';");
    expect(content(files, 'impl/DrawingPackageImpl.ts')).toContain("import { ShapesPackageImpl } from '@acme/shapes';");
  });

  it('fails when the option has no entry for a referenced package', async () => {
    await expect(generateFile('drawing')).rejects.toThrow(
      `The package '${SHAPES_NS_URI}' is referenced, but the "package-imports" option has no entry for it.`
    );
  });

  it('rejects a supertype from another package', async () => {
    await writeFile(
      join(dir, 'drawing.ecore'),
      DRAWING.replace('name="Canvas">', 'name="Canvas" eSuperTypes="shapes.ecore#//Shape">'),
      'utf-8'
    );
    await expect(generateFile('drawing', { [SHAPES_NS_URI]: '../shapes' })).rejects.toThrow(
      'Canvas: the supertype Shape belongs to another package, which is not supported yet'
    );
  });

  it('type-checks and wires the types of the other package', async () => {
    const shapes = await generateFile('shapes');
    const drawing = await generateFile('drawing', { [SHAPES_NS_URI]: '../shapes' });

    const program = ts.createProgram([...(await writeAll(shapes, 'shapes')), ...(await writeAll(drawing, 'drawing'))], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);

    // Folders next to each other, like the TypeScript files, so the relative imports hold.
    await writeAll(shapes, 'js/shapes', true);
    await writeAll(drawing, 'js/drawing', true);
    const drawingPkg = (await import(join(dir, 'js/drawing/impl/DrawingPackageImpl.js'))).DrawingPackageImpl.eINSTANCE;
    const shapesPkg = (await import(join(dir, 'js/shapes/impl/ShapesPackageImpl.js'))).ShapesPackageImpl.eINSTANCE;
    expect(drawingPkg.getCanvas_Shape().getEType()).toBe(shapesPkg.getShape());
    expect(drawingPkg.getCanvas_Color().getEType()).toBe(shapesPkg.getColor());
  });
});
