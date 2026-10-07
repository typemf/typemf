---
'instance-editor': patch
---

Keep the editor in sync with the file (ED-04): reverting a document now reloads the editor view (it kept showing the discarded state before), and a document changed outside the editor (git checkout, another editor) is reloaded automatically unless it has unsaved changes. Undo steps recorded before such a reload are skipped with a warning instead of acting on objects that no longer exist.
