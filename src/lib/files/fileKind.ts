export type FileKind = "markdown" | "json" | "yaml";

const MARKDOWN_EXTENSIONS = new Set([
  "md",
  "markdown",
  "mdown",
  "mkd",
  "mdx",
]);

const SUPPORTED_EXTENSIONS = new Set([
  ...MARKDOWN_EXTENSIONS,
  "json",
  "yaml",
  "yml",
]);

export function extensionFromPath(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

export function detectFileKind(path: string): FileKind {
  const ext = extensionFromPath(path);
  if (ext === "json") return "json";
  if (ext === "yaml" || ext === "yml") return "yaml";
  return "markdown";
}

export function isSupportedFilePath(path: string): boolean {
  const ext = extensionFromPath(path);
  return ext ? SUPPORTED_EXTENSIONS.has(ext) : false;
}

export function isMarkdownPath(path: string): boolean {
  const ext = extensionFromPath(path);
  return ext ? MARKDOWN_EXTENSIONS.has(ext) : false;
}

export function supportsPreview(kind: FileKind): boolean {
  return kind === "markdown";
}

export function defaultExtensionForKind(kind: FileKind): string {
  switch (kind) {
    case "json":
      return "json";
    case "yaml":
      return "yaml";
    default:
      return "md";
  }
}
