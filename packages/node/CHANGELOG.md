# @typemf/node

## 0.9.1

### Patch Changes

- Updated dependencies [[`f02ac31`](https://github.com/typemf/typemf/commit/f02ac31cf1aa5177c178d1e5a98fbe256d00ec7c), [`f02ac31`](https://github.com/typemf/typemf/commit/f02ac31cf1aa5177c178d1e5a98fbe256d00ec7c)]:
  - @typemf/core@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.9.0

## 0.8.1

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.8.1

## 0.8.0

### Patch Changes

- Updated dependencies [[`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223)]:
  - @typemf/core@0.8.0

## 0.7.0

### Patch Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `NodeFileUriConverter` failing to open a file whose URI doesn't look like a plain, already-decoded POSIX path: a Windows `fsPath`-derived URI (`c:\Users\...`) or a percent-encoded one (`a%20b`) previously used the URI's raw path text as-is, producing a path like `/c:\Users\...` that doesn't exist, or leaving `%20` undecoded.

  `pathFor` now converts through Node's own `fileURLToPath` instead of reading the URI's path directly - it already handles both cases correctly per platform (treating a backslash as a path separator, the same way the WHATWG URL parser does for every "special" scheme including `file`, and decoding percent-escapes).

- Updated dependencies [[`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177)]:
  - @typemf/core@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [[`5123e20`](https://github.com/typemf/typemf/commit/5123e20130003e8eb4cdc9dd64376e312cd197aa)]:
  - @typemf/core@0.6.0

## 0.5.1

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.5.1
