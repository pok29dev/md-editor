import { marked } from "marked";
import { escapeHtmlAttribute } from "./utils";

const footnoteDefinitions = new Map<string, string>();
const footnoteOrder: string[] = [];
const footnoteRefCounts = new Map<string, number>();
const footnoteFirstRefId = new Map<string, string>();
let anonymousFootnoteCounter = 0;
let suppressFootnotePreprocess = false;

export function resetFootnoteState(): void {
  footnoteDefinitions.clear();
  footnoteOrder.length = 0;
  footnoteRefCounts.clear();
  footnoteFirstRefId.clear();
  anonymousFootnoteCounter = 0;
}

function normalizeFootnoteId(id: string): string {
  const normalized = String(id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (normalized) return normalized;
  anonymousFootnoteCounter += 1;
  return `footnote-${anonymousFootnoteCounter}`;
}

export function parseInlineWithoutFootnotes(text: string): string {
  suppressFootnotePreprocess = true;
  try {
    return marked.parseInline(text) as string;
  } finally {
    suppressFootnotePreprocess = false;
  }
}

function renderDefinitionContent(
  content: string,
  options: { appendHtml?: string } = {},
): string {
  const { appendHtml = "" } = options;
  const paragraphs = String(content || "")
    .split(/\n(?:[ \t]*\n)+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (appendHtml) {
    if (paragraphs.length === 0) {
      paragraphs.push(appendHtml);
    } else {
      paragraphs[paragraphs.length - 1] =
        `${paragraphs[paragraphs.length - 1]} ${appendHtml}`;
    }
  }

  return paragraphs
    .map((paragraph) => {
      const rendered = parseInlineWithoutFootnotes(paragraph);
      return `<p>${rendered}</p>`;
    })
    .join("");
}

function extractFootnoteDefinitions(markdown: string): string {
  const lines = markdown.split("\n");
  const preservedLines: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const match = /^([ \t]{0,3})\[\^([^\]\n]+)\]:[ \t]*(.*)$/.exec(lines[index]);
    if (!match) {
      preservedLines.push(lines[index]);
      index += 1;
      continue;
    }

    const baseIndent = match[1] || "";
    const id = match[2].trim();
    const definitionLines = [match[3] || ""];
    index += 1;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.startsWith(baseIndent)) break;

      const lineAfterBase = line.slice(baseIndent.length);
      const indentedMatch = /^(?: {2,}|\t)(.*)$/.exec(lineAfterBase);
      if (indentedMatch) {
        definitionLines.push(indentedMatch[1]);
        index += 1;
        continue;
      }

      if (lineAfterBase.trim() === "") {
        const nextLine = lines[index + 1] || "";
        const nextAfterBase = nextLine.startsWith(baseIndent)
          ? nextLine.slice(baseIndent.length)
          : "";
        if (/^(?: {2,}|\t)/.test(nextAfterBase)) {
          definitionLines.push("");
          index += 1;
          continue;
        }
      }
      break;
    }

    footnoteDefinitions.set(id, definitionLines.join("\n").trim());
  }

  return preservedLines.join("\n");
}

function applyFootnotes(markdown: string): string {
  const markdownWithReferences = markdown.replace(
    /\[\^([^\]\n]+)\]/g,
    (match, idText: string) => {
      const id = idText.trim();
      if (!id) return match;

      if (!footnoteOrder.includes(id)) {
        footnoteOrder.push(id);
      }

      const refCount = (footnoteRefCounts.get(id) || 0) + 1;
      footnoteRefCounts.set(id, refCount);

      const normalizedId = normalizeFootnoteId(id);
      const refId = `fnref-${normalizedId}${refCount > 1 ? `-${refCount}` : ""}`;
      if (!footnoteFirstRefId.has(id)) {
        footnoteFirstRefId.set(id, refId);
      }

      const noteNumber = footnoteOrder.indexOf(id) + 1;
      const safeRefId = escapeHtmlAttribute(refId);
      const safeNormalizedId = escapeHtmlAttribute(normalizedId);
      return `<sup id="${safeRefId}" class="footnote-ref"><a href="#fn-${safeNormalizedId}" aria-label="Footnote ${noteNumber}">[${noteNumber}]</a></sup>`;
    },
  );

  const footnotesHtml = footnoteOrder
    .filter((id) => footnoteDefinitions.has(id))
    .map((id) => {
      const normalizedId = normalizeFootnoteId(id);
      const backRefId = footnoteFirstRefId.get(id) || `fnref-${normalizedId}`;
      const safeNormalizedId = escapeHtmlAttribute(normalizedId);
      const safeBackRefId = escapeHtmlAttribute(backRefId);
      const backRefHtml = `<a href="#${safeBackRefId}" class="footnote-backref" aria-label="Back to content">←</a>`;
      const noteHtml = renderDefinitionContent(
        footnoteDefinitions.get(id) || "",
        { appendHtml: backRefHtml },
      );
      return `<li id="fn-${safeNormalizedId}">${noteHtml}</li>`;
    })
    .join("");

  if (!footnotesHtml) return markdownWithReferences;

  return `${markdownWithReferences}\n\n<section class="footnotes"><hr><ol>${footnotesHtml}</ol></section>`;
}

export function preprocessFootnotes(markdown: string): string {
  if (suppressFootnotePreprocess) return markdown;
  resetFootnoteState();
  const protectedMarkdown = markdown.replace(/\\\$/g, "&#36;");
  return applyFootnotes(extractFootnoteDefinitions(protectedMarkdown));
}
