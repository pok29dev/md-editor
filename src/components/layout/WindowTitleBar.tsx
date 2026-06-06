import { isTauri } from "@tauri-apps/api/core";
import { useAppStore, type ViewMode } from "../../stores/appStore";
import { useFileActions } from "../../hooks/useFileActions";
import { useActiveViewMode } from "../../hooks/useActiveViewMode";
import { useEditorStore } from "../../stores/editorStore";
import { ThemeToggle } from "./ThemeToggle";
import { PdfExportOverlay } from "../export/PdfExportOverlay";
import "../../styles/titlebar.css";

const VIEW_MODES: { mode: ViewMode; label: string; title: string }[] = [
  { mode: "split", label: "Split", title: "Split View (⌘1)" },
  { mode: "editor", label: "Edit", title: "Editor Only (⌘2)" },
  { mode: "preview", label: "Preview", title: "Preview Only (⌘3)" },
];

export function WindowTitleBar() {
  const viewMode = useActiveViewMode();
  const syncScroll = useAppStore((s) => s.syncScroll);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const setSyncScroll = useAppStore((s) => s.setSyncScroll);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const {
    exportHtml,
    exportPdf,
    cancelPdfExport,
    pdfExportOpen,
    pdfExportPercent,
    pdfExportStep,
  } = useFileActions();
  const setFindReplaceOpen = useEditorStore((s) => s.setFindReplaceOpen);

  const overlay = isTauri();

  return (
    <header
      className={`window-titlebar ${overlay ? "window-titlebar--overlay" : ""}`}
    >
      <div
        className="window-titlebar-drag"
        data-tauri-drag-region={overlay ? true : undefined}
        aria-hidden
      />

      <div className="window-titlebar-tools">
        <div
          className="view-mode-segmented"
          role="group"
          aria-label="View mode"
        >
          {VIEW_MODES.map(({ mode, label, title }) => (
            <button
              key={mode}
              type="button"
              className={`segment-btn ${viewMode === mode ? "active" : ""}`}
              title={title}
              aria-pressed={viewMode === mode}
              onClick={() => setViewMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        <button
          type="button"
          className="toolbar-btn"
          title="Find & Replace (⌘F)"
          onClick={() => setFindReplaceOpen(true)}
        >
          Find
        </button>
        <button
          type="button"
          className={`toolbar-btn ${syncScroll ? "active" : ""}`}
          title="Sync Scroll"
          onClick={() => setSyncScroll(!syncScroll)}
        >
          Sync
        </button>
        <button
          type="button"
          className="toolbar-btn"
          title="Export HTML"
          onClick={() => exportHtml()}
        >
          Export HTML
        </button>
        <button
          type="button"
          className="toolbar-btn"
          title="Export PDF"
          onClick={() => exportPdf()}
        >
          Export PDF
        </button>
        <button
          type="button"
          className="toolbar-btn"
          title="Settings (⌘,)"
          onClick={() => setSettingsOpen(true)}
        >
          Settings
        </button>
      </div>

      <div
        className="window-titlebar-drag"
        data-tauri-drag-region={overlay ? true : undefined}
        aria-hidden
      />

      <ThemeToggle variant="window" />

      <PdfExportOverlay
        open={pdfExportOpen}
        percent={pdfExportPercent}
        step={pdfExportStep}
        onCancel={cancelPdfExport}
      />
    </header>
  );
}
