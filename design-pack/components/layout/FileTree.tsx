import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { pathsEqual } from "../../lib/paths";
import {
  flattenVisibleTree,
  parentFolderPath,
} from "../../lib/files/visibleTree";
import type { TreeNode } from "../../types/files";
import { getTreeIcons } from "../../lib/theme/icons";

interface FileTreeProps {
  nodes: TreeNode[];
  depth?: number;
  onOpenFile: (path: string) => void;
  focusPath?: string | null;
  onSetFocusPath?: (path: string) => void;
}

function treeItemId(path: string): string {
  return `tree-item-${path.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function TreeItem({
  node,
  depth,
  onOpenFile,
  focusPath,
  onSetFocusPath,
}: {
  node: TreeNode;
  depth: number;
  onOpenFile: (path: string) => void;
  focusPath: string | null;
  onSetFocusPath?: (path: string) => void;
}) {
  const expandedPaths = useAppStore((s) => s.expandedPaths);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const tabs = useAppStore((s) => s.tabs);
  const appTheme = useAppStore((s) => s.theme);
  const toggleFolder = useAppStore((s) => s.toggleFolder);
  const { ChevronIcon, FileIcon, FolderIcon } = getTreeIcons(appTheme);

  const rowRef = useRef<HTMLButtonElement>(null);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isActive =
    node.type === "file" && pathsEqual(activeTab?.path, node.path);
  const isFocused = focusPath === node.path;
  const isExpanded = expandedPaths[node.path] ?? depth < 1;

  useEffect(() => {
    if (isFocused) {
      rowRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isFocused]);

  if (node.type === "folder") {
    const children = node.children ?? [];
    return (
      <div className="tree-folder" role="none">
        <button
          ref={rowRef}
          id={treeItemId(node.path)}
          className={`tree-row folder-row${isFocused ? " tree-row--focused" : ""}`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          role="treeitem"
          aria-expanded={isExpanded}
          aria-selected={false}
          tabIndex={isFocused ? 0 : -1}
          onClick={() => {
            onSetFocusPath?.(node.path);
            toggleFolder(node.path, isExpanded);
          }}
        >
          <span className="tree-chevron">
            <ChevronIcon expanded={isExpanded} />
          </span>
          <span className="tree-icon">
            <FolderIcon />
          </span>
          <span className="tree-label">{node.name}</span>
        </button>
        {isExpanded && (
          <div className="tree-children" role="group">
            <FileTree
              nodes={children}
              depth={depth + 1}
              onOpenFile={onOpenFile}
              focusPath={focusPath}
              onSetFocusPath={onSetFocusPath}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      ref={rowRef}
      id={treeItemId(node.path)}
      className={`tree-row file-row${isActive ? " active" : ""}${isFocused ? " tree-row--focused" : ""}`}
      style={{ paddingLeft: `${20 + depth * 12}px` }}
      role="treeitem"
      aria-selected={isActive}
      tabIndex={isFocused ? 0 : -1}
      onClick={() => {
        onSetFocusPath?.(node.path);
        onOpenFile(node.path);
      }}
      title={node.path}
    >
      <span className="tree-icon">
        <FileIcon />
      </span>
      <span className="tree-label">{node.name}</span>
    </button>
  );
}

export function FileTree({
  nodes,
  depth = 0,
  onOpenFile,
  focusPath: focusPathProp,
  onSetFocusPath,
}: FileTreeProps) {
  const expandedPaths = useAppStore((s) => s.expandedPaths);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const allTabs = useAppStore((s) => s.tabs);
  const toggleFolder = useAppStore((s) => s.toggleFolder);

  const isRoot = depth === 0;
  const visibleItems = useMemo(
    () => (isRoot ? flattenVisibleTree(nodes, expandedPaths) : []),
    [isRoot, nodes, expandedPaths],
  );

  const [focusPathLocal, setFocusPathLocal] = useState<string | null>(null);
  const focusPath = isRoot ? (focusPathProp ?? focusPathLocal) : focusPathProp ?? null;

  const activeTab = allTabs.find((t) => t.id === activeTabId);

  const handleSetFocusPath = useCallback(
    (path: string) => {
      if (isRoot) setFocusPathLocal(path);
    },
    [isRoot],
  );

  useEffect(() => {
    if (!isRoot || visibleItems.length === 0) return;
    if (activeTab?.path) {
      const exists = visibleItems.some((item) => item.path === activeTab.path);
      if (exists) {
        setFocusPathLocal(activeTab.path);
        return;
      }
    }
    setFocusPathLocal((current) => {
      if (current && visibleItems.some((item) => item.path === current)) {
        return current;
      }
      return visibleItems[0]?.path ?? null;
    });
  }, [isRoot, activeTab?.path, visibleItems]);

  const moveFocus = useCallback(
    (delta: number) => {
      if (!isRoot || visibleItems.length === 0) return;
      const index = Math.max(
        0,
        visibleItems.findIndex((item) => item.path === focusPath),
      );
      const next = visibleItems[index + delta];
      if (next) setFocusPathLocal(next.path);
    },
    [isRoot, visibleItems, focusPath],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isRoot || visibleItems.length === 0) return;

      const index = visibleItems.findIndex((item) => item.path === focusPath);
      const current = visibleItems[index];
      if (!current) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveFocus(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveFocus(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          if (current.type === "folder" && !current.isExpanded) {
            toggleFolder(current.path, current.isExpanded);
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (current.type === "folder" && current.isExpanded) {
            toggleFolder(current.path, current.isExpanded);
          } else {
            const parent = parentFolderPath(visibleItems, index);
            if (parent) setFocusPathLocal(parent);
          }
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (current.type === "folder") {
            toggleFolder(current.path, current.isExpanded);
          } else {
            onOpenFile(current.path);
          }
          break;
        case "Home":
          event.preventDefault();
          setFocusPathLocal(visibleItems[0]?.path ?? null);
          break;
        case "End":
          event.preventDefault();
          setFocusPathLocal(visibleItems[visibleItems.length - 1]?.path ?? null);
          break;
        default:
          break;
      }
    },
    [isRoot, visibleItems, focusPath, moveFocus, toggleFolder, onOpenFile],
  );

  if (isRoot) {
    return (
      <div
        className="file-tree"
        role="tree"
        aria-label="Files"
        onKeyDown={handleKeyDown}
        aria-activedescendant={
          focusPath ? treeItemId(focusPath) : undefined
        }
      >
        {nodes.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            onOpenFile={onOpenFile}
            focusPath={focusPath}
            onSetFocusPath={handleSetFocusPath}
          />
        ))}

        <style>{FILE_TREE_STYLES}</style>
      </div>
    );
  }

  return (
    <>
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={depth}
          onOpenFile={onOpenFile}
          focusPath={focusPath}
          onSetFocusPath={onSetFocusPath}
        />
      ))}
    </>
  );
}

const FILE_TREE_STYLES = `
  .file-tree {
    display: flex;
    flex-direction: column;
    padding: 2px 6px;
    outline: none;
  }
  .tree-children {
    margin-left: 10px;
    border-left: 1px solid var(--border-subtle);
  }
  .tree-row {
    display: flex;
    align-items: center;
    gap: 5px;
    width: 100%;
    min-height: 28px;
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: var(--text-primary);
    font-size: 12px;
    text-align: left;
    border-radius: var(--radius-sm);
  }
  .tree-row:hover {
    background: var(--bg-hover);
  }
  .tree-row:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .tree-row--focused {
    background: var(--bg-hover);
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
  .file-row.active {
    background: var(--accent-subtle);
    color: var(--text-primary);
    font-weight: 600;
  }
  .file-row.active.tree-row--focused {
    outline-color: var(--accent);
  }
  .tree-chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    flex-shrink: 0;
    color: var(--text-muted);
  }
  .tree-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--text-secondary);
  }
  .file-row.active .tree-icon {
    color: var(--accent);
  }
  .tree-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
