import { GeneratedFile } from './generated-file.js';

/**
 * `{% file somePathExpression %}...content...{% endfile %}` - the
 * mechanism that lets a single template produce any number of output
 * files. The path argument is a full Nunjucks expression (e.g.
 * `eClass.getName() + "-impl.ts"`), not a string literal.
 *
 * Content rendered OUTSIDE any {% file %} block is silently discarded -
 * deliberately, so `{% include %}`/`{% macro %}` plumbing and stray
 * whitespace between tags never leak into an actual output file, and so
 * every template-set author follows one uniform rule ("wrap output in
 * {% file %}, always") rather than a fallback that's sometimes needed and
 * sometimes isn't.
 *
 * `parser`/`nodes` below are typed as `any`: this is Nunjucks' low-level
 * custom-tag-authoring API (Environment.addExtension), which @types/nunjucks
 * doesn't cover at all (only the high-level render/configure surface is
 * typed) - verified empirically against the real runtime API rather than
 * assumed, since no type declarations exist to check against.
 */
export class FileExtension {
  tags = ['file'];
  private readonly collected: GeneratedFile[] = [];

  constructor(private readonly postProcess?: (path: string, content: string) => string) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(parser: any, nodes: any): any {
    const tok = parser.nextToken();
    const pathExpr = parser.parseExpression();
    parser.advanceAfterBlockEnd(tok.value);

    const body = parser.parseUntilBlocks('endfile');
    parser.advanceAfterBlockEnd();

    return new nodes.CallExtensionAsync(this, 'run', new nodes.NodeList(tok.lineno, tok.colno, [pathExpr]), [body]);
  }

  run(
    _context: unknown,
    path: string,
    body: (callback: (err: unknown, res: string) => void) => void,
    callback: (err: unknown, res: string) => void
  ): void {
    body((err: unknown, content: string) => {
      if (err) {
        callback(err, '');
        return;
      }
      this.collected.push({ path, content: this.postProcess ? this.postProcess(path, content) : content });
      callback(null, '');
    });
  }

  /** Everything collected so far in this Environment's lifetime. */
  getCollected(): GeneratedFile[] {
    return this.collected;
  }
}
