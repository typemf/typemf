# @typemf/vscode-runtime

## 0.9.1

### Patch Changes

- Updated dependencies [[`f02ac31`](https://github.com/typemf/typemf/commit/f02ac31cf1aa5177c178d1e5a98fbe256d00ec7c), [`f02ac31`](https://github.com/typemf/typemf/commit/f02ac31cf1aa5177c178d1e5a98fbe256d00ec7c), [`f02ac31`](https://github.com/typemf/typemf/commit/f02ac31cf1aa5177c178d1e5a98fbe256d00ec7c)]:
  - @typemf/json@0.9.1
  - @typemf/core@0.9.1
  - @typemf/xmi@0.9.1
  - @typemf/node@0.9.1

## 0.9.0

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.9.0
  - @typemf/json@0.9.0
  - @typemf/node@0.9.0
  - @typemf/xmi@0.9.0

## 0.8.1

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.8.1
  - @typemf/json@0.8.1
  - @typemf/node@0.8.1
  - @typemf/xmi@0.8.1

## 0.8.0

### Minor Changes

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Open and save documents on virtual file systems, e.g. GitHub repositories opened through vscode.dev or "Remote Repositories": the runtime now registers a `UriConverter` backed by `vscode.workspace.fs` instead of Node's `fs`, handling every absolute URI. The editor no longer turns every picked or "Save As" destination into a `file:` URI from its `fsPath`; a non-`file:` destination keeps its own URI.

### Patch Changes

- Updated dependencies [[`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223)]:
  - @typemf/core@0.8.0
  - @typemf/json@0.8.0
  - @typemf/xmi@0.8.0
  - @typemf/node@0.8.0

## 0.7.0

### Patch Changes

- Updated dependencies [[`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177)]:
  - @typemf/core@0.7.0
  - @typemf/xmi@0.7.0
  - @typemf/json@0.7.0
  - @typemf/node@0.7.0

## 0.6.0

### Patch Changes

- Updated dependencies [[`5123e20`](https://github.com/typemf/typemf/commit/5123e20130003e8eb4cdc9dd64376e312cd197aa)]:
  - @typemf/core@0.6.0
  - @typemf/xmi@0.6.0
  - @typemf/json@0.6.0
  - @typemf/node@0.6.0

## 0.5.1

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.5.1
  - @typemf/json@0.5.1
  - @typemf/node@0.5.1
  - @typemf/xmi@0.5.1
