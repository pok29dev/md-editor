import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore, type ViewMode } from "../stores/appStore";
import { useEditorStore } from "../stores/editorStore";
import { confirmQuitWithoutSaving } from "../lib/dialogs/unsavedChanges";
import { shouldHandleEditorFormatShortcut } from "../lib/editor/formatShortcuts";
import { flushPersistPreferences } from "../lib/tauri/preferences";
import { runFormatAction } from "./useMarkdownFormat";
import { useTabActions } from "./useTabActions";
import { useFileActions } from "./useFileActions";
import { useFileTree } from "./useFileTree";
import { createNewWorkspaceWindow } from "../lib/tauri/workspaceWindow";

const VIEW_MODES: ViewMode[] = ["split", "editor", "preview"];

const HEADING_SHORTCUTS: Record<string, "heading1" | "heading2" | "heading3" | "heading4" | "heading5" | "heading6"> = {
  "1": "heading1",
  "2": "heading2",
  "3": "heading3",
  "4": "heading4",
  "5": "heading5",
  "6": "heading6",
};

function isMod(e: KeyboardEvent) {
  return e.metaKey || e.ctrlKey;
}

export function useKeyboardShortcuts() {
  const setViewMode = useAppStore((s) => s.setViewMode);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const setFindReplaceOpen = useEditorStore((s) => s.setFindReplaceOpen);
  const setLinkDialogOpen = useEditorStore((s) => s.setLinkDialogOpen);
  const { tryCloseTab } = useTabActions();
  const { save, saveAs } = useFileActions();
  const { openFolder, openMarkdownFile } = useFileTree();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isMod(e)) return;

      const key = e.key.toLowerCase();
      const shift = e.shiftKey;
      const alt = e.altKey;

      if (shouldHandleEditorFormatShortcut(e)) {
        if (alt && HEADING_SHORTCUTS[key]) {
          e.preventDefault();
          runFormatAction(HEADING_SHORTCUTS[key]);
          return;
        }

        if (key === "b" && !shift && !alt) {
          e.preventDefault();
          runFormatAction("bold");
          return;
        }

        if (key === "i" && !shift && !alt) {
          e.preventDefault();
          runFormatAction("italic");
          return;
        }

        if (key === "k" && shift && !alt) {
          e.preventDefault();
          runFormatAction("codeBlock");
          return;
        }

        if (key === "k" && !shift && !alt) {
          e.preventDefault();
          setLinkDialogOpen(true);
          return;
        }

        if (key === "`" && !shift && !alt) {
          e.preventDefault();
          runFormatAction("code");
          return;
        }

        if (key === "l" && !shift && !alt) {
          e.preventDefault();
          runFormatAction("taskList");
          return;
        }

        if (key === "/" && !shift && !alt) {
          e.preventDefault();
          runFormatAction("comment");
          return;
        }
      }

      if (key === "n" && shift && !alt) {
        e.preventDefault();
        void createNewWorkspaceWindow();
        return;
      }

      if (key === "o") {
        e.preventDefault();
        if (shift) openFolder();
        else openMarkdownFile();
        return;
      }

      if (key === "s") {
        e.preventDefault();
        if (shift) saveAs();
        else save();
        return;
      }

      if (key === "f") {
        e.preventDefault();
        setFindReplaceOpen(true);
        return;
      }

      if (key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
        return;
      }

      if (key === "w" && activeTabId) {
        e.preventDefault();
        tryCloseTab(activeTabId);
        return;
      }

      if (key === "\\") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (!alt && (key === "1" || key === "2" || key === "3")) {
        e.preventDefault();
        const idx = parseInt(key, 10) - 1;
        setViewMode(VIEW_MODES[idx] ?? "split");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    activeTabId,
    setViewMode,
    toggleSidebar,
    setFindReplaceOpen,
    setLinkDialogOpen,
    setSettingsOpen,
    tryCloseTab,
    save,
    saveAs,
    openFolder,
    openMarkdownFile,
  ]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    void getCurrentWindow()
      .onCloseRequested(async (event) => {
        event.preventDefault();

        const hasDirty = useAppStore
          .getState()
          .tabs.some((tab) => tab.isDirty);

        if (!hasDirty) {
          await flushPersistPreferences().catch(() => {});
          await getCurrentWindow().destroy();
          return;
        }

        const quit = await confirmQuitWithoutSaving();
        if (quit) {
          await flushPersistPreferences().catch(() => {});
          await getCurrentWindow().destroy();
        }
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => unlisten?.();
  }, []);
}
