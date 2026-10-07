import {
  EAnnotationImpl,
  EAttributeImpl,
  EClass,
  setDetailValue,
  EClassifier,
  EClassImpl,
  EcorePackageImpl,
  EDataTypeImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EGenericTypeImpl,
  EModelElement,
  EObject,
  EOperationImpl,
  EPackage,
  EPackageImpl,
  ETypeParameterImpl,
  EParameterImpl,
  EReferenceImpl,
  EStructuralFeature,
  getProxyURI,
  isEClassifier,
  resolveAgainstPackage,
  type EGenericType,
  type ETypedElement,
  type ETypeParameter,
} from '@typemf/core';

/**
 * Converts a dynamic EObject graph - produced by parsing a real .ecore
 * file against the meta-schema (see ecore-meta-schema.ts) - into a real,
 * typed EPackage built from @typemf/core's own hand-written classes. This
 * is the piece generate() actually needs as input; a dynamic graph, even
 * though it fully supports eGet/eSet reflectively, doesn't have the plain
 * convenience methods (setClassifierID(), recomputeAllLists(), ...)
 * generate()'s own internals call directly - only the real typed classes
 * do. This conversion writes via the real classes' own plain methods
 * throughout, not because eSet() itself is unsupported there (it is, for
 * every real, modeled feature - confirmed directly, this comment used to
 * claim otherwise), but because bookkeeping (classifierID, featureID,
 * containerClass, operationID) is deliberately unreachable via eSet by
 * design, matching real EMF, and this conversion needs to set exactly
 * that bookkeeping too - so writing everything through the SAME plain
 * methods uniformly is simpler than splitting eSet-for-real-features from
 * plain-calls-for-bookkeeping. It reads reflectively throughout (eGet, by
 * name, off whatever meta-schema classifier each dynamic object happens
 * to be an instance of).
 *
 * A classifier named "EObject" in the source graph (present only so
 * "#//EObject" fragments resolve during parsing - see
 * ecore-meta-schema.ts) is deliberately NOT converted into a real
 * classifier here: any reference to it becomes `undefined` on the real
 * side, matching the generator's own existing convention for a classifier
 * with no explicit type (which already means "real @typemf/core EObject").
 *
 * `foreignClassifier` maps a proxy into another .ecore file to the typed classifier it stands for
 * (see loadEcorePackage); without it, only this package's and Ecore's classifiers can be referenced.
 */
