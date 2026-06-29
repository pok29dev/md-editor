import { useEffect } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useAppStore } from "../../stores/appStore";
import { useFileTree } from "../../hooks/useFileTree";
import { useActiveViewMode } from "../../hooks/useActiveViewMode";
import { isThclawsView } from "../../lib/appView";
import { useSyncScroll } from "../../hooks/useSyncScroll";
import { WindowTitleBar } from "./WindowTitleBar";
import { Sidebar } from "./Sidebar";
import { SidebarTitleBar } from "./SidebarTitleBar";
import { TabBar } from "./TabBar";
import { ThclawsViewTitleBar } from "./ThclawsViewTitleBar";
import { StatusBar } from "./StatusBar";
import { EditorPane } from "./EditorPane";
import { PreviewPane } from "./PreviewPane";
import { ThclawsPane } from "../thclaws/ThclawsPane";
import { FindReplace } from "../editor/FindReplace";
import { LinkDialog } from "../editor/LinkDialog";
import { UnsavedChangesDialog } from "../dialogs/UnsavedChangesDialog";
import { SettingsModal } from "../settings/SettingsModal";
import { useAppMenu } from "../../hooks/useAppMenu";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { useOpenExternalFileEvents } from "../../hooks/useOpenExternalFiles";
import { usePersistPreferences } from "../../hooks/usePersistPreferences";
import { loadPreferences, applySidebarWidth } from "../../lib/tauri/preferences";
import { shouldSkipStartupWorkspaceRestore } from "../../lib/tauri/workspaceWindow";
import { stopThclawsServeIfRunning } from "../../hooks/useThclawsServe";

function usePreviewDisplayEffect() {
  const previewFontSize = useAppStore((s) => s.previewFontSize);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--preview-font-size",
      `${previewFontSize}px`,
    );
  }, [previewFontSize]);
}

function useAppearanceEffect() {
  const colorScheme = useAppStore((s) => s.colorScheme);
  const theme = useAppStore((s) => s.theme);
  const setResolvedColorScheme = useAppStore((s) => s.setResolvedColorScheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved =
        colorScheme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : colorScheme;
      setResolvedColorScheme(resolved);
      document.documentElement.setAttribute("data-color-scheme", resolved);
      document.documentElement.setAttribute("data-app-theme", theme);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [colorScheme, theme, setResolvedColorScheme]);
}

export function AppShell() {
  useAppearanceEffect();
  usePreviewDisplayEffect();
  useAppMenu();
  useKeyboardShortcuts();
  useSyncScroll();
  usePersistPreferences();
  const { restoreLastFolder, handleExternalFilePaths } = useFileTree();
  useOpenExternalFileEvents(handleExternalFilePaths);

  useEffect(() => {
    void (async () => {
      await loadPreferences().catch(() => {});
      const skipWorkspaceRestore = shouldSkipStartupWorkspaceRestore();
      if (!skipWorkspaceRestore) {
        await restoreLastFolder();
        if (isTauri()) {
          const pending = await invoke<string[]>("get_pending_open_files");
          if (pending.length > 0) {
            await handleExternalFilePaths(pending);
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      void stopThclawsServeIfRunning();
    };
  }, []);

  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const appView = useAppStore((s) => s.appView);
  const viewMode = useActiveViewMode();
  const isThclawsViewActive = isThclawsView(appView);

  useEffect(() => {
    applySidebarWidth(sidebarWidth);
  }, [sidebarWidth]);

  const showEditor =
    !isThclawsViewActive && (viewMode === "split" || viewMode === "editor");
  const showPreview =
    !isThclawsViewActive && (viewMode === "split" || viewMode === "preview");

  return (
    <div className="app-shell">
      <WindowTitleBar />

      <div className="app-body">
        <div className="app-layout">
          <div className="layout-title-row">
            {!sidebarCollapsed && (
              <div className="sidebar-title-slot">
                <SidebarTitleBar />
              </div>
            )}
            <div className="main-title-slot">
              {isThclawsViewActive ? <ThclawsViewTitleBar /> : <TabBar />}
            </div>
          </div>

          <div className="layout-content-row">
            <aside
              className="sidebar-slot"
              data-collapsed={sidebarCollapsed || undefined}
              aria-hidden={sidebarCollapsed}
            >
              <Sidebar />
            </aside>

            <div className="main-slot">
              <div className="main-panel">
                <div className="workspace">
                {isThclawsViewActive ? (
                  <div className="panel-fill">
                    <ThclawsPane />
                  </div>
                ) : viewMode === "split" ? (
                  <Group orientation="horizontal" id="md-editor-split">
                    <Panel id="editor" defaultSize={50} minSize={20}>
                      <div className="panel-fill">
                        <EditorPane />
                      </div>
                    </Panel>
                    <Separator className="resize-handle" />
                    <Panel id="preview" defaultSize={50} minSize={20}>
                      <div className="panel-fill">
                        <PreviewPane />
                      </div>
                    </Panel>
                  </Group>
                ) : (
                  <div className="panel-fill single-pane">
                    {showEditor && <EditorPane />}
                    {showPreview && <PreviewPane />}
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusBar />
      <FindReplace />
      <LinkDialog />
      <UnsavedChangesDialog />
      <SettingsModal />

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-primary);
        }
        .resize-handle {
          width: 3px;
          background: var(--border-subtle);
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .resize-handle:hover,
        .resize-handle[data-separator="active"] {
          background: var(--accent);
          width: 4px;
        }
      `}</style>
    </div>
  );
}
