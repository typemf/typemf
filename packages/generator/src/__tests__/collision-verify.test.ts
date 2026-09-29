import { describe, it, expect } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { findUnresolvedCollisions, metaclassAccessorCollision } from '../typescript-filters.js';

describe('metaclassAccessorCollision', () => {
  it('finds the real, inherited operation each of the two known metaclass-accessor collisions resolves to', async () => {
    const pkg = await loadEcorePackage('/home/claude/typemf_workspace/packages/generator/src/__tests__/fixtures/Ecore.ecore');
    const annotationCollision = metaclassAccessorCollision('EAnnotation', pkg);
    expect(annotationCollision?.getName()).toBe('getEAnnotation');
    const classifierCollision = metaclassAccessorCollision('EClassifier', pkg);
    expect(classifierCollision?.getName()).toBe('getEClassifier');
    // Everything else should have no colliding operation at all.
    for (const c of pkg.getEClassifiers()) {
      if (c.getName() === 'EAnnotation' || c.getName() === 'EClassifier') continue;
      expect(metaclassAccessorCollision(c.getName()!, pkg)).toBeUndefined();
    }
  });
});

describe('findUnresolvedCollisions', () => {
  it('finds exactly the two known, currently-unresolved collisions in real Ecore.ecore', async () => {
    const pkg = await loadEcorePackage('/home/claude/typemf_workspace/packages/generator/src/__tests__/fixtures/Ecore.ecore');
    const collisions = findUnresolvedCollisions(pkg);
    for (const c of collisions) {
      console.log(`${c.classifierName}.${c.memberName}: ${c.sources.join(' vs ')}`);
    }
    expect(collisions).toEqual([]);
  });
});
