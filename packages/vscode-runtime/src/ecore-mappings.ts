/** One entry of the `typemf.ecoreMappings` VS Code setting. */
export interface EcoreMappingEntry {
  /** The EPackage nsURI this mapping registers. */
  nsURI: string;
  /** Path to the .ecore file, resolved relative to the first workspace folder. */
  ecoreFile: string;
}

/**
 * The three per-scope arrays VS Code's own `WorkspaceConfiguration.inspect()` returns for an
 * array-typed setting. Deliberately a plain, local interface - not `vscode`'s own
 * `InspectionResult<T>` type - so this file (and resolveMappings itself) stays usable and
 * unit-testable with no VS Code present at all, matching typemf-runtime.ts/register-defaults.ts.
 */
export interface InspectedEcoreMappings {
  globalValue?: EcoreMappingEntry[];
  workspaceValue?: EcoreMappingEntry[];
  workspaceFolderValue?: EcoreMappingEntry[];
}

/**
 * Merges the three scopes VS Code's own array-typed settings do NOT merge automatically
 * (confirmed directly against VS Code's own documentation: "Only object value types are merged
 * and all other value types are overridden" - arrays fall under "other"). Uses VS Code's real,
 * general settings precedence - workspaceFolder overrides workspace overrides user (global) - not
 * an invented order.
 *
 * For each nsURI, only the first occurrence (in that precedence order) is kept; every later
 * duplicate - whether from a less-specific scope or a second entry within the very same array -
 * is dropped with a warning rather than silently overwriting or being silently ignored.
 */
export function resolveMappings(inspected: InspectedEcoreMappings): EcoreMappingEntry[] {
  const ordered = [
    ...(inspected.workspaceFolderValue ?? []),
    ...(inspected.workspaceValue ?? []),
    ...(inspected.globalValue ?? []),
  ];
  const seen = new Map<string, EcoreMappingEntry>();
  for (const entry of ordered) {
    if (seen.has(entry.nsURI)) {
      console.warn(
        `typemf.ecoreMappings: duplicate entry for nsURI '${entry.nsURI}' - keeping the more specific (or earlier-declared) one, ignoring this one ('${entry.ecoreFile}').`
      );
      continue;
    }
    seen.set(entry.nsURI, entry);
  }
  return [...seen.values()];
}
