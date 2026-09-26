import {
  EClass,
  EAttribute,
  EReference,
  EEnum,
  EDataType,
} from "../types/index.js";
import {
  EPackageImpl,
  EClassImpl,
  EAttributeImpl,
  EReferenceImpl,
  EDataTypeImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EAnnotationImpl,
  EFactoryImpl,
} from "./index.js";
import { EcorePackage, Ids } from "../EcorePackage.js";
import { EcoreFactory } from "../EcoreFactory.js";
import { EcoreFactoryImpl } from "./EcoreFactoryImpl.js";

export class EcorePackageImpl extends EPackageImpl implements EcorePackage {
  private readonly _EAttribute: EClass;
  private readonly _EAttribute_iD: EAttribute;
  private readonly _EAttribute_eAttributeType: EReference;
  private readonly _EAnnotation: EClass;
  private readonly _EAnnotation_source: EAttribute;
  private readonly _EAnnotation_details: EReference;
  private readonly _EAnnotation_eModelElement: EReference;
  private readonly _EAnnotation_contents: EReference;
  private readonly _EAnnotation_references: EReference;
  private readonly _EClass: EClass;
  private readonly _EClass_abstract: EAttribute;
  private readonly _EClass_interface: EAttribute;
  private readonly _EClass_eSuperTypes: EReference;
  private readonly _EClass_eOperations: EReference;
  private readonly _EClass_eAllAttributes: EReference;
  private readonly _EClass_eAllReferences: EReference;
  private readonly _EClass_eReferences: EReference;
  private readonly _EClass_eAttributes: EReference;
  private readonly _EClass_eAllContainments: EReference;
  private readonly _EClass_eAllOperations: EReference;
  private readonly _EClass_eAllStructuralFeatures: EReference;
  private readonly _EClass_eAllSuperTypes: EReference;
  private readonly _EClass_eIDAttribute: EReference;
  private readonly _EClass_eStructuralFeatures: EReference;
  private readonly _EClass_eGenericSuperTypes: EReference;
  private readonly _EClass_eAllGenericSuperTypes: EReference;
  private readonly _EClassifier: EClass;
  private readonly _EClassifier_instanceClassName: EAttribute;
  private readonly _EClassifier_instanceClass: EAttribute;
  private readonly _EClassifier_defaultValue: EAttribute;
  private readonly _EClassifier_instanceTypeName: EAttribute;
  private readonly _EClassifier_ePackage: EReference;
  private readonly _EClassifier_eTypeParameters: EReference;
  private readonly _EDataType: EClass;
  private readonly _EDataType_serializable: EAttribute;
  private readonly _EEnum: EClass;
  private readonly _EEnum_eLiterals: EReference;
  private readonly _EEnumLiteral: EClass;
  private readonly _EEnumLiteral_value: EAttribute;
  private readonly _EEnumLiteral_instance: EAttribute;
  private readonly _EEnumLiteral_literal: EAttribute;
  private readonly _EEnumLiteral_eEnum: EReference;
  private readonly _EFactory: EClass;
  private readonly _EFactory_ePackage: EReference;
  private readonly _EModelElement: EClass;
  private readonly _EModelElement_eAnnotations: EReference;
  private readonly _ENamedElement: EClass;
  private readonly _ENamedElement_name: EAttribute;
  private readonly _EOperation: EClass;
  private readonly _EOperation_eContainingClass: EReference;
  private readonly _EOperation_eTypeParameters: EReference;
  private readonly _EOperation_eParameters: EReference;
  private readonly _EOperation_eExceptions: EReference;
  private readonly _EOperation_eGenericExceptions: EReference;
  private readonly _EPackage: EClass;
  private readonly _EPackage_nsURI: EAttribute;
  private readonly _EPackage_nsPrefix: EAttribute;
  private readonly _EPackage_eFactoryInstance: EReference;
  private readonly _EPackage_eClassifiers: EReference;
  private readonly _EPackage_eSubpackages: EReference;
  private readonly _EPackage_eSuperPackage: EReference;
  private readonly _EParameter: EClass;
  private readonly _EParameter_eOperation: EReference;
  private readonly _EReference: EClass;
  private readonly _EReference_containment: EAttribute;
  private readonly _EReference_container: EAttribute;
  private readonly _EReference_resolveProxies: EAttribute;
  private readonly _EReference_eOpposite: EReference;
  private readonly _EReference_eReferenceType: EReference;
  private readonly _EReference_eKeys: EReference;
  private readonly _EStructuralFeature: EClass;
  private readonly _EStructuralFeature_changeable: EAttribute;
  private readonly _EStructuralFeature_volatile: EAttribute;
  private readonly _EStructuralFeature_transient: EAttribute;
  private readonly _EStructuralFeature_defaultValueLiteral: EAttribute;
  private readonly _EStructuralFeature_defaultValue: EAttribute;
  private readonly _EStructuralFeature_unsettable: EAttribute;
  private readonly _EStructuralFeature_derived: EAttribute;
  private readonly _EStructuralFeature_eContainingClass: EReference;
  private readonly _ETypedElement: EClass;
  private readonly _ETypedElement_ordered: EAttribute;
  private readonly _ETypedElement_unique: EAttribute;
  private readonly _ETypedElement_lowerBound: EAttribute;
  private readonly _ETypedElement_upperBound: EAttribute;
  private readonly _ETypedElement_many: EAttribute;
  private readonly _ETypedElement_required: EAttribute;
  private readonly _ETypedElement_eType: EReference;
  private readonly _ETypedElement_eGenericType: EReference;
  private readonly _EBigDecimal: EDataType;
  private readonly _EBigInteger: EDataType;
  private readonly _EBoolean: EDataType;
  private readonly _EBooleanObject: EDataType;
  private readonly _EByte: EDataType;
  private readonly _EByteArray: EDataType;
  private readonly _EByteObject: EDataType;
  private readonly _EChar: EDataType;
  private readonly _ECharacterObject: EDataType;
  private readonly _EDate: EDataType;
  private readonly _EDiagnosticChain: EDataType;
  private readonly _EDouble: EDataType;
  private readonly _EDoubleObject: EDataType;
  private readonly _EEList: EDataType;
  private readonly _EEnumerator: EDataType;
  private readonly _EFeatureMap: EDataType;
  private readonly _EFeatureMapEntry: EDataType;
  private readonly _EFloat: EDataType;
  private readonly _EFloatObject: EDataType;
  private readonly _EInt: EDataType;
  private readonly _EIntegerObject: EDataType;
  private readonly _EJavaClass: EDataType;
  private readonly _EJavaObject: EDataType;
  private readonly _ELong: EDataType;
  private readonly _ELongObject: EDataType;
  private readonly _EMap: EDataType;
  private readonly _EResource: EDataType;
  private readonly _EResourceSet: EDataType;
  private readonly _EShort: EDataType;
  private readonly _EShortObject: EDataType;
  private readonly _EString: EDataType;
  private readonly _EStringToStringMapEntry: EClass;
  private readonly _EStringToStringMapEntry_key: EAttribute;
  private readonly _EStringToStringMapEntry_value: EAttribute;
  private readonly _ETreeIterator: EDataType;
  private readonly _EGenericType: EClass;
  private readonly _EGenericType_eUpperBound: EReference;
  private readonly _EGenericType_eTypeArguments: EReference;
  private readonly _EGenericType_eRawType: EReference;
  private readonly _EGenericType_eLowerBound: EReference;
  private readonly _EGenericType_eTypeParameter: EReference;
  private readonly _EGenericType_eClassifier: EReference;
  private readonly _ETypeParameter: EClass;
  private readonly _ETypeParameter_eBounds: EReference;
  private readonly _EInvocationTargetException: EDataType;

  private static _instance: EcorePackageImpl | undefined;

  /**
   * The one explicit entry point that constructs the singleton - call it
   * yourself, with your own factory, before anything else in your program
   * touches EcorePackageImpl.eINSTANCE, to use a custom factory (e.g. one
   * overriding createX() to return your own derived classes). Whichever
   * caller gets here FIRST wins; a later call with a *different* factory
   * is logged and otherwise ignored, rather than silently replacing an
   * already-in-use singleton or throwing on a caller who didn't cause the
   * conflict.
   */
  static init(factory?: EcoreFactory): EcorePackageImpl {
    if (!EcorePackageImpl._instance) {
      EcorePackageImpl._instance = new EcorePackageImpl();
      EcorePackageImpl._instance.setEFactoryInstance(
        factory ?? new EcoreFactoryImpl(),
      );
    } else if (factory) {
      console.warn(
        "EcorePackageImpl.init() called again with a different factory after the singleton already " +
          "existed - ignoring the new factory and keeping the existing one.",
      );
    }
    return EcorePackageImpl._instance;
  }

  static get eINSTANCE(): EcorePackageImpl {
    return EcorePackageImpl.init();
  }

