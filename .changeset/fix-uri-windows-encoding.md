---
'@typemf/core': patch
---

Fix `URI.createFileURI(path)` on a Windows-style path or a path with characters that need escaping (CORE-06): `createFileURI('C:\\Users\\a b\\m.xmi')` previously produced `file:///C:\Users\a b\m.xmi` - a mix of forward and backslashes with an un-encoded space, which `resolve()`/`deresolve()` (both split on `/`) and any consumer serializing the URI into text (e.g. an `href`) handled incorrectly or not at all.

`createFileURI` now converts backslashes to forward slashes first (so a Windows `fsPath` becomes an ordinary absolute URI path, the same shape a POSIX path already had) and percent-encodes each path segment, leaving `:` unescaped so a drive letter still reads as `C:` rather than `C%3A` (matching Eclipse's own Windows file URIs). Decoding back to a native path at the filesystem boundary is unchanged - `@typemf/node`'s `fileURLToPath`-based conversion (NODE-01) already handles it.
