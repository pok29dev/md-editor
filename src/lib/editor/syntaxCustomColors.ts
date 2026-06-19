import type {
  EditorSyntaxCustomColors,
  SyntaxColorPalette,
  SyntaxColorToken,
} from "./syntaxColors";
import {
  DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS,
  GITHUB_SYNTAX_DARK,
  GITHUB_SYNTAX_LIGHT,
  normalizeEditorSyntaxCustomColors,
  normalizeHexColor,
} from "./syntaxColors";

export function updateSyntaxCustomPaletteToken(
  colors: EditorSyntaxCustomColors,
  mode: "light" | "dark",
  token: SyntaxColorToken,
  value: string,
): EditorSyntaxCustomColors {
  const normalized = normalizeEditorSyntaxCustomColors(colors);
  const fallback = DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS[mode][token];
  return {
    ...normalized,
    [mode]: {
      ...normalized[mode],
      [token]: normalizeHexColor(value, fallback),
    },
  };
}

export function resetSyntaxCustomPaletteToGithub(
  mode: "light" | "dark",
): SyntaxColorPalette {
  return mode === "dark"
    ? { ...GITHUB_SYNTAX_DARK }
    : { ...GITHUB_SYNTAX_LIGHT };
}

export function resetSyntaxCustomColorsToGithub(): EditorSyntaxCustomColors {
  return normalizeEditorSyntaxCustomColors({
    light: resetSyntaxCustomPaletteToGithub("light"),
    dark: resetSyntaxCustomPaletteToGithub("dark"),
  });
}
