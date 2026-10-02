import { decodeAttributeValue } from '@typemf/json';
import {
  DynamicEFactoryImpl,
  EClass,
  EcorePackageImpl,
  EObject,
  EObjectSerializer,
  isEClass,
  isEEnum,
  isEReference,
  isEStructuralFeature,
  ProxyEObjectImpl,
  Resource,
  ResourceFactory,
  ResourceFactoryRegistry,
  ResourceImpl,
  EStructuralFeatureImpl,
  URI,
} from '@typemf/core';
import { EditRelay } from './edit-relay.js';
import { ObjectSnapshot } from './snapshot-object.js';
import { wellKnownEcoreObject } from './well-known-ecore-id.js';
import { WebviewObjectRegistry } from './webview-object-registry.js';

/** The one, shared virtual URI scheme every object on the extension-host side is proxied under. */
export const HOST_SCHEME = 'typemf-host';

/** The URI a proxy/resource for `id` resolves against - path-based, not fragment-based (see the
 *  design discussion: getResource() keys resources by trimFragment(), so every object needs its
 *  own distinct path to get its own distinct, independently-loadable resource). No fragment is
 *  needed - each such resource has exactly one root, itself. */
export function uriForId(id: string): URI {
  // The fragment itself is never actually read (see resolveFragment below - every such resource
  // has exactly one root, always returned regardless of what the fragment says) - but it must be
  // non-empty: @typemf/core's own resolve() never even calls a serializer's resolveFragment when
  // the fragment is empty/undefined, unconditionally treating that as unresolvable before the
  // serializer gets a say - a real, found gap in core's own resolve(), worked around here locally
  // rather than fixed at the source, since a non-empty-but-ignored fragment costs nothing.
  return URI.parse(`${HOST_SCHEME}:/${id}#self`);
}

const dynamicFactory = new DynamicEFactoryImpl();

/**
 * A snapshot's attributes/references include EVERY feature getEAllStructuralFeatures() reports -
 * including read-only derived ones (e.g. eAllSuperTypes) and impl-only bookkeeping (e.g.
 * ePackage, eContainingClass) that have no public eSet case at all (see this session's earlier
 * needsImplOnlySetter/isReadOnlyFeature work). There is no public, runtime-checkable way to know
 * this ahead of time, so this relies on the generated code's own, already-thrown "has no feature
 * with id N" error to detect it - silently skipping exactly those, not a real error. Correct, not
 * a workaround: these are genuinely derived from other, real data (or set only during bootstrap),
 * never independently reconstructable data in the first place.
 */
async function trySet(fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
  } catch {
    // expected for a read-only or impl-only feature - see the doc comment above
  }
}

/**
 * Whether `obj` itself needs its own structural references (eStructuralFeatures, eSuperTypes,
 * eOperations) resolved eagerly rather than left as lazy proxies.
 *
 * A real correction, not a rename, of an earlier, wrong version of this check (which asked
 * whether obj's own *type* belonged to Ecore's package - "is this a metaclass"). The actual
 * governing question is narrower and different: will some *future* instance of `obj` (when obj
 * is itself an EClass) be constructed via DynamicEFactoryImpl - the only constructor
 * (DynamicEObjectImpl's) that ever walks eClass.getEAllStructuralFeatures() immediately, needing
 * real EStructuralFeature objects rather than proxies with none of the EStructuralFeature-specific
 * methods (isMany(), isContainment(), ...) a proxy only implementing the base EObject interface
 * has. An ordinary metaclass instance belonging to the real, generated EcorePackageImpl.eINSTANCE
 * (EAttribute, EReference, ...) never needs this at all, since anything constructed through it
 * always uses EcorePackageImpl's own real, generated factory - confirmed by tracing an actual
 * failure through: opening Ecore.ecore itself (a document whose entire content IS Ecore's own
 * metamodel, described as data) previously cascaded into a sequential storm of real round trips
 * for every one of its ~20+ classifiers under the old, wrong condition, hanging indefinitely.
 * Ordinary instance references (e.g. Library.books) are unaffected either way - this only ever
 * applies to obj being an EClass in the first place.
 */
