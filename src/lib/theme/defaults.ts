import type { AppTheme, ColorScheme } from "./types";

export const DEFAULT_COLOR_SCHEME: ColorScheme = "system";
export const DEFAULT_APP_THEME: AppTheme = "default";

const LEGACY_APP_THEMES: Record<string, AppTheme> = {
  apple: "default",
  ibm: "blue",
};

export function isColorScheme(value: string): value is ColorScheme {
  return value === "light" || value === "dark" || value === "system";
}

export function isAppTheme(value: string): value is AppTheme {
  return value === "default" || value === "blue" || value === "warm";
}

export function normalizeColorScheme(value: string | undefined): ColorScheme {
  return value && isColorScheme(value) ? value : DEFAULT_COLOR_SCHEME;
}

export function normalizeAppTheme(value: string | undefined): AppTheme {
  if (!value) return DEFAULT_APP_THEME;
  if (value in LEGACY_APP_THEMES) return LEGACY_APP_THEMES[value];
  return isAppTheme(value) ? value : DEFAULT_APP_THEME;
}
