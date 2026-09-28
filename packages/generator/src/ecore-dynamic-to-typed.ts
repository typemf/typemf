import {
  EcoreFactoryImpl,
  EAnnotationImpl,
  EAttributeImpl,
  EClass,
  EClassifier,
  EClassImpl,
  EDataTypeImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EModelElement,
  EObject,
  EOperationImpl,
  EPackage,
  EPackageImpl,
  EParameterImpl,
  EReferenceImpl,
  EStructuralFeature,
  EStringToStringMapEntryImpl,
} from "@typemf/core";

/**
 * Converts a dynamic EObject graph - produced by parsing a real .ecore
 * file against the meta-schema (see ecore-meta-schema.ts) - into a real,
 * typed EPackage built from @typemf/core's own hand-written classes. This
 * is the piece generate() actually needs as input; a dynamic graph, even
 * though it fully supports eGet/eSet reflectively, doesn't have the plain
 * convenience methods (setClassifierID(), recomputeAllLists(), ...)
 * generate()'s own internals call directly - only the real typed classes
 * do, and they don't support eSet(), so this conversion never goes
 * through eSet() itself: it reads reflectively (eGet, by name, off
 * whatever meta-schema classifier each dynamic object happens to be an
 * instance of) and writes via the real classes' own plain methods.
 *
 * A classifier named "EObject" in the source graph (present only so
 * "#//EObject" fragments resolve during parsing - see
 * ecore-meta-schema.ts) is deliberately NOT converted into a real
 * classifier here: any reference to it becomes `undefined` on the real
 * side, matching the generator's own existing convention for a classifier
 * with no explicit type (which already means "real @typemf/core EObject").
 */
