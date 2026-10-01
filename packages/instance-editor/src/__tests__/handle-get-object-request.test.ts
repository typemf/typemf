import { createInstanceOf, DynamicEFactoryImpl, EAttributeImpl, EcorePackageImpl, EClassImpl, EDataTypeImpl, EPackageImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleGetObjectRequest } from '../handle-get-object-request.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

function buildBook() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eString);
  titleAttr.setFeatureID(0);
  bookClass.getEStructuralFeatures().add(titleAttr);
  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().add(bookClass);
  bookClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());
  const book = createInstanceOf(bookClass);
  book.eSet(titleAttr, 'Dune');
  return { book, bookClass };
}

describe('handleGetObjectRequest', () => {
  it('returns a GetObjectResponse with the real snapshot for a known id', () => {
    const { book } = buildBook();
    const objectIds = new ObjectIdMap();
    const id = objectIds.idFor(book);

    const response = handleGetObjectRequest({ type: 'typemf/getObject', requestId: 'r1', id }, { objectIds });

    expect(response.type).toBe('typemf/getObjectResult');
    expect(response.requestId).toBe('r1');
    if (response.type === 'typemf/getObjectResult') {
      expect(response.snapshot.id).toBe(id);
      expect(response.snapshot.attributes.title).toBe('Dune');
    }
  });

  it('returns a clear GetObjectError for an id this document\'s ObjectIdMap never issued', () => {
    const objectIds = new ObjectIdMap();

    const response = handleGetObjectRequest({ type: 'typemf/getObject', requestId: 'r2', id: 'not-a-real-id' }, { objectIds });

    expect(response.type).toBe('typemf/getObjectError');
    expect(response.requestId).toBe('r2');
    if (response.type === 'typemf/getObjectError') {
      expect(response.message).toContain('not-a-real-id');
    }
  });

  it('the response snapshot resolves back through the SAME ObjectIdMap the document owns', () => {
    const { book, bookClass } = buildBook();
    const objectIds = new ObjectIdMap();
    const id = objectIds.idFor(book);

    const response = handleGetObjectRequest({ type: 'typemf/getObject', requestId: 'r3', id }, { objectIds });

    expect(response.type).toBe('typemf/getObjectResult');
    if (response.type === 'typemf/getObjectResult') {
      expect(objectIds.objectFor(response.snapshot.eClassId)).toBe(bookClass);
    }
  });
});
