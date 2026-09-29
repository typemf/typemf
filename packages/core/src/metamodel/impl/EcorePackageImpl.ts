import { EAnnotationImpl } from './EAnnotationImpl.js';
import { EAttributeImpl } from './EAttributeImpl.js';
import { EClassImpl } from './EClassImpl.js';
import { EClassifierImpl } from './EClassifierImpl.js';
import { EDataTypeImpl } from './EDataTypeImpl.js';
import { EEnumImpl } from './EEnumImpl.js';
import { EEnumLiteralImpl } from './EEnumLiteralImpl.js';
import { EFactoryImpl } from './EFactoryImpl.js';
import { EGenericTypeImpl } from './EGenericTypeImpl.js';
import { EModelElementImpl } from './EModelElementImpl.js';
import { ENamedElementImpl } from './ENamedElementImpl.js';
import { EOperationImpl } from './EOperationImpl.js';
import { EPackageImpl } from './EPackageImpl.js';
import { EParameterImpl } from './EParameterImpl.js';
import { EReferenceImpl } from './EReferenceImpl.js';
import { EStringToStringMapEntryImpl } from './EStringToStringMapEntryImpl.js';
import { EStructuralFeatureImpl } from './EStructuralFeatureImpl.js';
import { ETypeParameterImpl } from './ETypeParameterImpl.js';
import { ETypedElementImpl } from './ETypedElementImpl.js';
import { EcoreFactoryImpl } from './EcoreFactoryImpl.js';
import { setEcorePackageRef } from './EcorePackageRef.js';
import { EcoreFactory } from '../EcoreFactory.js';
import { EcorePackage, Ids } from '../EcorePackage.js';
import { EAnnotation } from '../types/EAnnotation.js';
import { EAttribute } from '../types/EAttribute.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EDataType } from '../types/EDataType.js';
import { EReference } from '../types/EReference.js';






export class EcorePackageImpl extends EPackageImpl implements EcorePackage {
  private readonly _EAttribute: EClassImpl;
  private readonly _EAttribute_iD: EAttributeImpl;
  private readonly _EAttribute_eAttributeType: EReferenceImpl;
  private readonly _EAnnotation: EClassImpl;
  private readonly _EAnnotation_source: EAttributeImpl;
  private readonly _EAnnotation_details: EReferenceImpl;
  private readonly _EAnnotation_eModelElement: EReferenceImpl;
  private readonly _EAnnotation_contents: EReferenceImpl;
  private readonly _EAnnotation_references: EReferenceImpl;
  private readonly _EClass: EClassImpl;
  private readonly _EClass_abstract: EAttributeImpl;
  private readonly _EClass_interface: EAttributeImpl;
  private readonly _EClass_eSuperTypes: EReferenceImpl;
  private readonly _EClass_eOperations: EReferenceImpl;
  private readonly _EClass_eAllAttributes: EReferenceImpl;
  private readonly _EClass_eAllReferences: EReferenceImpl;
  private readonly _EClass_eReferences: EReferenceImpl;
  private readonly _EClass_eAttributes: EReferenceImpl;
  private readonly _EClass_eAllContainments: EReferenceImpl;
  private readonly _EClass_eAllOperations: EReferenceImpl;
  private readonly _EClass_eAllStructuralFeatures: EReferenceImpl;
  private readonly _EClass_eAllSuperTypes: EReferenceImpl;
  private readonly _EClass_eIDAttribute: EReferenceImpl;
  private readonly _EClass_eStructuralFeatures: EReferenceImpl;
  private readonly _EClass_eGenericSuperTypes: EReferenceImpl;
  private readonly _EClass_eAllGenericSuperTypes: EReferenceImpl;

  private readonly _EClass_op0: EOperationImpl;
  private readonly _EClass_op0_p0: EParameterImpl;

  private readonly _EClass_op1: EOperationImpl;

  private readonly _EClass_op2: EOperationImpl;
  private readonly _EClass_op2_p0: EParameterImpl;

  private readonly _EClass_op3: EOperationImpl;
  private readonly _EClass_op3_p0: EParameterImpl;

  private readonly _EClass_op4: EOperationImpl;
  private readonly _EClass_op4_p0: EParameterImpl;

  private readonly _EClass_op5: EOperationImpl;

  private readonly _EClass_op6: EOperationImpl;
  private readonly _EClass_op6_p0: EParameterImpl;

  private readonly _EClass_op7: EOperationImpl;
  private readonly _EClass_op7_p0: EParameterImpl;

  private readonly _EClass_op8: EOperationImpl;
  private readonly _EClass_op8_p0: EParameterImpl;
  private readonly _EClassifier: EClassImpl;
  private readonly _EClassifier_instanceClassName: EAttributeImpl;
  private readonly _EClassifier_instanceClass: EAttributeImpl;
  private readonly _EClassifier_defaultValue: EAttributeImpl;
  private readonly _EClassifier_instanceTypeName: EAttributeImpl;
  private readonly _EClassifier_ePackage: EReferenceImpl;
  private readonly _EClassifier_eTypeParameters: EReferenceImpl;

  private readonly _EClassifier_op0: EOperationImpl;
  private readonly _EClassifier_op0_p0: EParameterImpl;

  private readonly _EClassifier_op1: EOperationImpl;
  private readonly _EDataType: EClassImpl;
  private readonly _EDataType_serializable: EAttributeImpl;
  private readonly _EEnum: EClassImpl;
  private readonly _EEnum_eLiterals: EReferenceImpl;

  private readonly _EEnum_op0: EOperationImpl;
  private readonly _EEnum_op0_p0: EParameterImpl;

  private readonly _EEnum_op1: EOperationImpl;
  private readonly _EEnum_op1_p0: EParameterImpl;

  private readonly _EEnum_op2: EOperationImpl;
  private readonly _EEnum_op2_p0: EParameterImpl;
  private readonly _EEnumLiteral: EClassImpl;
  private readonly _EEnumLiteral_value: EAttributeImpl;
  private readonly _EEnumLiteral_instance: EAttributeImpl;
  private readonly _EEnumLiteral_literal: EAttributeImpl;
  private readonly _EEnumLiteral_eEnum: EReferenceImpl;
  private readonly _EFactory: EClassImpl;
  private readonly _EFactory_ePackage: EReferenceImpl;

  private readonly _EFactory_op0: EOperationImpl;
  private readonly _EFactory_op0_p0: EParameterImpl;

  private readonly _EFactory_op1: EOperationImpl;
  private readonly _EFactory_op1_p0: EParameterImpl;
  private readonly _EFactory_op1_p1: EParameterImpl;

  private readonly _EFactory_op2: EOperationImpl;
  private readonly _EFactory_op2_p0: EParameterImpl;
  private readonly _EFactory_op2_p1: EParameterImpl;
  private readonly _EModelElement: EClassImpl;
  private readonly _EModelElement_eAnnotations: EReferenceImpl;

  private readonly _EModelElement_op0: EOperationImpl;
  private readonly _EModelElement_op0_p0: EParameterImpl;
  private readonly _ENamedElement: EClassImpl;
  private readonly _ENamedElement_name: EAttributeImpl;
  private readonly _EOperation: EClassImpl;
  private readonly _EOperation_eContainingClass: EReferenceImpl;
  private readonly _EOperation_eTypeParameters: EReferenceImpl;
  private readonly _EOperation_eParameters: EReferenceImpl;
  private readonly _EOperation_eExceptions: EReferenceImpl;
  private readonly _EOperation_eGenericExceptions: EReferenceImpl;

  private readonly _EOperation_op0: EOperationImpl;

  private readonly _EOperation_op1: EOperationImpl;
  private readonly _EOperation_op1_p0: EParameterImpl;
  private readonly _EPackage: EClassImpl;
  private readonly _EPackage_nsURI: EAttributeImpl;
  private readonly _EPackage_nsPrefix: EAttributeImpl;
  private readonly _EPackage_eFactoryInstance: EReferenceImpl;
  private readonly _EPackage_eClassifiers: EReferenceImpl;
  private readonly _EPackage_eSubpackages: EReferenceImpl;
  private readonly _EPackage_eSuperPackage: EReferenceImpl;

  private readonly _EPackage_op0: EOperationImpl;
  private readonly _EPackage_op0_p0: EParameterImpl;
  private readonly _EParameter: EClassImpl;
  private readonly _EParameter_eOperation: EReferenceImpl;
  private readonly _EReference: EClassImpl;
  private readonly _EReference_containment: EAttributeImpl;
  private readonly _EReference_container: EAttributeImpl;
  private readonly _EReference_resolveProxies: EAttributeImpl;
  private readonly _EReference_eOpposite: EReferenceImpl;
  private readonly _EReference_eReferenceType: EReferenceImpl;
  private readonly _EReference_eKeys: EReferenceImpl;
  private readonly _EStructuralFeature: EClassImpl;
  private readonly _EStructuralFeature_changeable: EAttributeImpl;
  private readonly _EStructuralFeature_volatile: EAttributeImpl;
  private readonly _EStructuralFeature_transient: EAttributeImpl;
  private readonly _EStructuralFeature_defaultValueLiteral: EAttributeImpl;
  private readonly _EStructuralFeature_defaultValue: EAttributeImpl;
  private readonly _EStructuralFeature_unsettable: EAttributeImpl;
  private readonly _EStructuralFeature_derived: EAttributeImpl;
  private readonly _EStructuralFeature_eContainingClass: EReferenceImpl;

  private readonly _EStructuralFeature_op0: EOperationImpl;

  private readonly _EStructuralFeature_op1: EOperationImpl;
  private readonly _ETypedElement: EClassImpl;
  private readonly _ETypedElement_ordered: EAttributeImpl;
  private readonly _ETypedElement_unique: EAttributeImpl;
  private readonly _ETypedElement_lowerBound: EAttributeImpl;
  private readonly _ETypedElement_upperBound: EAttributeImpl;
  private readonly _ETypedElement_many: EAttributeImpl;
  private readonly _ETypedElement_required: EAttributeImpl;
  private readonly _ETypedElement_eType: EReferenceImpl;
  private readonly _ETypedElement_eGenericType: EReferenceImpl;
  private readonly _EBigDecimal: EDataTypeImpl;
  private readonly _EBigInteger: EDataTypeImpl;
  private readonly _EBoolean: EDataTypeImpl;
  private readonly _EBooleanObject: EDataTypeImpl;
  private readonly _EByte: EDataTypeImpl;
  private readonly _EByteArray: EDataTypeImpl;
  private readonly _EByteObject: EDataTypeImpl;
  private readonly _EChar: EDataTypeImpl;
  private readonly _ECharacterObject: EDataTypeImpl;
  private readonly _EDate: EDataTypeImpl;
  private readonly _EDiagnosticChain: EDataTypeImpl;
  private readonly _EDouble: EDataTypeImpl;
  private readonly _EDoubleObject: EDataTypeImpl;
  private readonly _EEList: EDataTypeImpl;
  private readonly _EEnumerator: EDataTypeImpl;
  private readonly _EFeatureMap: EDataTypeImpl;
  private readonly _EFeatureMapEntry: EDataTypeImpl;
  private readonly _EFloat: EDataTypeImpl;
  private readonly _EFloatObject: EDataTypeImpl;
  private readonly _EInt: EDataTypeImpl;
  private readonly _EIntegerObject: EDataTypeImpl;
  private readonly _EJavaClass: EDataTypeImpl;
  private readonly _EJavaObject: EDataTypeImpl;
  private readonly _ELong: EDataTypeImpl;
  private readonly _ELongObject: EDataTypeImpl;
  private readonly _EMap: EDataTypeImpl;
  private readonly _EResource: EDataTypeImpl;
  private readonly _EResourceSet: EDataTypeImpl;
  private readonly _EShort: EDataTypeImpl;
  private readonly _EShortObject: EDataTypeImpl;
  private readonly _EString: EDataTypeImpl;
  private readonly _EStringToStringMapEntry: EClassImpl;
  private readonly _EStringToStringMapEntry_key: EAttributeImpl;
  private readonly _EStringToStringMapEntry_value: EAttributeImpl;
  private readonly _ETreeIterator: EDataTypeImpl;
  private readonly _EGenericType: EClassImpl;
  private readonly _EGenericType_eUpperBound: EReferenceImpl;
  private readonly _EGenericType_eTypeArguments: EReferenceImpl;
  private readonly _EGenericType_eRawType: EReferenceImpl;
  private readonly _EGenericType_eLowerBound: EReferenceImpl;
  private readonly _EGenericType_eTypeParameter: EReferenceImpl;
  private readonly _EGenericType_eClassifier: EReferenceImpl;
  private readonly _ETypeParameter: EClassImpl;
  private readonly _ETypeParameter_eBounds: EReferenceImpl;
  private readonly _EInvocationTargetException: EDataTypeImpl;

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
      EcorePackageImpl._instance.setEFactoryInstance(factory ?? new EcoreFactoryImpl());
    } else if (factory) {
      console.warn(
        'EcorePackageImpl.init() called again with a different factory after the singleton already ' +
          'existed - ignoring the new factory and keeping the existing one.'
      );
    }
    return EcorePackageImpl._instance;
  }

  static get eINSTANCE(): EcorePackageImpl {
    return EcorePackageImpl.init();
  }

  private constructor() {
    super();
    // Set immediately, before Pass 1 constructs any classifier (each of
    // which may need this reference - see EcorePackageRef.ts's own doc
    // comment for why this is a late-bound reference rather than a
    // direct import of EcorePackageImpl.
    setEcorePackageRef(this);

    // Pass 1: create every classifier (empty shell - no features/supertypes
    // yet), so later passes can reference any of them regardless of
    // declaration order.
    this._EAttribute = new EClassImpl();
this._EAttribute.eBasicSetValue(Ids.ENamedElement.name, "EAttribute");

    this._EAttribute.setClassifierID(Ids.EAttribute.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ConsistentTransient");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EAttribute.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EAttribute);

    this._EAnnotation = new EClassImpl();
this._EAnnotation.eBasicSetValue(Ids.ENamedElement.name, "EAnnotation");

    this._EAnnotation.setClassifierID(Ids.EAnnotation.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "WellFormedSourceURI");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EAnnotation.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EAnnotation);

    this._EClass = new EClassImpl();
this._EClass.eBasicSetValue(Ids.ENamedElement.name, "EClass");

    this._EClass.setClassifierID(Ids.EClass.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "InterfaceIsAbstract AtMostOneID UniqueFeatureNames UniqueOperationSignatures NoCircularSuperTypes WellFormedMapEntryClass ConsistentSuperTypes DisjointFeatureAndOperationSignatures");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EClass);

    this._EClassifier = new EClassImpl();
