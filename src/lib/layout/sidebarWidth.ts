export const SIDEBAR_WIDTH_MIN = 180;
export const SIDEBAR_WIDTH_MAX = 400;
export const SIDEBAR_WIDTH_STEP = 10;
export const SIDEBAR_WIDTH_DEFAULT = 240;

export function clampSidebarWidth(width: number): number {
  const stepped =
    Math.round(width / SIDEBAR_WIDTH_STEP) * SIDEBAR_WIDTH_STEP;
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, stepped));
}

export function applySidebarWidth(width: number) {
  document.documentElement.style.setProperty(
    "--sidebar-width",
    `${clampSidebarWidth(width)}px`,
  );
}
