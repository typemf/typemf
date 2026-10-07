import { EClass, EcorePackageImpl, EObject, EReference, isEAttribute, isEReference } from '@typemf/core';

/**
 * The type that objects linked to `obj` through `feature` must have. Usually the feature's declared
 * type; the `eType` of an attribute is narrowed to EDataType and that of a reference to EClass,
 * since Ecore declares `eType` as any EClassifier but only accepts those for them.
 */
export function linkTargetType(obj: EObject, feature: EReference, declaredType: EClass): EClass {
  const ecore = EcorePackageImpl.eINSTANCE;
  if (feature !== ecore.getETypedElement_EType()) return declaredType;
  if (isEAttribute(obj)) return ecore.getEDataType();
  if (isEReference(obj)) return ecore.getEClass();
  return declaredType;
}
