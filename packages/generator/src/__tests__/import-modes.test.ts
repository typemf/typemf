import { describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('imports are always direct, per-file references - never a barrel (item 1)', () => {
  it('efactory.njk imports each classifier type/impl directly, never through an index.js barrel', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const factoryTypes = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factoryTypes.content).toContain("from './types/Book.js'");
    expect(factoryTypes.content).toContain("from './types/AudioBook.js'");
    expect(factoryTypes.content).toContain("from './types/Library.js'");
    expect(factoryTypes.content).not.toContain('index.js');

    const factoryImpl = files.find((f) => f.path === 'impl/LibraryFactoryImpl.ts')!;
    expect(factoryImpl.content).toContain("from './BookImpl.js'");
    expect(factoryImpl.content).toContain("from './AudioBookImpl.js'");
    expect(factoryImpl.content).toContain("from './LibraryImpl.js'");
    expect(factoryImpl.content).not.toContain('index.js');
  });

  it('eswitch.njk imports each classifier directly, never through an index.js barrel', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const switchFile = files.find((f) => f.path === 'util/LibrarySwitch.ts')!;
    expect(switchFile.content).toContain("from '../types/Book.js'");
    expect(switchFile.content).toContain("from '../types/AudioBook.js'");
    expect(switchFile.content).toContain("from '../types/Library.js'");
    expect(switchFile.content).not.toContain('index.js');
  });

  it('never generates an index.ts barrel file at all, in either mode', () => {
    const { libraryPackage } = buildSampleMetamodel();
    for (const options of [{}, { 'generate-ecore': true }]) {
      const files = generate(libraryPackage, typescriptTemplateSet, options);
      const barrelPaths = files.map((f) => f.path).filter((p) => p.endsWith('index.ts'));
      expect(barrelPaths).toEqual([]);
    }
  });

  it('no generated file, in either mode, ever imports from an index.js barrel', () => {
    const { libraryPackage } = buildSampleMetamodel();
    for (const options of [{}, { 'generate-ecore': true }]) {
      const files = generate(libraryPackage, typescriptTemplateSet, options);
      for (const file of files) {
        expect(file.content, `${file.path} (generate-ecore: ${Boolean(options['generate-ecore'])})`).not.toMatch(
          /from '[^']*index\.js'/
        );
      }
    }
  });
});

describe('generate-ecore option switches @typemf/core imports to relative paths (item 2)', () => {
  it('defaults to the published package for foundational names when the option is not set', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const bookTypes = files.find((f) => f.path === 'types/Book.ts')!;
    expect(bookTypes.content).toContain("from '@typemf/core'");

    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain("from '@typemf/core'");
  });

  it("this metamodel's own classifiers (Book, AudioBook, Library) are always relative, even when the option is not set", () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const factoryTypes = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factoryTypes.content).not.toContain("Book } from '@typemf/core'");
    expect(factoryTypes.content).toContain("from './types/Book.js'");
  });

  it('uses relative paths, correctly resolving depth per output location, when generate-ecore is set', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });

    for (const file of files) {
      expect(file.content, `${file.path} should not import '@typemf/core' in generate-ecore mode`).not.toContain(
        "from '@typemf/core'"
      );
    }

    // types/{Name}.ts (same folder as core's own types/): direct,
    // per-file imports - never the barrel, which would put every file in
    // the folder into one circular strongly-connected component (a real,
    // confirmed bootstrap hazard for self-hosting, not just a
    // theoretical one - see NOTES.md).
    const bookTypes = files.find((f) => f.path === 'types/Book.ts')!;
    expect(bookTypes.content).toContain("from './EObject.js'");
    expect(bookTypes.content).not.toContain("from './index.js'");

    // impl/{Name}Impl.ts: direct, per-file imports throughout, both for
    // same-folder impl-shaped references and cross-folder types-shaped
    // ones.
    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain("from '../types/EStructuralFeature.js'");
    expect(bookImpl.content).toContain("from './EObjectImpl.js'");
    expect(bookImpl.content).toContain("from './BasicEList.js'");

    // root Package/Factory: direct, per-file imports for every classifier.
    const factory = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factory.content).toContain("from './types/Book.js'");

    // util/Switch.ts: direct, per-file imports for every classifier.
    const switchFile = files.find((f) => f.path === 'util/LibrarySwitch.ts')!;
    expect(switchFile.content).toContain("from '../types/Book.js'");
  });
});

describe('imports are deduplicated and sorted (item 3)', () => {
  it('never imports the same name twice from the same file, across every generated file, in either mode', () => {
    const { libraryPackage } = buildSampleMetamodel();
    for (const options of [{}, { 'generate-ecore': true }]) {
      const files = generate(libraryPackage, typescriptTemplateSet, options);
      for (const file of files) {
        const importLines = file.content.match(/^import \{[^}]*\} from '[^']*';$/gm) ?? [];
        const seen = new Map<string, string>();
        for (const line of importLines) {
          const names = line.match(/\{([^}]*)\}/)![1]!.split(',').map((n) => n.trim());
          for (const name of names) {
            expect(seen.has(name), `${file.path}: "${name}" imported twice (already from ${seen.get(name)}, now also ${line})`).toBe(
              false
            );
            seen.set(name, line);
          }
        }
      }
    }
  });

  it('produces byte-for-byte identical output across repeated generations, for stable, diffable regenerated code', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const filesA = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });
    const filesB = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });
    const bookImplA = filesA.find((f) => f.path === 'impl/BookImpl.ts')!;
    const bookImplB = filesB.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImplA.content).toBe(bookImplB.content);
  });
});
