import { detailValue, EAttribute, EClass, EClassifier, EReference } from '@typemf/core';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';

/** Loads fixtures/Ecore.ecore and checks that the typed EPackage carries everything the file declares. */

const FIXTURE_PATH = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');

const ECLASS_NAMES = [
  'EAttribute',
  'EAnnotation',
  'EClass',
  'EClassifier',
  'EDataType',
  'EEnum',
  'EEnumLiteral',
  'EFactory',
  'EModelElement',
  'ENamedElement',
  'EObject',
  'EOperation',
  'EPackage',
  'EParameter',
  'EReference',
  'EStructuralFeature',
  'ETypedElement',
  'EStringToStringMapEntry',
  'EGenericType',
  'ETypeParameter',
];
const EDATATYPE_NAMES = [
  'EBigDecimal',
  'EBigInteger',
  'EBoolean',
  'EBooleanObject',
  'EByte',
  'EByteArray',
  'EByteObject',
  'EChar',
  'ECharacterObject',
  'EDate',
  'EDiagnosticChain',
  'EDouble',
  'EDoubleObject',
  'EEList',
  'EEnumerator',
  'EFeatureMap',
  'EFeatureMapEntry',
  'EFloat',
  'EFloatObject',
  'EInt',
  'EIntegerObject',
  'EJavaClass',
  'EJavaObject',
  'ELong',
  'ELongObject',
  'EMap',
  'EResource',
  'EResourceSet',
  'EShort',
  'EShortObject',
  'EString',
  'ETreeIterator',
  'EInvocationTargetException',
];

/** Counts the <eStructuralFeatures> elements of a class in the raw file. */
function countOwnFeaturesInRawFile(xml: string, className: string): number {
  const classStart = xml.indexOf(`eClassifiers xsi:type="ecore:EClass" name="${className}"`);
  if (classStart === -1) throw new Error(`Fixture parsing bug: '${className}' not found in the raw file.`);
  const afterStart = xml.slice(classStart);
  const selfCloseIdx = afterStart.indexOf('/>');
  const openCloseIdx = afterStart.indexOf('>');
  if (selfCloseIdx !== -1 && selfCloseIdx === openCloseIdx - 1) {
    return 0; // self-closing: no own features
  }
  const closeIdx = afterStart.indexOf('</eClassifiers>');
  const body = afterStart.slice(0, closeIdx);
  const matches = body.match(/<eStructuralFeatures /g);
  return matches ? matches.length : 0;
}

