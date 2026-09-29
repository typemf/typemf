import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * These 4 bodies (EEnum.getEEnumLiteral x2 overloads, getEEnumLiteralByLiteral, EFactory
 * .createFromString/convertToString) live on classifiers ("EEnum", "EFactory") that only exist as
 * real, method-bearing generated classes when SELF-HOSTING Ecore.ecore itself - an ORDINARY domain
 * EEnum classifier compiles to a plain native TS `enum`, with no EEnumImpl class at all (confirmed:
 * an earlier version of this test tried exactly that and found no such file in the output). So this
 * exercises the real fixture in generate-ecore mode, the only way these bodies are ever reached.
 *
 * NOTE: text-only verification here, not execution - self-hosted output cannot run in isolation AT
 * ALL (confirmed directly): it imports foundational hand-written files it never generates itself
 * (EObject.ts; BasicEList.ts, EObjectImpl.ts, EFactoryImpl.ts too - all "internal-from" imports
 * pointing at the surrounding hand-written @typemf/core, not Ecore classifiers), so even runtime
 * execution needs the full hand-written core present on disk, not achievable in an isolated temp
 * directory. That full runtime verification already happened, successfully, via check_ecore.py
 * against the real workspace (documented in NOTES.md, including real execution of exactly these 4
 * operations); this test is a lighter, codegen-level regression guard - it catches a broken TEMPLATE
 * (wrong dispatch, wrong body, missing overload) even though it cannot catch a broken runtime
 * interaction.
 */
describe('the 4 independent stub bodies (point 2): getEEnumLiteral (overloaded), getEEnumLiteralByLiteral, createFromString, convertToString', () => {
  it('generates the correct overload dispatch and body content for all 4 operations', async () => {
    const fixturePath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'Ecore.ecore');
    const files = generate(await loadEcorePackage(fixturePath), typescriptTemplateSet, { 'generate-ecore': true });

    const eEnumImpl = files.find((f) => f.path === 'impl/EEnumImpl.ts')!.content;
    expect(eEnumImpl).toContain('getEEnumLiteral(name: string): EEnumLiteral | undefined;');
    expect(eEnumImpl).toContain('getEEnumLiteral(value: number): EEnumLiteral | undefined;');
    expect(eEnumImpl).toMatch(/getEEnumLiteral\(nameOrValue: string \| number\): EEnumLiteral \| undefined \{/);
    expect(eEnumImpl).toContain("if (typeof nameOrValue === 'string')");
    expect(eEnumImpl).toContain('literal.getName() === name');
    expect(eEnumImpl).toContain("if (typeof nameOrValue === 'number')");
    expect(eEnumImpl).toContain('literal.getValue() === value');
    expect(eEnumImpl).toMatch(/getEEnumLiteralByLiteral\(literal: string\): EEnumLiteral \| undefined \{/);
    expect(eEnumImpl).toContain('candidate.getLiteral() === literal');
    expect(eEnumImpl).not.toContain('has no `body` annotation'); // none of these 3 are stubs anymore

    const eFactoryImpl = files.find((f) => f.path === 'impl/EFactoryImpl.ts')!.content;
    expect(eFactoryImpl).toMatch(/createFromString\(eDataType: EDataType, literalValue: string\)/);
    expect(eFactoryImpl).toContain("case 'EInt':");
    expect(eFactoryImpl).toContain('return Number(literalValue);');
    expect(eFactoryImpl).toContain("case 'EBoolean':");
    expect(eFactoryImpl).toContain("return literalValue === 'true';");
    expect(eFactoryImpl).toContain('return BigInt(literalValue);'); // EBigInteger
    expect(eFactoryImpl).toMatch(/convertToString\(eDataType: EDataType, instanceValue:/);
    expect(eFactoryImpl).toContain('return String(instanceValue);');
    expect(eFactoryImpl).toContain('not a valid classifier'); // the ownership check
    expect(eFactoryImpl).not.toContain('has no `body` annotation');
  });
});
