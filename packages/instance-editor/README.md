# TypeMF Instance Editor

A tree-based editor for EMF model instances in VS Code. It opens `.xmi`, `.json` and `.ecore`
files and edits them reflectively, so it works for generated metamodels as well as for metamodels
that are only available as a `.ecore` file.

This extension is a preview. File formats and behavior may still change before 1.0.

## Features

- **Tree and properties view.** The left pane shows the containment tree, the right pane the
  attributes and references of the selected object.
- **Editing.** Attributes are edited with a text field, number field, checkbox or enum drop-down,
  depending on their type. Containment features get **+ Add** with a choice of the concrete
  subclasses; references get **+ Link** for objects in the same file and **Link external…** for
  objects in other files.
- **Follow reference.** Jumps to the referenced object in the tree.
- **New model instance.** The command **TypeMF: New Model Instance** creates a new file with a
  root object of a class you pick, either from a registered metamodel or from a `.ecore` file. The
  new file can be saved as XMI, JSON or Ecore.
- **Missing metamodels.** When a file uses a metamodel that isn't registered, the editor asks you
  to select the `.ecore` file(s) for it.

## Opening files

`.ecore` files open in this editor by default. For `.xmi` and `.json` files, use
**Open With… → TypeMF Instance Editor**, so that ordinary JSON files keep opening in the text
editor.

## Registering metamodels

The editor finds metamodels in the shared registry of the
[TypeMF Runtime](https://marketplace.visualstudio.com/items?itemName=typemf.vscode-runtime)
extension, which is installed with it. A metamodel gets there in one of two ways:

- an extension provides a generated model package (see `@typemf/vscode-runtime` on npm), or
- the `typemf.ecoreMappings` setting maps an nsURI to a `.ecore` file in your workspace:

  ```json
  "typemf.ecoreMappings": [
    { "nsURI": "https://example.org/library", "ecoreFile": "model/library.ecore" }
  ]
  ```

## Generator configs

Files named `*.typemf-generator.json` (or `typemf-generator.json`) are configs of `typemf-generate`, the
[code generator](https://www.npmjs.com/package/@typemf/generator), and open in a form instead of the
text editor:

- **Ecore file** and **Output folder** are chosen with a file or folder picker and stored relative to
  the config file.
- **Template set** lists the built-in `typescript` set and the sets of the project's dependencies.
  **Add package…** adds the folder of another package that declares template sets.
- **Options** are shown as a form built from the options schema of the template set. For the
  `typescript` set, the keys of `package-imports` and `type-imports` are suggested from the packages
  and data types the model refers to.
- **Generate** runs the generator and asks before it overwrites files whose content would change.

A template set with a hooks module runs code from the workspace, so it needs a trusted workspace.
**Edit as text** opens the file in the text editor, with completion and validation of the fields.

## Settings

| Setting                                | Default | Description                                                                 |
| -------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `typemf.showDerivedFeatures`           | `false` | Show derived (computed) features, read-only.                                |
| `typemf.generator.templateSetPackages` | `[]`    | Folders of packages whose template sets the generator config editor offers. |

## Limitations

- No undo/redo. **Revert File** discards all unsaved changes.
- XMI files must have exactly one root object.

## License

[Apache-2.0](LICENSE). Source: [github.com/typemf/typemf](https://github.com/typemf/typemf).
