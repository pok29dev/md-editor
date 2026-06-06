import { create } from "zustand";
import type { EditorView } from "@codemirror/view";

interface EditorState {
  view: EditorView | null;
  previewScrollEl: HTMLElement | null;
  findReplaceOpen: boolean;
  linkDialogOpen: boolean;
  setView: (view: EditorView | null) => void;
  setPreviewScrollEl: (el: HTMLElement | null) => void;
  setFindReplaceOpen: (open: boolean) => void;
  setLinkDialogOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  view: null,
  previewScrollEl: null,
  findReplaceOpen: false,
  linkDialogOpen: false,
  setView: (view) => set({ view }),
  setPreviewScrollEl: (previewScrollEl) => set({ previewScrollEl }),
  setFindReplaceOpen: (findReplaceOpen) => set({ findReplaceOpen }),
  setLinkDialogOpen: (linkDialogOpen) => set({ linkDialogOpen }),
}));

export function openLinkDialog(): void {
  useEditorStore.getState().setLinkDialogOpen(true);
}
