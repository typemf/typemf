import {
  EcorePackageImpl,
  EClassImpl,
  EAttributeImpl,
  EDataTypeImpl,
  EPackageImpl,
  EReferenceImpl,
  Notification,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { ApplyEditRequest } from '../host-message-protocol.js';
import { relayNotification } from '../relay-notification.js';
import { WebviewObjectRegistry } from '../webview-object-registry.js';

/** Asserts that the outcome is an ApplyEditRequest. */
function expectRequest(outcome: ReturnType<typeof relayNotification>): ApplyEditRequest {
  if (outcome === undefined) throw new Error('expected an ApplyEditRequest, got undefined (a silent, expected no-op)');
  if ('reason' in outcome) throw new Error(`expected an ApplyEditRequest, got a RelayFailure: ${outcome.reason}`);
  return outcome;
}

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
  return { bookClass, titleAttr };
}

function setNotification(overrides: Partial<Notification>): Notification {
  return {
    eventType: 'SET',
    notifier: overrides.notifier!,
    feature: overrides.feature,
    oldValue: undefined,
    newValue: undefined,
    position: undefined,
    wasSet: false,
    ...overrides,
  };
}

describe('relayNotification', () => {
  it('translates a SET notification for a primitive attribute into an ApplyEditRequest', () => {
    const { bookClass, titleAttr } = buildFixture();
    const registry = new WebviewObjectRegistry();
    registry.record(bookClass, 'host-class-1'); // not the book itself, just a stand-in EObject as notifier
    registry.record(titleAttr, 'host-feature-1');

    const notification = setNotification({
      notifier: bookClass,
      feature: titleAttr,
      oldValue: 'Old',
      newValue: 'Dune',
    });
    const request = expectRequest(relayNotification(notification, registry, 'r1'));

    expect(request.objectId).toBe('host-class-1');
    expect(request.featureId).toBe('host-feature-1');
    expect(request.eventType).toBe('SET');
    expect(request.value).toEqual({ primitive: 'Dune' });
  });

  it('returns a RelayFailure for a notifier the registry never recorded', () => {
    const { titleAttr } = buildFixture();
    const registry = new WebviewObjectRegistry();
    const unrecorded = new EClassImpl();
    registry.record(titleAttr, 'host-feature-1');

    const notification = setNotification({ notifier: unrecorded, feature: titleAttr, newValue: 'Dune' });
    const outcome = relayNotification(notification, registry, 'r2');
    expect(outcome).toBeDefined();
    expect(outcome && 'reason' in outcome).toBe(true);
  });

  it('returns undefined for event types that are not relayed, such as MOVE', () => {
    const { bookClass, titleAttr } = buildFixture();
    const registry = new WebviewObjectRegistry();
    registry.record(bookClass, 'host-class-1');
    registry.record(titleAttr, 'host-feature-1');

    const notification = setNotification({ eventType: 'MOVE', notifier: bookClass, feature: titleAttr });
    expect(relayNotification(notification, registry, 'r3')).toBeUndefined();
  });

  it('an UNSET request carries no value', () => {
    const { bookClass, titleAttr } = buildFixture();
    const registry = new WebviewObjectRegistry();
    registry.record(bookClass, 'host-class-1');
    registry.record(titleAttr, 'host-feature-1');

    const notification = setNotification({
      eventType: 'UNSET',
      notifier: bookClass,
      feature: titleAttr,
      oldValue: 'Dune',
    });
    const request = expectRequest(relayNotification(notification, registry, 'r4'));

    expect(request.eventType).toBe('UNSET');
    expect(request.value).toBeUndefined();
  });

  it('a REMOVE encodes the removed object as a ref', () => {
    const { bookClass } = buildFixture();
    const booksRef = new EReferenceImpl();
    booksRef.setName('books');
    booksRef.setEType(bookClass);
    booksRef.setContainment(true);
    booksRef.setUpperBound(-1);
    booksRef.setFeatureID(1);

    const registry = new WebviewObjectRegistry();
    const library = new EClassImpl();
    registry.record(library, 'host-library-1');
    registry.record(booksRef, 'host-books-feature');
    const removedBook = new EClassImpl();
    registry.record(removedBook, 'host-book-42');

    const notification = setNotification({
      eventType: 'REMOVE',
      notifier: library,
      feature: booksRef,
      oldValue: removedBook,
      newValue: undefined,
      position: 0,
    });
    const request = expectRequest(relayNotification(notification, registry, 'r6'));

    expect(request.value).toEqual({ ref: 'host-book-42' });
    expect(request.position).toBe(0);
  });

  it('a reference value without a host id makes the notification a RelayFailure', () => {
    const { bookClass } = buildFixture();
    const booksRef = new EReferenceImpl();
    booksRef.setName('books');
    booksRef.setEType(bookClass);
    booksRef.setContainment(true);
    booksRef.setUpperBound(-1);
    booksRef.setFeatureID(1);

    const registry = new WebviewObjectRegistry();
    const library = new EClassImpl();
    registry.record(library, 'host-library-1');
    registry.record(booksRef, 'host-books-feature');
    const neverRecordedBook = new EClassImpl(); // deliberately not registry.record()'d

    const notification = setNotification({
      eventType: 'ADD',
      notifier: library,
      feature: booksRef,
      newValue: neverRecordedBook,
      position: 0,
    });
    const outcome = relayNotification(notification, registry, 'r7');
    expect(outcome).toBeDefined();
    expect(outcome && 'reason' in outcome).toBe(true);
  });
});
