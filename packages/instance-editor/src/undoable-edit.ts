import { EList, EObject, EStructuralFeature } from '@typemf/core';

/** One user-visible edit step on the real document, reversible in both directions. */
export interface UndoableEdit {
  label: string;
  undo(): void;
  redo(): void;
}

type FeatureState = { many: true; items: unknown[] } | { many: false; isSet: boolean; value: unknown };

function captureState(obj: EObject, feature: EStructuralFeature): FeatureState {
  if (feature.isMany()) return { many: true, items: (obj.eGet(feature) as EList<unknown>).toArray() };
  return { many: false, isSet: obj.eIsSet(feature), value: obj.eGet(feature) };
}

function restoreState(obj: EObject, feature: EStructuralFeature, state: FeatureState): void {
  if (state.many) {
    const list = obj.eGet(feature) as EList<unknown>;
    list.clear();
    list.addAll(state.items);
  } else if (state.isSet) {
    obj.eSet(feature, state.value);
  } else {
    obj.eUnset(feature);
  }
}

/**
 * Runs `apply` - one mutation of `obj`'s `feature` - and returns the edit that reverses (and
 * replays) it, built from the feature's state before and after rather than from the kind of
 * mutation: SET, UNSET, ADD, REMOVE and "add child" all undo the same way, and restoring through
 * the normal eSet/list operations lets the core keep containers and opposites consistent. If
 * `apply` throws, nothing was recorded and the error propagates.
 */
export function applyAsUndoableEdit(
  obj: EObject,
  feature: EStructuralFeature,
  label: string,
  apply: () => void
): UndoableEdit {
  const before = captureState(obj, feature);
  apply();
  const after = captureState(obj, feature);
  return {
    label,
    undo: () => restoreState(obj, feature, before),
    redo: () => restoreState(obj, feature, after),
  };
}
