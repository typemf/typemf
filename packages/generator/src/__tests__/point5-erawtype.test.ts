import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * Point 5: EGenericType.eRawType, plus the ETypedElement.eGenericType custom setter's eType side
 * effect (real EMF's own generated-setter behavior, previously missing from BOTH hand-written core and
 * generated code - found while scoping this point, not the original ask). Like points 2/4's operations,
 * these only exist as real, method-bearing generated code when SELF-HOSTING Ecore.ecore - text-only
 * verification here for the same reason as those (self-hosted output cannot run in isolation). Real
 * execution verification already happened, successfully, via check_ecore.py against the real workspace
 * (documented in NOTES.md) - including a real bug this uncovered (EList.get(0) throws on an empty list
 * rather than returning undefined, unlike a plain array) and the EObject-vs-EJavaObject correction
 * (real EMF's actual fallback is Java's Object, which this port models as EJavaObject, not EObject -
 * which is deliberately excluded from all generated-class treatment).
 */
describe('point 5: EGenericType.eRawType and the eGenericType custom setter', () => {
  it('generates the real eRawType body, and the eGenericType custom setter with its eType side effect', async () => {
    const fixturePath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');
    const files = generate(await loadEcorePackage(fixturePath), typescriptTemplateSet, { 'generate-ecore': true });

    const eGenericTypeImpl = files.find((f) => f.path === 'impl/EGenericTypeImpl.ts')!.content;
    expect(eGenericTypeImpl).toMatch(/getERawType\(\): EClassifier \| undefined \{/);
    expect(eGenericTypeImpl).toContain('if (this.getEClassifier() !== undefined) return this.getEClassifier();');
    expect(eGenericTypeImpl).toContain('!typeParameter.getEBounds().isEmpty()'); // the real bug this test suite caught
    expect(eGenericTypeImpl).toContain('return bound.getERawType();'); // recursion
    expect(eGenericTypeImpl).toContain('return upperBound.getERawType();'); // wildcard recursion
    expect(eGenericTypeImpl).toContain('getEcorePackageRef().getEJavaObject()'); // NOT getEObject()
    expect(eGenericTypeImpl).not.toContain('getEcorePackageRef().getEObject()');
    expect(eGenericTypeImpl).not.toContain('has no `body` annotation');

    const eTypedElementImpl = files.find((f) => f.path === 'impl/ETypedElementImpl.ts')!.content;
    expect(eTypedElementImpl).toContain('this.setEType(value?.getERawType());'); // the real EMF side effect
    // The custom setter must still wire containment/notification correctly, not bypass it -
    // replicating the default single-valued eSet dance rather than a bare field write.
    expect(eTypedElementImpl).toContain('this.eDidRemove(feature, oldValue);');
    expect(eTypedElementImpl).toContain('this.eDidAdd(feature, value);');
  });
});
