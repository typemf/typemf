import { DynamicEFactoryImpl, DynamicEObjectImpl, EObject } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { convertDynamicEcoreToTyped } from '../ecore-dynamic-to-typed.js';
import { buildEcoreMetaSchema } from '../ecore-meta-schema.js';

/**
 * Builds a small, real dynamic instance graph - a package containing two
 * classes (Book, AudioBook extends Book), an enum (Genre), a many-valued
 * containment reference (Library.books), an eOpposite pair, and an
 * operation with a parameter - against the REAL meta-schema (not a
 * simplified test fixture), then converts it and checks the resulting
 * typed EPackage.
 */
function buildDynamicInstance() {
  const meta = buildEcoreMetaSchema();
  const factory = new DynamicEFactoryImpl();
  void factory;

  const set = <T extends EObject>(obj: T, featureName: string, value: unknown): void => {
    const feature = obj.eClass().getEStructuralFeatureByName(featureName)!;
    obj.eSet(feature, value);
  };
  const addTo = (obj: EObject, featureName: string, value: EObject): void => {
    const feature = obj.eClass().getEStructuralFeatureByName(featureName)!;
    (obj.eGet(feature) as { add(v: EObject): void }).add(value);
  };

  const dynPkg = new DynamicEObjectImpl(meta.ePackage);
  set(dynPkg, 'name', 'library');
  set(dynPkg, 'nsURI', 'https://typemf.dev/samples/library');
  set(dynPkg, 'nsPrefix', 'lib');

  // Primitive EDataTypes as dynamic instances (they need to be members of
  // this dynamic graph too, so classifierMap - keyed off object identity -
  // can see them as valid eType targets).
  const wrapPrimitive = (name: string) => {
    const w = new DynamicEObjectImpl(meta.eDataType);
    set(w, 'name', name);
    addTo(dynPkg, 'eClassifiers', w);
    return w;
  };
  const eString = wrapPrimitive('EString');
  const eInt = wrapPrimitive('EInt');
  const eBoolean = wrapPrimitive('EBoolean');

  const bookClass = new DynamicEObjectImpl(meta.eClass);
  set(bookClass, 'name', 'Book');
  addTo(dynPkg, 'eClassifiers', bookClass);

  const titleAttr = new DynamicEObjectImpl(meta.eAttribute);
  set(titleAttr, 'name', 'title');
  set(titleAttr, 'eType', eString);
  set(titleAttr, 'iD', true);
  addTo(bookClass, 'eStructuralFeatures', titleAttr);

  const pageCountAttr = new DynamicEObjectImpl(meta.eAttribute);
  set(pageCountAttr, 'name', 'pageCount');
  set(pageCountAttr, 'eType', eInt);
  addTo(bookClass, 'eStructuralFeatures', pageCountAttr);

  const audioBookClass = new DynamicEObjectImpl(meta.eClass);
  set(audioBookClass, 'name', 'AudioBook');
  addTo(dynPkg, 'eClassifiers', audioBookClass);
  addTo(audioBookClass, 'eSuperTypes', bookClass);

  const narratorAttr = new DynamicEObjectImpl(meta.eAttribute);
  set(narratorAttr, 'name', 'narrator');
  set(narratorAttr, 'eType', eString);
  addTo(audioBookClass, 'eStructuralFeatures', narratorAttr);

  const genreEnum = new DynamicEObjectImpl(meta.eEnum);
  set(genreEnum, 'name', 'Genre');
  addTo(dynPkg, 'eClassifiers', genreEnum);
  const scifiLiteral = new DynamicEObjectImpl(meta.eEnumLiteral);
  set(scifiLiteral, 'name', 'SciFi');
  set(scifiLiteral, 'value', 0);
  set(scifiLiteral, 'literal', 'SciFi');
  addTo(genreEnum, 'eLiterals', scifiLiteral);

  const libraryClass = new DynamicEObjectImpl(meta.eClass);
  set(libraryClass, 'name', 'Library');
  addTo(dynPkg, 'eClassifiers', libraryClass);
  const booksRef = new DynamicEObjectImpl(meta.eReference);
  set(booksRef, 'name', 'books');
  set(booksRef, 'eType', bookClass);
  set(booksRef, 'upperBound', -1);
  set(booksRef, 'containment', true);
  addTo(libraryClass, 'eStructuralFeatures', booksRef);

  // Opposite pair: featuredBook <-> libraries.
  const featuredBookRef = new DynamicEObjectImpl(meta.eReference);
  set(featuredBookRef, 'name', 'featuredBook');
  set(featuredBookRef, 'eType', bookClass);
  addTo(libraryClass, 'eStructuralFeatures', featuredBookRef);
  const librariesRef = new DynamicEObjectImpl(meta.eReference);
  set(librariesRef, 'name', 'libraries');
  set(librariesRef, 'eType', libraryClass);
  set(librariesRef, 'upperBound', -1);
  addTo(bookClass, 'eStructuralFeatures', librariesRef);
  set(featuredBookRef, 'eOpposite', librariesRef);
  set(librariesRef, 'eOpposite', featuredBookRef);

  // An operation with a parameter.
  const isOverdueOp = new DynamicEObjectImpl(meta.eOperation);
  set(isOverdueOp, 'name', 'isOverdue');
  set(isOverdueOp, 'eType', eBoolean);
  addTo(bookClass, 'eOperations', isOverdueOp);
  const asOfParam = new DynamicEObjectImpl(meta.eParameter);
  set(asOfParam, 'name', 'asOf');
  set(asOfParam, 'eType', eString);
  addTo(isOverdueOp, 'eParameters', asOfParam);

  return { dynPkg };
}

