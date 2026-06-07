import { useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { useAppStore, type ViewMode } from "../../stores/appStore";
import { useFileActions } from "../../hooks/useFileActions";
import { useActiveViewMode } from "../../hooks/useActiveViewMode";
import { useEditorStore } from "../../stores/editorStore";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import { PdfExportOverlay } from "../export/PdfExportOverlay";
import { getToolbarIcons } from "../../lib/theme/icons";
import "../../styles/titlebar.css";

const VIEW_MODES: { mode: ViewMode; label: string; title: string }[] = [
  { mode: "split", label: "Split", title: "Split View (⌘1)" },
  { mode: "editor", label: "Edit", title: "Editor Only (⌘2)" },
  { mode: "preview", label: "Preview", title: "Preview Only (⌘3)" },
];

export function WindowTitleBar() {
  const viewMode = useActiveViewMode();
  const syncScroll = useAppStore((s) => s.syncScroll);
  const appTheme = useAppStore((s) => s.theme);
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

  const { FindIcon, SyncIcon, MoreIcon, SettingsIcon } = getToolbarIcons(appTheme);

  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  const overlay = isTauri();

  useEffect(() => {
    if (!overflowOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!overflowRef.current?.contains(event.target as Node)) {
        setOverflowOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [overflowOpen]);

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
          className="toolbar-icon-btn"
          title="Find & Replace (⌘F)"
          aria-label="Find & Replace"
          onClick={() => setFindReplaceOpen(true)}
        >
          <FindIcon />
        </button>
        <button
          type="button"
          className={`toolbar-icon-btn ${syncScroll ? "active" : ""}`}
          title="Sync Scroll"
          aria-label="Sync Scroll"
          aria-pressed={syncScroll}
          onClick={() => setSyncScroll(!syncScroll)}
        >
          <SyncIcon />
        </button>

        <div className="titlebar-overflow" ref={overflowRef}>
          <button
            type="button"
            className="toolbar-icon-btn"
            title="More actions"
            aria-label="More actions"
            aria-expanded={overflowOpen}
            aria-haspopup="menu"
            onClick={() => setOverflowOpen((open) => !open)}
          >
            <MoreIcon />
          </button>
          {overflowOpen && (
            <div className="titlebar-overflow-menu" role="menu">
              <button
                type="button"
                className="titlebar-overflow-item"
                role="menuitem"
                onClick={() => {
                  setOverflowOpen(false);
                  exportHtml();
                }}
              >
                Export HTML
              </button>
              <button
                type="button"
                className="titlebar-overflow-item"
                role="menuitem"
                onClick={() => {
                  setOverflowOpen(false);
                  exportPdf();
                }}
              >
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className="window-titlebar-drag"
        data-tauri-drag-region={overlay ? true : undefined}
        aria-hidden
      />

      <div className="window-titlebar-trailing">
        <ColorSchemeToggle variant="window" />
        <button
          type="button"
          className="toolbar-icon-btn window-titlebar-settings-btn"
          title="Settings (⌘,)"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </button>
      </div>

      <PdfExportOverlay
        open={pdfExportOpen}
        percent={pdfExportPercent}
        step={pdfExportStep}
        onCancel={cancelPdfExport}
      />
    </header>
  );
}
