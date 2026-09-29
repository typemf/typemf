/**
 * A local copy of the Library/Book/AudioBook sample metamodel used in
 * @typemf/core's own test suite, rebuilt here from @typemf/core's public
 * exports only. Not shared across the package boundary on purpose - a
 * package's tests shouldn't reach into another package's internal
 * __tests__ directory, which isn't part of its published surface.
 */
import {
  DynamicEFactoryImpl,
  EAttributeImpl,
  EClassImpl,
  EcorePackageImpl,
  EDataTypeImpl,
  EPackageImpl,
  EReferenceImpl,
} from '@typemf/core';

// See NOTES.md's point 6/7 write-ups: every generated setter routes through getEcorePackageRef(),
// which needs Ecore's own metaclass system bootstrapped first - this triggers that safely, once,
// at module load, before this file constructs a single raw metaclass instance.
void EcorePackageImpl.eINSTANCE;

export function buildSampleMetamodel() {
  const eStringType = new EDataTypeImpl();
  eStringType.setName('EString');

  const eDateType = new EDataTypeImpl();
  eDateType.setName('EDate');

  const bookClass = new EClassImpl();
  bookClass.setName('Book');

  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eStringType);
  titleAttr.setID(true);
  titleAttr.setFeatureID(0);
  titleAttr.setEContainingClass(bookClass);

  const publishedAttr = new EAttributeImpl();
  publishedAttr.setName('published');
  publishedAttr.setEType(eDateType);
  publishedAttr.setFeatureID(1);
  publishedAttr.setEContainingClass(bookClass);

  bookClass.getEStructuralFeatures().add(titleAttr);
  bookClass.getEStructuralFeatures().add(publishedAttr);

  const audioBookClass = new EClassImpl();
  audioBookClass.setName('AudioBook');
  audioBookClass.getESuperTypes().add(bookClass);

  const narratorAttr = new EAttributeImpl();
  narratorAttr.setName('narrator');
  narratorAttr.setEType(eStringType);
  narratorAttr.setFeatureID(2);
  narratorAttr.setEContainingClass(audioBookClass);

  audioBookClass.getEStructuralFeatures().add(narratorAttr);

  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');

  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  booksRef.setFeatureID(0);
  booksRef.setEContainingClass(libraryClass);

  const featuredBookRef = new EReferenceImpl();
  featuredBookRef.setName('featuredBook');
  featuredBookRef.setEType(bookClass);
  featuredBookRef.setContainment(false);
  featuredBookRef.setUpperBound(1);
  featuredBookRef.setFeatureID(1);
  featuredBookRef.setEContainingClass(libraryClass);

  libraryClass.getEStructuralFeatures().add(booksRef);
  libraryClass.getEStructuralFeatures().add(featuredBookRef);

  const libraryPackage = new EPackageImpl();
  libraryPackage.setName('library');
  libraryPackage.setNsURI('https://typemf.dev/samples/library');
  libraryPackage.setNsPrefix('lib');
  libraryPackage.getEClassifiers().add(eStringType);
  libraryPackage.getEClassifiers().add(eDateType);
  libraryPackage.getEClassifiers().add(bookClass);
  libraryPackage.getEClassifiers().add(audioBookClass);
  libraryPackage.getEClassifiers().add(libraryClass);
  for (const classifier of libraryPackage.getEClassifiers()) {
    (classifier as EClassImpl).setEPackage(libraryPackage);
  }
  libraryPackage.setEFactoryInstance(new DynamicEFactoryImpl());

  return {
    libraryPackage,
    bookClass,
    audioBookClass,
    libraryClass,
    titleAttr,
    publishedAttr,
    narratorAttr,
    booksRef,
    featuredBookRef,
  };
}
