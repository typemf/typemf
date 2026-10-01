import { EcorePackageImpl, EClassImpl, EPackageImpl, EPackageRegistryImpl } from '@typemf/core';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TypeMfRuntimeApi } from 'vscode-runtime';
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

  it('static mode: re-resolves the real EClass from the runtime\'s own packageRegistry', async () => {
    const pkg = new EPackageImpl();
    pkg.setName('library');
    pkg.setNsURI('https://example.com/library');
    const bookClass = new EClassImpl();
    bookClass.setName('Book');
    pkg.getEClassifiers().add(bookClass);
    bookClass.setEPackage(pkg);
    const registry = new EPackageRegistryImpl();
    registry.register(pkg);

    // The fragment is the plain, un-encoded JSON string - matching what vscode.Uri's own
    // `fragment` property already provides, decoded, on both ends of the real round trip (see
    // buildNewInstanceUri's own reasoning).
    const fragment = JSON.stringify(encodeStaticSpec(bookClass, pkg));

    const resolved = await resolveNewInstanceSpec({ fragment }, fakeRuntime(registry));
    expect(resolved).toBe(bookClass);
  });

  it('static mode: returns undefined if the package is no longer registered', async () => {
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

  it('dynamic mode: re-resolves by reloading the same .ecore file from disk', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'new-instance-spec-'));
    const filePath = join(dir, 'library.ecore');
    writeFileSync(filePath, SAMPLE_ECORE);

    try {
      // Only the class name and file path are encoded - the original EClass object here stands
      // in for "whatever was picked interactively," never actually read by encodeDynamicSpec
      // beyond its own name.
      const placeholderClass = new EClassImpl();
      placeholderClass.setName('Book');
      const fragment = JSON.stringify(encodeDynamicSpec(placeholderClass, filePath));

      const resolved = await resolveNewInstanceSpec({ fragment }, fakeRuntime(new EPackageRegistryImpl()));
      expect(resolved?.getName()).toBe('Book');
      expect(resolved).not.toBe(placeholderClass); // genuinely re-loaded fresh, not the same object
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns undefined for malformed JSON in the fragment, rather than throwing', async () => {
    const result = await resolveNewInstanceSpec({ fragment: 'not-valid-json' }, fakeRuntime(new EPackageRegistryImpl()));
    expect(result).toBeUndefined();
  });

  it('real nsURI values containing "." (e.g. the real Ecore namespace) round-trip correctly - the exact shape of the real, reported regression', async () => {
    // The real bug this guards against: a query-string encoding of this exact spec (a real nsURI
    // like "http://www.eclipse.org/emf/2002/Ecore" contains "." characters) corrupted
    // @typemf/core's own getFileExtension() once the full uri.toString() reached it, since that
    // URI class has no concept of a query string at all. The fragment never has this problem -
    // this test's only real point is confirming the round trip itself still works correctly for
    // exactly the kind of value that broke it.
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
