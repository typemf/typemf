import { EcorePackageImpl, EPackageImpl, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { TypeMfRuntime } from '../typemf-runtime.js';

// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

describe('TypeMfRuntime', () => {
  it('registers the JSON, XMI and Ecore formats and the Ecore metamodel by default', () => {
    const runtime = new TypeMfRuntime();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.json'))).toBeDefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.xmi'))).toBeDefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.ecore'))).toBeDefined();
    expect(runtime.packageRegistry.getPackage(EcorePackageImpl.eINSTANCE.getNsURI()!)).toBe(EcorePackageImpl.eINSTANCE);
  });

  it('registers nothing when registerDefaults is false', () => {
    const runtime = new TypeMfRuntime({ registerDefaults: false });
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.json'))).toBeUndefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.xmi'))).toBeUndefined();
    expect(runtime.resourceFactoryRegistry.getFactory(URI.createFileURI('model.ecore'))).toBeUndefined();
    expect(runtime.packageRegistry.getPackage(EcorePackageImpl.eINSTANCE.getNsURI()!)).toBeUndefined();
  });

  it('starts with an empty uriConverterRegistry', () => {
    const runtime = new TypeMfRuntime();
    expect(runtime.uriConverterRegistry.getConverters()).toHaveLength(0);
  });

  it('createResourceSet() uses the registries of the runtime', () => {
    const runtime = new TypeMfRuntime();
    const resourceSet = runtime.createResourceSet();
    expect(resourceSet.getPackageRegistry()).toBe(runtime.packageRegistry);
    expect(resourceSet.getResourceFactoryRegistry()).toBe(runtime.resourceFactoryRegistry);
    expect(resourceSet.getUriConverterRegistry()).toBe(runtime.uriConverterRegistry);
  });

  it('resource sets of the same runtime share their registries', () => {
    const runtime = new TypeMfRuntime();
    const first = runtime.createResourceSet();
    const second = runtime.createResourceSet();
    const pkg = new EPackageImpl();
    pkg.setNsURI('https://example.com/shared');
    first.getPackageRegistry().register(pkg);
    expect(second.getPackageRegistry().getPackage('https://example.com/shared')).toBe(pkg);
  });
});
