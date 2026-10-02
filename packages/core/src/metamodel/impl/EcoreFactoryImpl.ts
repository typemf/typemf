import { EAnnotationImpl } from './EAnnotationImpl.js';
import { EAttributeImpl } from './EAttributeImpl.js';
import { EClassImpl } from './EClassImpl.js';
import { EDataTypeImpl } from './EDataTypeImpl.js';
import { EEnumImpl } from './EEnumImpl.js';
import { EEnumLiteralImpl } from './EEnumLiteralImpl.js';
import { EFactoryImpl } from './EFactoryImpl.js';
import { EGenericTypeImpl } from './EGenericTypeImpl.js';
import { EOperationImpl } from './EOperationImpl.js';
import { EPackageImpl } from './EPackageImpl.js';
import { EParameterImpl } from './EParameterImpl.js';
import { EReferenceImpl } from './EReferenceImpl.js';
import { EStringToStringMapEntryImpl } from './EStringToStringMapEntryImpl.js';
import { ETypeParameterImpl } from './ETypeParameterImpl.js';
import { EcoreFactory } from '../EcoreFactory.js';
import { Ids } from '../EcorePackage.js';
import { EAnnotation } from '../types/EAnnotation.js';
import { EAttribute } from '../types/EAttribute.js';
import { EClass } from '../types/EClass.js';
import { EDataType } from '../types/EDataType.js';
import { EEnum } from '../types/EEnum.js';
import { EEnumLiteral } from '../types/EEnumLiteral.js';
import { EFactory } from '../types/EFactory.js';
import { EGenericType } from '../types/EGenericType.js';
import { EObject } from '../types/EObject.js';
import { EOperation } from '../types/EOperation.js';
import { EPackage } from '../types/EPackage.js';
import { EParameter } from '../types/EParameter.js';
import { EReference } from '../types/EReference.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { ETypeParameter } from '../types/ETypeParameter.js';

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
        return super.create(eClass);
    }
  }
}
