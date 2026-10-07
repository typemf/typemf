import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EClass,
  EClassImpl,
  EcorePackageImpl,
  EEnum,
  EList,
  EObject,
  EPackage,
  EPackageImpl,
  EReferenceImpl,
  ResourceSetImpl,
  URI,
  UriConverter,
} from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { describe, expect, it } from 'vitest';
import { registerXmiFormat } from '../xmi-resource-factory.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

/**
 * A reference into a document of another format uses the fragment syntax of
 * the target's format. The tests check the written bytes and resolve the
 * reference from a fresh ResourceSet.
 */

class InMemoryUriConverter implements UriConverter {
  private readonly store = new Map<string, Uint8Array>();
  canHandle(uri: URI): boolean {
    return uri.getScheme() === 'mem';
  }
  async readBinary(uri: URI): Promise<Uint8Array> {
    const content = this.store.get(uri.trimFragment().toString());
    if (!content) throw new Error(`No content stored for '${uri.toString()}'.`);
    return content;
  }
  async writeBinary(uri: URI, content: Uint8Array): Promise<void> {
    this.store.set(uri.trimFragment().toString(), content);
  }
  async exists(uri: URI): Promise<boolean> {
    return this.store.has(uri.trimFragment().toString());
  }
}

function newResourceSet(converter: UriConverter): ResourceSetImpl {
  const rs = new ResourceSetImpl();
  rs.getUriConverterRegistry().register(converter);
  registerJsonFormat(rs.getResourceFactoryRegistry());
  registerXmiFormat(rs.getResourceFactoryRegistry());
  return rs;
}

describe('Cross-format references (JSON <-> XMI)', () => {
  it('a JSON document references an object in an XMI document', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // The Book lives in an XMI document.
    const xmiUri = URI.parse('mem:library.xmi');
    const xmiResource = rs.createResource(xmiUri);
    const xmiLibrary = createInstanceOf(libraryClass);
    const untitledBook = createInstanceOf(bookClass); // no ID -> exercises EMF's positional grammar specifically
    (xmiLibrary.eGet(booksRef) as { add(v: EObject): void }).add(untitledBook);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    // A JSON document references it.
    const jsonUri = URI.parse('mem:refs.json');
    const jsonResource = rs.createResource(jsonUri);
    const jsonLibrary = createInstanceOf(libraryClass);
    jsonLibrary.eSet(featuredBookRef, untitledBook);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    // The fragment uses the XMI syntax of the target document.
    const rawJson = JSON.parse(new TextDecoder().decode(await converter.readBinary(jsonUri)));
    expect(rawJson.$roots[0].featuredBook.$ref).toBe('library.xmi#//@books.0');

    // Resolve it back, from a fresh ResourceSet.
    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedJson = await freshSet.getResource(jsonUri, true);
    const proxy = loadedJson!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(proxy.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eClass()).toBe(bookClass);
  });

  it('an XMI document references an object in a JSON document', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // The Book lives in a JSON document.
    const jsonUri = URI.parse('mem:library.json');
    const jsonResource = rs.createResource(jsonUri);
    const jsonLibrary = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (jsonLibrary.eGet(booksRef) as { add(v: EObject): void }).add(book);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    // An XMI document references it.
    const xmiUri = URI.parse('mem:refs.xmi');
    const xmiResource = rs.createResource(xmiUri);
    const xmiLibrary = createInstanceOf(libraryClass);
    xmiLibrary.eSet(featuredBookRef, book);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    // The fragment uses the JSON syntax of the target document ("Book_Dune", not "Dune").
    const rawXmi = new TextDecoder().decode(await converter.readBinary(xmiUri));
    expect(rawXmi).toContain('<featuredBook href="library.json#Book_Dune"/>');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedXmi = await freshSet.getResource(xmiUri, true);
    const proxy = loadedXmi!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(proxy.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
  });
});