export function convertDynamicEcoreToTyped(
  dynamicPkg: EObject,
  foreignClassifier?: (proxy: EObject) => EClassifier | undefined
): EPackage {
  const realPkg = new EPackageImpl();
  realPkg.setName(byName<string>(dynamicPkg, 'name') ?? '');
  realPkg.setNsURI(byName<string>(dynamicPkg, 'nsURI') ?? '');
  realPkg.setNsPrefix(byName<string>(dynamicPkg, 'nsPrefix') ?? '');
  copyAnnotations(dynamicPkg, realPkg);

  const dynamicClassifiers = listByName(dynamicPkg, 'eClassifiers');

  // dynamic classifier instance -> real classifier (EObject-named ones map
  // to undefined - see doc comment).
  const classifierMap = new Map<EObject, EClassifier | undefined>();
  // dynamic feature instance -> real feature (for eOpposite wiring, a
  // second pass after every feature on every class already exists).
  const featureMap = new Map<EObject, EStructuralFeature>();
  // dynamic type-parameter instance -> real ETypeParameter (so an
  // EGenericType that refers to one can be wired up).
  const typeParameterMap = new Map<EObject, ETypeParameter>();

  // Pass 1: every classifier as a real, empty shell - keyed by what KIND
  // of thing the dynamic instance itself reflectively is (an instance of
  // the meta-schema's own "EClass"/"EDataType"/"EEnum" classifier).
  for (const dyn of dynamicClassifiers) {
    const kind = dyn.eClass().getName();
    const name = byName<string>(dyn, 'name') ?? '';
    if (name === 'EObject') {
      classifierMap.set(dyn, undefined);
      continue;
    }
    if (kind === 'EClass') {
      const c = new EClassImpl();
      c.setName(name);
      copyAnnotations(dyn, c);
      classifierMap.set(dyn, c);
    } else if (kind === 'EEnum') {
      const e = new EEnumImpl();
      e.setName(name);
      copyAnnotations(dyn, e);
      classifierMap.set(dyn, e);
    } else {
      // EDataType (or an unrecognized classifier kind - treated
      // defensively as a plain named datatype).
      const d = new EDataTypeImpl();
      d.setName(name);
      copyAnnotations(dyn, d);
      classifierMap.set(dyn, d);
    }
  }

  /**
   * The real classifier a dynamic classifier reference denotes: one of this package's own, one of
   * another file's (see `foreignClassifier`), or, for a proxy into Ecore (e.g.
   * `http://www.eclipse.org/emf/2002/Ecore#//EString`), Ecore's own. Ecore's EObject maps to
   * undefined, like a local one.
   */
  function classifierOf(dynClassifier: EObject): EClassifier | undefined {
    if (classifierMap.has(dynClassifier)) return classifierMap.get(dynClassifier);
    const foreign = foreignClassifier?.(dynClassifier);
    if (foreign) return foreign;
    const uri = dynClassifier.eIsProxy() ? getProxyURI(dynClassifier) : undefined;
    const ecore = EcorePackageImpl.eINSTANCE;
    if (uri && uri.trimFragment().toString() === ecore.getNsURI()) {
      const fragment = uri.getFragment() ?? '';
      if (fragment === '//EObject') return undefined;
      const resolved = resolveAgainstPackage(ecore, fragment);
      if (isEClassifier(resolved)) return resolved;
    }
    throw new Error(
      `Cannot resolve the classifier reference '${uri?.toString() ?? dynClassifier.fullId()}': only classifiers of this package, of Ecore and of other .ecore files are supported.`
    );
  }

  /** Resolves a dynamic classifier reference, or reads eGenericType.eClassifier as a fallback when eType itself is unset. */
  function resolveType(dynFeature: EObject): EClassifier | undefined {
    const dynType = byNameRaw(dynFeature, 'eType') as EObject | undefined;
    if (dynType) return classifierOf(dynType);
    const dynGeneric = byNameRaw(dynFeature, 'eGenericType') as EObject | undefined;
    if (dynGeneric) {
      const dynClassifier = byNameRaw(dynGeneric, 'eClassifier') as EObject | undefined;
      if (dynClassifier) return classifierOf(dynClassifier);
    }
    return undefined;
  }

  /**
   * A real EGenericType mirroring a dynamic one, recursively: its
   * classifier and type parameter (each only if set AND resolvable - an
   * EObject-bound reference resolves to undefined here, the same
   * documented loss as anywhere else EObject is dropped, so it reads as
   * "unbound"), and every type argument in order (an argument with
   * neither is Ecore's `<eTypeArguments/>`: unbound).
   */
  function convertGenericType(dynGeneric: EObject): EGenericType {
    const gt = new EGenericTypeImpl();
    const dynClassifier = byNameRaw(dynGeneric, 'eClassifier') as EObject | undefined;
    if (dynClassifier) gt.setEClassifier(classifierOf(dynClassifier));
    const dynParameter = byNameRaw(dynGeneric, 'eTypeParameter') as EObject | undefined;
    if (dynParameter) gt.setETypeParameter(typeParameterMap.get(dynParameter));
    for (const dynArgument of listByName(dynGeneric, 'eTypeArguments')) {
      gt.getETypeArguments().add(convertGenericType(dynArgument));
    }
    return gt;
  }

  /** Sets a real typed element's type from its dynamic counterpart: the full generic type when it has one (which also sets eType), else the plain eType. */
  function applyType(dynTyped: EObject, real: ETypedElement): void {
    const dynGeneric = byNameRaw(dynTyped, 'eGenericType') as EObject | undefined;
    if (dynGeneric) {
      real.setEGenericType(convertGenericType(dynGeneric));
      return;
    }
    const type = resolveType(dynTyped);
    if (type) real.setEType(type);
  }

  // Pass 2: classifier-level scalar properties + EClass.eSuperTypes (every
  // classifier now exists, so cross-references resolve).
  for (const dyn of dynamicClassifiers) {
    const real = classifierMap.get(dyn);
    if (!real) continue;
    const kind = dyn.eClass().getName();

    for (const dynParameter of listByName(dyn, 'eTypeParameters')) {
      const parameter = new ETypeParameterImpl();
      parameter.setName(byName<string>(dynParameter, 'name') ?? '');
      real.getETypeParameters().add(parameter);
      typeParameterMap.set(dynParameter, parameter);
    }

    // instanceClassName (on every EClassifier in real Ecore.ecore, not just
    // EDataType) - consumed by the typescript template set's layered
    // EDataType-to-TypeScript-type resolution (see typescript-filters.ts).
    const instanceClassName = byName<string>(dyn, 'instanceClassName');
    if (instanceClassName !== undefined && instanceClassName !== '') real.setInstanceClassName(instanceClassName);

    if (kind === 'EClass') {
      const c = real as EClass;
      if (byName<boolean>(dyn, 'abstract')) c.setAbstract(true);
      if (byName<boolean>(dyn, 'interface')) c.setInterface(true);
      for (const dynSuper of listByName(dyn, 'eSuperTypes')) {
        const realSuper = classifierOf(dynSuper);
        if (realSuper) c.getESuperTypes().add(realSuper as EClass);
      }
    }
  }

  // Pass 3: structural features + operations, for every EClass.
  for (const dyn of dynamicClassifiers) {
    const real = classifierMap.get(dyn);
    if (!real || dyn.eClass().getName() !== 'EClass') continue;
    const realClass = real as EClass;

    for (const dynFeature of listByName(dyn, 'eStructuralFeatures')) {
      const featureKind = dynFeature.eClass().getName();
      const name = byName<string>(dynFeature, 'name') ?? '';
      const lowerBound = byName<number>(dynFeature, 'lowerBound');
      const upperBound = byName<number>(dynFeature, 'upperBound');

      if (featureKind === 'EReference') {
        const r = new EReferenceImpl();
        r.setName(name);
        applyType(dynFeature, r);
        if (typeof lowerBound === 'number') r.setLowerBound(lowerBound);
        if (typeof upperBound === 'number') r.setUpperBound(upperBound);
        if (byName<boolean>(dynFeature, 'containment')) r.setContainment(true);
        if (byName<boolean>(dynFeature, 'resolveProxies') === false) r.setResolveProxies(false);
        r.setEContainingClass(realClass);
        copyFeatureFlags(dynFeature, r);
        copyAnnotations(dynFeature, r);
        realClass.getEStructuralFeatures().add(r);
        featureMap.set(dynFeature, r);
      } else {
        // EAttribute
        const a = new EAttributeImpl();
        a.setName(name);
        applyType(dynFeature, a);
        if (typeof lowerBound === 'number') a.setLowerBound(lowerBound);
        if (typeof upperBound === 'number') a.setUpperBound(upperBound);
        if (byName<boolean>(dynFeature, 'iD')) a.setID(true);
        copyFeatureFlags(dynFeature, a); // now copies defaultValueLiteral too - see copyFeatureFlags
        a.setEContainingClass(realClass);
        copyAnnotations(dynFeature, a);
        realClass.getEStructuralFeatures().add(a);
        featureMap.set(dynFeature, a);
      }
    }

    for (const dynOp of listByName(dyn, 'eOperations')) {
      const op = new EOperationImpl();
      op.setName(byName<string>(dynOp, 'name') ?? '');
      applyType(dynOp, op);
      copyAnnotations(dynOp, op);
      const opLowerBound = byName<number>(dynOp, 'lowerBound');
      const opUpperBound = byName<number>(dynOp, 'upperBound');
      if (typeof opLowerBound === 'number') op.setLowerBound(opLowerBound);
      if (typeof opUpperBound === 'number') op.setUpperBound(opUpperBound);
      for (const dynParam of listByName(dynOp, 'eParameters')) {
        const param = new EParameterImpl();
        param.setName(byName<string>(dynParam, 'name') ?? '');
        applyType(dynParam, param);
        const paramLowerBound = byName<number>(dynParam, 'lowerBound');
        const paramUpperBound = byName<number>(dynParam, 'upperBound');
        if (typeof paramLowerBound === 'number') param.setLowerBound(paramLowerBound);
        if (typeof paramUpperBound === 'number') param.setUpperBound(paramUpperBound);
        op.getEParameters().add(param);
      }
      realClass.getEOperations().add(op);
    }
  }

  // Pass 4: EEnum.eLiterals (deferred until here purely for readability;
  // no cross-classifier dependency involved).
  for (const dyn of dynamicClassifiers) {
    const real = classifierMap.get(dyn);
    if (!real || dyn.eClass().getName() !== 'EEnum') continue;
    for (const dynLiteral of listByName(dyn, 'eLiterals')) {
      const lit = new EEnumLiteralImpl();
      lit.setName(byName<string>(dynLiteral, 'name') ?? '');
      lit.setValue(byName<number>(dynLiteral, 'value') ?? 0);
      lit.setLiteral(byName<string>(dynLiteral, 'literal') ?? byName<string>(dynLiteral, 'name') ?? '');
      copyAnnotations(dynLiteral, lit);
      // addLiteral() no longer exists - @typemf/core's own EEnumLiteralImpl is itself now generated
      // code, properly extending EObjectImpl, so the ordinary getELiterals().add() path correctly
      // wires the eEnum opposite automatically (see NOTES.md's point 6/7 write-ups, and the matching
      // fix in epackage.njk).
      (real as EEnumImpl).getELiterals().add(lit);
    }
  }

  // Pass 5: eOpposite (every feature on every class now exists).
  for (const [dynFeature, realFeature] of featureMap) {
    const dynOpposite = byNameRaw(dynFeature, 'eOpposite') as EObject | undefined;
    if (!dynOpposite) continue;
    const realOpposite = featureMap.get(dynOpposite);
    if (realOpposite && 'setEOpposite' in realFeature) {
      (realFeature as EReferenceImpl).setEOpposite(realOpposite as EReferenceImpl);
    }
  }

  // Pass 6 (recompute EAll* caches for every real EClass) removed - recomputeAllLists() no longer
  // exists at all post-swap; generated get-bodied features cache automatically (see
  // EObjectImpl.getModelGeneration()), needing no manual recompute step.

  // Assemble.
  for (const real of classifierMap.values()) {
    if (real) realPkg.getEClassifiers().add(real);
  }

  return realPkg;
}

