---
'instance-editor': patch
---

Fix `openCustomDocument` ignoring `openContext.backupId`: after a crash or a VS Code restart with hot exit, an unsaved document (saved or still untitled) was silently reopened from its last-saved state, or as a brand new, empty instance, discarding the backup `backupCustomDocument` had already written for it. The backup's content is now loaded instead, while the document keeps the exact same identity (file path, or the untitled uri) a normal open would have given it.