describe('JSON references to elements of a .ecore file', () => {
  const operation = (name: string, parameter?: string) =>
    parameter === undefined
      ? `<eOperations name="${name}"/>`
      : `<eOperations name="${name}"><eParameters name="${parameter}"/></eOperations>`;

  const api = (operations: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="api" nsURI="https://example.org/api" nsPrefix="api">
  <eClassifiers xsi:type="ecore:EEnum" name="Kind"><eLiterals name="OPEN"/></eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Problem">${operations.join('')}</eClassifiers>
</ecore:EPackage>`;

  /** A class Mapping with a many-valued reference `targets` to any named Ecore element. */
  function buildMappingPackage(): { pkg: EPackage; mappingClass: EClass; targets: EReferenceImpl } {
    const targets = new EReferenceImpl();
    targets.setName('targets');
    targets.setEType(EcorePackageImpl.eINSTANCE.getENamedElement());
    targets.setUpperBound(-1);
    const mappingClass = new EClassImpl();
    mappingClass.setName('Mapping');
    mappingClass.getEStructuralFeatures().add(targets);
    const pkg = new EPackageImpl();
    pkg.setName('mapping');
    pkg.setNsURI('https://example.org/mapping');
    pkg.setNsPrefix('mapping');
    pkg.getEClassifiers().add(mappingClass);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());
    return { pkg, mappingClass, targets };
  }

  it('writes name paths and resolves them after the operations are reordered', async () => {
    const converter = new InMemoryUriConverter();
    const apiUri = URI.parse('mem:/models/api.ecore');
    const mappingUri = URI.parse('mem:/models/mapping.json');
    const { pkg, mappingClass, targets } = buildMappingPackage();
    const newSet = () => {
      const rs = newResourceSet(converter);
      rs.getPackageRegistry().register(EcorePackageImpl.eINSTANCE);
      rs.getPackageRegistry().register(pkg);
      return rs;
    };
    await converter.writeBinary(
      apiUri,
      new TextEncoder().encode(api([operation('emptySolution'), operation('solve'), operation('solve', 'limit')]))
    );

    const rs = newSet();
    const apiPkg = (await rs.getResource(apiUri, true))!.getContents().get(0) as unknown as EPackage;
    const problem = apiPkg.getEClassifier('Problem') as EClass;
    const [emptySolution, , overload] = problem.getEOperations().toArray();
    const mapping = createInstanceOf(mappingClass);
    (mapping.eGet(targets) as EList<EObject>).addAll([
      emptySolution!,
      overload!,
      overload!.getEParameters().get(0),
      (apiPkg.getEClassifier('Kind') as EEnum).getELiterals().get(0),
    ]);
    const mappingResource = rs.createResource(mappingUri);
    mappingResource.getContents().add(mapping);
    await mappingResource.save();

    const raw = JSON.parse(new TextDecoder().decode(await converter.readBinary(mappingUri)));
    expect(raw.$roots[0].targets.map((t: { $ref: string }) => t.$ref)).toEqual([
      'api.ecore#//Problem/emptySolution',
      'api.ecore#//Problem/solve.1',
      'api.ecore#//Problem/solve.1/limit',
      'api.ecore#//Kind/OPEN',
    ]);

    // emptySolution moves to the end; a positional path would now point at another operation.
    await converter.writeBinary(
      apiUri,
      new TextEncoder().encode(api([operation('solve'), operation('solve', 'limit'), operation('emptySolution')]))
    );
    const freshSet = newSet();
    const loaded = (await freshSet.getResource(mappingUri, true))!.getContents().get(0);
    const resolved = await Promise.all(
      [...(loaded.eGet(targets) as EList<EObject>)].map((proxy) => freshSet.resolve(proxy))
    );
    const nameOf = (obj: EObject) => (obj as unknown as { getName(): string }).getName();
    expect(resolved.map(nameOf)).toEqual(['emptySolution', 'solve', 'limit', 'OPEN']);
    expect(resolved[2]!.eContainer()).toBe(resolved[1]);
  });
});
