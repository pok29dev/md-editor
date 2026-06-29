import type { Editor } from "@tiptap/core";
import { useEditorStore } from "../../stores/editorStore";
import { getTiptapMarkdown } from "./tiptap/markdown";

const tabEditors = new Map<string, Editor>();
const updateHandlers = new Set<() => void>();

function notifyTiptapUpdate() {
  for (const handler of updateHandlers) {
    handler();
  }
}

export function subscribeTiptapEditorUpdate(handler: () => void): () => void {
  updateHandlers.add(handler);
  return () => updateHandlers.delete(handler);
}

export function registerTabTiptapEditor(tabId: string, editor: Editor): void {
  tabEditors.set(tabId, editor);
  const onTransaction = () => notifyTiptapUpdate();
  editor.on("transaction", onTransaction);
  editor.on("selectionUpdate", onTransaction);
  useEditorStore.getState().setTiptapEditor(editor);
  notifyTiptapUpdate();
}

export function unregisterTabTiptapEditor(tabId: string, editor: Editor): void {
  const current = tabEditors.get(tabId);
  if (current === editor) {
    tabEditors.delete(tabId);
    if (useEditorStore.getState().tiptapEditor === editor) {
      useEditorStore.getState().setTiptapEditor(null);
    }
  }
}

export function getTabTiptapEditor(tabId: string): Editor | undefined {
  const editor = tabEditors.get(tabId);
  if (!editor || editor.isDestroyed) {
    tabEditors.delete(tabId);
    return undefined;
  }
  return editor;
}

export function getTabTiptapMarkdown(tabId: string): string | undefined {
  const editor = getTabTiptapEditor(tabId);
  if (!editor) return undefined;
  return getTiptapMarkdown(editor);
}

export function destroyTabTiptapEditor(tabId: string): void {
  const editor = tabEditors.get(tabId);
  if (!editor) return;
  if (!editor.isDestroyed) {
    editor.destroy();
  }
  tabEditors.delete(tabId);
}

export function destroyOrphanTabTiptapEditors(activeTabIds: string[]): void {
  const active = new Set(activeTabIds);
  for (const tabId of tabEditors.keys()) {
    if (!active.has(tabId)) {
      destroyTabTiptapEditor(tabId);
    }
  }
}
