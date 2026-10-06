import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EAttributeImpl,
  EClass,
  EcorePackageImpl,
  EClassImpl,
  EDataTypeImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EcoreFactoryImpl,
  EPackageImpl,
  EReferenceImpl,
  ResourceSetImpl,
  URI,
  UriConverter,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { ObjectIdMap } from '../object-id-map.js';
import { WebviewObjectRegistry } from '../webview-object-registry.js';
import { snapshotObject } from '../snapshot-object.js';
import { HOST_SCHEME, registerHostProtocol, uriForId } from '../snapshot-serializer.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');

  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eString);
  titleAttr.setFeatureID(0);
  bookClass.getEStructuralFeatures().add(titleAttr);

  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  booksRef.setFeatureID(0);
  libraryClass.getEStructuralFeatures().add(booksRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().add(bookClass);
  pkg.getEClassifiers().add(libraryClass);
  bookClass.setEPackage(pkg);
  libraryClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { bookClass, libraryClass, titleAttr, booksRef };
}

/** Serves the registered bytes for each id. */
class FakeHostUriConverter implements UriConverter {
  private readonly bytesById = new Map<string, Uint8Array>();

  set(id: string, bytes: Uint8Array): void {
    this.bytesById.set(id, bytes);
  }

  canHandle(uri: URI): boolean {
    return uri.getScheme() === HOST_SCHEME;
  }

