import { EcorePackageImpl, EClassImpl, EPackageImpl, EPackageRegistryImpl, ResourceSetImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleConcreteSubtypesRequest } from '../handle-concrete-subtypes-request.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const pkg = new EPackageImpl();
  pkg.setName('shapes');
  pkg.setNsURI('https://example.com/shapes');

  const shape = new EClassImpl();
  shape.setName('Shape');
  shape.setAbstract(true);
  pkg.getEClassifiers().add(shape);

  const circle = new EClassImpl();
  circle.setName('Circle');
  circle.getESuperTypes().add(shape);
  pkg.getEClassifiers().add(circle);

  const square = new EClassImpl();
  square.setName('Square');
  square.getESuperTypes().add(shape);
  pkg.getEClassifiers().add(square);

  const packageRegistry = new EPackageRegistryImpl();
  packageRegistry.register(pkg);
  const resourceSet = new ResourceSetImpl(packageRegistry);

  return { shape, circle, square, resourceSet };
}

describe('handleConcreteSubtypesRequest', () => {
  it('returns the ids of every concrete subtype, resolvable back to the real classes', () => {
    const { shape, circle, square, resourceSet } = buildFixture();
    const objectIds = new ObjectIdMap();
    const classId = objectIds.idFor(shape);

    const response = handleConcreteSubtypesRequest({ type: 'typemf/concreteSubtypes', requestId: 'r1', classId }, { objectIds, resourceSet });

    expect(response.type).toBe('typemf/concreteSubtypesResult');
    if (response.type === 'typemf/concreteSubtypesResult') {
      const resolved = response.classIds.map((id) => objectIds.objectFor(id)).sort();
      expect(resolved).toEqual([circle, square].sort());
    }
  });

  it('scopes the search to the document\'s own resourceSet registry, not any other', () => {
    const { shape, resourceSet } = buildFixture();
    // A second, completely separate registry/resourceSet with its own, unrelated concrete class -
    // must never show up in a query scoped to the FIRST document's own resourceSet.
    const otherPkg = new EPackageImpl();
    otherPkg.setName('other');
    otherPkg.setNsURI('https://example.com/other');
    const otherClass = new EClassImpl();
    otherClass.setName('Unrelated');
    otherClass.getESuperTypes().add(shape);
    otherPkg.getEClassifiers().add(otherClass);

    const objectIds = new ObjectIdMap();
    const classId = objectIds.idFor(shape);
    const response = handleConcreteSubtypesRequest({ type: 'typemf/concreteSubtypes', requestId: 'r2', classId }, { objectIds, resourceSet });

    expect(response.type).toBe('typemf/concreteSubtypesResult');
    if (response.type === 'typemf/concreteSubtypesResult') {
      expect(response.classIds).toHaveLength(2); // just Circle and Square - otherClass was never in resourceSet's own registry
    }
  });

  it('returns a ConcreteSubtypesError for an unknown classId', () => {
    const { resourceSet } = buildFixture();
    const objectIds = new ObjectIdMap();
    const response = handleConcreteSubtypesRequest({ type: 'typemf/concreteSubtypes', requestId: 'r3', classId: 'not-real' }, { objectIds, resourceSet });
    expect(response.type).toBe('typemf/concreteSubtypesError');
  });
});
