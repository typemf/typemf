---
'@typemf/vscode-runtime': minor
'instance-editor': patch
---

Open and save documents on virtual file systems, e.g. GitHub repositories opened through vscode.dev or "Remote Repositories": the runtime now registers a `UriConverter` backed by `vscode.workspace.fs` instead of Node's `fs`, handling every absolute URI. The editor no longer turns every picked or "Save As" destination into a `file:` URI from its `fsPath`; a non-`file:` destination keeps its own URI.
