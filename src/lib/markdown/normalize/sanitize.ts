import type { NormalizeOptions } from "./types";

const INVISIBLE_CHAR_PATTERN = /[\u200B-\u200D\uFEFF]/g;

const SMART_QUOTE_MAP: Record<string, string> = {
  "\u201C": '"',
  "\u201D": '"',
  "\u2018": "'",
  "\u2019": "'",
  "\u00AB": '"',
  "\u00BB": '"',
};

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

function stripInvisibleChars(text: string): string {
  return text.replace(INVISIBLE_CHAR_PATTERN, "");
}

function normalizeNbsp(text: string): string {
  return text.replace(/\u00A0/g, " ");
}

function normalizeSmartQuotes(text: string): string {
  let result = text;
  for (const [from, to] of Object.entries(SMART_QUOTE_MAP)) {
    result = result.split(from).join(to);
  }
  return result;
}

function trimTrailingWhitespacePerLine(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");
}

function collapseBlankLines(text: string, maxBlankLines: number): string {
  const limit = Math.max(1, maxBlankLines);
  const pattern = new RegExp(`\\n{${limit + 1},}`, "g");
  return text.replace(pattern, "\n".repeat(limit));
}

function trimTrailingDocumentNewlines(text: string): string {
  return text.replace(/\n+$/, (match) => (match.length > 1 ? "\n" : match));
}

export function sanitize(text: string, options: NormalizeOptions): string {
  let result = normalizeLineEndings(text);

  if (options.stripInvisibleChars) {
    result = stripInvisibleChars(result);
  }

  result = normalizeNbsp(result);

  if (options.normalizeQuotes) {
    result = normalizeSmartQuotes(result);
  }

  result = trimTrailingWhitespacePerLine(result);

  if (options.collapseBlankLines) {
    result = collapseBlankLines(result, options.maxBlankLines);
  }

  return trimTrailingDocumentNewlines(result);
}
