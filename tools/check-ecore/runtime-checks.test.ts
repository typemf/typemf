// Copied into the merged workspace's core/src by check_ecore.py. Prints one CHECK|id|PASS/FAIL|detail line per check.
import { readFileSync } from 'node:fs';
import { it } from 'vitest';
import { EAttributeImpl } from './metamodel/impl/EAttributeImpl.js';
import { EClassImpl } from './metamodel/impl/EClassImpl.js';
import { EcorePackageImpl } from './metamodel/impl/EcorePackageImpl.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
const expected = JSON.parse(readFileSync(process.env.CHECK_EXPECTED!, 'utf-8'));
const out = (id: string, ok: boolean, detail: string) => console.log(`CHECK|${id}|${ok ? 'PASS' : 'FAIL'}|${detail}`);
function check(id: string, fn: () => [boolean, string]) {
  try {
    const [ok, detail] = fn();
    out(id, ok, detail);
  } catch (e) {
    out(id, false, `threw ${(e as Error).constructor.name}: ${(e as Error).message.slice(0, 80).replace(/[\n|]/g, ' ')}`);
  }
}

it('runtime checks', () => {
  const p: any = EcorePackageImpl.eINSTANCE;
  const byName = (n: string): any => [...p.getEClassifiers()].find((c: any) => c.getName() === n);
  const eClass = byName('EClass');
  const supers = (c: any): any[] => [...c.getESuperTypes()];
  const allSupers = (c: any): any[] => [...new Set(supers(c).flatMap((s) => [s, ...allSupers(s)]))];
  const walkedFeatures = (c: any): any[] => [...c.getEStructuralFeatures(), ...allSupers(c).flatMap((s) => [...s.getEStructuralFeatures()])];
  const isRef = (f: any) => typeof f.isContainment === 'function';
  const all = walkedFeatures(eClass);

  check('boot', () => [p.getEClassifiers().size() > 0, `${p.getEClassifiers().size()} classifiers`]);

  check('dispatch.byName', () => [eClass.getEStructuralFeature('abstract')?.getName() === 'abstract', 'getEStructuralFeature("abstract")']);
  check('dispatch.byID', () => {
    const f = eClass.getEStructuralFeature('abstract');
    const id = eClass.getFeatureID(f);
    return [eClass.getEStructuralFeature(id)?.getName() === 'abstract', `id ${id}`];
  });

  const sub = (a: string, b: string) => byName(a).isSuperTypeOf(byName(b));
  check('isSuperTypeOf.reflexive', () => [sub('EClass', 'EClass') === true, 'EClass ⊇ EClass']);
  check('isSuperTypeOf.direct', () => [sub('EClassifier', 'EClass') === true, 'EClassifier ⊇ EClass']);
  check('isSuperTypeOf.transitive', () => [sub('EModelElement', 'EClass') === true, 'EModelElement ⊇ EClass']);
  check('isSuperTypeOf.negative', () => [sub('EAttribute', 'EClass') === false, 'EAttribute ⊉ EClass']);
  check('isSuperTypeOf.reverse', () => [sub('EClass', 'EClassifier') === false, 'EClass ⊉ EClassifier']);

  check('featureCount', () => [eClass.getFeatureCount() === expected.EClass.allFeatures, `got ${eClass.getFeatureCount()}, expected ${expected.EClass.allFeatures}`]);
  check('operations.runtime', () => [eClass.getEOperations().size() === expected.EClass.ownOperations, `EClass.getEOperations(): got ${eClass.getEOperations().size()}, declared ${expected.EClass.ownOperations}`]);
  check('operationCount', () => [eClass.getOperationCount() === expected.EClass.allOperations, `got ${eClass.getOperationCount()}, expected ${expected.EClass.allOperations}`]);

  // Derived features (all 18 are in the file); the hand walk above is the oracle for the traversal ones.
  const sizeIs = (id: string, actual: () => number, want: number) => check(id, () => [actual() === want, `got ${actual()}, expected ${want}`]);
  sizeIs('derived.eAllSuperTypes', () => eClass.getEAllSuperTypes().size(), expected.EClass.allSuperTypes);
  sizeIs('derived.eAllStructuralFeatures', () => eClass.getEAllStructuralFeatures().size(), all.length);
  check('derived.eAllStructuralFeatures.order', () => {
    const names = [...eClass.getEAllStructuralFeatures()].map((f: any) => f.getName());
    return [JSON.stringify(names) === JSON.stringify(expected.EClass.allFeatureNames), `first: ${names.slice(0, 3).join(', ')}; expected first: ${expected.EClass.allFeatureNames.slice(0, 3).join(', ')}`];
  });
  check('derived.eAllStructuralFeatures.eGet', () => {
    // reflective access to a derived feature must agree with its getter
    const viaGetter = eClass.getEAllStructuralFeatures().size();
    const viaEGet = eClass.eGet(p.getEClass_EAllStructuralFeatures()).size();
    return [viaEGet === viaGetter, `getter ${viaGetter}, eGet ${viaEGet}`];
  });
  check('derived.eAllStructuralFeatures.cyclic', () => {
    // an (invalid) cyclic hierarchy must not hang or overflow the stack, and each feature appears once
    const a: any = new EClassImpl();
    const b: any = new EClassImpl();
    a.setName('A');
    b.setName('B');
    a.getESuperTypes().add(b);
    b.getESuperTypes().add(a);
    const fa: any = new EAttributeImpl();
    const fb: any = new EAttributeImpl();
    fa.setName('fa');
    fb.setName('fb');
    a.getEStructuralFeatures().add(fa);
    b.getEStructuralFeatures().add(fb);
    return [a.getEAllStructuralFeatures().size() === 2, `size ${a.getEAllStructuralFeatures().size()} (expected 2)`];
  });
  sizeIs('derived.eAllAttributes', () => eClass.getEAllAttributes().size(), all.filter((f) => !isRef(f)).length);
  sizeIs('derived.eAllReferences', () => eClass.getEAllReferences().size(), all.filter(isRef).length);
  sizeIs('derived.eAllContainments', () => eClass.getEAllContainments().size(), all.filter((f) => isRef(f) && f.isContainment()).length);
  sizeIs('derived.eAttributes', () => eClass.getEAttributes().size(), eClass.getEStructuralFeatures().size() - [...eClass.getEStructuralFeatures()].filter(isRef).length);
  sizeIs('derived.eReferences', () => eClass.getEReferences().size(), [...eClass.getEStructuralFeatures()].filter(isRef).length);
  sizeIs('derived.eAllOperations', () => eClass.getEAllOperations().size(), expected.EClass.allOperations);
  check('derived.eIDAttribute', () => [eClass.getEIDAttribute() === undefined, 'EClass declares no ID attribute']);
  const feats = all;
  check('derived.many', () => [feats.every((f) => f.isMany() === (f.getUpperBound() === -1 || f.getUpperBound() > 1)), 'many == upperBound is -1 or > 1']);
  check('derived.required', () => [feats.every((f) => f.isRequired() === (f.getLowerBound() >= 1)), 'required == lowerBound >= 1']);
  check('derived.container', () => [feats.filter(isRef).every((f) => f.isContainer() === (f.getEOpposite()?.isContainment() ?? false)), 'container == opposite is containment']);
  check('derived.eReferenceType', () => [feats.filter(isRef).every((f) => f.getEReferenceType() === f.getEType()), 'eReferenceType == eType']);
  check('derived.eAttributeType', () => [feats.filter((f) => !isRef(f)).every((f) => f.getEAttributeType() === f.getEType()), 'eAttributeType == eType']);
});
