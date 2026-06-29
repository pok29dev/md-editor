import { useEffect, useReducer } from "react";
import type { Editor } from "@tiptap/core";
import type { EditorView } from "@codemirror/view";
import { useAppStore } from "../stores/appStore";
import { shouldUseWysiwyg } from "../lib/editor/editMode";
import { useActiveEditMode } from "./useActiveEditMode";
import { useActiveViewMode } from "./useActiveViewMode";
import { useEditorStore } from "../stores/editorStore";
import { getTabTiptapEditor, subscribeTiptapEditorUpdate } from "../lib/editor/tiptapTabCache";

export function useFindReplaceEditor(): {
  kind: "tiptap" | "codemirror" | "none";
  tiptap: Editor | null;
  codemirror: EditorView | null;
} {
  const activeTabId = useAppStore((s) => s.activeTabId);
  const fileKind = useAppStore(
    (s) => s.tabs.find((tab) => tab.id === s.activeTabId)?.fileKind ?? "markdown",
  );
  const viewMode = useActiveViewMode();
  const editMode = useActiveEditMode();
  const codemirror = useEditorStore((s) => s.view);
  const [, bumpRevision] = useReducer((value: number) => value + 1, 0);
  const isWysiwyg = shouldUseWysiwyg(viewMode, editMode, fileKind);

  useEffect(() => {
    if (!isWysiwyg) return;
    return subscribeTiptapEditorUpdate(() => bumpRevision());
  }, [isWysiwyg]);

  if (!activeTabId) {
    return { kind: "none", tiptap: null, codemirror: null };
  }

  if (isWysiwyg) {
    const tiptap = getTabTiptapEditor(activeTabId) ?? null;
    return {
      kind: tiptap ? "tiptap" : "none",
      tiptap,
      codemirror: null,
    };
  }

  return {
    kind: codemirror ? "codemirror" : "none",
    tiptap: null,
    codemirror,
  };
}
