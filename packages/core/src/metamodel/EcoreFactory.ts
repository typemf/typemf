import { EAttribute } from "./types/EAttribute.js";
import { EAnnotation } from "./types/EAnnotation.js";
import { EClass } from "./types/EClass.js";
import { EDataType } from "./types/EDataType.js";
import { EEnum } from "./types/EEnum.js";
import { EEnumLiteral } from "./types/EEnumLiteral.js";
import { EFactory } from "./types/EFactory.js";
import { EObject } from "./types/EObject.js";
import { EOperation } from "./types/EOperation.js";
import { EPackage } from "./types/EPackage.js";
import { EParameter } from "./types/EParameter.js";
import { EReference } from "./types/EReference.js";
import { EStringToStringMapEntry } from "./types/EStringToStringMapEntry.js";
import { EGenericType } from "./types/EGenericType.js";
import { ETypeParameter } from "./types/ETypeParameter.js";

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
