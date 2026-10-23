import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { summarizeModel } from '../model-summary.js';

const SHAPES = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="shapes" nsURI="https://typemf.dev/test/shapes" nsPrefix="shp">
  <eClassifiers xsi:type="ecore:EClass" name="Shape"/>
  <eClassifiers xsi:type="ecore:EDataType" name="Point" instanceClassName="Point"/>
</ecore:EPackage>
`;

const DRAWING = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="drawing" nsURI="https://typemf.dev/test/drawing" nsPrefix="drw">
  <eClassifiers xsi:type="ecore:EDataType" name="Id" instanceClassName="string"/>
  <eClassifiers xsi:type="ecore:EClass" name="Canvas">
    <eStructuralFeatures xsi:type="ecore:EReference" name="shape" eType="ecore:EClass shapes.ecore#//Shape"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="origin" eType="ecore:EDataType shapes.ecore#//Point"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="id" eType="#//Id"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="label"
        eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
  </eClassifiers>
</ecore:EPackage>
`;

describe('summarizeModel', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-summary-test-'));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'shapes.ecore'), SHAPES);
    await writeFile(join(dir, 'drawing.ecore'), DRAWING);
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('lists the referenced packages without Ecore, and the data types declared and used', async () => {
    const summary = summarizeModel(await loadEcorePackage(join(dir, 'drawing.ecore')));
    expect(summary).toEqual({
      name: 'drawing',
      nsURI: 'https://typemf.dev/test/drawing',
      referencedPackages: ['https://typemf.dev/test/shapes'],
      dataTypes: [
        'http://www.eclipse.org/emf/2002/Ecore#EString',
        'https://typemf.dev/test/drawing#Id',
        'https://typemf.dev/test/shapes#Point',
      ],
    });
  });

  it('has no referenced packages for a self-contained model', async () => {
    const summary = summarizeModel(await loadEcorePackage(join(dir, 'shapes.ecore')));
    expect(summary.referencedPackages).toEqual([]);
    expect(summary.dataTypes).toEqual(['https://typemf.dev/test/shapes#Point']);
  });
});