this._EClassifier.eBasicSetValue(Ids.ENamedElement.name, "EClassifier");

    this._EClassifier.setClassifierID(Ids.EClassifier.self);
this._EClassifier.eBasicSetValue(Ids.EClass.abstract, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "WellFormedInstanceTypeName UniqueTypeParameterNames");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClassifier.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EClassifier);

    this._EDataType = new EClassImpl();
this._EDataType.eBasicSetValue(Ids.ENamedElement.name, "EDataType");

    this._EDataType.setClassifierID(Ids.EDataType.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EDataType);

    this._EEnum = new EClassImpl();
this._EEnum.eBasicSetValue(Ids.ENamedElement.name, "EEnum");

    this._EEnum.setClassifierID(Ids.EEnum.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "UniqueEnumeratorNames UniqueEnumeratorLiterals");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnum.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EEnum);

    this._EEnumLiteral = new EClassImpl();
this._EEnumLiteral.eBasicSetValue(Ids.ENamedElement.name, "EEnumLiteral");

    this._EEnumLiteral.setClassifierID(Ids.EEnumLiteral.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EEnumLiteral);

    this._EFactory = new EClassImpl();
this._EFactory.eBasicSetValue(Ids.ENamedElement.name, "EFactory");

    this._EFactory.setClassifierID(Ids.EFactory.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EFactory);

    this._EModelElement = new EClassImpl();
this._EModelElement.eBasicSetValue(Ids.ENamedElement.name, "EModelElement");

    this._EModelElement.setClassifierID(Ids.EModelElement.self);
this._EModelElement.eBasicSetValue(Ids.EClass.abstract, true);



this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EModelElement);

    this._ENamedElement = new EClassImpl();
this._ENamedElement.eBasicSetValue(Ids.ENamedElement.name, "ENamedElement");

    this._ENamedElement.setClassifierID(Ids.ENamedElement.self);
this._ENamedElement.eBasicSetValue(Ids.EClass.abstract, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "WellFormedName");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ENamedElement.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ENamedElement);

    this._EOperation = new EClassImpl();
this._EOperation.eBasicSetValue(Ids.ENamedElement.name, "EOperation");

    this._EOperation.setClassifierID(Ids.EOperation.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "UniqueParameterNames UniqueTypeParameterNames NoRepeatingVoid");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EOperation.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EOperation);

    this._EPackage = new EClassImpl();
this._EPackage.eBasicSetValue(Ids.ENamedElement.name, "EPackage");

    this._EPackage.setClassifierID(Ids.EPackage.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "WellFormedNsURI WellFormedNsPrefix UniqueSubpackageNames UniqueClassifierNames UniqueNsURIs");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EPackage.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EPackage);

    this._EParameter = new EClassImpl();
this._EParameter.eBasicSetValue(Ids.ENamedElement.name, "EParameter");

    this._EParameter.setClassifierID(Ids.EParameter.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EParameter);

    this._EReference = new EClassImpl();
this._EReference.eBasicSetValue(Ids.ENamedElement.name, "EReference");

    this._EReference.setClassifierID(Ids.EReference.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ConsistentOpposite SingleContainer ConsistentKeys ConsistentUnique ConsistentContainer");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EReference.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EReference);

    this._EStructuralFeature = new EClassImpl();
this._EStructuralFeature.eBasicSetValue(Ids.ENamedElement.name, "EStructuralFeature");

    this._EStructuralFeature.setClassifierID(Ids.EStructuralFeature.self);
this._EStructuralFeature.eBasicSetValue(Ids.EClass.abstract, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ValidDefaultValueLiteral");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EStructuralFeature.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EStructuralFeature);

    this._ETypedElement = new EClassImpl();
this._ETypedElement.eBasicSetValue(Ids.ENamedElement.name, "ETypedElement");

    this._ETypedElement.setClassifierID(Ids.ETypedElement.self);
this._ETypedElement.eBasicSetValue(Ids.EClass.abstract, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ValidLowerBound ValidUpperBound ConsistentBounds ValidType");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ETypedElement.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ETypedElement);

    this._EBigDecimal = new EDataTypeImpl();
this._EBigDecimal.eBasicSetValue(Ids.ENamedElement.name, "EBigDecimal");

    this._EBigDecimal.setClassifierID(Ids.EBigDecimal.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#decimal");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBigDecimal.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBigDecimal.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EBigDecimal);

    this._EBigInteger = new EDataTypeImpl();
this._EBigInteger.eBasicSetValue(Ids.ENamedElement.name, "EBigInteger");

    this._EBigInteger.setClassifierID(Ids.EBigInteger.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#integer");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBigInteger.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBigInteger.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EBigInteger);

    this._EBoolean = new EDataTypeImpl();
this._EBoolean.eBasicSetValue(Ids.ENamedElement.name, "EBoolean");

    this._EBoolean.setClassifierID(Ids.EBoolean.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#boolean");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBoolean.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "boolean");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBoolean.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EBoolean);

    this._EBooleanObject = new EDataTypeImpl();
this._EBooleanObject.eBasicSetValue(Ids.ENamedElement.name, "EBooleanObject");

    this._EBooleanObject.setClassifierID(Ids.EBooleanObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EBoolean");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EBoolean:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBooleanObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "boolean | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EBooleanObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EBooleanObject);

    this._EByte = new EDataTypeImpl();
this._EByte.eBasicSetValue(Ids.ENamedElement.name, "EByte");

    this._EByte.setClassifierID(Ids.EByte.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#byte");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EByte.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EByte.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EByte);

    this._EByteArray = new EDataTypeImpl();
this._EByteArray.eBasicSetValue(Ids.ENamedElement.name, "EByteArray");

    this._EByteArray.setClassifierID(Ids.EByteArray.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#hexBinary");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EByteArray.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number []");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EByteArray.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EByteArray);

    this._EByteObject = new EDataTypeImpl();
this._EByteObject.eBasicSetValue(Ids.ENamedElement.name, "EByteObject");

    this._EByteObject.setClassifierID(Ids.EByteObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EByte");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EByte:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EByteObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EByteObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EByteObject);

    this._EChar = new EDataTypeImpl();
this._EChar.eBasicSetValue(Ids.ENamedElement.name, "EChar");

    this._EChar.setClassifierID(Ids.EChar.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "string");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EChar.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EChar);

    this._ECharacterObject = new EDataTypeImpl();
this._ECharacterObject.eBasicSetValue(Ids.ENamedElement.name, "ECharacterObject");

    this._ECharacterObject.setClassifierID(Ids.ECharacterObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EChar");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EChar:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ECharacterObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "string []");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ECharacterObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ECharacterObject);

    this._EDate = new EDataTypeImpl();
this._EDate.eBasicSetValue(Ids.ENamedElement.name, "EDate");

    this._EDate.setClassifierID(Ids.EDate.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "unknown");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EDate.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EDate);

    this._EDiagnosticChain = new EDataTypeImpl();
this._EDiagnosticChain.eBasicSetValue(Ids.ENamedElement.name, "EDiagnosticChain");

    this._EDiagnosticChain.setClassifierID(Ids.EDiagnosticChain.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EDiagnosticChain);

    this._EDouble = new EDataTypeImpl();
this._EDouble.eBasicSetValue(Ids.ENamedElement.name, "EDouble");

    this._EDouble.setClassifierID(Ids.EDouble.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#double");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EDouble.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EDouble.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EDouble);

    this._EDoubleObject = new EDataTypeImpl();
this._EDoubleObject.eBasicSetValue(Ids.ENamedElement.name, "EDoubleObject");

    this._EDoubleObject.setClassifierID(Ids.EDoubleObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EDouble");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EDouble:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EDoubleObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EDoubleObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EDoubleObject);

    this._EEList = new EDataTypeImpl();
this._EEList.eBasicSetValue(Ids.ENamedElement.name, "EEList");

    this._EEList.setClassifierID(Ids.EEList.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEList.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./types/EList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEList.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EEList);

    this._EEnumerator = new EDataTypeImpl();
this._EEnumerator.eBasicSetValue(Ids.ENamedElement.name, "EEnumerator");

    this._EEnumerator.setClassifierID(Ids.EEnumerator.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EEnumerator");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnumerator.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EEnumerator");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./types/EEnumerator");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnumerator.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EEnumerator);

    this._EFeatureMap = new EDataTypeImpl();
this._EFeatureMap.eBasicSetValue(Ids.ENamedElement.name, "EFeatureMap");

    this._EFeatureMap.setClassifierID(Ids.EFeatureMap.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EFeatureMap);

    this._EFeatureMapEntry = new EDataTypeImpl();
this._EFeatureMapEntry.eBasicSetValue(Ids.ENamedElement.name, "EFeatureMapEntry");

    this._EFeatureMapEntry.setClassifierID(Ids.EFeatureMapEntry.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EFeatureMapEntry);

    this._EFloat = new EDataTypeImpl();
this._EFloat.eBasicSetValue(Ids.ENamedElement.name, "EFloat");

    this._EFloat.setClassifierID(Ids.EFloat.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#float");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFloat.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFloat.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EFloat);

    this._EFloatObject = new EDataTypeImpl();
this._EFloatObject.eBasicSetValue(Ids.ENamedElement.name, "EFloatObject");

    this._EFloatObject.setClassifierID(Ids.EFloatObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EFloat");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EFloat:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFloatObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFloatObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EFloatObject);

    this._EInt = new EDataTypeImpl();
this._EInt.eBasicSetValue(Ids.ENamedElement.name, "EInt");

    this._EInt.setClassifierID(Ids.EInt.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#int");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EInt.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EInt.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EInt);

    this._EIntegerObject = new EDataTypeImpl();
this._EIntegerObject.eBasicSetValue(Ids.ENamedElement.name, "EIntegerObject");

    this._EIntegerObject.setClassifierID(Ids.EIntegerObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EInt");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EInt:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EIntegerObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EIntegerObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EIntegerObject);

    this._EJavaClass = new EDataTypeImpl();
this._EJavaClass.eBasicSetValue(Ids.ENamedElement.name, "EJavaClass");

    this._EJavaClass.setClassifierID(Ids.EJavaClass.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "TypeScriptClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EJavaClass.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "TypeScriptClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./types/TypeScriptClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EJavaClass.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EJavaClass);

    this._EJavaObject = new EDataTypeImpl();
this._EJavaObject.eBasicSetValue(Ids.ENamedElement.name, "EJavaObject");

    this._EJavaObject.setClassifierID(Ids.EJavaObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "unknown");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EJavaObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EJavaObject);

    this._ELong = new EDataTypeImpl();
this._ELong.eBasicSetValue(Ids.ENamedElement.name, "ELong");

    this._ELong.setClassifierID(Ids.ELong.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#long");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ELong.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ELong.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ELong);

    this._ELongObject = new EDataTypeImpl();
this._ELongObject.eBasicSetValue(Ids.ENamedElement.name, "ELongObject");

    this._ELongObject.setClassifierID(Ids.ELongObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ELong");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ELong:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ELongObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ELongObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ELongObject);

    this._EMap = new EDataTypeImpl();
this._EMap.eBasicSetValue(Ids.ENamedElement.name, "EMap");

    this._EMap.setClassifierID(Ids.EMap.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EMap");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EMap.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EMap");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./types/EMap");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EMap.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EMap);

    this._EResource = new EDataTypeImpl();
this._EResource.eBasicSetValue(Ids.ENamedElement.name, "EResource");

    this._EResource.setClassifierID(Ids.EResource.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "Resource");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EResource.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "Resource");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "../resource/Resource");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EResource.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EResource);

    this._EResourceSet = new EDataTypeImpl();
this._EResourceSet.eBasicSetValue(Ids.ENamedElement.name, "EResourceSet");

    this._EResourceSet.setClassifierID(Ids.EResourceSet.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ResourceSet");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EResourceSet.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ResourceSet");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "../resource/ResourceSet");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EResourceSet.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EResourceSet);

    this._EShort = new EDataTypeImpl();
this._EShort.eBasicSetValue(Ids.ENamedElement.name, "EShort");

    this._EShort.setClassifierID(Ids.EShort.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#short");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EShort.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EShort.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EShort);

    this._EShortObject = new EDataTypeImpl();
this._EShortObject.eBasicSetValue(Ids.ENamedElement.name, "EShortObject");

    this._EShortObject.setClassifierID(Ids.EShortObject.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EShort");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EShort:Object");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EShortObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "number | undefined");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EShortObject.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EShortObject);

    this._EString = new EDataTypeImpl();
this._EString.eBasicSetValue(Ids.ENamedElement.name, "EString");

    this._EString.setClassifierID(Ids.EString.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http:///org/eclipse/emf/ecore/util/ExtendedMetaData");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "baseType");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "http://www.w3.org/2001/XMLSchema#string");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EString.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "string");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EString.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EString);

    this._EStringToStringMapEntry = new EClassImpl();
this._EStringToStringMapEntry.eBasicSetValue(Ids.ENamedElement.name, "EStringToStringMapEntry");

    this._EStringToStringMapEntry.setClassifierID(Ids.EStringToStringMapEntry.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EStringToStringMapEntry");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EStringToStringMapEntry.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EStringToStringMapEntry");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./types/EStringToStringMapEntry");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EStringToStringMapEntry.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EStringToStringMapEntry);

    this._ETreeIterator = new EDataTypeImpl();
this._ETreeIterator.eBasicSetValue(Ids.ENamedElement.name, "ETreeIterator");

    this._ETreeIterator.setClassifierID(Ids.ETreeIterator.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ETreeIterator);

    this._EGenericType = new EClassImpl();
this._EGenericType.eBasicSetValue(Ids.ENamedElement.name, "EGenericType");

    this._EGenericType.setClassifierID(Ids.EGenericType.self);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/Ecore");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "constraints");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "ConsistentType ConsistentBounds ConsistentArguments");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EGenericType.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EGenericType);

    this._ETypeParameter = new EClassImpl();
this._ETypeParameter.eBasicSetValue(Ids.ENamedElement.name, "ETypeParameter");

    this._ETypeParameter.setClassifierID(Ids.ETypeParameter.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._ETypeParameter);

    this._EInvocationTargetException = new EDataTypeImpl();
this._EInvocationTargetException.eBasicSetValue(Ids.ENamedElement.name, "EInvocationTargetException");

    this._EInvocationTargetException.setClassifierID(Ids.EInvocationTargetException.self);


this.eBootstrapList(Ids.EPackage.eClassifiers).add(this._EInvocationTargetException);


    // Pass 2: attributes/references, now that every classifier (including
    // ones referenced as a feature's eType) already exists.
    this._EAttribute_iD = new EAttributeImpl();
this._EAttribute_iD.eBasicSetValue(Ids.ENamedElement.name, "iD");

this._EAttribute_iD.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EAttribute_iD.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EAttribute_iD.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EAttribute_iD.setFeatureID(Ids.EAttribute.iD);
    this._EAttribute_iD.setContainerClass(EAttributeImpl);
this._EAttribute_iD.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAttribute);



this._EAttribute.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAttribute_iD);

    this._EAttribute_eAttributeType = new EReferenceImpl();
this._EAttribute_eAttributeType.eBasicSetValue(Ids.ENamedElement.name, "eAttributeType");

this._EAttribute_eAttributeType.eBasicSetValue(Ids.ETypedElement.eType, this._EDataType);

this._EAttribute_eAttributeType.eBasicSetValue(Ids.ETypedElement.lowerBound, 1);

this._EAttribute_eAttributeType.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EAttribute_eAttributeType.setFeatureID(Ids.EAttribute.eAttributeType);
    this._EAttribute_eAttributeType.setContainerClass(EAttributeImpl);
this._EAttribute_eAttributeType.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAttribute);

this._EAttribute_eAttributeType.eBasicSetValue(Ids.EReference.containment, false);



this._EAttribute.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAttribute_eAttributeType);

    this._EAnnotation_source = new EAttributeImpl();
this._EAnnotation_source.eBasicSetValue(Ids.ENamedElement.name, "source");

this._EAnnotation_source.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EAnnotation_source.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EAnnotation_source.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EAnnotation_source.setFeatureID(Ids.EAnnotation.source);
    this._EAnnotation_source.setContainerClass(EAnnotationImpl);
this._EAnnotation_source.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAnnotation);



this._EAnnotation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAnnotation_source);

    this._EAnnotation_details = new EReferenceImpl();
this._EAnnotation_details.eBasicSetValue(Ids.ENamedElement.name, "details");

this._EAnnotation_details.eBasicSetValue(Ids.ETypedElement.eType, this._EStringToStringMapEntry);

this._EAnnotation_details.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EAnnotation_details.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EAnnotation_details.setFeatureID(Ids.EAnnotation.details);
    this._EAnnotation_details.setContainerClass(EAnnotationImpl);
this._EAnnotation_details.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAnnotation);

this._EAnnotation_details.eBasicSetValue(Ids.EReference.containment, true);



this._EAnnotation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAnnotation_details);

    this._EAnnotation_eModelElement = new EReferenceImpl();
this._EAnnotation_eModelElement.eBasicSetValue(Ids.ENamedElement.name, "eModelElement");

this._EAnnotation_eModelElement.eBasicSetValue(Ids.ETypedElement.eType, this._EModelElement);

this._EAnnotation_eModelElement.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EAnnotation_eModelElement.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EAnnotation_eModelElement.setFeatureID(Ids.EAnnotation.eModelElement);
    this._EAnnotation_eModelElement.setContainerClass(EAnnotationImpl);
this._EAnnotation_eModelElement.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAnnotation);

this._EAnnotation_eModelElement.eBasicSetValue(Ids.EReference.containment, false);



this._EAnnotation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAnnotation_eModelElement);

    this._EAnnotation_contents = new EReferenceImpl();
