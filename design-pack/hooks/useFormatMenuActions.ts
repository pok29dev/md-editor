import type { FormatActionId, FormatContext } from "../lib/editor/formatActions";
import { runEditorRedo, runEditorUndo } from "../lib/editor/editorHistory";
import { getTabEditorView } from "../lib/editor/tabEditorCache";
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
import { useAppStore, type ViewMode } from "../stores/appStore";
import { pickOpenImage } from "../lib/tauri/commands";
import { runFormatAction } from "./useMarkdownFormat";

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

export function openMarkdownLinkDialog(): void {
  openLinkDialog();
}

export async function insertImageFromMenu(): Promise<void> {
  const path = await pickOpenImage();
  if (!path) return;
  runFormatAction("image", { imagePath: path });
}

export function runUndoFromMenu(): void {
  const view = resolveEditorView();
  if (view) runEditorUndo(view);
}

export function runRedoFromMenu(): void {
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

export function setViewModeFromMenu(mode: ViewMode): void {
  useAppStore.getState().setViewMode(mode);
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
