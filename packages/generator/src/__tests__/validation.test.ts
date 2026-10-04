import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DynamicEFactoryImpl,
  EAttributeImpl,
  EClassImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EOperationImpl,
  EPackageImpl,
  EParameterImpl,
} from '@typemf/core';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { findUnnamedElements, findUnresolvedCollisions, metaclassAccessorCollision } from '../typescript-filters.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');

describe('generate() validation', () => {
  it('throws and names the member when an operation collides with a generated getter', () => {
    const eStringType = annotatedDataType('EString', 'string');

    const fooClass = new EClassImpl();
    fooClass.setName('Foo');

    const nameAttr = new EAttributeImpl();
    nameAttr.setName('name');
    nameAttr.setEType(eStringType);
    fooClass.getEStructuralFeatures().add(nameAttr);

    // Collides with the getter generated for the "name" attribute.
    const collidingOp = new EOperationImpl();
    collidingOp.setName('getName');
    collidingOp.setEType(eStringType);
    fooClass.getEOperations().add(collidingOp);

    const pkg = new EPackageImpl();
    pkg.setName('test');
    pkg.setNsURI('http://example.com/test');
    pkg.setNsPrefix('test');
    pkg.getEClassifiers().add(eStringType);
    pkg.getEClassifiers().add(fooClass);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    expect(() => generate(pkg, typescriptTemplateSet)).toThrow(/Foo\.getName/);
  });

  it('does not throw for a package without collisions', () => {
    const eStringType = annotatedDataType('EString', 'string');

    const fooClass = new EClassImpl();
    fooClass.setName('Foo');
    const nameAttr = new EAttributeImpl();
    nameAttr.setName('name');
    nameAttr.setEType(eStringType);
    fooClass.getEStructuralFeatures().add(nameAttr);

    const pkg = new EPackageImpl();
    pkg.setName('test');
    pkg.setNsURI('http://example.com/test');
    pkg.setNsPrefix('test');
    pkg.getEClassifiers().add(eStringType);
    pkg.getEClassifiers().add(fooClass);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    expect(() => generate(pkg, typescriptTemplateSet)).not.toThrow();
  });
});

describe('findUnnamedElements', () => {
  it('reports nothing for a fully-named package', () => {
    const pkg = new EPackageImpl();
    pkg.setName('lib');
    const cls = new EClassImpl();
    cls.setName('Book');
    const attr = new EAttributeImpl();
    attr.setName('title');
    cls.getEStructuralFeatures().add(attr);
    const op = new EOperationImpl();
    op.setName('describe');
    const param = new EParameterImpl();
    param.setName('verbose');
    op.getEParameters().add(param);
    cls.getEOperations().add(op);
    pkg.getEClassifiers().add(cls);
    expect(findUnnamedElements(pkg)).toEqual([]);
  });

  it('reports an unnamed classifier', () => {
    const pkg = new EPackageImpl();
    pkg.setName('lib');
    const cls = new EClassImpl();
    pkg.getEClassifiers().add(cls);
    const problems = findUnnamedElements(pkg);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/classifier with no name/);
  });

  it('reports an unnamed feature, an unnamed operation, and an unnamed parameter, each naming its containing classifier', () => {
    const pkg = new EPackageImpl();
    pkg.setName('lib');
    const cls = new EClassImpl();
    cls.setName('Book');
    cls.getEStructuralFeatures().add(new EAttributeImpl()); // no name
    const op = new EOperationImpl();
    op.setName('describe');
    op.getEParameters().add(new EParameterImpl()); // no name
    cls.getEOperations().add(op);
    const namelessOp = new EOperationImpl(); // no name
    cls.getEOperations().add(namelessOp);
    pkg.getEClassifiers().add(cls);

    const problems = findUnnamedElements(pkg);
    expect(problems.some((p) => p.includes('Book') && p.includes('feature'))).toBe(true);
    expect(problems.some((p) => p.includes('Book') && p.includes('operation'))).toBe(true);
    expect(problems.some((p) => p.includes('Book.describe') && p.includes('parameter'))).toBe(true);
  });

  it('reports an unnamed enum literal', () => {
    const pkg = new EPackageImpl();
    pkg.setName('lib');
    const genre = new EEnumImpl();
    genre.setName('Genre');
    genre.getELiterals().add(new EEnumLiteralImpl()); // no name
    pkg.getEClassifiers().add(genre);
    const problems = findUnnamedElements(pkg);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/Genre.*enum literal/);
  });
});

describe('metaclassAccessorCollision', () => {
  it('finds the inherited operations getEAnnotation and getEClassifier in Ecore', async () => {
    const pkg = await loadEcorePackage(fixturePath);
    const annotationCollision = metaclassAccessorCollision('EAnnotation', pkg);
    expect(annotationCollision?.getName()).toBe('getEAnnotation');
    const classifierCollision = metaclassAccessorCollision('EClassifier', pkg);
    expect(classifierCollision?.getName()).toBe('getEClassifier');
    for (const c of pkg.getEClassifiers()) {
      if (c.getName() === 'EAnnotation' || c.getName() === 'EClassifier') continue;
      expect(metaclassAccessorCollision(c.getName()!, pkg)).toBeUndefined();
    }
  });
});

describe('findUnresolvedCollisions', () => {
  it('finds no unresolved collisions in Ecore', async () => {
    const pkg = await loadEcorePackage(fixturePath);
    const collisions = findUnresolvedCollisions(pkg);
    expect(collisions).toEqual([]);
  });
});