this._EAnnotation_contents.eBasicSetValue(Ids.ENamedElement.name, "contents");

this._EAnnotation_contents.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EAnnotation_contents.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EAnnotation_contents.setFeatureID(Ids.EAnnotation.contents);
    this._EAnnotation_contents.setContainerClass(EAnnotationImpl);
this._EAnnotation_contents.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAnnotation);

this._EAnnotation_contents.eBasicSetValue(Ids.EReference.containment, true);



this._EAnnotation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAnnotation_contents);

    this._EAnnotation_references = new EReferenceImpl();
this._EAnnotation_references.eBasicSetValue(Ids.ENamedElement.name, "references");

this._EAnnotation_references.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EAnnotation_references.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EAnnotation_references.setFeatureID(Ids.EAnnotation.references);
    this._EAnnotation_references.setContainerClass(EAnnotationImpl);
this._EAnnotation_references.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EAnnotation);

this._EAnnotation_references.eBasicSetValue(Ids.EReference.containment, false);



this._EAnnotation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EAnnotation_references);

    this._EClass_abstract = new EAttributeImpl();
this._EClass_abstract.eBasicSetValue(Ids.ENamedElement.name, "abstract");

this._EClass_abstract.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EClass_abstract.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_abstract.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClass_abstract.setFeatureID(Ids.EClass.abstract);
    this._EClass_abstract.setContainerClass(EClassImpl);
this._EClass_abstract.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);



this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_abstract);

    this._EClass_interface = new EAttributeImpl();
this._EClass_interface.eBasicSetValue(Ids.ENamedElement.name, "interface");

this._EClass_interface.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EClass_interface.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_interface.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClass_interface.setFeatureID(Ids.EClass.interface);
    this._EClass_interface.setContainerClass(EClassImpl);
this._EClass_interface.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);



this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_interface);

    this._EClass_eSuperTypes = new EReferenceImpl();
this._EClass_eSuperTypes.eBasicSetValue(Ids.ENamedElement.name, "eSuperTypes");

this._EClass_eSuperTypes.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EClass_eSuperTypes.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eSuperTypes.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eSuperTypes.setFeatureID(Ids.EClass.eSuperTypes);
    this._EClass_eSuperTypes.setContainerClass(EClassImpl);
this._EClass_eSuperTypes.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eSuperTypes.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eSuperTypes);

    this._EClass_eOperations = new EReferenceImpl();
this._EClass_eOperations.eBasicSetValue(Ids.ENamedElement.name, "eOperations");

this._EClass_eOperations.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EClass_eOperations.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eOperations.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eOperations.setFeatureID(Ids.EClass.eOperations);
    this._EClass_eOperations.setContainerClass(EClassImpl);
this._EClass_eOperations.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eOperations.eBasicSetValue(Ids.EReference.containment, true);



this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eOperations);

    this._EClass_eAllAttributes = new EReferenceImpl();
this._EClass_eAllAttributes.eBasicSetValue(Ids.ENamedElement.name, "eAllAttributes");

this._EClass_eAllAttributes.eBasicSetValue(Ids.ETypedElement.eType, this._EAttribute);

this._EClass_eAllAttributes.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllAttributes.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllAttributes.setFeatureID(Ids.EClass.eAllAttributes);
    this._EClass_eAllAttributes.setContainerClass(EClassImpl);
this._EClass_eAllAttributes.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllAttributes.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return new BasicEList<EAttribute>(undefined, undefined, this.getEAllStructuralFeatures().filter(isEAttribute) as EAttribute[]);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllAttributes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllAttributes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEAttribute");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllAttributes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllAttributes);

    this._EClass_eAllReferences = new EReferenceImpl();
this._EClass_eAllReferences.eBasicSetValue(Ids.ENamedElement.name, "eAllReferences");

this._EClass_eAllReferences.eBasicSetValue(Ids.ETypedElement.eType, this._EReference);

this._EClass_eAllReferences.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllReferences.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllReferences.setFeatureID(Ids.EClass.eAllReferences);
    this._EClass_eAllReferences.setContainerClass(EClassImpl);
this._EClass_eAllReferences.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllReferences.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return new BasicEList<EReference>(undefined, undefined, this.getEAllStructuralFeatures().filter(isEReference) as EReference[]);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllReferences.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllReferences.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEReference");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllReferences.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllReferences);

    this._EClass_eReferences = new EReferenceImpl();
this._EClass_eReferences.eBasicSetValue(Ids.ENamedElement.name, "eReferences");

this._EClass_eReferences.eBasicSetValue(Ids.ETypedElement.eType, this._EReference);

this._EClass_eReferences.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eReferences.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eReferences.setFeatureID(Ids.EClass.eReferences);
    this._EClass_eReferences.setContainerClass(EClassImpl);
this._EClass_eReferences.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eReferences.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return new BasicEList<EReference>(undefined, undefined, this.getEStructuralFeatures().filter(isEReference) as EReference[]);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eReferences.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eReferences.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEReference");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eReferences.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eReferences);

    this._EClass_eAttributes = new EReferenceImpl();
this._EClass_eAttributes.eBasicSetValue(Ids.ENamedElement.name, "eAttributes");

this._EClass_eAttributes.eBasicSetValue(Ids.ETypedElement.eType, this._EAttribute);

this._EClass_eAttributes.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAttributes.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAttributes.setFeatureID(Ids.EClass.eAttributes);
    this._EClass_eAttributes.setContainerClass(EClassImpl);
this._EClass_eAttributes.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAttributes.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return new BasicEList<EAttribute>(undefined, undefined, this.getEStructuralFeatures().filter(isEAttribute) as EAttribute[]);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAttributes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAttributes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEAttribute");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAttributes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAttributes);

    this._EClass_eAllContainments = new EReferenceImpl();
this._EClass_eAllContainments.eBasicSetValue(Ids.ENamedElement.name, "eAllContainments");

this._EClass_eAllContainments.eBasicSetValue(Ids.ETypedElement.eType, this._EReference);

this._EClass_eAllContainments.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllContainments.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllContainments.setFeatureID(Ids.EClass.eAllContainments);
    this._EClass_eAllContainments.setContainerClass(EClassImpl);
this._EClass_eAllContainments.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllContainments.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const references = this.getEAllStructuralFeatures().filter(isEReference) as EReference[];\nreturn new BasicEList<EReference>(undefined, undefined, references.filter(reference => reference.isContainment()));");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllContainments.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllContainments.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEReference");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllContainments.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllContainments);

    this._EClass_eAllOperations = new EReferenceImpl();
this._EClass_eAllOperations.eBasicSetValue(Ids.ENamedElement.name, "eAllOperations");

this._EClass_eAllOperations.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EClass_eAllOperations.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllOperations.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllOperations.setFeatureID(Ids.EClass.eAllOperations);
    this._EClass_eAllOperations.setContainerClass(EClassImpl);
this._EClass_eAllOperations.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllOperations.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const operations = new Set<EOperation>();\nconst visited = new Set<EClass>();\nconst visit = (eClass: EClass): void => {\n  if (visited.has(eClass)) return;\n  visited.add(eClass);\n  eClass.getESuperTypes().forEach(visit);\n  for (const generic of eClass.getEGenericSuperTypes()) {\n    const raw = generic.getEClassifier();\n    if (raw !== undefined && isEClass(raw)) visit(raw);\n  }\n  eClass.getEOperations().forEach(operation => operations.add(operation));\n};\nvisit(this);\nreturn new BasicEList<EOperation>(undefined, undefined, operations);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllOperations.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllOperations.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllOperations.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllOperations);

    this._EClass_eAllStructuralFeatures = new EReferenceImpl();
this._EClass_eAllStructuralFeatures.eBasicSetValue(Ids.ENamedElement.name, "eAllStructuralFeatures");

this._EClass_eAllStructuralFeatures.eBasicSetValue(Ids.ETypedElement.eType, this._EStructuralFeature);

this._EClass_eAllStructuralFeatures.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllStructuralFeatures.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllStructuralFeatures.setFeatureID(Ids.EClass.eAllStructuralFeatures);
    this._EClass_eAllStructuralFeatures.setContainerClass(EClassImpl);
