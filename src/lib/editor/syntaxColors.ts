import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { FileKind } from "../files/fileKind";

export interface SyntaxColorPalette {
  property: string;
  string: string;
  literal: string;
  keyword: string;
  comment: string;
  punctuation: string;
}

export interface EditorSyntaxCustomColors {
  light: SyntaxColorPalette;
  dark: SyntaxColorPalette;
}

export type SyntaxColorToken = keyof SyntaxColorPalette;

export type EditorSyntaxColorScheme = "github" | "minimal" | "custom";

export const EDITOR_SYNTAX_COLORS_DEFAULT: EditorSyntaxColorScheme = "github";

export const SYNTAX_COLOR_TOKEN_FIELDS: {
  key: SyntaxColorToken;
  label: string;
  hint: string;
}[] = [
  { key: "property", label: "Keys", hint: "JSON/YAML property names" },
  { key: "string", label: "Strings", hint: "Quoted string values" },
  { key: "literal", label: "Numbers", hint: "Numbers, booleans, null" },
  { key: "keyword", label: "Keywords", hint: "YAML keywords and anchors" },
  { key: "comment", label: "Comments", hint: "Line and block comments" },
  {
    key: "punctuation",
    label: "Punctuation",
    hint: "Brackets, braces, commas, colons",
  },
];

/** Matches GitHub / highlight.js preview tokens (light). */
export const GITHUB_SYNTAX_LIGHT: SyntaxColorPalette = {
  property: "#005cc5",
  string: "#032f62",
  literal: "#005cc5",
  keyword: "#d73a49",
  comment: "#6a737d",
  punctuation: "#24292e",
};

/** Matches `preview-markdown-dark.css` hljs tokens. */
export const GITHUB_SYNTAX_DARK: SyntaxColorPalette = {
  property: "#79c0ff",
  string: "#a5d6ff",
  literal: "#79c0ff",
  keyword: "#ff7b72",
  comment: "#8b949e",
  punctuation: "#c9d1d9",
};

export const DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS: EditorSyntaxCustomColors = {
  light: { ...GITHUB_SYNTAX_LIGHT },
  dark: { ...GITHUB_SYNTAX_DARK },
};

export const EDITOR_SYNTAX_COLOR_OPTIONS: {
  value: EditorSyntaxColorScheme;
  label: string;
  hint: string;
}[] = [
  {
    value: "github",
    label: "GitHub",
    hint: "Match Markdown preview code blocks (JSON/YAML keys, strings, numbers)",
  },
  {
    value: "custom",
    label: "Custom",
    hint: "Define your own JSON/YAML syntax colors for light and dark mode",
  },
  {
    value: "minimal",
    label: "Minimal",
    hint: "Monochrome editor text with default CodeMirror accents",
  },
];

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHexColor(
  value: string | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return fallback;

  let normalized = trimmed;
  if (!normalized.startsWith("#")) {
    normalized = `#${normalized}`;
  }

  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    const [r, g, b] = normalized.slice(1);
    normalized = `#${r}${r}${g}${g}${b}${b}`;
  }

  if (!HEX_COLOR_PATTERN.test(normalized)) {
    return fallback;
  }

  return normalized.toLowerCase();
}

export function normalizeSyntaxColorPalette(
  raw: Partial<SyntaxColorPalette> | undefined,
  fallback: SyntaxColorPalette,
): SyntaxColorPalette {
  return {
    property: normalizeHexColor(raw?.property, fallback.property),
    string: normalizeHexColor(raw?.string, fallback.string),
    literal: normalizeHexColor(raw?.literal, fallback.literal),
    keyword: normalizeHexColor(raw?.keyword, fallback.keyword),
    comment: normalizeHexColor(raw?.comment, fallback.comment),
    punctuation: normalizeHexColor(raw?.punctuation, fallback.punctuation),
  };
}

