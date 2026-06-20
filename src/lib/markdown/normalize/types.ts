export interface NormalizeOptions {
  collapseBlankLines: boolean;
  maxBlankLines: number;
  convertBullets: boolean;
  convertNumberedLists: boolean;
  normalizeQuotes: boolean;
  stripInvisibleChars: boolean;
  structureSocialPost: boolean;
}

export const DEFAULT_NORMALIZE_OPTIONS: NormalizeOptions = {
  collapseBlankLines: true,
  maxBlankLines: 2,
  convertBullets: true,
  convertNumberedLists: true,
  normalizeQuotes: true,
  stripInvisibleChars: true,
  structureSocialPost: true,
};
