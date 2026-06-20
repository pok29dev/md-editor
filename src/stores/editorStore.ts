import { create } from "zustand";
import type { EditorView } from "@codemirror/view";

export type EditorTextDirection = "ltr" | "rtl";

interface EditorState {
  view: EditorView | null;
  previewScrollEl: HTMLElement | null;
  findReplaceOpen: boolean;
  linkDialogOpen: boolean;
  clearDocumentOpen: boolean;
  emojiPickerOpen: boolean;
  symbolsPickerOpen: boolean;
  referenceDialogOpen: boolean;
  helpDialogOpen: boolean;
  aboutDialogOpen: boolean;
  aiStructureDiffOpen: boolean;
  aiStructureBefore: string;
  aiStructureAfter: string;
  aiStructureRange: { from: number; to: number } | null;
  editorTextDirection: EditorTextDirection;
  setView: (view: EditorView | null) => void;
  setPreviewScrollEl: (el: HTMLElement | null) => void;
  setFindReplaceOpen: (open: boolean) => void;
  setLinkDialogOpen: (open: boolean) => void;
  setClearDocumentOpen: (open: boolean) => void;
  setEmojiPickerOpen: (open: boolean) => void;
  setSymbolsPickerOpen: (open: boolean) => void;
  setReferenceDialogOpen: (open: boolean) => void;
  setHelpDialogOpen: (open: boolean) => void;
  setAboutDialogOpen: (open: boolean) => void;
  setAiStructureDiff: (
    open: boolean,
    payload?: {
      before: string;
      after: string;
      from: number;
      to: number;
    },
  ) => void;
  setEditorTextDirection: (direction: EditorTextDirection) => void;
  toggleEditorTextDirection: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  view: null,
  previewScrollEl: null,
  findReplaceOpen: false,
  linkDialogOpen: false,
  clearDocumentOpen: false,
  emojiPickerOpen: false,
  symbolsPickerOpen: false,
  referenceDialogOpen: false,
  helpDialogOpen: false,
  aboutDialogOpen: false,
  aiStructureDiffOpen: false,
  aiStructureBefore: "",
  aiStructureAfter: "",
  aiStructureRange: null,
  editorTextDirection: "ltr",
  setView: (view) => set({ view }),
  setPreviewScrollEl: (previewScrollEl) => set({ previewScrollEl }),
  setFindReplaceOpen: (findReplaceOpen) => set({ findReplaceOpen }),
  setLinkDialogOpen: (linkDialogOpen) => set({ linkDialogOpen }),
  setClearDocumentOpen: (clearDocumentOpen) => set({ clearDocumentOpen }),
  setEmojiPickerOpen: (emojiPickerOpen) => set({ emojiPickerOpen }),
  setSymbolsPickerOpen: (symbolsPickerOpen) => set({ symbolsPickerOpen }),
  setReferenceDialogOpen: (referenceDialogOpen) => set({ referenceDialogOpen }),
  setHelpDialogOpen: (helpDialogOpen) => set({ helpDialogOpen }),
  setAboutDialogOpen: (aboutDialogOpen) => set({ aboutDialogOpen }),
  setAiStructureDiff: (aiStructureDiffOpen, payload) =>
    set({
      aiStructureDiffOpen,
      aiStructureBefore: payload?.before ?? "",
      aiStructureAfter: payload?.after ?? "",
      aiStructureRange: payload
        ? { from: payload.from, to: payload.to }
        : null,
    }),
  setEditorTextDirection: (editorTextDirection) => set({ editorTextDirection }),
  toggleEditorTextDirection: () =>
    set((state) => ({
      editorTextDirection: state.editorTextDirection === "ltr" ? "rtl" : "ltr",
    })),
}));

export function openLinkDialog(): void {
  useEditorStore.getState().setLinkDialogOpen(true);
}

export function openClearDocumentDialog(): void {
  useEditorStore.getState().setClearDocumentOpen(true);
}

export function openEmojiPicker(): void {
  useEditorStore.getState().setEmojiPickerOpen(true);
}

export function openSymbolsPicker(): void {
  useEditorStore.getState().setSymbolsPickerOpen(true);
}

export function openReferenceDialog(): void {
  useEditorStore.getState().setReferenceDialogOpen(true);
}

export function openHelpDialog(): void {
  useEditorStore.getState().setHelpDialogOpen(true);
}

export function openAboutDialog(): void {
  useEditorStore.getState().setAboutDialogOpen(true);
}

export function isToolbarDialogOpen(): boolean {
  const state = useEditorStore.getState();
  return (
    state.findReplaceOpen ||
    state.linkDialogOpen ||
    state.clearDocumentOpen ||
    state.emojiPickerOpen ||
    state.symbolsPickerOpen ||
    state.referenceDialogOpen ||
    state.helpDialogOpen ||
    state.aboutDialogOpen
  );
}
