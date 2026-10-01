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

void EcorePackageImpl.eINSTANCE;

describe('notifications in generated code', () => {
  it('the generated eSet default dance fires SET (via a plain bean setter)', () => {
    const pkg = new EPackageImpl();
    const received: Notification[] = [];
    pkg.onDidChange((n) => received.push(n));

    pkg.setNsURI('https://example.com/x');

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('SET');
    expect(received[0]!.newValue).toBe('https://example.com/x');
    expect(received[0]!.wasSet).toBe(false);
  });

  it('the generated eUnset default dance fires UNSET', () => {
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

  it('EEnumLiteral.literal\'s custom setter fires SET for the real "literal" feature', () => {
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

  it('ETypedElement.eType\'s custom setter fires SET for the real "eType" feature', () => {
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

  it('ETypedElement.eGenericType\'s custom setter fires two SET notifications - one for eGenericType, one for the eType it side-effects', () => {
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
    expect(received[1]!.newValue).toBe(eClass); // gt.getERawType() resolves to eClass here
  });

  it('a feature-scoped listener on eGenericType\'s dual notification only sees the one it asked for', () => {
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

  it('EEnum feature-based ADD notification fires for getELiterals().add()', () => {
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
});
