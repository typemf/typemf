import { readTemplateSetPackage } from '@typemf/generator';
import { dirname, isAbsolute, resolve } from 'node:path';
import * as vscode from 'vscode';
import { formatConfig, parseConfigText } from './config-text.js';
import { generateFromConfig, summarizeEcoreFile } from './generation.js';
import {
  GenerateResultMessage,
  isGeneratorMessage,
  JsonObject,
  PickField,
  StateMessage,
  SummaryMessage,
  TemplateSetView,
  WebviewToHostMessage,
} from './protocol.js';
import { relativeToDir } from './relative-path.js';
import { loadTemplateSetViews, optionProblems } from './template-set-views.js';

const SETTINGS_SECTION = 'typemf.generator';
const PACKAGES_SETTING = 'templateSetPackages';

function randomNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  return nonce;
}

/**
 * A form for a generator config file (`*.typemf-generator.json`) with a "Generate" button. The text
 * document stays the single source of truth, so undo, save and external changes work as for any
 * text file.
 */
export class GeneratorEditorProvider implements vscode.CustomTextEditorProvider {
  static readonly viewType = 'typemf.generatorEditor';

  constructor(private readonly extensionUri: vscode.Uri) {}

  async resolveCustomTextEditor(document: vscode.TextDocument, panel: vscode.WebviewPanel): Promise<void> {
    const webview = panel.webview;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist-webview')],
    };
    webview.html = this.renderHtml(webview);

    const configDir = dirname(document.uri.fsPath);
    const post = (message: StateMessage | SummaryMessage | GenerateResultMessage): void => {
      void webview.postMessage(message);
    };

    let views: TemplateSetView[] = [];
    let templateSetProblems: string[] = [];
    let ownText: string | undefined;
    let generating = false;
    let edits: Promise<unknown> = Promise.resolve();

    const explicitPackages = (): string[] => this.configuredPackages(document.uri);

    const refreshTemplateSets = async (): Promise<void> => {
      const loaded = await loadTemplateSetViews(configDir, explicitPackages());
      views = loaded.views;
      templateSetProblems = loaded.problems;
    };

    const postState = (echo: boolean): void => {
      const parsed = parseConfigText(document.getText());
      const state: StateMessage = {
        type: 'typemf/generator/state',
        templateSets: views,
        templateSetProblems,
        problems: 'config' in parsed ? optionProblems(views, parsed.config.templateSet, parsed.config.options) : [],
        echo,
        ...('config' in parsed ? { config: parsed.config } : { parseError: parsed.error }),
      };
      post(state);
    };

