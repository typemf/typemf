/** A single parse/validation problem recorded against a Resource. */
export interface Diagnostic {
  message: string;
  line?: number;
  column?: number;
}
