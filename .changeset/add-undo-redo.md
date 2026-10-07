---
'instance-editor': minor
---

Add undo and redo to the instance editor (ED-07). Every edit (setting or unsetting a value, adding or removing a list element, adding a child) is now one step on VS Code's undo stack, so Ctrl+Z / Ctrl+Y work and the dirty marker clears when you undo back to the saved state. After an undo or redo the editor reloads its view from the document and keeps the tree's selection and expanded nodes.