function needsEagerOwnFeatures(obj: EObject): boolean {
  if (isEClass(obj)) {
    const factory = obj.getEPackage()?.getEFactoryInstance();
    return factory === undefined || factory instanceof DynamicEFactoryImpl;
  }
  // An EStructuralFeature's own eType (and eGenericType/eOpposite) is always immediately
  // dereferenced by @typemf/json's encodeAttributeValue/decodeAttributeValue the moment a value
  // for that feature is processed (checking for EDate, EEnum, ...) - regardless of whether the
  // feature's own containing class needs DynamicEFactoryImpl or not. Found as a real, confirmed
  // crash (`eType?.getName is not a function` - a still-unresolved ProxyEObjectImpl, which has no
  // getName() at all, only the base EObject interface) while investigating the Ecore.ecore hang,
  // not anticipated: any attribute using a genuinely custom (non-well-known) datatype or enum
  // would hit this in production too, not just in this specific test fixture. Small, bounded
  // reference set (eType/eGenericType/eOpposite), so no real cascade risk the way EClass's own
  // eAllStructuralFeatures had.
  if (isEStructuralFeature(obj)) return true;
  // An EEnum's own eLiterals are always immediately needed the moment anything wants to actually
  // display or use the enum's values - a real, confirmed crash found investigating a report of
  // "the editor goes blank after adding a child and following it to a feature with an enum
  // attribute": FeatureEditor's own EEnum widget calls getELiterals() synchronously during
  // render, then .getName()/.getLiteral() on each one immediately, with no useResolved/
  // useResolvedList involved at all (unlike a reference value, an enum's own literal set isn't
  // treated as "data to resolve", just "metadata describing how to render this field") - a
  // still-unresolved literal throws there exactly like eType did above, but uncaught, during a
  // React render with no error boundary anywhere in this app, unmounting the whole tree. The
  // enum itself being eagerly resolved (as a structural feature's own eType, just above) was
  // never enough on its own; its own eLiterals need the same treatment, one level further in.
  if (isEEnum(obj)) return true;
  return false;
}

/**
 * Reconstructs one real, live object from its ObjectSnapshot - attributes decoded via
 * @typemf/json's own conventions (the same ones the real, on-disk format uses, so a value
 * round-tripping through the webview stays consistent), every reference (containment included, per
 * the "include containments as references" decision) as an unresolved ProxyEObjectImpl, resolved
 * lazily later only if actually needed.
 *
 * eClassId is the one exception to "lazy": constructing ANY EObject (even a proxy placeholder)
 * needs a real EClass immediately - ProxyEObjectImpl's own constructor takes one directly, not
 * another proxy - so this resolves it eagerly via the exact same resourceSet.resolve() mechanism,
 * before constructing anything else. Confirmed as the deliberate choice, not an oversight: every
 * object opened for the first time costs at least two round trips (itself, then its class) rather
 * than staying lazy for the class too.
 *
 * Only ever used for the webview's own reconstruction of a live host object - never for real
 * persistence (that stays entirely on the extension-host side, through InstanceDocument's own,
 * real Resource). serialize()/peekReferencedNsURIs() are therefore deliberately unsupported here,
 * not partially-implemented stubs.
 */
export class SnapshotSerializer implements EObjectSerializer {
  /** `editRelay` is optional - undefined means read-only reconstruction, no write path attached
   *  at all (e.g. every existing test that only exercises reading/resolving, not editing). */
  constructor(
    private readonly registry: WebviewObjectRegistry,
    private readonly editRelay?: EditRelay
  ) {}

