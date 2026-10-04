import { EList, EObject, isEReference, isEStructuralFeature } from '@typemf/core';
import { encodeAttributeValue } from '@typemf/json';
import { ObjectIdMap } from './object-id-map.js';

/**
 * The wire shape for one object crossing the webview boundary. Deliberately per-object, not
 * per-document (unlike @typemf/json's own serialize(), which turns a whole document into bytes) -
 * this is the shape the design settled on for the instance editor's own protocol specifically, not
 * a general-purpose serialization format.
 */
export interface ObjectSnapshot {
  /** This object's own opaque ID (see ObjectIdMap). */
  id: string;
  /** Its EClass's own opaque ID - resolved via the exact same, uniform ID scheme as everything
   *  else (including instances), not @typemf/json's own namespace/name EClassRef shape. */
  eClassId: string;
  /** Feature name -> encoded value (or array of values, many-valued), non-reference features only. */
  attributes: Record<string, unknown>;
  /** Feature name -> id (or ids, many-valued) - every reference feature, containment included,
   *  per the "include containments as references" decision - no EObject value ever appears
   *  directly in attributes. */
  references: Record<string, string | string[] | undefined>;
  /**
   * Set only when obj is itself an EStructuralFeature - its own getFeatureID(), explicitly
   * carried across, since it's a plain runtime property, not a real, Ecore-modeled feature of
   * EStructuralFeature itself (never iterated by getEAllStructuralFeatures(), never part of
   * attributes/references above at all). A real, confirmed gap: DynamicEObjectImpl's own storage
   * is a single Map<featureID, value> (see its own reasoning), so the webview's own, separately
   * reconstructed copy of a feature NEEDS the exact same featureID the host's real one has -
   * without this, every reconstructed feature on a dynamically-loaded class defaulted to the same
   * sentinel id and silently collided, each one clobbering the last.
   */
  featureID?: number;
}

export function snapshotObject(obj: EObject, ids: ObjectIdMap): ObjectSnapshot {
  const eClass = obj.eClass();
  const attributes: Record<string, unknown> = {};
  const references: Record<string, string | string[] | undefined> = {};

  for (const feature of eClass.getEAllStructuralFeatures()) {
    const name = feature.getName();
    if (!name) continue; // a real, registered feature always has one; defensive only
    const value = obj.eGet(feature);

    if (isEReference(feature)) {
      if (feature.isMany()) {
        references[name] = [...(value as EList<EObject>)].map((item) => ids.idFor(item));
      } else {
        references[name] = value === undefined ? undefined : ids.idFor(value as EObject);
      }
    } else if (feature.isMany()) {
      attributes[name] = [...(value as EList<unknown>)].map((item) => encodeAttributeValue(item, feature));
    } else {
      attributes[name] = encodeAttributeValue(value, feature);
    }
  }

  return {
    id: ids.idFor(obj),
    eClassId: ids.idFor(eClass),
    attributes,
    references,
    featureID: isEStructuralFeature(obj) ? obj.getFeatureID() : undefined,
  };
}
