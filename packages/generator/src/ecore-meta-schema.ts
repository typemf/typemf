import { DynamicEFactoryImpl, EAttributeImpl, EClassImpl, EDataTypeImpl, EPackageImpl, EReferenceImpl, type EClass } from '@typemf/core';
import { assignFreshIds } from './id-assignment.js';

/**
 * A hand-authored graph mirroring real Ecore.ecore's own full structure -
 * every EClass, every EDataType, every declared feature (including
 * derived/transient ones - these ARE present in the real file as ordinary
 * <eStructuralFeatures> descriptions of what features a class HAS; what's
 * never serialized is a VALUE for a derived feature on some downstream
 * instance, which never comes up while parsing Ecore.ecore itself, since
 * this file describes structure, not instances-of-that-structure).
 *
 * Two distinct roles, same shape:
 *  1. Registered as the meta-schema the generic XmiSerializer needs to
 *     interpret the real Ecore.ecore file at all (a .ecore file is an
 *     ordinary XMI instance document whose root is an EPackage - reading
 *     it needs SOME registered EPackage describing what "EClass"/
 *     "EAttribute"/etc mean, or there's nothing to dispatch xsi:type
 *     against).
 *  2. The target shape the dynamic-graph -> typed-EPackage conversion step
 *     produces after parsing - what actually gets fed to generate().
 *
 * EObject gets a real classifier shell here (needed so "#//EObject"
 * fragments - e.g. EAnnotation.contents: EObject[] - resolve during
 * parsing) but is deliberately excluded from what the GENERATOR treats as
 * a real classifier to produce files for: it's the one name the generator
 * special-cases exactly the way it already handles "no declared supertype"
 * (see eclass.njk) - any reference to a classifier named "EObject"
 * resolves to @typemf/core's own real EObject instead of generating a
 * redundant, shadowing one.
 *
 * Does NOT model EString/EInt/EBoolean/etc as anything other than bare
 * EDataType shells - no instanceClassName is set here beyond a name;
 * `serializable`/`defaultValueLiteral` on real Ecore.ecore's own
 * EDataType declarations are read during conversion where present, not
 * hardcoded into this meta-schema (the meta-schema only needs to recognize
 * these as valid attributes to parse, not carry their real values itself).
 */
