---
'@typemf/core': minor
'instance-editor': patch
---

Fix missing notifications (CORE-09, CORE-12): several EObjectImpl mutations updated storage silently, with no `onDidChange` notification, even though a real change happened.

- `eInverseAdd` (an opposite reference gaining a value) now fires `ADD`/`SET`.
- Clearing an opposite or an old container's reference during a move or detach now fires `REMOVE`/`SET` (one shared internal method, covering `eInverseRemove`, `eBasicMoveInto` and `eBasicDetachFromContainer` alike).
- `EList.move(fromIndex, toIndex)` is new: reorders in place and fires a single `MOVE` notification instead of requiring a `REMOVE`+`ADD` pair to reorder at all.

`instance-editor`'s write path (`SnapshotSerializer`/`EditRelay`) needed a matching fix: making these mutations observable exposed a latent gap where reconstructing one object's containment list could fire an opposite update on an already-reconstructed sibling, which the write path would relay to the host as if it were a real edit. `EditRelay` now suppresses relaying for the whole span of a snapshot's reconstruction, not just the object currently being populated.
