import { describe, it, expect } from 'vitest';
import { EAttributeImpl, EClassImpl, EDataTypeImpl, EOperationImpl, EPackageImpl, DynamicEFactoryImpl } from '@typemf/core';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

describe('generate() validation', () => {
  it('throws, listing the problem, when a classifier has a real, deliberate own-name collision', () => {
    const eStringType = annotatedDataType('EString', 'string');

    const fooClass = new EClassImpl();
    fooClass.setName('Foo');

    const nameAttr = new EAttributeImpl();
    nameAttr.setName('name');
    nameAttr.setEType(eStringType);
    fooClass.getEStructuralFeatures().add(nameAttr);

    // A real EOperation literally named "getName" - collides with the
    // bean getter the "name" attribute above already generates.
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

  it('does not throw for an ordinary, collision-free package', () => {
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
