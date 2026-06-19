import { create } from "zustand";
import { clampSidebarWidth } from "../lib/layout/sidebarWidth";
import {
  clampEditorFontSize,
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_TAB_SIZE_DEFAULT,
  EDITOR_SYNTAX_COLORS_DEFAULT,
  DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS,
  normalizeEditorSyntaxColors,
  normalizeEditorSyntaxCustomColors,
  normalizeEditorTabSize,
  type EditorSyntaxColorScheme,
  type EditorSyntaxCustomColors,
  type SyntaxColorToken,
} from "../lib/editor/settings";
import { updateSyntaxCustomPaletteToken } from "../lib/editor/syntaxCustomColors";
import {
  clampPreviewFontSize,
  PREVIEW_FONT_SIZE_DEFAULT,
} from "../lib/preview/settings";
import {
  EXPORT_PDF_PAGE_SIZE_DEFAULT,
  EXPORT_PDF_THEME_DEFAULT,
  normalizeExportPdfPageSize,
  normalizeExportPdfTheme,
  type ExportPdfPageSize,
  type ExportPdfTheme,
} from "../lib/markdown/exportSettings";
import type { TreeNode } from "../types/files";
import {
  collapseAllFolderPaths,
  collectAllFolderPaths,
  expandedPathsForMode,
  FOLDER_TREE_EXPANSION_DEFAULT,
  normalizeFolderTreeExpansion,
  type FolderTreeExpansion,
} from "../lib/files/treeExpansion";
import { pathsEqual } from "../lib/paths";
import {
  DEFAULT_APP_THEME,
  DEFAULT_COLOR_SCHEME,
  normalizeAppTheme,
  normalizeColorScheme,
} from "../lib/theme/defaults";
import type {
  AppTheme,
  ColorScheme,
  ResolvedColorScheme,
} from "../lib/theme/types";
import type { FileKind } from "../lib/files/fileKind";
import { detectFileKind, supportsPreview } from "../lib/files/fileKind";

export type ViewMode = "split" | "editor" | "preview";
export type { AppTheme, ColorScheme, ResolvedColorScheme };
export type { ExportPdfPageSize, ExportPdfTheme } from "../lib/markdown/exportSettings";
export type { FolderTreeExpansion } from "../lib/files/treeExpansion";
export type { EditorSyntaxColorScheme, EditorSyntaxCustomColors } from "../lib/editor/settings";

export interface EditorTab {
  id: string;
  path: string | null;
  title: string;
  content: string;
  isDirty: boolean;
  viewMode: ViewMode;
  fileKind: FileKind;
}

interface AppState {
  colorScheme: ColorScheme;
  resolvedColorScheme: ResolvedColorScheme;
  theme: AppTheme;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  syncScroll: boolean;
  defaultViewMode: ViewMode;
  restoreLastFolderOnStartup: boolean;
  folderTreeExpansion: FolderTreeExpansion;
  editorFontSize: number;
  previewFontSize: number;
  editorTabSize: 2 | 4;
  editorLineNumbers: boolean;
  editorLineWrap: boolean;
  editorSyntaxColors: EditorSyntaxColorScheme;
  editorSyntaxCustomColors: EditorSyntaxCustomColors;
  exportPdfTheme: ExportPdfTheme;
  exportPdfPageSize: ExportPdfPageSize;
  recentFolders: string[];
  settingsOpen: boolean;
  tabs: EditorTab[];
  activeTabId: string | null;
  rootFolder: string | null;
  fileTree: TreeNode[];
  expandedPaths: Record<string, boolean>;
  fileTreeLoading: boolean;
  fileTreeError: string | null;