this._EClass_eAllStructuralFeatures.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllStructuralFeatures.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const features = new Set<EStructuralFeature>();\nconst visited = new Set<EClass>();\nconst visit = (eClass: EClass): void => {\n  if (visited.has(eClass)) return;\n  visited.add(eClass);\n  eClass.getESuperTypes().forEach(visit);\n  for (const generic of eClass.getEGenericSuperTypes()) {\n    const raw = generic.getEClassifier();\n    if (raw !== undefined && isEClass(raw)) visit(raw);\n  }\n  eClass.getEStructuralFeatures().forEach(feature => features.add(feature));\n};\nvisit(this);\nreturn new BasicEList<EStructuralFeature>(undefined, undefined, features);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllStructuralFeatures.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllStructuralFeatures.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllStructuralFeatures.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllStructuralFeatures);

    this._EClass_eAllSuperTypes = new EReferenceImpl();
this._EClass_eAllSuperTypes.eBasicSetValue(Ids.ENamedElement.name, "eAllSuperTypes");

this._EClass_eAllSuperTypes.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EClass_eAllSuperTypes.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllSuperTypes.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllSuperTypes.setFeatureID(Ids.EClass.eAllSuperTypes);
    this._EClass_eAllSuperTypes.setContainerClass(EClassImpl);
this._EClass_eAllSuperTypes.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllSuperTypes.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const superTypes = new Set<EClass>();\nconst visited = new Set<EClass>();\nconst visit = (eClass: EClass): void => {\n  if (visited.has(eClass)) return;\n  visited.add(eClass);\n  for (const sup of eClass.getESuperTypes()) {\n    visit(sup);\n    superTypes.add(sup);\n  }\n  for (const generic of eClass.getEGenericSuperTypes()) {\n    const raw = generic.getEClassifier();\n    if (raw !== undefined && isEClass(raw)) {\n      visit(raw);\n      superTypes.add(raw);\n    }\n  }\n};\nvisit(this);\nreturn new BasicEList<EClass>(undefined, undefined, superTypes);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllSuperTypes);

    this._EClass_eIDAttribute = new EReferenceImpl();
this._EClass_eIDAttribute.eBasicSetValue(Ids.ENamedElement.name, "eIDAttribute");

this._EClass_eIDAttribute.eBasicSetValue(Ids.ETypedElement.eType, this._EAttribute);

this._EClass_eIDAttribute.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eIDAttribute.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClass_eIDAttribute.setFeatureID(Ids.EClass.eIDAttribute);
    this._EClass_eIDAttribute.setContainerClass(EClassImpl);
this._EClass_eIDAttribute.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eIDAttribute.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAllAttributes().find(a => a.isID());");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eIDAttribute.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eIDAttribute);

    this._EClass_eStructuralFeatures = new EReferenceImpl();
this._EClass_eStructuralFeatures.eBasicSetValue(Ids.ENamedElement.name, "eStructuralFeatures");

this._EClass_eStructuralFeatures.eBasicSetValue(Ids.ETypedElement.eType, this._EStructuralFeature);

this._EClass_eStructuralFeatures.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eStructuralFeatures.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eStructuralFeatures.setFeatureID(Ids.EClass.eStructuralFeatures);
    this._EClass_eStructuralFeatures.setContainerClass(EClassImpl);
this._EClass_eStructuralFeatures.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eStructuralFeatures.eBasicSetValue(Ids.EReference.containment, true);



this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eStructuralFeatures);

    this._EClass_eGenericSuperTypes = new EReferenceImpl();
this._EClass_eGenericSuperTypes.eBasicSetValue(Ids.ENamedElement.name, "eGenericSuperTypes");

this._EClass_eGenericSuperTypes.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._EClass_eGenericSuperTypes.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eGenericSuperTypes.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eGenericSuperTypes.setFeatureID(Ids.EClass.eGenericSuperTypes);
    this._EClass_eGenericSuperTypes.setContainerClass(EClassImpl);
this._EClass_eGenericSuperTypes.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eGenericSuperTypes.eBasicSetValue(Ids.EReference.containment, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eGenericSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eGenericSuperTypes);

    this._EClass_eAllGenericSuperTypes = new EReferenceImpl();
this._EClass_eAllGenericSuperTypes.eBasicSetValue(Ids.ENamedElement.name, "eAllGenericSuperTypes");

this._EClass_eAllGenericSuperTypes.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._EClass_eAllGenericSuperTypes.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_eAllGenericSuperTypes.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClass_eAllGenericSuperTypes.setFeatureID(Ids.EClass.eAllGenericSuperTypes);
    this._EClass_eAllGenericSuperTypes.setContainerClass(EClassImpl);
this._EClass_eAllGenericSuperTypes.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClass);

this._EClass_eAllGenericSuperTypes.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const genericSuperTypes = new Set<EGenericType>();\nconst visited = new Set<EClass>();\nconst visit = (eClass: EClass): void => {\n  if (visited.has(eClass)) return;\n  visited.add(eClass);\n  for (const sup of eClass.getESuperTypes()) {\n    visit(sup);\n    const implicit = new EGenericTypeImpl();\n    implicit.setEClassifier(sup);\n    genericSuperTypes.add(implicit);\n  }\n  for (const generic of eClass.getEGenericSuperTypes()) {\n    const raw = generic.getEClassifier();\n    if (raw !== undefined && isEClass(raw)) {\n      visit(raw);\n      genericSuperTypes.add(generic);\n    }\n  }\n};\nvisit(this);\nreturn new BasicEList<EGenericType>(undefined, undefined, genericSuperTypes);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllGenericSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "BasicEList");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/BasicEList.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllGenericSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllGenericSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EGenericTypeImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/EGenericTypeImpl.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_eAllGenericSuperTypes.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClass_eAllGenericSuperTypes);

    this._EClassifier_instanceClassName = new EAttributeImpl();
this._EClassifier_instanceClassName.eBasicSetValue(Ids.ENamedElement.name, "instanceClassName");

this._EClassifier_instanceClassName.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EClassifier_instanceClassName.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_instanceClassName.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClassifier_instanceClassName.setFeatureID(Ids.EClassifier.instanceClassName);
    this._EClassifier_instanceClassName.setContainerClass(EClassifierImpl);
this._EClassifier_instanceClassName.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClassifier);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClassifier_instanceClassName.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClassifier.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClassifier_instanceClassName);

    this._EClassifier_instanceClass = new EAttributeImpl();
this._EClassifier_instanceClass.eBasicSetValue(Ids.ENamedElement.name, "instanceClass");

this._EClassifier_instanceClass.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaClass);

this._EClassifier_instanceClass.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_instanceClass.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClassifier_instanceClass.setFeatureID(Ids.EClassifier.instanceClass);
    this._EClassifier_instanceClass.setContainerClass(EClassifierImpl);
this._EClassifier_instanceClass.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClassifier);



this._EClassifier.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClassifier_instanceClass);

    this._EClassifier_defaultValue = new EAttributeImpl();
this._EClassifier_defaultValue.eBasicSetValue(Ids.ENamedElement.name, "defaultValue");

this._EClassifier_defaultValue.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaObject);

this._EClassifier_defaultValue.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_defaultValue.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClassifier_defaultValue.setFeatureID(Ids.EClassifier.defaultValue);
    this._EClassifier_defaultValue.setContainerClass(EClassifierImpl);
this._EClassifier_defaultValue.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClassifier);



this._EClassifier.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClassifier_defaultValue);

    this._EClassifier_instanceTypeName = new EAttributeImpl();
this._EClassifier_instanceTypeName.eBasicSetValue(Ids.ENamedElement.name, "instanceTypeName");

this._EClassifier_instanceTypeName.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EClassifier_instanceTypeName.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_instanceTypeName.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClassifier_instanceTypeName.setFeatureID(Ids.EClassifier.instanceTypeName);
    this._EClassifier_instanceTypeName.setContainerClass(EClassifierImpl);
this._EClassifier_instanceTypeName.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClassifier);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClassifier_instanceTypeName.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClassifier.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClassifier_instanceTypeName);

    this._EClassifier_ePackage = new EReferenceImpl();
this._EClassifier_ePackage.eBasicSetValue(Ids.ENamedElement.name, "ePackage");

this._EClassifier_ePackage.eBasicSetValue(Ids.ETypedElement.eType, this._EPackage);

this._EClassifier_ePackage.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_ePackage.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EClassifier_ePackage.setFeatureID(Ids.EClassifier.ePackage);
    this._EClassifier_ePackage.setContainerClass(EClassifierImpl);
this._EClassifier_ePackage.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClassifier);

this._EClassifier_ePackage.eBasicSetValue(Ids.EReference.containment, false);



this._EClassifier.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClassifier_ePackage);

    this._EClassifier_eTypeParameters = new EReferenceImpl();
this._EClassifier_eTypeParameters.eBasicSetValue(Ids.ENamedElement.name, "eTypeParameters");

this._EClassifier_eTypeParameters.eBasicSetValue(Ids.ETypedElement.eType, this._ETypeParameter);

this._EClassifier_eTypeParameters.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_eTypeParameters.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EClassifier_eTypeParameters.setFeatureID(Ids.EClassifier.eTypeParameters);
    this._EClassifier_eTypeParameters.setContainerClass(EClassifierImpl);
this._EClassifier_eTypeParameters.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EClassifier);

this._EClassifier_eTypeParameters.eBasicSetValue(Ids.EReference.containment, true);



this._EClassifier.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EClassifier_eTypeParameters);

    this._EDataType_serializable = new EAttributeImpl();
this._EDataType_serializable.eBasicSetValue(Ids.ENamedElement.name, "serializable");

this._EDataType_serializable.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EDataType_serializable.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EDataType_serializable.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EDataType_serializable.setFeatureID(Ids.EDataType.serializable);
    this._EDataType_serializable.setContainerClass(EDataTypeImpl);
this._EDataType_serializable.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EDataType);



this._EDataType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EDataType_serializable);

    this._EEnum_eLiterals = new EReferenceImpl();
this._EEnum_eLiterals.eBasicSetValue(Ids.ENamedElement.name, "eLiterals");

this._EEnum_eLiterals.eBasicSetValue(Ids.ETypedElement.eType, this._EEnumLiteral);

this._EEnum_eLiterals.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnum_eLiterals.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EEnum_eLiterals.setFeatureID(Ids.EEnum.eLiterals);
    this._EEnum_eLiterals.setContainerClass(EEnumImpl);
this._EEnum_eLiterals.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EEnum);

this._EEnum_eLiterals.eBasicSetValue(Ids.EReference.containment, true);



this._EEnum.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EEnum_eLiterals);

    this._EEnumLiteral_value = new EAttributeImpl();
this._EEnumLiteral_value.eBasicSetValue(Ids.ENamedElement.name, "value");

this._EEnumLiteral_value.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EEnumLiteral_value.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnumLiteral_value.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EEnumLiteral_value.setFeatureID(Ids.EEnumLiteral.value);
    this._EEnumLiteral_value.setContainerClass(EEnumLiteralImpl);
this._EEnumLiteral_value.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EEnumLiteral);



this._EEnumLiteral.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EEnumLiteral_value);

    this._EEnumLiteral_instance = new EAttributeImpl();
this._EEnumLiteral_instance.eBasicSetValue(Ids.ENamedElement.name, "instance");

this._EEnumLiteral_instance.eBasicSetValue(Ids.ETypedElement.eType, this._EEnumerator);

this._EEnumLiteral_instance.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnumLiteral_instance.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EEnumLiteral_instance.setFeatureID(Ids.EEnumLiteral.instance);
    this._EEnumLiteral_instance.setContainerClass(EEnumLiteralImpl);
this._EEnumLiteral_instance.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EEnumLiteral);



this._EEnumLiteral.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EEnumLiteral_instance);

    this._EEnumLiteral_literal = new EAttributeImpl();
this._EEnumLiteral_literal.eBasicSetValue(Ids.ENamedElement.name, "literal");

this._EEnumLiteral_literal.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EEnumLiteral_literal.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnumLiteral_literal.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EEnumLiteral_literal.setFeatureID(Ids.EEnumLiteral.literal);
    this._EEnumLiteral_literal.setContainerClass(EEnumLiteralImpl);
this._EEnumLiteral_literal.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EEnumLiteral);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this._literal ?? this.getName();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "set");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const oldValue = this._literal; if (oldValue === value) return; this._literal = value; this.eDidRemove(undefined, oldValue); this.eDidAdd(undefined, value);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnumLiteral_literal.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EEnumLiteral.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EEnumLiteral_literal);

    this._EEnumLiteral_eEnum = new EReferenceImpl();
this._EEnumLiteral_eEnum.eBasicSetValue(Ids.ENamedElement.name, "eEnum");

this._EEnumLiteral_eEnum.eBasicSetValue(Ids.ETypedElement.eType, this._EEnum);

this._EEnumLiteral_eEnum.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnumLiteral_eEnum.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EEnumLiteral_eEnum.setFeatureID(Ids.EEnumLiteral.eEnum);
    this._EEnumLiteral_eEnum.setContainerClass(EEnumLiteralImpl);
this._EEnumLiteral_eEnum.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EEnumLiteral);

this._EEnumLiteral_eEnum.eBasicSetValue(Ids.EReference.containment, false);



this._EEnumLiteral.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EEnumLiteral_eEnum);

    this._EFactory_ePackage = new EReferenceImpl();
this._EFactory_ePackage.eBasicSetValue(Ids.ENamedElement.name, "ePackage");

this._EFactory_ePackage.eBasicSetValue(Ids.ETypedElement.eType, this._EPackage);

