import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EEnumImpl } from '../impl/EEnumImpl.js';
import { EEnumLiteralImpl } from '../impl/EEnumLiteralImpl.js';
import { EGenericTypeImpl } from '../impl/EGenericTypeImpl.js';
import { EPackageImpl } from '../impl/EPackageImpl.js';
import { Notification } from '../types/Notification.js';
import { buildSampleMetamodel } from './sample-metamodel.js';
import { createInstanceOf } from '../impl/metamodel-helpers.js';

// Ecore must be initialized before metaclass instances can be created.
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
});

describe('EObject.onDidChange on metamodel objects', () => {
  it('a setter fires SET', () => {
    const pkg = new EPackageImpl();
    const received: Notification[] = [];
    pkg.onDidChange((n) => received.push(n));

    pkg.setNsURI('https://example.com/x');

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.newValue).toBe('https://example.com/x');
    expect(received[0]!.wasSet).toBe(false);
  });

  it('eUnset fires UNSET', () => {
    const pkg = new EPackageImpl();
    pkg.setNsURI('https://example.com/x');
    const nsURIFeature = pkg.eClass().getEStructuralFeature('nsURI')!;
    const received: Notification[] = [];
    pkg.onDidChange((n) => received.push(n));

    pkg.eUnset(nsURIFeature);

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('UNSET');
    expect(received[0]!.oldValue).toBe('https://example.com/x');
    expect(received[0]!.wasSet).toBe(true);
  });

  it('EEnumLiteral.setLiteral() fires SET for the literal feature', () => {
    const lit = new EEnumLiteralImpl();
    lit.setName('SciFi');
    const received: Notification[] = [];
    lit.onDidChange((n) => received.push(n));

    lit.setLiteral('sci-fi');

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.newValue).toBe('sci-fi');
    expect(received[0]!.feature?.getName()).toBe('literal');
    expect(received[0]!.wasSet).toBe(false);
  });

  it('ETypedElement.setEType() fires SET for the eType feature', () => {
    const attr = new EAttributeImpl();
    const dataType = new EDataTypeImpl();
    dataType.setName('EString');
    const received: Notification[] = [];
    attr.onDidChange((n) => received.push(n));

    attr.setEType(dataType);

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.newValue).toBe(dataType);
    expect(received[0]!.feature?.getName()).toBe('eType');
  });

  it('ETypedElement.setEGenericType() fires SET for eGenericType and for eType', () => {
    const attr = new EAttributeImpl();
    const eClass = new EClassImpl();
    eClass.setName('Widget');
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(eClass);

    const received: Notification[] = [];
    attr.onDidChange((n) => received.push(n));

    attr.setEGenericType(gt);

    expect(received).toHaveLength(2);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.feature?.getName()).toBe('eGenericType');
    expect(received[0]!.newValue).toBe(gt);
    expect(received[1]!.eventType).toBe('SET');
    expect(received[1]!.feature?.getName()).toBe('eType');
    expect(received[1]!.newValue).toBe(eClass);
  });

  it('a feature-scoped listener sees only its feature of setEGenericType()', () => {
    const attr = new EAttributeImpl();
    const eClass = new EClassImpl();
    eClass.setName('Widget');
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(eClass);

    const eTypeFeature = attr.eClass().getEStructuralFeature('eType')!;
    const received: Notification[] = [];
    attr.onDidChange((n) => received.push(n), eTypeFeature);

    attr.setEGenericType(gt);

    expect(received).toHaveLength(1);
    expect(received[0]!.feature?.getName()).toBe('eType');
  });

  it('adding to a list fires ADD', () => {
    const en = new EEnumImpl();
    en.setName('Genre');
    const lit = new EEnumLiteralImpl();
    lit.setName('SciFi');
    const received: Notification[] = [];
    en.onDidChange((n) => received.push(n));

    en.getELiterals().add(lit);

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('ADD');
    expect(received[0]!.newValue).toBe(lit);
    expect(received[0]!.position).toBe(0);
  });

  it('works on an object outside any resource', () => {
    const attr = new EAttributeImpl();
    const received: Notification[] = [];
    attr.onDidChange((n) => received.push(n));

    attr.setName('title');

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.newValue).toBe('title');
  });
});