/**
 * Copies every EAnnotation (source + details) from a dynamic element onto
 * the corresponding real, typed one - package, classifier, feature,
 * operation and enum literal (not parameters). Operations matter because
 * that is where the generator reads an operation's `body` from (see
 * operationBody); they were left out here originally on the reasoning
 * that a converted operation has no runtime representation to attach to,
 * which is true of the GENERATED package's bootstrap (it builds no
 * operations, so emits no operation annotations) but not of this input
 * model, where a body written in a real .ecore file could otherwise
 * never reach the generator.
 */
function copyAnnotations(dyn: EObject, real: EModelElement): void {
  for (const dynAnnotation of listByName(dyn, 'eAnnotations')) {
    const annotation = new EAnnotationImpl();
    const source = byName<string>(dynAnnotation, 'source');
    if (source !== undefined) annotation.setSource(source);
    for (const dynDetail of listByName(dynAnnotation, 'details')) {
      const key = byName<string>(dynDetail, 'key');
      const value = byName<string>(dynDetail, 'value');
      if (key !== undefined && value !== undefined) {
        setDetailValue(annotation.getDetails(), key, value);
      }
    }
    real.getEAnnotations().add(annotation);
  }
}

/**
 * Copies changeable/volatile/transient/derived/unsettable from a dynamic
 * feature onto the real one. A real, previously-missed gap: without this,
 * EVERY feature converted from a real .ecore file loses these flags
 * entirely (defaulting to changeable=true, everything else false) -
 * regardless of what the source file actually declares. Concretely, this
 * silently broke the generator's derived-feature formula treatment
 * (TRIVIAL_DERIVED_FORMULAS checks feature.isDerived() first) for every
 * real file this pipeline has ever converted, including real Ecore.ecore
 * itself - "required"/"many"/etc were generating as ordinary stored
 * fields, not the intended formulas, until this was added.
 */
