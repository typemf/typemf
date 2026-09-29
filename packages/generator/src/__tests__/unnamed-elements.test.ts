import { describe, expect, it } from 'vitest';
import { EAttributeImpl, EClassImpl, EcorePackageImpl, EEnumImpl, EEnumLiteralImpl, EOperationImpl, EPackageImpl, EParameterImpl } from '@typemf/core';

// See NOTES.md's point 6/7 write-ups: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely, once, at module
// load, before any test below constructs a raw metaclass instance.
void EcorePackageImpl.eINSTANCE;
import { findUnnamedElements } from '../typescript-filters.js';

/**
 * Validated once, up front, via the same validate() hook every other model-level problem goes through -
 * this is what lets every other function in typescript-filters.ts safely assert a name is present (`!`)
 * rather than re-checking it at every one of the many call sites that need one. Migrated for real EMF
 * fidelity: `name` became a genuinely optional attribute across the whole ENamedElement hierarchy this
 * session (getName(): string -> string | undefined), matching generated code exactly.
 */
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
