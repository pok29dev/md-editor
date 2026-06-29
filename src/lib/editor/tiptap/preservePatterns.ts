export interface PreservedSegment {
  kind: string;
  raw: string;
}

const MERMAID_FENCE_RE = /```mermaid[ \t]*\r?\n([\s\S]*?)```/g;
const MATH_BLOCK_RE = /\$\$[ \t]*\r?\n?([\s\S]*?)\r?\n?\$\$/g;
const ALERT_START_RE = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;
const FOOTNOTE_DEF_RE = /^([ \t]{0,3})\[\^([^\]\n]+)\]:[ \t]*(.*)$/;
const EMPTY_LINE_RE = /^\s*$/;
const LIST_MARKER_RE = /^(\s*)(?:[-*+]\s+|\d+\.\s+|>\s+)/;
const DEFINITION_ITEM_RE = /^:[ \t]+(.*)$/;

function preservedHtml(kind: string, raw: string): string {
  return `\n\n<div data-preserved-md="" data-kind="${kind}" data-raw="${encodeURIComponent(raw)}"></div>\n\n`;
}

function extractMultilineBlockquote(
  lines: string[],
  startIndex: number,
): { raw: string; nextIndex: number } | null {
  if (!ALERT_START_RE.test(lines[startIndex] ?? "")) return null;

  const blockLines = [lines[startIndex]];
  let index = startIndex + 1;
  while (index < lines.length && /^>\s?/.test(lines[index])) {
    blockLines.push(lines[index]);
    index += 1;
  }
  return { raw: blockLines.join("\n"), nextIndex: index };
}

function extractFootnoteDefinitionBlock(
  lines: string[],
  startIndex: number,
): { raw: string; nextIndex: number } | null {
  const match = FOOTNOTE_DEF_RE.exec(lines[startIndex] ?? "");
  if (!match) return null;

  const baseIndent = match[1] || "";
  const blockLines = [lines[startIndex]];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.startsWith(baseIndent)) break;

    const lineAfterBase = line.slice(baseIndent.length);
    if (/^(?: {2,}|\t)(.*)$/.test(lineAfterBase) || lineAfterBase.trim() === "") {
      blockLines.push(line);
      index += 1;
      continue;
    }
    break;
  }

  return { raw: blockLines.join("\n"), nextIndex: index };
}

function extractDefinitionListBlock(
  lines: string[],
  startIndex: number,
): { raw: string; nextIndex: number } | null {
  const term = lines[startIndex] ?? "";
  if (EMPTY_LINE_RE.test(term) || LIST_MARKER_RE.test(term)) return null;
  if (!DEFINITION_ITEM_RE.test(lines[startIndex + 1] ?? "")) return null;

  const blockLines = [term];
  let index = startIndex + 1;

  while (index < lines.length) {
    const itemMatch = DEFINITION_ITEM_RE.exec(lines[index]);
    if (!itemMatch) break;

    blockLines.push(lines[index]);
    index += 1;

    while (index < lines.length) {
      const line = lines[index];
      if (DEFINITION_ITEM_RE.test(line)) break;

      if (EMPTY_LINE_RE.test(line)) {
        const nextLine = lines[index + 1] || "";
        if (/^(?: {2,}|\t)/.test(nextLine)) {
          blockLines.push(line);
          index += 1;
          continue;
        }
        break;
      }

      if (!/^(?: {2,}|\t)(.*)$/.test(line)) break;
      blockLines.push(line);
      index += 1;
    }
  }

  return { raw: blockLines.join("\n"), nextIndex: index };
}

function extractSpecialBlocks(body: string): string {
  const lines = body.split("\n");
  const output: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const alert = extractMultilineBlockquote(lines, index);
    if (alert) {
      const typeMatch = ALERT_START_RE.exec(alert.raw);
      const alertKind = typeMatch
        ? `alert-${typeMatch[1].toLowerCase()}`
        : "alert-note";
      output.push(preservedHtml(alertKind, alert.raw));
      index = alert.nextIndex;
      continue;
    }

    const footnote = extractFootnoteDefinitionBlock(lines, index);
    if (footnote) {
      output.push(preservedHtml("footnote-def", footnote.raw));
      index = footnote.nextIndex;
      continue;
    }

    const definitionList = extractDefinitionListBlock(lines, index);
    if (definitionList) {
      output.push(preservedHtml("definition-list", definitionList.raw));
      index = definitionList.nextIndex;
      continue;
    }

    output.push(lines[index]);
    index += 1;
  }

  return output.join("\n");
}

/** Inject preserved HTML widgets for blocks WYSIWYG cannot edit inline. */
export function preparePreservedBlocks(body: string): string {
  let text = body;

  text = text.replace(MERMAID_FENCE_RE, (raw) => preservedHtml("mermaid", raw));
  text = text.replace(MATH_BLOCK_RE, (raw) => preservedHtml("math-block", raw));
  text = extractSpecialBlocks(text);

  return text;
}
