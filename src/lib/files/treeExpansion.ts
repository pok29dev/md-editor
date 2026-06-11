import type { TreeNode } from "../../types/files";

export type FolderTreeExpansion = "one_level" | "all";

export const FOLDER_TREE_EXPANSION_DEFAULT: FolderTreeExpansion = "one_level";

export function normalizeFolderTreeExpansion(
  value: string | undefined | null,
): FolderTreeExpansion {
  return value === "all" ? "all" : FOLDER_TREE_EXPANSION_DEFAULT;
}

export function collectRootFolderPaths(nodes: TreeNode[]): Record<string, boolean> {
  const paths: Record<string, boolean> = {};
  for (const node of nodes) {
    if (node.type === "folder") {
      paths[node.path] = true;
    }
  }
  return paths;
}

export function collectAllFolderPaths(nodes: TreeNode[]): Record<string, boolean> {
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

export function expandedPathsForMode(
  nodes: TreeNode[],
  mode: FolderTreeExpansion,
): Record<string, boolean> {
  return mode === "all"
    ? collectAllFolderPaths(nodes)
    : collectRootFolderPaths(nodes);
}

export function collapseAllFolderPaths(nodes: TreeNode[]): Record<string, boolean> {
  const paths: Record<string, boolean> = {};
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.type === "folder") {
        paths[node.path] = false;
        if (node.children) walk(node.children);
      }
    }
  };
  walk(nodes);
  return paths;
}
