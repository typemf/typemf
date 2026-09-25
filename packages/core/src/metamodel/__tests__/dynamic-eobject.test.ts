import { describe, expect, it } from "vitest";
import {
  DynamicEFactoryImpl,
  DynamicEObjectImpl,
  EClassImpl,
  EPackageImpl,
  EReferenceImpl,
} from "../impl/index.js";
import { buildSampleMetamodel } from "./sample-metamodel.js";

describe("DynamicEObjectImpl / DynamicEFactoryImpl", () => {
  it("creates instances reflectively with no generated code involved", () => {
    const { bookClass } = buildSampleMetamodel();
    const book = bookClass.createInstance();
    expect(book).toBeInstanceOf(DynamicEObjectImpl);
    expect(book.eClass()).toBe(bookClass);
  });

  it("supports eSet/eGet/eIsSet/eUnset on a single-valued attribute", () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = bookClass.createInstance();

    expect(book.eIsSet(titleAttr)).toBe(false);
    expect(book.eGet(titleAttr)).toBeUndefined();

    book.eSet(titleAttr, "Dune");
    expect(book.eIsSet(titleAttr)).toBe(true);
    expect(book.eGet(titleAttr)).toBe("Dune");

    book.eUnset(titleAttr);
    expect(book.eIsSet(titleAttr)).toBe(false);
    expect(book.eGet(titleAttr)).toBeUndefined();
  });

  it("inherited attributes work identically on a subclass instance", () => {
    const { audioBookClass, titleAttr, narratorAttr } = buildSampleMetamodel();
    const audioBook = audioBookClass.createInstance();

    audioBook.eSet(titleAttr, "Dune");
    audioBook.eSet(narratorAttr, "Simon Vance");

    expect(audioBook.eGet(titleAttr)).toBe("Dune");
    expect(audioBook.eGet(narratorAttr)).toBe("Simon Vance");
  });

  it("maintains containment bookkeeping when adding to a many-valued containment reference", () => {
    const { libraryClass, bookClass, booksRef, titleAttr } =
      buildSampleMetamodel();

    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, "Dune");

    expect(book.eContainer()).toBeUndefined();

    const books = library.eGet(booksRef) as Iterable<unknown> & {
      add(item: unknown): void;
    };
    books.add(book);

    expect(book.eContainer()).toBe(library);
    expect(book.eContainingFeature()).toBe(booksRef);
    expect(library.eContents().contains(book)).toBe(true);
    expect(library.eContents().size()).toBe(1);
  });

  it("reparents an object when it is added to a different container", () => {
    const { libraryClass, bookClass, booksRef, titleAttr } =
      buildSampleMetamodel();

    const libraryA = libraryClass.createInstance();
    const libraryB = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, "Dune");

    (libraryA.eGet(booksRef) as { add(item: unknown): void }).add(book);
    expect(book.eContainer()).toBe(libraryA);

    (libraryB.eGet(booksRef) as { add(item: unknown): void }).add(book);
    expect(book.eContainer()).toBe(libraryB);
    expect(libraryA.eContents().contains(book)).toBe(false);
    expect(libraryB.eContents().contains(book)).toBe(true);
  });

  it("does not duplicate an object re-added to the same containment list", () => {
    const { libraryClass, bookClass, booksRef } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    const books = library.eGet(booksRef) as {
      add(item: unknown): void;
      size(): number;
    };

    books.add(book);
    books.add(book);
    expect(books.size()).toBe(1);
    expect(book.eContainer()).toBe(library);
  });

  it("does not duplicate a target re-added to a many-valued NON-containment reference list either", () => {
    // Reference-list uniqueness (BasicEList.rejectsDuplicate) applies to
    // ANY EReference, not just containment ones - the existing coverage
    // above only ever exercised the containment case. A hand-built,
    // self-contained fixture here rather than sample-metamodel.ts, which
    // has no many-valued non-containment reference to reuse.
    const tagClass = new EClassImpl();
    tagClass.setName("Tag");
    const itemClass = new EClassImpl();
    itemClass.setName("Item");
    const tagsRef = new EReferenceImpl();
    tagsRef.setName("tags");
    tagsRef.setEType(tagClass);
    tagsRef.setContainment(false);
    tagsRef.setUpperBound(-1);
    tagsRef.setFeatureID(0);
    tagsRef.setEContainingClass(itemClass);
    itemClass.getEStructuralFeatures().add(tagsRef);
    itemClass.recomputeAllLists();
    tagClass.recomputeAllLists();

    const pkg = new EPackageImpl();
    pkg.setName("taggingtest");
    pkg.getEClassifiers().add(tagClass);
    pkg.getEClassifiers().add(itemClass);
    for (const c of pkg.getEClassifiers()) c.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    const item = itemClass.createInstance();
    const tag = tagClass.createInstance();
    const tags = item.eGet(tagsRef) as {
      add(item: unknown): void;
      size(): number;
    };

    tags.add(tag);
    tags.add(tag);
    expect(tags.size()).toBe(1);
    // Unlike containment, re-adding a non-containment reference target
    // does NOT set a container - confirms this is genuinely exercising
    // the reference-uniqueness path, not accidentally reusing the
    // containment one.
    expect(tag.eContainer()).toBeUndefined();
  });

  it("eSet(f, eGet(f)) on a many-valued feature keeps its contents", () => {
    const { libraryClass, bookClass, booksRef } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    (library.eGet(booksRef) as { add(item: unknown): void }).add(book);

    library.eSet(booksRef, library.eGet(booksRef));
    expect(library.eContents().toArray()).toEqual([book]);
    expect(book.eContainer()).toBe(library);
  });

  it("maintains containment bookkeeping for a single-valued containment feature via eSet", () => {
    const { libraryClass, bookClass, titleAttr } = buildSampleMetamodel();
    const libraryClassWithSingleContainment = libraryClass;
    void libraryClassWithSingleContainment;

    // featuredBook is deliberately non-containment in the sample model, so
    // build a one-off containment single-valued reference here to exercise
    // that branch of eSet() directly.
    const coverBookRef = new EReferenceImpl();
    coverBookRef.setName("coverFeature");
    coverBookRef.setEType(bookClass);
    coverBookRef.setContainment(true);
    coverBookRef.setUpperBound(1);
    coverBookRef.setFeatureID(99);
    coverBookRef.setEContainingClass(libraryClass);

    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, "Dune");

    library.eSet(coverBookRef, book);
    expect(book.eContainer()).toBe(library);
    expect(book.eContainingFeature()).toBe(coverBookRef);

    library.eUnset(coverBookRef);
    expect(book.eContainer()).toBeUndefined();
  });

  it("does not set a container for a non-containment reference", () => {
    const { libraryClass, bookClass, featuredBookRef, titleAttr } =
      buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, "Dune");

    library.eSet(featuredBookRef, book);
    expect(library.eGet(featuredBookRef)).toBe(book);
    expect(book.eContainer()).toBeUndefined();
  });

  it("eAllContents() walks containment transitively", () => {
    const { libraryClass, bookClass, booksRef, titleAttr } =
      buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const book1 = bookClass.createInstance();
    book1.eSet(titleAttr, "Dune");
    const book2 = bookClass.createInstance();
    book2.eSet(titleAttr, "Foundation");

    const books = library.eGet(booksRef) as { add(item: unknown): void };
    books.add(book1);
    books.add(book2);

    const all = library.eAllContents();
    expect(all).toHaveLength(2);
    expect(all).toContain(book1);
    expect(all).toContain(book2);
  });

  it("fullId() uses the ID attribute when set, and falls back otherwise", () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, "Dune");
    expect(book.fullId()).toBe("Book_Dune");

    const untitled = bookClass.createInstance();
    expect(untitled.fullId()).toMatch(/^Book_/);
    expect(untitled.fullId()).not.toBe("Book_Dune");
  });

  it("eIsSet/eUnset behave correctly for many-valued features", () => {
    const { libraryClass, bookClass, booksRef, titleAttr } =
      buildSampleMetamodel();
    const library = libraryClass.createInstance();
    expect(library.eIsSet(booksRef)).toBe(false);

    const book = bookClass.createInstance();
    book.eSet(titleAttr, "Dune");
    (library.eGet(booksRef) as { add(item: unknown): void }).add(book);
    expect(library.eIsSet(booksRef)).toBe(true);

    library.eUnset(booksRef);
    expect(library.eIsSet(booksRef)).toBe(false);
    expect(book.eContainer()).toBeUndefined();
  });
});
