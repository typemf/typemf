import { getTypeMfRuntime } from '@typemf/vscode-runtime';
import * as vscode from 'vscode';
import { GeneratorEditorProvider } from './generator-editor/generator-editor-provider.js';
import { InstanceEditorProvider } from './instance-editor-provider.js';
import { registerNewInstanceCommand } from './new-instance-command.js';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const runtime = await getTypeMfRuntime();

  const provider = new InstanceEditorProvider(runtime, context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(InstanceEditorProvider.viewType, provider, {
      supportsMultipleEditorsPerDocument: false,
    }),
    // The same provider again, as the default editor for *.ecore - see InstanceEditorProvider.ecoreDefaultViewType.
    vscode.window.registerCustomEditorProvider(InstanceEditorProvider.ecoreDefaultViewType, provider, {
      supportsMultipleEditorsPerDocument: false,
    }),
    vscode.window.registerCustomEditorProvider(
      GeneratorEditorProvider.viewType,
      new GeneratorEditorProvider(context.extensionUri)
    ),
    registerNewInstanceCommand(runtime)
  );
}

export function deactivate(): void {}