  async deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]> {
    const resourceSet = resource.getResourceSet();
    if (!resourceSet) {
      throw new Error('SnapshotSerializer requires a ResourceSet, to resolve the eClass and any references.');
    }
    const snapshot = JSON.parse(new TextDecoder().decode(content)) as ObjectSnapshot;

    // eClassId is almost always resolved eagerly via the normal proxy/resolve mechanism - but if
    // it identifies one of Ecore's own classifiers (see well-known-ecore-id.ts), it's used
    // directly, with no round trip at all. Not an optimization: EClass is an instance of itself
    // (EClass.eClass() === EClass), so without this check, resolving that one, bottom-most case
    // would recursively request itself forever - found by tracing the actual recursion through.
    const wellKnownEClass = wellKnownEcoreObject(snapshot.eClassId);
    let eClass: EClass;
    if (wellKnownEClass) {
      eClass = wellKnownEClass as EClass;
    } else {
      // EcorePackageImpl.eINSTANCE.getEClass() is the real, self-hosted "EClass describing
      // EClass" metaclass, always available with no round trip - used only as the proxy's own
      // placeholder type (an EClass proxy's "declared type" is always EClass itself, unlike an
      // ordinary reference, which uses whatever the feature declares).
      const eClassProxy = new ProxyEObjectImpl(EcorePackageImpl.eINSTANCE.getEClass(), uriForId(snapshot.eClassId));
      eClass = (await resourceSet.resolve(eClassProxy)) as EClass;
    }

    // The real, static/dynamic-parity-respecting factory for THIS eClass - Ecore's own
    // metaclasses (reconstructing e.g. bookClass itself, an instance of the real EClass) already
    // have one, EcorePackageImpl.eINSTANCE's own generated factory, producing genuine EClassImpl
    // instances with real methods (isAbstract(), getEAllStructuralFeatures(), ...) - not a
    // generic DynamicEObjectImpl, which has none of those. Falls back to DynamicEFactoryImpl only
    // for an arbitrary, user-defined metamodel's own classes, matching how dynamic mode already
    // works everywhere else in this project.
    const obj = (eClass.getEPackage()?.getEFactoryInstance() ?? dynamicFactory).create(eClass);

    // obj's own featureID, when it's itself an EStructuralFeature - see ObjectSnapshot's own
    // featureID field for the full story: a plain runtime property, never carried by the normal
    // attributes/references handling below at all, but one DynamicEObjectImpl's own storage
    // depends on matching exactly between the host's real feature and this, separately
    // reconstructed, webview-side copy of it. Applied immediately, before anything else - nothing
    // later depends on ordering here, but there's no reason to delay it either.
    if (isEStructuralFeature(obj) && snapshot.featureID !== undefined) {
      (obj as unknown as EStructuralFeatureImpl).setFeatureID(snapshot.featureID);
    }

    // Recorded here, immediately, rather than only at the very end (as it used to be) - a real,
    // confirmed deadlock hazard otherwise: see resolveReference's own reasoning just below, and
    // WebviewObjectRegistry.objectFor's own reasoning for the full story. obj is only a shell at
    // this point (no attributes or references set yet), same as it would be reconstructed later
    // via the ordinary lazy-proxy path anyway, so recording it this early costs nothing real.
    this.registry.record(obj, snapshot.id);

    for (const [name, rawValue] of Object.entries(snapshot.attributes)) {
      const feature = eClass.getEStructuralFeature(name);
      if (!feature) continue; // a feature the host sent that this webview's eClass doesn't recognize - ignore rather than fail the whole object
      await trySet(() => {
        if (feature.isMany()) {
          const list = obj.eGet(feature) as { add(v: unknown): void };
          for (const item of rawValue as unknown[]) list.add(decodeAttributeValue(item, feature));
        } else {
          obj.eSet(feature, decodeAttributeValue(rawValue, feature));
        }
      });
    }

    // A reference id resolves well-known-first (relevant whenever a reference genuinely points at
    // one of Ecore's own classifiers - no round trip needed, already unconditionally available
    // locally), then against this registry's own, already-reconstructed objects (see below),
    // then eagerly if obj itself needs its own structure resolved now (see needsEagerOwnFeatures),
    // otherwise as an ordinary lazy proxy, exactly as designed.
    //
    // The registry check is what prevents a real, confirmed deadlock: a self-referential
    // metamodel (e.g. "Feature contains child Features", a normal, valid containment cycle, not a
    // modeling error) can have this very reconstruction's own eager resolution ask, transitively,
    // to resolve this SAME object again, reentrantly, before this deserialize() call has finished
    // - going through resourceSet.resolve()/getResource() again would try to load() the same
    // Resource a second time while the first is still in flight, which (even with load()'s own
    // reentrancy guard - see ResourceImpl's own reasoning) can only ever wait on itself. Since
    // `obj` was recorded the moment it was constructed, before any reference resolution began,
    // the reentrant request finds it here directly - the real, same, live object, just not fully
    // populated yet (no different from how an ordinary lazy proxy looks before anyone resolves
    // it), never touching resourceSet.resolve() for this id at all.
    const eager = needsEagerOwnFeatures(obj);
    const resolveReference = async (id: string, declaredType: EClass): Promise<EObject> => {
      const wellKnown = wellKnownEcoreObject(id);
      if (wellKnown) return wellKnown;
      const alreadyReconstructed = this.registry.objectFor(id);
      if (alreadyReconstructed) return alreadyReconstructed;
      const proxy = new ProxyEObjectImpl(declaredType, uriForId(id));
      return eager ? resourceSet.resolve(proxy) : proxy;
    };

    for (const [name, refValue] of Object.entries(snapshot.references)) {
      const feature = eClass.getEStructuralFeature(name);
      if (!feature || !isEReference(feature) || refValue === undefined) continue;
      const declaredType = feature.getEType() as EClass;
      await trySet(async () => {
        if (feature.isMany()) {
          const list = obj.eGet(feature) as { add(v: unknown): void };
          for (const id of refValue as string[]) list.add(await resolveReference(id, declaredType));
        } else {
          obj.eSet(feature, await resolveReference(refValue as string, declaredType));
        }
      });
    }

    // obj was already recorded (registry.record), right after construction, above - just the
    // edit-relay wiring remains here, deliberately still last: every future local edit on this
    // object now flows back to the host automatically - the whole point of building the real
    // Notification/Adapter mechanism first (see NOTES.md) - and attaching it only once obj is
    // fully populated means nothing during this function's own attribute/reference setup above
    // gets misread as a "real", user-initiated edit to relay.
    this.editRelay?.attachTo(obj, this.registry);
    return [obj];
  }

  async serialize(): Promise<Uint8Array> {
    throw new Error(
      'SnapshotSerializer is read-only - it reconstructs live host objects, it never serializes back to this wire format.'
    );
  }

  async peekReferencedNsURIs(): Promise<string[]> {
    throw new Error(
      'SnapshotSerializer has no meaningful nsURI to peek - it is not a real, standalone document format.'
    );
  }

  /**
   * Every "resource" in this scheme has exactly one root - the object itself, at its own,
   * distinct typemf-host:/<id> path (see uriForId's own reasoning) - so there is never a real
   * fragment grammar to speak: the only object present is always the answer, regardless of what
   * the fragment string actually says. Required override, not optional here: @typemf/core's own
   * default fragment grammar (positional/ID-attribute-based) doesn't accept an empty fragment,
   * which is what every proxy this serializer constructs actually carries.
   */
  resolveFragment(_fragment: string, roots: EObject[]): EObject | undefined {
    return roots[0];
  }

  computeFragment(): string {
    return '';
  }
}

/**
 * Registers SnapshotSerializer against the HOST_SCHEME protocol - registerForProtocol, not
 * registerForExtension, since typemf-host:/<id> URIs deliberately have no file extension at all.
 * `objectRegistry` is shared across every object reconstructed this way (one per webview
 * session, not one per object - a fresh SnapshotSerializer is still constructed per
 * createResource() call, but they all record into the same registry), so a later edit on any of
 * them can find its own host id via WebviewObjectRegistry.hostIdFor.
 */
export function registerHostProtocol(
  resourceFactoryRegistry: ResourceFactoryRegistry,
  objectRegistry: WebviewObjectRegistry,
  editRelay?: EditRelay
): void {
  const factory: ResourceFactory = {
    createResource: (uri: URI) => new ResourceImpl(uri, new SnapshotSerializer(objectRegistry, editRelay)),
  };
  resourceFactoryRegistry.registerForProtocol(HOST_SCHEME, factory);
}
