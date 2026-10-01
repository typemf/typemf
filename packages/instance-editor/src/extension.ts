import { NodeFileUriConverter } from '@typemf/node';
import { activate as activateRuntime, deactivate as deactivateRuntime } from 'vscode-runtime';
import * as vscode from 'vscode';
import { InstanceEditorProvider } from './instance-editor-provider.js';
import { registerNewInstanceCommand } from './new-instance-command.js';

/**
 * vscode-runtime is no longer a separate, independently-activated VS Code extension (see
 * package.json's own "single TypeMF entry in Settings/Extensions" reasoning) - its own activate()
 * is now just a plain, directly-called function, no cross-extension vscode.extensions.getExtension()
 * lookup involved at all. Still genuinely async (loadConfiguredEcoreMappings does real file I/O),
 * so this extension's own activate() awaits it in turn - VS Code natively supports an async
 * activate(), awaiting whatever it returns before considering this extension fully active.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const runtime = await activateRuntime(context);

  // vscode-runtime's own design deliberately registers nothing into uriConverterRegistry itself -
  // "whoever assembles the runtime for that environment" does, which for the (Node) extension
  // host is this extension's own job. Never done before now - a real, confirmed bug: both
  // openNewInstance and openExistingInstance construct their ResourceSet against this same,
  // shared registry, so without this, neither could ever actually read or write a real file.
  runtime.uriConverterRegistry.register(new NodeFileUriConverter());

  const provider = new InstanceEditorProvider(runtime, context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(InstanceEditorProvider.viewType, provider, {
      supportsMultipleEditorsPerDocument: false,
    }),
    // The exact same provider instance, registered a second time under a second viewType - see
    // InstanceEditorProvider.ecoreDefaultViewType's own reasoning for why *.ecore needs this
    // separate registration rather than sharing the first one.
    vscode.window.registerCustomEditorProvider(InstanceEditorProvider.ecoreDefaultViewType, provider, {
      supportsMultipleEditorsPerDocument: false,
    }),
    registerNewInstanceCommand(runtime)
  );
}

export function deactivate(): void {
  // A no-op today (vscode-runtime's own deactivate() has no real cleanup logic either), but
  // called anyway now that it's a plain, directly-called function rather than a separate
  // extension VS Code would deactivate on its own - correct regardless of whether either one ever
  // gains real cleanup work later.
  deactivateRuntime();
}
