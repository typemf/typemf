import { EList, EObject, EStructuralFeature } from '@typemf/core';
import { decodeAttributeValue } from '@typemf/json';
import { ApplyEditError, ApplyEditRequest, ApplyEditResponse } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';
import { applyAsUndoableEdit, UndoableEdit } from './undoable-edit.js';

function decodeWireValue(request: ApplyEditRequest, feature: EStructuralFeature, objectIds: ObjectIdMap): unknown {
  const value = request.value;
  if (!value) return undefined;
  if ('ref' in value) {
    const target = objectIds.objectFor(value.ref);
    if (!target) throw new Error(`No object known for referenced id '${value.ref}'.`);
    return target;
  }
  return decodeAttributeValue(value.primitive, feature);
}

/**
 * Applies one already-relayed webview edit to the real object - or produces a clear
 * ApplyEditError if it can't (an unknown objectId/featureId, or a referenced value the host
 * doesn't recognize). Pure logic, no vscode dependency, same shape as handleGetObjectRequest's
 * own `{ objectIds }` narrowing and the same reasoning for it (InstanceDocument's own vscode.Uri
 * can't be constructed outside a real extension host).
 *
 * Applying the real edit here fires this object's own, real onDidChange notifications too (via
 * the generated eSet/eUnset/BasicEList machinery, unchanged) - which is what eventually marks the
 * document dirty via onDidChangeCustomDocument, separately, in InstanceEditorProvider itself.
 * `onEdit` receives the undoable record of a successful edit (see undoable-edit.ts).
 */
export function handleApplyEditRequest(
  request: ApplyEditRequest,
  document: { objectIds: ObjectIdMap },
  onEdit?: (edit: UndoableEdit) => void
): ApplyEditResponse | ApplyEditError {
  const fail = (message: string): ApplyEditError => ({
    type: 'typemf/applyEditError',
    requestId: request.requestId,
    message,
  });

  const obj = document.objectIds.objectFor(request.objectId);
  if (!obj) return fail(`No object known for id '${request.objectId}'.`);
  const feature = document.objectIds.objectFor(request.featureId) as EStructuralFeature | undefined;
  if (!feature) return fail(`No feature known for id '${request.featureId}'.`);

  try {
    const edit = applyAsUndoableEdit(obj, feature, `${request.eventType} ${feature.getName()}`, () => {
      switch (request.eventType) {
        case 'SET':
          obj.eSet(feature, decodeWireValue(request, feature, document.objectIds));
          break;
        case 'UNSET':
          obj.eUnset(feature);
          break;
        case 'ADD': {
          const list = obj.eGet(feature) as EList<unknown>;
          const value = decodeWireValue(request, feature, document.objectIds);
          if (request.position !== undefined) list.addAt(request.position, value);
          else list.add(value);
          break;
        }
        case 'REMOVE': {
          const list = obj.eGet(feature) as EList<EObject>;
          const value = decodeWireValue(request, feature, document.objectIds) as EObject;
          list.remove(value);
          break;
        }
      }
    });
    onEdit?.(edit);
  } catch (err) {
    return fail((err as Error).message);
  }

  return { type: 'typemf/applyEditResult', requestId: request.requestId };
}
