import { parseFrontmatter } from "../../markdown/frontmatter";

const FRONTMATTER_PREFIX_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export interface SplitDocumentContent {
  /** Raw `---` block including trailing newline, or null if absent. */
  frontmatterPrefix: string | null;
  body: string;
}

export function splitDocumentContent(content: string): SplitDocumentContent {
  const match = content.match(FRONTMATTER_PREFIX_RE);
  if (!match) {
    return { frontmatterPrefix: null, body: content };
  }

  return {
    frontmatterPrefix: match[0],
    body: content.slice(match[0].length),
  };
}

export function joinDocumentContent(
  frontmatterPrefix: string | null,
  body: string,
): string {
  if (!frontmatterPrefix) return body;
  return `${frontmatterPrefix}${body}`;
}

/** Validate frontmatter parses; used only when editing metadata later. */
export function parseDocumentFrontmatter(content: string) {
  return parseFrontmatter(content);
}