this._EFactory_ePackage.eBasicSetValue(Ids.ETypedElement.lowerBound, 1);

this._EFactory_ePackage.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EFactory_ePackage.setFeatureID(Ids.EFactory.ePackage);
    this._EFactory_ePackage.setContainerClass(EFactoryImpl);
this._EFactory_ePackage.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EFactory);

this._EFactory_ePackage.eBasicSetValue(Ids.EReference.containment, false);



this._EFactory.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EFactory_ePackage);

    this._EModelElement_eAnnotations = new EReferenceImpl();
this._EModelElement_eAnnotations.eBasicSetValue(Ids.ENamedElement.name, "eAnnotations");

this._EModelElement_eAnnotations.eBasicSetValue(Ids.ETypedElement.eType, this._EAnnotation);

this._EModelElement_eAnnotations.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EModelElement_eAnnotations.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EModelElement_eAnnotations.setFeatureID(Ids.EModelElement.eAnnotations);
    this._EModelElement_eAnnotations.setContainerClass(EModelElementImpl);
this._EModelElement_eAnnotations.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EModelElement);

this._EModelElement_eAnnotations.eBasicSetValue(Ids.EReference.containment, true);



this._EModelElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EModelElement_eAnnotations);

    this._ENamedElement_name = new EAttributeImpl();
this._ENamedElement_name.eBasicSetValue(Ids.ENamedElement.name, "name");

this._ENamedElement_name.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._ENamedElement_name.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ENamedElement_name.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ENamedElement_name.setFeatureID(Ids.ENamedElement.name);
    this._ENamedElement_name.setContainerClass(ENamedElementImpl);
this._ENamedElement_name.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ENamedElement);



this._ENamedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ENamedElement_name);

    this._EOperation_eContainingClass = new EReferenceImpl();
this._EOperation_eContainingClass.eBasicSetValue(Ids.ENamedElement.name, "eContainingClass");

this._EOperation_eContainingClass.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EOperation_eContainingClass.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EOperation_eContainingClass.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EOperation_eContainingClass.setFeatureID(Ids.EOperation.eContainingClass);
    this._EOperation_eContainingClass.setContainerClass(EOperationImpl);
this._EOperation_eContainingClass.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EOperation);

this._EOperation_eContainingClass.eBasicSetValue(Ids.EReference.containment, false);



this._EOperation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EOperation_eContainingClass);

    this._EOperation_eTypeParameters = new EReferenceImpl();
this._EOperation_eTypeParameters.eBasicSetValue(Ids.ENamedElement.name, "eTypeParameters");

this._EOperation_eTypeParameters.eBasicSetValue(Ids.ETypedElement.eType, this._ETypeParameter);

this._EOperation_eTypeParameters.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EOperation_eTypeParameters.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EOperation_eTypeParameters.setFeatureID(Ids.EOperation.eTypeParameters);
    this._EOperation_eTypeParameters.setContainerClass(EOperationImpl);
this._EOperation_eTypeParameters.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EOperation);

this._EOperation_eTypeParameters.eBasicSetValue(Ids.EReference.containment, true);



this._EOperation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EOperation_eTypeParameters);

    this._EOperation_eParameters = new EReferenceImpl();
this._EOperation_eParameters.eBasicSetValue(Ids.ENamedElement.name, "eParameters");

this._EOperation_eParameters.eBasicSetValue(Ids.ETypedElement.eType, this._EParameter);

this._EOperation_eParameters.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EOperation_eParameters.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EOperation_eParameters.setFeatureID(Ids.EOperation.eParameters);
    this._EOperation_eParameters.setContainerClass(EOperationImpl);
this._EOperation_eParameters.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EOperation);

this._EOperation_eParameters.eBasicSetValue(Ids.EReference.containment, true);



this._EOperation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EOperation_eParameters);

    this._EOperation_eExceptions = new EReferenceImpl();
this._EOperation_eExceptions.eBasicSetValue(Ids.ENamedElement.name, "eExceptions");

this._EOperation_eExceptions.eBasicSetValue(Ids.ETypedElement.eType, this._EClassifier);

this._EOperation_eExceptions.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EOperation_eExceptions.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EOperation_eExceptions.setFeatureID(Ids.EOperation.eExceptions);
    this._EOperation_eExceptions.setContainerClass(EOperationImpl);
this._EOperation_eExceptions.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EOperation);

this._EOperation_eExceptions.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EOperation_eExceptions.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EOperation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EOperation_eExceptions);

    this._EOperation_eGenericExceptions = new EReferenceImpl();
this._EOperation_eGenericExceptions.eBasicSetValue(Ids.ENamedElement.name, "eGenericExceptions");

this._EOperation_eGenericExceptions.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._EOperation_eGenericExceptions.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EOperation_eGenericExceptions.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EOperation_eGenericExceptions.setFeatureID(Ids.EOperation.eGenericExceptions);
    this._EOperation_eGenericExceptions.setContainerClass(EOperationImpl);
this._EOperation_eGenericExceptions.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EOperation);

this._EOperation_eGenericExceptions.eBasicSetValue(Ids.EReference.containment, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EOperation_eGenericExceptions.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EOperation.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EOperation_eGenericExceptions);

    this._EPackage_nsURI = new EAttributeImpl();
this._EPackage_nsURI.eBasicSetValue(Ids.ENamedElement.name, "nsURI");

this._EPackage_nsURI.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EPackage_nsURI.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EPackage_nsURI.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EPackage_nsURI.setFeatureID(Ids.EPackage.nsURI);
    this._EPackage_nsURI.setContainerClass(EPackageImpl);
this._EPackage_nsURI.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EPackage);



this._EPackage.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EPackage_nsURI);

    this._EPackage_nsPrefix = new EAttributeImpl();
this._EPackage_nsPrefix.eBasicSetValue(Ids.ENamedElement.name, "nsPrefix");

this._EPackage_nsPrefix.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EPackage_nsPrefix.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EPackage_nsPrefix.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EPackage_nsPrefix.setFeatureID(Ids.EPackage.nsPrefix);
    this._EPackage_nsPrefix.setContainerClass(EPackageImpl);
this._EPackage_nsPrefix.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EPackage);



this._EPackage.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EPackage_nsPrefix);

    this._EPackage_eFactoryInstance = new EReferenceImpl();
this._EPackage_eFactoryInstance.eBasicSetValue(Ids.ENamedElement.name, "eFactoryInstance");

this._EPackage_eFactoryInstance.eBasicSetValue(Ids.ETypedElement.eType, this._EFactory);

this._EPackage_eFactoryInstance.eBasicSetValue(Ids.ETypedElement.lowerBound, 1);

this._EPackage_eFactoryInstance.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EPackage_eFactoryInstance.setFeatureID(Ids.EPackage.eFactoryInstance);
    this._EPackage_eFactoryInstance.setContainerClass(EPackageImpl);
this._EPackage_eFactoryInstance.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EPackage);

this._EPackage_eFactoryInstance.eBasicSetValue(Ids.EReference.containment, false);



this._EPackage.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EPackage_eFactoryInstance);

    this._EPackage_eClassifiers = new EReferenceImpl();
this._EPackage_eClassifiers.eBasicSetValue(Ids.ENamedElement.name, "eClassifiers");

this._EPackage_eClassifiers.eBasicSetValue(Ids.ETypedElement.eType, this._EClassifier);

this._EPackage_eClassifiers.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EPackage_eClassifiers.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EPackage_eClassifiers.setFeatureID(Ids.EPackage.eClassifiers);
    this._EPackage_eClassifiers.setContainerClass(EPackageImpl);
this._EPackage_eClassifiers.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EPackage);

this._EPackage_eClassifiers.eBasicSetValue(Ids.EReference.containment, true);



this._EPackage.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EPackage_eClassifiers);

    this._EPackage_eSubpackages = new EReferenceImpl();
this._EPackage_eSubpackages.eBasicSetValue(Ids.ENamedElement.name, "eSubpackages");

this._EPackage_eSubpackages.eBasicSetValue(Ids.ETypedElement.eType, this._EPackage);

this._EPackage_eSubpackages.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EPackage_eSubpackages.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EPackage_eSubpackages.setFeatureID(Ids.EPackage.eSubpackages);
    this._EPackage_eSubpackages.setContainerClass(EPackageImpl);
this._EPackage_eSubpackages.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EPackage);

this._EPackage_eSubpackages.eBasicSetValue(Ids.EReference.containment, true);



this._EPackage.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EPackage_eSubpackages);

    this._EPackage_eSuperPackage = new EReferenceImpl();
this._EPackage_eSuperPackage.eBasicSetValue(Ids.ENamedElement.name, "eSuperPackage");

this._EPackage_eSuperPackage.eBasicSetValue(Ids.ETypedElement.eType, this._EPackage);

this._EPackage_eSuperPackage.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EPackage_eSuperPackage.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EPackage_eSuperPackage.setFeatureID(Ids.EPackage.eSuperPackage);
    this._EPackage_eSuperPackage.setContainerClass(EPackageImpl);
this._EPackage_eSuperPackage.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EPackage);

this._EPackage_eSuperPackage.eBasicSetValue(Ids.EReference.containment, false);



this._EPackage.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EPackage_eSuperPackage);

    this._EParameter_eOperation = new EReferenceImpl();
this._EParameter_eOperation.eBasicSetValue(Ids.ENamedElement.name, "eOperation");

this._EParameter_eOperation.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EParameter_eOperation.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EParameter_eOperation.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EParameter_eOperation.setFeatureID(Ids.EParameter.eOperation);
    this._EParameter_eOperation.setContainerClass(EParameterImpl);
this._EParameter_eOperation.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EParameter);

this._EParameter_eOperation.eBasicSetValue(Ids.EReference.containment, false);



this._EParameter.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EParameter_eOperation);

    this._EReference_containment = new EAttributeImpl();
this._EReference_containment.eBasicSetValue(Ids.ENamedElement.name, "containment");

this._EReference_containment.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EReference_containment.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EReference_containment.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EReference_containment.setFeatureID(Ids.EReference.containment);
    this._EReference_containment.setContainerClass(EReferenceImpl);
this._EReference_containment.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EReference);



this._EReference.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EReference_containment);

    this._EReference_container = new EAttributeImpl();
this._EReference_container.eBasicSetValue(Ids.ENamedElement.name, "container");

this._EReference_container.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EReference_container.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EReference_container.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EReference_container.setFeatureID(Ids.EReference.container);
    this._EReference_container.setContainerClass(EReferenceImpl);
this._EReference_container.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EReference);



this._EReference.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EReference_container);

    this._EReference_resolveProxies = new EAttributeImpl();
this._EReference_resolveProxies.eBasicSetValue(Ids.ENamedElement.name, "resolveProxies");

this._EReference_resolveProxies.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EReference_resolveProxies.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EReference_resolveProxies.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EReference_resolveProxies.setFeatureID(Ids.EReference.resolveProxies);
    this._EReference_resolveProxies.setContainerClass(EReferenceImpl);
this._EReference_resolveProxies.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EReference);



this._EReference.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EReference_resolveProxies);

    this._EReference_eOpposite = new EReferenceImpl();
this._EReference_eOpposite.eBasicSetValue(Ids.ENamedElement.name, "eOpposite");

this._EReference_eOpposite.eBasicSetValue(Ids.ETypedElement.eType, this._EReference);

this._EReference_eOpposite.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EReference_eOpposite.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EReference_eOpposite.setFeatureID(Ids.EReference.eOpposite);
    this._EReference_eOpposite.setContainerClass(EReferenceImpl);
this._EReference_eOpposite.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EReference);

this._EReference_eOpposite.eBasicSetValue(Ids.EReference.containment, false);



this._EReference.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EReference_eOpposite);

    this._EReference_eReferenceType = new EReferenceImpl();
this._EReference_eReferenceType.eBasicSetValue(Ids.ENamedElement.name, "eReferenceType");

this._EReference_eReferenceType.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EReference_eReferenceType.eBasicSetValue(Ids.ETypedElement.lowerBound, 1);

this._EReference_eReferenceType.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EReference_eReferenceType.setFeatureID(Ids.EReference.eReferenceType);
    this._EReference_eReferenceType.setContainerClass(EReferenceImpl);
this._EReference_eReferenceType.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EReference);

this._EReference_eReferenceType.eBasicSetValue(Ids.EReference.containment, false);



this._EReference.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EReference_eReferenceType);

    this._EReference_eKeys = new EReferenceImpl();
this._EReference_eKeys.eBasicSetValue(Ids.ENamedElement.name, "eKeys");

this._EReference_eKeys.eBasicSetValue(Ids.ETypedElement.eType, this._EAttribute);

this._EReference_eKeys.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EReference_eKeys.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EReference_eKeys.setFeatureID(Ids.EReference.eKeys);
    this._EReference_eKeys.setContainerClass(EReferenceImpl);
this._EReference_eKeys.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EReference);

this._EReference_eKeys.eBasicSetValue(Ids.EReference.containment, false);



this._EReference.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EReference_eKeys);

    this._EStructuralFeature_changeable = new EAttributeImpl();
this._EStructuralFeature_changeable.eBasicSetValue(Ids.ENamedElement.name, "changeable");

this._EStructuralFeature_changeable.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EStructuralFeature_changeable.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_changeable.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_changeable.setFeatureID(Ids.EStructuralFeature.changeable);
    this._EStructuralFeature_changeable.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_changeable.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_changeable);

    this._EStructuralFeature_volatile = new EAttributeImpl();
this._EStructuralFeature_volatile.eBasicSetValue(Ids.ENamedElement.name, "volatile");