function copyFeatureFlags(dyn: EObject, real: EStructuralFeature): void {
  const changeable = byName<boolean>(dyn, 'changeable');
  if (changeable === false) real.setChangeable(false);
  if (byName<boolean>(dyn, 'volatile')) real.setVolatile(true);
  if (byName<boolean>(dyn, 'transient')) real.setTransient(true);
  if (byName<boolean>(dyn, 'derived')) real.setDerived(true);
  if (byName<boolean>(dyn, 'unsettable')) real.setUnsettable(true);
  const defaultValueLiteral = byName<string>(dyn, 'defaultValueLiteral');
  if (defaultValueLiteral !== undefined) real.setDefaultValueLiteral(defaultValueLiteral);
}

/** Reads a named feature's value reflectively, off whatever classifier `obj` happens to be an instance of. */
function byNameRaw(obj: EObject, featureName: string): unknown {
  const feature = obj.eClass().getEStructuralFeature(featureName);
  if (!feature) return undefined;
  return obj.eGet(feature);
}

function byName<T>(obj: EObject, featureName: string): T | undefined {
  return byNameRaw(obj, featureName) as T | undefined;
}

function listByName(obj: EObject, featureName: string): EObject[] {
  const value = byNameRaw(obj, featureName);
  if (!value) return [];
  return [...(value as Iterable<EObject>)];
}
