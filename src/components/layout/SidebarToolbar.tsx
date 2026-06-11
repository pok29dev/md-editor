import { useAppStore } from "../../stores/appStore";
import { useFileTree } from "../../hooks/useFileTree";
import { collectAllFolderPaths } from "../../lib/files/treeExpansion";
import { PanelLeftCloseIcon } from "../icons/PanelIcons";
import { getToolbarIcons } from "../../lib/theme/icons";

export function SidebarToolbar() {
  const appTheme = useAppStore((s) => s.theme);
  const rootFolder = useAppStore((s) => s.rootFolder);
  const { OpenFolderIcon, RefreshIcon, ExpandAllFoldersIcon, CollapseAllFoldersIcon } =
    getToolbarIcons(appTheme);
  const fileTree = useAppStore((s) => s.fileTree);
  const fileTreeLoading = useAppStore((s) => s.fileTreeLoading);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const expandAllFolders = useAppStore((s) => s.expandAllFolders);
  const collapseAllFolders = useAppStore((s) => s.collapseAllFolders);
  const { openFolder, refreshTree } = useFileTree();

  const hasFolders = Object.keys(collectAllFolderPaths(fileTree)).length > 0;

  return (
    <div className="sidebar-toolbar" role="toolbar" aria-label="Folder actions">
      <button
        type="button"
        className="sidebar-toolbar-btn"
        title="Open folder (⌘⇧O)"
        aria-label="Open folder"
        onClick={() => void openFolder()}
        disabled={fileTreeLoading}
      >
        <OpenFolderIcon />
      </button>
      {rootFolder && (
        <>
          <button
            type="button"
            className="sidebar-toolbar-btn"
            title="Expand all folders"
            aria-label="Expand all folders"
            onClick={expandAllFolders}
            disabled={fileTreeLoading || !hasFolders}
          >
            <ExpandAllFoldersIcon />
          </button>
          <button
            type="button"
            className="sidebar-toolbar-btn"
            title="Collapse all folders"
            aria-label="Collapse all folders"
            onClick={collapseAllFolders}
            disabled={fileTreeLoading || !hasFolders}
          >
            <CollapseAllFoldersIcon />
          </button>
          <button
            type="button"
            className="sidebar-toolbar-btn"
            title="Refresh file tree"
            aria-label="Refresh file tree"
            onClick={() => refreshTree()}
            disabled={fileTreeLoading}
          >
            <RefreshIcon />
          </button>
        </>
      )}
      <button
        type="button"
        className="sidebar-toolbar-btn sidebar-toolbar-btn--trailing"
        title="Hide sidebar (⌘\)"
        aria-label="Hide sidebar"
        onClick={toggleSidebar}
      >
        <PanelLeftCloseIcon />
      </button>
    </div>
  );
}
