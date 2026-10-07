import { createInstanceOf, EClassImpl, EcoreFactoryImpl, EObject, EPackageImpl, EReferenceImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { computeEmfFragment, resolveEmfFragment } from '../emf-fragment.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('computeEmfFragment / resolveEmfFragment', () => {
  it('addresses the root itself as "/"', () => {
    const { libraryClass } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    expect(computeEmfFragment(library, [library])).toBe('/');
    expect(resolveEmfFragment('/', [library])).toBe(library);
  });

  it('addresses a many-valued containment descendant as "//@feature.index"', () => {
    const { libraryClass, bookClass, booksRef, titleAttr } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    const book0 = createInstanceOf(bookClass);
    book0.eSet(titleAttr, 'Dune');
    const book1 = createInstanceOf(bookClass);
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book0);
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book1);

    // book1 has no ID, so its fragment is positional.
    expect(computeEmfFragment(book1, [library])).toBe('//@books.1');
    expect(resolveEmfFragment('//@books.1', [library])).toBe(book1);
  });

  it('addresses a single-valued containment descendant as "//@feature" with no index', () => {
    const { libraryClass, bookClass } = buildSampleMetamodel();
    const coverRef = new EReferenceImpl();
    coverRef.setName('cover');
    coverRef.setEType(bookClass);
    coverRef.setContainment(true);
    coverRef.setUpperBound(1);
    coverRef.setFeatureID(99);
    coverRef.setEContainingClass(libraryClass);
    libraryClass.getEStructuralFeatures().add(coverRef);

    const library = createInstanceOf(libraryClass);
    const untitledBook = createInstanceOf(bookClass);
    library.eSet(coverRef, untitledBook);

    expect(computeEmfFragment(untitledBook, [library])).toBe('//@cover');
    expect(resolveEmfFragment('//@cover', [library])).toBe(untitledBook);
  });

  it('prefers the ID attribute over a positional path when one is set', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    expect(computeEmfFragment(book, [book])).toBe('Dune');
    expect(resolveEmfFragment('Dune', [book])).toBe(book);
  });

  it('resolveEmfFragment returns undefined for a malformed or non-matching fragment', () => {
    const { libraryClass } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    expect(resolveEmfFragment('//@notAFeature', [library])).toBeUndefined();
    expect(resolveEmfFragment('//@books.5', [library])).toBeUndefined();
    expect(resolveEmfFragment('not-a-fragment-and-no-such-id', [library])).toBeUndefined();
  });

  it('computeEmfFragment throws when the target is unreachable from the given roots', () => {
    const { bookClass } = buildSampleMetamodel();
    const orphan = createInstanceOf(bookClass);
    expect(() => computeEmfFragment(orphan, [])).toThrow(/not reachable/);
  });
});

/** Package "root" with the classes Foo and Bar; Foo has a reference "toBar". */
function buildPackage() {
  const pkg = new EPackageImpl();
  pkg.setName('root');
  const foo = new EClassImpl();
  foo.setName('Foo');
  const bar = new EClassImpl();
  bar.setName('Bar');
  const toBar = new EReferenceImpl();
  toBar.setName('toBar');
  toBar.setEType(bar);
  foo.getEStructuralFeatures().add(toBar);
  pkg.getEClassifiers().add(foo);
  pkg.getEClassifiers().add(bar);
  return { pkg, foo, bar, toBar };
}

describe('resolveEmfFragment - name-based form', () => {
  it('resolves "//ClassName" to a classifier of the root package', () => {
    const { pkg, foo, bar } = buildPackage();
    expect(resolveEmfFragment('//Foo', [pkg])).toBe(foo);
    expect(resolveEmfFragment('//Bar', [pkg])).toBe(bar);
  });

  it('resolves "//ClassName/featureName" to a feature of that class', () => {
    const { pkg, toBar } = buildPackage();
    expect(resolveEmfFragment('//Foo/toBar', [pkg])).toBe(toBar);
  });

  it('returns undefined for an unknown classifier or feature name', () => {
    const { pkg } = buildPackage();
    expect(resolveEmfFragment('//DoesNotExist', [pkg])).toBeUndefined();
    expect(resolveEmfFragment('//Foo/doesNotExist', [pkg])).toBeUndefined();
  });

  it('still resolves the positional form "//@feature.index"', () => {
    const { pkg, foo } = buildPackage();
    expect(resolveEmfFragment('//@eClassifiers.0', [pkg])).toBe(foo);
  });

  it('addresses named Ecore elements by name, and by position when a sibling has the same name', () => {
    const factory = new EcoreFactoryImpl();
    const root = factory.createEPackage();
    root.setName('root');
    const api = factory.createEPackage();
    api.setName('api');
    root.getESubpackages().add(api);
    const solution = factory.createEClass();
    solution.setName('Solution');
    const twin = factory.createEClass();
    twin.setName('Solution');
    api.getEClassifiers().add(solution);

    expect(computeEmfFragment(solution, [root])).toBe('//api/Solution');
    expect(resolveEmfFragment('//api/Solution', [root])).toBe(solution);

    api.getEClassifiers().add(twin);
    expect(computeEmfFragment(twin, [root])).toBe('//api/@eClassifiers.1');
    expect(resolveEmfFragment('//api/@eClassifiers.1', [root])).toBe(twin);
  });
});