export function convertDynamicEcoreToTyped(dynamicPkg: EObject): EPackage {
  const realPkg = new EPackageImpl();
  realPkg.setName(byName<string>(dynamicPkg, "name") ?? "");
  realPkg.setNsURI(byName<string>(dynamicPkg, "nsURI") ?? "");
  realPkg.setNsPrefix(byName<string>(dynamicPkg, "nsPrefix") ?? "");
  copyAnnotations(dynamicPkg, realPkg);

  const dynamicClassifiers = listByName(dynamicPkg, "eClassifiers");

  // dynamic classifier instance -> real classifier (EObject-named ones map
  // to undefined - see doc comment).
  const classifierMap = new Map<EObject, EClassifier | undefined>();
  // dynamic feature instance -> real feature (for eOpposite wiring, a
  // second pass after every feature on every class already exists).
  const featureMap = new Map<EObject, EStructuralFeature>();

  // Pass 1: every classifier as a real, empty shell - keyed by what KIND
  // of thing the dynamic instance itself reflectively is (an instance of
  // the meta-schema's own "EClass"/"EDataType"/"EEnum" classifier).
  for (const dyn of dynamicClassifiers) {
    const kind = dyn.eClass().getName();
    const name = byName<string>(dyn, "name") ?? "";
    if (name === "EObject") {
      classifierMap.set(dyn, undefined);
      continue;
    }
    if (kind === "EClass") {
      const c = new EClassImpl();
      c.setName(name);
      copyAnnotations(dyn, c);
      classifierMap.set(dyn, c);
    } else if (kind === "EEnum") {
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

  /** Resolves a dynamic classifier reference through classifierMap, or reads eGenericType.eClassifier as a fallback when eType itself is unset. */
  function resolveType(dynFeature: EObject): EClassifier | undefined {
    const dynType = byNameRaw(dynFeature, "eType") as EObject | undefined;
    if (dynType) return classifierMap.get(dynType);
    const dynGeneric = byNameRaw(dynFeature, "eGenericType") as
      EObject | undefined;
    if (dynGeneric) {
      const dynClassifier = byNameRaw(dynGeneric, "eClassifier") as
        EObject | undefined;
      if (dynClassifier) return classifierMap.get(dynClassifier);
    }
    return undefined;
  }

  // Pass 2: classifier-level scalar properties + EClass.eSuperTypes (every
  // classifier now exists, so cross-references resolve).
  for (const dyn of dynamicClassifiers) {
    const real = classifierMap.get(dyn);
    if (!real) continue;
    const kind = dyn.eClass().getName();

    // instanceClassName is not modeled on @typemf/core's EDataType/
    // EClassifier yet - informational only in real EMF; dropped here. See
    // NOTES.md.

    if (kind === "EClass") {
      const c = real as EClass;
      if (byName<boolean>(dyn, "abstract")) c.setAbstract(true);
      if (byName<boolean>(dyn, "interface")) c.setInterface(true);
      for (const dynSuper of listByName(dyn, "eSuperTypes")) {
        const realSuper = classifierMap.get(dynSuper);
        if (realSuper) c.getESuperTypes().add(realSuper as EClass);
      }
    }
  }

  // Pass 3: structural features + operations, for every EClass.
  for (const dyn of dynamicClassifiers) {
    const real = classifierMap.get(dyn);
    if (!real || dyn.eClass().getName() !== "EClass") continue;
    const realClass = real as EClass;

    for (const dynFeature of listByName(dyn, "eStructuralFeatures")) {
      const featureKind = dynFeature.eClass().getName();
      const name = byName<string>(dynFeature, "name") ?? "";
      const type = resolveType(dynFeature);
      const lowerBound = byName<number>(dynFeature, "lowerBound");
      const upperBound = byName<number>(dynFeature, "upperBound");

      if (featureKind === "EReference") {
        const r = new EReferenceImpl();
        r.setName(name);
        if (type) r.setEType(type);
        if (typeof lowerBound === "number") r.setLowerBound(lowerBound);
        if (typeof upperBound === "number") r.setUpperBound(upperBound);
        if (byName<boolean>(dynFeature, "containment")) r.setContainment(true);
        if (byName<boolean>(dynFeature, "resolveProxies") === false)
          r.setResolveProxies(false);
        r.setEContainingClass(realClass);
        copyFeatureFlags(dynFeature, r);
        copyAnnotations(dynFeature, r);
        realClass.getEStructuralFeatures().add(r);
        featureMap.set(dynFeature, r);
      } else {
        // EAttribute
        const a = new EAttributeImpl();
        a.setName(name);
        if (type) a.setEType(type);
        if (typeof lowerBound === "number") a.setLowerBound(lowerBound);
        if (typeof upperBound === "number") a.setUpperBound(upperBound);
        if (byName<boolean>(dynFeature, "iD")) a.setID(true);
        copyFeatureFlags(dynFeature, a);
        // defaultValueLiteral: not yet modeled on @typemf/core's EAttribute
        // - real EMF bakes it into the generated field's initial value at
        // generation time (see NOTES.md); dropped here until that
        // generator feature exists, since nothing would consume it yet.
        a.setEContainingClass(realClass);
        copyAnnotations(dynFeature, a);
        realClass.getEStructuralFeatures().add(a);
        featureMap.set(dynFeature, a);
      }
    }

    for (const dynOp of listByName(dyn, "eOperations")) {
      const op = new EOperationImpl();
      op.setName(byName<string>(dynOp, "name") ?? "");
      const opType = resolveType(dynOp);
      if (opType) op.setEType(opType);
      const opLowerBound = byName<number>(dynOp, "lowerBound");
      const opUpperBound = byName<number>(dynOp, "upperBound");
      if (typeof opLowerBound === "number") op.setLowerBound(opLowerBound);
      if (typeof opUpperBound === "number") op.setUpperBound(opUpperBound);
      for (const dynParam of listByName(dynOp, "eParameters")) {
        const param = new EParameterImpl();
        param.setName(byName<string>(dynParam, "name") ?? "");
        const paramType = resolveType(dynParam);
        if (paramType) param.setEType(paramType);
        const paramLowerBound = byName<number>(dynParam, "lowerBound");
        const paramUpperBound = byName<number>(dynParam, "upperBound");
        if (typeof paramLowerBound === "number")
          param.setLowerBound(paramLowerBound);
        if (typeof paramUpperBound === "number")
          param.setUpperBound(paramUpperBound);
        op.getEParameters().add(param);
      }
      realClass.getEOperations().add(op);
    }
  }

  // Pass 4: EEnum.eLiterals (deferred until here purely for readability;
  // no cross-classifier dependency involved).
  for (const dyn of dynamicClassifiers) {
    const real = classifierMap.get(dyn);
    if (!real || dyn.eClass().getName() !== "EEnum") continue;
    for (const dynLiteral of listByName(dyn, "eLiterals")) {
      const lit = new EEnumLiteralImpl();
      lit.setName(byName<string>(dynLiteral, "name") ?? "");
      lit.setValue(byName<number>(dynLiteral, "value") ?? 0);
      lit.setLiteral(
        byName<string>(dynLiteral, "literal") ??
          byName<string>(dynLiteral, "name") ??
          "",
      );
      copyAnnotations(dynLiteral, lit);
      (real as unknown as { addLiteral(l: EEnumLiteralImpl): void }).addLiteral(
        lit,
      );
    }
  }

  // Pass 5: eOpposite (every feature on every class now exists).
  for (const [dynFeature, realFeature] of featureMap) {
    const dynOpposite = byNameRaw(dynFeature, "eOpposite") as
      EObject | undefined;
    if (!dynOpposite) continue;
    const realOpposite = featureMap.get(dynOpposite);
    if (realOpposite && "setEOpposite" in realFeature) {
      (realFeature as EReferenceImpl).setEOpposite(
        realOpposite as EReferenceImpl,
      );
    }
  }

  // Pass 6: recompute EAll* caches for every real EClass.
  for (const real of classifierMap.values()) {
    if (real && "recomputeAllLists" in real) {
      //      (real as EClass).recomputeAllLists();
    }
  }

  // Assemble.
  for (const real of classifierMap.values()) {
    if (real) realPkg.getEClassifiers().add(real);
  }
  for (const c of realPkg.getEClassifiers()) c.setEPackage(realPkg);

  return realPkg;
}

/**
 * Copies every EAnnotation (source + details) from a dynamic element onto
 * the corresponding real, typed one - scoped to package/classifier/
 * feature/enum-literal only. EOperations are deliberately NOT covered:
 * they have no runtime representation in the converted graph at all yet
 * (see NOTES.md's "which operations are missing" tracking), so there's
 * nowhere for an operation-level annotation to attach until that's built.
 */
function copyAnnotations(dyn: EObject, real: EModelElement): void {
  for (const dynAnnotation of listByName(dyn, "eAnnotations")) {
    const annotation = new EAnnotationImpl();
    const source = byName<string>(dynAnnotation, "source");
    if (source !== undefined) annotation.setSource(source);
    for (const dynDetail of listByName(dynAnnotation, "details")) {
      const key = byName<string>(dynDetail, "key");
      const value = byName<string>(dynDetail, "value");
      if (key !== undefined && value !== undefined) {
        const factory = new EcoreFactoryImpl();
        const details = new EStringToStringMapEntryImpl();
        details.setKey(key);
        details.setValue(value);
        annotation.getDetails().add(details);
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
  const changeable = byName<boolean>(dyn, "changeable");
  if (changeable === false) real.setChangeable(false);
  if (byName<boolean>(dyn, "volatile")) real.setVolatile(true);
  if (byName<boolean>(dyn, "transient")) real.setTransient(true);
  if (byName<boolean>(dyn, "derived")) real.setDerived(true);
  if (byName<boolean>(dyn, "unsettable")) real.setUnsettable(true);
}

/** Reads a named feature's value reflectively, off whatever classifier `obj` happens to be an instance of. */
function byNameRaw(obj: EObject, featureName: string): unknown {
  const feature = obj
    .eClass()
    .getEStructuralFeatures()
    .filter((f) => f.getName() === featureName)
    .at(0);
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