  private constructor() {
    super();
    this.setName("ecore");
    this.setNsURI("http://www.eclipse.org/emf/2002/Ecore");
    this.setNsPrefix("ecore");

    // Pass 1: create every classifier (empty shell - no features/supertypes
    // yet), so later passes can reference any of them regardless of
    // declaration order.
    this._EAttribute = new EClassImpl();
    this._EAttribute.setName("EAttribute");
    this._EAttribute.setClassifierID(Ids.EAttribute.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation.getDetails().set("constraints", "ConsistentTransient");
      this._EAttribute.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EAttribute);
    this._EAnnotation = new EClassImpl();
    this._EAnnotation.setName("EAnnotation");
    this._EAnnotation.setClassifierID(Ids.EAnnotation.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation.getDetails().set("constraints", "WellFormedSourceURI");
      this._EAnnotation.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EAnnotation);
    this._EClass = new EClassImpl();
    this._EClass.setName("EClass");
    this._EClass.setClassifierID(Ids.EClass.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "InterfaceIsAbstract AtMostOneID UniqueFeatureNames UniqueOperationSignatures NoCircularSuperTypes WellFormedMapEntryClass ConsistentSuperTypes DisjointFeatureAndOperationSignatures",
        );
      this._EClass.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EClass);
    this._EClassifier = new EClassImpl();
    this._EClassifier.setName("EClassifier");
    this._EClassifier.setClassifierID(Ids.EClassifier.self);
    this._EClassifier.setAbstract(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "WellFormedInstanceTypeName UniqueTypeParameterNames",
        );
      this._EClassifier.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EClassifier);
    this._EDataType = new EClassImpl();
    this._EDataType.setName("EDataType");
    this._EDataType.setClassifierID(Ids.EDataType.self);

    this.getEClassifiers().add(this._EDataType);
    this._EEnum = new EClassImpl();
    this._EEnum.setName("EEnum");
    this._EEnum.setClassifierID(Ids.EEnum.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set("constraints", "UniqueEnumeratorNames UniqueEnumeratorLiterals");
      this._EEnum.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EEnum);
    this._EEnumLiteral = new EClassImpl();
    this._EEnumLiteral.setName("EEnumLiteral");
    this._EEnumLiteral.setClassifierID(Ids.EEnumLiteral.self);

    this.getEClassifiers().add(this._EEnumLiteral);
    this._EFactory = new EClassImpl();
    this._EFactory.setName("EFactory");
    this._EFactory.setClassifierID(Ids.EFactory.self);

    this.getEClassifiers().add(this._EFactory);
    this._EModelElement = new EClassImpl();
    this._EModelElement.setName("EModelElement");
    this._EModelElement.setClassifierID(Ids.EModelElement.self);
    this._EModelElement.setAbstract(true);

    this.getEClassifiers().add(this._EModelElement);
    this._ENamedElement = new EClassImpl();
    this._ENamedElement.setName("ENamedElement");
    this._ENamedElement.setClassifierID(Ids.ENamedElement.self);
    this._ENamedElement.setAbstract(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation.getDetails().set("constraints", "WellFormedName");
      this._ENamedElement.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._ENamedElement);
    this._EOperation = new EClassImpl();
    this._EOperation.setName("EOperation");
    this._EOperation.setClassifierID(Ids.EOperation.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "UniqueParameterNames UniqueTypeParameterNames NoRepeatingVoid",
        );
      this._EOperation.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EOperation);
    this._EPackage = new EClassImpl();
    this._EPackage.setName("EPackage");
    this._EPackage.setClassifierID(Ids.EPackage.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "WellFormedNsURI WellFormedNsPrefix UniqueSubpackageNames UniqueClassifierNames UniqueNsURIs",
        );
      this._EPackage.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EPackage);
    this._EParameter = new EClassImpl();
    this._EParameter.setName("EParameter");
    this._EParameter.setClassifierID(Ids.EParameter.self);

    this.getEClassifiers().add(this._EParameter);
    this._EReference = new EClassImpl();
    this._EReference.setName("EReference");
    this._EReference.setClassifierID(Ids.EReference.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "ConsistentOpposite SingleContainer ConsistentKeys ConsistentUnique ConsistentContainer",
        );
      this._EReference.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EReference);
    this._EStructuralFeature = new EClassImpl();
    this._EStructuralFeature.setName("EStructuralFeature");
    this._EStructuralFeature.setClassifierID(Ids.EStructuralFeature.self);
    this._EStructuralFeature.setAbstract(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation.getDetails().set("constraints", "ValidDefaultValueLiteral");
      this._EStructuralFeature.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EStructuralFeature);
    this._ETypedElement = new EClassImpl();
    this._ETypedElement.setName("ETypedElement");
    this._ETypedElement.setClassifierID(Ids.ETypedElement.self);
    this._ETypedElement.setAbstract(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "ValidLowerBound ValidUpperBound ConsistentBounds ValidType",
        );
      this._ETypedElement.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._ETypedElement);
    this._EBigDecimal = new EDataTypeImpl();
    this._EBigDecimal.setName("EBigDecimal");
    this._EBigDecimal.setClassifierID(Ids.EBigDecimal.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#decimal");
      this._EBigDecimal.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EBigDecimal);
    this._EBigInteger = new EDataTypeImpl();
    this._EBigInteger.setName("EBigInteger");
    this._EBigInteger.setClassifierID(Ids.EBigInteger.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#integer");
      this._EBigInteger.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EBigInteger);
    this._EBoolean = new EDataTypeImpl();
    this._EBoolean.setName("EBoolean");
    this._EBoolean.setClassifierID(Ids.EBoolean.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#boolean");
      this._EBoolean.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EBoolean);
    this._EBooleanObject = new EDataTypeImpl();
    this._EBooleanObject.setName("EBooleanObject");
    this._EBooleanObject.setClassifierID(Ids.EBooleanObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EBoolean");
      annotation.getDetails().set("name", "EBoolean:Object");
      this._EBooleanObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EBooleanObject);
    this._EByte = new EDataTypeImpl();
    this._EByte.setName("EByte");
    this._EByte.setClassifierID(Ids.EByte.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#byte");
      this._EByte.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EByte);
    this._EByteArray = new EDataTypeImpl();
    this._EByteArray.setName("EByteArray");
    this._EByteArray.setClassifierID(Ids.EByteArray.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#hexBinary");
      this._EByteArray.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EByteArray);
    this._EByteObject = new EDataTypeImpl();
    this._EByteObject.setName("EByteObject");
    this._EByteObject.setClassifierID(Ids.EByteObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EByte");
      annotation.getDetails().set("name", "EByte:Object");
      this._EByteObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EByteObject);
    this._EChar = new EDataTypeImpl();
    this._EChar.setName("EChar");
    this._EChar.setClassifierID(Ids.EChar.self);

    this.getEClassifiers().add(this._EChar);
    this._ECharacterObject = new EDataTypeImpl();
    this._ECharacterObject.setName("ECharacterObject");
    this._ECharacterObject.setClassifierID(Ids.ECharacterObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EChar");
      annotation.getDetails().set("name", "EChar:Object");
      this._ECharacterObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._ECharacterObject);
    this._EDate = new EDataTypeImpl();
    this._EDate.setName("EDate");
    this._EDate.setClassifierID(Ids.EDate.self);

    this.getEClassifiers().add(this._EDate);
    this._EDiagnosticChain = new EDataTypeImpl();
    this._EDiagnosticChain.setName("EDiagnosticChain");
    this._EDiagnosticChain.setClassifierID(Ids.EDiagnosticChain.self);

    this.getEClassifiers().add(this._EDiagnosticChain);
    this._EDouble = new EDataTypeImpl();
    this._EDouble.setName("EDouble");
    this._EDouble.setClassifierID(Ids.EDouble.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#double");
      this._EDouble.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EDouble);
    this._EDoubleObject = new EDataTypeImpl();
    this._EDoubleObject.setName("EDoubleObject");
    this._EDoubleObject.setClassifierID(Ids.EDoubleObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EDouble");
      annotation.getDetails().set("name", "EDouble:Object");
      this._EDoubleObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EDoubleObject);
    this._EEList = new EDataTypeImpl();
    this._EEList.setName("EEList");
    this._EEList.setClassifierID(Ids.EEList.self);

    this.getEClassifiers().add(this._EEList);
    this._EEnumerator = new EDataTypeImpl();
    this._EEnumerator.setName("EEnumerator");
    this._EEnumerator.setClassifierID(Ids.EEnumerator.self);

    this.getEClassifiers().add(this._EEnumerator);
    this._EFeatureMap = new EDataTypeImpl();
    this._EFeatureMap.setName("EFeatureMap");
    this._EFeatureMap.setClassifierID(Ids.EFeatureMap.self);

    this.getEClassifiers().add(this._EFeatureMap);
    this._EFeatureMapEntry = new EDataTypeImpl();
    this._EFeatureMapEntry.setName("EFeatureMapEntry");
    this._EFeatureMapEntry.setClassifierID(Ids.EFeatureMapEntry.self);

    this.getEClassifiers().add(this._EFeatureMapEntry);
    this._EFloat = new EDataTypeImpl();
    this._EFloat.setName("EFloat");
    this._EFloat.setClassifierID(Ids.EFloat.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#float");
      this._EFloat.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EFloat);
    this._EFloatObject = new EDataTypeImpl();
    this._EFloatObject.setName("EFloatObject");
    this._EFloatObject.setClassifierID(Ids.EFloatObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EFloat");
      annotation.getDetails().set("name", "EFloat:Object");
      this._EFloatObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EFloatObject);
    this._EInt = new EDataTypeImpl();
    this._EInt.setName("EInt");
    this._EInt.setClassifierID(Ids.EInt.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#int");
      this._EInt.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EInt);
    this._EIntegerObject = new EDataTypeImpl();
    this._EIntegerObject.setName("EIntegerObject");
    this._EIntegerObject.setClassifierID(Ids.EIntegerObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EInt");
      annotation.getDetails().set("name", "EInt:Object");
      this._EIntegerObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EIntegerObject);
    this._EJavaClass = new EDataTypeImpl();
    this._EJavaClass.setName("EJavaClass");
    this._EJavaClass.setClassifierID(Ids.EJavaClass.self);

    this.getEClassifiers().add(this._EJavaClass);
    this._EJavaObject = new EDataTypeImpl();
    this._EJavaObject.setName("EJavaObject");
    this._EJavaObject.setClassifierID(Ids.EJavaObject.self);

    this.getEClassifiers().add(this._EJavaObject);
    this._ELong = new EDataTypeImpl();
    this._ELong.setName("ELong");
    this._ELong.setClassifierID(Ids.ELong.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#long");
      this._ELong.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._ELong);
    this._ELongObject = new EDataTypeImpl();
    this._ELongObject.setName("ELongObject");
    this._ELongObject.setClassifierID(Ids.ELongObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "ELong");
      annotation.getDetails().set("name", "ELong:Object");
      this._ELongObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._ELongObject);
    this._EMap = new EDataTypeImpl();
    this._EMap.setName("EMap");
    this._EMap.setClassifierID(Ids.EMap.self);

    this.getEClassifiers().add(this._EMap);
    this._EResource = new EDataTypeImpl();
    this._EResource.setName("EResource");
    this._EResource.setClassifierID(Ids.EResource.self);

    this.getEClassifiers().add(this._EResource);
    this._EResourceSet = new EDataTypeImpl();
    this._EResourceSet.setName("EResourceSet");
    this._EResourceSet.setClassifierID(Ids.EResourceSet.self);

    this.getEClassifiers().add(this._EResourceSet);
    this._EShort = new EDataTypeImpl();
    this._EShort.setName("EShort");
    this._EShort.setClassifierID(Ids.EShort.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#short");
      this._EShort.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EShort);
    this._EShortObject = new EDataTypeImpl();
    this._EShortObject.setName("EShortObject");
    this._EShortObject.setClassifierID(Ids.EShortObject.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation.getDetails().set("baseType", "EShort");
      annotation.getDetails().set("name", "EShort:Object");
      this._EShortObject.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EShortObject);
    this._EString = new EDataTypeImpl();
    this._EString.setName("EString");
    this._EString.setClassifierID(Ids.EString.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource(
        "http:///org/eclipse/emf/ecore/util/ExtendedMetaData",
      );
      annotation
        .getDetails()
        .set("baseType", "http://www.w3.org/2001/XMLSchema#string");
      this._EString.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EString);
    this._EStringToStringMapEntry = new EClassImpl();
    this._EStringToStringMapEntry.setName("EStringToStringMapEntry");
    this._EStringToStringMapEntry.setClassifierID(
      Ids.EStringToStringMapEntry.self,
    );

    this.getEClassifiers().add(this._EStringToStringMapEntry);
    this._ETreeIterator = new EDataTypeImpl();
    this._ETreeIterator.setName("ETreeIterator");
    this._ETreeIterator.setClassifierID(Ids.ETreeIterator.self);

    this.getEClassifiers().add(this._ETreeIterator);
    this._EGenericType = new EClassImpl();
    this._EGenericType.setName("EGenericType");
    this._EGenericType.setClassifierID(Ids.EGenericType.self);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/Ecore");
      annotation
        .getDetails()
        .set(
          "constraints",
          "ConsistentType ConsistentBounds ConsistentArguments",
        );
      this._EGenericType.getEAnnotations().add(annotation);
    }

    this.getEClassifiers().add(this._EGenericType);
    this._ETypeParameter = new EClassImpl();
    this._ETypeParameter.setName("ETypeParameter");
    this._ETypeParameter.setClassifierID(Ids.ETypeParameter.self);

    this.getEClassifiers().add(this._ETypeParameter);
    this._EInvocationTargetException = new EDataTypeImpl();
    this._EInvocationTargetException.setName("EInvocationTargetException");
    this._EInvocationTargetException.setClassifierID(
      Ids.EInvocationTargetException.self,
    );

    this.getEClassifiers().add(this._EInvocationTargetException);

    // Pass 2: attributes/references, now that every classifier (including
    // ones referenced as a feature's eType) already exists.
    this._EAttribute_iD = new EAttributeImpl();
    this._EAttribute_iD.setName("iD");
    this._EAttribute_iD.setEType(this._EBoolean);
    this._EAttribute_iD.setLowerBound(0);
    this._EAttribute_iD.setUpperBound(1);
    this._EAttribute_iD.setFeatureID(Ids.EAttribute.iD);
    this._EAttribute_iD.setEContainingClass(this._EAttribute);

    this._EAttribute.getEStructuralFeatures().add(this._EAttribute_iD);
    this._EAttribute_eAttributeType = new EReferenceImpl();
    this._EAttribute_eAttributeType.setName("eAttributeType");
    this._EAttribute_eAttributeType.setEType(this._EDataType);
    this._EAttribute_eAttributeType.setLowerBound(1);
    this._EAttribute_eAttributeType.setUpperBound(1);
    this._EAttribute_eAttributeType.setFeatureID(Ids.EAttribute.eAttributeType);
    this._EAttribute_eAttributeType.setEContainingClass(this._EAttribute);
    this._EAttribute_eAttributeType.setContainment(false);

    this._EAttribute
      .getEStructuralFeatures()
      .add(this._EAttribute_eAttributeType);
    this._EAnnotation_source = new EAttributeImpl();
    this._EAnnotation_source.setName("source");
    this._EAnnotation_source.setEType(this._EString);
    this._EAnnotation_source.setLowerBound(0);
    this._EAnnotation_source.setUpperBound(1);
    this._EAnnotation_source.setFeatureID(Ids.EAnnotation.source);
    this._EAnnotation_source.setEContainingClass(this._EAnnotation);

    this._EAnnotation.getEStructuralFeatures().add(this._EAnnotation_source);
    this._EAnnotation_details = new EReferenceImpl();
    this._EAnnotation_details.setName("details");
    this._EAnnotation_details.setEType(this._EStringToStringMapEntry);
    this._EAnnotation_details.setLowerBound(0);
    this._EAnnotation_details.setUpperBound(-1);
    this._EAnnotation_details.setFeatureID(Ids.EAnnotation.details);
    this._EAnnotation_details.setEContainingClass(this._EAnnotation);
    this._EAnnotation_details.setContainment(true);

    this._EAnnotation.getEStructuralFeatures().add(this._EAnnotation_details);
    this._EAnnotation_eModelElement = new EReferenceImpl();
    this._EAnnotation_eModelElement.setName("eModelElement");
    this._EAnnotation_eModelElement.setEType(this._EModelElement);
    this._EAnnotation_eModelElement.setLowerBound(0);
    this._EAnnotation_eModelElement.setUpperBound(1);
    this._EAnnotation_eModelElement.setFeatureID(Ids.EAnnotation.eModelElement);
    this._EAnnotation_eModelElement.setEContainingClass(this._EAnnotation);
    this._EAnnotation_eModelElement.setContainment(false);

    this._EAnnotation
      .getEStructuralFeatures()
      .add(this._EAnnotation_eModelElement);
    this._EAnnotation_contents = new EReferenceImpl();
    this._EAnnotation_contents.setName("contents");
    this._EAnnotation_contents.setLowerBound(0);
    this._EAnnotation_contents.setUpperBound(-1);
    this._EAnnotation_contents.setFeatureID(Ids.EAnnotation.contents);
    this._EAnnotation_contents.setEContainingClass(this._EAnnotation);
    this._EAnnotation_contents.setContainment(true);

    this._EAnnotation.getEStructuralFeatures().add(this._EAnnotation_contents);
    this._EAnnotation_references = new EReferenceImpl();
    this._EAnnotation_references.setName("references");
    this._EAnnotation_references.setLowerBound(0);
    this._EAnnotation_references.setUpperBound(-1);
    this._EAnnotation_references.setFeatureID(Ids.EAnnotation.references);
    this._EAnnotation_references.setEContainingClass(this._EAnnotation);
    this._EAnnotation_references.setContainment(false);

    this._EAnnotation
      .getEStructuralFeatures()
      .add(this._EAnnotation_references);
    this._EClass_abstract = new EAttributeImpl();
    this._EClass_abstract.setName("abstract");
    this._EClass_abstract.setEType(this._EBoolean);
    this._EClass_abstract.setLowerBound(0);
    this._EClass_abstract.setUpperBound(1);
    this._EClass_abstract.setFeatureID(Ids.EClass.abstract);
    this._EClass_abstract.setEContainingClass(this._EClass);

    this._EClass.getEStructuralFeatures().add(this._EClass_abstract);
    this._EClass_interface = new EAttributeImpl();
    this._EClass_interface.setName("interface");
    this._EClass_interface.setEType(this._EBoolean);
    this._EClass_interface.setLowerBound(0);
    this._EClass_interface.setUpperBound(1);
    this._EClass_interface.setFeatureID(Ids.EClass.interface);
    this._EClass_interface.setEContainingClass(this._EClass);

    this._EClass.getEStructuralFeatures().add(this._EClass_interface);
    this._EClass_eSuperTypes = new EReferenceImpl();
    this._EClass_eSuperTypes.setName("eSuperTypes");
    this._EClass_eSuperTypes.setEType(this._EClass);
    this._EClass_eSuperTypes.setLowerBound(0);
    this._EClass_eSuperTypes.setUpperBound(-1);
    this._EClass_eSuperTypes.setFeatureID(Ids.EClass.eSuperTypes);
    this._EClass_eSuperTypes.setEContainingClass(this._EClass);
    this._EClass_eSuperTypes.setContainment(false);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._EClass_eSuperTypes.getEAnnotations().add(annotation);
    }

    this._EClass.getEStructuralFeatures().add(this._EClass_eSuperTypes);
    this._EClass_eOperations = new EReferenceImpl();
    this._EClass_eOperations.setName("eOperations");
    this._EClass_eOperations.setEType(this._EOperation);
    this._EClass_eOperations.setLowerBound(0);
    this._EClass_eOperations.setUpperBound(-1);
    this._EClass_eOperations.setFeatureID(Ids.EClass.eOperations);
    this._EClass_eOperations.setEContainingClass(this._EClass);
    this._EClass_eOperations.setContainment(true);

    this._EClass.getEStructuralFeatures().add(this._EClass_eOperations);
    this._EClass_eAllAttributes = new EReferenceImpl();
    this._EClass_eAllAttributes.setName("eAllAttributes");
    this._EClass_eAllAttributes.setEType(this._EAttribute);
    this._EClass_eAllAttributes.setLowerBound(0);
    this._EClass_eAllAttributes.setUpperBound(-1);
    this._EClass_eAllAttributes.setFeatureID(Ids.EClass.eAllAttributes);
    this._EClass_eAllAttributes.setEContainingClass(this._EClass);
    this._EClass_eAllAttributes.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eAllAttributes);
    this._EClass_eAllReferences = new EReferenceImpl();
    this._EClass_eAllReferences.setName("eAllReferences");
    this._EClass_eAllReferences.setEType(this._EReference);
    this._EClass_eAllReferences.setLowerBound(0);
    this._EClass_eAllReferences.setUpperBound(-1);
    this._EClass_eAllReferences.setFeatureID(Ids.EClass.eAllReferences);
    this._EClass_eAllReferences.setEContainingClass(this._EClass);
    this._EClass_eAllReferences.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eAllReferences);
    this._EClass_eReferences = new EReferenceImpl();
    this._EClass_eReferences.setName("eReferences");
    this._EClass_eReferences.setEType(this._EReference);
    this._EClass_eReferences.setLowerBound(0);
    this._EClass_eReferences.setUpperBound(-1);
    this._EClass_eReferences.setFeatureID(Ids.EClass.eReferences);
    this._EClass_eReferences.setEContainingClass(this._EClass);
    this._EClass_eReferences.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eReferences);
    this._EClass_eAttributes = new EReferenceImpl();
    this._EClass_eAttributes.setName("eAttributes");
    this._EClass_eAttributes.setEType(this._EAttribute);
    this._EClass_eAttributes.setLowerBound(0);
    this._EClass_eAttributes.setUpperBound(-1);
    this._EClass_eAttributes.setFeatureID(Ids.EClass.eAttributes);
    this._EClass_eAttributes.setEContainingClass(this._EClass);
    this._EClass_eAttributes.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eAttributes);
    this._EClass_eAllContainments = new EReferenceImpl();
    this._EClass_eAllContainments.setName("eAllContainments");
    this._EClass_eAllContainments.setEType(this._EReference);
    this._EClass_eAllContainments.setLowerBound(0);
    this._EClass_eAllContainments.setUpperBound(-1);
    this._EClass_eAllContainments.setFeatureID(Ids.EClass.eAllContainments);
    this._EClass_eAllContainments.setEContainingClass(this._EClass);
    this._EClass_eAllContainments.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eAllContainments);
    this._EClass_eAllOperations = new EReferenceImpl();
    this._EClass_eAllOperations.setName("eAllOperations");
    this._EClass_eAllOperations.setEType(this._EOperation);
    this._EClass_eAllOperations.setLowerBound(0);
    this._EClass_eAllOperations.setUpperBound(-1);
    this._EClass_eAllOperations.setFeatureID(Ids.EClass.eAllOperations);
    this._EClass_eAllOperations.setEContainingClass(this._EClass);
    this._EClass_eAllOperations.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eAllOperations);
    this._EClass_eAllStructuralFeatures = new EReferenceImpl();
    this._EClass_eAllStructuralFeatures.setName("eAllStructuralFeatures");
    this._EClass_eAllStructuralFeatures.setEType(this._EStructuralFeature);
    this._EClass_eAllStructuralFeatures.setLowerBound(0);
    this._EClass_eAllStructuralFeatures.setUpperBound(-1);
    this._EClass_eAllStructuralFeatures.setFeatureID(
      Ids.EClass.eAllStructuralFeatures,
    );
    this._EClass_eAllStructuralFeatures.setEContainingClass(this._EClass);
    this._EClass_eAllStructuralFeatures.setContainment(false);

    this._EClass
      .getEStructuralFeatures()
      .add(this._EClass_eAllStructuralFeatures);
    this._EClass_eAllSuperTypes = new EReferenceImpl();
    this._EClass_eAllSuperTypes.setName("eAllSuperTypes");
    this._EClass_eAllSuperTypes.setEType(this._EClass);
    this._EClass_eAllSuperTypes.setLowerBound(0);
    this._EClass_eAllSuperTypes.setUpperBound(-1);
    this._EClass_eAllSuperTypes.setFeatureID(Ids.EClass.eAllSuperTypes);
    this._EClass_eAllSuperTypes.setEContainingClass(this._EClass);
    this._EClass_eAllSuperTypes.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eAllSuperTypes);
    this._EClass_eIDAttribute = new EReferenceImpl();
    this._EClass_eIDAttribute.setName("eIDAttribute");
    this._EClass_eIDAttribute.setEType(this._EAttribute);
    this._EClass_eIDAttribute.setLowerBound(0);
    this._EClass_eIDAttribute.setUpperBound(1);
    this._EClass_eIDAttribute.setFeatureID(Ids.EClass.eIDAttribute);
    this._EClass_eIDAttribute.setEContainingClass(this._EClass);
    this._EClass_eIDAttribute.setContainment(false);

    this._EClass.getEStructuralFeatures().add(this._EClass_eIDAttribute);
    this._EClass_eStructuralFeatures = new EReferenceImpl();
    this._EClass_eStructuralFeatures.setName("eStructuralFeatures");
    this._EClass_eStructuralFeatures.setEType(this._EStructuralFeature);
    this._EClass_eStructuralFeatures.setLowerBound(0);
    this._EClass_eStructuralFeatures.setUpperBound(-1);
    this._EClass_eStructuralFeatures.setFeatureID(
      Ids.EClass.eStructuralFeatures,
    );
    this._EClass_eStructuralFeatures.setEContainingClass(this._EClass);
    this._EClass_eStructuralFeatures.setContainment(true);

    this._EClass.getEStructuralFeatures().add(this._EClass_eStructuralFeatures);
    this._EClass_eGenericSuperTypes = new EReferenceImpl();
    this._EClass_eGenericSuperTypes.setName("eGenericSuperTypes");
    this._EClass_eGenericSuperTypes.setEType(this._EGenericType);
    this._EClass_eGenericSuperTypes.setLowerBound(0);
    this._EClass_eGenericSuperTypes.setUpperBound(-1);
    this._EClass_eGenericSuperTypes.setFeatureID(Ids.EClass.eGenericSuperTypes);
    this._EClass_eGenericSuperTypes.setEContainingClass(this._EClass);
    this._EClass_eGenericSuperTypes.setContainment(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._EClass_eGenericSuperTypes.getEAnnotations().add(annotation);
    }

    this._EClass.getEStructuralFeatures().add(this._EClass_eGenericSuperTypes);
    this._EClass_eAllGenericSuperTypes = new EReferenceImpl();
    this._EClass_eAllGenericSuperTypes.setName("eAllGenericSuperTypes");
    this._EClass_eAllGenericSuperTypes.setEType(this._EGenericType);
    this._EClass_eAllGenericSuperTypes.setLowerBound(0);
    this._EClass_eAllGenericSuperTypes.setUpperBound(-1);
    this._EClass_eAllGenericSuperTypes.setFeatureID(
      Ids.EClass.eAllGenericSuperTypes,
    );
    this._EClass_eAllGenericSuperTypes.setEContainingClass(this._EClass);
    this._EClass_eAllGenericSuperTypes.setContainment(false);

    this._EClass
      .getEStructuralFeatures()
      .add(this._EClass_eAllGenericSuperTypes);
    this._EClassifier_instanceClassName = new EAttributeImpl();
    this._EClassifier_instanceClassName.setName("instanceClassName");
    this._EClassifier_instanceClassName.setEType(this._EString);
    this._EClassifier_instanceClassName.setLowerBound(0);
    this._EClassifier_instanceClassName.setUpperBound(1);
    this._EClassifier_instanceClassName.setFeatureID(
      Ids.EClassifier.instanceClassName,
    );
    this._EClassifier_instanceClassName.setEContainingClass(this._EClassifier);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._EClassifier_instanceClassName.getEAnnotations().add(annotation);
    }

    this._EClassifier
      .getEStructuralFeatures()
      .add(this._EClassifier_instanceClassName);
    this._EClassifier_instanceClass = new EAttributeImpl();
    this._EClassifier_instanceClass.setName("instanceClass");
    this._EClassifier_instanceClass.setEType(this._EJavaClass);
    this._EClassifier_instanceClass.setLowerBound(0);
    this._EClassifier_instanceClass.setUpperBound(1);
    this._EClassifier_instanceClass.setFeatureID(Ids.EClassifier.instanceClass);
    this._EClassifier_instanceClass.setEContainingClass(this._EClassifier);

    this._EClassifier
      .getEStructuralFeatures()
      .add(this._EClassifier_instanceClass);
    this._EClassifier_defaultValue = new EAttributeImpl();
    this._EClassifier_defaultValue.setName("defaultValue");
    this._EClassifier_defaultValue.setEType(this._EJavaObject);
    this._EClassifier_defaultValue.setLowerBound(0);
    this._EClassifier_defaultValue.setUpperBound(1);
    this._EClassifier_defaultValue.setFeatureID(Ids.EClassifier.defaultValue);
    this._EClassifier_defaultValue.setEContainingClass(this._EClassifier);

    this._EClassifier
      .getEStructuralFeatures()
      .add(this._EClassifier_defaultValue);
    this._EClassifier_instanceTypeName = new EAttributeImpl();
    this._EClassifier_instanceTypeName.setName("instanceTypeName");
    this._EClassifier_instanceTypeName.setEType(this._EString);
    this._EClassifier_instanceTypeName.setLowerBound(0);
    this._EClassifier_instanceTypeName.setUpperBound(1);
    this._EClassifier_instanceTypeName.setFeatureID(
      Ids.EClassifier.instanceTypeName,
    );
    this._EClassifier_instanceTypeName.setEContainingClass(this._EClassifier);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._EClassifier_instanceTypeName.getEAnnotations().add(annotation);
    }

    this._EClassifier
      .getEStructuralFeatures()
      .add(this._EClassifier_instanceTypeName);
    this._EClassifier_ePackage = new EReferenceImpl();
    this._EClassifier_ePackage.setName("ePackage");
    this._EClassifier_ePackage.setEType(this._EPackage);
    this._EClassifier_ePackage.setLowerBound(0);
    this._EClassifier_ePackage.setUpperBound(1);
    this._EClassifier_ePackage.setFeatureID(Ids.EClassifier.ePackage);
    this._EClassifier_ePackage.setEContainingClass(this._EClassifier);
    this._EClassifier_ePackage.setContainment(false);

    this._EClassifier.getEStructuralFeatures().add(this._EClassifier_ePackage);
    this._EClassifier_eTypeParameters = new EReferenceImpl();
    this._EClassifier_eTypeParameters.setName("eTypeParameters");
    this._EClassifier_eTypeParameters.setEType(this._ETypeParameter);
    this._EClassifier_eTypeParameters.setLowerBound(0);
    this._EClassifier_eTypeParameters.setUpperBound(-1);
    this._EClassifier_eTypeParameters.setFeatureID(
      Ids.EClassifier.eTypeParameters,
    );
    this._EClassifier_eTypeParameters.setEContainingClass(this._EClassifier);
    this._EClassifier_eTypeParameters.setContainment(true);

    this._EClassifier
      .getEStructuralFeatures()
      .add(this._EClassifier_eTypeParameters);
    this._EDataType_serializable = new EAttributeImpl();
    this._EDataType_serializable.setName("serializable");
    this._EDataType_serializable.setEType(this._EBoolean);
    this._EDataType_serializable.setLowerBound(0);
    this._EDataType_serializable.setUpperBound(1);
    this._EDataType_serializable.setFeatureID(Ids.EDataType.serializable);
    this._EDataType_serializable.setEContainingClass(this._EDataType);

    this._EDataType.getEStructuralFeatures().add(this._EDataType_serializable);
    this._EEnum_eLiterals = new EReferenceImpl();
    this._EEnum_eLiterals.setName("eLiterals");
    this._EEnum_eLiterals.setEType(this._EEnumLiteral);
    this._EEnum_eLiterals.setLowerBound(0);
    this._EEnum_eLiterals.setUpperBound(-1);
    this._EEnum_eLiterals.setFeatureID(Ids.EEnum.eLiterals);
    this._EEnum_eLiterals.setEContainingClass(this._EEnum);
    this._EEnum_eLiterals.setContainment(true);

    this._EEnum.getEStructuralFeatures().add(this._EEnum_eLiterals);
    this._EEnumLiteral_value = new EAttributeImpl();
    this._EEnumLiteral_value.setName("value");
    this._EEnumLiteral_value.setEType(this._EInt);
    this._EEnumLiteral_value.setLowerBound(0);
    this._EEnumLiteral_value.setUpperBound(1);
    this._EEnumLiteral_value.setFeatureID(Ids.EEnumLiteral.value);
    this._EEnumLiteral_value.setEContainingClass(this._EEnumLiteral);

    this._EEnumLiteral.getEStructuralFeatures().add(this._EEnumLiteral_value);
    this._EEnumLiteral_instance = new EAttributeImpl();
    this._EEnumLiteral_instance.setName("instance");
    this._EEnumLiteral_instance.setEType(this._EEnumerator);
    this._EEnumLiteral_instance.setLowerBound(0);
    this._EEnumLiteral_instance.setUpperBound(1);
    this._EEnumLiteral_instance.setFeatureID(Ids.EEnumLiteral.instance);
    this._EEnumLiteral_instance.setEContainingClass(this._EEnumLiteral);

    this._EEnumLiteral
      .getEStructuralFeatures()
      .add(this._EEnumLiteral_instance);
    this._EEnumLiteral_literal = new EAttributeImpl();
    this._EEnumLiteral_literal.setName("literal");
    this._EEnumLiteral_literal.setEType(this._EString);
    this._EEnumLiteral_literal.setLowerBound(0);
    this._EEnumLiteral_literal.setUpperBound(1);
    this._EEnumLiteral_literal.setFeatureID(Ids.EEnumLiteral.literal);
    this._EEnumLiteral_literal.setEContainingClass(this._EEnumLiteral);

    this._EEnumLiteral.getEStructuralFeatures().add(this._EEnumLiteral_literal);
    this._EEnumLiteral_eEnum = new EReferenceImpl();
    this._EEnumLiteral_eEnum.setName("eEnum");
    this._EEnumLiteral_eEnum.setEType(this._EEnum);
    this._EEnumLiteral_eEnum.setLowerBound(0);
    this._EEnumLiteral_eEnum.setUpperBound(1);
    this._EEnumLiteral_eEnum.setFeatureID(Ids.EEnumLiteral.eEnum);
    this._EEnumLiteral_eEnum.setEContainingClass(this._EEnumLiteral);
    this._EEnumLiteral_eEnum.setContainment(false);

    this._EEnumLiteral.getEStructuralFeatures().add(this._EEnumLiteral_eEnum);
    this._EFactory_ePackage = new EReferenceImpl();
    this._EFactory_ePackage.setName("ePackage");
    this._EFactory_ePackage.setEType(this._EPackage);
    this._EFactory_ePackage.setLowerBound(1);
    this._EFactory_ePackage.setUpperBound(1);
    this._EFactory_ePackage.setFeatureID(Ids.EFactory.ePackage);
    this._EFactory_ePackage.setEContainingClass(this._EFactory);
    this._EFactory_ePackage.setContainment(false);

    this._EFactory.getEStructuralFeatures().add(this._EFactory_ePackage);
    this._EModelElement_eAnnotations = new EReferenceImpl();
    this._EModelElement_eAnnotations.setName("eAnnotations");
    this._EModelElement_eAnnotations.setEType(this._EAnnotation);
    this._EModelElement_eAnnotations.setLowerBound(0);
    this._EModelElement_eAnnotations.setUpperBound(-1);
    this._EModelElement_eAnnotations.setFeatureID(
      Ids.EModelElement.eAnnotations,
    );
    this._EModelElement_eAnnotations.setEContainingClass(this._EModelElement);
    this._EModelElement_eAnnotations.setContainment(true);

    this._EModelElement
      .getEStructuralFeatures()
      .add(this._EModelElement_eAnnotations);
    this._ENamedElement_name = new EAttributeImpl();
    this._ENamedElement_name.setName("name");
    this._ENamedElement_name.setEType(this._EString);
    this._ENamedElement_name.setLowerBound(0);
    this._ENamedElement_name.setUpperBound(1);
    this._ENamedElement_name.setFeatureID(Ids.ENamedElement.name);
    this._ENamedElement_name.setEContainingClass(this._ENamedElement);

    this._ENamedElement.getEStructuralFeatures().add(this._ENamedElement_name);
    this._EOperation_eContainingClass = new EReferenceImpl();
    this._EOperation_eContainingClass.setName("eContainingClass");
    this._EOperation_eContainingClass.setEType(this._EClass);
    this._EOperation_eContainingClass.setLowerBound(0);
    this._EOperation_eContainingClass.setUpperBound(1);
    this._EOperation_eContainingClass.setFeatureID(
      Ids.EOperation.eContainingClass,
    );
    this._EOperation_eContainingClass.setEContainingClass(this._EOperation);
    this._EOperation_eContainingClass.setContainment(false);

    this._EOperation
      .getEStructuralFeatures()
      .add(this._EOperation_eContainingClass);
    this._EOperation_eTypeParameters = new EReferenceImpl();
    this._EOperation_eTypeParameters.setName("eTypeParameters");
    this._EOperation_eTypeParameters.setEType(this._ETypeParameter);
    this._EOperation_eTypeParameters.setLowerBound(0);
    this._EOperation_eTypeParameters.setUpperBound(-1);
    this._EOperation_eTypeParameters.setFeatureID(
      Ids.EOperation.eTypeParameters,
    );
    this._EOperation_eTypeParameters.setEContainingClass(this._EOperation);
    this._EOperation_eTypeParameters.setContainment(true);

    this._EOperation
      .getEStructuralFeatures()
      .add(this._EOperation_eTypeParameters);
    this._EOperation_eParameters = new EReferenceImpl();
    this._EOperation_eParameters.setName("eParameters");
    this._EOperation_eParameters.setEType(this._EParameter);
    this._EOperation_eParameters.setLowerBound(0);
    this._EOperation_eParameters.setUpperBound(-1);
    this._EOperation_eParameters.setFeatureID(Ids.EOperation.eParameters);
    this._EOperation_eParameters.setEContainingClass(this._EOperation);
    this._EOperation_eParameters.setContainment(true);

    this._EOperation.getEStructuralFeatures().add(this._EOperation_eParameters);
    this._EOperation_eExceptions = new EReferenceImpl();
    this._EOperation_eExceptions.setName("eExceptions");
    this._EOperation_eExceptions.setEType(this._EClassifier);
    this._EOperation_eExceptions.setLowerBound(0);
    this._EOperation_eExceptions.setUpperBound(-1);
    this._EOperation_eExceptions.setFeatureID(Ids.EOperation.eExceptions);
    this._EOperation_eExceptions.setEContainingClass(this._EOperation);
    this._EOperation_eExceptions.setContainment(false);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._EOperation_eExceptions.getEAnnotations().add(annotation);
    }

    this._EOperation.getEStructuralFeatures().add(this._EOperation_eExceptions);
    this._EOperation_eGenericExceptions = new EReferenceImpl();
    this._EOperation_eGenericExceptions.setName("eGenericExceptions");
    this._EOperation_eGenericExceptions.setEType(this._EGenericType);
    this._EOperation_eGenericExceptions.setLowerBound(0);
    this._EOperation_eGenericExceptions.setUpperBound(-1);
    this._EOperation_eGenericExceptions.setFeatureID(
      Ids.EOperation.eGenericExceptions,
    );
    this._EOperation_eGenericExceptions.setEContainingClass(this._EOperation);
    this._EOperation_eGenericExceptions.setContainment(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._EOperation_eGenericExceptions.getEAnnotations().add(annotation);
    }

    this._EOperation
      .getEStructuralFeatures()
      .add(this._EOperation_eGenericExceptions);
    this._EPackage_nsURI = new EAttributeImpl();
    this._EPackage_nsURI.setName("nsURI");
    this._EPackage_nsURI.setEType(this._EString);
    this._EPackage_nsURI.setLowerBound(0);
    this._EPackage_nsURI.setUpperBound(1);
    this._EPackage_nsURI.setFeatureID(Ids.EPackage.nsURI);
    this._EPackage_nsURI.setEContainingClass(this._EPackage);

    this._EPackage.getEStructuralFeatures().add(this._EPackage_nsURI);
    this._EPackage_nsPrefix = new EAttributeImpl();
    this._EPackage_nsPrefix.setName("nsPrefix");
    this._EPackage_nsPrefix.setEType(this._EString);
    this._EPackage_nsPrefix.setLowerBound(0);
    this._EPackage_nsPrefix.setUpperBound(1);
    this._EPackage_nsPrefix.setFeatureID(Ids.EPackage.nsPrefix);
    this._EPackage_nsPrefix.setEContainingClass(this._EPackage);

    this._EPackage.getEStructuralFeatures().add(this._EPackage_nsPrefix);
    this._EPackage_eFactoryInstance = new EReferenceImpl();
    this._EPackage_eFactoryInstance.setName("eFactoryInstance");
    this._EPackage_eFactoryInstance.setEType(this._EFactory);
    this._EPackage_eFactoryInstance.setLowerBound(1);
    this._EPackage_eFactoryInstance.setUpperBound(1);
    this._EPackage_eFactoryInstance.setFeatureID(Ids.EPackage.eFactoryInstance);
    this._EPackage_eFactoryInstance.setEContainingClass(this._EPackage);
    this._EPackage_eFactoryInstance.setContainment(false);

    this._EPackage
      .getEStructuralFeatures()
      .add(this._EPackage_eFactoryInstance);
    this._EPackage_eClassifiers = new EReferenceImpl();
    this._EPackage_eClassifiers.setName("eClassifiers");
    this._EPackage_eClassifiers.setEType(this._EClassifier);
    this._EPackage_eClassifiers.setLowerBound(0);
    this._EPackage_eClassifiers.setUpperBound(-1);
    this._EPackage_eClassifiers.setFeatureID(Ids.EPackage.eClassifiers);
    this._EPackage_eClassifiers.setEContainingClass(this._EPackage);
    this._EPackage_eClassifiers.setContainment(true);

    this._EPackage.getEStructuralFeatures().add(this._EPackage_eClassifiers);
    this._EPackage_eSubpackages = new EReferenceImpl();
    this._EPackage_eSubpackages.setName("eSubpackages");
    this._EPackage_eSubpackages.setEType(this._EPackage);
    this._EPackage_eSubpackages.setLowerBound(0);
    this._EPackage_eSubpackages.setUpperBound(-1);
    this._EPackage_eSubpackages.setFeatureID(Ids.EPackage.eSubpackages);
    this._EPackage_eSubpackages.setEContainingClass(this._EPackage);
    this._EPackage_eSubpackages.setContainment(true);

    this._EPackage.getEStructuralFeatures().add(this._EPackage_eSubpackages);
    this._EPackage_eSuperPackage = new EReferenceImpl();
    this._EPackage_eSuperPackage.setName("eSuperPackage");
    this._EPackage_eSuperPackage.setEType(this._EPackage);
    this._EPackage_eSuperPackage.setLowerBound(0);
    this._EPackage_eSuperPackage.setUpperBound(1);
    this._EPackage_eSuperPackage.setFeatureID(Ids.EPackage.eSuperPackage);
    this._EPackage_eSuperPackage.setEContainingClass(this._EPackage);
    this._EPackage_eSuperPackage.setContainment(false);

    this._EPackage.getEStructuralFeatures().add(this._EPackage_eSuperPackage);
    this._EParameter_eOperation = new EReferenceImpl();
    this._EParameter_eOperation.setName("eOperation");
    this._EParameter_eOperation.setEType(this._EOperation);
    this._EParameter_eOperation.setLowerBound(0);
    this._EParameter_eOperation.setUpperBound(1);
    this._EParameter_eOperation.setFeatureID(Ids.EParameter.eOperation);
    this._EParameter_eOperation.setEContainingClass(this._EParameter);
    this._EParameter_eOperation.setContainment(false);

    this._EParameter.getEStructuralFeatures().add(this._EParameter_eOperation);
    this._EReference_containment = new EAttributeImpl();
    this._EReference_containment.setName("containment");
    this._EReference_containment.setEType(this._EBoolean);
    this._EReference_containment.setLowerBound(0);
    this._EReference_containment.setUpperBound(1);
    this._EReference_containment.setFeatureID(Ids.EReference.containment);
    this._EReference_containment.setEContainingClass(this._EReference);

    this._EReference.getEStructuralFeatures().add(this._EReference_containment);
    this._EReference_container = new EAttributeImpl();
    this._EReference_container.setName("container");
    this._EReference_container.setEType(this._EBoolean);
    this._EReference_container.setLowerBound(0);
    this._EReference_container.setUpperBound(1);
    this._EReference_container.setFeatureID(Ids.EReference.container);
    this._EReference_container.setEContainingClass(this._EReference);

    this._EReference.getEStructuralFeatures().add(this._EReference_container);
    this._EReference_resolveProxies = new EAttributeImpl();
    this._EReference_resolveProxies.setName("resolveProxies");
    this._EReference_resolveProxies.setEType(this._EBoolean);
    this._EReference_resolveProxies.setLowerBound(0);
    this._EReference_resolveProxies.setUpperBound(1);
    this._EReference_resolveProxies.setFeatureID(Ids.EReference.resolveProxies);
    this._EReference_resolveProxies.setEContainingClass(this._EReference);

    this._EReference
      .getEStructuralFeatures()
      .add(this._EReference_resolveProxies);
    this._EReference_eOpposite = new EReferenceImpl();
    this._EReference_eOpposite.setName("eOpposite");
    this._EReference_eOpposite.setEType(this._EReference);
    this._EReference_eOpposite.setLowerBound(0);
    this._EReference_eOpposite.setUpperBound(1);
    this._EReference_eOpposite.setFeatureID(Ids.EReference.eOpposite);
    this._EReference_eOpposite.setEContainingClass(this._EReference);
    this._EReference_eOpposite.setContainment(false);

    this._EReference.getEStructuralFeatures().add(this._EReference_eOpposite);
    this._EReference_eReferenceType = new EReferenceImpl();
    this._EReference_eReferenceType.setName("eReferenceType");
    this._EReference_eReferenceType.setEType(this._EClass);
    this._EReference_eReferenceType.setLowerBound(1);
    this._EReference_eReferenceType.setUpperBound(1);
    this._EReference_eReferenceType.setFeatureID(Ids.EReference.eReferenceType);
    this._EReference_eReferenceType.setEContainingClass(this._EReference);
    this._EReference_eReferenceType.setContainment(false);

    this._EReference
      .getEStructuralFeatures()
      .add(this._EReference_eReferenceType);
    this._EReference_eKeys = new EReferenceImpl();
    this._EReference_eKeys.setName("eKeys");
    this._EReference_eKeys.setEType(this._EAttribute);
    this._EReference_eKeys.setLowerBound(0);
    this._EReference_eKeys.setUpperBound(-1);
    this._EReference_eKeys.setFeatureID(Ids.EReference.eKeys);
    this._EReference_eKeys.setEContainingClass(this._EReference);
    this._EReference_eKeys.setContainment(false);

    this._EReference.getEStructuralFeatures().add(this._EReference_eKeys);
    this._EStructuralFeature_changeable = new EAttributeImpl();
    this._EStructuralFeature_changeable.setName("changeable");
    this._EStructuralFeature_changeable.setEType(this._EBoolean);
    this._EStructuralFeature_changeable.setLowerBound(0);
    this._EStructuralFeature_changeable.setUpperBound(1);
    this._EStructuralFeature_changeable.setFeatureID(
      Ids.EStructuralFeature.changeable,
    );
    this._EStructuralFeature_changeable.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_changeable);
    this._EStructuralFeature_volatile = new EAttributeImpl();
    this._EStructuralFeature_volatile.setName("volatile");
    this._EStructuralFeature_volatile.setEType(this._EBoolean);
    this._EStructuralFeature_volatile.setLowerBound(0);
    this._EStructuralFeature_volatile.setUpperBound(1);
    this._EStructuralFeature_volatile.setFeatureID(
      Ids.EStructuralFeature.volatile,
    );
    this._EStructuralFeature_volatile.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_volatile);
    this._EStructuralFeature_transient = new EAttributeImpl();
    this._EStructuralFeature_transient.setName("transient");
    this._EStructuralFeature_transient.setEType(this._EBoolean);
    this._EStructuralFeature_transient.setLowerBound(0);
    this._EStructuralFeature_transient.setUpperBound(1);
    this._EStructuralFeature_transient.setFeatureID(
      Ids.EStructuralFeature.transient,
    );
    this._EStructuralFeature_transient.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_transient);
    this._EStructuralFeature_defaultValueLiteral = new EAttributeImpl();
    this._EStructuralFeature_defaultValueLiteral.setName("defaultValueLiteral");
    this._EStructuralFeature_defaultValueLiteral.setEType(this._EString);
    this._EStructuralFeature_defaultValueLiteral.setLowerBound(0);
    this._EStructuralFeature_defaultValueLiteral.setUpperBound(1);
    this._EStructuralFeature_defaultValueLiteral.setFeatureID(
      Ids.EStructuralFeature.defaultValueLiteral,
    );
    this._EStructuralFeature_defaultValueLiteral.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_defaultValueLiteral);
    this._EStructuralFeature_defaultValue = new EAttributeImpl();
    this._EStructuralFeature_defaultValue.setName("defaultValue");
    this._EStructuralFeature_defaultValue.setEType(this._EJavaObject);
    this._EStructuralFeature_defaultValue.setLowerBound(0);
    this._EStructuralFeature_defaultValue.setUpperBound(1);
    this._EStructuralFeature_defaultValue.setFeatureID(
      Ids.EStructuralFeature.defaultValue,
    );
    this._EStructuralFeature_defaultValue.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_defaultValue);
    this._EStructuralFeature_unsettable = new EAttributeImpl();
    this._EStructuralFeature_unsettable.setName("unsettable");
    this._EStructuralFeature_unsettable.setEType(this._EBoolean);
    this._EStructuralFeature_unsettable.setLowerBound(0);
    this._EStructuralFeature_unsettable.setUpperBound(1);
    this._EStructuralFeature_unsettable.setFeatureID(
      Ids.EStructuralFeature.unsettable,
    );
    this._EStructuralFeature_unsettable.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_unsettable);
    this._EStructuralFeature_derived = new EAttributeImpl();
    this._EStructuralFeature_derived.setName("derived");
    this._EStructuralFeature_derived.setEType(this._EBoolean);
    this._EStructuralFeature_derived.setLowerBound(0);
    this._EStructuralFeature_derived.setUpperBound(1);
    this._EStructuralFeature_derived.setFeatureID(
      Ids.EStructuralFeature.derived,
    );
    this._EStructuralFeature_derived.setEContainingClass(
      this._EStructuralFeature,
    );

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_derived);
    this._EStructuralFeature_eContainingClass = new EReferenceImpl();
    this._EStructuralFeature_eContainingClass.setName("eContainingClass");
    this._EStructuralFeature_eContainingClass.setEType(this._EClass);
    this._EStructuralFeature_eContainingClass.setLowerBound(0);
    this._EStructuralFeature_eContainingClass.setUpperBound(1);
    this._EStructuralFeature_eContainingClass.setFeatureID(
      Ids.EStructuralFeature.eContainingClass,
    );
    this._EStructuralFeature_eContainingClass.setEContainingClass(
      this._EStructuralFeature,
    );
    this._EStructuralFeature_eContainingClass.setContainment(false);

    this._EStructuralFeature
      .getEStructuralFeatures()
      .add(this._EStructuralFeature_eContainingClass);
    this._ETypedElement_ordered = new EAttributeImpl();
    this._ETypedElement_ordered.setName("ordered");
    this._ETypedElement_ordered.setEType(this._EBoolean);
    this._ETypedElement_ordered.setLowerBound(0);
    this._ETypedElement_ordered.setUpperBound(1);
    this._ETypedElement_ordered.setFeatureID(Ids.ETypedElement.ordered);
    this._ETypedElement_ordered.setEContainingClass(this._ETypedElement);

    this._ETypedElement
      .getEStructuralFeatures()
      .add(this._ETypedElement_ordered);
    this._ETypedElement_unique = new EAttributeImpl();
    this._ETypedElement_unique.setName("unique");
    this._ETypedElement_unique.setEType(this._EBoolean);
    this._ETypedElement_unique.setLowerBound(0);
    this._ETypedElement_unique.setUpperBound(1);
    this._ETypedElement_unique.setFeatureID(Ids.ETypedElement.unique);
    this._ETypedElement_unique.setEContainingClass(this._ETypedElement);

    this._ETypedElement
      .getEStructuralFeatures()
      .add(this._ETypedElement_unique);
    this._ETypedElement_lowerBound = new EAttributeImpl();
    this._ETypedElement_lowerBound.setName("lowerBound");
    this._ETypedElement_lowerBound.setEType(this._EInt);
    this._ETypedElement_lowerBound.setLowerBound(0);
    this._ETypedElement_lowerBound.setUpperBound(1);
    this._ETypedElement_lowerBound.setFeatureID(Ids.ETypedElement.lowerBound);
    this._ETypedElement_lowerBound.setEContainingClass(this._ETypedElement);

    this._ETypedElement
      .getEStructuralFeatures()
      .add(this._ETypedElement_lowerBound);
    this._ETypedElement_upperBound = new EAttributeImpl();
    this._ETypedElement_upperBound.setName("upperBound");
    this._ETypedElement_upperBound.setEType(this._EInt);
    this._ETypedElement_upperBound.setLowerBound(0);
    this._ETypedElement_upperBound.setUpperBound(1);
    this._ETypedElement_upperBound.setFeatureID(Ids.ETypedElement.upperBound);
    this._ETypedElement_upperBound.setEContainingClass(this._ETypedElement);

    this._ETypedElement
      .getEStructuralFeatures()
      .add(this._ETypedElement_upperBound);
    this._ETypedElement_many = new EAttributeImpl();
    this._ETypedElement_many.setName("many");
    this._ETypedElement_many.setEType(this._EBoolean);
    this._ETypedElement_many.setLowerBound(0);
    this._ETypedElement_many.setUpperBound(1);
    this._ETypedElement_many.setFeatureID(Ids.ETypedElement.many);
    this._ETypedElement_many.setEContainingClass(this._ETypedElement);

    this._ETypedElement.getEStructuralFeatures().add(this._ETypedElement_many);
    this._ETypedElement_required = new EAttributeImpl();
    this._ETypedElement_required.setName("required");
    this._ETypedElement_required.setEType(this._EBoolean);
    this._ETypedElement_required.setLowerBound(0);
    this._ETypedElement_required.setUpperBound(1);
    this._ETypedElement_required.setFeatureID(Ids.ETypedElement.required);
    this._ETypedElement_required.setEContainingClass(this._ETypedElement);

    this._ETypedElement
      .getEStructuralFeatures()
      .add(this._ETypedElement_required);
    this._ETypedElement_eType = new EReferenceImpl();
    this._ETypedElement_eType.setName("eType");
    this._ETypedElement_eType.setEType(this._EClassifier);
    this._ETypedElement_eType.setLowerBound(0);
    this._ETypedElement_eType.setUpperBound(1);
    this._ETypedElement_eType.setFeatureID(Ids.ETypedElement.eType);
    this._ETypedElement_eType.setEContainingClass(this._ETypedElement);
    this._ETypedElement_eType.setContainment(false);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._ETypedElement_eType.getEAnnotations().add(annotation);
    }

    this._ETypedElement.getEStructuralFeatures().add(this._ETypedElement_eType);
    this._ETypedElement_eGenericType = new EReferenceImpl();
    this._ETypedElement_eGenericType.setName("eGenericType");
    this._ETypedElement_eGenericType.setEType(this._EGenericType);
    this._ETypedElement_eGenericType.setLowerBound(0);
    this._ETypedElement_eGenericType.setUpperBound(1);
    this._ETypedElement_eGenericType.setFeatureID(
      Ids.ETypedElement.eGenericType,
    );
    this._ETypedElement_eGenericType.setEContainingClass(this._ETypedElement);
    this._ETypedElement_eGenericType.setContainment(true);
    {
      const annotation = new EAnnotationImpl();
      annotation.setSource("http://www.eclipse.org/emf/2002/GenModel");
      annotation.getDetails().set("suppressedIsSetVisibility", "true");
      annotation.getDetails().set("suppressedUnsetVisibility", "true");
      this._ETypedElement_eGenericType.getEAnnotations().add(annotation);
    }

    this._ETypedElement
      .getEStructuralFeatures()
      .add(this._ETypedElement_eGenericType);
    this._EStringToStringMapEntry_key = new EAttributeImpl();
    this._EStringToStringMapEntry_key.setName("key");
    this._EStringToStringMapEntry_key.setEType(this._EString);
    this._EStringToStringMapEntry_key.setLowerBound(0);
    this._EStringToStringMapEntry_key.setUpperBound(1);
    this._EStringToStringMapEntry_key.setFeatureID(
      Ids.EStringToStringMapEntry.key,
    );
    this._EStringToStringMapEntry_key.setEContainingClass(
      this._EStringToStringMapEntry,
    );

    this._EStringToStringMapEntry
      .getEStructuralFeatures()
      .add(this._EStringToStringMapEntry_key);
    this._EStringToStringMapEntry_value = new EAttributeImpl();
    this._EStringToStringMapEntry_value.setName("value");
    this._EStringToStringMapEntry_value.setEType(this._EString);
    this._EStringToStringMapEntry_value.setLowerBound(0);
    this._EStringToStringMapEntry_value.setUpperBound(1);
    this._EStringToStringMapEntry_value.setFeatureID(
      Ids.EStringToStringMapEntry.value,
    );
    this._EStringToStringMapEntry_value.setEContainingClass(
      this._EStringToStringMapEntry,
    );

    this._EStringToStringMapEntry
      .getEStructuralFeatures()
      .add(this._EStringToStringMapEntry_value);
    this._EGenericType_eUpperBound = new EReferenceImpl();
    this._EGenericType_eUpperBound.setName("eUpperBound");
    this._EGenericType_eUpperBound.setEType(this._EGenericType);
    this._EGenericType_eUpperBound.setLowerBound(0);
    this._EGenericType_eUpperBound.setUpperBound(1);
    this._EGenericType_eUpperBound.setFeatureID(Ids.EGenericType.eUpperBound);
    this._EGenericType_eUpperBound.setEContainingClass(this._EGenericType);
    this._EGenericType_eUpperBound.setContainment(true);

    this._EGenericType
      .getEStructuralFeatures()
      .add(this._EGenericType_eUpperBound);
    this._EGenericType_eTypeArguments = new EReferenceImpl();
    this._EGenericType_eTypeArguments.setName("eTypeArguments");
    this._EGenericType_eTypeArguments.setEType(this._EGenericType);
    this._EGenericType_eTypeArguments.setLowerBound(0);
    this._EGenericType_eTypeArguments.setUpperBound(-1);
    this._EGenericType_eTypeArguments.setFeatureID(
      Ids.EGenericType.eTypeArguments,
    );
    this._EGenericType_eTypeArguments.setEContainingClass(this._EGenericType);
    this._EGenericType_eTypeArguments.setContainment(true);

    this._EGenericType
      .getEStructuralFeatures()
      .add(this._EGenericType_eTypeArguments);
    this._EGenericType_eRawType = new EReferenceImpl();
    this._EGenericType_eRawType.setName("eRawType");
    this._EGenericType_eRawType.setEType(this._EClassifier);
    this._EGenericType_eRawType.setLowerBound(1);
    this._EGenericType_eRawType.setUpperBound(1);
    this._EGenericType_eRawType.setFeatureID(Ids.EGenericType.eRawType);
    this._EGenericType_eRawType.setEContainingClass(this._EGenericType);
    this._EGenericType_eRawType.setContainment(false);

    this._EGenericType
      .getEStructuralFeatures()
      .add(this._EGenericType_eRawType);
    this._EGenericType_eLowerBound = new EReferenceImpl();
    this._EGenericType_eLowerBound.setName("eLowerBound");
    this._EGenericType_eLowerBound.setEType(this._EGenericType);
    this._EGenericType_eLowerBound.setLowerBound(0);
    this._EGenericType_eLowerBound.setUpperBound(1);
    this._EGenericType_eLowerBound.setFeatureID(Ids.EGenericType.eLowerBound);
    this._EGenericType_eLowerBound.setEContainingClass(this._EGenericType);
    this._EGenericType_eLowerBound.setContainment(true);

    this._EGenericType
      .getEStructuralFeatures()
      .add(this._EGenericType_eLowerBound);
    this._EGenericType_eTypeParameter = new EReferenceImpl();
    this._EGenericType_eTypeParameter.setName("eTypeParameter");
    this._EGenericType_eTypeParameter.setEType(this._ETypeParameter);
    this._EGenericType_eTypeParameter.setLowerBound(0);
    this._EGenericType_eTypeParameter.setUpperBound(1);
    this._EGenericType_eTypeParameter.setFeatureID(
      Ids.EGenericType.eTypeParameter,
    );
    this._EGenericType_eTypeParameter.setEContainingClass(this._EGenericType);
    this._EGenericType_eTypeParameter.setContainment(false);

    this._EGenericType
      .getEStructuralFeatures()
      .add(this._EGenericType_eTypeParameter);
    this._EGenericType_eClassifier = new EReferenceImpl();
    this._EGenericType_eClassifier.setName("eClassifier");
    this._EGenericType_eClassifier.setEType(this._EClassifier);
    this._EGenericType_eClassifier.setLowerBound(0);
    this._EGenericType_eClassifier.setUpperBound(1);
    this._EGenericType_eClassifier.setFeatureID(Ids.EGenericType.eClassifier);
    this._EGenericType_eClassifier.setEContainingClass(this._EGenericType);
    this._EGenericType_eClassifier.setContainment(false);

    this._EGenericType
      .getEStructuralFeatures()
      .add(this._EGenericType_eClassifier);
    this._ETypeParameter_eBounds = new EReferenceImpl();
    this._ETypeParameter_eBounds.setName("eBounds");
    this._ETypeParameter_eBounds.setEType(this._EGenericType);
    this._ETypeParameter_eBounds.setLowerBound(0);
    this._ETypeParameter_eBounds.setUpperBound(-1);
    this._ETypeParameter_eBounds.setFeatureID(Ids.ETypeParameter.eBounds);
    this._ETypeParameter_eBounds.setEContainingClass(this._ETypeParameter);
    this._ETypeParameter_eBounds.setContainment(true);

    this._ETypeParameter
      .getEStructuralFeatures()
      .add(this._ETypeParameter_eBounds);

    // Pass 3: every classifier's owning package (self-referential, so must
    // come after pass 1 creates them all).
    this._EAttribute.setEPackage(this);
    this._EAnnotation.setEPackage(this);
    this._EClass.setEPackage(this);
    this._EClassifier.setEPackage(this);
    this._EDataType.setEPackage(this);
    this._EEnum.setEPackage(this);
    this._EEnumLiteral.setEPackage(this);
    this._EFactory.setEPackage(this);
    this._EModelElement.setEPackage(this);
    this._ENamedElement.setEPackage(this);
    this._EOperation.setEPackage(this);
    this._EPackage.setEPackage(this);
    this._EParameter.setEPackage(this);
    this._EReference.setEPackage(this);
    this._EStructuralFeature.setEPackage(this);
    this._ETypedElement.setEPackage(this);
    this._EBigDecimal.setEPackage(this);
    this._EBigInteger.setEPackage(this);
    this._EBoolean.setEPackage(this);
    this._EBooleanObject.setEPackage(this);
    this._EByte.setEPackage(this);
    this._EByteArray.setEPackage(this);
    this._EByteObject.setEPackage(this);
    this._EChar.setEPackage(this);
    this._ECharacterObject.setEPackage(this);
    this._EDate.setEPackage(this);
    this._EDiagnosticChain.setEPackage(this);
    this._EDouble.setEPackage(this);
    this._EDoubleObject.setEPackage(this);
    this._EEList.setEPackage(this);
    this._EEnumerator.setEPackage(this);
    this._EFeatureMap.setEPackage(this);
    this._EFeatureMapEntry.setEPackage(this);
    this._EFloat.setEPackage(this);
    this._EFloatObject.setEPackage(this);
    this._EInt.setEPackage(this);
    this._EIntegerObject.setEPackage(this);
    this._EJavaClass.setEPackage(this);
    this._EJavaObject.setEPackage(this);
    this._ELong.setEPackage(this);
    this._ELongObject.setEPackage(this);
    this._EMap.setEPackage(this);
    this._EResource.setEPackage(this);
    this._EResourceSet.setEPackage(this);
    this._EShort.setEPackage(this);
    this._EShortObject.setEPackage(this);
    this._EString.setEPackage(this);
    this._EStringToStringMapEntry.setEPackage(this);
    this._ETreeIterator.setEPackage(this);
    this._EGenericType.setEPackage(this);
    this._ETypeParameter.setEPackage(this);
    this._EInvocationTargetException.setEPackage(this);

    // Pass 4: supertypes.
    this._EAttribute.getESuperTypes().add(this._EStructuralFeature);
    this._EAnnotation.getESuperTypes().add(this._EModelElement);
    this._EClass.getESuperTypes().add(this._EClassifier);
    this._EClassifier.getESuperTypes().add(this._ENamedElement);
    this._EDataType.getESuperTypes().add(this._EClassifier);
    this._EEnum.getESuperTypes().add(this._EDataType);
    this._EEnumLiteral.getESuperTypes().add(this._ENamedElement);
    this._EFactory.getESuperTypes().add(this._EModelElement);
    this._ENamedElement.getESuperTypes().add(this._EModelElement);
    this._EOperation.getESuperTypes().add(this._ETypedElement);
    this._EPackage.getESuperTypes().add(this._ENamedElement);
    this._EParameter.getESuperTypes().add(this._ETypedElement);
    this._EReference.getESuperTypes().add(this._EStructuralFeature);
    this._EStructuralFeature.getESuperTypes().add(this._ETypedElement);
    this._ETypedElement.getESuperTypes().add(this._ENamedElement);
    this._ETypeParameter.getESuperTypes().add(this._ENamedElement);

    // Pass 5: recompute EAll* caches now that supertypes/features are wired.
    this._EAttribute.recomputeAllLists();
    this._EAnnotation.recomputeAllLists();
    this._EClass.recomputeAllLists();
    this._EClassifier.recomputeAllLists();
    this._EDataType.recomputeAllLists();
    this._EEnum.recomputeAllLists();
    this._EEnumLiteral.recomputeAllLists();
    this._EFactory.recomputeAllLists();
    this._EModelElement.recomputeAllLists();
    this._ENamedElement.recomputeAllLists();
    this._EOperation.recomputeAllLists();
    this._EPackage.recomputeAllLists();
    this._EParameter.recomputeAllLists();
    this._EReference.recomputeAllLists();
    this._EStructuralFeature.recomputeAllLists();
    this._ETypedElement.recomputeAllLists();
    this._EStringToStringMapEntry.recomputeAllLists();
    this._EGenericType.recomputeAllLists();
    this._ETypeParameter.recomputeAllLists();
  }

  getEAttribute(): EClass {
    return this._EAttribute;
  }
  getEAttribute_ID(): EAttribute {
    return this._EAttribute_iD;
  }
  getEAttribute_EAttributeType(): EReference {
    return this._EAttribute_eAttributeType;
  }
  getEAnnotation(): EClass {
    return this._EAnnotation;
  }
  getEAnnotation_Source(): EAttribute {
    return this._EAnnotation_source;
  }
  getEAnnotation_Details(): EReference {
    return this._EAnnotation_details;
  }
  getEAnnotation_EModelElement(): EReference {
    return this._EAnnotation_eModelElement;
  }
  getEAnnotation_Contents(): EReference {
    return this._EAnnotation_contents;
  }
  getEAnnotation_References(): EReference {
    return this._EAnnotation_references;
  }
  getEClass(): EClass {
    return this._EClass;
  }
  getEClass_Abstract(): EAttribute {
    return this._EClass_abstract;
  }
  getEClass_Interface(): EAttribute {
    return this._EClass_interface;
  }
  getEClass_ESuperTypes(): EReference {
    return this._EClass_eSuperTypes;
  }
  getEClass_EOperations(): EReference {
    return this._EClass_eOperations;
  }
  getEClass_EAllAttributes(): EReference {
    return this._EClass_eAllAttributes;
  }
  getEClass_EAllReferences(): EReference {
    return this._EClass_eAllReferences;
  }
  getEClass_EReferences(): EReference {
    return this._EClass_eReferences;
  }
  getEClass_EAttributes(): EReference {
    return this._EClass_eAttributes;
  }
  getEClass_EAllContainments(): EReference {
    return this._EClass_eAllContainments;
  }
  getEClass_EAllOperations(): EReference {
    return this._EClass_eAllOperations;
  }
  getEClass_EAllStructuralFeatures(): EReference {
    return this._EClass_eAllStructuralFeatures;
  }
  getEClass_EAllSuperTypes(): EReference {
    return this._EClass_eAllSuperTypes;
  }
  getEClass_EIDAttribute(): EReference {
    return this._EClass_eIDAttribute;
  }
  getEClass_EStructuralFeatures(): EReference {
    return this._EClass_eStructuralFeatures;
  }
  getEClass_EGenericSuperTypes(): EReference {
    return this._EClass_eGenericSuperTypes;
  }
  getEClass_EAllGenericSuperTypes(): EReference {
    return this._EClass_eAllGenericSuperTypes;
  }
  getEClassifier(): EClass {
    return this._EClassifier;
  }
  getEClassifier_InstanceClassName(): EAttribute {
    return this._EClassifier_instanceClassName;
  }
  getEClassifier_InstanceClass(): EAttribute {
    return this._EClassifier_instanceClass;
  }
  getEClassifier_DefaultValue(): EAttribute {
    return this._EClassifier_defaultValue;
  }
  getEClassifier_InstanceTypeName(): EAttribute {
    return this._EClassifier_instanceTypeName;
  }
  getEClassifier_EPackage(): EReference {
    return this._EClassifier_ePackage;
  }
  getEClassifier_ETypeParameters(): EReference {
    return this._EClassifier_eTypeParameters;
  }
  getEDataType(): EClass {
    return this._EDataType;
  }
  getEDataType_Serializable(): EAttribute {
    return this._EDataType_serializable;
  }
  getEEnum(): EClass {
    return this._EEnum;
  }
  getEEnum_ELiterals(): EReference {
    return this._EEnum_eLiterals;
  }
  getEEnumLiteral(): EClass {
    return this._EEnumLiteral;
  }
  getEEnumLiteral_Value(): EAttribute {
    return this._EEnumLiteral_value;
  }
  getEEnumLiteral_Instance(): EAttribute {
    return this._EEnumLiteral_instance;
  }
  getEEnumLiteral_Literal(): EAttribute {
    return this._EEnumLiteral_literal;
  }
  getEEnumLiteral_EEnum(): EReference {
    return this._EEnumLiteral_eEnum;
  }
  getEFactory(): EClass {
    return this._EFactory;
  }
  getEFactory_EPackage(): EReference {
    return this._EFactory_ePackage;
  }
  getEModelElement(): EClass {
    return this._EModelElement;
  }
  getEModelElement_EAnnotations(): EReference {
    return this._EModelElement_eAnnotations;
  }
  getENamedElement(): EClass {
    return this._ENamedElement;
  }
  getENamedElement_Name(): EAttribute {
    return this._ENamedElement_name;
  }
  getEOperation(): EClass {
    return this._EOperation;
  }
  getEOperation_EContainingClass(): EReference {
    return this._EOperation_eContainingClass;
  }
  getEOperation_ETypeParameters(): EReference {
    return this._EOperation_eTypeParameters;
  }
  getEOperation_EParameters(): EReference {
    return this._EOperation_eParameters;
  }
  getEOperation_EExceptions(): EReference {
    return this._EOperation_eExceptions;
  }
  getEOperation_EGenericExceptions(): EReference {
    return this._EOperation_eGenericExceptions;
  }
  getEPackage(): EClass {
    return this._EPackage;
  }
  getEPackage_NsURI(): EAttribute {
    return this._EPackage_nsURI;
  }
  getEPackage_NsPrefix(): EAttribute {
    return this._EPackage_nsPrefix;
  }
  getEPackage_EFactoryInstance(): EReference {
    return this._EPackage_eFactoryInstance;
  }
  getEPackage_EClassifiers(): EReference {
    return this._EPackage_eClassifiers;
  }
  getEPackage_ESubpackages(): EReference {
    return this._EPackage_eSubpackages;
  }
  getEPackage_ESuperPackage(): EReference {
    return this._EPackage_eSuperPackage;
  }
  getEParameter(): EClass {
    return this._EParameter;
  }
  getEParameter_EOperation(): EReference {
    return this._EParameter_eOperation;
  }
  getEReference(): EClass {
    return this._EReference;
  }
  getEReference_Containment(): EAttribute {
    return this._EReference_containment;
  }
  getEReference_Container(): EAttribute {
    return this._EReference_container;
  }
  getEReference_ResolveProxies(): EAttribute {
    return this._EReference_resolveProxies;
  }
  getEReference_EOpposite(): EReference {
    return this._EReference_eOpposite;
  }
  getEReference_EReferenceType(): EReference {
    return this._EReference_eReferenceType;
  }
  getEReference_EKeys(): EReference {
    return this._EReference_eKeys;
  }
  getEStructuralFeature(): EClass {
    return this._EStructuralFeature;
  }
  getEStructuralFeature_Changeable(): EAttribute {
    return this._EStructuralFeature_changeable;
  }
  getEStructuralFeature_Volatile(): EAttribute {
    return this._EStructuralFeature_volatile;
  }
  getEStructuralFeature_Transient(): EAttribute {
    return this._EStructuralFeature_transient;
  }
  getEStructuralFeature_DefaultValueLiteral(): EAttribute {
    return this._EStructuralFeature_defaultValueLiteral;
  }
  getEStructuralFeature_DefaultValue(): EAttribute {
    return this._EStructuralFeature_defaultValue;
  }
  getEStructuralFeature_Unsettable(): EAttribute {
    return this._EStructuralFeature_unsettable;
  }
  getEStructuralFeature_Derived(): EAttribute {
    return this._EStructuralFeature_derived;
  }
  getEStructuralFeature_EContainingClass(): EReference {
    return this._EStructuralFeature_eContainingClass;
  }
  getETypedElement(): EClass {
    return this._ETypedElement;
  }
  getETypedElement_Ordered(): EAttribute {
    return this._ETypedElement_ordered;
  }
  getETypedElement_Unique(): EAttribute {
    return this._ETypedElement_unique;
  }
  getETypedElement_LowerBound(): EAttribute {
    return this._ETypedElement_lowerBound;
  }
  getETypedElement_UpperBound(): EAttribute {
    return this._ETypedElement_upperBound;
  }
  getETypedElement_Many(): EAttribute {
    return this._ETypedElement_many;
  }
  getETypedElement_Required(): EAttribute {
    return this._ETypedElement_required;
  }
  getETypedElement_EType(): EReference {
    return this._ETypedElement_eType;
  }
  getETypedElement_EGenericType(): EReference {
    return this._ETypedElement_eGenericType;
  }
  getEBigDecimal(): EDataType {
    return this._EBigDecimal;
  }
  getEBigInteger(): EDataType {
    return this._EBigInteger;
  }
  getEBoolean(): EDataType {
    return this._EBoolean;
  }
  getEBooleanObject(): EDataType {
    return this._EBooleanObject;
  }
  getEByte(): EDataType {
    return this._EByte;
  }
  getEByteArray(): EDataType {
    return this._EByteArray;
  }
  getEByteObject(): EDataType {
    return this._EByteObject;
  }
  getEChar(): EDataType {
    return this._EChar;
  }
  getECharacterObject(): EDataType {
    return this._ECharacterObject;
  }
  getEDate(): EDataType {
    return this._EDate;
  }
  getEDiagnosticChain(): EDataType {
    return this._EDiagnosticChain;
  }
  getEDouble(): EDataType {
    return this._EDouble;
  }
  getEDoubleObject(): EDataType {
    return this._EDoubleObject;
  }
  getEEList(): EDataType {
    return this._EEList;
  }
  getEEnumerator(): EDataType {
    return this._EEnumerator;
  }
  getEFeatureMap(): EDataType {
    return this._EFeatureMap;
  }
  getEFeatureMapEntry(): EDataType {
    return this._EFeatureMapEntry;
  }
  getEFloat(): EDataType {
    return this._EFloat;
  }
  getEFloatObject(): EDataType {
    return this._EFloatObject;
  }
  getEInt(): EDataType {
    return this._EInt;
  }
  getEIntegerObject(): EDataType {
    return this._EIntegerObject;
  }
  getEJavaClass(): EDataType {
    return this._EJavaClass;
  }
  getEJavaObject(): EDataType {
    return this._EJavaObject;
  }
  getELong(): EDataType {
    return this._ELong;
  }
  getELongObject(): EDataType {
    return this._ELongObject;
  }
  getEMap(): EDataType {
    return this._EMap;
  }
  getEResource(): EDataType {
    return this._EResource;
  }
  getEResourceSet(): EDataType {
    return this._EResourceSet;
  }
  getEShort(): EDataType {
    return this._EShort;
  }
  getEShortObject(): EDataType {
    return this._EShortObject;
  }
  getEString(): EDataType {
    return this._EString;
  }
  getEStringToStringMapEntry(): EClass {
    return this._EStringToStringMapEntry;
  }
  getEStringToStringMapEntry_Key(): EAttribute {
    return this._EStringToStringMapEntry_key;
  }
  getEStringToStringMapEntry_Value(): EAttribute {
    return this._EStringToStringMapEntry_value;
  }
  getETreeIterator(): EDataType {
    return this._ETreeIterator;
  }
  getEGenericType(): EClass {
    return this._EGenericType;
  }
  getEGenericType_EUpperBound(): EReference {
    return this._EGenericType_eUpperBound;
  }
  getEGenericType_ETypeArguments(): EReference {
    return this._EGenericType_eTypeArguments;
  }
  getEGenericType_ERawType(): EReference {
    return this._EGenericType_eRawType;
  }
  getEGenericType_ELowerBound(): EReference {
    return this._EGenericType_eLowerBound;
  }
  getEGenericType_ETypeParameter(): EReference {
    return this._EGenericType_eTypeParameter;
  }
  getEGenericType_EClassifier(): EReference {
    return this._EGenericType_eClassifier;
  }
  getETypeParameter(): EClass {
    return this._ETypeParameter;
  }
  getETypeParameter_EBounds(): EReference {
    return this._ETypeParameter_eBounds;
  }
  getEInvocationTargetException(): EDataType {
    return this._EInvocationTargetException;
  }
}
