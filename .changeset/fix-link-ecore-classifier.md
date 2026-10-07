---
'instance-editor': patch
---

Fix "Link external…" hanging on "Loading…" when the Ecore package is picked from the registry. The webview now uses Ecore's own classifiers directly instead of rebuilding copies of them from the extension host. The same fix applies to the class picker for adding a child.
