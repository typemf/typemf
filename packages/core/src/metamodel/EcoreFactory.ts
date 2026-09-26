import { EObject } from './types/index.js';
import { EAttribute, EAnnotation, EClass, EDataType, EEnum, EEnumLiteral, EFactory, EOperation, EPackage, EParameter, EReference, EStringToStringMapEntry, EGenericType, ETypeParameter } from './types/index.js';

export interface EcoreFactory extends EFactory {
  createEAttribute(): EAttribute;
  createEAnnotation(): EAnnotation;
  createEClass(): EClass;
  createEDataType(): EDataType;
  createEEnum(): EEnum;
  createEEnumLiteral(): EEnumLiteral;
  createEFactory(): EFactory;
  createEOperation(): EOperation;
  createEPackage(): EPackage;
  createEParameter(): EParameter;
  createEReference(): EReference;
  createEStringToStringMapEntry(): EStringToStringMapEntry;
  createEGenericType(): EGenericType;
  createETypeParameter(): ETypeParameter;
  create(eClass: EClass): EObject;
}
