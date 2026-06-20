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

export interface SyntaxColorPalette {
  property: string;
  string: string;
  literal: string;
  keyword: string;
  comment: string;
  punctuation: string;
}

export interface EditorSyntaxCustomColors {
  light: SyntaxColorPalette;
  dark: SyntaxColorPalette;
}

import type { AiStructurePreferences } from "../lib/aiStructure/settings";

export type { AiStructurePreferences };

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
  folderTreeExpansion: string;
  editorFontSize: number;
  previewFontSize: number;
  editorTabSize: number;
  editorLineNumbers: boolean;
  editorLineWrap: boolean;
  editorSyntaxColors: string;
  editorSyntaxCustomColors: EditorSyntaxCustomColors;
  exportPdfTheme: string;
  exportPdfPageSize: string;
  recentFolders: string[];
  lastOpenFolder: string | null;
  aiStructure: AiStructurePreferences;
}
