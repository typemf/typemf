import { EcorePackageImpl, EClassImpl, EPackageImpl, EPackageRegistryImpl } from '@typemf/core';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { TypeMfRuntimeApi } from '@typemf/vscode-runtime';
import { encodeDynamicSpec, encodeStaticSpec, resolveNewInstanceSpec } from '../new-instance-spec.js';

void EcorePackageImpl.eINSTANCE;

const SAMPLE_ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    name="library" nsURI="https://example.com/library" nsPrefix="library">
  <eClassifiers xsi:type="ecore:EClass" name="Book"/>
</ecore:EPackage>
`;

function fakeRuntime(packageRegistry: EPackageRegistryImpl): TypeMfRuntimeApi {
  return { packageRegistry } as unknown as TypeMfRuntimeApi;
}

describe('resolveNewInstanceSpec', () => {
  it('returns undefined for a fragment with no spec at all', async () => {
    const result = await resolveNewInstanceSpec({ fragment: undefined }, fakeRuntime(new EPackageRegistryImpl()));
    expect(result).toBeUndefined();
  });

  it("static mode: resolves the EClass from the runtime's package registry", async () => {
    const pkg = new EPackageImpl();
    pkg.setName('library');
    pkg.setNsURI('https://example.com/library');
    const bookClass = new EClassImpl();
    bookClass.setName('Book');
    pkg.getEClassifiers().add(bookClass);
    bookClass.setEPackage(pkg);
    const registry = new EPackageRegistryImpl();
    registry.register(pkg);

    // vscode.Uri provides the fragment decoded.
    const fragment = JSON.stringify(encodeStaticSpec(bookClass, pkg));

    const resolved = await resolveNewInstanceSpec({ fragment }, fakeRuntime(registry));
    expect(resolved).toBe(bookClass);
  });

  it('static mode: returns undefined when the package is not registered', async () => {
    const pkg = new EPackageImpl();
    pkg.setName('library');
    pkg.setNsURI('https://example.com/library');
    const bookClass = new EClassImpl();
    bookClass.setName('Book');
    pkg.getEClassifiers().add(bookClass);

    const fragment = JSON.stringify(encodeStaticSpec(bookClass, pkg));

    // A fresh, empty registry - the package was never (re-)registered into it.
    const resolved = await resolveNewInstanceSpec({ fragment }, fakeRuntime(new EPackageRegistryImpl()));
    expect(resolved).toBeUndefined();
  });

  it('dynamic mode: reloads the .ecore file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'new-instance-spec-'));
    const filePath = join(dir, 'library.ecore');
    writeFileSync(filePath, SAMPLE_ECORE);

    try {
      // Only the class name and file path are encoded.
      const placeholderClass = new EClassImpl();
      placeholderClass.setName('Book');
      const fragment = JSON.stringify(encodeDynamicSpec(placeholderClass, filePath));

      const resolved = await resolveNewInstanceSpec({ fragment }, fakeRuntime(new EPackageRegistryImpl()));
      expect(resolved?.getName()).toBe('Book');
      expect(resolved).not.toBe(placeholderClass); // reloaded, not the same object
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns undefined for malformed JSON', async () => {
    const result = await resolveNewInstanceSpec(
      { fragment: 'not-valid-json' },
      fakeRuntime(new EPackageRegistryImpl())
    );
    expect(result).toBeUndefined();
  });

  it('round-trips nsURIs that contain dots', async () => {
    const pkg = new EPackageImpl();
    pkg.setName('ecore');
    pkg.setNsURI('http://www.eclipse.org/emf/2002/Ecore');
    const epackageClass = new EClassImpl();
    epackageClass.setName('EPackage');
    pkg.getEClassifiers().add(epackageClass);
    epackageClass.setEPackage(pkg);
    const registry = new EPackageRegistryImpl();
    registry.register(pkg);

    const fragment = JSON.stringify(encodeStaticSpec(epackageClass, pkg));
    const resolved = await resolveNewInstanceSpec({ fragment }, fakeRuntime(registry));
    expect(resolved).toBe(epackageClass);
  });
});
