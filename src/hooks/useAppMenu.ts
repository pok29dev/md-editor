import { useEffect, useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { Menu, Submenu } from "@tauri-apps/api/menu";
import { APP_VERSION } from "../version";
import { useAppStore } from "../stores/appStore";
import { useFileActions } from "./useFileActions";
import { useFileTree } from "./useFileTree";
import {
  insertImageFromMenu,
  openMarkdownLinkDialog,
  runFormatFromMenu,
} from "./useFormatMenuActions";

const APP_MENU_LABEL = "md-editor";

export function useAppMenu() {
  const { openFolder, openMarkdownFile } = useFileTree();
  const { save, saveAs, exportHtml, exportPdf } = useFileActions();
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const handlersRef = useRef({
    openFolder,
    openMarkdownFile,
    save,
    saveAs,
    exportHtml,
    exportPdf,
    setSettingsOpen,
    runFormatFromMenu,
    insertImageFromMenu,
    openMarkdownLinkDialog,
  });
  handlersRef.current = {
    openFolder,
    openMarkdownFile,
    save,
    saveAs,
    exportHtml,
    exportPdf,
    setSettingsOpen,
    runFormatFromMenu,
    insertImageFromMenu,
    openMarkdownLinkDialog,
  };

  useEffect(() => {
    if (!isTauri()) return;

    let cancelled = false;

    void (async () => {
      const appSubmenu = await Submenu.new({
        text: APP_MENU_LABEL,
        items: [
          {
            item: {
              About: {
                name: "MD Editor",
                version: APP_VERSION,
                copyright: "© 2026 mrpokx5",
              },
            },
          },
          { item: "Separator" },
          { item: "Services" },
          { item: "Separator" },
          {
            id: "app-settings",
            text: "Settings...",
            accelerator: "CmdOrCtrl+,",
            action: () => {
              handlersRef.current.setSettingsOpen(true);
            },
          },
          { item: "Separator" },
          { item: "Hide" },
          { item: "HideOthers" },
          { item: "ShowAll" },
          { item: "Separator" },
          { item: "Quit" },
        ],
      });

      const fileSubmenu = await Submenu.new({
        text: "File",
        items: [
          {
            id: "file-open",
            text: "Open File...",
            accelerator: "CmdOrCtrl+O",
            action: () => {
              void handlersRef.current.openMarkdownFile();
            },
          },
          {
            id: "file-open-folder",
            text: "Open Folder...",
            accelerator: "CmdOrCtrl+Shift+O",
            action: () => {
              void handlersRef.current.openFolder();
            },
          },
          { item: "Separator" },
          {
            id: "file-save",
            text: "Save",
            accelerator: "CmdOrCtrl+S",
            action: () => {
              void handlersRef.current.save();
            },
          },
          {
            id: "file-save-as",
            text: "Save As...",
            accelerator: "CmdOrCtrl+Shift+S",
            action: () => {
              void handlersRef.current.saveAs();
            },
          },
          { item: "Separator" },
          {
            id: "file-export-html",
            text: "Export HTML...",
            action: () => {
              void handlersRef.current.exportHtml();
            },
          },
          {
            id: "file-export-pdf",
            text: "Export PDF...",
            action: () => {
              void handlersRef.current.exportPdf();
            },
          },
        ],
      });

      const editSubmenu = await Submenu.new({
        text: "Edit",
        items: [
          { item: "Undo" },
          { item: "Redo" },
          { item: "Separator" },
          { item: "Cut" },
          { item: "Copy" },
          { item: "Paste" },
          { item: "Separator" },
          { item: "SelectAll" },
        ],
      });

      const formatSubmenu = await Submenu.new({
        text: "Format",
        items: [
          {
            id: "format-heading1",
            text: "Heading 1",
            action: () => handlersRef.current.runFormatFromMenu("heading1"),
          },
          {
            id: "format-heading2",
            text: "Heading 2",
            action: () => handlersRef.current.runFormatFromMenu("heading2"),
          },
          {
            id: "format-heading3",
            text: "Heading 3",
            action: () => handlersRef.current.runFormatFromMenu("heading3"),
          },
          {
            id: "format-heading4",
            text: "Heading 4",
            action: () => handlersRef.current.runFormatFromMenu("heading4"),
          },
          {
            id: "format-heading5",
            text: "Heading 5",
            action: () => handlersRef.current.runFormatFromMenu("heading5"),
          },
          {
            id: "format-heading6",
            text: "Heading 6",
            action: () => handlersRef.current.runFormatFromMenu("heading6"),
          },
          {
            id: "format-body",
            text: "Body",
            action: () => handlersRef.current.runFormatFromMenu("body"),
          },
          { item: "Separator" },
          {
            id: "format-bold",
            text: "Bold",
            accelerator: "CmdOrCtrl+B",
            action: () => handlersRef.current.runFormatFromMenu("bold"),
          },
          {
            id: "format-italic",
            text: "Italics",
            accelerator: "CmdOrCtrl+I",
            action: () => handlersRef.current.runFormatFromMenu("italic"),
          },
          {
            id: "format-code",
            text: "Code",
            action: () => handlersRef.current.runFormatFromMenu("code"),
          },
          {
            id: "format-highlight",
            text: "Highlight",
            action: () => handlersRef.current.runFormatFromMenu("highlight"),
          },
          { item: "Separator" },
          {
            id: "format-strikethrough",
            text: "Strikethrough",
            action: () => handlersRef.current.runFormatFromMenu("strikethrough"),
          },
          {
            id: "format-math-inline",
            text: "Math",
            action: () => handlersRef.current.runFormatFromMenu("mathInline"),
          },
          {
            id: "format-comment",
            text: "Comment",
            accelerator: "CmdOrCtrl+/",
            action: () => handlersRef.current.runFormatFromMenu("comment"),
          },
        ],
      });

      const calloutSubmenu = await Submenu.new({
        text: "Callout",
        items: [
          {
            id: "insert-callout-note",
            text: "Note",
            action: () => handlersRef.current.runFormatFromMenu("calloutNote"),
          },
          {
            id: "insert-callout-tip",
            text: "Tip",
            action: () => handlersRef.current.runFormatFromMenu("calloutTip"),
          },
          {
            id: "insert-callout-important",
            text: "Important",
            action: () => handlersRef.current.runFormatFromMenu("calloutImportant"),
          },
          {
            id: "insert-callout-warning",
            text: "Warning",
            action: () => handlersRef.current.runFormatFromMenu("calloutWarning"),
          },
          {
            id: "insert-callout-caution",
            text: "Caution",
            action: () => handlersRef.current.runFormatFromMenu("calloutCaution"),
          },
        ],
      });

      const insertSubmenu = await Submenu.new({
        text: "Insert",
        items: [
          {
            id: "insert-link",
            text: "Link",
            action: () => handlersRef.current.runFormatFromMenu("link"),
          },
          {
            id: "insert-markdown-link",
            text: "Markdown Link",
            accelerator: "CmdOrCtrl+K",
            action: () => handlersRef.current.openMarkdownLinkDialog(),
          },
          calloutSubmenu,
          { item: "Separator" },
          {
            id: "insert-code-block",
            text: "Code Block",
            action: () => handlersRef.current.runFormatFromMenu("codeBlock"),
          },
          {
            id: "insert-math-block",
            text: "Math Block",
            action: () => handlersRef.current.runFormatFromMenu("mathBlock"),
          },
          {
            id: "insert-table",
            text: "Table",
            action: () => handlersRef.current.runFormatFromMenu("table"),
          },
          {
            id: "insert-footnote",
            text: "Footnote",
            action: () => handlersRef.current.runFormatFromMenu("footnote"),
          },
          { item: "Separator" },
          {
            id: "insert-bullet-list",
            text: "Bullet List",
            action: () => handlersRef.current.runFormatFromMenu("bulletList"),
          },
          {
            id: "insert-numbered-list",
            text: "Numbered List",
            action: () => handlersRef.current.runFormatFromMenu("numberedList"),
          },
          {
            id: "insert-task-list",
            text: "Task List",
            accelerator: "CmdOrCtrl+L",
            action: () => handlersRef.current.runFormatFromMenu("taskList"),
          },
          { item: "Separator" },
          {
            id: "insert-image",
            text: "Insert Image...",
            action: () => {
              void handlersRef.current.insertImageFromMenu();
            },
          },
        ],
      });

      if (cancelled) return;

      const menu = await Menu.new({
        items: [appSubmenu, fileSubmenu, editSubmenu, formatSubmenu, insertSubmenu],
      });
      await menu.setAsAppMenu();
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
