import { detailValue, EAttribute, EClass, EClassifier, EReference } from '@typemf/core';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';

/**
 * Loads the real, complete Ecore.ecore file (fetched from the actual EMF
 * source - see fixtures/Ecore.ecore) and validates that the resulting
 * typed EPackage genuinely carries every kind of information the format
 * declares, not just that loading succeeds without throwing. Complements
 * the smaller, hand-written fixture in ecore-loader.test.ts, which proves
 * the mechanism works at all; this proves it works completely, against
 * the real file, with assertions grounded in the file's actual content
 * (re-extracted directly from fixtures/Ecore.ecore while writing this,
 * not from memory).
 */

const FIXTURE_PATH = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');

// The real file's own EClass/EDataType names, extracted directly from it
// (grep -oP against the actual fixture) rather than typed from memory.
const REAL_ECLASS_NAMES = [
  'EAttribute', 'EAnnotation', 'EClass', 'EClassifier', 'EDataType', 'EEnum', 'EEnumLiteral',
  'EFactory', 'EModelElement', 'ENamedElement', 'EObject', 'EOperation', 'EPackage', 'EParameter',
  'EReference', 'EStructuralFeature', 'ETypedElement', 'EStringToStringMapEntry', 'EGenericType',
  'ETypeParameter',
];
const REAL_EDATATYPE_NAMES = [
  'EBigDecimal', 'EBigInteger', 'EBoolean', 'EBooleanObject', 'EByte', 'EByteArray', 'EByteObject',
  'EChar', 'ECharacterObject', 'EDate', 'EDiagnosticChain', 'EDouble', 'EDoubleObject', 'EEList',
  'EEnumerator', 'EFeatureMap', 'EFeatureMapEntry', 'EFloat', 'EFloatObject', 'EInt', 'EIntegerObject',
  'EJavaClass', 'EJavaObject', 'ELong', 'ELongObject', 'EMap', 'EResource', 'EResourceSet', 'EShort',
  'EShortObject', 'EString', 'ETreeIterator', 'EInvocationTargetException',
];

/**
 * Per real EClass (excluding EObject, which the file declares with zero
 * structural features of its own anyway), the exact count of OWN
 * <eStructuralFeatures> elements declared directly under it in the raw
 * file - extracted mechanically from the fixture text, not hand-counted,
 * so this check can't silently drift from the actual file. A generic
 * cross-check across every real class, complementing (not replacing) the
 * hand-verified deep checks below for a handful of specific ones.
 */
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

