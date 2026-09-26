import { EObject } from '../types/index.js';
import { Ids } from '../EcorePackage.js';
import { EAttribute, EAnnotation, EClass, EClassifier, EDataType, EEnum, EEnumLiteral, EFactory, EModelElement, ENamedElement, EOperation, EPackage, EParameter, EReference, EStructuralFeature, ETypedElement, EStringToStringMapEntry, EGenericType, ETypeParameter } from '../types/index.js';

export abstract class EcoreSwitch<T> {
  doSwitch(eObject: EObject): T | undefined {
    switch (eObject.eClass().getClassifierID()) {
      case Ids.EAttribute.self: {
        // EAttribute
        let result: T | undefined;
        result = this.caseEAttribute(eObject as EAttribute);
        if (result !== undefined) return result;
        result = this.caseEStructuralFeature(eObject as EStructuralFeature);
        if (result !== undefined) return result;
        result = this.caseETypedElement(eObject as ETypedElement);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EAnnotation.self: {
        // EAnnotation
        let result: T | undefined;
        result = this.caseEAnnotation(eObject as EAnnotation);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EClass.self: {
        // EClass
        let result: T | undefined;
        result = this.caseEClass(eObject as EClass);
        if (result !== undefined) return result;
        result = this.caseEClassifier(eObject as EClassifier);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EDataType.self: {
        // EDataType
        let result: T | undefined;
        result = this.caseEDataType(eObject as EDataType);
        if (result !== undefined) return result;
        result = this.caseEClassifier(eObject as EClassifier);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EEnum.self: {
        // EEnum
        let result: T | undefined;
        result = this.caseEEnum(eObject as EEnum);
        if (result !== undefined) return result;
        result = this.caseEDataType(eObject as EDataType);
        if (result !== undefined) return result;
        result = this.caseEClassifier(eObject as EClassifier);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EEnumLiteral.self: {
        // EEnumLiteral
        let result: T | undefined;
        result = this.caseEEnumLiteral(eObject as EEnumLiteral);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EFactory.self: {
        // EFactory
        let result: T | undefined;
        result = this.caseEFactory(eObject as EFactory);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EOperation.self: {
        // EOperation
        let result: T | undefined;
        result = this.caseEOperation(eObject as EOperation);
        if (result !== undefined) return result;
        result = this.caseETypedElement(eObject as ETypedElement);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EPackage.self: {
        // EPackage
        let result: T | undefined;
        result = this.caseEPackage(eObject as EPackage);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EParameter.self: {
        // EParameter
        let result: T | undefined;
        result = this.caseEParameter(eObject as EParameter);
        if (result !== undefined) return result;
        result = this.caseETypedElement(eObject as ETypedElement);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EReference.self: {
        // EReference
        let result: T | undefined;
        result = this.caseEReference(eObject as EReference);
        if (result !== undefined) return result;
        result = this.caseEStructuralFeature(eObject as EStructuralFeature);
        if (result !== undefined) return result;
        result = this.caseETypedElement(eObject as ETypedElement);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EStringToStringMapEntry.self: {
        // EStringToStringMapEntry
        let result: T | undefined;
        result = this.caseEStringToStringMapEntry(eObject as EStringToStringMapEntry);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.EGenericType.self: {
        // EGenericType
        let result: T | undefined;
        result = this.caseEGenericType(eObject as EGenericType);
        if (result !== undefined) return result;
        return this.defaultCase(eObject);
      }
      case Ids.ETypeParameter.self: {
        // ETypeParameter
        let result: T | undefined;
        result = this.caseETypeParameter(eObject as ETypeParameter);
        if (result !== undefined) return result;
        result = this.caseENamedElement(eObject as ENamedElement);
        if (result !== undefined) return result;
        result = this.caseEModelElement(eObject as EModelElement);
        if (result !== undefined) return result;
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
