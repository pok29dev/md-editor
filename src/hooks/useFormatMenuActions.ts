import type { FormatActionId, FormatContext } from "../lib/editor/formatActions";
import { runEditorRedo, runEditorUndo } from "../lib/editor/editorHistory";
import { getTabEditorView } from "../lib/editor/tabEditorCache";
import { getTabTiptapEditor } from "../lib/editor/tiptapTabCache";
import {
  runTiptapRedo,
  runTiptapUndo,
} from "../lib/editor/tiptapFormatActions";
import {
  openAboutDialog,
  openClearDocumentDialog,
  openEmojiPicker,
  openHelpDialog,
  openLinkDialog,
  openReferenceDialog,
  openSymbolsPicker,
  useEditorStore,
} from "../stores/editorStore";
import { useAppStore, type AppView, type ViewMode } from "../stores/appStore";
import { pickOpenImage } from "../lib/tauri/commands";
import { applyNormalizeMarkdown } from "../lib/editor/normalizeActions";
import { normalizeMarkdown } from "../lib/markdown/normalize/normalizeMarkdown";
import { flushActiveEditorContent } from "../lib/editor/flushEditorContent";
import { shouldUseWysiwyg } from "../lib/editor/editMode";
import { syncTabEditorContent } from "../lib/editor/tabEditorCache";
import { runFormatAction } from "./useMarkdownFormat";
import { runAiStructureFromMenu } from "./useAiStructure";

function resolveEditorView() {
  const { view } = useEditorStore.getState();
  if (view) return view;
  const activeTabId = useAppStore.getState().activeTabId;
  if (!activeTabId) return null;
  return getTabEditorView(activeTabId) ?? null;
}

export function runFormatFromMenu(
  actionId: FormatActionId,
  context: FormatContext = {},
): void {
  runFormatAction(actionId, context);
}

export function runNormalizeMarkdown(): boolean {
  const activeTabId = useAppStore.getState().activeTabId;
  if (!activeTabId) return false;

  const tab = useAppStore.getState().tabs.find((t) => t.id === activeTabId);
  if (!tab || tab.fileKind !== "markdown") return false;

  if (
    !shouldUseWysiwyg(tab.viewMode, tab.editMode, tab.fileKind)
  ) {
    const view = resolveEditorView();
    if (view) {
      return applyNormalizeMarkdown(view);
    }
  }

  flushActiveEditorContent();
  const latest = useAppStore.getState().tabs.find((t) => t.id === activeTabId);
  if (!latest) return false;

  const normalized = normalizeMarkdown(latest.content);
  if (normalized === latest.content) return true;

  useAppStore.getState().updateTabContent(activeTabId, normalized);

  if (!shouldUseWysiwyg(latest.viewMode, latest.editMode, latest.fileKind)) {
    syncTabEditorContent(activeTabId, normalized);
  }

  return true;
}

export function runAiStructureMarkdownFromMenu(): void {
  void runAiStructureFromMenu();
}

export function openMarkdownLinkDialog(): void {
  openLinkDialog();
}

export async function insertImageFromMenu(): Promise<void> {
  const path = await pickOpenImage();
  if (!path) return;
  runFormatAction("image", { imagePath: path });
}

export function runUndoFromMenu(): void {
  const activeTabId = useAppStore.getState().activeTabId;
  const tiptap = activeTabId ? getTabTiptapEditor(activeTabId) : undefined;
  if (tiptap) {
    runTiptapUndo(tiptap);
    return;
  }
  const view = resolveEditorView();
  if (view) runEditorUndo(view);
}

export function runRedoFromMenu(): void {
  const activeTabId = useAppStore.getState().activeTabId;
  const tiptap = activeTabId ? getTabTiptapEditor(activeTabId) : undefined;
  if (tiptap) {
    runTiptapRedo(tiptap);
    return;
  }
  const view = resolveEditorView();
  if (view) runEditorRedo(view);
}

export function openClearDocumentFromMenu(): void {
  openClearDocumentDialog();
}

export function openReferenceFromMenu(): void {
  openReferenceDialog();
}

export function openEmojiPickerFromMenu(): void {
  openEmojiPicker();
}

export function openSymbolsPickerFromMenu(): void {
  openSymbolsPicker();
}

export function toggleTextDirectionFromMenu(): void {
  useEditorStore.getState().toggleEditorTextDirection();
}

export function openFindReplaceFromMenu(): void {
  useEditorStore.getState().setFindReplaceOpen(true);
}

export function toggleEditorFullscreenFromMenu(): void {
  const pane = document.querySelector(".editor-pane");
  if (!pane || !(pane instanceof HTMLElement)) return;
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void pane.requestFullscreen();
  }
}

export function setAppViewFromMenu(view: AppView): void {
  useAppStore.getState().setAppView(view);
}

export function setViewModeFromMenu(mode: ViewMode): void {
  const store = useAppStore.getState();
  store.setAppView("editor");
  store.setViewMode(mode);
}

export function toggleSidebarFromMenu(): void {
  useAppStore.getState().toggleSidebar();
}

export function openHelpFromMenu(): void {
  openHelpDialog();
}

export function openAboutMarkdownFromMenu(): void {
  openAboutDialog();
}
