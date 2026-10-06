import {
  createInstanceOf,
  createProxy,
  DynamicEFactoryImpl,
  EAttributeImpl,
  EcorePackageImpl,
  EClassImpl,
  EDataTypeImpl,
  EPackageImpl,
  EReferenceImpl,
  ResourceSetImpl,
  UriConverter,
  URI,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { EditRelay } from '../edit-relay.js';
import { handleApplyEditRequest } from '../handle-apply-edit-request.js';
import { handleCreateChildRequest } from '../handle-create-child-request.js';
import { isApplyEditRequest, isCreateChildRequest, isEditRelayFailedMessage } from '../host-message-protocol.js';
import { PostMessageTransport } from '../host-message-uri-converter.js';
import { ObjectIdMap } from '../object-id-map.js';
import { registerHostProtocol, uriForId } from '../snapshot-serializer.js';
import { snapshotObject } from '../snapshot-object.js';
import { WebviewObjectRegistry } from '../webview-object-registry.js';

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
  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().add(bookClass);
  bookClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());
  return { bookClass, titleAttr };
}

class FakeHostUriConverter implements UriConverter {
  private readonly bytesById = new Map<string, Uint8Array>();
  set(id: string, bytes: Uint8Array): void {
    this.bytesById.set(id, bytes);
  }
  canHandle(uri: URI): boolean {
    return uri.getScheme() === 'typemf-host';
  }
  async readBinary(uri: URI): Promise<Uint8Array> {
    const id = uri.getPath().replace(/^\//, '');
    const bytes = this.bytesById.get(id);
    if (!bytes) throw new Error(`nothing registered for id '${id}'`);
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

describe('the write path end to end', () => {
  it('relays a local eSet as an ApplyEditRequest and resolves when the host has applied it', async () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Old Title');

    // The host side.
    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(book), encodeSnapshot(snapshotObject(book, hostIds)));
    converter.set(hostIds.idFor(bookClass), encodeSnapshot(snapshotObject(bookClass, hostIds)));
    converter.set(hostIds.idFor(titleAttr), encodeSnapshot(snapshotObject(titleAttr, hostIds)));

    // The webview side.
    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);
    const webviewRegistry = new WebviewObjectRegistry();
    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), webviewRegistry, editRelay);
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(book)), true);
    const reconstructedBook = resource!.getContents().get(0);
    const reconstructedTitleFeature = reconstructedBook.eClass().getEStructuralFeature('title')!;

    // Nothing yet, in particular, from reconstruction itself: resolving bookClass eagerly adds
    // titleAttr to bookClass.eStructuralFeatures (a real containment with an eOpposite back to
    // EStructuralFeature.eContainingClass), which fires a SET on titleAttr once CORE-09 is fixed
    // - titleAttr was already reconstructed-and-attached by that point (it's resolved as
    // bookClass's own reference, finishing before bookClass's list.add() runs), so without
    // EditRelay's own reconstruction suppression this reconstruction bookkeeping would relay as
    // if it were a real edit.
    expect(sentMessages.filter(isApplyEditRequest)).toHaveLength(0);

    reconstructedBook.eSet(reconstructedTitleFeature, 'New Title');

    // Let the notification and its microtask run.
    await Promise.resolve();

    expect(sentMessages.filter(isApplyEditRequest)).toHaveLength(1); // exactly the real edit above
    const request = sentMessages.find(isApplyEditRequest);
    expect(request).toBeDefined();
    expect(request?.eventType).toBe('SET');
    expect(request?.objectId).toBe(hostIds.idFor(book));
    expect(request?.featureId).toBe(hostIds.idFor(titleAttr));
    expect(request?.value).toEqual({ primitive: 'New Title' });

    // Apply the edit as the host does.
    const hostResponse = handleApplyEditRequest(request!, { objectIds: hostIds });
    expect(hostResponse.type).toBe('typemf/applyEditResult');
    expect(book.eGet(titleAttr)).toBe('New Title'); // the REAL, host-side object actually changed

    // The host's response resolves the pending relay.
    editRelay.handleMessage(hostResponse);
  });

  it('posts an EditRelayFailedMessage for an object without a host id', async () => {
    // Created locally, so the registry has never recorded it.
    const { bookClass, titleAttr } = buildFixture();
    const orphanBook = createInstanceOf(bookClass);

    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);
    const webviewRegistry = new WebviewObjectRegistry();
    editRelay.attachTo(orphanBook, webviewRegistry);

    orphanBook.eSet(titleAttr, 'New Title');
    await Promise.resolve();
    await Promise.resolve(); // attachTo's own catch handler runs after send()'s rejection settles

    const failure = sentMessages.find(isEditRelayFailedMessage);
    expect(failure).toBeDefined();
    expect(failure?.reason).toContain('title');
    // The local edit is kept.
    expect(orphanBook.eGet(titleAttr)).toBe('New Title');
  });

  it("relays renaming a classifier through Ecore's well-known name feature", async () => {
    // A dynamic metamodel: the name feature belongs to Ecore and was never deserialized.
    const pkg = new EPackageImpl();
    pkg.setName('variability');
    pkg.setNsURI('https://example.com/variability');
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());
    const featureModelClass = new EClassImpl();
    featureModelClass.setName('FeatureModel');
    pkg.getEClassifiers().add(featureModelClass);
    featureModelClass.setEPackage(pkg);

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(featureModelClass), encodeSnapshot(snapshotObject(featureModelClass, hostIds)));

    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);
    const webviewRegistry = new WebviewObjectRegistry();
    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), webviewRegistry, editRelay);
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(featureModelClass)), true);
    const reconstructedClass = resource!.getContents().get(0);
    const nameFeature = reconstructedClass.eClass().getEStructuralFeature('name')!;

    reconstructedClass.eSet(nameFeature, 'RenamedFeatureModel');
    await Promise.resolve();
    await Promise.resolve();

    expect(sentMessages.find(isEditRelayFailedMessage)).toBeUndefined();
    const request = sentMessages.find(isApplyEditRequest);
    expect(request).toBeDefined();

    const hostResponse = handleApplyEditRequest(request!, { objectIds: hostIds });
    expect(hostResponse.type).toBe('typemf/applyEditResult');
    expect(featureModelClass.getName()).toBe('RenamedFeatureModel'); // the real, host-side object actually changed
  });

  it('createChild sends a CreateChildRequest and resolves with the id of the child', async () => {
    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);

    const pending = editRelay.createChild('parent-1', 'feature-1', 'class-1');
    const request = sentMessages.find(isCreateChildRequest);
    expect(request).toBeDefined();
    expect(request).toMatchObject({ parentId: 'parent-1', featureId: 'feature-1', classId: 'class-1' });

    editRelay.handleMessage({ type: 'typemf/createChildResult', requestId: request!.requestId, childId: 'child-42' });
    expect(await pending).toBe('child-42');
  });

  it('createChild rejects when the host responds with a CreateChildError', async () => {
    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);

    const pending = editRelay.createChild('parent-1', 'feature-1', 'class-1');
    const request = sentMessages.find(isCreateChildRequest)!;
    editRelay.handleMessage({
      type: 'typemf/createChildError',
      requestId: request.requestId,
      message: 'no class known',
    });

    await expect(pending).rejects.toThrow('no class known');
  });

  it('createChild works with the host handler, including the position', async () => {
    const { bookClass } = buildFixture();
    const hostIds = new ObjectIdMap();
    const libraryClass = new EClassImpl();
    libraryClass.setName('Library');

    // buildFixture has no containment reference.
    const booksRef = new EReferenceImpl();
    booksRef.setName('books');
    booksRef.setEType(bookClass);
    booksRef.setContainment(true);
    booksRef.setUpperBound(-1);
    libraryClass.getEStructuralFeatures().add(booksRef);
    const pkg = new EPackageImpl();
    pkg.setName('library2');
    pkg.setNsURI('https://example.com/library2');
    pkg.getEClassifiers().add(libraryClass);
    libraryClass.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());
    const library = createInstanceOf(libraryClass);

    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = {
      postMessage: (m) => {
        sentMessages.push(m);
        if (isCreateChildRequest(m)) {
          const response = handleCreateChildRequest(m, { objectIds: hostIds });
          editRelay.handleMessage(response);
        }
      },
    };
    const editRelay = new EditRelay(transport);

    const childId = await editRelay.createChild(
      hostIds.idFor(library),
      hostIds.idFor(booksRef),
      hostIds.idFor(bookClass)
    );
    const realChild = hostIds.objectFor(childId);
    expect(realChild).toBeDefined();
    expect((library.eGet(booksRef) as { size(): number }).size()).toBe(1);
  });

  it('suppressNext skips relaying only the next notification of that object', async () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);
    const webviewRegistry = new WebviewObjectRegistry();

    let localListenerFired = 0;
    book.onDidChange(() => localListenerFired++);
    editRelay.attachTo(book, webviewRegistry);
    webviewRegistry.record(book, 'book-1');
    webviewRegistry.record(titleAttr, 'title-1');

    editRelay.suppressNext(book);
    book.eSet(titleAttr, 'Suppressed Edit');
    await Promise.resolve();

    expect(localListenerFired).toBe(1); // the notification still fired, for every OTHER listener
    expect(sentMessages.find(isApplyEditRequest)).toBeUndefined(); // but EditRelay itself stayed silent

    // The next edit is relayed again.
    book.eSet(titleAttr, 'Normal Edit');
    await Promise.resolve();
    const request = sentMessages.find(isApplyEditRequest);
    expect(request).toBeDefined();
    expect(request?.value).toEqual({ primitive: 'Normal Edit' });
  });

  it('relays setting a non-containment reference to an existing object', async () => {
    const authorClass = new EClassImpl();
    authorClass.setName('Author');
    const bookClass = new EClassImpl();
    bookClass.setName('Book');
    const favoriteAuthorRef = new EReferenceImpl();
    favoriteAuthorRef.setName('favoriteAuthor');
    favoriteAuthorRef.setEType(authorClass);
    favoriteAuthorRef.setFeatureID(0); // non-containment - a real, pre-existing object elsewhere
    bookClass.getEStructuralFeatures().add(favoriteAuthorRef);
    const pkg = new EPackageImpl();
    pkg.setName('library3');
    pkg.setNsURI('https://example.com/library3');
    pkg.getEClassifiers().addAll([authorClass, bookClass]);
    authorClass.setEPackage(pkg);
    bookClass.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    const book = createInstanceOf(bookClass);
    const author = createInstanceOf(authorClass);

    const hostIds = new ObjectIdMap();
    const converter = new FakeHostUriConverter();
    converter.set(hostIds.idFor(book), encodeSnapshot(snapshotObject(book, hostIds)));
    converter.set(hostIds.idFor(bookClass), encodeSnapshot(snapshotObject(bookClass, hostIds)));
    converter.set(hostIds.idFor(favoriteAuthorRef), encodeSnapshot(snapshotObject(favoriteAuthorRef, hostIds)));
    converter.set(hostIds.idFor(author), encodeSnapshot(snapshotObject(author, hostIds)));
    converter.set(hostIds.idFor(authorClass), encodeSnapshot(snapshotObject(authorClass, hostIds)));
    const authorId = hostIds.idFor(author); // the reference picker's own query already found this id

    const sentMessages: unknown[] = [];
    const transport: PostMessageTransport = { postMessage: (m) => sentMessages.push(m) };
    const editRelay = new EditRelay(transport);
    const webviewRegistry = new WebviewObjectRegistry();
    const webviewResourceSet = new ResourceSetImpl();
    registerHostProtocol(webviewResourceSet.getResourceFactoryRegistry(), webviewRegistry, editRelay);
    webviewResourceSet.getUriConverterRegistry().register(converter);

    const resource = await webviewResourceSet.getResource(uriForId(hostIds.idFor(book)), true);
    const reconstructedBook = resource!.getContents().get(0);
    const reconstructedFeature = reconstructedBook.eClass().getEStructuralFeature('favoriteAuthor')!;

    const resolvedAuthor = await webviewResourceSet.resolve(createProxy(authorClass, uriForId(authorId)));
    reconstructedBook.eSet(reconstructedFeature, resolvedAuthor);
    await Promise.resolve();

    const request = sentMessages.find(isApplyEditRequest);
    expect(request).toBeDefined();
    expect(request?.value).toEqual({ ref: authorId });

    const hostResponse = handleApplyEditRequest(request!, { objectIds: hostIds });
    expect(hostResponse.type).toBe('typemf/applyEditResult');
    expect(book.eGet(favoriteAuthorRef)).toBe(author); // the real, host-side object now points at the SAME, real, pre-existing author
  });
});