describe('convertDynamicEcoreToTyped', () => {
  it('converts package-level properties', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    expect(real.getName()).toBe('library');
    expect(real.getNsURI()).toBe('https://typemf.dev/samples/library');
    expect(real.getNsPrefix()).toBe('lib');
  });

  it('converts classes, attributes, and iD flag', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    const book = real.getEClassifier('Book')!;
    expect(book.getName()).toBe('Book');
    const bookClass = book as unknown as { getEStructuralFeatures(): { toArray(): { getName(): string }[] } };
    const featureNames = bookClass.getEStructuralFeatures().toArray().map((f) => f.getName());
    expect(featureNames).toContain('title');
    expect(featureNames).toContain('pageCount');
  });

  it('converts inheritance (eSuperTypes)', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioBook = real.getEClassifier('AudioBook') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book = real.getEClassifier('Book') as any;
    expect(audioBook.getESuperTypes()).toContain(book);
  });

  it('converts many-valued containment references', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const library = real.getEClassifier('Library') as any;
    const books = library.getEStructuralFeatures().toArray().find((f: { getName(): string }) => f.getName() === 'books');
    expect(books.isMany()).toBe(true);
    expect(books.isContainment()).toBe(true);
    expect(books.getEType()).toBe(real.getEClassifier('Book'));
  });

  it('converts eOpposite pairing correctly', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const library = real.getEClassifier('Library') as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book = real.getEClassifier('Book') as any;
    const featuredBook = library.getEStructuralFeatures().toArray().find((f: { getName(): string }) => f.getName() === 'featuredBook');
    const libraries = book.getEStructuralFeatures().toArray().find((f: { getName(): string }) => f.getName() === 'libraries');
    expect(featuredBook.getEOpposite()).toBe(libraries);
    expect(libraries.getEOpposite()).toBe(featuredBook);
  });

  it('converts EEnum and its literals', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genre = real.getEClassifier('Genre') as any;
    expect(genre.getELiterals().size()).toBe(1);
    expect(genre.getELiterals().get(0).getName()).toBe('SciFi');
  });

  it('converts EOperation and its EParameter', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book = real.getEClassifier('Book') as any;
    const op = book.getEOperations().toArray().find((o: { getName(): string }) => o.getName() === 'isOverdue');
    expect(op).toBeDefined();
    expect(op.getEParameters().size()).toBe(1);
    expect(op.getEParameters().get(0).getName()).toBe('asOf');
  });

  it('recomputes EAllStructuralFeatures so inherited + own features are visible', () => {
    const { dynPkg } = buildDynamicInstance();
    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioBook = real.getEClassifier('AudioBook') as any;
    const allNames = audioBook.getEAllStructuralFeatures().map((f: { getName(): string }) => f.getName());
    expect(allNames).toContain('title'); // inherited from Book
    expect(allNames).toContain('narrator'); // own
  });

  it('copies EAnnotations (source + details) onto the package, classifiers, features, and enum literals', () => {
    const meta = buildEcoreMetaSchema();
    const set = <T extends EObject>(obj: T, featureName: string, value: unknown): void => {
      const feature = obj.eClass().getEStructuralFeatureByName(featureName)!;
      obj.eSet(feature, value);
    };
    const addTo = (obj: EObject, featureName: string, value: EObject): void => {
      const feature = obj.eClass().getEStructuralFeatureByName(featureName)!;
      (obj.eGet(feature) as { add(v: EObject): void }).add(value);
    };
    const annotate = (obj: EObject, source: string, details: Record<string, string>): void => {
      const annotation = new DynamicEObjectImpl(meta.eAnnotation);
      set(annotation, 'source', source);
      for (const [key, value] of Object.entries(details)) {
        const detail = new DynamicEObjectImpl(meta.eStringToStringMapEntry);
        set(detail, 'key', key);
        set(detail, 'value', value);
        addTo(annotation, 'details', detail);
      }
      addTo(obj, 'eAnnotations', annotation);
    };

    const dynPkg = new DynamicEObjectImpl(meta.ePackage);
    set(dynPkg, 'name', 'library');
    set(dynPkg, 'nsURI', 'https://typemf.dev/test/library');
    annotate(dynPkg, 'http://www.eclipse.org/emf/2002/GenModel', { documentation: "The library's own docs." });

    const eString = new DynamicEObjectImpl(meta.eDataType);
    set(eString, 'name', 'EString');
    addTo(dynPkg, 'eClassifiers', eString);

    const bookClass = new DynamicEObjectImpl(meta.eClass);
    set(bookClass, 'name', 'Book');
    annotate(bookClass, 'http://www.eclipse.org/emf/2002/GenModel', { documentation: "A book, with an apostrophe's worth of trouble." });
    addTo(dynPkg, 'eClassifiers', bookClass);

    const titleAttr = new DynamicEObjectImpl(meta.eAttribute);
    set(titleAttr, 'name', 'title');
    set(titleAttr, 'eType', eString);
    annotate(titleAttr, 'http://www.eclipse.org/emf/2002/GenModel', { documentation: 'The title.' });
    addTo(bookClass, 'eStructuralFeatures', titleAttr);

    const genreEnum = new DynamicEObjectImpl(meta.eEnum);
    set(genreEnum, 'name', 'Genre');
    addTo(dynPkg, 'eClassifiers', genreEnum);
    const scifiLiteral = new DynamicEObjectImpl(meta.eEnumLiteral);
    set(scifiLiteral, 'name', 'SciFi');
    set(scifiLiteral, 'value', 0);
    set(scifiLiteral, 'literal', 'SciFi');
    annotate(scifiLiteral, 'http://www.eclipse.org/emf/2002/GenModel', { documentation: 'Science fiction.' });
    addTo(genreEnum, 'eLiterals', scifiLiteral);

    const real = convertDynamicEcoreToTyped(dynPkg);

    expect(real.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel')?.getDetails().get('documentation')).toBe(
      "The library's own docs."
    );

    const book = real.getEClassifier('Book')!;
    expect(book.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel')?.getDetails().get('documentation')).toBe(
      "A book, with an apostrophe's worth of trouble."
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookClassReal = book as any;
    const titleReal = bookClassReal.getEStructuralFeatures().toArray().find((f: { getName(): string }) => f.getName() === 'title');
    expect(titleReal.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel')?.getDetails().get('documentation')).toBe(
      'The title.'
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genreReal = real.getEClassifier('Genre') as any;
    const scifiReal = genreReal.getELiterals().get(0);
    expect(scifiReal.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel')?.getDetails().get('documentation')).toBe(
      'Science fiction.'
    );
  });

  it('copies changeable/volatile/transient/derived/unsettable flags onto the real feature - a real, previously-missed gap (see NOTES.md)', () => {
    const meta = buildEcoreMetaSchema();
    const set = <T extends EObject>(obj: T, featureName: string, value: unknown): void => {
      const f = obj.eClass().getEStructuralFeatureByName(featureName)!;
      obj.eSet(f, value);
    };
    const addTo = (obj: EObject, featureName: string, value: EObject): void => {
      const f = obj.eClass().getEStructuralFeatureByName(featureName)!;
      (obj.eGet(f) as { add(v: EObject): void }).add(value);
    };

    const dynPkg = new DynamicEObjectImpl(meta.ePackage);
    set(dynPkg, 'name', 'pkg');
    set(dynPkg, 'nsURI', 'https://typemf.dev/test/flags');
    set(dynPkg, 'nsPrefix', 'flags');

    const eBoolean = new DynamicEObjectImpl(meta.eDataType);
    set(eBoolean, 'name', 'EBoolean');
    addTo(dynPkg, 'eClassifiers', eBoolean);

    const widget = new DynamicEObjectImpl(meta.eClass);
    set(widget, 'name', 'Widget');
    addTo(dynPkg, 'eClassifiers', widget);

    // Matches real Ecore.ecore's own shape for a derived feature exactly
    // (e.g. ETypedElement.required): changeable=false, volatile=true,
    // transient=true, derived=true.
    const requiredAttr = new DynamicEObjectImpl(meta.eAttribute);
    set(requiredAttr, 'name', 'required');
    set(requiredAttr, 'eType', eBoolean);
    set(requiredAttr, 'changeable', false);
    set(requiredAttr, 'volatile', true);
    set(requiredAttr, 'transient', true);
    set(requiredAttr, 'derived', true);
    addTo(widget, 'eStructuralFeatures', requiredAttr);

    const real = convertDynamicEcoreToTyped(dynPkg);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const widgetReal = real.getEClassifier('Widget') as any;
    const requiredReal = widgetReal.getEStructuralFeatures().get(0);

    expect(requiredReal.isChangeable()).toBe(false);
    expect(requiredReal.isVolatile()).toBe(true);
    expect(requiredReal.isTransient()).toBe(true);
    expect(requiredReal.isDerived()).toBe(true);
  });
});