describe('Real Ecore.ecore - full information-presence validation', () => {
  let pkg: Awaited<ReturnType<typeof loadEcorePackage>>;
  let rawXml: string;

  beforeAll(async () => {
    pkg = await loadEcorePackage(FIXTURE_PATH);
    rawXml = await readFile(FIXTURE_PATH, 'utf-8');
  });

  describe('package-level information', () => {
    it('has the real name, nsURI, and nsPrefix', () => {
      expect(pkg.getName()).toBe('ecore');
      expect(pkg.getNsURI()).toBe('http://www.eclipse.org/emf/2002/Ecore');
      expect(pkg.getNsPrefix()).toBe('ecore');
    });
  });

  describe('structural completeness across all classifiers', () => {
    it('has exactly 52 classifiers: 19 real EClasses (EObject excluded) + 33 primitive EDataTypes', () => {
      expect(pkg.getEClassifiers().size()).toBe(52);
    });

    it('EObject is deliberately absent from the converted graph, even though the file declares it', () => {
      expect(pkg.getEClassifier('EObject')).toBeUndefined();
    });

    it.each(REAL_ECLASS_NAMES.filter((n) => n !== 'EObject'))('classifier "%s" is present as a real EClass', (name) => {
      const classifier = pkg.getEClassifier(name);
      expect(classifier).toBeDefined();
      expect(classifier!.getName()).toBe(name);
      expect('getEStructuralFeatures' in classifier!).toBe(true);
    });

    it.each(REAL_EDATATYPE_NAMES)('primitive "%s" is present as an EDataType, not an EClass', (name) => {
      const classifier = pkg.getEClassifier(name);
      expect(classifier).toBeDefined();
      expect(classifier!.getName()).toBe(name);
      expect('getEStructuralFeatures' in classifier!).toBe(false);
    });
  });

  describe('generic per-class own-feature-count cross-check against the raw file', () => {
    it.each(REAL_ECLASS_NAMES.filter((n) => n !== 'EObject'))(
      '"%s" has exactly the number of own structural features the raw file declares for it',
      (name) => {
        const expectedCount = countOwnFeaturesInRawFile(rawXml, name);
        const classifier = pkg.getEClassifier(name) as EClass;
        expect(classifier.getEStructuralFeatures().size()).toBe(expectedCount);
      }
    );
  });

  describe('EModelElement - abstract root, no supertype, single containment feature', () => {
    it('is abstract with no supertypes', () => {
      const c = pkg.getEClassifier('EModelElement') as EClass;
      expect(c.isAbstract()).toBe(true);
      expect(c.getESuperTypes().isEmpty()).toBe(true);
    });

    it('declares exactly "eAnnotations": many-valued, containment, typed EAnnotation', () => {
      const c = pkg.getEClassifier('EModelElement') as EClass;
      const f = c.getEStructuralFeature('eAnnotations') as EReference;
      expect(f).toBeDefined();
      expect(f.isMany()).toBe(true);
      expect(f.isContainment()).toBe(true);
      expect(f.getEType()).toBe(pkg.getEClassifier('EAnnotation'));
    });
  });

  describe('ENamedElement - single inheritance, one attribute, a real annotation', () => {
    it('is abstract, extends EModelElement, and declares "name": EString', () => {
      const c = pkg.getEClassifier('ENamedElement') as EClass;
      expect(c.isAbstract()).toBe(true);
      expect(c.getESuperTypes().toArray()).toEqual([pkg.getEClassifier('EModelElement')]);
      const name = c.getEStructuralFeature('name') as EAttribute;
      expect(name).toBeDefined();
      expect(name.getEType()).toBe(pkg.getEClassifier('EString'));
      expect(name.isMany()).toBe(false);
    });

    it('carries its real GenModel/Ecore constraint annotation, with the real source and details', () => {
      const c = pkg.getEClassifier('ENamedElement') as EClass;
      const annotation = c.getEAnnotation('http://www.eclipse.org/emf/2002/Ecore');
      expect(annotation).toBeDefined();
      expect(detailValue(annotation!.getDetails(), 'constraints')).toBe('WellFormedName');
    });
  });

  describe('EAttribute - iD flag, and a derived feature with real changeable/volatile/transient/derived flags', () => {
    it('declares "iD": EBoolean, single-valued', () => {
      const c = pkg.getEClassifier('EAttribute') as EClass;
      const id = c.getEStructuralFeature('iD') as EAttribute;
      expect(id).toBeDefined();
      expect(id.getEType()).toBe(pkg.getEClassifier('EBoolean'));
      expect(id.isMany()).toBe(false);
    });

    it('declares "eAttributeType" with the real derived-feature flags the file specifies', () => {
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

    it('carries its real "ConsistentTransient" constraint annotation', () => {
      const c = pkg.getEClassifier('EAttribute') as EClass;
      const annotation = c.getEAnnotation('http://www.eclipse.org/emf/2002/Ecore');
      expect(detailValue(annotation!.getDetails(), 'constraints')).toBe('ConsistentTransient');
    });
  });

  describe('EAnnotation - every feature kind at once: attribute, containment ref, transient ref with opposite, and two EObject-typed (excluded) refs', () => {
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

    it('declares "eModelElement": transient, and its eOpposite is the REAL EModelElement.eAnnotations feature object, both directions', () => {
      const annotation = pkg.getEClassifier('EAnnotation') as EClass;
      const modelElement = pkg.getEClassifier('EModelElement') as EClass;
      const eModelElementRef = annotation.getEStructuralFeature('eModelElement') as EReference;
      const eAnnotationsRef = modelElement.getEStructuralFeature('eAnnotations') as EReference;

      expect(eModelElementRef.isTransient()).toBe(true);
      expect(eModelElementRef.getEOpposite()).toBe(eAnnotationsRef);
      expect(eAnnotationsRef.getEOpposite()).toBe(eModelElementRef);
    });

    it('declares "contents" and "references", both typed EObject - which the conversion deliberately leaves as undefined eType (see EObject special-casing)', () => {
      const c = pkg.getEClassifier('EAnnotation') as EClass;
      const contents = c.getEStructuralFeature('contents') as EReference;
      const references = c.getEStructuralFeature('references') as EReference;
      expect(contents.isContainment()).toBe(true);
      expect(contents.isMany()).toBe(true);
      expect(contents.getEType()).toBeUndefined();
      expect(references.isContainment()).toBe(false);
      expect(references.getEType()).toBeUndefined();
    });

    it('carries its real "WellFormedSourceURI" constraint annotation', () => {
      const c = pkg.getEClassifier('EAnnotation') as EClass;
      expect(detailValue(c.getEAnnotation('http://www.eclipse.org/emf/2002/Ecore')!.getDetails(), 'constraints')).toBe(
        'WellFormedSourceURI'
      );
    });
  });

  describe('EGenericType - real, self-referential structure (Java-generics support, per the "100% compatibility" decision)', () => {
    it('is present, with self-typed eUpperBound/eTypeArguments/eLowerBound', () => {
      const c = pkg.getEClassifier('EGenericType') as EClass;
      expect(c).toBeDefined();
      expect((c.getEStructuralFeature('eUpperBound') as EReference).getEType()).toBe(c);
      expect((c.getEStructuralFeature('eTypeArguments') as EReference).getEType()).toBe(c);
      expect((c.getEStructuralFeature('eLowerBound') as EReference).getEType()).toBe(c);
    });
  });

  describe('multi-level inheritance chain is intact end to end', () => {
    it('EAttribute -> EStructuralFeature -> ETypedElement -> ENamedElement -> EModelElement, and eAllStructuralFeatures reflects the whole chain', () => {
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

  describe('EClassifier hierarchy: every classifier really is an instance of the right kind', () => {
    it('all 19 real EClasses (excl. EObject) satisfy the EClass shape; all 33 primitives do not', () => {
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
