# @typemf/generator

Template-based code generation, targeting the design agreed on in planning:

- **Template sets are the extension point.** A `TemplateSet` is `{ name, baseFolder }` -
  `baseFolder` contains a `main.njk` entry point and is *also* the private include/import
  resolution root for that set. Two different sets never see each other's templates; there's
  no override mechanism to design because isolation is structural.
- **`main.njk` is invoked once per run**, handed the whole `EPackage` as a Nunjucks global. It's
  the template-set author's own job to iterate whatever they need and call `{% file %}` as many
  times as they want - the generator's own orchestration doesn't impose a fixed per-class loop.
- **The custom `{% file %}` tag** is what lets one template produce any number of output files:
  `{% file somePathExpression %}...content...{% endfile %}`. Content outside a `{% file %}`
  block is silently discarded.
- **`generate()` is pure** - `generate(pkg, templateSet, options?) -> GeneratedFile[]`, an
  in-memory array of `{ path, content }` with relative paths. Writing them anywhere is a
  separate, later step the caller owns.
- **Classifier/feature IDs are freshly assigned at generation time**, in declaration order,
  matching real EMF's own behaviour - see `id-assignment.ts`.

## The built-in `typescript` template set

Full custom generated classes (the original TMF architecture, not thin wrappers over
`DynamicEObjectImpl`) - real private fields, real `eGet`/`eSet`/`eBasicSetValue`/`eIsSet`/
`eUnset` switch dispatch per class, with inherited features delegated to `super.eGet()` etc.
rather than re-handled locally. `api`/`gen`/`impl` three-layer split per `EClass`, matching the
original TMF; `impl/` is generated once and never touched again.

Also generates a `Package` singleton (rebuilding the metamodel as real runtime `EClassImpl`/
`EAttributeImpl`/etc. objects), a `Factory`, and a `Switch` visitor with correct supertype-
fallthrough dispatch.

**Documentation**: reads real EMF's own GenModel convention (`EAnnotation` source
`http://www.eclipse.org/emf/2002/GenModel`, details key `documentation`) and renders it as a
JSDoc comment - see `typescript-filters.ts`'s `docComment()`.

**Operation bodies**: an `EOperation` with our own operation-body annotation (source
`https://typemf.dev/generator`, details key `body:typescript`) generates as a concrete method;
without one, it generates as `abstract`, matching the original TMF's expectation that operation
logic lives in the hand-written `impl` layer. See `NOTES.md` for why this is a separate
annotation from real EMF's own `body` key, not a reuse of it.

## Verified against real, compiled, and executed output - not just inspected

`src/__tests__/generate-real-typescript.test.ts` and `generate-operations-and-enum.test.ts`
write generated `.ts` files to a real path, type-check them with the TypeScript compiler API
against the actual built `@typemf/core`, transpile them, and dynamically `import()` and
genuinely execute the result: factory instantiation, inherited getters across a real class
hierarchy, containment (`eContainer()` correctly set via `@typemf/core`'s unmodified
`eDidAdd`/`eDidRemove`), non-containment references, the full reflective `eGet`/`eSet`/
`eIsSet`/`eUnset` path, `fullId()`, switch-based visitor dispatch with supertype fallthrough,
an annotation-provided operation body, and a generated `EEnum`. Three genuine bugs (a missing
supertype import, an eager-construction circular-import crash, and a missing runtime
`classifierID` assignment) were found and fixed exactly because these tests actually compile
and run the output rather than only asserting on its text - see `NOTES.md` for the two
circular-import ones specifically, since they're easy to reintroduce if the generated shape is
"simplified" later.

## Usage

```ts
import { generate, typescriptTemplateSet } from '@typemf/generator';

const files = generate(myPackage, typescriptTemplateSet, { /* options.* in templates */ });
for (const file of files) {
  // write file.path (relative) under wherever you want, e.g. via @typemf/node
}
```

## Ecore self-hosting

`src/ecore-seed.ts` hand-authors a real, scoped subset of Ecore's own metamodel (10 metaclasses,
real names, real `nsURI`) for generation - intended to be copied into `@typemf/core`'s own
source tree by hand, not consumed as a second published package alongside it. The generator's
own correctness for this scenario (5-level inheritance, two kinds of self-reference -
`EReference.eOpposite: EReference` and `EClass.eSuperTypes: EClass[]`, real containment through
generated classes) was separately proven with a `Meta`-prefixed variant, compiled and actually
executed against the real, built `@typemf/core`. The delivered output uses real, unprefixed
names and has NOT been re-verified in that shape - see `NOTES.md` for the full reasoning,
including the naming-collision finding and a real bug this surfaced (fixed) in how the `gen/`
layer computes its own imports.

## CLI

```bash
npx typemf-generate [path/to/typemf-generator.config.json]  # defaults to ./typemf-generator.config.json
```

```json
{
  "ecoreFile": "./model/library.ecore",
  "outputDir": "./generated",
  "templateSet": "typescript",
  "options": {}
}
```

One config, one template set, one `.ecore` file, one `outputDir` - per the design discussion.
Generating multiple languages means running the CLI multiple times against different config
files (`typescript.typemf-generator.json`, `java.typemf-generator.json`, ...), not one config
handling several sets. Paths in the config (`ecoreFile`, `outputDir`) resolve relative to the
config file's own directory, not wherever the CLI happens to be invoked from.

**`ecoreFile` loading is not implemented yet** - see `NOTES.md`. The CLI's other machinery
(config validation, template set resolution, `generate()`, writing files) is fully built and
tested; only the "`.ecore` file text -> `EPackage`" step is an honestly-stubbed error today,
pending `@typemf/core`'s own `ecore/` parser. In the meantime, skip the CLI and call `generate()`
directly with a programmatically-built `EPackage`.

## Not yet built

Third-party template set registration (the CLI's `resolveTemplateSet()` only knows the
built-in `"typescript"` name today - see `NOTES.md`). `@typemf/core`'s `ecore/` parser itself,
which the CLI's `ecoreFile` config option is waiting on.
