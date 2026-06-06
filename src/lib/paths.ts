/** Normalize paths for comparison across platforms. */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

export function pathsEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normalizePath(a) === normalizePath(b);
}
