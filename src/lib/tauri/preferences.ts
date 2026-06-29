import type { AppPreferences } from "../../types/files";
import type { AppTheme, ColorScheme, EditMode, ViewMode } from "../../stores/appStore";
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
  EDITOR_SYNTAX_COLORS_DEFAULT,
  DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS,
  normalizeEditorSyntaxColors,
  normalizeEditorSyntaxCustomColors,
  normalizeEditorTabSize,
} from "../editor/settings";
import {
  clampPreviewFontSize,
  PREVIEW_FONT_SIZE_DEFAULT,
} from "../preview/settings";
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
import {
  expandedPathsForMode,
  FOLDER_TREE_EXPANSION_DEFAULT,
  normalizeFolderTreeExpansion,
} from "../files/treeExpansion";
import {
  DEFAULT_EDIT_MODE,
  normalizeEditMode,
} from "../editor/editMode";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  DEFAULT_AI_STRUCTURE_PREFERENCES,
  normalizeAiStructurePreferences,
} from "../aiStructure/settings";
import { getPreferences, savePreferences } from "./commands";

function isPrimaryWorkspaceWindow(): boolean {
  if (!isTauri()) return true;
  return getCurrentWindow().label === "main";
}

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
  defaultEditMode: DEFAULT_EDIT_MODE,
  restoreLastFolderOnStartup: true,
  folderTreeExpansion: FOLDER_TREE_EXPANSION_DEFAULT,
  editorFontSize: EDITOR_FONT_SIZE_DEFAULT,
  previewFontSize: PREVIEW_FONT_SIZE_DEFAULT,
  editorTabSize: EDITOR_TAB_SIZE_DEFAULT,
  editorLineNumbers: true,
  editorLineWrap: true,
  editorSyntaxColors: EDITOR_SYNTAX_COLORS_DEFAULT,
  editorSyntaxCustomColors: DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS,
  exportPdfTheme: EXPORT_PDF_THEME_DEFAULT,
  exportPdfPageSize: EXPORT_PDF_PAGE_SIZE_DEFAULT,
  recentFolders: [],
  lastOpenFolder: null,
  aiStructure: DEFAULT_AI_STRUCTURE_PREFERENCES,
};

const DEFAULT_VIEW_MODE: ViewMode = "split";

function isViewMode(value: string): value is ViewMode {
  return value === "split" || value === "editor" || value === "preview";
}

function isEditMode(value: string): value is EditMode {
  return value === "source" || value === "wysiwyg";
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
  merged.folderTreeExpansion = normalizeFolderTreeExpansion(
    merged.folderTreeExpansion,
  );
  merged.aiStructure = normalizeAiStructurePreferences(merged.aiStructure);
  merged.defaultEditMode = normalizeEditMode(merged.defaultEditMode);

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
    defaultEditMode: state.defaultEditMode,
    restoreLastFolderOnStartup: state.restoreLastFolderOnStartup,
    folderTreeExpansion: state.folderTreeExpansion,
    editorFontSize: state.editorFontSize,
    previewFontSize: state.previewFontSize,
    editorTabSize: state.editorTabSize,
    editorLineNumbers: state.editorLineNumbers,
    editorLineWrap: state.editorLineWrap,
    editorSyntaxColors: state.editorSyntaxColors,
    editorSyntaxCustomColors: state.editorSyntaxCustomColors,
    exportPdfTheme: state.exportPdfTheme,
    exportPdfPageSize: state.exportPdfPageSize,
    recentFolders: state.recentFolders,
    lastOpenFolder: isPrimaryWorkspaceWindow()
      ? (state.rootFolder ?? existing?.lastOpenFolder ?? null)
      : (existing?.lastOpenFolder ?? null),
    aiStructure: state.aiStructure,
  };
}

export function applyPreferencesToStore(prefs: AppPreferences) {
  const normalized = normalizePreferences(prefs);
  const colorScheme: ColorScheme = normalized.colorScheme as ColorScheme;
  const theme: AppTheme = normalized.theme as AppTheme;
  const defaultViewMode: ViewMode = isViewMode(normalized.defaultViewMode)
    ? normalized.defaultViewMode
    : DEFAULT_VIEW_MODE;
  const defaultEditMode: EditMode = isEditMode(normalized.defaultEditMode)
    ? normalized.defaultEditMode
    : DEFAULT_EDIT_MODE;
  const sidebarWidth = clampSidebarWidth(normalized.sidebarWidth);
  const editorFontSize = clampEditorFontSize(
    normalized.editorFontSize ?? EDITOR_FONT_SIZE_DEFAULT,
  );
  const previewFontSize = clampPreviewFontSize(
    normalized.previewFontSize ?? PREVIEW_FONT_SIZE_DEFAULT,
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
    defaultEditMode,
    restoreLastFolderOnStartup: normalized.restoreLastFolderOnStartup,
    folderTreeExpansion: normalizeFolderTreeExpansion(
      normalized.folderTreeExpansion,
    ),
    editorFontSize,
    previewFontSize,
    editorTabSize,
    editorLineNumbers: normalized.editorLineNumbers ?? true,
    editorLineWrap: normalized.editorLineWrap ?? true,
    editorSyntaxColors: normalizeEditorSyntaxColors(
      normalized.editorSyntaxColors,
    ),
    editorSyntaxCustomColors: normalizeEditorSyntaxCustomColors(
      normalized.editorSyntaxCustomColors,
    ),
    exportPdfTheme,
    exportPdfPageSize,
    recentFolders: normalized.recentFolders,
    aiStructure: normalizeAiStructurePreferences(normalized.aiStructure),
    tabs: state.tabs.map((tab) =>
      tab.path === null
        ? { ...tab, viewMode: defaultViewMode, editMode: defaultEditMode }
        : tab,
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
    defaultEditMode: DEFAULT_PREFERENCES.defaultEditMode as EditMode,
    tabs: state.tabs.map((tab) =>
      tab.path === null
        ? {
            ...tab,
            viewMode: DEFAULT_PREFERENCES.defaultViewMode as ViewMode,
            editMode: DEFAULT_PREFERENCES.defaultEditMode as EditMode,
          }
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
    editorSyntaxColors: normalizeEditorSyntaxColors(
      DEFAULT_PREFERENCES.editorSyntaxColors,
    ),
    editorSyntaxCustomColors: normalizeEditorSyntaxCustomColors(
      DEFAULT_PREFERENCES.editorSyntaxCustomColors,
    ),
  });
  void flushPersistPreferences();
}

export function resetFilesSettings(): void {
  useAppStore.setState((state) => {
    const folderTreeExpansion = normalizeFolderTreeExpansion(
      DEFAULT_PREFERENCES.folderTreeExpansion,
    );
    return {
      restoreLastFolderOnStartup: DEFAULT_PREFERENCES.restoreLastFolderOnStartup,
      folderTreeExpansion,
      expandedPaths:
        state.rootFolder && state.fileTree.length > 0
          ? expandedPathsForMode(state.fileTree, folderTreeExpansion)
          : state.expandedPaths,
    };
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

export function resetAiStructureSettings(): void {
  useAppStore.setState({
    aiStructure: DEFAULT_AI_STRUCTURE_PREFERENCES,
  });
  void flushPersistPreferences();
}
