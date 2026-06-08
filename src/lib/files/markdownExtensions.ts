const MARKDOWN_EXTENSIONS = new Set([
  "md",
  "markdown",
  "mdown",
  "mkd",
  "mdx",
]);

export function isMarkdownPath(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? MARKDOWN_EXTENSIONS.has(ext) : false;
}
