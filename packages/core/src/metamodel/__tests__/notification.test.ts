import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
import { Notification } from '../types/Notification.js';
import { buildSampleMetamodel } from './sample-metamodel.js';
import { createInstanceOf } from '../impl/metamodel-helpers.js';

// See NOTES.md's point 6/7 write-ups: every generated setter routes through getEcorePackageRef(),
// which needs Ecore's own metaclass system bootstrapped first.
void EcorePackageImpl.eINSTANCE;

describe('EObject.onDidChange', () => {
  it('fires a SET notification with old and new values on eSet', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n));

    book.eSet(titleAttr, 'Dune');

    expect(received).toHaveLength(1);
    const n = received[0]!;
    expect(n.eventType).toBe('SET');
    expect(n.notifier).toBe(book);
    expect(n.feature).toBe(titleAttr);
    expect(n.oldValue).toBeUndefined();
    expect(n.newValue).toBe('Dune');
    expect(n.wasSet).toBe(false);
  });

  it('wasSet reflects the pre-change eIsSet() state - true on a second SET', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');

    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n));
    book.eSet(titleAttr, 'Dune Messiah');

    const n = received[0]!;
    expect(n.oldValue).toBe('Dune');
    expect(n.newValue).toBe('Dune Messiah');
    expect(n.wasSet).toBe(true);
  });

  it('does not fire when the new value equals the old value', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n));

    book.eSet(titleAttr, 'Dune');

    expect(received).toHaveLength(0);
  });

  it('fires an UNSET notification on eUnset, carrying the old value', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n));

    book.eUnset(titleAttr);

    expect(received).toHaveLength(1);
    const n = received[0]!;
    expect(n.eventType).toBe('UNSET');
    expect(n.oldValue).toBe('Dune');
    expect(n.newValue).toBeUndefined();
    expect(n.wasSet).toBe(true);
  });

  it('fires ADD/REMOVE notifications, with position, for a many-valued feature', () => {
    const { libraryClass, booksRef, bookClass } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    const book1 = createInstanceOf(bookClass);
    const book2 = createInstanceOf(bookClass);
    const received: Notification[] = [];
    library.onDidChange((n) => received.push(n));

    (library.eGet(booksRef) as { add(v: unknown): void }).add(book1);
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book2);

    expect(received).toHaveLength(2);
    expect(received[0]!.eventType).toBe('ADD');
    expect(received[0]!.feature).toBe(booksRef);
    expect(received[0]!.newValue).toBe(book1);
    expect(received[0]!.position).toBe(0);
    expect(received[1]!.newValue).toBe(book2);
    expect(received[1]!.position).toBe(1);

    received.length = 0;
    (library.eGet(booksRef) as { remove(v: unknown): boolean }).remove(book1);
    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('REMOVE');
    expect(received[0]!.oldValue).toBe(book1);
    expect(received[0]!.position).toBe(0);
  });

  it('a feature-scoped listener only fires for that feature, not others', () => {
    const { bookClass, titleAttr, pageCountAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n), titleAttr);

    book.eSet(pageCountAttr, 412);
    expect(received).toHaveLength(0);

    book.eSet(titleAttr, 'Dune');
    expect(received).toHaveLength(1);
    expect(received[0]!.feature).toBe(titleAttr);
  });

  it('an object-wide listener (no feature given) fires for every feature', () => {
    const { bookClass, titleAttr, pageCountAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n));

    book.eSet(titleAttr, 'Dune');
    book.eSet(pageCountAttr, 412);

    expect(received).toHaveLength(2);
    expect(received[0]!.feature).toBe(titleAttr);
    expect(received[1]!.feature).toBe(pageCountAttr);
  });

  it('eSetDeliver(false) suppresses delivery; eSetDeliver(true) resumes it', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    const received: Notification[] = [];
    book.onDidChange((n) => received.push(n));

    expect(book.eDeliver()).toBe(true);
    book.eSetDeliver(false);
    expect(book.eDeliver()).toBe(false);
    book.eSet(titleAttr, 'Dune');
    expect(received).toHaveLength(0);

    book.eSetDeliver(true);
    book.eSet(titleAttr, 'Dune Messiah');
    expect(received).toHaveLength(1);
  });

  it('disposing the returned handle stops further delivery to that listener', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    const received: Notification[] = [];
    const subscription = book.onDidChange((n) => received.push(n));

    book.eSet(titleAttr, 'Dune');
    subscription.dispose();
    book.eSet(titleAttr, 'Dune Messiah');

    expect(received).toHaveLength(1);
    expect(received[0]!.newValue).toBe('Dune');
  });

  it('a plain, standalone EAttributeImpl (not attached to any document) still supports onDidChange', () => {
    const attr = new EAttributeImpl();
    const received: Notification[] = [];
    attr.onDidChange((n) => received.push(n));

    attr.setName('title');

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.newValue).toBe('title');
  });
});
