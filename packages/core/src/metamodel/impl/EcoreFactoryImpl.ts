import { EObject } from '../types/index.js';
import { EcoreFactory } from '../EcoreFactory.js';
import { Ids } from '../EcorePackage.js';
import { EFactoryImpl } from './EFactoryImpl.js';
import { EAttribute, EAnnotation, EClass, EDataType, EEnum, EEnumLiteral, EFactory, EOperation, EPackage, EParameter, EReference, EStringToStringMapEntry, EGenericType, ETypeParameter } from '../types/index.js';
import { EAttributeImpl, EAnnotationImpl, EClassImpl, EDataTypeImpl, EEnumImpl, EEnumLiteralImpl, EOperationImpl, EPackageImpl, EParameterImpl, EReferenceImpl, EStringToStringMapEntryImpl, EGenericTypeImpl, ETypeParameterImpl } from './index.js';


export class EcoreFactoryImpl extends EFactoryImpl implements EcoreFactory {
  createEAttribute(): EAttribute {
    return new EAttributeImpl();
  }
  createEAnnotation(): EAnnotation {
    return new EAnnotationImpl();
  }
  createEClass(): EClass {
    return new EClassImpl();
  }
  createEDataType(): EDataType {
    return new EDataTypeImpl();
  }
  createEEnum(): EEnum {
    return new EEnumImpl();
  }
  createEEnumLiteral(): EEnumLiteral {
    return new EEnumLiteralImpl();
  }
  createEFactory(): EFactory {
    return new EFactoryImpl();
  }
  createEOperation(): EOperation {
    return new EOperationImpl();
  }
  createEPackage(): EPackage {
    return new EPackageImpl();
  }
  createEParameter(): EParameter {
    return new EParameterImpl();
  }
  createEReference(): EReference {
    return new EReferenceImpl();
  }
  createEStringToStringMapEntry(): EStringToStringMapEntry {
    return new EStringToStringMapEntryImpl();
  }
  createEGenericType(): EGenericType {
    return new EGenericTypeImpl();
  }
  createETypeParameter(): ETypeParameter {
    return new ETypeParameterImpl();
  }

  create(eClass: EClass): EObject {
    switch (eClass.getClassifierID()) {
      case Ids.EAttribute.self:
        return this.createEAttribute();
      case Ids.EAnnotation.self:
        return this.createEAnnotation();
      case Ids.EClass.self:
        return this.createEClass();
      case Ids.EDataType.self:
        return this.createEDataType();
      case Ids.EEnum.self:
        return this.createEEnum();
      case Ids.EEnumLiteral.self:
        return this.createEEnumLiteral();
      case Ids.EFactory.self:
        return this.createEFactory();
      case Ids.EOperation.self:
        return this.createEOperation();
      case Ids.EPackage.self:
        return this.createEPackage();
      case Ids.EParameter.self:
        return this.createEParameter();
      case Ids.EReference.self:
        return this.createEReference();
      case Ids.EStringToStringMapEntry.self:
        return this.createEStringToStringMapEntry();
      case Ids.EGenericType.self:
        return this.createEGenericType();
      case Ids.ETypeParameter.self:
        return this.createETypeParameter();
      default:
        throw new Error(
          `Cannot create an instance of classifier id ${eClass.getClassifierID()}: not a known, concrete classifier of this package.`
        );
    }
  }
}
