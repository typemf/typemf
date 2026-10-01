import { EcorePackageImpl, EPackageImpl, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { TypeMfRuntime } from '../typemf-runtime.js';

// See @typemf/generator's NOTES.md (point 6/7): every generated setter routes through
// getEcorePackageRef(), which needs Ecore's own metaclass system bootstrapped first - this
// triggers that safely, once, before any test below constructs a raw metaclass instance
// (new EPackageImpl() below).
void EcorePackageImpl.eINSTANCE;

describe('TypeMfRuntime', () => {
  it('registers json/xmi/ecore formats, and Ecore\'s own metamodel, by default', () => {
    const runtime = new TypeMfRuntime();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.json'))).toBeDefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.xmi'))).toBeDefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.ecore'))).toBeDefined();
    // Ecore is foundational, not an arbitrary domain metamodel someone opts into - see
    // register-ecore-metamodel.ts's own reasoning for why this is registered by default too.
    expect(runtime.packageRegistry.getPackage(EcorePackageImpl.eINSTANCE.getNsURI()!)).toBe(EcorePackageImpl.eINSTANCE);
  });

  it('registers nothing - not even Ecore\'s own metamodel - when registerDefaults: false is passed', () => {
    const runtime = new TypeMfRuntime({ registerDefaults: false });
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.json'))).toBeUndefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.xmi'))).toBeUndefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.ecore'))).toBeUndefined();
    expect(runtime.packageRegistry.getPackage(EcorePackageImpl.eINSTANCE.getNsURI()!)).toBeUndefined();
  });

  it('starts with an empty, but real and shared, uriConverterRegistry', () => {
    const runtime = new TypeMfRuntime();
    expect(runtime.uriConverterRegistry.getConverters()).toHaveLength(0);
  });

  it('createResourceSet() wires all three registries, shared with the runtime itself', () => {
    const runtime = new TypeMfRuntime();
    const resourceSet = runtime.createResourceSet();
    expect(resourceSet.getPackageRegistry()).toBe(runtime.packageRegistry);
    expect(resourceSet.getResourceFactoryRegistry()).toBe(runtime.resourceFactoryRegistry);
    expect(resourceSet.getUriConverterRegistry()).toBe(runtime.uriConverterRegistry);
  });

  it('two ResourceSets from the same runtime share the same registries - registering a package via one is visible via the other', () => {
    const runtime = new TypeMfRuntime();
    const first = runtime.createResourceSet();
    const second = runtime.createResourceSet();
    const pkg = new EPackageImpl();
    pkg.setNsURI('https://example.com/shared');
    first.getPackageRegistry().register(pkg);
    expect(second.getPackageRegistry().getPackage('https://example.com/shared')).toBe(pkg);
  });
});
