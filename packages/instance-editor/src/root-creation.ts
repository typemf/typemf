import { EcoreFactoryImpl, EObject, EPackage, Resource } from '@typemf/core';
import { UndoableEdit } from './undoable-edit.js';

/**
 * Whether `content` is an empty or whitespace-only file - what VS Code's "New File" creates.
 * Such a file loads as a document without roots, and the editor offers to create one.
 */
export function isBlankContent(content: Uint8Array): boolean {
  return new TextDecoder().decode(content).trim() === '';
}

/**
 * The name for the root package of a new `.ecore` file: its file name without the extension, with
 * every character that is not allowed in an identifier replaced by `_`. `"my-model.ecore"` gives
 * `"my_model"`.
 */
export function packageNameFor(fileName: string): string {
  const base = fileName.replace(/\.[^.]*$/, '');
  const name = base.replace(/[^A-Za-z0-9_]/g, '_');
  if (name === '') return 'model';
  return /^[0-9]/.test(name) ? `_${name}` : name;
}

/** A new root `EPackage` for a `.ecore` file named `fileName`, with name and nsPrefix set. */
export function newEcoreRootPackage(fileName: string): EPackage {
  const pkg = EcoreFactoryImpl.eINSTANCE.createEPackage();
  const name = packageNameFor(fileName);
  pkg.setName(name);
  pkg.setNsPrefix(name);
  return pkg;
}

/** Adds `root` to `resource`'s contents and returns the edit that removes and re-adds it. */
export function addRootAsUndoableEdit(resource: Resource, root: EObject): UndoableEdit {
  const contents = resource.getContents();
  contents.add(root);
  return {
    label: 'Create root element',
    undo: () => contents.remove(root),
    redo: () => contents.add(root),
  };
}
