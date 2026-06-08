import type { TreeNode } from "../../types/files";

export interface VisibleTreeItem {
  path: string;
  name: string;
  type: "file" | "folder";
  depth: number;
  isExpanded: boolean;
}

export function isFolderExpanded(
  path: string,
  depth: number,
  expandedPaths: Record<string, boolean>,
): boolean {
  return expandedPaths[path] ?? depth < 1;
}

export function flattenVisibleTree(
  nodes: TreeNode[],
  expandedPaths: Record<string, boolean>,
  depth = 0,
): VisibleTreeItem[] {
  const items: VisibleTreeItem[] = [];

  for (const node of nodes) {
    const expanded =
      node.type === "folder" &&
      isFolderExpanded(node.path, depth, expandedPaths);

    items.push({
      path: node.path,
      name: node.name,
      type: node.type,
      depth,
      isExpanded: expanded,
    });

    if (node.type === "folder" && expanded && node.children?.length) {
      items.push(
        ...flattenVisibleTree(node.children, expandedPaths, depth + 1),
      );
    }
  }

  return items;
}

export function parentFolderPath(
  items: VisibleTreeItem[],
  index: number,
): string | null {
  const current = items[index];
  if (!current) return null;

  for (let i = index - 1; i >= 0; i -= 1) {
    const item = items[i];
    if (item.type === "folder" && item.depth < current.depth) {
      return item.path;
    }
  }

  return null;
}
