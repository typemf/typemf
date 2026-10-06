/**
 * A minimal URI: scheme + optional authority marker + path + optional fragment, or - when
 * `getScheme()` is undefined - a relative reference (e.g. "other.xmi#//@books.0", the form EMF
 * writes by default between files in the same workspace). No archive-URI support, unlike EMF's
 * much larger `URI` class. See NOTES.md: build out only what a concrete need actually demands
 * rather than porting EMF's full surface speculatively.
 */
export class URI {
  private constructor(
    private readonly scheme: string | undefined,
    private readonly hasAuthority: boolean,
    private readonly path: string,
    private readonly fragment: string | undefined
  ) {}

  /** Parses an absolute URI ("scheme:path" / "scheme://path") or a relative reference (anything
   *  else - a bare path, with no scheme). Never throws: a string with no recognizable scheme is
   *  relative, not invalid - resolve() against a base URI before using it as a document location. */
  static parse(uriString: string): URI {
    const absolute = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?([^#]*)(?:#(.*))?$/.exec(uriString);
    if (absolute) {
      const [, scheme, authorityMarker, path, fragment] = absolute;
      return new URI(scheme as string, authorityMarker === '//', path as string, fragment);
    }
    const [, path, fragment] = /^([^#]*)(?:#(.*))?$/.exec(uriString)!;
    return new URI(undefined, false, path as string, fragment);
  }

  /**
   * Convenience for the common case of wrapping a filesystem path (CORE-06). Backslashes become
   * forward slashes first - a Windows `fsPath` ("C:\Users\a b\m.xmi") has none of its own, so this
   * is purely "native path -> URI path" translation, matching real EMF's own `URI.createFileURI`;
   * it naturally also makes a drive-letter path absolute, the same way a POSIX path already was,
   * with no separate case needed (`C:/...` doesn't start with "/" yet, so it gets one prepended,
   * same as any other non-absolute input). Each path segment is then percent-encoded (a reserved
   * character - most commonly a space in a real file path - would otherwise corrupt `resolve`/
   * `deresolve`'s own segment splitting, or the URI text once serialized into an `href`); `:` is
   * deliberately left unescaped (valid unencoded in a URI path segment, and this is exactly what
   * keeps a drive letter readable as "C:" rather than "C%3A", matching Eclipse's own Windows file
   * URIs). `getPath()`/`toString()` return this encoded form - decoding back to a native path is
   * `@typemf/node`'s own job (NODE-01's `fileURLToPath`), not this class's.
   */
  static createFileURI(path: string): URI {
    const normalized = path.replace(/\\/g, '/');
    const absolute = normalized.startsWith('/') ? normalized : `/${normalized}`;
    const encoded = absolute.split('/').map(encodePathSegment).join('/');
    return new URI('file', true, encoded, undefined);
  }

  /** Undefined for a relative reference - see the class doc comment. */
  getScheme(): string | undefined {
    return this.scheme;
  }

  /** A relative reference, as opposed to one naming an absolute document location. */
  isRelative(): boolean {
    return this.scheme === undefined;
  }

  getPath(): string {
    return this.path;
  }

  getFragment(): string | undefined {
    return this.fragment;
  }

  /** The substring after the last '.' in the last path segment, if any. */
  getFileExtension(): string | undefined {
    const lastSegment = this.path.split('/').pop() ?? '';
    const dotIndex = lastSegment.lastIndexOf('.');
    return dotIndex > 0 ? lastSegment.slice(dotIndex + 1) : undefined;
  }

  withFragment(fragment: string | undefined): URI {
    return new URI(this.scheme, this.hasAuthority, this.path, fragment);
  }

  /** The same URI with its fragment removed - i.e. "which document". */
  trimFragment(): URI {
    return this.fragment === undefined ? this : this.withFragment(undefined);
  }

  /**
   * This URI, made absolute against `base` if it is relative; returned unchanged otherwise.
   * `base`'s own fragment is irrelevant and ignored - only its scheme/authority/path (i.e. "which
   * document") anchor the result; this URI's own fragment (if any) is kept as-is.
   */
  resolve(base: URI): URI {
    if (!this.isRelative()) return this;
    const baseDir = base.path.slice(0, base.path.lastIndexOf('/') + 1);
    const merged = this.path.startsWith('/') ? this.path : baseDir + this.path;
    return new URI(base.scheme, base.hasAuthority, normalizePath(merged), this.fragment);
  }

  /**
   * The shortest relative reference from `base` to this URI, when both share a scheme and
   * authority (the common, same-workspace case this is actually for) - this URI unchanged
   * otherwise, since there is then nothing meaningful to make relative against. Already-relative
   * stays unchanged either way. The inverse of resolve(): `uri.deresolve(base).resolve(base)`
   * reconstructs the original absolute path.
   */
  deresolve(base: URI): URI {
    if (this.isRelative() || this.scheme !== base.scheme || this.hasAuthority !== base.hasAuthority) return this;

    const baseDirSegments = base.path.split('/').slice(0, -1);
    const targetSegments = this.path.split('/');
    let common = 0;
    while (
      common < baseDirSegments.length &&
      common < targetSegments.length &&
      baseDirSegments[common] === targetSegments[common]
    ) {
      common++;
    }
    const upSegments = baseDirSegments.slice(common).map(() => '..');
    const relativePath = [...upSegments, ...targetSegments.slice(common)].join('/');
    return new URI(undefined, false, relativePath, this.fragment);
  }

  toString(): string {
    const schemePart = this.scheme !== undefined ? `${this.scheme}:` : '';
    const authority = this.hasAuthority ? '//' : '';
    const fragmentPart = this.fragment !== undefined ? `#${this.fragment}` : '';
    return `${schemePart}${authority}${this.path}${fragmentPart}`;
  }

  equals(other: URI): boolean {
    return this.toString() === other.toString();
  }
}

/** Resolves "." and ".." segments (RFC 3986-style, simplified for the plain filesystem-like
 *  paths this project's URIs actually carry) - "a/b/../c" -> "a/c", "a/./b" -> "a/b". A leading
 *  "/" (an absolute path) is preserved as the first, empty segment. */
function normalizePath(path: string): string {
  const segments = path.split('/');
  const result: string[] = [];
  for (const segment of segments) {
    if (segment === '.') continue;
    if (segment === '..' && result.length > 0 && result[result.length - 1] !== '' && result.at(-1) !== '..') {
      result.pop();
    } else {
      result.push(segment);
    }
  }
  return result.join('/');
}

/** Percent-encodes every character in `segment` outside the RFC 3986 `pchar` set (unreserved +
 *  sub-delims + ":" + "@") - most commonly a space in a real file path. Never encodes "/" itself
 *  (only ever called on one already-split segment, never the full path) or already-safe
 *  characters, so an ordinary path with nothing to escape round-trips unchanged. */
function encodePathSegment(segment: string): string {
  return segment.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]/g, (ch) => encodeURIComponent(ch));
}