this._EStructuralFeature_volatile.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EStructuralFeature_volatile.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_volatile.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_volatile.setFeatureID(Ids.EStructuralFeature.volatile);
    this._EStructuralFeature_volatile.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_volatile.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_volatile);

    this._EStructuralFeature_transient = new EAttributeImpl();
this._EStructuralFeature_transient.eBasicSetValue(Ids.ENamedElement.name, "transient");

this._EStructuralFeature_transient.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EStructuralFeature_transient.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_transient.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_transient.setFeatureID(Ids.EStructuralFeature.transient);
    this._EStructuralFeature_transient.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_transient.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_transient);

    this._EStructuralFeature_defaultValueLiteral = new EAttributeImpl();
this._EStructuralFeature_defaultValueLiteral.eBasicSetValue(Ids.ENamedElement.name, "defaultValueLiteral");

this._EStructuralFeature_defaultValueLiteral.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EStructuralFeature_defaultValueLiteral.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_defaultValueLiteral.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_defaultValueLiteral.setFeatureID(Ids.EStructuralFeature.defaultValueLiteral);
    this._EStructuralFeature_defaultValueLiteral.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_defaultValueLiteral.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_defaultValueLiteral);

    this._EStructuralFeature_defaultValue = new EAttributeImpl();
this._EStructuralFeature_defaultValue.eBasicSetValue(Ids.ENamedElement.name, "defaultValue");

this._EStructuralFeature_defaultValue.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaObject);

this._EStructuralFeature_defaultValue.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_defaultValue.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_defaultValue.setFeatureID(Ids.EStructuralFeature.defaultValue);
    this._EStructuralFeature_defaultValue.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_defaultValue.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_defaultValue);

    this._EStructuralFeature_unsettable = new EAttributeImpl();
this._EStructuralFeature_unsettable.eBasicSetValue(Ids.ENamedElement.name, "unsettable");

this._EStructuralFeature_unsettable.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EStructuralFeature_unsettable.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_unsettable.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_unsettable.setFeatureID(Ids.EStructuralFeature.unsettable);
    this._EStructuralFeature_unsettable.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_unsettable.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_unsettable);

    this._EStructuralFeature_derived = new EAttributeImpl();
this._EStructuralFeature_derived.eBasicSetValue(Ids.ENamedElement.name, "derived");

this._EStructuralFeature_derived.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EStructuralFeature_derived.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_derived.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_derived.setFeatureID(Ids.EStructuralFeature.derived);
    this._EStructuralFeature_derived.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_derived.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_derived);

    this._EStructuralFeature_eContainingClass = new EReferenceImpl();
this._EStructuralFeature_eContainingClass.eBasicSetValue(Ids.ENamedElement.name, "eContainingClass");

this._EStructuralFeature_eContainingClass.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EStructuralFeature_eContainingClass.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStructuralFeature_eContainingClass.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStructuralFeature_eContainingClass.setFeatureID(Ids.EStructuralFeature.eContainingClass);
    this._EStructuralFeature_eContainingClass.setContainerClass(EStructuralFeatureImpl);
this._EStructuralFeature_eContainingClass.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStructuralFeature);

this._EStructuralFeature_eContainingClass.eBasicSetValue(Ids.EReference.containment, false);



this._EStructuralFeature.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStructuralFeature_eContainingClass);

    this._ETypedElement_ordered = new EAttributeImpl();
this._ETypedElement_ordered.eBasicSetValue(Ids.ENamedElement.name, "ordered");

this._ETypedElement_ordered.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._ETypedElement_ordered.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_ordered.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_ordered.setFeatureID(Ids.ETypedElement.ordered);
    this._ETypedElement_ordered.setContainerClass(ETypedElementImpl);
this._ETypedElement_ordered.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);



this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_ordered);

    this._ETypedElement_unique = new EAttributeImpl();
this._ETypedElement_unique.eBasicSetValue(Ids.ENamedElement.name, "unique");

this._ETypedElement_unique.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._ETypedElement_unique.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_unique.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_unique.setFeatureID(Ids.ETypedElement.unique);
    this._ETypedElement_unique.setContainerClass(ETypedElementImpl);
this._ETypedElement_unique.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);



this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_unique);

    this._ETypedElement_lowerBound = new EAttributeImpl();
this._ETypedElement_lowerBound.eBasicSetValue(Ids.ENamedElement.name, "lowerBound");

this._ETypedElement_lowerBound.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._ETypedElement_lowerBound.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_lowerBound.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_lowerBound.setFeatureID(Ids.ETypedElement.lowerBound);
    this._ETypedElement_lowerBound.setContainerClass(ETypedElementImpl);
this._ETypedElement_lowerBound.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);



this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_lowerBound);

    this._ETypedElement_upperBound = new EAttributeImpl();
this._ETypedElement_upperBound.eBasicSetValue(Ids.ENamedElement.name, "upperBound");

this._ETypedElement_upperBound.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._ETypedElement_upperBound.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_upperBound.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_upperBound.setFeatureID(Ids.ETypedElement.upperBound);
    this._ETypedElement_upperBound.setContainerClass(ETypedElementImpl);
this._ETypedElement_upperBound.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);



this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_upperBound);

    this._ETypedElement_many = new EAttributeImpl();
this._ETypedElement_many.eBasicSetValue(Ids.ENamedElement.name, "many");

this._ETypedElement_many.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._ETypedElement_many.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_many.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_many.setFeatureID(Ids.ETypedElement.many);
    this._ETypedElement_many.setContainerClass(ETypedElementImpl);
this._ETypedElement_many.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);



this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_many);

    this._ETypedElement_required = new EAttributeImpl();
this._ETypedElement_required.eBasicSetValue(Ids.ENamedElement.name, "required");

this._ETypedElement_required.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._ETypedElement_required.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_required.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_required.setFeatureID(Ids.ETypedElement.required);
    this._ETypedElement_required.setContainerClass(ETypedElementImpl);
this._ETypedElement_required.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);



this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_required);

    this._ETypedElement_eType = new EReferenceImpl();
this._ETypedElement_eType.eBasicSetValue(Ids.ENamedElement.name, "eType");

this._ETypedElement_eType.eBasicSetValue(Ids.ETypedElement.eType, this._EClassifier);

this._ETypedElement_eType.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_eType.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_eType.setFeatureID(Ids.ETypedElement.eType);
    this._ETypedElement_eType.setContainerClass(ETypedElementImpl);
this._ETypedElement_eType.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);

this._ETypedElement_eType.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ETypedElement_eType.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "set");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "this._eType = value; this._eGenericType = undefined; this.eDidAdd(undefined, value);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ETypedElement_eType.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_eType);

    this._ETypedElement_eGenericType = new EReferenceImpl();
this._ETypedElement_eGenericType.eBasicSetValue(Ids.ENamedElement.name, "eGenericType");

this._ETypedElement_eGenericType.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._ETypedElement_eGenericType.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypedElement_eGenericType.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._ETypedElement_eGenericType.setFeatureID(Ids.ETypedElement.eGenericType);
    this._ETypedElement_eGenericType.setContainerClass(ETypedElementImpl);
this._ETypedElement_eGenericType.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypedElement);

this._ETypedElement_eGenericType.eBasicSetValue(Ids.EReference.containment, true);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "http://www.eclipse.org/emf/2002/GenModel");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedIsSetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "suppressedUnsetVisibility");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "true");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ETypedElement_eGenericType.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "set");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const feature = getEcorePackageRef().getETypedElement_EGenericType();\nconst oldValue = this.eGet(feature);\nthis.eBasicSetValue(feature, value);\nthis.eDidRemove(feature, oldValue);\nthis.eDidAdd(feature, value);\nthis._eType = value?.getERawType();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._ETypedElement_eGenericType.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._ETypedElement.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypedElement_eGenericType);

    this._EStringToStringMapEntry_key = new EAttributeImpl();
this._EStringToStringMapEntry_key.eBasicSetValue(Ids.ENamedElement.name, "key");

this._EStringToStringMapEntry_key.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EStringToStringMapEntry_key.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStringToStringMapEntry_key.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStringToStringMapEntry_key.setFeatureID(Ids.EStringToStringMapEntry.key);
    this._EStringToStringMapEntry_key.setContainerClass(EStringToStringMapEntryImpl);
this._EStringToStringMapEntry_key.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStringToStringMapEntry);



this._EStringToStringMapEntry.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStringToStringMapEntry_key);

    this._EStringToStringMapEntry_value = new EAttributeImpl();
this._EStringToStringMapEntry_value.eBasicSetValue(Ids.ENamedElement.name, "value");

this._EStringToStringMapEntry_value.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EStringToStringMapEntry_value.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EStringToStringMapEntry_value.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EStringToStringMapEntry_value.setFeatureID(Ids.EStringToStringMapEntry.value);
    this._EStringToStringMapEntry_value.setContainerClass(EStringToStringMapEntryImpl);
this._EStringToStringMapEntry_value.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EStringToStringMapEntry);



this._EStringToStringMapEntry.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EStringToStringMapEntry_value);

    this._EGenericType_eUpperBound = new EReferenceImpl();
this._EGenericType_eUpperBound.eBasicSetValue(Ids.ENamedElement.name, "eUpperBound");

this._EGenericType_eUpperBound.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._EGenericType_eUpperBound.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EGenericType_eUpperBound.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EGenericType_eUpperBound.setFeatureID(Ids.EGenericType.eUpperBound);
    this._EGenericType_eUpperBound.setContainerClass(EGenericTypeImpl);
this._EGenericType_eUpperBound.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EGenericType);

this._EGenericType_eUpperBound.eBasicSetValue(Ids.EReference.containment, true);



this._EGenericType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EGenericType_eUpperBound);

    this._EGenericType_eTypeArguments = new EReferenceImpl();
this._EGenericType_eTypeArguments.eBasicSetValue(Ids.ENamedElement.name, "eTypeArguments");

this._EGenericType_eTypeArguments.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._EGenericType_eTypeArguments.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EGenericType_eTypeArguments.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._EGenericType_eTypeArguments.setFeatureID(Ids.EGenericType.eTypeArguments);
    this._EGenericType_eTypeArguments.setContainerClass(EGenericTypeImpl);
this._EGenericType_eTypeArguments.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EGenericType);

this._EGenericType_eTypeArguments.eBasicSetValue(Ids.EReference.containment, true);



this._EGenericType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EGenericType_eTypeArguments);

    this._EGenericType_eRawType = new EReferenceImpl();
this._EGenericType_eRawType.eBasicSetValue(Ids.ENamedElement.name, "eRawType");

this._EGenericType_eRawType.eBasicSetValue(Ids.ETypedElement.eType, this._EClassifier);

this._EGenericType_eRawType.eBasicSetValue(Ids.ETypedElement.lowerBound, 1);

this._EGenericType_eRawType.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EGenericType_eRawType.setFeatureID(Ids.EGenericType.eRawType);
    this._EGenericType_eRawType.setContainerClass(EGenericTypeImpl);
this._EGenericType_eRawType.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EGenericType);

this._EGenericType_eRawType.eBasicSetValue(Ids.EReference.containment, false);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/feature");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "get");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "if (this.getEClassifier() !== undefined) return this.getEClassifier();\nconst typeParameter = this.getETypeParameter();\nif (typeParameter !== undefined && !typeParameter.getEBounds().isEmpty()) {\n  const bound = typeParameter.getEBounds().get(0);\n  return bound.getERawType();\n}\nconst upperBound = this.getEUpperBound();\nif (upperBound !== undefined) return upperBound.getERawType();\nreturn getEcorePackageRef().getEJavaObject();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EGenericType_eRawType.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EGenericType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EGenericType_eRawType);

    this._EGenericType_eLowerBound = new EReferenceImpl();
this._EGenericType_eLowerBound.eBasicSetValue(Ids.ENamedElement.name, "eLowerBound");

this._EGenericType_eLowerBound.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._EGenericType_eLowerBound.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EGenericType_eLowerBound.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EGenericType_eLowerBound.setFeatureID(Ids.EGenericType.eLowerBound);
    this._EGenericType_eLowerBound.setContainerClass(EGenericTypeImpl);
this._EGenericType_eLowerBound.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EGenericType);

this._EGenericType_eLowerBound.eBasicSetValue(Ids.EReference.containment, true);



this._EGenericType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EGenericType_eLowerBound);

    this._EGenericType_eTypeParameter = new EReferenceImpl();
this._EGenericType_eTypeParameter.eBasicSetValue(Ids.ENamedElement.name, "eTypeParameter");

this._EGenericType_eTypeParameter.eBasicSetValue(Ids.ETypedElement.eType, this._ETypeParameter);

this._EGenericType_eTypeParameter.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EGenericType_eTypeParameter.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EGenericType_eTypeParameter.setFeatureID(Ids.EGenericType.eTypeParameter);
    this._EGenericType_eTypeParameter.setContainerClass(EGenericTypeImpl);
this._EGenericType_eTypeParameter.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EGenericType);

this._EGenericType_eTypeParameter.eBasicSetValue(Ids.EReference.containment, false);



this._EGenericType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EGenericType_eTypeParameter);

    this._EGenericType_eClassifier = new EReferenceImpl();
this._EGenericType_eClassifier.eBasicSetValue(Ids.ENamedElement.name, "eClassifier");

this._EGenericType_eClassifier.eBasicSetValue(Ids.ETypedElement.eType, this._EClassifier);

