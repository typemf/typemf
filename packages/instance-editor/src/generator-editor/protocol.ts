/** The messages between the generator config editor and its webview. */

export type JsonObject = Record<string, unknown>;

/** What the webview shows of a template set. */
export interface TemplateSetView {
  name: string;
  description?: string;
  optionsSchema?: JsonObject;
  /** 'built-in', or the name of the package that declares it. */
  origin: string;
  /** The set has a hooks module, which runs code from the workspace. */
  runsCode: boolean;
}

/** What the pickers for the options `package-imports` and `type-imports` offer. */
export interface ModelSummaryView {
  name: string;
  nsURI: string;
  referencedPackages: string[];
  dataTypes: string[];
}

const PREFIX = 'typemf/generator/';

export interface StateMessage {
  type: 'typemf/generator/state';
  /** The parsed config; absent when the text is not a valid JSON object. */
  config?: JsonObject;
  parseError?: string;
  templateSets: TemplateSetView[];
  /** Problems finding template sets, e.g. two packages declaring the same name. */
  templateSetProblems: string[];
  /** Problems of the options against the schema of the chosen template set. */
  problems: string[];
  /** The change came from the webview itself: its own copy of the config is current, keep it. */
  echo: boolean;
}

export interface SummaryMessage {
  type: 'typemf/generator/summary';
  ecoreFile: string;
  summary?: ModelSummaryView;
  error?: string;
}

export interface GenerateResultMessage {
  type: 'typemf/generator/generateResult';
  status: 'done' | 'cancelled' | 'failed';
  outputRoot?: string;
  /** The files written, relative to outputRoot. */
  files?: string[];
  error?: string;
}

export type HostToWebviewMessage = StateMessage | SummaryMessage | GenerateResultMessage;

export type PickField = 'ecoreFile' | 'outputDir';

export type WebviewToHostMessage =
  | { type: 'typemf/generator/ready' }
  | { type: 'typemf/generator/edit'; config: JsonObject }
  | { type: 'typemf/generator/pick'; field: PickField }
  | { type: 'typemf/generator/addTemplateSetPackage' }
  | { type: 'typemf/generator/requestSummary'; ecoreFile: string }
  | { type: 'typemf/generator/generate' }
  | { type: 'typemf/generator/openAsText' };

export function isGeneratorMessage(message: unknown): message is { type: string } {
  return (
    typeof message === 'object' &&
    message !== null &&
    typeof (message as { type?: unknown }).type === 'string' &&
    (message as { type: string }).type.startsWith(PREFIX)
  );
}
