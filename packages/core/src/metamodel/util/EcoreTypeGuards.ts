import { getEcorePackageRef } from '../impl/EcorePackageRef.js';
import { EAnnotation } from '../types/EAnnotation.js';
import { EAttribute } from '../types/EAttribute.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EDataType } from '../types/EDataType.js';
import { EEnum } from '../types/EEnum.js';
import { EEnumLiteral } from '../types/EEnumLiteral.js';
import { EFactory } from '../types/EFactory.js';
import { EGenericType } from '../types/EGenericType.js';
import { EModelElement } from '../types/EModelElement.js';
import { ENamedElement } from '../types/ENamedElement.js';
import { EObject } from '../types/EObject.js';
import { EOperation } from '../types/EOperation.js';
import { EPackage } from '../types/EPackage.js';
import { EParameter } from '../types/EParameter.js';
import { EReference } from '../types/EReference.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { ETypeParameter } from '../types/ETypeParameter.js';
import { ETypedElement } from '../types/ETypedElement.js';

/**
 * Type guards for the classifiers of the package. They check an object's class with
 * `isSuperTypeOf()`, so they also work for abstract classes, interfaces and dynamic objects,
 * unlike `instanceof`.
 */
function hasEClass(obj: unknown): obj is EObject {
  return obj !== null && typeof obj === 'object' && typeof (obj as { eClass?: unknown }).eClass === 'function';
}

export function isEAttribute(obj: unknown): obj is EAttribute {
  return hasEClass(obj) && getEcorePackageRef().getEAttribute().isSuperTypeOf(obj.eClass());
}
export function isEAnnotation(obj: unknown): obj is EAnnotation {
  return hasEClass(obj) && getEcorePackageRef().getEAnnotation().isSuperTypeOf(obj.eClass());
}
export function isEClass(obj: unknown): obj is EClass {
  return hasEClass(obj) && getEcorePackageRef().getEClass().isSuperTypeOf(obj.eClass());
}
export function isEClassifier(obj: unknown): obj is EClassifier {
  return hasEClass(obj) && getEcorePackageRef().getEClassifier().isSuperTypeOf(obj.eClass());
}
export function isEDataType(obj: unknown): obj is EDataType {
  return hasEClass(obj) && getEcorePackageRef().getEDataType().isSuperTypeOf(obj.eClass());
}
export function isEEnum(obj: unknown): obj is EEnum {
  return hasEClass(obj) && getEcorePackageRef().getEEnum().isSuperTypeOf(obj.eClass());
}
export function isEEnumLiteral(obj: unknown): obj is EEnumLiteral {
  return hasEClass(obj) && getEcorePackageRef().getEEnumLiteral().isSuperTypeOf(obj.eClass());
}
export function isEFactory(obj: unknown): obj is EFactory {
  return hasEClass(obj) && getEcorePackageRef().getEFactory().isSuperTypeOf(obj.eClass());
}
export function isEModelElement(obj: unknown): obj is EModelElement {
  return hasEClass(obj) && getEcorePackageRef().getEModelElement().isSuperTypeOf(obj.eClass());
}
export function isENamedElement(obj: unknown): obj is ENamedElement {
  return hasEClass(obj) && getEcorePackageRef().getENamedElement().isSuperTypeOf(obj.eClass());
}
export function isEOperation(obj: unknown): obj is EOperation {
  return hasEClass(obj) && getEcorePackageRef().getEOperation().isSuperTypeOf(obj.eClass());
}
export function isEPackage(obj: unknown): obj is EPackage {
  return hasEClass(obj) && getEcorePackageRef().getEPackage().isSuperTypeOf(obj.eClass());
}
export function isEParameter(obj: unknown): obj is EParameter {
  return hasEClass(obj) && getEcorePackageRef().getEParameter().isSuperTypeOf(obj.eClass());
}
export function isEReference(obj: unknown): obj is EReference {
  return hasEClass(obj) && getEcorePackageRef().getEReference().isSuperTypeOf(obj.eClass());
}
export function isEStructuralFeature(obj: unknown): obj is EStructuralFeature {
  return hasEClass(obj) && getEcorePackageRef().getEStructuralFeature().isSuperTypeOf(obj.eClass());
}
export function isETypedElement(obj: unknown): obj is ETypedElement {
  return hasEClass(obj) && getEcorePackageRef().getETypedElement().isSuperTypeOf(obj.eClass());
}
export function isEStringToStringMapEntry(obj: unknown): obj is EStringToStringMapEntry {
  return hasEClass(obj) && getEcorePackageRef().getEStringToStringMapEntry().isSuperTypeOf(obj.eClass());
}
export function isEGenericType(obj: unknown): obj is EGenericType {
  return hasEClass(obj) && getEcorePackageRef().getEGenericType().isSuperTypeOf(obj.eClass());
}
export function isETypeParameter(obj: unknown): obj is ETypeParameter {
  return hasEClass(obj) && getEcorePackageRef().getETypeParameter().isSuperTypeOf(obj.eClass());
}
