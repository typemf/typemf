/**
 * A small "library" metamodel, hand-built the same way EcoreParser would
 * build one after reading a .ecore file with no generated code involved -
 * i.e. this is exactly the shape of metamodel DynamicEObjectImpl/
 * DynamicEFactoryImpl are meant to work against.
 *
 *   EPackage "library" (nsURI: https://typemf.dev/samples/library)
 *     EClass Book (abstract: false)
 *       EAttribute title : EString, id = true
 *       EAttribute pageCount : EInt
 *     EClass AudioBook extends Book
 *       EAttribute narrator : EString
 *     EClass Library
 *       EReference books : Book[*], containment = true
 *       EReference featuredBook : Book, containment = false
 */

import {
  DynamicEFactoryImpl,
  EAttributeImpl,
  EClassImpl,
  EcorePackageImpl,
  EDataTypeImpl,
  EPackageImpl,
  EReferenceImpl,
} from '../../index.js';

export interface SampleMetamodel {
  libraryPackage: EPackageImpl;
  bookClass: EClassImpl;
  audioBookClass: EClassImpl;
  libraryClass: EClassImpl;
  titleAttr: EAttributeImpl;
  pageCountAttr: EAttributeImpl;
  narratorAttr: EAttributeImpl;
  booksRef: EReferenceImpl;
  featuredBookRef: EReferenceImpl;
}

export function buildSampleMetamodel(): SampleMetamodel {
  // See NOTES.md's point 6 write-up: every generated setter routes through getEcorePackageRef(),
  // which needs Ecore's own metaclass system bootstrapped first - accessing the singleton here
  // (a real usage pattern, unlike constructing raw metaclasses with no loader involved at all)
  // triggers that safely before anything below touches a single setter.
  void EcorePackageImpl.eINSTANCE;
  const eStringType = new EDataTypeImpl();
  eStringType.setName('EString');

  const eIntType = new EDataTypeImpl();
  eIntType.setName('EInt');

  const bookClass = new EClassImpl();
  bookClass.setName('Book');

  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eStringType);
  titleAttr.setID(true);
  titleAttr.setFeatureID(0);
  titleAttr.setEContainingClass(bookClass);

  const pageCountAttr = new EAttributeImpl();
  pageCountAttr.setName('pageCount');
  pageCountAttr.setEType(eIntType);
  pageCountAttr.setFeatureID(1);
  pageCountAttr.setEContainingClass(bookClass);

  bookClass.getEStructuralFeatures().add(titleAttr);
  bookClass.getEStructuralFeatures().add(pageCountAttr);

  const audioBookClass = new EClassImpl();
  audioBookClass.setName('AudioBook');
  audioBookClass.getESuperTypes().add(bookClass);

  const narratorAttr = new EAttributeImpl();
  narratorAttr.setName('narrator');
  narratorAttr.setEType(eStringType);
  // Continues numbering after the two inherited features from Book.
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
  libraryPackage.getEClassifiers().add(eIntType);
  libraryPackage.getEClassifiers().add(bookClass);
  libraryPackage.getEClassifiers().add(audioBookClass);
  libraryPackage.getEClassifiers().add(libraryClass);
  // eClassifiers' eOpposite is never wired on the self-hosted bootstrap's own metaclass descriptions
  // (a separate, pre-existing gap - confirmed directly, not assumed), so this needs to stay explicit.
  for (const classifier of libraryPackage.getEClassifiers()) {
    (classifier as EClassImpl).setEPackage(libraryPackage);
  }

  // This is the line EcoreParser is expected to do automatically for a
  // purely parsed (no generated code) package - see dynamic-efactory-impl.ts.
  libraryPackage.setEFactoryInstance(new DynamicEFactoryImpl());

  return {
    libraryPackage,
    bookClass,
    audioBookClass,
    libraryClass,
    titleAttr,
    pageCountAttr,
    narratorAttr,
    booksRef,
    featuredBookRef,
  };
}