  setColorScheme: (colorScheme: ColorScheme) => void;
  setResolvedColorScheme: (colorScheme: ResolvedColorScheme) => void;
  setTheme: (theme: AppTheme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setSyncScroll: (enabled: boolean) => void;
  setDefaultViewMode: (mode: ViewMode) => void;
  setRestoreLastFolderOnStartup: (enabled: boolean) => void;
  setFolderTreeExpansion: (mode: FolderTreeExpansion) => void;
  setEditorFontSize: (size: number) => void;
  setPreviewFontSize: (size: number) => void;
  resetPreviewFontSize: () => void;
  setEditorTabSize: (size: 2 | 4) => void;
  setEditorLineNumbers: (enabled: boolean) => void;
  setEditorLineWrap: (enabled: boolean) => void;
  setEditorSyntaxColors: (scheme: EditorSyntaxColorScheme) => void;
  setEditorSyntaxCustomColors: (colors: EditorSyntaxCustomColors) => void;
  setEditorSyntaxCustomColor: (
    mode: "light" | "dark",
    token: SyntaxColorToken,
    value: string,
  ) => void;
  resetEditorSyntaxCustomColors: () => void;
  setExportPdfTheme: (theme: ExportPdfTheme) => void;
  setExportPdfPageSize: (pageSize: ExportPdfPageSize) => void;
  setRecentFolders: (folders: string[]) => void;
  setSettingsOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setRootFolder: (path: string | null) => void;
  setFileTree: (nodes: TreeNode[]) => void;
  setFileTreeLoading: (loading: boolean) => void;
  setFileTreeError: (error: string | null) => void;
  toggleFolder: (path: string, expanded: boolean) => void;
  expandAllFolders: () => void;
  collapseAllFolders: () => void;
  applyFolderExpansion: (nodes: TreeNode[]) => void;
  addTab: (tab?: Partial<EditorTab>) => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (keepId: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  openFileInTab: (file: {
    path: string;
    title: string;
    content: string;
    fileKind?: FileKind;
  }) => void;
  markTabSaved: (id: string) => void;
  updateTabAfterSave: (id: string, path: string) => void;
  findTabByPath: (path: string) => EditorTab | undefined;
}

let tabCounter = 0;

function createTab(
  partial?: Partial<EditorTab>,
  defaultViewMode: ViewMode = "split",
): EditorTab {
  tabCounter += 1;
  const fileKind = partial?.fileKind ?? (partial?.path ? detectFileKind(partial.path) : "markdown");
  const viewMode =
    partial?.viewMode ??
    (supportsPreview(fileKind) ? defaultViewMode : "editor");
  return {
    id: `tab-${tabCounter}`,
    path: null,
    title: "Untitled",
    content: "",
    isDirty: false,
    viewMode,
    fileKind,
    ...partial,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  colorScheme: DEFAULT_COLOR_SCHEME,
  resolvedColorScheme: "light",
  theme: DEFAULT_APP_THEME,
  sidebarCollapsed: false,
  sidebarWidth: 240,
  syncScroll: true,
  defaultViewMode: "split",
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
  settingsOpen: false,
  tabs: [
    createTab({
      title: "Welcome",
      content: "# Welcome to MD Editor\n\nOpen a folder to get started.",
    }),
  ],
  activeTabId: null,
  rootFolder: null,
  fileTree: [],
  expandedPaths: {},
  fileTreeLoading: false,
  fileTreeError: null,

  setColorScheme: (colorScheme) =>
    set({ colorScheme: normalizeColorScheme(colorScheme) }),
  setResolvedColorScheme: (resolvedColorScheme) => set({ resolvedColorScheme }),
  setTheme: (theme) => set({ theme: normalizeAppTheme(theme) }),
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
  },
  setSidebarCollapsed: (sidebarCollapsed: boolean) => set({ sidebarCollapsed }),
  setSidebarWidth: (sidebarWidth) =>
    set({ sidebarWidth: clampSidebarWidth(sidebarWidth) }),
  setSyncScroll: (syncScroll) => set({ syncScroll }),
  setDefaultViewMode: (defaultViewMode) =>
    set((s) => ({
      defaultViewMode,
      tabs: s.tabs.map((t) =>
        t.path === null ? { ...t, viewMode: defaultViewMode } : t,
      ),
    })),
  setRestoreLastFolderOnStartup: (restoreLastFolderOnStartup) =>
    set({ restoreLastFolderOnStartup }),
  setFolderTreeExpansion: (folderTreeExpansion) =>
    set((s) => {
      const mode = normalizeFolderTreeExpansion(folderTreeExpansion);
      return {
        folderTreeExpansion: mode,
        expandedPaths:
          s.rootFolder && s.fileTree.length > 0
            ? expandedPathsForMode(s.fileTree, mode)
            : s.expandedPaths,
      };
    }),
  setEditorFontSize: (editorFontSize) =>
    set({ editorFontSize: clampEditorFontSize(editorFontSize) }),
  setPreviewFontSize: (previewFontSize) =>
    set({ previewFontSize: clampPreviewFontSize(previewFontSize) }),
  resetPreviewFontSize: () =>
    set({ previewFontSize: PREVIEW_FONT_SIZE_DEFAULT }),
  setEditorTabSize: (editorTabSize) =>
    set({ editorTabSize: normalizeEditorTabSize(editorTabSize) }),
  setEditorLineNumbers: (editorLineNumbers) => set({ editorLineNumbers }),
  setEditorLineWrap: (editorLineWrap) => set({ editorLineWrap }),
  setEditorSyntaxColors: (editorSyntaxColors) =>
    set({ editorSyntaxColors: normalizeEditorSyntaxColors(editorSyntaxColors) }),
  setEditorSyntaxCustomColors: (editorSyntaxCustomColors) =>
    set({
      editorSyntaxCustomColors:
        normalizeEditorSyntaxCustomColors(editorSyntaxCustomColors),
    }),
  setEditorSyntaxCustomColor: (mode, token, value) =>
    set((state) => ({
      editorSyntaxCustomColors: updateSyntaxCustomPaletteToken(
        state.editorSyntaxCustomColors,
        mode,
        token,
        value,
      ),
    })),
  resetEditorSyntaxCustomColors: () =>
    set({
      editorSyntaxCustomColors: normalizeEditorSyntaxCustomColors(
        DEFAULT_EDITOR_SYNTAX_CUSTOM_COLORS,
      ),
    }),
  setExportPdfTheme: (exportPdfTheme) =>
    set({ exportPdfTheme: normalizeExportPdfTheme(exportPdfTheme) }),
  setExportPdfPageSize: (exportPdfPageSize) =>
    set({ exportPdfPageSize: normalizeExportPdfPageSize(exportPdfPageSize) }),
  setRecentFolders: (recentFolders) => set({ recentFolders }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setViewMode: (viewMode) => {
    const { activeTabId, tabs } = get();
    if (!activeTabId) return;
    const active = tabs.find((t) => t.id === activeTabId);
    if (active && !supportsPreview(active.fileKind) && viewMode !== "editor") {
      return;
    }
    set({
      tabs: tabs.map((t) =>
        t.id === activeTabId ? { ...t, viewMode } : t,
      ),
    });
  },
  setRootFolder: (rootFolder) => set({ rootFolder }),
  setFileTree: (fileTree) => set({ fileTree }),
  setFileTreeLoading: (fileTreeLoading) => set({ fileTreeLoading }),
  setFileTreeError: (fileTreeError) => set({ fileTreeError }),

  toggleFolder: (path, expanded) =>
    set((s) => ({
      expandedPaths: {
        ...s.expandedPaths,
        [path]: !expanded,
      },
    })),

  expandAllFolders: () =>
    set((s) => ({
      expandedPaths: collectAllFolderPaths(s.fileTree),
    })),

  collapseAllFolders: () =>
    set((s) => ({
      expandedPaths: collapseAllFolderPaths(s.fileTree),
    })),

  applyFolderExpansion: (nodes) => {
    const mode = get().folderTreeExpansion;
    set({ expandedPaths: expandedPathsForMode(nodes, mode) });
  },

  findTabByPath: (path) =>
    get().tabs.find((t) => pathsEqual(t.path, path)),

  addTab: (partial) => {
    const tab = createTab(partial, get().defaultViewMode);
    set((s) => ({
      tabs: [...s.tabs, tab],
      activeTabId: tab.id,
    }));
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    if (tabs.length <= 1) return;
    const next = tabs.filter((t) => t.id !== id);
    const nextActive =
      activeTabId === id
        ? next[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)]?.id ??
          next[0]?.id
        : activeTabId;
    set({ tabs: next, activeTabId: nextActive ?? null });
  },

  closeAllTabs: () => {
    const tab = createTab(
      {
        title: "Welcome",
        content: "# Welcome to MD Editor\n\nOpen a folder to get started.",
      },
      get().defaultViewMode,
    );
    set({ tabs: [tab], activeTabId: tab.id });
  },

  closeOtherTabs: (keepId) => {
    const kept = get().tabs.find((t) => t.id === keepId);
    if (!kept) return;
    set({ tabs: [kept], activeTabId: keepId });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t,
      ),
    })),

  openFileInTab: ({ path, title, content, fileKind }) => {
    const existing = get().findTabByPath(path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const kind = fileKind ?? detectFileKind(path);
    const tab = createTab(
      {
        path,
        title,
        content,
        isDirty: false,
        fileKind: kind,
        viewMode: supportsPreview(kind) ? get().defaultViewMode : "editor",
      },
      get().defaultViewMode,
    );
    set((s) => ({
      tabs: [...s.tabs.filter((t) => t.path !== null), tab],
      activeTabId: tab.id,
    }));
  },

  markTabSaved: (id) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
      activeTabId: s.activeTabId ?? id,
    })),

  updateTabAfterSave: (id, path) => {
    const name = path.split(/[/\\]/).pop() ?? path;
    const fileKind = detectFileKind(path);
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              path,
              title: name,
              isDirty: false,
              fileKind,
              viewMode: supportsPreview(fileKind) ? t.viewMode : "editor",
            }
          : t,
      ),
      activeTabId: s.activeTabId ?? id,
    }));
  },
}));

const initial = useAppStore.getState().tabs[0];
if (initial && !useAppStore.getState().activeTabId) {
  useAppStore.setState({ activeTabId: initial.id });
}
