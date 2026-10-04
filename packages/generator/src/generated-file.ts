/** One output file from a generation run. `path` is always relative - see generate.ts. */
export interface GeneratedFile {
  path: string;
  content: string;
}