    const applyConfig = (config: JsonObject): Promise<unknown> => {
      edits = edits.then(async () => {
        const text = formatConfig(config);
        if (text === document.getText()) return;
        ownText = text;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), text);
        await vscode.workspace.applyEdit(edit);
      });
      return edits;
    };

    const currentConfig = (): JsonObject | undefined => {
      const parsed = parseConfigText(document.getText());
      if ('config' in parsed) return parsed.config;
      void vscode.window.showErrorMessage(`TypeMF: ${document.fileName} is not valid JSON: ${parsed.error}`);
      return undefined;
    };

    const pick = async (field: PickField): Promise<void> => {
      const config = currentConfig();
      if (!config) return;
      const current = typeof config[field] === 'string' ? resolve(configDir, config[field]) : configDir;
      const [chosen] =
        (await vscode.window.showOpenDialog({
          defaultUri: vscode.Uri.file(current),
          canSelectFiles: field === 'ecoreFile',
          canSelectFolders: field === 'outputDir',
          canSelectMany: false,
          filters: field === 'ecoreFile' ? { 'Ecore models': ['ecore'] } : undefined,
          openLabel: 'Select',
        })) ?? [];
      if (chosen) await applyConfig({ ...config, [field]: relativeToDir(configDir, chosen.fsPath) });
    };

    const addTemplateSetPackage = async (): Promise<void> => {
      const [chosen] =
        (await vscode.window.showOpenDialog({
          defaultUri: vscode.Uri.file(configDir),
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: 'Add template set package',
        })) ?? [];
      if (!chosen) return;
      try {
        if ((await readTemplateSetPackage(chosen.fsPath)).length === 0) {
          throw new Error('its package.json declares no template sets ("typemf.templateSets").');
        }
        await this.addConfiguredPackage(document.uri, chosen.fsPath);
      } catch (err) {
        void vscode.window.showErrorMessage(`TypeMF: cannot add ${chosen.fsPath}: ${(err as Error).message}`);
        return;
      }
      await refreshTemplateSets();
      postState(false);
    };

    const generate = async (): Promise<void> => {
      if (generating) return;
      generating = true;
      try {
        const outcome = await generateFromConfig({
          configPath: document.uri.fsPath,
          configText: document.getText(),
          explicitPackages: explicitPackages(),
          trusted: vscode.workspace.isTrusted,
          confirmOverwrite: async (paths) => {
            const shown = paths.slice(0, 10).map((path) => vscode.workspace.asRelativePath(path));
            const more = paths.length > shown.length ? `\n…and ${paths.length - shown.length} more` : '';
            const answer = await vscode.window.showWarningMessage(
              `Overwrite ${paths.length} existing file${paths.length === 1 ? '' : 's'}?`,
              { modal: true, detail: shown.join('\n') + more },
              'Overwrite'
            );
            return answer === 'Overwrite';
          },
        });
        post(
          outcome.status === 'done'
            ? {
                type: 'typemf/generator/generateResult',
                status: 'done',
                outputRoot: outcome.outputRoot,
                files: outcome.files,
              }
            : { type: 'typemf/generator/generateResult', status: 'cancelled' }
        );
      } catch (err) {
        post({ type: 'typemf/generator/generateResult', status: 'failed', error: (err as Error).message });
      } finally {
        generating = false;
      }
    };

    const summarize = async (ecoreFile: string): Promise<void> => {
      try {
        post({ type: 'typemf/generator/summary', ecoreFile, summary: await summarizeEcoreFile(configDir, ecoreFile) });
      } catch (err) {
        post({ type: 'typemf/generator/summary', ecoreFile, error: (err as Error).message });
      }
    };

    const subscriptions = [
      webview.onDidReceiveMessage((raw: unknown) => {
        if (!isGeneratorMessage(raw)) return;
        const message = raw as WebviewToHostMessage;
        switch (message.type) {
          case 'typemf/generator/ready':
            void refreshTemplateSets().then(() => postState(false));
            break;
          case 'typemf/generator/edit':
            void applyConfig(message.config);
            break;
          case 'typemf/generator/pick':
            void pick(message.field);
            break;
          case 'typemf/generator/addTemplateSetPackage':
            void addTemplateSetPackage();
            break;
          case 'typemf/generator/requestSummary':
            void summarize(message.ecoreFile);
            break;
          case 'typemf/generator/generate':
            void generate();
            break;
          case 'typemf/generator/openAsText':
            void vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
            break;
        }
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.uri.toString() !== document.uri.toString() || event.contentChanges.length === 0) return;
        const echo = ownText !== undefined && document.getText() === ownText;
        postState(echo);
      }),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (!event.affectsConfiguration(`${SETTINGS_SECTION}.${PACKAGES_SETTING}`, document.uri)) return;
        void refreshTemplateSets().then(() => postState(false));
      }),
    ];
    panel.onDidDispose(() => subscriptions.forEach((subscription) => subscription.dispose()));
  }

  /** The template set package folders from the settings, absolute. */
  private configuredPackages(resource: vscode.Uri): string[] {
    const entries = vscode.workspace.getConfiguration(SETTINGS_SECTION, resource).get<string[]>(PACKAGES_SETTING, []);
    const base = vscode.workspace.getWorkspaceFolder(resource)?.uri.fsPath ?? dirname(resource.fsPath);
    return entries.map((entry) => (isAbsolute(entry) ? entry : resolve(base, entry)));
  }

  private async addConfiguredPackage(resource: vscode.Uri, folder: string): Promise<void> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);
    const stored = workspaceFolder ? relativeToDir(workspaceFolder.uri.fsPath, folder) : folder;
    const configuration = vscode.workspace.getConfiguration(SETTINGS_SECTION, resource);
    const entries = configuration.get<string[]>(PACKAGES_SETTING, []);
    if (entries.includes(stored)) return;
    await configuration.update(
      PACKAGES_SETTING,
      [...entries, stored],
      workspaceFolder ? vscode.ConfigurationTarget.WorkspaceFolder : vscode.ConfigurationTarget.Global
    );
  }

  private renderHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist-webview', 'generator.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist-webview', 'generator.css'));
    const nonce = randomNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri.toString()}" rel="stylesheet">
  <title>TypeMF Generator</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri.toString()}"></script>
</body>
</html>`;
  }
}
