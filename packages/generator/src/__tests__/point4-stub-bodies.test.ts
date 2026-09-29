import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * Point 4: EOperation.isOverrideOf, EClass.getOverride, and EOperation.getOperationID (the bookkeeping
 * fix, not a body annotation). Like point 2's EEnum/EFactory operations, these only exist as real,
 * method-bearing generated code when SELF-HOSTING Ecore.ecore - so this exercises the real fixture in
 * generate-ecore mode. Text-only verification, not execution, for the same reason as point 2's own
 * tests: self-hosted output cannot run in isolation at all (needs the full hand-written @typemf/core
 * context on disk). Real execution verification already happened, successfully, via check_ecore.py
 * against the real workspace (documented in NOTES.md), including a hand-built Base -> Middle -> Leaf
 * hierarchy with a genuine override, direction-sensitivity, self-override exclusion, and distinct
 * operationIDs for the two getEStructuralFeature overloads specifically.
 */
describe('point 4: isOverrideOf, getOverride, and the getOperationID bookkeeping fix', () => {
  it('generates real bodies for isOverrideOf/getOverride, and a real operationID field (not a stub) for EOperation', async () => {
    const fixturePath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');
    const files = generate(await loadEcorePackage(fixturePath), typescriptTemplateSet, { 'generate-ecore': true });

    const eOperationImpl = files.find((f) => f.path === 'impl/EOperationImpl.ts')!.content;
    expect(eOperationImpl).toContain('private operationId = -1;');
    expect(eOperationImpl).toMatch(/getOperationID\(\): number \{\s*return this\.operationId;/);
    expect(eOperationImpl).toContain('setOperationID(id: number): void {');
    // getOperationID must NOT also appear as a second, throwing-stub declaration (the bookkeeping skip).
    expect(eOperationImpl).not.toMatch(/getOperationID\(\)[^{]*\{\s*throw new Error/);

    expect(eOperationImpl).toMatch(/isOverrideOf\(someOperation: EOperation\): boolean \{/);
    expect(eOperationImpl).toContain('if (someOperation === this) return false;');
    expect(eOperationImpl).toContain('if (thisClass === otherClass) return false;');
    expect(eOperationImpl).toContain('if (!otherClass.isSuperTypeOf(thisClass)) return false;');
    expect(eOperationImpl).toContain('if (this.getName() !== someOperation.getName()) return false;');
    expect(eOperationImpl).not.toContain('has no `body` annotation');

    const eClassImpl = files.find((f) => f.path === 'impl/EClassImpl.ts')!.content;
    expect(eClassImpl).toMatch(/getOverride\(operation: EOperation\): EOperation \| undefined \{/);
    expect(eClassImpl).toContain('if (operation.getEContainingClass() === this) return undefined;');
    expect(eClassImpl).toContain('if (candidate.isOverrideOf(operation)) return candidate;');
  });
});