describe('loading Ecore.ecore', () => {
  let pkg: Awaited<ReturnType<typeof loadEcorePackage>>;
  let rawXml: string;

  beforeAll(async () => {
    pkg = await loadEcorePackage(FIXTURE_PATH);
    rawXml = await readFile(FIXTURE_PATH, 'utf-8');
  });

  describe('package-level information', () => {
    it('has the name, nsURI and nsPrefix', () => {
      expect(pkg.getName()).toBe('ecore');
      expect(pkg.getNsURI()).toBe('http://www.eclipse.org/emf/2002/Ecore');
      expect(pkg.getNsPrefix()).toBe('ecore');
    });
  });

  describe('classifiers', () => {
    it('has 19 EClasses (without EObject) and 33 EDataTypes', () => {
      expect(pkg.getEClassifiers().size()).toBe(52);
    });

    it('leaves out EObject', () => {
      expect(pkg.getEClassifier('EObject')).toBeUndefined();
    });

    it.each(ECLASS_NAMES.filter((n) => n !== 'EObject'))('has the EClass %s', (name) => {
      const classifier = pkg.getEClassifier(name);
      expect(classifier).toBeDefined();
      expect(classifier!.getName()).toBe(name);
      expect('getEStructuralFeatures' in classifier!).toBe(true);
    });

    it.each(EDATATYPE_NAMES)('has the EDataType %s', (name) => {
      const classifier = pkg.getEClassifier(name);
      expect(classifier).toBeDefined();
      expect(classifier!.getName()).toBe(name);
      expect('getEStructuralFeatures' in classifier!).toBe(false);
    });
  });

  describe('feature counts match the file', () => {
    it.each(ECLASS_NAMES.filter((n) => n !== 'EObject'))('%s', (name) => {
      const expectedCount = countOwnFeaturesInRawFile(rawXml, name);
      const classifier = pkg.getEClassifier(name) as EClass;
      expect(classifier.getEStructuralFeatures().size()).toBe(expectedCount);
    });
  });

  describe('EModelElement', () => {
    it('is abstract with no supertypes', () => {
      const c = pkg.getEClassifier('EModelElement') as EClass;
      expect(c.isAbstract()).toBe(true);
      expect(c.getESuperTypes().isEmpty()).toBe(true);
    });

    it('declares only the containment "eAnnotations"', () => {
      const c = pkg.getEClassifier('EModelElement') as EClass;
      const f = c.getEStructuralFeature('eAnnotations') as EReference;
      expect(f).toBeDefined();
      expect(f.isMany()).toBe(true);
      expect(f.isContainment()).toBe(true);
      expect(f.getEType()).toBe(pkg.getEClassifier('EAnnotation'));
    });
  });

  describe('ENamedElement', () => {
    it('is abstract, extends EModelElement, and declares "name": EString', () => {
      const c = pkg.getEClassifier('ENamedElement') as EClass;
      expect(c.isAbstract()).toBe(true);
      expect(c.getESuperTypes().toArray()).toEqual([pkg.getEClassifier('EModelElement')]);
      const name = c.getEStructuralFeature('name') as EAttribute;
      expect(name).toBeDefined();
      expect(name.getEType()).toBe(pkg.getEClassifier('EString'));
      expect(name.isMany()).toBe(false);
    });

    it('carries its constraint annotation', () => {
      const c = pkg.getEClassifier('ENamedElement') as EClass;
      const annotation = c.getEAnnotation('http://www.eclipse.org/emf/2002/Ecore');
      expect(annotation).toBeDefined();
      expect(detailValue(annotation!.getDetails(), 'constraints')).toBe('WellFormedName');
    });
  });

  describe('EAttribute', () => {
    it('declares "iD": EBoolean, single-valued', () => {
      const c = pkg.getEClassifier('EAttribute') as EClass;
      const id = c.getEStructuralFeature('iD') as EAttribute;
      expect(id).toBeDefined();
      expect(id.getEType()).toBe(pkg.getEClassifier('EBoolean'));
      expect(id.isMany()).toBe(false);
    });

    it('declares the derived "eAttributeType" with its flags', () => {
      const c = pkg.getEClassifier('EAttribute') as EClass;
      const eAttrType = c.getEStructuralFeature('eAttributeType') as EReference;
      expect(eAttrType).toBeDefined();
      expect(eAttrType.getEType()).toBe(pkg.getEClassifier('EDataType'));
      expect(eAttrType.getLowerBound()).toBe(1);
      expect(eAttrType.isChangeable()).toBe(false);
      expect(eAttrType.isVolatile()).toBe(true);
      expect(eAttrType.isTransient()).toBe(true);
      expect(eAttrType.isDerived()).toBe(true);
    });

    it('carries its "ConsistentTransient" constraint annotation', () => {
      const c = pkg.getEClassifier('EAttribute') as EClass;
      const annotation = c.getEAnnotation('http://www.eclipse.org/emf/2002/Ecore');
      expect(detailValue(annotation!.getDetails(), 'constraints')).toBe('ConsistentTransient');
    });
  });

  describe('EAnnotation', () => {
    it('declares "source": EString', () => {
      const c = pkg.getEClassifier('EAnnotation') as EClass;
      const source = c.getEStructuralFeature('source') as EAttribute;
      expect(source.getEType()).toBe(pkg.getEClassifier('EString'));
    });

    it('declares "details": many, containment, typed EStringToStringMapEntry', () => {
      const c = pkg.getEClassifier('EAnnotation') as EClass;
      const details = c.getEStructuralFeature('details') as EReference;
      expect(details.isMany()).toBe(true);
      expect(details.isContainment()).toBe(true);
      expect(details.getEType()).toBe(pkg.getEClassifier('EStringToStringMapEntry'));
    });

    it('declares the transient "eModelElement" as opposite of EModelElement.eAnnotations', () => {
      const annotation = pkg.getEClassifier('EAnnotation') as EClass;
      const modelElement = pkg.getEClassifier('EModelElement') as EClass;
      const eModelElementRef = annotation.getEStructuralFeature('eModelElement') as EReference;
      const eAnnotationsRef = modelElement.getEStructuralFeature('eAnnotations') as EReference;

      expect(eModelElementRef.isTransient()).toBe(true);
      expect(eModelElementRef.getEOpposite()).toBe(eAnnotationsRef);
      expect(eAnnotationsRef.getEOpposite()).toBe(eModelElementRef);
    });

    it('declares "contents" and "references" without eType, since they are typed EObject', () => {
      const c = pkg.getEClassifier('EAnnotation') as EClass;
      const contents = c.getEStructuralFeature('contents') as EReference;
      const references = c.getEStructuralFeature('references') as EReference;
      expect(contents.isContainment()).toBe(true);
      expect(contents.isMany()).toBe(true);
      expect(contents.getEType()).toBeUndefined();
      expect(references.isContainment()).toBe(false);
      expect(references.getEType()).toBeUndefined();
    });

    it('carries its "WellFormedSourceURI" constraint annotation', () => {
      const c = pkg.getEClassifier('EAnnotation') as EClass;
      expect(detailValue(c.getEAnnotation('http://www.eclipse.org/emf/2002/Ecore')!.getDetails(), 'constraints')).toBe(
        'WellFormedSourceURI'
      );
    });
  });

  describe('EGenericType', () => {
    it('is present, with self-typed eUpperBound/eTypeArguments/eLowerBound', () => {
      const c = pkg.getEClassifier('EGenericType') as EClass;
      expect(c).toBeDefined();
      expect((c.getEStructuralFeature('eUpperBound') as EReference).getEType()).toBe(c);
      expect((c.getEStructuralFeature('eTypeArguments') as EReference).getEType()).toBe(c);
      expect((c.getEStructuralFeature('eLowerBound') as EReference).getEType()).toBe(c);
    });
  });

  describe('inheritance', () => {
    it('EAttribute inherits the features of its whole supertype chain', () => {
      const attribute = pkg.getEClassifier('EAttribute') as EClass;
      const feature = pkg.getEClassifier('EStructuralFeature') as EClass;
      const typedElement = pkg.getEClassifier('ETypedElement') as EClass;
      const namedElement = pkg.getEClassifier('ENamedElement') as EClass;
      const modelElement = pkg.getEClassifier('EModelElement') as EClass;

      const allSupers = attribute.getEAllSuperTypes();
      expect(allSupers).toContain(feature);
      expect(allSupers).toContain(typedElement);
      expect(allSupers).toContain(namedElement);
      expect(allSupers).toContain(modelElement);

      const allFeatureNames = attribute.getEAllStructuralFeatures().map((f) => f.getName());
      expect(allFeatureNames).toContain('eAnnotations'); // EModelElement
      expect(allFeatureNames).toContain('name'); // ENamedElement
      expect(allFeatureNames).toContain('eType'); // ETypedElement
      expect(allFeatureNames).toContain('changeable'); // EStructuralFeature
      expect(allFeatureNames).toContain('iD'); // EAttribute's own
      expect(allFeatureNames).toContain('eAttributeType'); // EAttribute's own
    });
  });

  describe('classifier kinds', () => {
    it('EClasses are EClass instances and data types are not', () => {
      let realClassCount = 0;
      let dataTypeCount = 0;
      for (const c of pkg.getEClassifiers()) {
        if ('getEStructuralFeatures' in (c as EClassifier)) realClassCount++;
        else dataTypeCount++;
      }
      expect(realClassCount).toBe(19);
      expect(dataTypeCount).toBe(33);
    });
  });
});
