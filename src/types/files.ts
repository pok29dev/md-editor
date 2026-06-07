export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

export interface FolderTree {
  root: string;
  nodes: TreeNode[];
}

export interface FileContent {
  path: string;
  content: string;
  encoding: "utf-8" | "utf-8-bom";
  modifiedAt: number;
}

export interface AppPreferences {
  /** Light/dark appearance: system | light | dark */
  colorScheme: string;
  /** Color + icon system: default | blue | warm */
  theme: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  syncScroll: boolean;
  defaultViewMode: string;
  restoreLastFolderOnStartup: boolean;
  editorFontSize: number;
  editorTabSize: number;
  editorLineNumbers: boolean;
  editorLineWrap: boolean;
  exportPdfTheme: string;
  exportPdfPageSize: string;
  recentFolders: string[];
  lastOpenFolder: string | null;
}