  async readBinary(uri: URI): Promise<Uint8Array> {
    const id = uri.getPath().replace(/^\//, '');
    const bytes = this.bytesById.get(id);
    if (!bytes) throw new Error(`FakeHostUriConverter has nothing registered for id '${id}'.`);
    return bytes;
  }

  async writeBinary(): Promise<void> {
    throw new Error('not supported');
  }

  async exists(uri: URI): Promise<boolean> {
    return this.bytesById.has(uri.getPath().replace(/^\//, ''));
  }
}

function encodeSnapshot(snapshot: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(snapshot));
}

describe('SnapshotSerializer', () => {
  it('resolves a proxy into a reconstructed object with decoded attributes', async () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(book), encodeSnapshot(snapshotObject(book, hostIds)));
    converter.set(hostIds.idFor(bookClass), encodeSnapshot(snapshotObject(bookClass, hostIds)));
    // The features of a metaclass are resolved eagerly, so titleAttr must be available.
    converter.set(hostIds.idFor(titleAttr), encodeSnapshot(snapshotObject(titleAttr, hostIds)));
    // EClass has a well-known id and is never fetched; otherwise EClass.eClass() === EClass would recurse forever.

    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), new WebviewObjectRegistry());
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(book)), true);
    const reconstructed = resource!.getContents().get(0);

    expect(reconstructed.eClass().getName()).toBe('Book');
    const reconstructedTitleFeature = reconstructed.eClass().getEStructuralFeature('title')!;
    expect(reconstructed.eGet(reconstructedTitleFeature)).toBe('Dune');
  });

  it('reconstructs references as unresolved proxies', async () => {
    const { bookClass, libraryClass, titleAttr, booksRef } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book);

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    // book is not registered, since it is never fetched.
    converter.set(hostIds.idFor(library), encodeSnapshot(snapshotObject(library, hostIds)));
    converter.set(hostIds.idFor(libraryClass), encodeSnapshot(snapshotObject(libraryClass, hostIds)));
    // The features of metaclasses and their eTypes are resolved eagerly.
    converter.set(hostIds.idFor(booksRef), encodeSnapshot(snapshotObject(booksRef, hostIds)));
    converter.set(hostIds.idFor(bookClass), encodeSnapshot(snapshotObject(bookClass, hostIds)));
    converter.set(hostIds.idFor(titleAttr), encodeSnapshot(snapshotObject(titleAttr, hostIds)));

    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), new WebviewObjectRegistry());
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(library)), true);
    const reconstructedLibrary = resource!.getContents().get(0);
    const reconstructedBooksFeature = reconstructedLibrary.eClass().getEStructuralFeature('books')!;
    const books = reconstructedLibrary.eGet(reconstructedBooksFeature) as Iterable<{ eIsProxy(): boolean }>;
    const [firstBook] = [...books];

    expect(firstBook!.eIsProxy()).toBe(true); // never fetched - still a proxy, exactly as designed
  });

  it('resolves a metamodel whose class contains features of its own type', async () => {
    // "Feature contains child Features": resolving the feature's eType reaches the class being reconstructed.
    const featureClass = new EClassImpl();
    featureClass.setName('Feature');
    const childrenRef = new EReferenceImpl();
    childrenRef.setName('children');
    childrenRef.setEType(featureClass); // self-referential
    childrenRef.setContainment(true);
    childrenRef.setUpperBound(-1);
    childrenRef.setFeatureID(0);
    featureClass.getEStructuralFeatures().add(childrenRef);

    const pkg = new EPackageImpl();
    pkg.setName('variability');
    pkg.setNsURI('https://example.com/variability');
    pkg.getEClassifiers().add(featureClass);
    featureClass.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(featureClass), encodeSnapshot(snapshotObject(featureClass, hostIds)));
    converter.set(hostIds.idFor(childrenRef), encodeSnapshot(snapshotObject(childrenRef, hostIds)));

    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), new WebviewObjectRegistry());
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(featureClass)), true);
    const reconstructedFeatureClass = resource?.getContents().get(0) as EClass;

    expect(reconstructedFeatureClass.getName()).toBe('Feature');
    const reconstructedChildren = reconstructedFeatureClass.getEStructuralFeature('children')!;
    // The eType is the object being reconstructed, not a copy or a proxy.
    expect(reconstructedChildren.getEType()).toBe(reconstructedFeatureClass);
  });

  it("reconstructs each feature's featureID", async () => {
    // DynamicEObjectImpl stores values by featureID, so the reconstructed features need the host's ids.
    const titleClass = new EClassImpl();
    titleClass.setName('Book');
    const eString = new EDataTypeImpl();
    eString.setName('EString');
    const titleAttr = new EAttributeImpl();
    titleAttr.setName('title');
    titleAttr.setEType(eString);
    titleAttr.setFeatureID(3); // a real, specific (not 0, not sequential-by-luck) id
    const authorAttr = new EAttributeImpl();
    authorAttr.setName('author');
    authorAttr.setEType(eString);
    authorAttr.setFeatureID(7);
    titleClass.getEStructuralFeatures().add(titleAttr);
    titleClass.getEStructuralFeatures().add(authorAttr);
    const pkg = new EPackageImpl();
    pkg.setName('library4');
    pkg.setNsURI('https://example.com/library4');
    pkg.getEClassifiers().addAll([titleClass, eString]);
    titleClass.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(titleAttr), encodeSnapshot(snapshotObject(titleAttr, hostIds)));
    converter.set(hostIds.idFor(authorAttr), encodeSnapshot(snapshotObject(authorAttr, hostIds)));

    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), new WebviewObjectRegistry());
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const titleResource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(titleAttr)), true);
    const reconstructedTitle = titleResource!.getContents().get(0);
    const authorResource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(authorAttr)), true);
    const reconstructedAuthor = authorResource!.getContents().get(0);

    expect((reconstructedTitle as unknown as { getFeatureID(): number }).getFeatureID()).toBe(3);
    expect((reconstructedAuthor as unknown as { getFeatureID(): number }).getFeatureID()).toBe(7);
  });

  it("resolves an enum attribute's eType together with its literals", async () => {
    // A dynamic class with an enum attribute of four literals.
    const variabilityType = new EEnumImpl();
    variabilityType.setName('VariabilityType');
    const literalNames = ['mandatory', 'optional', 'alternative', 'or'];
    literalNames.forEach((name, i) => {
      const literal = new EEnumLiteralImpl();
      literal.setName(name);
      literal.setLiteral(name);
      literal.setValue(i);
      variabilityType.getELiterals().add(literal);
    });

    const groupClass = new EClassImpl();
    groupClass.setName('Group');
    const typeAttr = new EAttributeImpl();
    typeAttr.setName('type');
    typeAttr.setEType(variabilityType);
    typeAttr.setFeatureID(0);
    groupClass.getEStructuralFeatures().add(typeAttr);

    const pkg = new EPackageImpl();
    pkg.setName('variability');
    pkg.setNsURI('https://example.com/variability');
    pkg.getEClassifiers().addAll([groupClass, variabilityType]);
    groupClass.setEPackage(pkg);
    variabilityType.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    const group = createInstanceOf(groupClass);

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(group), encodeSnapshot(snapshotObject(group, hostIds)));
    converter.set(hostIds.idFor(groupClass), encodeSnapshot(snapshotObject(groupClass, hostIds)));
    converter.set(hostIds.idFor(typeAttr), encodeSnapshot(snapshotObject(typeAttr, hostIds)));
    converter.set(hostIds.idFor(variabilityType), encodeSnapshot(snapshotObject(variabilityType, hostIds)));
    for (const literal of variabilityType.getELiterals()) {
      converter.set(hostIds.idFor(literal), encodeSnapshot(snapshotObject(literal, hostIds)));
    }

    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), new WebviewObjectRegistry());
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(group)), true);
    const reconstructedGroup = resource!.getContents().get(0);
    const reconstructedTypeFeature = reconstructedGroup.eClass().getEStructuralFeature('type')!;
    const reconstructedEnum = reconstructedTypeFeature.getEType() as unknown as {
      eIsProxy(): boolean;
      getELiterals(): Iterable<unknown>;
    };

    expect(reconstructedEnum.eIsProxy()).toBe(false);

    const literals = [...reconstructedEnum.getELiterals()] as Array<{
      eIsProxy(): boolean;
      getName(): string;
      getLiteral(): string;
    }>;
    expect(literals).toHaveLength(4);
    for (const literal of literals) {
      expect(literal.eIsProxy()).toBe(false);
    }
    expect(literals.map((l) => l.getName())).toEqual(literalNames);
    expect(literals.map((l) => l.getLiteral())).toEqual(literalNames);
  });

  // Regression test for a bug GEN-13's opposite fix exposed: the root here is an EPackage, which
  // isn't eager (needsEagerOwnFeatures), so its classifiers are reconstructed as unresolved
  // proxies - CORE-02's bug ("eInverseAdd calls eGet on the proxy") threw on the second add, and
  // SnapshotSerializer's trySet() silently swallowed it, so only the first classifier ever made
  // it into the list. This is the host-side proof that opening a .ecore file with more than one
  // classifier shows all of them, not just the first.
  it('reconstructs every classifier of an EPackage, not just the first', async () => {
    const ecoreFactory = new EcoreFactoryImpl();
    const pkg = ecoreFactory.createEPackage();
    pkg.setName('mapping');
    const mappingModel = ecoreFactory.createEClass();
    mappingModel.setName('MappingModel');
    const mapping = ecoreFactory.createEClass();
    mapping.setName('Mapping');
    pkg.getEClassifiers().add(mappingModel);
    pkg.getEClassifiers().add(mapping);

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(pkg), encodeSnapshot(snapshotObject(pkg, hostIds)));
    // mappingModel and mapping are never registered - they stay unresolved proxies, same as a
    // real webview that hasn't expanded the tree node for either of them yet.

    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), new WebviewObjectRegistry());
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(pkg)), true);
    const reconstructedPkg = resource!.getContents().get(0);
    const reconstructedClassifiersFeature = reconstructedPkg.eClass().getEStructuralFeature('eClassifiers')!;
    const classifiers = reconstructedPkg.eGet(reconstructedClassifiersFeature) as Iterable<{ eIsProxy(): boolean }>;

    expect([...classifiers]).toHaveLength(2);
  });
});
