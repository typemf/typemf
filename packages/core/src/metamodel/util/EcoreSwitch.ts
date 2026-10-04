import { Ids } from '../EcorePackage.js';
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

export abstract class EcoreSwitch<T> {
  doSwitch(eObject: EObject): T | undefined {
    switch (eObject.eClass().getClassifierID()) {
      case Ids.EAttribute.self: {
        // EAttribute
        const result1 = this.caseEAttribute(eObject as EAttribute);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEStructuralFeature(eObject as EStructuralFeature);
        if (result2 !== undefined) return result2;
        const result3 = this.caseETypedElement(eObject as ETypedElement);
        if (result3 !== undefined) return result3;
        const result4 = this.caseENamedElement(eObject as ENamedElement);
        if (result4 !== undefined) return result4;
        const result5 = this.caseEModelElement(eObject as EModelElement);
        if (result5 !== undefined) return result5;
        return this.defaultCase(eObject);
      }
      case Ids.EAnnotation.self: {
        // EAnnotation
        const result1 = this.caseEAnnotation(eObject as EAnnotation);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEModelElement(eObject as EModelElement);
        if (result2 !== undefined) return result2;
        return this.defaultCase(eObject);
      }
      case Ids.EClass.self: {
        // EClass
        const result1 = this.caseEClass(eObject as EClass);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEClassifier(eObject as EClassifier);
        if (result2 !== undefined) return result2;
        const result3 = this.caseENamedElement(eObject as ENamedElement);
        if (result3 !== undefined) return result3;
        const result4 = this.caseEModelElement(eObject as EModelElement);
        if (result4 !== undefined) return result4;
        return this.defaultCase(eObject);
      }
      case Ids.EDataType.self: {
        // EDataType
        const result1 = this.caseEDataType(eObject as EDataType);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEClassifier(eObject as EClassifier);
        if (result2 !== undefined) return result2;
        const result3 = this.caseENamedElement(eObject as ENamedElement);
        if (result3 !== undefined) return result3;
        const result4 = this.caseEModelElement(eObject as EModelElement);
        if (result4 !== undefined) return result4;
        return this.defaultCase(eObject);
      }
      case Ids.EEnum.self: {
        // EEnum
        const result1 = this.caseEEnum(eObject as EEnum);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEDataType(eObject as EDataType);
        if (result2 !== undefined) return result2;
        const result3 = this.caseEClassifier(eObject as EClassifier);
        if (result3 !== undefined) return result3;
        const result4 = this.caseENamedElement(eObject as ENamedElement);
        if (result4 !== undefined) return result4;
        const result5 = this.caseEModelElement(eObject as EModelElement);
        if (result5 !== undefined) return result5;
        return this.defaultCase(eObject);
      }
      case Ids.EEnumLiteral.self: {
        // EEnumLiteral
        const result1 = this.caseEEnumLiteral(eObject as EEnumLiteral);
        if (result1 !== undefined) return result1;
        const result2 = this.caseENamedElement(eObject as ENamedElement);
        if (result2 !== undefined) return result2;
        const result3 = this.caseEModelElement(eObject as EModelElement);
        if (result3 !== undefined) return result3;
        return this.defaultCase(eObject);
      }
      case Ids.EFactory.self: {
        // EFactory
        const result1 = this.caseEFactory(eObject as EFactory);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEModelElement(eObject as EModelElement);
        if (result2 !== undefined) return result2;
        return this.defaultCase(eObject);
      }
      case Ids.EOperation.self: {
        // EOperation
        const result1 = this.caseEOperation(eObject as EOperation);
        if (result1 !== undefined) return result1;
        const result2 = this.caseETypedElement(eObject as ETypedElement);
        if (result2 !== undefined) return result2;
        const result3 = this.caseENamedElement(eObject as ENamedElement);
        if (result3 !== undefined) return result3;
        const result4 = this.caseEModelElement(eObject as EModelElement);
        if (result4 !== undefined) return result4;
        return this.defaultCase(eObject);
      }
      case Ids.EPackage.self: {
        // EPackage
        const result1 = this.caseEPackage(eObject as EPackage);
        if (result1 !== undefined) return result1;
        const result2 = this.caseENamedElement(eObject as ENamedElement);
        if (result2 !== undefined) return result2;
        const result3 = this.caseEModelElement(eObject as EModelElement);
        if (result3 !== undefined) return result3;
        return this.defaultCase(eObject);
      }
      case Ids.EParameter.self: {
        // EParameter
        const result1 = this.caseEParameter(eObject as EParameter);
        if (result1 !== undefined) return result1;
        const result2 = this.caseETypedElement(eObject as ETypedElement);
        if (result2 !== undefined) return result2;
        const result3 = this.caseENamedElement(eObject as ENamedElement);
        if (result3 !== undefined) return result3;
        const result4 = this.caseEModelElement(eObject as EModelElement);
        if (result4 !== undefined) return result4;
        return this.defaultCase(eObject);
      }
      case Ids.EReference.self: {
        // EReference
        const result1 = this.caseEReference(eObject as EReference);
        if (result1 !== undefined) return result1;
        const result2 = this.caseEStructuralFeature(eObject as EStructuralFeature);
        if (result2 !== undefined) return result2;
        const result3 = this.caseETypedElement(eObject as ETypedElement);
        if (result3 !== undefined) return result3;
        const result4 = this.caseENamedElement(eObject as ENamedElement);
        if (result4 !== undefined) return result4;
        const result5 = this.caseEModelElement(eObject as EModelElement);
        if (result5 !== undefined) return result5;
        return this.defaultCase(eObject);
      }
      case Ids.EStringToStringMapEntry.self: {
        // EStringToStringMapEntry
        const result1 = this.caseEStringToStringMapEntry(eObject as EStringToStringMapEntry);
        if (result1 !== undefined) return result1;
        return this.defaultCase(eObject);
      }
      case Ids.EGenericType.self: {
        // EGenericType
        const result1 = this.caseEGenericType(eObject as EGenericType);
        if (result1 !== undefined) return result1;
        return this.defaultCase(eObject);
      }
      case Ids.ETypeParameter.self: {
        // ETypeParameter
        const result1 = this.caseETypeParameter(eObject as ETypeParameter);
        if (result1 !== undefined) return result1;
        const result2 = this.caseENamedElement(eObject as ENamedElement);
        if (result2 !== undefined) return result2;
        const result3 = this.caseEModelElement(eObject as EModelElement);
        if (result3 !== undefined) return result3;
        return this.defaultCase(eObject);
      }
      default:
        return this.defaultCase(eObject);
    }
  }

