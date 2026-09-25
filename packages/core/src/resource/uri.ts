/**
 * A minimal, immutable URI: scheme + optional authority marker + path +
 * optional fragment. Absolute URIs only - no relative resolution/
 * deresolution and no archive-URI support, unlike EMF's much larger `URI`
 * class. See NOTES.md: build out only what a concrete need actually
 * demands rather than porting EMF's full surface speculatively.
 */
export class URI {
  private constructor(
    private readonly scheme: string,
    private readonly hasAuthority: boolean,
    private readonly path: string,
    private readonly fragment: string | undefined
  ) {}

  static parse(uriString: string): URI {
    const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/)?([^#]*)(?:#(.*))?$/.exec(uriString);
    if (!match) {
      throw new Error(`Not a valid absolute URI: '${uriString}' (expected "scheme:path" or "scheme://path")`);
    }
    const [, scheme, authorityMarker, path, fragment] = match;
    return new URI(scheme as string, authorityMarker === '//', path as string, fragment);
  }

  /** Convenience for the common case of wrapping a filesystem path. */
  static createFileURI(path: string): URI {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return new URI('file', true, normalized, undefined);
  }

  getScheme(): string {
    return this.scheme;
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

  toString(): string {
    const authority = this.hasAuthority ? '//' : '';
    const fragmentPart = this.fragment !== undefined ? `#${this.fragment}` : '';
    return `${this.scheme}:${authority}${this.path}${fragmentPart}`;
  }

  equals(other: URI): boolean {
    return this.toString() === other.toString();
  }
}
