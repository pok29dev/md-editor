/** Light/dark appearance — system, light, or dark. */
export type ColorScheme = "light" | "dark" | "system";

/** Resolved appearance applied to the UI. */
export type ResolvedColorScheme = "light" | "dark";

/** Full color + icon system — apple (A), ibm (B), warm (C). */
export type AppTheme = "apple" | "ibm" | "warm";

export const COLOR_SCHEME_ORDER: ColorScheme[] = ["system", "light", "dark"];

export const APP_THEME_ORDER: AppTheme[] = ["apple", "ibm", "warm"];
