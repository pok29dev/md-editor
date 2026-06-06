import yaml from "js-yaml";

export interface FrontmatterResult {
  frontmatter: Record<string, unknown> | null;
  body: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseFrontmatter(content: string): FrontmatterResult {
  const match = content.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  try {
    const parsed = yaml.load(match[1]);
    const frontmatter =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    return { frontmatter, body: content.slice(match[0].length) };
  } catch {
    return { frontmatter: null, body: content };
  }
}

export function renderFrontmatterTable(
  frontmatter: Record<string, unknown>,
): string {
  const rows = Object.entries(frontmatter)
    .map(([key, value]) => {
      const display =
        typeof value === "object"
          ? `<pre>${escapeHtml(yaml.dump(value).trim())}</pre>`
          : escapeHtml(String(value));
      return `<tr><th>${escapeHtml(key)}</th><td>${display}</td></tr>`;
    })
    .join("");

  return `<div class="frontmatter-table"><table><tbody>${rows}</tbody></table></div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
