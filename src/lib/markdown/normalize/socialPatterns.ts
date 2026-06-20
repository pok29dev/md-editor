import type { NormalizeOptions } from "./types";

const UNICODE_BULLET_PATTERN = /^[•●▪◦‣⁃]\s+/;
const NUMBERED_LIST_PATTERN = /^(\d+)[.)]\s+/;
const DASH_LIST_SPACING_PATTERN = /^-\s{2,}/;
const DASH_LIST_TIGHT_PATTERN = /^-(\S)/;

function normalizeLine(line: string, options: NormalizeOptions): string {
  let result = line.replace(/\t/g, "  ");

  if (options.convertBullets && UNICODE_BULLET_PATTERN.test(result)) {
    result = result.replace(UNICODE_BULLET_PATTERN, "- ");
  }

  if (options.convertNumberedLists && NUMBERED_LIST_PATTERN.test(result)) {
    result = result.replace(NUMBERED_LIST_PATTERN, "$1. ");
  }

  if (DASH_LIST_SPACING_PATTERN.test(result)) {
    result = result.replace(DASH_LIST_SPACING_PATTERN, "- ");
  }

  if (DASH_LIST_TIGHT_PATTERN.test(result)) {
    result = result.replace(DASH_LIST_TIGHT_PATTERN, "- $1");
  }

  return result;
}

export function applySocialPatterns(
  text: string,
  options: NormalizeOptions,
): string {
  return text
    .split("\n")
    .map((line) => normalizeLine(line, options))
    .join("\n");
}
