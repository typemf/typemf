import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EAttributeImpl,
  EcorePackageImpl,
  EClassImpl,
  EDataTypeImpl,
  EPackageImpl,
  EReferenceImpl,
  ProxyEObjectImpl,
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
  it('a local eSet on a reconstructed object is relayed as an ApplyEditRequest, and resolves once the simulated host applies it', async () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Old Title');

    // The "host" side, entirely real - a genuine ObjectIdMap, exactly what InstanceDocument owns.
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

    // The actual local edit - ordinary code, no awareness of any relay mechanism at all.
    reconstructedBook.eSet(reconstructedTitleFeature, 'New Title');

    // Give onDidChange's synchronous dispatch (and the microtask it kicks off) a tick to run.
    await Promise.resolve();

    const request = sentMessages.find(isApplyEditRequest);
    expect(request).toBeDefined();
    expect(request?.eventType).toBe('SET');
    expect(request?.objectId).toBe(hostIds.idFor(book));
    expect(request?.featureId).toBe(hostIds.idFor(titleAttr));
    expect(request?.value).toEqual({ primitive: 'New Title' });

    // Simulate the real host actually applying it (this is handleApplyEditRequest's own,
    // separately-tested job - here just proving the round trip completes end to end).
    const hostResponse = handleApplyEditRequest(request!, { objectIds: hostIds });
    expect(hostResponse.type).toBe('typemf/applyEditResult');
    expect(book.eGet(titleAttr)).toBe('New Title'); // the REAL, host-side object actually changed

    // Feeding the host's real response back through handleMessage is what resolves the original,
    // still-pending relay promise from the eSet() call above - the actual point of this test.
    editRelay.handleMessage(hostResponse);
  });

  it('a real edit on an object with no known host id posts a visible EditRelayFailedMessage, not silence', async () => {
    // A plain, locally-created EObject - never reconstructed through SnapshotSerializer, so
    // WebviewObjectRegistry has genuinely never recorded it (this is what matters here, not how
    // such an object could arise in practice - see EditRelayFailedMessage's own reasoning for the
    // real report that motivated this).
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
    // The local, webview-side edit still happened - EditRelay never undoes it, only reports that
    // it couldn't reach the real document (see EditRelayFailedMessage's own reasoning for why).
    expect(orphanBook.eGet(titleAttr)).toBe('New Title');
  });

  it('renaming a classifier itself (editing its own, well-known ENamedElement.name feature) relays successfully, not an EditRelayFailedMessage - the real, reported bug', async () => {
    // Exactly the scenario reported: a plain, dynamically-loaded (no generated TypeScript)
    // metamodel, like a hand-authored .ecore file - the classifier itself is the notifier, and
    // its "name" feature is read straight off the real, already-available EClass metaclass
    // (EcorePackageImpl.eINSTANCE.getEClass().getEStructuralFeature('name')), never reconstructed
    // through SnapshotSerializer.deserialize() at all - the exact gap wellKnownEcoreId's own
    // member-id case now covers.
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

  it('createChild sends a CreateChildRequest and resolves with the real childId once the host responds', async () => {
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
    editRelay.handleMessage({ type: 'typemf/createChildError', requestId: request.requestId, message: 'no class known' });

    await expect(pending).rejects.toThrow('no class known');
  });

  it('createChild end-to-end against the real host handler, including the position argument', async () => {
    const { bookClass } = buildFixture();
    const hostIds = new ObjectIdMap();
    const libraryClass = new EClassImpl();
    libraryClass.setName('Library');

    // A minimal, real containment setup, built directly here rather than via buildFixture (which
    // has no containment reference of its own).
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

    const childId = await editRelay.createChild(hostIds.idFor(library), hostIds.idFor(booksRef), hostIds.idFor(bookClass));
    const realChild = hostIds.objectFor(childId);
    expect(realChild).toBeDefined();
    expect((library.eGet(booksRef) as { size(): number }).size()).toBe(1);
  });

  it('suppressNext skips relaying exactly the next notification for that object, but the notification still fires normally', async () => {
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

    // One-shot: a SECOND edit right after relays completely normally.
    book.eSet(titleAttr, 'Normal Edit');
    await Promise.resolve();
    const request = sentMessages.find(isApplyEditRequest);
    expect(request).toBeDefined();
    expect(request?.value).toEqual({ primitive: 'Normal Edit' });
  });

  it('the reference picker: setting a NON-containment reference to an already-existing object relays correctly via the normal, unmodified mechanism - no suppressNext needed, unlike add-child', async () => {
    // Confirms the real design claim behind the reference picker (as opposed to AddChildButton's
    // add-child flow): the chosen object already exists and is already known on both sides, so a
    // perfectly ordinary eSet() - relayNotification encoding it as `{ ref: hostId }`,
    // handleApplyEditRequest resolving that id back to the SAME real object - already handles this
    // correctly, with no special-casing, no host-side mutation request, and no suppression at all.
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

    // The chosen candidate, resolved normally - exactly what LinkReferenceButton's own picker
    // flow does before calling eSet().
    const resolvedAuthor = await webviewResourceSet.resolve(
      new (await import('@typemf/core')).ProxyEObjectImpl(authorClass, uriForId(authorId))
    );
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
