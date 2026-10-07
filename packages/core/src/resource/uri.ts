/**
 * A URI made of a scheme, a path and an optional fragment, or a relative reference without a
 * scheme (e.g. `other.xmi#//@books.0`, as EMF writes references between files). It covers only
 * what model documents need, a small subset of EMF's `URI`.
 */
export class URI {
  private constructor(
    private readonly scheme: string | undefined,
    private readonly hasAuthority: boolean,
    private readonly path: string,
    private readonly fragment: string | undefined
  ) {}

  /**
   * Parses `scheme:path`, `scheme://path` or, without a scheme, a relative reference. Never throws;
   * resolve a relative reference against a base before using it as a document location.
   */
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
   * A `file:` URI for a file system path, as EMF's `URI.createFileURI`. Backslashes become slashes,
   * a drive letter path (`C:\models\a.xmi`) becomes absolute, and each segment is percent-encoded
   * except for `:`. Converting back to a path is the job of a `UriConverter`.
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
   * This URI made absolute against `base` if it is relative, unchanged otherwise. Keeps this URI's
   * fragment and ignores `base`'s.
   */
  resolve(base: URI): URI {
    if (!this.isRelative()) return this;
    const baseDir = base.path.slice(0, base.path.lastIndexOf('/') + 1);
    const merged = this.path.startsWith('/') ? this.path : baseDir + this.path;
    return new URI(base.scheme, base.hasAuthority, normalizePath(merged), this.fragment);
  }

  /**
   * The shortest relative reference from `base` to this URI if both have the same scheme and
   * authority, unchanged otherwise. The inverse of {@link resolve}.
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
