import { protectBlocks, restoreBlocks } from "./protectBlocks";
import { sanitize } from "./sanitize";
import { applySocialPatterns } from "./socialPatterns";
import { structureSocialPost } from "./structureSocialPost";
import {
  DEFAULT_NORMALIZE_OPTIONS,
  type NormalizeOptions,
} from "./types";

export function normalizeMarkdown(
  text: string,
  options: NormalizeOptions = DEFAULT_NORMALIZE_OPTIONS,
): string {
  if (!text) return text;

  const { text: protectedText, blocks } = protectBlocks(text);
  let result = protectedText;
  result = sanitize(result, options);
  if (options.structureSocialPost) {
    result = structureSocialPost(result);
    result = sanitize(result, options);
  }
  result = applySocialPatterns(result, options);
  result = restoreBlocks(result, blocks);
  return result;
}

export type { NormalizeOptions } from "./types";
export { DEFAULT_NORMALIZE_OPTIONS } from "./types";
