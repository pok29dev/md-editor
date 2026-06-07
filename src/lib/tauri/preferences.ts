import type { AppPreferences } from "../../types/files";
import type { AppTheme, ColorScheme, ViewMode } from "../../stores/appStore";
import { useAppStore } from "../../stores/appStore";
import {
  SIDEBAR_WIDTH_DEFAULT,
  applySidebarWidth,
  clampSidebarWidth,
} from "../layout/sidebarWidth";
import {
  clampEditorFontSize,
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_TAB_SIZE_DEFAULT,
  normalizeEditorTabSize,
} from "../editor/settings";
import {
  EXPORT_PDF_PAGE_SIZE_DEFAULT,
  EXPORT_PDF_THEME_DEFAULT,
  normalizeExportPdfPageSize,
  normalizeExportPdfTheme,
} from "../markdown/exportSettings";
import {
  DEFAULT_APP_THEME,
  DEFAULT_COLOR_SCHEME,
  isAppTheme,
  isColorScheme,
  normalizeAppTheme,
  normalizeColorScheme,
} from "../theme/defaults";
import { getPreferences, savePreferences } from "./commands";

export {
  SIDEBAR_WIDTH_DEFAULT as DEFAULT_SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MIN,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_STEP,
} from "../layout/sidebarWidth";
export { applySidebarWidth, clampSidebarWidth };

export const DEFAULT_PREFERENCES: AppPreferences = {
  colorScheme: DEFAULT_COLOR_SCHEME,
  theme: DEFAULT_APP_THEME,
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  sidebarCollapsed: false,
  syncScroll: true,
  defaultViewMode: "split",
  restoreLastFolderOnStartup: true,
  editorFontSize: EDITOR_FONT_SIZE_DEFAULT,
  editorTabSize: EDITOR_TAB_SIZE_DEFAULT,
  editorLineNumbers: true,
  editorLineWrap: true,
  exportPdfTheme: EXPORT_PDF_THEME_DEFAULT,
  exportPdfPageSize: EXPORT_PDF_PAGE_SIZE_DEFAULT,
  recentFolders: [],
  lastOpenFolder: null,
};

const DEFAULT_VIEW_MODE: ViewMode = "split";

function isViewMode(value: string): value is ViewMode {
  return value === "split" || value === "editor" || value === "preview";
}

/** Migrate legacy preferences where `theme` stored color scheme. */
export function normalizePreferences(
  raw: Partial<AppPreferences>,
): AppPreferences {
  const merged: AppPreferences = {
    ...DEFAULT_PREFERENCES,
    ...raw,
  };

  if (!raw.colorScheme && raw.theme && isColorScheme(raw.theme)) {
    merged.colorScheme = raw.theme;
    merged.theme = DEFAULT_APP_THEME;
  }

  merged.colorScheme = normalizeColorScheme(merged.colorScheme);
  merged.theme = normalizeAppTheme(
    isAppTheme(merged.theme) ? merged.theme : DEFAULT_APP_THEME,
  );

  return merged;
}

export function buildPreferencesFromState(
  existing?: Partial<AppPreferences> | null,
): AppPreferences {
  const state = useAppStore.getState();

  return {
    colorScheme: state.colorScheme,
    theme: state.theme,
    sidebarWidth: state.sidebarWidth,
    sidebarCollapsed: state.sidebarCollapsed,
    syncScroll: state.syncScroll,
    defaultViewMode: state.defaultViewMode,
    restoreLastFolderOnStartup: state.restoreLastFolderOnStartup,
    editorFontSize: state.editorFontSize,
    editorTabSize: state.editorTabSize,
    editorLineNumbers: state.editorLineNumbers,
    editorLineWrap: state.editorLineWrap,
    exportPdfTheme: state.exportPdfTheme,
    exportPdfPageSize: state.exportPdfPageSize,
    recentFolders: state.recentFolders,
    lastOpenFolder: state.rootFolder ?? existing?.lastOpenFolder ?? null,
  };
}

