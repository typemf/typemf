import { describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('imports reference files directly', () => {
  it('the factory imports each classifier directly', () => {
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

  it('the switch imports each classifier directly', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const switchFile = files.find((f) => f.path === 'util/LibrarySwitch.ts')!;
    expect(switchFile.content).toContain("from '../types/Book.js'");
    expect(switchFile.content).toContain("from '../types/AudioBook.js'");
    expect(switchFile.content).toContain("from '../types/Library.js'");
    expect(switchFile.content).not.toContain('index.js');
  });

  it('no index.ts barrel is generated', () => {
    const { libraryPackage } = buildSampleMetamodel();
    for (const options of [{}, { 'generate-ecore': true }]) {
      const files = generate(libraryPackage, typescriptTemplateSet, options);
      const barrelPaths = files.map((f) => f.path).filter((p) => p.endsWith('index.ts'));
      expect(barrelPaths).toEqual([]);
    }
  });

  it('no generated file imports from index.js', () => {
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

describe('the generate-ecore option', () => {
  it('without it, foundational names are imported from @typemf/core', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const bookTypes = files.find((f) => f.path === 'types/Book.ts')!;
    expect(bookTypes.content).toContain("from '@typemf/core'");

    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain("from '@typemf/core'");
  });

  it("the package's own classifiers are always imported relatively", () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const factoryTypes = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factoryTypes.content).not.toContain("Book } from '@typemf/core'");
    expect(factoryTypes.content).toContain("from './types/Book.js'");
  });

  it('with it, foundational names are imported relatively from each folder', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });

    for (const file of files) {
      expect(file.content, `${file.path} should not import '@typemf/core' in generate-ecore mode`).not.toContain(
        "from '@typemf/core'"
      );
    }

    // A barrel would make all files of a folder one import cycle.
    const bookTypes = files.find((f) => f.path === 'types/Book.ts')!;
    expect(bookTypes.content).toContain("from './EObject.js'");
    expect(bookTypes.content).not.toContain("from './index.js'");

    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain("from '../types/EStructuralFeature.js'");
    expect(bookImpl.content).toContain("from './EObjectImpl.js'");
    expect(bookImpl.content).toContain("from './BasicEList.js'");

    const factory = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factory.content).toContain("from './types/Book.js'");

    const switchFile = files.find((f) => f.path === 'util/LibrarySwitch.ts')!;
    expect(switchFile.content).toContain("from '../types/Book.js'");
  });
});

describe('imports are deduplicated and sorted', () => {
  it('no file imports the same name twice', () => {
    const { libraryPackage } = buildSampleMetamodel();
    for (const options of [{}, { 'generate-ecore': true }]) {
      const files = generate(libraryPackage, typescriptTemplateSet, options);
      for (const file of files) {
        const importLines = file.content.match(/^import \{[^}]*\} from '[^']*';$/gm) ?? [];
        const seen = new Map<string, string>();
        for (const line of importLines) {
          const names = line
            .match(/\{([^}]*)\}/)![1]!
            .split(',')
            .map((n) => n.trim());
          for (const name of names) {
            expect(
              seen.has(name),
              `${file.path}: "${name}" imported twice (already from ${seen.get(name)}, now also ${line})`
            ).toBe(false);
            seen.set(name, line);
          }
        }
      }
    }
  });

  it('repeated generations produce identical output', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const filesA = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });
    const filesB = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });
    const bookImplA = filesA.find((f) => f.path === 'impl/BookImpl.ts')!;
    const bookImplB = filesB.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImplA.content).toBe(bookImplB.content);
  });
});
