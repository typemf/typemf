/**
 * VS Code injects this global into every webview - not something to import, just declared. Called
 * once, here, since VS Code only allows acquireVsCodeApi() to be called a single time per webview
 * (calling it again throws), so every other module in this app imports vscodeApi from here rather
 * than calling it itself.
 */
declare function acquireVsCodeApi(): { postMessage(message: unknown): void };

export const vscodeApi = acquireVsCodeApi();
