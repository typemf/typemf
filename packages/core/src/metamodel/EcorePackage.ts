import { EAnnotation } from './types/EAnnotation.js';
import { EAttribute } from './types/EAttribute.js';
import { EClass } from './types/EClass.js';
import { EDataType } from './types/EDataType.js';
import { EPackage } from './types/EPackage.js';
import { EReference } from './types/EReference.js';

/**
 * Classifier/feature IDs, as pure numeric literals - safe to import from
 * anywhere (Factory, Switch) with zero risk of the circular-import hazard
 * that made a lazy, explicit init() necessary for the singleton itself
 * (see EcorePackageImpl.ts) - these are just numbers, never require
 * constructing anything.
 */
export const Ids = {
  EAttribute: { self: 0, iD: 18, eAttributeType: 19 },
  EAnnotation: { self: 1, source: 1, details: 2, eModelElement: 3, contents: 4, references: 5 },
  EClass: { self: 2, abstract: 8, interface: 9, eSuperTypes: 10, eOperations: 11, eAllAttributes: 12, eAllReferences: 13, eReferences: 14, eAttributes: 15, eAllContainments: 16, eAllOperations: 17, eAllStructuralFeatures: 18, eAllSuperTypes: 19, eIDAttribute: 20, eStructuralFeatures: 21, eGenericSuperTypes: 22, eAllGenericSuperTypes: 23 },
  EClassifier: { self: 3, instanceClassName: 2, instanceClass: 3, defaultValue: 4, instanceTypeName: 5, ePackage: 6, eTypeParameters: 7 },
  EDataType: { self: 4, serializable: 8 },
  EEnum: { self: 5, eLiterals: 9 },
  EEnumLiteral: { self: 6, value: 2, instance: 3, literal: 4, eEnum: 5 },
  EFactory: { self: 7, ePackage: 1 },
  EModelElement: { self: 8, eAnnotations: 0 },
  ENamedElement: { self: 9, name: 1 },
  EOperation: { self: 10, eContainingClass: 10, eTypeParameters: 11, eParameters: 12, eExceptions: 13, eGenericExceptions: 14 },
  EPackage: { self: 11, nsURI: 2, nsPrefix: 3, eFactoryInstance: 4, eClassifiers: 5, eSubpackages: 6, eSuperPackage: 7 },
  EParameter: { self: 12, eOperation: 10 },
  EReference: { self: 13, containment: 18, container: 19, resolveProxies: 20, eOpposite: 21, eReferenceType: 22, eKeys: 23 },
  EStructuralFeature: { self: 14, changeable: 10, volatile: 11, transient: 12, defaultValueLiteral: 13, defaultValue: 14, unsettable: 15, derived: 16, eContainingClass: 17 },
  ETypedElement: { self: 15, ordered: 2, unique: 3, lowerBound: 4, upperBound: 5, many: 6, required: 7, eType: 8, eGenericType: 9 },
  EBigDecimal: { self: 16 },
  EBigInteger: { self: 17 },
  EBoolean: { self: 18 },
  EBooleanObject: { self: 19 },
  EByte: { self: 20 },
  EByteArray: { self: 21 },
  EByteObject: { self: 22 },
  EChar: { self: 23 },
  ECharacterObject: { self: 24 },
  EDate: { self: 25 },
  EDiagnosticChain: { self: 26 },
  EDouble: { self: 27 },
  EDoubleObject: { self: 28 },
  EEList: { self: 29 },
  EEnumerator: { self: 30 },
  EFeatureMap: { self: 31 },
  EFeatureMapEntry: { self: 32 },
  EFloat: { self: 33 },
  EFloatObject: { self: 34 },
  EInt: { self: 35 },
  EIntegerObject: { self: 36 },
  EJavaClass: { self: 37 },
  EJavaObject: { self: 38 },
  ELong: { self: 39 },
  ELongObject: { self: 40 },
  EMap: { self: 41 },
  EResource: { self: 42 },
  EResourceSet: { self: 43 },
  EShort: { self: 44 },
  EShortObject: { self: 45 },
  EString: { self: 46 },
  EStringToStringMapEntry: { self: 47, key: 0, value: 1 },
  ETreeIterator: { self: 48 },
  EGenericType: { self: 49, eUpperBound: 0, eTypeArguments: 1, eRawType: 2, eLowerBound: 3, eTypeParameter: 4, eClassifier: 5 },
  ETypeParameter: { self: 50, eBounds: 2 },
  EInvocationTargetException: { self: 51 },
} as const;


