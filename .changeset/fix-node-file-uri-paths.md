---
'@typemf/node': patch
---

Fix `NodeFileUriConverter` failing to open a file whose URI doesn't look like a plain, already-decoded POSIX path: a Windows `fsPath`-derived URI (`c:\Users\...`) or a percent-encoded one (`a%20b`) previously used the URI's raw path text as-is, producing a path like `/c:\Users\...` that doesn't exist, or leaving `%20` undecoded.

`pathFor` now converts through Node's own `fileURLToPath` instead of reading the URI's path directly - it already handles both cases correctly per platform (treating a backslash as a path separator, the same way the WHATWG URL parser does for every "special" scheme including `file`, and decoding percent-escapes).
