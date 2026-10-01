import { EObject } from '@typemf/core';
import { wellKnownEcoreId, wellKnownEcoreObject } from './well-known-ecore-id.js';

/**
 * Assigns a stable, opaque ID to any EObject the moment it first crosses the webview boundary (an
 * instance, or a metaclass object like an EClass/EStructuralFeature - the same uniform scheme
 * applies to both, per the design discussion: filtering/identity should never depend on whether an
 * object happens to have a real ID attribute, since a user-editable attribute value can collide,
 * and fragments are positional-unstable for anything without one).
 *
 * Lives on InstanceDocument, one instance per open document - never shared globally, so IDs from
 * one document can never collide with or leak into another. The extension host is the only side
 * that ever mints IDs; the webview only ever remembers IDs it was told, via its own, separate,
 * webview-side bookkeeping.
 */
export class ObjectIdMap {
  private readonly idsByObject = new WeakMap<EObject, string>();
  private readonly objectsById = new Map<string, EObject>();
  private nextId = 1;

  /**
   * The object's existing ID if it's been seen before, otherwise a freshly-minted one - unless
   * `obj` is one of Ecore's own classifiers, in which case its well-known id (see
   * well-known-ecore-id.ts) is used directly, and nothing is minted or stored for it at all: it
   * needs no session-scoped bookkeeping, since it's already the same, identical object on both
   * sides of the boundary.
   */
  idFor(obj: EObject): string {
    const wellKnown = wellKnownEcoreId(obj);
    if (wellKnown) return wellKnown;
    const existing = this.idsByObject.get(obj);
    if (existing) return existing;
    const id = String(this.nextId++);
    this.idsByObject.set(obj, id);
    this.objectsById.set(id, obj);
    return id;
  }

  /**
   * The object a previously-issued ID refers to. For a well-known Ecore id, resolved directly,
   * locally, with no dependency on this map ever having issued it - see idFor's own reasoning.
   * Otherwise undefined if this map never issued it.
   */
  objectFor(id: string): EObject | undefined {
    return wellKnownEcoreObject(id) ?? this.objectsById.get(id);
  }
}
