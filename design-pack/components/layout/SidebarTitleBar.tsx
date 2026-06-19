import { useAppStore } from "../../stores/appStore";

export function SidebarTitleBar() {
  const rootFolder = useAppStore((s) => s.rootFolder);

  const folderName = rootFolder
    ? rootFolder.split(/[/\\]/).pop() ?? rootFolder
    : "Files";

  return (
    <div className="sidebar-titlebar">
      <span className="sidebar-titlebar-label" title={rootFolder ?? undefined}>
        {folderName}
      </span>
    </div>
  );
}
