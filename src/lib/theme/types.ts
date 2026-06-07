/** Light/dark appearance — system, light, or dark. */
export type ColorScheme = "light" | "dark" | "system";

/** Resolved appearance applied to the UI. */
export type ResolvedColorScheme = "light" | "dark";

/** Full color + icon system — default, blue, warm. */
export type AppTheme = "default" | "blue" | "warm";

export const COLOR_SCHEME_ORDER: ColorScheme[] = ["system", "light", "dark"];

export const APP_THEME_ORDER: AppTheme[] = ["default", "blue", "warm"];