this._EGenericType_eClassifier.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EGenericType_eClassifier.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

    this._EGenericType_eClassifier.setFeatureID(Ids.EGenericType.eClassifier);
    this._EGenericType_eClassifier.setContainerClass(EGenericTypeImpl);
this._EGenericType_eClassifier.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._EGenericType);

this._EGenericType_eClassifier.eBasicSetValue(Ids.EReference.containment, false);



this._EGenericType.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._EGenericType_eClassifier);

    this._ETypeParameter_eBounds = new EReferenceImpl();
this._ETypeParameter_eBounds.eBasicSetValue(Ids.ENamedElement.name, "eBounds");

this._ETypeParameter_eBounds.eBasicSetValue(Ids.ETypedElement.eType, this._EGenericType);

this._ETypeParameter_eBounds.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._ETypeParameter_eBounds.eBasicSetValue(Ids.ETypedElement.upperBound, -1);

    this._ETypeParameter_eBounds.setFeatureID(Ids.ETypeParameter.eBounds);
    this._ETypeParameter_eBounds.setContainerClass(ETypeParameterImpl);
this._ETypeParameter_eBounds.eBasicSetValue(Ids.EStructuralFeature.eContainingClass, this._ETypeParameter);

this._ETypeParameter_eBounds.eBasicSetValue(Ids.EReference.containment, true);



this._ETypeParameter.eBootstrapList(Ids.EClass.eStructuralFeatures).add(this._ETypeParameter_eBounds);


    // Pass 2.5: operations and their parameters - real EOperation/EParameter objects, not just the
    // generated METHODS (which already existed) - eOperations used to be permanently empty at runtime;
    // this is what actually populates it, the same way pass 2 populates eStructuralFeatures. Kept as
    // its own pass, after every classifier and feature exists (an operation's return type or a
    // parameter's type can reference either), rather than folded into the loop above.
    this._EClass_op0 = new EOperationImpl();
this._EClass_op0.eBasicSetValue(Ids.ENamedElement.name, "isSuperTypeOf");

this._EClass_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EClass_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op0.setOperationID(Ids.EClass.op0);
    this._EClass_op0_p0 = new EParameterImpl();
this._EClass_op0_p0.eBasicSetValue(Ids.ENamedElement.name, "someClass");

this._EClass_op0_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EClass_op0_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op0_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op0_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op0);

this._EClass_op0.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op0_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "const visited = new Set<EClass>();\nconst pending: EClass[] = [someClass];\nwhile (pending.length > 0) {\n  const current = pending.pop()!;\n  if (current === this) return true;\n  if (visited.has(current)) continue;\n  visited.add(current);\n  pending.push(...current.getESuperTypes());\n  for (const generic of current.getEGenericSuperTypes()) {\n    const raw = generic.getEClassifier();\n    if (raw !== undefined && isEClass(raw)) pending.push(raw);\n  }\n}\nreturn false;");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "isEClass");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./util/EcoreTypeGuards.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op0);

    this._EClass_op1 = new EOperationImpl();
this._EClass_op1.eBasicSetValue(Ids.ENamedElement.name, "getFeatureCount");

this._EClass_op1.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClass_op1.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op1.setOperationID(Ids.EClass.op1);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAllStructuralFeatures().size();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op1.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op1);

    this._EClass_op2 = new EOperationImpl();
this._EClass_op2.eBasicSetValue(Ids.ENamedElement.name, "getEStructuralFeature");

this._EClass_op2.eBasicSetValue(Ids.ETypedElement.eType, this._EStructuralFeature);

this._EClass_op2.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op2.setOperationID(Ids.EClass.op2);
    this._EClass_op2_p0 = new EParameterImpl();
this._EClass_op2_p0.eBasicSetValue(Ids.ENamedElement.name, "featureID");

this._EClass_op2_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClass_op2_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op2_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op2_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op2);

this._EClass_op2.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op2_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAllStructuralFeatures().filter(feature => this.getFeatureID(feature) === featureIDOrFeatureName).at(0);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op2.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op2);

    this._EClass_op3 = new EOperationImpl();
this._EClass_op3.eBasicSetValue(Ids.ENamedElement.name, "getFeatureID");

this._EClass_op3.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClass_op3.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op3.setOperationID(Ids.EClass.op3);
    this._EClass_op3_p0 = new EParameterImpl();
this._EClass_op3_p0.eBasicSetValue(Ids.ENamedElement.name, "feature");

this._EClass_op3_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EStructuralFeature);

this._EClass_op3_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op3_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op3_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op3);

this._EClass_op3.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op3_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return (feature as EStructuralFeatureImpl).getFeatureID();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op3.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EStructuralFeatureImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/EStructuralFeatureImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op3.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op3);

    this._EClass_op4 = new EOperationImpl();
this._EClass_op4.eBasicSetValue(Ids.ENamedElement.name, "getEStructuralFeature");

this._EClass_op4.eBasicSetValue(Ids.ETypedElement.eType, this._EStructuralFeature);

this._EClass_op4.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op4.setOperationID(Ids.EClass.op4);
    this._EClass_op4_p0 = new EParameterImpl();
this._EClass_op4_p0.eBasicSetValue(Ids.ENamedElement.name, "featureName");

this._EClass_op4_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EClass_op4_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op4_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op4_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op4);

this._EClass_op4.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op4_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAllStructuralFeatures().filter(feature => feature.getName() === featureIDOrFeatureName).at(0);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op4.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op4);

    this._EClass_op5 = new EOperationImpl();
this._EClass_op5.eBasicSetValue(Ids.ENamedElement.name, "getOperationCount");

this._EClass_op5.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClass_op5.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op5.setOperationID(Ids.EClass.op5);

    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAllOperations().size();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op5.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op5);

    this._EClass_op6 = new EOperationImpl();
this._EClass_op6.eBasicSetValue(Ids.ENamedElement.name, "getEOperation");

this._EClass_op6.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EClass_op6.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op6.setOperationID(Ids.EClass.op6);
    this._EClass_op6_p0 = new EParameterImpl();
this._EClass_op6_p0.eBasicSetValue(Ids.ENamedElement.name, "operationID");

this._EClass_op6_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClass_op6_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op6_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op6_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op6);

this._EClass_op6.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op6_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAllOperations().filter(op => this.getOperationID(op) === operationID).at(0);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op6.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op6);

    this._EClass_op7 = new EOperationImpl();
this._EClass_op7.eBasicSetValue(Ids.ENamedElement.name, "getOperationID");

this._EClass_op7.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClass_op7.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op7.setOperationID(Ids.EClass.op7);
    this._EClass_op7_p0 = new EParameterImpl();
this._EClass_op7_p0.eBasicSetValue(Ids.ENamedElement.name, "operation");

this._EClass_op7_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EClass_op7_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op7_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op7_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op7);

this._EClass_op7.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op7_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return (operation as EOperationImpl).getOperationID();");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op7.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EOperationImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/EOperationImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op7.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op7);

    this._EClass_op8 = new EOperationImpl();
this._EClass_op8.eBasicSetValue(Ids.ENamedElement.name, "getOverride");

this._EClass_op8.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EClass_op8.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClass);

    this._EClass_op8.setOperationID(Ids.EClass.op8);
    this._EClass_op8_p0 = new EParameterImpl();
this._EClass_op8_p0.eBasicSetValue(Ids.ENamedElement.name, "operation");

this._EClass_op8_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EClass_op8_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClass_op8_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClass_op8_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClass_op8);

this._EClass_op8.eBootstrapList(Ids.EOperation.eParameters).add(this._EClass_op8_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "if (operation.getEContainingClass() === this) return undefined;\nfor (const candidate of this.getEAllOperations()) {\n  if (candidate.isOverrideOf(operation)) return candidate;\n}\nreturn undefined;");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClass_op8.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClass.eBootstrapList(Ids.EClass.eOperations).add(this._EClass_op8);

    this._EClassifier_op0 = new EOperationImpl();
this._EClassifier_op0.eBasicSetValue(Ids.ENamedElement.name, "isInstance");

this._EClassifier_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EClassifier_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClassifier);

    this._EClassifier_op0.setOperationID(Ids.EClassifier.op0);
    this._EClassifier_op0_p0 = new EParameterImpl();
this._EClassifier_op0_p0.eBasicSetValue(Ids.ENamedElement.name, "object");

this._EClassifier_op0_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaObject);

this._EClassifier_op0_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EClassifier_op0_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EClassifier_op0_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EClassifier_op0);

this._EClassifier_op0.eBootstrapList(Ids.EOperation.eParameters).add(this._EClassifier_op0_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return object instanceof EObjectImpl;");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "use-type-name");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EObjectImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClassifier_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "EObjectImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/EObjectImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EClassifier_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EClassifier.eBootstrapList(Ids.EClass.eOperations).add(this._EClassifier_op0);

    this._EClassifier_op1 = new EOperationImpl();
this._EClassifier_op1.eBasicSetValue(Ids.ENamedElement.name, "getClassifierID");

this._EClassifier_op1.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EClassifier_op1.eBasicSetValue(Ids.EOperation.eContainingClass, this._EClassifier);

    this._EClassifier_op1.setOperationID(Ids.EClassifier.op1);


this._EClassifier.eBootstrapList(Ids.EClass.eOperations).add(this._EClassifier_op1);

    this._EEnum_op0 = new EOperationImpl();
this._EEnum_op0.eBasicSetValue(Ids.ENamedElement.name, "getEEnumLiteral");

this._EEnum_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EEnumLiteral);

this._EEnum_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EEnum);

    this._EEnum_op0.setOperationID(Ids.EEnum.op0);
    this._EEnum_op0_p0 = new EParameterImpl();
this._EEnum_op0_p0.eBasicSetValue(Ids.ENamedElement.name, "name");

this._EEnum_op0_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EEnum_op0_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnum_op0_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EEnum_op0_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EEnum_op0);

this._EEnum_op0.eBootstrapList(Ids.EOperation.eParameters).add(this._EEnum_op0_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getELiterals().find(literal => literal.getName() === name);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnum_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EEnum.eBootstrapList(Ids.EClass.eOperations).add(this._EEnum_op0);

    this._EEnum_op1 = new EOperationImpl();
this._EEnum_op1.eBasicSetValue(Ids.ENamedElement.name, "getEEnumLiteral");

this._EEnum_op1.eBasicSetValue(Ids.ETypedElement.eType, this._EEnumLiteral);

this._EEnum_op1.eBasicSetValue(Ids.EOperation.eContainingClass, this._EEnum);

    this._EEnum_op1.setOperationID(Ids.EEnum.op1);
    this._EEnum_op1_p0 = new EParameterImpl();
this._EEnum_op1_p0.eBasicSetValue(Ids.ENamedElement.name, "value");

this._EEnum_op1_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EEnum_op1_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnum_op1_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EEnum_op1_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EEnum_op1);

this._EEnum_op1.eBootstrapList(Ids.EOperation.eParameters).add(this._EEnum_op1_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getELiterals().find(literal => literal.getValue() === value);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnum_op1.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EEnum.eBootstrapList(Ids.EClass.eOperations).add(this._EEnum_op1);

    this._EEnum_op2 = new EOperationImpl();
this._EEnum_op2.eBasicSetValue(Ids.ENamedElement.name, "getEEnumLiteralByLiteral");

this._EEnum_op2.eBasicSetValue(Ids.ETypedElement.eType, this._EEnumLiteral);

this._EEnum_op2.eBasicSetValue(Ids.EOperation.eContainingClass, this._EEnum);

    this._EEnum_op2.setOperationID(Ids.EEnum.op2);
    this._EEnum_op2_p0 = new EParameterImpl();
this._EEnum_op2_p0.eBasicSetValue(Ids.ENamedElement.name, "literal");

this._EEnum_op2_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EEnum_op2_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EEnum_op2_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EEnum_op2_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EEnum_op2);

this._EEnum_op2.eBootstrapList(Ids.EOperation.eParameters).add(this._EEnum_op2_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getELiterals().find(candidate => candidate.getLiteral() === literal);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EEnum_op2.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EEnum.eBootstrapList(Ids.EClass.eOperations).add(this._EEnum_op2);

    this._EFactory_op0 = new EOperationImpl();
this._EFactory_op0.eBasicSetValue(Ids.ENamedElement.name, "create");

this._EFactory_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EFactory);

    this._EFactory_op0.setOperationID(Ids.EFactory.op0);
    this._EFactory_op0_p0 = new EParameterImpl();
this._EFactory_op0_p0.eBasicSetValue(Ids.ENamedElement.name, "eClass");

this._EFactory_op0_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EClass);

this._EFactory_op0_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EFactory_op0_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EFactory_op0_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EFactory_op0);

this._EFactory_op0.eBootstrapList(Ids.EOperation.eParameters).add(this._EFactory_op0_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "if (eClass.isAbstract() || eClass.isInterface()) {\n  throw new Error(`Cannot create an instance of '${eClass.getName()}': it is abstract or an interface.`);\n}\nconsole.warn(\n  `No factory recognizes classifier id ${eClass.getClassifierID()} (${eClass.getName()}) - falling back to a DynamicEObjectImpl. ` +\n    'Add a concrete factory for it to avoid this.'\n);\nreturn new DynamicEObjectImpl(eClass);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFactory_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }
    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator/import");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "type");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "DynamicEObjectImpl");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "@typemf/core");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "internal-from");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "./impl/DynamicEObjectImpl.js");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFactory_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EFactory.eBootstrapList(Ids.EClass.eOperations).add(this._EFactory_op0);

    this._EFactory_op1 = new EOperationImpl();
this._EFactory_op1.eBasicSetValue(Ids.ENamedElement.name, "createFromString");

this._EFactory_op1.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaObject);

