export * from './typemf-runtime.js';
export * from './register-defaults.js';
export * from './register-ecore-metamodel.js';
export * from './ecore-mappings.js';
// activate/deactivate too - vscode-runtime is no longer registered as its own, separate VS Code
// extension (see instance-editor's own package.json for the "single TypeMF entry" reasoning);
// instance-editor's own extension.ts now calls this activate() directly, as a plain function call,
// rather than through a cross-extension vscode.extensions.getExtension() lookup.
export * from './extension.js';