  caseEAttribute(object: EAttribute): T | undefined {
    void object;
    return undefined;
  }
  caseEAnnotation(object: EAnnotation): T | undefined {
    void object;
    return undefined;
  }
  caseEClass(object: EClass): T | undefined {
    void object;
    return undefined;
  }
  caseEClassifier(object: EClassifier): T | undefined {
    void object;
    return undefined;
  }
  caseEDataType(object: EDataType): T | undefined {
    void object;
    return undefined;
  }
  caseEEnum(object: EEnum): T | undefined {
    void object;
    return undefined;
  }
  caseEEnumLiteral(object: EEnumLiteral): T | undefined {
    void object;
    return undefined;
  }
  caseEFactory(object: EFactory): T | undefined {
    void object;
    return undefined;
  }
  caseEModelElement(object: EModelElement): T | undefined {
    void object;
    return undefined;
  }
  caseENamedElement(object: ENamedElement): T | undefined {
    void object;
    return undefined;
  }
  caseEOperation(object: EOperation): T | undefined {
    void object;
    return undefined;
  }
  caseEPackage(object: EPackage): T | undefined {
    void object;
    return undefined;
  }
  caseEParameter(object: EParameter): T | undefined {
    void object;
    return undefined;
  }
  caseEReference(object: EReference): T | undefined {
    void object;
    return undefined;
  }
  caseEStructuralFeature(object: EStructuralFeature): T | undefined {
    void object;
    return undefined;
  }
  caseETypedElement(object: ETypedElement): T | undefined {
    void object;
    return undefined;
  }
  caseEStringToStringMapEntry(object: EStringToStringMapEntry): T | undefined {
    void object;
    return undefined;
  }
  caseEGenericType(object: EGenericType): T | undefined {
    void object;
    return undefined;
  }
  caseETypeParameter(object: ETypeParameter): T | undefined {
    void object;
    return undefined;
  }

  defaultCase(object: EObject): T | undefined {
    void object;
    return undefined;
  }
}
