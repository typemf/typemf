import { EcorePackageImpl, ResourceSetImpl, URI } from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { registerXmiFormat } from '@typemf/xmi';
import { describe, expect, it } from 'vitest';
import { addRootAsUndoableEdit, isBlankContent, newEcoreRootPackage, packageNameFor } from '../root-creation.js';

void EcorePackageImpl.eINSTANCE;

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('isBlankContent', () => {
  it('is true for empty and whitespace-only content, a byte order mark included', () => {
    expect(isBlankContent(new Uint8Array())).toBe(true);
    expect(isBlankContent(encode(' \n\t\r\n'))).toBe(true);
    expect(isBlankContent(encode('﻿\n'))).toBe(true);
  });

  it('is false as soon as there is any other character', () => {
    expect(isBlankContent(encode('{}'))).toBe(false);
    expect(isBlankContent(encode('  <'))).toBe(false);
  });
});

describe('packageNameFor', () => {
  it('uses the file name without extension', () => {
    expect(packageNameFor('library.ecore')).toBe('library');
  });

  it('replaces characters not allowed in an identifier', () => {
    expect(packageNameFor('my-model v2.ecore')).toBe('my_model_v2');
  });

  it('does not start with a digit', () => {
    expect(packageNameFor('2026.ecore')).toBe('_2026');
  });

  it('falls back to "model" for a name with nothing left', () => {
    expect(packageNameFor('.ecore')).toBe('model');
  });
});

describe('newEcoreRootPackage', () => {
  it('creates an EPackage named after the file', () => {
    const pkg = newEcoreRootPackage('shapes.ecore');
    expect(pkg.eClass()).toBe(EcorePackageImpl.eINSTANCE.getEPackage());
    expect(pkg.getName()).toBe('shapes');
    expect(pkg.getNsPrefix()).toBe('shapes');
  });
});

describe('addRootAsUndoableEdit', () => {
  function newResource(fileName: string) {
    const resourceSet = new ResourceSetImpl();
    registerXmiFormat(resourceSet.getResourceFactoryRegistry());
    registerJsonFormat(resourceSet.getResourceFactoryRegistry());
    return resourceSet.createResource(URI.parse(`mem:${fileName}`));
  }

  it('adds the root, and removes and re-adds it on undo and redo', () => {
    const resource = newResource('shapes.ecore');
    const root = newEcoreRootPackage('shapes.ecore');

    const edit = addRootAsUndoableEdit(resource, root);
    expect(resource.getContents().toArray()).toEqual([root]);
    expect(root.eResource()).toBe(resource);

    edit.undo();
    expect(resource.getContents().isEmpty()).toBe(true);
    expect(root.eResource()).toBeUndefined();

    edit.redo();
    expect(resource.getContents().toArray()).toEqual([root]);
  });

  it.each(['shapes.ecore', 'shapes.xmi', 'shapes.json'])(
    'gives a document that saves and loads again (%s)',
    async (fileName) => {
      const stored = new Map<string, Uint8Array>();
      const resourceSet = new ResourceSetImpl();
      resourceSet.getPackageRegistry().register(EcorePackageImpl.eINSTANCE);
      registerXmiFormat(resourceSet.getResourceFactoryRegistry());
      registerJsonFormat(resourceSet.getResourceFactoryRegistry());
      resourceSet.getUriConverterRegistry().register({
        canHandle: (uri) => uri.getScheme() === 'mem',
        readBinary: async (uri) => stored.get(uri.toString()) ?? new Uint8Array(),
        writeBinary: async (uri, content) => void stored.set(uri.toString(), content),
        exists: async (uri) => stored.has(uri.toString()),
      });
      const uri = URI.parse(`mem:${fileName}`);
      stored.set(uri.toString(), new Uint8Array());

      const resource = await resourceSet.getResource(uri, true);
      expect(resource!.getContents().isEmpty()).toBe(true);
      addRootAsUndoableEdit(resource!, newEcoreRootPackage(fileName));
      await resource!.save();
      expect(isBlankContent(stored.get(uri.toString())!)).toBe(false);

      await resource!.load();
      expect(resource!.getContents().size()).toBe(1);
      expect((resource!.getContents().get(0) as ReturnType<typeof newEcoreRootPackage>).getName()).toBe('shapes');
    }
  );
});
