import { create } from "zustand";
import { clampSidebarWidth } from "../lib/layout/sidebarWidth";
import {
  clampEditorFontSize,
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_TAB_SIZE_DEFAULT,
  normalizeEditorTabSize,
} from "../lib/editor/settings";
import {
  EXPORT_PDF_PAGE_SIZE_DEFAULT,
  EXPORT_PDF_THEME_DEFAULT,
  normalizeExportPdfPageSize,
  normalizeExportPdfTheme,
  type ExportPdfPageSize,
  type ExportPdfTheme,
} from "../lib/markdown/exportSettings";
import type { TreeNode } from "../types/files";
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

export type ViewMode = "split" | "editor" | "preview";
export type { AppTheme, ColorScheme, ResolvedColorScheme };
export type { ExportPdfPageSize, ExportPdfTheme } from "../lib/markdown/exportSettings";

export interface EditorTab {
  id: string;
  path: string | null;
  title: string;
  content: string;
  isDirty: boolean;
  viewMode: ViewMode;
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
  editorFontSize: number;
  editorTabSize: 2 | 4;
  editorLineNumbers: boolean;
  editorLineWrap: boolean;
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
  setEditorFontSize: (size: number) => void;
  setEditorTabSize: (size: 2 | 4) => void;
  setEditorLineNumbers: (enabled: boolean) => void;
  setEditorLineWrap: (enabled: boolean) => void;
  setExportPdfTheme: (theme: ExportPdfTheme) => void;
  setExportPdfPageSize: (pageSize: ExportPdfPageSize) => void;
  setRecentFolders: (folders: string[]) => void;
  setSettingsOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setRootFolder: (path: string | null) => void;
  setFileTree: (nodes: TreeNode[]) => void;
  setFileTreeLoading: (loading: boolean) => void;
  setFileTreeError: (error: string | null) => void;
  toggleFolder: (path: string) => void;
  expandAllFolders: (nodes: TreeNode[]) => void;
  addTab: (tab?: Partial<EditorTab>) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  openFileInTab: (file: { path: string; title: string; content: string }) => void;
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
  return {
    id: `tab-${tabCounter}`,
    path: null,
    title: "Untitled",
    content: "",
    isDirty: false,
    viewMode: defaultViewMode,
    ...partial,
  };
}

function collectFolderPaths(nodes: TreeNode[]): Record<string, boolean> {
  const paths: Record<string, boolean> = {};
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.type === "folder") {
        paths[node.path] = true;
        if (node.children) walk(node.children);
      }
    }
  };
  walk(nodes);
  return paths;
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
  editorFontSize: EDITOR_FONT_SIZE_DEFAULT,
  editorTabSize: EDITOR_TAB_SIZE_DEFAULT,
  editorLineNumbers: true,
  editorLineWrap: true,
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
  setEditorFontSize: (editorFontSize) =>
    set({ editorFontSize: clampEditorFontSize(editorFontSize) }),
  setEditorTabSize: (editorTabSize) =>
    set({ editorTabSize: normalizeEditorTabSize(editorTabSize) }),
  setEditorLineNumbers: (editorLineNumbers) => set({ editorLineNumbers }),
  setEditorLineWrap: (editorLineWrap) => set({ editorLineWrap }),
  setExportPdfTheme: (exportPdfTheme) =>
    set({ exportPdfTheme: normalizeExportPdfTheme(exportPdfTheme) }),
  setExportPdfPageSize: (exportPdfPageSize) =>
    set({ exportPdfPageSize: normalizeExportPdfPageSize(exportPdfPageSize) }),
  setRecentFolders: (recentFolders) => set({ recentFolders }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setViewMode: (viewMode) => {
    const { activeTabId, tabs } = get();
    if (!activeTabId) return;
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

  toggleFolder: (path) =>
    set((s) => ({
      expandedPaths: {
        ...s.expandedPaths,
        [path]: !s.expandedPaths[path],
      },
    })),

  expandAllFolders: (nodes) =>
    set({ expandedPaths: collectFolderPaths(nodes) }),

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

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t,
      ),
    })),

  openFileInTab: ({ path, title, content }) => {
    const existing = get().findTabByPath(path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const tab = createTab(
      { path, title, content, isDirty: false },
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
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id
          ? { ...t, path, title: name, isDirty: false }
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
