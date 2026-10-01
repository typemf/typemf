import * as core from '@typemf/core';
import * as json from '@typemf/json';
import * as node from '@typemf/node';
import * as xmi from '@typemf/xmi';
import { createRequire } from 'node:module';
import * as vscode from 'vscode';
import { loadConfiguredEcoreMappings } from './load-ecore-mappings.js';
import { registerManifestModules } from './manifest-modules.js';
import type { TypeMfRuntimeApi } from './api.js';
import { TypeMfRuntime } from './typemf-runtime.js';

/** Versions of the TypeMF libraries bundled into the runtime extension. */
export interface BuiltinModuleVersions {
  '@typemf/core': string;
  '@typemf/json': string;
  '@typemf/node': string;
  '@typemf/xmi': string;
}

/**
 * Creates the shared runtime: provides the bundled TypeMF libraries as shared modules, declares
 * the modules of all installed extensions (and of extensions installed later), and loads the
 * `typemf.ecoreMappings` setting. Called by the runtime extension's `activate()`.
 */
export async function activateRuntime(context: vscode.ExtensionContext, versions: BuiltinModuleVersions): Promise<TypeMfRuntimeApi> {
  const runtime = new TypeMfRuntime();
  runtime.uriConverterRegistry.register(new node.NodeFileUriConverter());
  runtime.modules.provide('@typemf/core', versions['@typemf/core'], core);
  runtime.modules.provide('@typemf/json', versions['@typemf/json'], json);
  runtime.modules.provide('@typemf/node', versions['@typemf/node'], node);
  runtime.modules.provide('@typemf/xmi', versions['@typemf/xmi'], xmi);

  const scanned = new Set<string>();
  const scanNewExtensions = () => {
    const added = vscode.extensions.all.filter((extension) => !scanned.has(extension.id));
    for (const extension of added) scanned.add(extension.id);
    for (const problem of registerManifestModules(runtime, added, loadCommonJsFile)) {
      console.warn(`TypeMF runtime: ${problem}`);
    }
  };
  scanNewExtensions();
  context.subscriptions.push(vscode.extensions.onDidChange(scanNewExtensions));

  await loadConfiguredEcoreMappings(vscode.workspace.workspaceFolders ?? [], runtime);
  return runtime;
}

function loadCommonJsFile(absolutePath: string): unknown {
  return createRequire(absolutePath)(absolutePath);
}