export function normalizeEditorSyntaxCustomColors(
  raw: Partial<EditorSyntaxCustomColors> | undefined,
): EditorSyntaxCustomColors {
  return {
    light: normalizeSyntaxColorPalette(
      raw?.light,
      DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS.light,
    ),
    dark: normalizeSyntaxColorPalette(
      raw?.dark,
      DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS.dark,
    ),
  };
}

export function normalizeEditorSyntaxColors(
  value: string | undefined,
): EditorSyntaxColorScheme {
  if (value === "minimal") return "minimal";
  if (value === "custom") return "custom";
  return "github";
}

export function syntaxCustomColorsKey(colors: EditorSyntaxCustomColors): string {
  const normalized = normalizeEditorSyntaxCustomColors(colors);
  return JSON.stringify(normalized);
}

function githubPalette(isDark: boolean): SyntaxColorPalette {
  return isDark ? GITHUB_SYNTAX_DARK : GITHUB_SYNTAX_LIGHT;
}

export function resolveSyntaxPalette(
  scheme: EditorSyntaxColorScheme,
  isDark: boolean,
  customColors: EditorSyntaxCustomColors,
): SyntaxColorPalette | null {
  if (scheme === "minimal") return null;
  if (scheme === "custom") {
    const normalized = normalizeEditorSyntaxCustomColors(customColors);
    return isDark ? normalized.dark : normalized.light;
  }
  return githubPalette(isDark);
}

function structuredHighlightStyle(palette: SyntaxColorPalette) {
  return HighlightStyle.define([
    { tag: tags.propertyName, color: palette.property },
    { tag: tags.attributeName, color: palette.property },
    { tag: tags.labelName, color: palette.property },
    { tag: tags.string, color: palette.string },
    { tag: tags.character, color: palette.string },
    { tag: tags.attributeValue, color: palette.string },
    { tag: tags.number, color: palette.literal },
    { tag: tags.integer, color: palette.literal },
    { tag: tags.float, color: palette.literal },
    { tag: tags.bool, color: palette.literal },
    { tag: tags.null, color: palette.literal },
    { tag: tags.keyword, color: palette.keyword },
    { tag: tags.comment, color: palette.comment },
    { tag: tags.lineComment, color: palette.comment },
    { tag: tags.blockComment, color: palette.comment },
    { tag: tags.meta, color: palette.comment },
    { tag: tags.bracket, color: palette.punctuation },
    { tag: tags.paren, color: palette.punctuation },
    { tag: tags.squareBracket, color: palette.punctuation },
    { tag: tags.brace, color: palette.punctuation },
    { tag: tags.punctuation, color: palette.punctuation },
    { tag: tags.separator, color: palette.punctuation },
  ]);
}

const markdownMinimalHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, fontWeight: "bold" },
]);

export function buildSyntaxHighlightExtension(
  fileKind: FileKind,
  isDark: boolean,
  scheme: EditorSyntaxColorScheme,
  customColors: EditorSyntaxCustomColors,
) {
  if (scheme === "minimal") {
    return syntaxHighlighting(markdownMinimalHighlightStyle, { fallback: true });
  }

  if (fileKind === "json" || fileKind === "yaml") {
    const palette = resolveSyntaxPalette(scheme, isDark, customColors);
    if (palette) {
      return syntaxHighlighting(structuredHighlightStyle(palette));
    }
  }

  return syntaxHighlighting(markdownMinimalHighlightStyle, { fallback: true });
}

export function syntaxColorPreviewTokens(
  scheme: EditorSyntaxColorScheme,
  isDark: boolean,
  customColors: EditorSyntaxCustomColors,
) {
  const palette = resolveSyntaxPalette(scheme, isDark, customColors);
  if (!palette) return [];

  return [
    { label: "key", color: palette.property },
    { label: "string", color: palette.string },
    { label: "number", color: palette.literal },
    { label: "keyword", color: palette.keyword },
  ];
}
