export type ExportPdfTheme = "light" | "dark" | "app";
export type ExportPdfPageSize = "a4" | "letter";

export const EXPORT_PDF_THEME_DEFAULT: ExportPdfTheme = "app";
export const EXPORT_PDF_PAGE_SIZE_DEFAULT: ExportPdfPageSize = "a4";

const PAGE_WIDTH_MM: Record<ExportPdfPageSize, number> = {
  a4: 210,
  letter: 216,
};

export function normalizeExportPdfTheme(value: string): ExportPdfTheme {
  if (value === "light" || value === "dark" || value === "app") return value;
  return EXPORT_PDF_THEME_DEFAULT;
}

export function normalizeExportPdfPageSize(value: string): ExportPdfPageSize {
  return value === "letter" ? "letter" : "a4";
}

export function getExportPageWidthMm(pageSize: ExportPdfPageSize): number {
  return PAGE_WIDTH_MM[pageSize];
}

export function resolveExportPdfIsDark(
  theme: ExportPdfTheme,
  resolvedColorScheme: "light" | "dark",
): boolean {
  if (theme === "app") return resolvedColorScheme === "dark";
  return theme === "dark";
}
