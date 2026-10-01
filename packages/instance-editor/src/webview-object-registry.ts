import { EObject } from '@typemf/core';
import { wellKnownEcoreId } from './well-known-ecore-id.js';

/**
 * The webview side's own counterpart to ObjectIdMap - but it never mints anything itself, only
 * remembers ids the host already assigned (see the earlier design discussion: "the webview side:
 * doesn't assign anything - it only ever receives IDs the host already minted"). SnapshotSerializer
 * records every object here the moment it reconstructs one, using that object's own snapshot.id -
 * needed so a later local edit (obj.eSet(...) called from the webview's own UI code) can be
 * translated back into "which host object does this correspond to" when relaying the edit.
 */
export class WebviewObjectRegistry {
  private readonly hostIdByObject = new WeakMap<EObject, string>();
  private readonly objectByHostId = new Map<string, EObject>();

  /** Records that `obj` (just reconstructed by SnapshotSerializer) corresponds to `hostId`. */
  record(obj: EObject, hostId: string): void {
    this.hostIdByObject.set(obj, hostId);
    this.objectByHostId.set(hostId, obj);
  }

  /**
   * The host-side id for a locally-reconstructed object - checking the well-known Ecore scheme
   * first (the same object on both sides, needing no recording at all - see well-known-ecore-id.ts),
   * then this registry's own recorded ids. Undefined only if `obj` was never actually reconstructed
   * through SnapshotSerializer at all (e.g. a plain, locally-created object with no host
   * counterpart) - relaying an edit for such an object is meaningless, since the host has nothing
   * to apply it to.
   */
  hostIdFor(obj: EObject): string | undefined {
    return wellKnownEcoreId(obj) ?? this.hostIdByObject.get(obj);
  }

  /**
   * The reverse of hostIdFor - the already-reconstructed local object for a host id, if this
   * registry has one on record. Exists specifically so SnapshotSerializer can check "is this id
   * already being (or already been) reconstructed" BEFORE going through the normal, full
   * ResourceSet.resolve()/getResource() machinery for it - a real, confirmed deadlock hazard
   * otherwise: a self-referential metamodel (e.g. a "Feature contains child Features" style
   * containment cycle - a normal, valid pattern, not a modeling error) can have one classifier's
   * own eager resolution ask, transitively, to resolve that very same classifier again while its
   * own reconstruction is still in progress; going through resolve() again would try to load the
   * same not-yet-finished Resource a second time, which can never finish waiting on itself.
   * SnapshotSerializer records the shell here (see its own reasoning) as soon as it exists, before
   * any reference resolution starts, so a reentrant request finds and reuses that same, real
   * object directly - possibly still only partially populated at that moment, exactly as happens
   * for any ordinary lazy proxy too (nothing here is otherwise any less complete or valid).
   */
  objectFor(hostId: string): EObject | undefined {
    return this.objectByHostId.get(hostId);
  }
}