this._EFactory_op1.eBasicSetValue(Ids.EOperation.eContainingClass, this._EFactory);

    this._EFactory_op1.setOperationID(Ids.EFactory.op1);
    this._EFactory_op1_p0 = new EParameterImpl();
this._EFactory_op1_p0.eBasicSetValue(Ids.ENamedElement.name, "eDataType");

this._EFactory_op1_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EDataType);

this._EFactory_op1_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EFactory_op1_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EFactory_op1_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EFactory_op1);

this._EFactory_op1.eBootstrapList(Ids.EOperation.eParameters).add(this._EFactory_op1_p0);

    this._EFactory_op1_p1 = new EParameterImpl();
this._EFactory_op1_p1.eBasicSetValue(Ids.ENamedElement.name, "literalValue");

this._EFactory_op1_p1.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EFactory_op1_p1.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EFactory_op1_p1.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EFactory_op1_p1.eBasicSetValue(Ids.EParameter.eOperation, this._EFactory_op1);

this._EFactory_op1.eBootstrapList(Ids.EOperation.eParameters).add(this._EFactory_op1_p1);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "if (this.getEPackage() !== undefined && eDataType.getEPackage() !== this.getEPackage()) {\n  throw new Error(`The datatype '${eDataType.getName()}' is not a valid classifier of this factory's package.`);\n}\nswitch (eDataType.getName()) {\n  case 'EString':\n    return literalValue;\n  case 'EInt':\n  case 'EIntegerObject':\n  case 'ELong':\n  case 'ELongObject':\n  case 'EDouble':\n  case 'EDoubleObject':\n  case 'EFloat':\n  case 'EFloatObject':\n  case 'EShort':\n  case 'EShortObject':\n  case 'EByte':\n  case 'EByteObject':\n    return Number(literalValue);\n  case 'EBigInteger':\n    return BigInt(literalValue);\n  case 'EBoolean':\n  case 'EBooleanObject':\n    return literalValue === 'true';\n  case 'EChar':\n  case 'ECharacterObject':\n    return literalValue.charAt(0);\n  case 'EDate':\n    return new Date(literalValue);\n  default:\n    return literalValue;\n}");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFactory_op1.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EFactory.eBootstrapList(Ids.EClass.eOperations).add(this._EFactory_op1);

    this._EFactory_op2 = new EOperationImpl();
this._EFactory_op2.eBasicSetValue(Ids.ENamedElement.name, "convertToString");

this._EFactory_op2.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EFactory_op2.eBasicSetValue(Ids.EOperation.eContainingClass, this._EFactory);

    this._EFactory_op2.setOperationID(Ids.EFactory.op2);
    this._EFactory_op2_p0 = new EParameterImpl();
this._EFactory_op2_p0.eBasicSetValue(Ids.ENamedElement.name, "eDataType");

this._EFactory_op2_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EDataType);

this._EFactory_op2_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EFactory_op2_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EFactory_op2_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EFactory_op2);

this._EFactory_op2.eBootstrapList(Ids.EOperation.eParameters).add(this._EFactory_op2_p0);

    this._EFactory_op2_p1 = new EParameterImpl();
this._EFactory_op2_p1.eBasicSetValue(Ids.ENamedElement.name, "instanceValue");

this._EFactory_op2_p1.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaObject);

this._EFactory_op2_p1.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EFactory_op2_p1.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EFactory_op2_p1.eBasicSetValue(Ids.EParameter.eOperation, this._EFactory_op2);

this._EFactory_op2.eBootstrapList(Ids.EOperation.eParameters).add(this._EFactory_op2_p1);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "if (this.getEPackage() !== undefined && eDataType.getEPackage() !== this.getEPackage()) {\n  throw new Error(`The datatype '${eDataType.getName()}' is not a valid classifier of this factory's package.`);\n}\nif (eDataType.getName() === 'EDate' && instanceValue instanceof Date) {\n  return instanceValue.toISOString();\n}\nreturn String(instanceValue);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EFactory_op2.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EFactory.eBootstrapList(Ids.EClass.eOperations).add(this._EFactory_op2);

    this._EModelElement_op0 = new EOperationImpl();
this._EModelElement_op0.eBasicSetValue(Ids.ENamedElement.name, "getEAnnotation");

this._EModelElement_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EAnnotation);

this._EModelElement_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EModelElement);

    this._EModelElement_op0.setOperationID(Ids.EModelElement.op0);
    this._EModelElement_op0_p0 = new EParameterImpl();
this._EModelElement_op0_p0.eBasicSetValue(Ids.ENamedElement.name, "source");

this._EModelElement_op0_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EModelElement_op0_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EModelElement_op0_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EModelElement_op0_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EModelElement_op0);

this._EModelElement_op0.eBootstrapList(Ids.EOperation.eParameters).add(this._EModelElement_op0_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEAnnotations().filter(ann => ann.getSource() === source).at(0);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EModelElement_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EModelElement.eBootstrapList(Ids.EClass.eOperations).add(this._EModelElement_op0);

    this._EOperation_op0 = new EOperationImpl();
this._EOperation_op0.eBasicSetValue(Ids.ENamedElement.name, "getOperationID");

this._EOperation_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EOperation_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EOperation);

    this._EOperation_op0.setOperationID(Ids.EOperation.op0);


this._EOperation.eBootstrapList(Ids.EClass.eOperations).add(this._EOperation_op0);

    this._EOperation_op1 = new EOperationImpl();
this._EOperation_op1.eBasicSetValue(Ids.ENamedElement.name, "isOverrideOf");

this._EOperation_op1.eBasicSetValue(Ids.ETypedElement.eType, this._EBoolean);

this._EOperation_op1.eBasicSetValue(Ids.EOperation.eContainingClass, this._EOperation);

    this._EOperation_op1.setOperationID(Ids.EOperation.op1);
    this._EOperation_op1_p0 = new EParameterImpl();
this._EOperation_op1_p0.eBasicSetValue(Ids.ENamedElement.name, "someOperation");

this._EOperation_op1_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EOperation);

this._EOperation_op1_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EOperation_op1_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EOperation_op1_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EOperation_op1);

this._EOperation_op1.eBootstrapList(Ids.EOperation.eParameters).add(this._EOperation_op1_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "if (someOperation === this) return false;\nconst thisClass = this.getEContainingClass();\nconst otherClass = someOperation.getEContainingClass();\nif (thisClass === undefined || otherClass === undefined) return false;\nif (thisClass === otherClass) return false;\nif (!otherClass.isSuperTypeOf(thisClass)) return false;\nif (this.getName() !== someOperation.getName()) return false;\nconst params = this.getEParameters();\nconst otherParams = someOperation.getEParameters();\nif (params.size() !== otherParams.size()) return false;\nfor (let i = 0; i < params.size(); i++) {\n  if (params.get(i)!.getEType() !== otherParams.get(i)!.getEType()) return false;\n}\nreturn true;");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EOperation_op1.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EOperation.eBootstrapList(Ids.EClass.eOperations).add(this._EOperation_op1);

    this._EPackage_op0 = new EOperationImpl();
this._EPackage_op0.eBasicSetValue(Ids.ENamedElement.name, "getEClassifier");

this._EPackage_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EClassifier);

this._EPackage_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EPackage);

    this._EPackage_op0.setOperationID(Ids.EPackage.op0);
    this._EPackage_op0_p0 = new EParameterImpl();
this._EPackage_op0_p0.eBasicSetValue(Ids.ENamedElement.name, "name");

this._EPackage_op0_p0.eBasicSetValue(Ids.ETypedElement.eType, this._EString);

this._EPackage_op0_p0.eBasicSetValue(Ids.ETypedElement.lowerBound, 0);

this._EPackage_op0_p0.eBasicSetValue(Ids.ETypedElement.upperBound, 1);

this._EPackage_op0_p0.eBasicSetValue(Ids.EParameter.eOperation, this._EPackage_op0);

this._EPackage_op0.eBootstrapList(Ids.EOperation.eParameters).add(this._EPackage_op0_p0);


    {
      const annotation = new EAnnotationImpl();
annotation.eBasicSetValue(Ids.EAnnotation.source, "https://typemf.dev/generator");

      {
        const entry = new EStringToStringMapEntryImpl();
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.key, "body");
        entry.eBasicSetValue(Ids.EStringToStringMapEntry.value, "return this.getEClassifiers().filter(cl => cl.getName() === name).at(0);");
        annotation.eBootstrapList(Ids.EAnnotation.details).add(entry);
      }
this._EPackage_op0.eBootstrapList(Ids.EModelElement.eAnnotations).add(annotation);

    }

this._EPackage.eBootstrapList(Ids.EClass.eOperations).add(this._EPackage_op0);

    this._EStructuralFeature_op0 = new EOperationImpl();
this._EStructuralFeature_op0.eBasicSetValue(Ids.ENamedElement.name, "getFeatureID");

this._EStructuralFeature_op0.eBasicSetValue(Ids.ETypedElement.eType, this._EInt);

this._EStructuralFeature_op0.eBasicSetValue(Ids.EOperation.eContainingClass, this._EStructuralFeature);

    this._EStructuralFeature_op0.setOperationID(Ids.EStructuralFeature.op0);


this._EStructuralFeature.eBootstrapList(Ids.EClass.eOperations).add(this._EStructuralFeature_op0);

    this._EStructuralFeature_op1 = new EOperationImpl();
this._EStructuralFeature_op1.eBasicSetValue(Ids.ENamedElement.name, "getContainerClass");

this._EStructuralFeature_op1.eBasicSetValue(Ids.ETypedElement.eType, this._EJavaClass);

this._EStructuralFeature_op1.eBasicSetValue(Ids.EOperation.eContainingClass, this._EStructuralFeature);

    this._EStructuralFeature_op1.setOperationID(Ids.EStructuralFeature.op1);


this._EStructuralFeature.eBootstrapList(Ids.EClass.eOperations).add(this._EStructuralFeature_op1);


    // Pass 3: every classifier's owning package (self-referential, so must
    // come after pass 1 creates them all).
this._EAttribute.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EAnnotation.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EClass.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EClassifier.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EDataType.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EEnum.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EEnumLiteral.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EFactory.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EModelElement.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ENamedElement.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EOperation.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EPackage.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EParameter.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EReference.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EStructuralFeature.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ETypedElement.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EBigDecimal.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EBigInteger.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EBoolean.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EBooleanObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EByte.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EByteArray.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EByteObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EChar.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ECharacterObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EDate.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EDiagnosticChain.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EDouble.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EDoubleObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EEList.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EEnumerator.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EFeatureMap.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EFeatureMapEntry.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EFloat.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EFloatObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EInt.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EIntegerObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EJavaClass.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EJavaObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ELong.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ELongObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EMap.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EResource.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EResourceSet.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EShort.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EShortObject.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EString.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EStringToStringMapEntry.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ETreeIterator.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EGenericType.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._ETypeParameter.eBasicSetValue(Ids.EClassifier.ePackage, this);

this._EInvocationTargetException.eBasicSetValue(Ids.EClassifier.ePackage, this);


    // Pass 4: supertypes.
this._EAttribute.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EStructuralFeature);

this._EAnnotation.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EModelElement);

this._EClass.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EClassifier);

this._EClassifier.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ENamedElement);

this._EDataType.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EClassifier);

this._EEnum.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EDataType);

this._EEnumLiteral.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ENamedElement);

this._EFactory.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EModelElement);

this._ENamedElement.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EModelElement);

this._EOperation.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ETypedElement);

this._EPackage.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ENamedElement);

this._EParameter.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ETypedElement);

this._EReference.eBootstrapList(Ids.EClass.eSuperTypes).add(this._EStructuralFeature);

this._EStructuralFeature.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ETypedElement);

this._ETypedElement.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ENamedElement);

this._ETypeParameter.eBootstrapList(Ids.EClass.eSuperTypes).add(this._ENamedElement);


    // Pass 5 (recompute EAll* caches, ordinary mode only) removed - stale post-swap.
    // @typemf/core's own EClassImpl is now itself generated code (see NOTES.md's point 6/7
    // write-ups), using the same automatic, get-bodied caching (EObjectImpl.getModelGeneration(),
    // point 1) as self-hosted output always did - there is no recomputeAllLists() method to call
    // anymore, in either mode, and none is needed.

    // Pass 6: set the package's own name/nsURI/nsPrefix/annotations last,
    // deliberately - these go through the ordinary reflective setters
    // (this.setName(), etc.), which need the "name"/etc. feature's own
    // metaclass object to already exist (it's built above, in the passes
    // this follows). Calling them earlier - before those metaclasses
    // exist - is a genuine bootstrap-ordering bug, confirmed directly by
    // reproducing it: this line order isn't a style choice, the metaclass
    // shells and feature wiring above are a real, load-bearing
    // precondition for the reflective setter calls below to work at all.
    this.setName("ecore");
    this.setNsURI("http://www.eclipse.org/emf/2002/Ecore");
    this.setNsPrefix("ecore");


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
  getEAnnotation(): EClass;
  getEAnnotation(source: string): EAnnotation | undefined;
  getEAnnotation(source?: string): EClass | EAnnotation | undefined {
    if (source === undefined) return this._EAnnotation;
    return super.getEAnnotation(source);
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
  getEClassifier(): EClass;
  getEClassifier(name: string): EClassifier | undefined;
  getEClassifier(name?: string): EClass | EClassifier | undefined {
    if (name === undefined) return this._EClassifier;
    return super.getEClassifier(name);
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
