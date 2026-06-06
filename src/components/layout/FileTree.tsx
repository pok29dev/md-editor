import { useAppStore } from "../../stores/appStore";
import { pathsEqual } from "../../lib/paths";
import type { TreeNode } from "../../types/files";

interface FileTreeProps {
  nodes: TreeNode[];
  depth?: number;
  onOpenFile: (path: string) => void;
}

function TreeItem({
  node,
  depth,
  onOpenFile,
}: {
  node: TreeNode;
  depth: number;
  onOpenFile: (path: string) => void;
}) {
  const expandedPaths = useAppStore((s) => s.expandedPaths);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const tabs = useAppStore((s) => s.tabs);
  const toggleFolder = useAppStore((s) => s.toggleFolder);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isActive =
    node.type === "file" && pathsEqual(activeTab?.path, node.path);
  const isExpanded = expandedPaths[node.path] ?? depth < 2;

  if (node.type === "folder") {
    const children = node.children ?? [];
    return (
      <div className="tree-folder">
        <button
          className="tree-row folder-row"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onClick={() => toggleFolder(node.path)}
        >
          <span className="tree-chevron">{isExpanded ? "▼" : "▶"}</span>
          <span className="tree-icon">📁</span>
          <span className="tree-label">{node.name}</span>
        </button>
        {isExpanded && (
          <FileTree nodes={children} depth={depth + 1} onOpenFile={onOpenFile} />
        )}
      </div>
    );
  }

  return (
    <button
      className={`tree-row file-row ${isActive ? "active" : ""}`}
      style={{ paddingLeft: `${22 + depth * 14}px` }}
      onClick={() => onOpenFile(node.path)}
      title={node.path}
    >
      <span className="tree-icon">📄</span>
      <span className="tree-label">{node.name}</span>
    </button>
  );
}

export function FileTree({ nodes, depth = 0, onOpenFile }: FileTreeProps) {
  return (
    <div className="file-tree">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={depth}
          onOpenFile={onOpenFile}
        />
      ))}

      <style>{`
        .file-tree {
          display: flex;
          flex-direction: column;
        }
        .tree-row {
          display: flex;
          align-items: center;
          gap: 4px;
          width: 100%;
          padding: 3px 8px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 12px;
          text-align: left;
          border-radius: 4px;
        }
        .tree-row:hover {
          background: var(--bg-hover);
        }
        .file-row.active {
          background: var(--bg-active);
          color: var(--accent);
        }
        .tree-chevron {
          width: 12px;
          font-size: 8px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .tree-icon {
          flex-shrink: 0;
          font-size: 11px;
        }
        .tree-label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
