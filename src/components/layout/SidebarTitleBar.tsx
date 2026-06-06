import { useAppStore } from "../../stores/appStore";
import { useFileTree } from "../../hooks/useFileTree";
import { PanelLeftCloseIcon } from "../icons/PanelIcons";

export function SidebarTitleBar() {
  const rootFolder = useAppStore((s) => s.rootFolder);
  const fileTreeLoading = useAppStore((s) => s.fileTreeLoading);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { refreshTree } = useFileTree();

  const folderName = rootFolder
    ? rootFolder.split(/[/\\]/).pop() ?? rootFolder
    : "Files";

  return (
    <div className="sidebar-titlebar">
      <span className="sidebar-titlebar-label" title={rootFolder ?? undefined}>
        {folderName}
      </span>
      <div className="sidebar-titlebar-actions">
        {rootFolder && (
          <button
            type="button"
            className="titlebar-icon-btn"
            title="Refresh file tree"
            onClick={() => refreshTree()}
            disabled={fileTreeLoading}
          >
            ↻
          </button>
        )}
        <button
          type="button"
          className="titlebar-icon-btn"
          title="Hide sidebar (⌘\)"
          onClick={toggleSidebar}
        >
          <PanelLeftCloseIcon />
        </button>
      </div>

      <style>{`
        .sidebar-titlebar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          height: 100%;
          padding: 0 8px 0 12px;
          background: var(--bg-secondary);
        }
        .sidebar-titlebar-label {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sidebar-titlebar-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        .titlebar-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-secondary);
        }
        .titlebar-icon-btn:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .titlebar-icon-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
