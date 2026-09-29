import {
  BasicEList,
  DynamicEFactoryImpl,
  DynamicEObjectImpl,
  EAttributeImpl,
  EClassImpl,
  EDataTypeImpl,
  EObject,
  EPackageImpl,
  EcorePackageImpl,
  EReferenceImpl,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { resolveEmfFragment } from '../emf-fragment.js';

// See NOTES.md's point 6/7 write-ups: every generated setter routes through getEcorePackageRef(),
// which needs Ecore's own metaclass system bootstrapped first - this triggers that safely, once,
// at module load, before this file constructs a single raw metaclass instance.
void EcorePackageImpl.eINSTANCE;

/**
 * Name-based resolution (walkNamedSegments) only ever operates on
 * reflective (eGet/eClass-based) objects - real usage is always against
 * DynamicEObjectImpl instances parsed from a real .ecore file, never
 * against @typemf/core's own hand-written EClassImpl/etc (which don't
 * support eGet). This fixture is a small "meta-schema" mirroring the
 * relevant shape of real Ecore.ecore: a MetaPackage classifier (with
 * "name" + "eClassifiers"), and a MetaClass classifier (with "name" +
 * "eStructuralFeatures", self-referential - reused for both "a classifier"
 * and "a feature declared on a classifier", since both only need a name
 * for this test).
 */
function buildMetaSchemaAndInstance() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');

  const metaPackage = new EClassImpl();
  metaPackage.setName('MetaPackage');
  const metaClass = new EClassImpl();
  metaClass.setName('MetaClass');

  const pkgName = new EAttributeImpl();
  pkgName.setName('name');
  pkgName.setEType(eString);
  pkgName.setFeatureID(0);
  pkgName.setEContainingClass(metaPackage);
  const eClassifiers = new EReferenceImpl();
  eClassifiers.setName('eClassifiers');
  eClassifiers.setEType(metaClass);
  eClassifiers.setUpperBound(-1);
  eClassifiers.setContainment(true);
  eClassifiers.setFeatureID(1);
  eClassifiers.setEContainingClass(metaPackage);
  metaPackage.getEStructuralFeatures().add(pkgName);
  metaPackage.getEStructuralFeatures().add(eClassifiers);

  const className = new EAttributeImpl();
  className.setName('name');
  className.setEType(eString);
  className.setFeatureID(0);
  className.setEContainingClass(metaClass);
  const eStructuralFeatures = new EReferenceImpl();
  eStructuralFeatures.setName('eStructuralFeatures');
  eStructuralFeatures.setEType(metaClass);
  eStructuralFeatures.setUpperBound(-1);
  eStructuralFeatures.setContainment(true);
  eStructuralFeatures.setFeatureID(1);
  eStructuralFeatures.setEContainingClass(metaClass);
  metaClass.getEStructuralFeatures().add(className);
  metaClass.getEStructuralFeatures().add(eStructuralFeatures);

  const metaPkg = new EPackageImpl();
  metaPkg.setName('meta');
  metaPkg.setNsURI('https://typemf.dev/test/meta');
  metaPkg.getEClassifiers().add(eString);
  metaPkg.getEClassifiers().add(metaPackage);
  metaPkg.getEClassifiers().add(metaClass);
  for (const c of metaPkg.getEClassifiers()) (c as EClassImpl).setEPackage(metaPkg);
  metaPkg.setEFactoryInstance(new DynamicEFactoryImpl());

  // A dynamic instance graph: package "root", containing classifiers "Foo"
  // and "Bar"; "Foo" itself declares one feature named "toBar".
  const rootInstance = new DynamicEObjectImpl(metaPackage);
  rootInstance.eSet(pkgName, 'root');

  const fooInstance = new DynamicEObjectImpl(metaClass);
  fooInstance.eSet(className, 'Foo');
  const barInstance = new DynamicEObjectImpl(metaClass);
  barInstance.eSet(className, 'Bar');

  const toBarFeature = new DynamicEObjectImpl(metaClass);
  toBarFeature.eSet(className, 'toBar');
  (fooInstance.eGet(eStructuralFeatures) as BasicEList<EObject>).add(toBarFeature);

  (rootInstance.eGet(eClassifiers) as BasicEList<EObject>).add(fooInstance);
  (rootInstance.eGet(eClassifiers) as BasicEList<EObject>).add(barInstance);

  return { rootInstance, fooInstance, barInstance, toBarFeature };
}

describe('resolveEmfFragment - name-based form (real .ecore files)', () => {
  it('resolves "//ClassName" to a classifier declared on the root package, by name', () => {
    const { rootInstance, fooInstance, barInstance } = buildMetaSchemaAndInstance();
    expect(resolveEmfFragment('//Foo', [rootInstance])).toBe(fooInstance);
    expect(resolveEmfFragment('//Bar', [rootInstance])).toBe(barInstance);
  });

  it('resolves "//ClassName/featureName" to a feature declared on that class, by name', () => {
    const { rootInstance, toBarFeature } = buildMetaSchemaAndInstance();
    expect(resolveEmfFragment('//Foo/toBar', [rootInstance])).toBe(toBarFeature);
  });

  it('returns undefined for an unknown classifier or feature name', () => {
    const { rootInstance } = buildMetaSchemaAndInstance();
    expect(resolveEmfFragment('//DoesNotExist', [rootInstance])).toBeUndefined();
    expect(resolveEmfFragment('//Foo/doesNotExist', [rootInstance])).toBeUndefined();
  });

  it('does not confuse the name-based form with the existing positional "@"-prefixed form', () => {
    const { rootInstance, fooInstance } = buildMetaSchemaAndInstance();
    // A positional fragment against this same graph: root's first
    // containment child under "eClassifiers" is Foo.
    expect(resolveEmfFragment('//@eClassifiers.0', [rootInstance])).toBe(fooInstance);
  });
});
