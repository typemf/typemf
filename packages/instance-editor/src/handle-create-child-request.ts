import { EClass, EList, EStructuralFeature, isEReference } from '@typemf/core';
import { CreateChildError, CreateChildRequest, CreateChildResponse } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';
import { applyAsUndoableEdit, UndoableEdit } from './undoable-edit.js';

/**
 * Creates a new instance of request.classId and adds it to request.parentId's own
 * request.featureId, atomically - the real, connected object, added via the real
 * containment list (or eSet, for a single-valued feature), so it's already a genuine part of the
 * document the moment this returns; nothing provisional or detached about it. `onEdit` receives
 * the undoable record of the add (see undoable-edit.ts). Same
 * `{ objectIds }` narrowing as the other handlers, for the same reason.
 */
export function handleCreateChildRequest(
  request: CreateChildRequest,
  document: { objectIds: ObjectIdMap },
  onEdit?: (edit: UndoableEdit) => void
): CreateChildResponse | CreateChildError {
  const fail = (message: string): CreateChildError => ({
    type: 'typemf/createChildError',
    requestId: request.requestId,
    message,
  });

  const parent = document.objectIds.objectFor(request.parentId);
  if (!parent) return fail(`No object known for id '${request.parentId}'.`);

  const feature = document.objectIds.objectFor(request.featureId) as EStructuralFeature | undefined;
  if (!feature || !isEReference(feature)) return fail(`No reference feature known for id '${request.featureId}'.`);
  if (!feature.isContainment())
    return fail(`Feature '${feature.getName()}' is not a containment reference - cannot create a child through it.`);

  const eClass = document.objectIds.objectFor(request.classId) as EClass | undefined;
  if (!eClass) return fail(`No class known for id '${request.classId}'.`);

  const factory = eClass.getEPackage()?.getEFactoryInstance();
  if (!factory)
    return fail(`'${eClass.getName()}''s EPackage has no EFactoryInstance registered - cannot construct an instance.`);

  const child = factory.create(eClass);

  try {
    const edit = applyAsUndoableEdit(parent, feature, `Add ${eClass.getName()} to ${feature.getName()}`, () => {
      if (feature.isMany()) {
        const list = parent.eGet(feature) as EList<unknown>;
        if (request.position !== undefined) list.addAt(request.position, child);
        else list.add(child);
      } else {
        parent.eSet(feature, child);
      }
    });
    onEdit?.(edit);
  } catch (err) {
    return fail((err as Error).message);
  }

  return { type: 'typemf/createChildResult', requestId: request.requestId, childId: document.objectIds.idFor(child) };
}
