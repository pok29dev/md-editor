import { useAppStore } from "../../stores/appStore";
import { useFileTree } from "../../hooks/useFileTree";
import { FileTree } from "./FileTree";

export function Sidebar() {
  const rootFolder = useAppStore((s) => s.rootFolder);
  const fileTree = useAppStore((s) => s.fileTree);
  const fileTreeLoading = useAppStore((s) => s.fileTreeLoading);
  const fileTreeError = useAppStore((s) => s.fileTreeError);
  const { openFile } = useFileTree();

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {fileTreeLoading && (
          <p className="sidebar-status">Loading...</p>
        )}
        {fileTreeError && (
          <p className="sidebar-error">{fileTreeError}</p>
        )}
        {!rootFolder ? (
          <div className="sidebar-empty">
            <p>No folder open</p>
            <p className="sidebar-hint">
              Use <strong>File → Open Folder</strong> (⌘⇧O)
            </p>
          </div>
        ) : fileTree.length === 0 && !fileTreeLoading ? (
          <p className="sidebar-status">No markdown files found</p>
        ) : (
          <FileTree nodes={fileTree} onOpenFile={openFile} />
        )}
      </div>

      <style>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          min-width: 0;
          background: var(--bg-secondary);
          overflow: hidden;
        }
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
        }
        .sidebar-empty {
          text-align: center;
          padding: 24px 12px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .sidebar-hint {
          margin-top: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .sidebar-status {
          padding: 12px;
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
        }
        .sidebar-error {
          padding: 12px;
          font-size: 12px;
          color: #ff453a;
          text-align: center;
        }
      `}</style>
    </aside>
  );
}
