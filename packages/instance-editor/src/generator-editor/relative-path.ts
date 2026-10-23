import { isAbsolute, relative, sep } from 'node:path';

/**
 * `target` as a path relative to `fromDir`, with forward slashes and a leading "./" unless it
 * climbs up. A target on another drive stays absolute.
 */
export function relativeToDir(fromDir: string, target: string): string {
  const rel = relative(fromDir, target);
  if (rel === '') return '.';
  if (isAbsolute(rel)) return target;
  const posixPath = rel.split(sep).join('/');
  return posixPath.startsWith('../') || posixPath === '..' ? posixPath : `./${posixPath}`;
}
