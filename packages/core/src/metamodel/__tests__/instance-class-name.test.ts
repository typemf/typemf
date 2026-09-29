import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EEnumImpl } from '../impl/EEnumImpl.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// See NOTES.md's point 6 write-up: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely before any test
// in this file constructs a raw metaclass instance.
void EcorePackageImpl.eINSTANCE;

function feature(owner: EAttributeImpl | EClassImpl | EEnumImpl | EDataTypeImpl, name: string): EStructuralFeature {
  const found = owner.eClass().getEStructuralFeature(name);
  if (!found) throw new Error(`No real feature named '${name}' on ${owner.eClass().getName()}.`);
  return found;
}

describe('EClassifier.instanceClassName', () => {
  it('is undefined until set, then round-trips through the plain getter/setter', () => {
    const dt = new EDataTypeImpl();
    expect(dt.getInstanceClassName()).toBeUndefined();
    dt.setInstanceClassName('java.lang.String');
    expect(dt.getInstanceClassName()).toBe('java.lang.String');
  });

  it('is reachable reflectively (eGet/eSet/eIsSet/eUnset) on every EClassifier subtype, not just EDataType', () => {
    for (const classifier of [new EDataTypeImpl(), new EClassImpl(), new EEnumImpl()]) {
      const f = feature(classifier, 'instanceClassName');
      expect(classifier.eIsSet(f)).toBe(false);
      classifier.eSet(f, 'some.Type');
      expect(classifier.eGet(f)).toBe('some.Type');
      expect(classifier.getInstanceClassName()).toBe('some.Type');
      expect(classifier.eIsSet(f)).toBe(true);
      classifier.eUnset(f);
      expect(classifier.getInstanceClassName()).toBeUndefined();
      expect(classifier.eIsSet(f)).toBe(false);
    }
  });
});
