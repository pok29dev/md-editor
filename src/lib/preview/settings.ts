export const PREVIEW_FONT_SIZE_DEFAULT = 16;
export const PREVIEW_FONT_SIZE_MIN = 12;
export const PREVIEW_FONT_SIZE_MAX = 28;
export const PREVIEW_FONT_SIZE_STEP = 1;
export const PREVIEW_CONTENT_WIDTH_PX = 700;

export function clampPreviewFontSize(size: number): number {
  return Math.min(
    PREVIEW_FONT_SIZE_MAX,
    Math.max(PREVIEW_FONT_SIZE_MIN, Math.round(size)),
  );
}

export function previewFontScalePercent(
  size: number = PREVIEW_FONT_SIZE_DEFAULT,
): number {
  return Math.round((size / PREVIEW_FONT_SIZE_DEFAULT) * 100);
}
