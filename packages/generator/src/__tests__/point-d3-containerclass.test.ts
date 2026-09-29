import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * D3: EStructuralFeature.getContainerClass() - the last remaining stub, closed. Like featureID/
 * classifierID/operationID, this is special-cased bookkeeping (see isBookkeepingOperation), not a body
 * annotation. TypeScriptClass, real EMF's Class<?> analog, is now real, hand-written @typemf/core (was
 * only ever a stand-in file in verification scripts before this point). containerClass is set during
 * bootstrap to the feature's declaring classifier's own CONCRETE implementation class - the closest
 * TypeScript has to Java's containerClass semantics, since TypeScript interfaces have no runtime
 * existence at all (real EMF uses the declared INTERFACE's class object).
 *
 * Text-only verification, same rationale as points 2/4/5's own tests: self-hosted output cannot run in
 * isolation. Real execution verification already happened, successfully, via check_ecore.py against the
 * real workspace (documented in NOTES.md) - including confirming the container class is a real, usable
 * constructor (able to construct a real instance with it), distinct per declaring class, and that
 * setContainerClass is genuinely absent from the public EStructuralFeature interface (a real,
 * compile-time @ts-expect-error check in packages/core's own test suite, not just the impl).
 */
describe('D3: EStructuralFeature.getContainerClass() - the bookkeeping fix, and containerClass bootstrap wiring', () => {
  it('generates a real containerClass field/getter/setter (impl-only setter), and wires it correctly during bootstrap', async () => {
    const fixturePath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');
    const files = generate(await loadEcorePackage(fixturePath), typescriptTemplateSet, { 'generate-ecore': true });

    const eStructuralFeatureImpl = files.find((f) => f.path === 'impl/EStructuralFeatureImpl.ts')!.content;
    expect(eStructuralFeatureImpl).toContain('private containerClass: TypeScriptClass<unknown> | undefined;');
    expect(eStructuralFeatureImpl).toMatch(/getContainerClass\(\): TypeScriptClass<unknown> \| undefined \{\s*return this\.containerClass;/);
    expect(eStructuralFeatureImpl).toMatch(/setContainerClass\(cls: TypeScriptClass<unknown> \| undefined\): void \{/);
    expect(eStructuralFeatureImpl).not.toContain('has no `body` annotation');
    expect(eStructuralFeatureImpl).toContain("from '../types/TypeScriptClass.js'");

    // setContainerClass must NOT appear on the EStructuralFeature type interface, only the impl.
    const eStructuralFeatureType = files.find((f) => f.path === 'types/EStructuralFeature.ts')!.content;
    expect(eStructuralFeatureType).toContain('getContainerClass()');
    expect(eStructuralFeatureType).not.toContain('setContainerClass');

    const epackageImpl = files.find((f) => f.path === 'impl/EcorePackageImpl.ts')!.content;
    expect(epackageImpl).toMatch(/\.setContainerClass\(EClassifierImpl\);/); // a real, specific example
    expect(epackageImpl).toContain('import { EClassifierImpl }'); // the needed import actually landed
  });
});