export interface EcorePackage extends EPackage {
  getEAttribute(): EClass;
  getEAttribute_ID(): EAttribute;
  getEAttribute_EAttributeType(): EReference;
  getEAnnotation(): EClass;
  getEAnnotation(name : string): EAnnotation | undefined;
  getEAnnotation_Source(): EAttribute;
  getEAnnotation_Details(): EReference;
  getEAnnotation_EModelElement(): EReference;
  getEAnnotation_Contents(): EReference;
  getEAnnotation_References(): EReference;
  getEClass(): EClass;
  getEClass_Abstract(): EAttribute;
  getEClass_Interface(): EAttribute;
  getEClass_ESuperTypes(): EReference;
  getEClass_EOperations(): EReference;
  getEClass_EAllAttributes(): EReference;
  getEClass_EAllReferences(): EReference;
  getEClass_EReferences(): EReference;
  getEClass_EAttributes(): EReference;
  getEClass_EAllContainments(): EReference;
  getEClass_EAllOperations(): EReference;
  getEClass_EAllStructuralFeatures(): EReference;
  getEClass_EAllSuperTypes(): EReference;
  getEClass_EIDAttribute(): EReference;
  getEClass_EStructuralFeatures(): EReference;
  getEClass_EGenericSuperTypes(): EReference;
  getEClass_EAllGenericSuperTypes(): EReference;
  getEClassifier(): EClass;
  getEClassifier_InstanceClassName(): EAttribute;
  getEClassifier_InstanceClass(): EAttribute;
  getEClassifier_DefaultValue(): EAttribute;
  getEClassifier_InstanceTypeName(): EAttribute;
  getEClassifier_EPackage(): EReference;
  getEClassifier_ETypeParameters(): EReference;
  getEDataType(): EClass;
  getEDataType_Serializable(): EAttribute;
  getEEnum(): EClass;
  getEEnum_ELiterals(): EReference;
  getEEnumLiteral(): EClass;
  getEEnumLiteral_Value(): EAttribute;
  getEEnumLiteral_Instance(): EAttribute;
  getEEnumLiteral_Literal(): EAttribute;
  getEEnumLiteral_EEnum(): EReference;
  getEFactory(): EClass;
  getEFactory_EPackage(): EReference;
  getEModelElement(): EClass;
  getEModelElement_EAnnotations(): EReference;
  getENamedElement(): EClass;
  getENamedElement_Name(): EAttribute;
  getEOperation(): EClass;
  getEOperation_EContainingClass(): EReference;
  getEOperation_ETypeParameters(): EReference;
  getEOperation_EParameters(): EReference;
  getEOperation_EExceptions(): EReference;
  getEOperation_EGenericExceptions(): EReference;
  getEPackage(): EClass;
  getEPackage_NsURI(): EAttribute;
  getEPackage_NsPrefix(): EAttribute;
  getEPackage_EFactoryInstance(): EReference;
  getEPackage_EClassifiers(): EReference;
  getEPackage_ESubpackages(): EReference;
  getEPackage_ESuperPackage(): EReference;
  getEParameter(): EClass;
  getEParameter_EOperation(): EReference;
  getEReference(): EClass;
  getEReference_Containment(): EAttribute;
  getEReference_Container(): EAttribute;
  getEReference_ResolveProxies(): EAttribute;
  getEReference_EOpposite(): EReference;
  getEReference_EReferenceType(): EReference;
  getEReference_EKeys(): EReference;
  getEStructuralFeature(): EClass;
  getEStructuralFeature_Changeable(): EAttribute;
  getEStructuralFeature_Volatile(): EAttribute;
  getEStructuralFeature_Transient(): EAttribute;
  getEStructuralFeature_DefaultValueLiteral(): EAttribute;
  getEStructuralFeature_DefaultValue(): EAttribute;
  getEStructuralFeature_Unsettable(): EAttribute;
  getEStructuralFeature_Derived(): EAttribute;
  getEStructuralFeature_EContainingClass(): EReference;
  getETypedElement(): EClass;
  getETypedElement_Ordered(): EAttribute;
  getETypedElement_Unique(): EAttribute;
  getETypedElement_LowerBound(): EAttribute;
  getETypedElement_UpperBound(): EAttribute;
  getETypedElement_Many(): EAttribute;
  getETypedElement_Required(): EAttribute;
  getETypedElement_EType(): EReference;
  getETypedElement_EGenericType(): EReference;
  getEBigDecimal(): EDataType;
  getEBigInteger(): EDataType;
  getEBoolean(): EDataType;
  getEBooleanObject(): EDataType;
  getEByte(): EDataType;
  getEByteArray(): EDataType;
  getEByteObject(): EDataType;
  getEChar(): EDataType;
  getECharacterObject(): EDataType;
  getEDate(): EDataType;
  getEDiagnosticChain(): EDataType;
  getEDouble(): EDataType;
  getEDoubleObject(): EDataType;
  getEEList(): EDataType;
  getEEnumerator(): EDataType;
  getEFeatureMap(): EDataType;
  getEFeatureMapEntry(): EDataType;
  getEFloat(): EDataType;
  getEFloatObject(): EDataType;
  getEInt(): EDataType;
  getEIntegerObject(): EDataType;
  getEJavaClass(): EDataType;
  getEJavaObject(): EDataType;
  getELong(): EDataType;
  getELongObject(): EDataType;
  getEMap(): EDataType;
  getEResource(): EDataType;
  getEResourceSet(): EDataType;
  getEShort(): EDataType;
  getEShortObject(): EDataType;
  getEString(): EDataType;
  getEStringToStringMapEntry(): EClass;
  getEStringToStringMapEntry_Key(): EAttribute;
  getEStringToStringMapEntry_Value(): EAttribute;
  getETreeIterator(): EDataType;
  getEGenericType(): EClass;
  getEGenericType_EUpperBound(): EReference;
  getEGenericType_ETypeArguments(): EReference;
  getEGenericType_ERawType(): EReference;
  getEGenericType_ELowerBound(): EReference;
  getEGenericType_ETypeParameter(): EReference;
  getEGenericType_EClassifier(): EReference;
  getETypeParameter(): EClass;
  getETypeParameter_EBounds(): EReference;
  getEInvocationTargetException(): EDataType;
}
