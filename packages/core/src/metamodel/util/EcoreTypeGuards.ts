import { EObject } from '../types/index.js';
import { EAttribute, EAnnotation, EClass, EClassifier, EDataType, EEnum, EEnumLiteral, EFactory, EModelElement, ENamedElement, EOperation, EPackage, EParameter, EReference, EStructuralFeature, ETypedElement, EStringToStringMapEntry, EGenericType, ETypeParameter } from '../types/index.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';

/**
 * Runtime type guards, one per classifier declared in types/ - the
 * reflective counterpart to a hand-written structural guard like
 *
 *   function isReference(feature: EStructuralFeature): feature is EReference {
 *     return "isContainment" in feature;
 *   }
 *
 * Structural (duck-typing) checks like that one work when a single
 * classifier has some genuinely distinguishing own member - but nothing
 * guarantees an arbitrary generated classifier has one (a subclass might
 * add no own features at all, inheriting everything). These guards check
 * the object's REAL runtime EClass against the metamodel's own
 * eAllSuperTypes reflectively instead (via isSuperTypeOf()), which is
 * correct for every classifier unconditionally, including abstract ones
 * (correctly true for any instance of a concrete subclass) and dynamic
 * instances (no dependency on the object's actual JS class/prototype at
 * all, unlike `instanceof`).
 */
function hasEClass(obj: unknown): obj is EObject {
  return obj !== null && typeof obj === 'object' && typeof (obj as { eClass?: unknown }).eClass === 'function';
}

export function isEAttribute(obj: unknown): obj is EAttribute {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEAttribute().isSuperTypeOf(obj.eClass());
}
export function isEAnnotation(obj: unknown): obj is EAnnotation {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEAnnotation().isSuperTypeOf(obj.eClass());
}
export function isEClass(obj: unknown): obj is EClass {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEClass().isSuperTypeOf(obj.eClass());
}
export function isEClassifier(obj: unknown): obj is EClassifier {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEClassifier().isSuperTypeOf(obj.eClass());
}
export function isEDataType(obj: unknown): obj is EDataType {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEDataType().isSuperTypeOf(obj.eClass());
}
export function isEEnum(obj: unknown): obj is EEnum {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEEnum().isSuperTypeOf(obj.eClass());
}
export function isEEnumLiteral(obj: unknown): obj is EEnumLiteral {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEEnumLiteral().isSuperTypeOf(obj.eClass());
}
export function isEFactory(obj: unknown): obj is EFactory {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEFactory().isSuperTypeOf(obj.eClass());
}
export function isEModelElement(obj: unknown): obj is EModelElement {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEModelElement().isSuperTypeOf(obj.eClass());
}
export function isENamedElement(obj: unknown): obj is ENamedElement {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getENamedElement().isSuperTypeOf(obj.eClass());
}
export function isEOperation(obj: unknown): obj is EOperation {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEOperation().isSuperTypeOf(obj.eClass());
}
export function isEPackage(obj: unknown): obj is EPackage {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEPackage().isSuperTypeOf(obj.eClass());
}
export function isEParameter(obj: unknown): obj is EParameter {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEParameter().isSuperTypeOf(obj.eClass());
}
export function isEReference(obj: unknown): obj is EReference {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEReference().isSuperTypeOf(obj.eClass());
}
export function isEStructuralFeature(obj: unknown): obj is EStructuralFeature {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEStructuralFeature().isSuperTypeOf(obj.eClass());
}
export function isETypedElement(obj: unknown): obj is ETypedElement {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getETypedElement().isSuperTypeOf(obj.eClass());
}
export function isEStringToStringMapEntry(obj: unknown): obj is EStringToStringMapEntry {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEStringToStringMapEntry().isSuperTypeOf(obj.eClass());
}
export function isEGenericType(obj: unknown): obj is EGenericType {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getEGenericType().isSuperTypeOf(obj.eClass());
}
export function isETypeParameter(obj: unknown): obj is ETypeParameter {
  return hasEClass(obj) && EcorePackageImpl.eINSTANCE.getETypeParameter().isSuperTypeOf(obj.eClass());
}