export function applyPreferencesToStore(prefs: AppPreferences) {
  const normalized = normalizePreferences(prefs);
  const colorScheme: ColorScheme = normalized.colorScheme as ColorScheme;
  const theme: AppTheme = normalized.theme as AppTheme;
  const defaultViewMode: ViewMode = isViewMode(normalized.defaultViewMode)
    ? normalized.defaultViewMode
    : DEFAULT_VIEW_MODE;
  const sidebarWidth = clampSidebarWidth(normalized.sidebarWidth);
  const editorFontSize = clampEditorFontSize(
    normalized.editorFontSize ?? EDITOR_FONT_SIZE_DEFAULT,
  );
  const editorTabSize = normalizeEditorTabSize(
    normalized.editorTabSize ?? EDITOR_TAB_SIZE_DEFAULT,
  );
  const exportPdfTheme = normalizeExportPdfTheme(
    normalized.exportPdfTheme ?? EXPORT_PDF_THEME_DEFAULT,
  );
  const exportPdfPageSize = normalizeExportPdfPageSize(
    normalized.exportPdfPageSize ?? EXPORT_PDF_PAGE_SIZE_DEFAULT,
  );

  useAppStore.setState((state) => ({
    colorScheme,
    theme,
    sidebarCollapsed: normalized.sidebarCollapsed,
    syncScroll: normalized.syncScroll,
    sidebarWidth,
    defaultViewMode,
    restoreLastFolderOnStartup: normalized.restoreLastFolderOnStartup,
    editorFontSize,
    editorTabSize,
    editorLineNumbers: normalized.editorLineNumbers ?? true,
    editorLineWrap: normalized.editorLineWrap ?? true,
    exportPdfTheme,
    exportPdfPageSize,
    recentFolders: normalized.recentFolders,
    tabs: state.tabs.map((tab) =>
      tab.path === null ? { ...tab, viewMode: defaultViewMode } : tab,
    ),
  }));

  applySidebarWidth(sidebarWidth);
}

export async function loadPreferences(): Promise<AppPreferences> {
  const prefs = await getPreferences().catch(() => DEFAULT_PREFERENCES);
  const normalized = normalizePreferences(prefs);
  applyPreferencesToStore(normalized);
  return normalized;
}

let persistTimeout: ReturnType<typeof setTimeout> | undefined;

export function schedulePersistPreferences(delay = 300): void {
  clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    persistTimeout = undefined;
    void persistPreferences();
  }, delay);
}

export function flushPersistPreferences(): Promise<void> {
  clearTimeout(persistTimeout);
  persistTimeout = undefined;
  return persistPreferences();
}

export async function persistPreferences(): Promise<void> {
  const existing = await getPreferences().catch(() => null);
  await savePreferences(buildPreferencesFromState(existing));
}

export async function clearRecentFolders(): Promise<void> {
  useAppStore.setState({ recentFolders: [] });
  await persistPreferences();
}

export function syncRecentFoldersFromPreferences(prefs: AppPreferences) {
  useAppStore.setState({ recentFolders: prefs.recentFolders });
}

export function resetGeneralSettings(): void {
  useAppStore.setState((state) => ({
    colorScheme: DEFAULT_PREFERENCES.colorScheme as ColorScheme,
    theme: DEFAULT_PREFERENCES.theme as AppTheme,
    syncScroll: DEFAULT_PREFERENCES.syncScroll,
    sidebarCollapsed: DEFAULT_PREFERENCES.sidebarCollapsed,
    sidebarWidth: DEFAULT_PREFERENCES.sidebarWidth,
    defaultViewMode: DEFAULT_PREFERENCES.defaultViewMode as ViewMode,
    tabs: state.tabs.map((tab) =>
      tab.path === null
        ? { ...tab, viewMode: DEFAULT_PREFERENCES.defaultViewMode as ViewMode }
        : tab,
    ),
  }));
  applySidebarWidth(DEFAULT_PREFERENCES.sidebarWidth);
  void flushPersistPreferences();
}

export function resetEditorSettings(): void {
  useAppStore.setState({
    editorFontSize: DEFAULT_PREFERENCES.editorFontSize,
    editorTabSize: normalizeEditorTabSize(DEFAULT_PREFERENCES.editorTabSize),
    editorLineNumbers: DEFAULT_PREFERENCES.editorLineNumbers,
    editorLineWrap: DEFAULT_PREFERENCES.editorLineWrap,
  });
  void flushPersistPreferences();
}

export function resetFilesSettings(): void {
  useAppStore.setState({
    restoreLastFolderOnStartup: DEFAULT_PREFERENCES.restoreLastFolderOnStartup,
  });
  void flushPersistPreferences();
}

export function resetExportSettings(): void {
  useAppStore.setState({
    exportPdfTheme: normalizeExportPdfTheme(DEFAULT_PREFERENCES.exportPdfTheme),
    exportPdfPageSize: normalizeExportPdfPageSize(
      DEFAULT_PREFERENCES.exportPdfPageSize,
    ),
  });
  void flushPersistPreferences();
}
