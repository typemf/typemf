import { describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('imports go through index.ts files, not per-classifier files (item 2a)', () => {
  it('efactory.njk imports classifier types/impl through the index files, not individually', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const factoryTypes = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factoryTypes.content).toContain("from './types/index.js'");
    expect(factoryTypes.content).not.toContain("from './types/Book.js'");

    const factoryImpl = files.find((f) => f.path === 'impl/LibraryFactoryImpl.ts')!;
    expect(factoryImpl.content).toContain("from '../types/index.js'");
    expect(factoryImpl.content).toContain("from './index.js'");
    expect(factoryImpl.content).not.toContain("from './BookImpl.js'");
  });

  it('eswitch.njk imports every classifier through types/index.js, not individually', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const switchFile = files.find((f) => f.path === 'util/LibrarySwitch.ts')!;
    expect(switchFile.content).toContain("from '../types/index.js'");
    expect(switchFile.content).not.toContain("from '../types/Book.js'");
  });
});

describe('generate-ecore option switches @typemf/core imports to relative paths (item 2b)', () => {
  it('defaults to the published package when the option is not set', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const bookTypes = files.find((f) => f.path === 'types/Book.ts')!;
    expect(bookTypes.content).toContain("from '@typemf/core'");

    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain("from '@typemf/core'");
  });

  it('uses relative paths, correctly resolving depth per output location, when generate-ecore is set', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, { 'generate-ecore': true });

    for (const file of files) {
      expect(file.content, `${file.path} should not import '@typemf/core' in generate-ecore mode`).not.toContain(
        "from '@typemf/core'"
      );
    }

    // types/{Name}.ts (same folder as core's own types/): './index.js'
    const bookTypes = files.find((f) => f.path === 'types/Book.ts')!;
    expect(bookTypes.content).toContain("from './index.js'");

    // impl/{Name}Impl.ts: '../types/index.js' for types-shaped, './index.js' for impl-shaped
    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain("from '../types/index.js'");
    expect(bookImpl.content).toContain("from './index.js'");

    // root Package/Factory: './types/index.js' / './impl/index.js'
    const factory = files.find((f) => f.path === 'LibraryFactory.ts')!;
    expect(factory.content).toContain("from './types/index.js'");

    // util/Switch.ts: '../types/index.js'
    const switchFile = files.find((f) => f.path === 'util/LibrarySwitch.ts')!;
    expect(switchFile.content).toContain("from '../types/index.js'");
  });
});
