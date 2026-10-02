import {
  EcorePackageImpl,
  EClass,
  EObject,
  ProxyEObjectImpl,
  isEClassifier,
  resolveAgainstPackage,
} from '@typemf/core';

const CLASSIFIER_PREFIX = 'ecore:';
const MEMBER_PREFIX = 'ecore-member:';

/** obj has getEContainingClass() (EStructuralFeature and EOperation both do) and some stable,
 *  baked-in own id within that class - featureID for a feature, operationID for an operation. */
interface HasContainingClassAndOwnId {
  getEContainingClass(): EClass | undefined;
  getFeatureID?(): number;
  getOperationID?(): number;
}

function hasContainingClass(obj: unknown): obj is HasContainingClassAndOwnId {
  return typeof (obj as { getEContainingClass?: unknown }).getEContainingClass === 'function';
}

/** "f<id>" for a feature, "o<id>" for an operation - featureID and operationID are separate
 *  numbering spaces on the same containing class (real EMF convention), so a bare number alone
 *  could collide between, say, feature 0 and operation 0 on the same class; the kind marker
 *  disambiguates. */
function ownIdWithin(obj: HasContainingClassAndOwnId): string | undefined {
  if (typeof obj.getFeatureID === 'function') return `f${obj.getFeatureID()}`;
  if (typeof obj.getOperationID === 'function') return `o${obj.getOperationID()}`;
  return undefined;
}

/**
 * If `obj` is itself one of Ecore's own classifiers (EClass, EAttribute, EReference, ... - the
 * fixed, baked-in set EcorePackageImpl.eINSTANCE.getEClassifiers() enumerates, not merely an
 * instance of one of them), or a structural feature/operation declared directly on one of them
 * (e.g. the real ENamedElement.name feature, shared by every named Ecore metaclass), its
 * well-known id - otherwise undefined, meaning the normal opaque, session-scoped ObjectIdMap
 * scheme applies instead.
 *
 * classifierID/featureID/operationID (not the object's own identity) are what make this actually
 * well-known: each is assigned once, at generation time (see @typemf/generator's assignFreshIds),
 * baked into the generated code itself - not minted per-session the way ObjectIdMap's own ids
 * are. Since the extension host and the webview both run the same @typemf/core build, they
 * already agree on every one of these with zero synchronization needed, which is exactly what
 * makes resolving one of these need no round trip at all: `wellKnownEcoreObject` can look it up
 * directly, locally, on either side.
 *
 * The member (feature/operation) case is a real, confirmed gap this covers, not originally
 * anticipated: a well-known classifier's OWN features/operations are read directly off that
 * already-available classifier (e.g. `EcorePackageImpl.eINSTANCE.getEPackage().
 * getEStructuralFeature('name')`), never reconstructed through SnapshotSerializer.deserialize()
 * at all - so WebviewObjectRegistry.record() was never called for them, and a real, successful
 * edit (e.g. renaming anything at all, since ENamedElement.name is involved) could never be
 * relayed to the host, silently (well, visibly now - see EditRelayFailedMessage) losing data.
 *
 * Classifier recognition exists specifically to break a real infinite-recursion hazard, not as a
 * general optimization: EClass is an instance of itself (EClass.eClass() === EClass), so eagerly
 * resolving an object's eClassId the normal way would, for this one, bottom-most case,
 * recursively request itself forever. Found by actually tracing the recursion through, not
 * anticipated in the original design.
 */
export function wellKnownEcoreId(obj: EObject): string | undefined {
  // A still-unresolved proxy is checked FIRST, before any type-specific method (getEPackage(),
  // getEContainingClass(), ...) is ever called on it - a real, confirmed crash otherwise: a
  // proxy is a generic wrapper, declaring only what it WILL be once resolved (isEClassifier(obj)
  // can genuinely be true for one, since that only inspects the proxy's own declared eClass), but
  // it implements none of that target type's real methods itself. This became reachable once a
  // same-attribute cross-document reference (e.g. eType="ecore:EDataType http://.../Ecore#//
  // EString") started flowing through here unresolved - exactly the read-side fix XmiSerializer
  // got earlier this session - since resolving THAT proxy is deliberately lazy, not eager, and
  // this function needs an answer before anything ever resolves it. Handled by resolving Ecore's
  // own fragment format directly and synchronously (no round trip needed - it's entirely local,
  // in-memory data), then recursing on the real, resolved object, which the rest of this function
  // already knows how to handle correctly.
  if (obj.eIsProxy()) {
    // Never falls through to a type-specific method below for a proxy, even an unrecognized
    // proxy implementation - the whole point of this check.
    if (!(obj instanceof ProxyEObjectImpl)) return undefined;
    const proxyURI = obj.getProxyURI();
    if (proxyURI.trimFragment().toString() !== EcorePackageImpl.eINSTANCE.getNsURI()) return undefined;
    const fragment = proxyURI.getFragment();
    const resolved = fragment ? resolveAgainstPackage(EcorePackageImpl.eINSTANCE, fragment) : undefined;
    return resolved ? wellKnownEcoreId(resolved) : undefined;
  }
  if (isEClassifier(obj)) {
    if (obj.getEPackage() !== EcorePackageImpl.eINSTANCE) return undefined;
    return `${CLASSIFIER_PREFIX}${obj.getClassifierID()}`;
  }
  if (hasContainingClass(obj)) {
    const containingClass = obj.getEContainingClass();
    const ownId = ownIdWithin(obj);
    if (!containingClass || containingClass.getEPackage() !== EcorePackageImpl.eINSTANCE || ownId === undefined)
      return undefined;
    return `${MEMBER_PREFIX}${containingClass.getClassifierID()}.${ownId}`;
  }
  return undefined;
}

/** The reverse of wellKnownEcoreId - looks the real, local classifier or feature/operation up
 *  directly, no round trip. */
export function wellKnownEcoreObject(id: string): EObject | undefined {
  if (id.startsWith(MEMBER_PREFIX)) {
    const [classifierPart, ownIdPart] = id.slice(MEMBER_PREFIX.length).split('.');
    const classifierID = Number(classifierPart);
    const containingClass = [...EcorePackageImpl.eINSTANCE.getEClassifiers()].find(
      (c) => c.getClassifierID() === classifierID
    ) as EClass | undefined;
    if (!containingClass || !ownIdPart) return undefined;
    const allMembers = [...containingClass.getEAllStructuralFeatures(), ...containingClass.getEAllOperations()];
    return allMembers.find((m) => ownIdWithin(m as unknown as HasContainingClassAndOwnId) === ownIdPart);
  }
  if (id.startsWith(CLASSIFIER_PREFIX)) {
    const classifierID = Number(id.slice(CLASSIFIER_PREFIX.length));
    return [...EcorePackageImpl.eINSTANCE.getEClassifiers()].find((c) => c.getClassifierID() === classifierID);
  }
  return undefined;
}