export function buildEcoreMetaSchema() {
  // --- Primitive EDataTypes (bare shells; real Ecore.ecore's own
  // instanceClassName/serializable/etc values are read from the file
  // itself during conversion, not hardcoded here).
  const primitiveNames = [
    'EBigDecimal', 'EBigInteger', 'EBoolean', 'EBooleanObject', 'EByte', 'EByteArray', 'EByteObject',
    'EChar', 'ECharacterObject', 'EDate', 'EDiagnosticChain', 'EDouble', 'EDoubleObject', 'EEList',
    'EEnumerator', 'EFeatureMap', 'EFeatureMapEntry', 'EFloat', 'EFloatObject', 'EInt', 'EIntegerObject',
    'EJavaClass', 'EJavaObject', 'ELong', 'ELongObject', 'EMap', 'EResource', 'EResourceSet', 'EShort',
    'EShortObject', 'EString', 'ETreeIterator', 'EInvocationTargetException',
  ];
  const primitives = new Map(primitiveNames.map((n) => [n, (() => { const d = new EDataTypeImpl(); d.setName(n); return d; })()]));
  const p = (name: string) => primitives.get(name)!;

  // --- Pass 1: every EClass as an empty shell.
  const eObject = new EClassImpl();
  eObject.setName('EObject');
  const eModelElement = new EClassImpl();
  eModelElement.setName('EModelElement');
  eModelElement.setAbstract(true);
  const eAnnotation = new EClassImpl();
  eAnnotation.setName('EAnnotation');
  const eNamedElement = new EClassImpl();
  eNamedElement.setName('ENamedElement');
  eNamedElement.setAbstract(true);
  const eTypedElement = new EClassImpl();
  eTypedElement.setName('ETypedElement');
  eTypedElement.setAbstract(true);
  const eClassifier = new EClassImpl();
  eClassifier.setName('EClassifier');
  eClassifier.setAbstract(true);
  const eStructuralFeature = new EClassImpl();
  eStructuralFeature.setName('EStructuralFeature');
  eStructuralFeature.setAbstract(true);
  const eAttribute = new EClassImpl();
  eAttribute.setName('EAttribute');
  const eReference = new EClassImpl();
  eReference.setName('EReference');
  const eClass = new EClassImpl();
  eClass.setName('EClass');
  const ePackage = new EClassImpl();
  ePackage.setName('EPackage');
  const eDataType = new EClassImpl();
  eDataType.setName('EDataType');
  const eEnum = new EClassImpl();
  eEnum.setName('EEnum');
  const eEnumLiteral = new EClassImpl();
  eEnumLiteral.setName('EEnumLiteral');
  const eFactory = new EClassImpl();
  eFactory.setName('EFactory');
  const eOperation = new EClassImpl();
  eOperation.setName('EOperation');
  const eParameter = new EClassImpl();
  eParameter.setName('EParameter');
  const eStringToStringMapEntry = new EClassImpl();
  eStringToStringMapEntry.setName('EStringToStringMapEntry');
  const eGenericType = new EClassImpl();
  eGenericType.setName('EGenericType');
  const eTypeParameter = new EClassImpl();
  eTypeParameter.setName('ETypeParameter');

  // --- Pass 2: supertypes.
  eAnnotation.getESuperTypes().add(eModelElement);
  eNamedElement.getESuperTypes().add(eModelElement);
  eTypedElement.getESuperTypes().add(eNamedElement);
  eClassifier.getESuperTypes().add(eNamedElement);
  eStructuralFeature.getESuperTypes().add(eTypedElement);
  eAttribute.getESuperTypes().add(eStructuralFeature);
  eReference.getESuperTypes().add(eStructuralFeature);
  eClass.getESuperTypes().add(eClassifier);
  ePackage.getESuperTypes().add(eNamedElement);
  eDataType.getESuperTypes().add(eClassifier);
  eEnum.getESuperTypes().add(eDataType);
  eEnumLiteral.getESuperTypes().add(eNamedElement);
  eFactory.getESuperTypes().add(eModelElement);
  eOperation.getESuperTypes().add(eTypedElement);
  eParameter.getESuperTypes().add(eTypedElement);
  eTypeParameter.getESuperTypes().add(eNamedElement);

  const allClasses: EClass[] = [
    eObject, eModelElement, eAnnotation, eNamedElement, eTypedElement, eClassifier, eStructuralFeature,
    eAttribute, eReference, eClass, ePackage, eDataType, eEnum, eEnumLiteral, eFactory, eOperation,
    eParameter, eStringToStringMapEntry, eGenericType, eTypeParameter,
  ];

  // --- Small helpers to keep pass 3 readable - mirror real Ecore.ecore's
  // own feature declarations line-for-line, not a generalized DSL.
  function attr(
    owner: EClass,
    name: string,
    type: EClass | ReturnType<typeof p>,
    opts: { many?: boolean; changeable?: boolean; volatile?: boolean; transient?: boolean; derived?: boolean } = {}
  ) {
    const a = new EAttributeImpl();
    a.setName(name);
    a.setEType(type);
    if (opts.many) a.setUpperBound(-1);
    if (opts.changeable === false) a.setChangeable(false);
    if (opts.volatile) a.setVolatile(true);
    if (opts.transient) a.setTransient(true);
    if (opts.derived) a.setDerived(true);
    a.setEContainingClass(owner);
    owner.getEStructuralFeatures().add(a);
    return a;
  }
  function ref(
    owner: EClass,
    name: string,
    type: EClass,
    opts: {
      many?: boolean;
      containment?: boolean;
      changeable?: boolean;
      volatile?: boolean;
      transient?: boolean;
      derived?: boolean;
    } = {}
  ) {
    const r = new EReferenceImpl();
    r.setName(name);
    r.setEType(type);
    if (opts.many) r.setUpperBound(-1);
    if (opts.containment) r.setContainment(true);
    if (opts.changeable === false) r.setChangeable(false);
    if (opts.volatile) r.setVolatile(true);
    if (opts.transient) r.setTransient(true);
    if (opts.derived) r.setDerived(true);
    r.setEContainingClass(owner);
    owner.getEStructuralFeatures().add(r);
    return r;
  }

  // --- Pass 3: features, per class, matching real Ecore.ecore's own
  // declaration order.

  // EModelElement
  const eAnnotations = ref(eModelElement, 'eAnnotations', eAnnotation, { many: true, containment: true });

  // EAnnotation
  attr(eAnnotation, 'source', p('EString'));
  ref(eAnnotation, 'details', eStringToStringMapEntry, { many: true, containment: true });
  const annotation_eModelElement = ref(eAnnotation, 'eModelElement', eModelElement, { transient: true });
  ref(eAnnotation, 'contents', eObject, { many: true, containment: true });
  ref(eAnnotation, 'references', eObject, { many: true });

  // ENamedElement
  attr(eNamedElement, 'name', p('EString'));

  // ETypedElement
  attr(eTypedElement, 'ordered', p('EBoolean'));
  attr(eTypedElement, 'unique', p('EBoolean'));
  attr(eTypedElement, 'lowerBound', p('EInt'));
  attr(eTypedElement, 'upperBound', p('EInt'));
  attr(eTypedElement, 'many', p('EBoolean'), { changeable: false, volatile: true, transient: true, derived: true });
  attr(eTypedElement, 'required', p('EBoolean'), { changeable: false, volatile: true, transient: true, derived: true });
  const eType = ref(eTypedElement, 'eType', eClassifier, { volatile: true });
  ref(eTypedElement, 'eGenericType', eGenericType, { containment: true, volatile: true });

  // EClassifier
  const classifier_ePackage = ref(eClassifier, 'ePackage', ePackage, { changeable: false, transient: true });
  ref(eClassifier, 'eTypeParameters', eTypeParameter, { many: true, containment: true });
  attr(eClassifier, 'instanceClassName', p('EString'), { volatile: true });
  attr(eClassifier, 'instanceClass', p('EJavaClass'), { changeable: false, volatile: true, transient: true, derived: true });
  attr(eClassifier, 'defaultValue', p('EJavaObject'), { changeable: false, volatile: true, transient: true, derived: true });
  attr(eClassifier, 'instanceTypeName', p('EString'), { volatile: true });

  // EStructuralFeature
  attr(eStructuralFeature, 'changeable', p('EBoolean'));
  attr(eStructuralFeature, 'volatile', p('EBoolean'));
  attr(eStructuralFeature, 'transient', p('EBoolean'));
  attr(eStructuralFeature, 'defaultValueLiteral', p('EString'));
  attr(eStructuralFeature, 'defaultValue', p('EJavaObject'), { changeable: false, volatile: true, transient: true, derived: true });
  attr(eStructuralFeature, 'unsettable', p('EBoolean'));
  attr(eStructuralFeature, 'derived', p('EBoolean'));
  const feature_eContainingClass = ref(eStructuralFeature, 'eContainingClass', eClass, { changeable: false, transient: true });

  // EAttribute
  attr(eAttribute, 'iD', p('EBoolean'));
  ref(eAttribute, 'eAttributeType', eDataType, { changeable: false, volatile: true, transient: true, derived: true });

  // EReference
  attr(eReference, 'containment', p('EBoolean'));
  attr(eReference, 'container', p('EBoolean'), { changeable: false, volatile: true, transient: true, derived: true });
  attr(eReference, 'resolveProxies', p('EBoolean'));
  const eOpposite = ref(eReference, 'eOpposite', eReference, {});
  ref(eReference, 'eReferenceType', eClass, { changeable: false, volatile: true, transient: true, derived: true });
  ref(eReference, 'eKeys', eAttribute, { many: true });

  // EClass
  attr(eClass, 'abstract', p('EBoolean'));
  attr(eClass, 'interface', p('EBoolean'));
  ref(eClass, 'eSuperTypes', eClass, { many: true });
  const eOperations = ref(eClass, 'eOperations', eOperation, { many: true, containment: true });
  ref(eClass, 'eAllAttributes', eAttribute, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eAllReferences', eReference, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eReferences', eReference, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eAttributes', eAttribute, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eAllContainments', eReference, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eAllOperations', eOperation, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eAllStructuralFeatures', eStructuralFeature, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eAllSuperTypes', eClass, { many: true, changeable: false, volatile: true, transient: true, derived: true });
  ref(eClass, 'eIDAttribute', eAttribute, { changeable: false, volatile: true, transient: true, derived: true });
  const eStructuralFeatures = ref(eClass, 'eStructuralFeatures', eStructuralFeature, { many: true, containment: true });
  ref(eClass, 'eGenericSuperTypes', eGenericType, { many: true, containment: true });
  ref(eClass, 'eAllGenericSuperTypes', eGenericType, { many: true, changeable: false, volatile: true, transient: true, derived: true });

  // EDataType
  attr(eDataType, 'serializable', p('EBoolean'));

  // EEnum
  const eLiterals = ref(eEnum, 'eLiterals', eEnumLiteral, { many: true, containment: true });

  // EEnumLiteral
  attr(eEnumLiteral, 'value', p('EInt'));
  attr(eEnumLiteral, 'instance', p('EEnumerator'), { transient: true });
  attr(eEnumLiteral, 'literal', p('EString'));
  const eEnumLiteral_eEnum = ref(eEnumLiteral, 'eEnum', eEnum, { changeable: false, transient: true });

  // EFactory
  const factory_ePackage = ref(eFactory, 'ePackage', ePackage, { transient: true });

  // EObject - reflective operations only, no structural features of its
  // own (matches the real file), and no eOperations shell needed here
  // since nothing in Ecore.ecore itself declares operations ON an EObject
  // instance the way it does for EClass etc.

  // EOperation
  const operation_eContainingClass = ref(eOperation, 'eContainingClass', eClass, { changeable: false, transient: true });
  ref(eOperation, 'eTypeParameters', eTypeParameter, { many: true, containment: true });
  const eParameters = ref(eOperation, 'eParameters', eParameter, { many: true, containment: true });
  ref(eOperation, 'eExceptions', eClassifier, { many: true });
  ref(eOperation, 'eGenericExceptions', eGenericType, { many: true, containment: true });

  // EPackage
  attr(ePackage, 'nsURI', p('EString'));
  attr(ePackage, 'nsPrefix', p('EString'));
  const eFactoryInstance = ref(ePackage, 'eFactoryInstance', eFactory, { transient: true });
  const eClassifiers = ref(ePackage, 'eClassifiers', eClassifier, { many: true, containment: true });
  const eSubpackages = ref(ePackage, 'eSubpackages', ePackage, { many: true, containment: true });
  const eSuperPackage = ref(ePackage, 'eSuperPackage', ePackage, { changeable: false, transient: true });

  // EParameter
  const parameter_eOperation = ref(eParameter, 'eOperation', eOperation, { changeable: false, transient: true });

  // EStringToStringMapEntry
  attr(eStringToStringMapEntry, 'key', p('EString'));
  attr(eStringToStringMapEntry, 'value', p('EString'));

  // EGenericType
  ref(eGenericType, 'eUpperBound', eGenericType, { containment: true });
  ref(eGenericType, 'eTypeArguments', eGenericType, { many: true, containment: true });
  ref(eGenericType, 'eRawType', eClassifier, { changeable: false, transient: true, derived: true });
  ref(eGenericType, 'eLowerBound', eGenericType, { containment: true });
  ref(eGenericType, 'eTypeParameter', eTypeParameter, {});
  ref(eGenericType, 'eClassifier', eClassifier, {});

  // ETypeParameter
  ref(eTypeParameter, 'eBounds', eGenericType, { many: true, containment: true });

  // --- Pass 4: opposites (symmetric pairs; matches real Ecore.ecore's own
  // eOpposite declarations exactly).
  eAnnotations.setEOpposite(annotation_eModelElement);
  annotation_eModelElement.setEOpposite(eAnnotations);
  classifier_ePackage.setEOpposite(eClassifiers);
  eClassifiers.setEOpposite(classifier_ePackage);
  feature_eContainingClass.setEOpposite(eStructuralFeatures);
  eStructuralFeatures.setEOpposite(feature_eContainingClass);
  operation_eContainingClass.setEOpposite(eOperations);
  eOperations.setEOpposite(operation_eContainingClass);
  parameter_eOperation.setEOpposite(eParameters);
  eParameters.setEOpposite(parameter_eOperation);
  factory_ePackage.setEOpposite(eFactoryInstance);
  eFactoryInstance.setEOpposite(factory_ePackage);
  eSubpackages.setEOpposite(eSuperPackage);
  eSuperPackage.setEOpposite(eSubpackages);
  eEnumLiteral_eEnum.setEOpposite(eLiterals);
  eLiterals.setEOpposite(eEnumLiteral_eEnum);
  // eOpposite itself is intentionally NOT paired with a reverse eOpposite -
  // matches real Ecore.ecore exactly (EMF handles the symmetry at runtime,
  // not via a modeled self-loop).
  void eOpposite;
  void eType;

  // Assemble the package. Real Ecore's own nsURI/nsPrefix/name.
  const pkg = new EPackageImpl();
  pkg.setName('ecore');
  pkg.setNsURI('http://www.eclipse.org/emf/2002/Ecore');
  pkg.setNsPrefix('ecore');
  for (const d of primitives.values()) pkg.getEClassifiers().add(d);
  for (const c of allClasses) pkg.getEClassifiers().add(c);
  for (const classifier of pkg.getEClassifiers()) classifier.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  // Pass 5: assign real, unique featureIDs to every feature (also
  // recomputes EAll* caches internally). Critical, not cosmetic here:
  // DynamicEObjectImpl indexes its own internal storage by featureID, so
  // every feature needs a distinct one before any dynamic instance is
  // constructed against this schema - without this, every feature
  // defaults to the same -1 and many-valued lists silently collide.
  assignFreshIds(pkg);

  return {
    pkg,
    eObject, eModelElement, eAnnotation, eNamedElement, eTypedElement, eClassifier, eStructuralFeature,
    eAttribute, eReference, eClass, ePackage, eDataType, eEnum, eEnumLiteral, eFactory, eOperation,
    eParameter, eStringToStringMapEntry, eGenericType, eTypeParameter,
  };
}
