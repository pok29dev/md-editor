import { useEffect, useRef } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { Menu, Submenu } from "@tauri-apps/api/menu";
import { APP_VERSION } from "../version";
import { useAppStore } from "../stores/appStore";
import { useFileActions } from "./useFileActions";
import { useFileTree } from "./useFileTree";
import {
  insertImageFromMenu,
  openAboutMarkdownFromMenu,
  openClearDocumentFromMenu,
  openEmojiPickerFromMenu,
  openFindReplaceFromMenu,
  openHelpFromMenu,
  openMarkdownLinkDialog,
  openReferenceFromMenu,
  openSymbolsPickerFromMenu,
  runFormatFromMenu,
  setViewModeFromMenu,
  toggleEditorFullscreenFromMenu,
  toggleSidebarFromMenu,
  toggleTextDirectionFromMenu,
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
    openClearDocumentFromMenu,
    openReferenceFromMenu,
    openEmojiPickerFromMenu,
    openSymbolsPickerFromMenu,
    toggleTextDirectionFromMenu,
    setViewModeFromMenu,
    toggleSidebarFromMenu,
    openFindReplaceFromMenu,
    toggleEditorFullscreenFromMenu,
    openHelpFromMenu,
    openAboutMarkdownFromMenu,
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
    openClearDocumentFromMenu,
    openReferenceFromMenu,
    openEmojiPickerFromMenu,
    openSymbolsPickerFromMenu,
    toggleTextDirectionFromMenu,
    setViewModeFromMenu,
    toggleSidebarFromMenu,
    openFindReplaceFromMenu,
    toggleEditorFullscreenFromMenu,
    openHelpFromMenu,
    openAboutMarkdownFromMenu,
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

      const insertSubmenu = await Submenu.new({
        text: "Insert",
        items: [
          {
            id: "insert-markdown-link",
            text: "Link...",
            accelerator: "CmdOrCtrl+K",
            action: () => handlersRef.current.openMarkdownLinkDialog(),
          },
          {
            id: "insert-reference",
            text: "Reference...",
            action: () => handlersRef.current.openReferenceFromMenu(),
          },
          {
            id: "insert-image",
            text: "Image...",
            action: () => {
              void handlersRef.current.insertImageFromMenu();
            },
          },
          { item: "Separator" },
          {
            id: "insert-code-block",
            text: "Code Block",
            action: () => handlersRef.current.runFormatFromMenu("codeBlock"),
          },
          {
            id: "insert-terminal-block",
            text: "Terminal Block",
            action: () => handlersRef.current.runFormatFromMenu("terminalBlock"),
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
            id: "insert-date-time",
            text: "Date and Time",
            action: () => handlersRef.current.runFormatFromMenu("dateTime"),
          },
          { item: "Separator" },
          {
            id: "insert-emoji",
            text: "Emoji...",
            action: () => handlersRef.current.openEmojiPickerFromMenu(),
          },
          {
            id: "insert-symbol",
            text: "Symbol...",
            action: () => handlersRef.current.openSymbolsPickerFromMenu(),
          },
          {
            id: "insert-callout",
            text: "Callout / Alert",
            action: () => handlersRef.current.runFormatFromMenu("calloutNote"),
          },
          {
            id: "insert-footnote",
            text: "Footnote",
            action: () => handlersRef.current.runFormatFromMenu("footnote"),
          },
        ],
      });

      const formatSubmenu = await Submenu.new({
        text: "Format",
        items: [
          {
            id: "format-clear-document",
            text: "Clear Document...",
            action: () => handlersRef.current.openClearDocumentFromMenu(),
          },
          { item: "Separator" },
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
            id: "format-strikethrough",
            text: "Strikethrough",
            action: () => handlersRef.current.runFormatFromMenu("strikethrough"),
          },
          {
            id: "format-code",
            text: "Inline Code",
            action: () => handlersRef.current.runFormatFromMenu("code"),
          },
          {
            id: "format-highlight",
            text: "Highlight",
            action: () => handlersRef.current.runFormatFromMenu("highlight"),
          },
          {
            id: "format-blockquote",
            text: "Blockquote",
            action: () => handlersRef.current.runFormatFromMenu("blockquote"),
          },
          {
            id: "format-title-case",
            text: "Title Case",
            action: () => handlersRef.current.runFormatFromMenu("titleCase"),
          },
          {
            id: "format-uppercase",
            text: "Uppercase",
            action: () => handlersRef.current.runFormatFromMenu("uppercase"),
          },
          {
            id: "format-lowercase",
            text: "Lowercase",
            action: () => handlersRef.current.runFormatFromMenu("lowercase"),
          },
          { item: "Separator" },
          {
            id: "format-align-left",
            text: "Align Left",
            action: () => handlersRef.current.runFormatFromMenu("alignLeft"),
          },
          {
            id: "format-align-center",
            text: "Align Center",
            action: () => handlersRef.current.runFormatFromMenu("alignCenter"),
          },
          {
            id: "format-align-right",
            text: "Align Right",
            action: () => handlersRef.current.runFormatFromMenu("alignRight"),
          },
          {
            id: "format-toggle-direction",
            text: "Toggle Text Direction",
            action: () => handlersRef.current.toggleTextDirectionFromMenu(),
          },
          { item: "Separator" },
          {
            id: "format-bullet-list",
            text: "Bullet List",
            action: () => handlersRef.current.runFormatFromMenu("bulletList"),
          },
          {
            id: "format-numbered-list",
            text: "Numbered List",
            action: () => handlersRef.current.runFormatFromMenu("numberedList"),
          },
          {
            id: "format-task-list",
            text: "Task List",
            accelerator: "CmdOrCtrl+L",
            action: () => handlersRef.current.runFormatFromMenu("taskList"),
          },
          {
            id: "format-horizontal-rule",
            text: "Horizontal Rule",
            action: () => handlersRef.current.runFormatFromMenu("horizontalRule"),
          },
        ],
      });

      const windowSubmenu = await Submenu.new({
        text: "Window",
        items: [
          {
            id: "window-split-view",
            text: "Split View",
            accelerator: "CmdOrCtrl+1",
            action: () => handlersRef.current.setViewModeFromMenu("split"),
          },
          {
            id: "window-editor-view",
            text: "Editor Only",
            accelerator: "CmdOrCtrl+2",
            action: () => handlersRef.current.setViewModeFromMenu("editor"),
          },
          {
            id: "window-preview-view",
            text: "Preview Only",
            accelerator: "CmdOrCtrl+3",
            action: () => handlersRef.current.setViewModeFromMenu("preview"),
          },
          { item: "Separator" },
          {
            id: "window-toggle-sidebar",
            text: "Toggle Sidebar",
            accelerator: "CmdOrCtrl+\\",
            action: () => handlersRef.current.toggleSidebarFromMenu(),
          },
          { item: "Separator" },
          {
            id: "window-find-replace",
            text: "Find & Replace...",
            accelerator: "CmdOrCtrl+F",
            action: () => handlersRef.current.openFindReplaceFromMenu(),
          },
          {
            id: "window-editor-fullscreen",
            text: "Enter Editor Full Screen",
            action: () => handlersRef.current.toggleEditorFullscreenFromMenu(),
          },
          { item: "Separator" },
          { item: "Minimize" },
          { item: "Maximize" },
        ],
      });

      const helpSubmenu = await Submenu.new({
        text: "Help",
        items: [
          {
            id: "help-editor",
            text: "Editor Help",
            action: () => handlersRef.current.openHelpFromMenu(),
          },
          {
            id: "help-about-markdown",
            text: "About Markdown",
            action: () => handlersRef.current.openAboutMarkdownFromMenu(),
          },
        ],
      });

      if (cancelled) return;

      const menu = await Menu.new({
        items: [
          appSubmenu,
          fileSubmenu,
          editSubmenu,
          insertSubmenu,
          formatSubmenu,
          windowSubmenu,
          helpSubmenu,
        ],
      });
      await menu.setAsAppMenu();
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
