import type { AppTheme, ColorScheme } from "./types";

export const DEFAULT_COLOR_SCHEME: ColorScheme = "system";
export const DEFAULT_APP_THEME: AppTheme = "apple";

export function isColorScheme(value: string): value is ColorScheme {
  return value === "light" || value === "dark" || value === "system";
}

export function isAppTheme(value: string): value is AppTheme {
  return value === "apple" || value === "ibm" || value === "warm";
}

export function normalizeColorScheme(value: string | undefined): ColorScheme {
  return value && isColorScheme(value) ? value : DEFAULT_COLOR_SCHEME;
}

export function normalizeAppTheme(value: string | undefined): AppTheme {
  return value && isAppTheme(value) ? value : DEFAULT_APP_THEME;
}
