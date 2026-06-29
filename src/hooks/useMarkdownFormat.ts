import { useCallback } from "react";
import { useAppStore } from "../stores/appStore";
import { useEditorStore } from "../stores/editorStore";
import { getTabEditorView } from "../lib/editor/tabEditorCache";
import { getTabTiptapEditor } from "../lib/editor/tiptapTabCache";
import { applyTiptapFormatAction } from "../lib/editor/tiptapFormatActions";
import { shouldUseWysiwyg } from "../lib/editor/editMode";
import {
  applyFormatAction,
  canApplyFormatAction,
  type FormatActionId,
  type FormatContext,
} from "../lib/editor/formatActions";

function resolveCodeMirrorView(
  storeView: ReturnType<typeof useEditorStore.getState>["view"],
  activeTabId: string | null,
) {
  if (storeView) return storeView;
  if (!activeTabId) return null;
  return getTabEditorView(activeTabId) ?? null;
}

function resolveTiptapEditor(activeTabId: string | null) {
  if (!activeTabId) return null;
  return getTabTiptapEditor(activeTabId) ?? null;
}

function isWysiwygActive(activeTabId: string | null): boolean {
  if (!activeTabId) return false;
  const tab = useAppStore.getState().tabs.find((t) => t.id === activeTabId);
  if (!tab) return false;
  return shouldUseWysiwyg(tab.viewMode, tab.editMode, tab.fileKind);
}

export function useMarkdownFormat() {
  const activeTabId = useAppStore((s) => s.activeTabId);
  const storeView = useEditorStore((s) => s.view);
  const view = resolveCodeMirrorView(storeView, activeTabId);
  const wysiwyg = isWysiwygActive(activeTabId);

  const format = useCallback(
    (actionId: FormatActionId, context: FormatContext = {}) => {
      return runFormatAction(actionId, context);
    },
    [],
  );

  return {
    format,
    hasEditor: wysiwyg ? resolveTiptapEditor(activeTabId) !== null : view !== null,
  };
}

/** For native menu / shortcuts that read the store at call time. */
export function runFormatAction(
  actionId: FormatActionId,
  context: FormatContext = {},
): boolean {
  const activeTabId = useAppStore.getState().activeTabId;

  if (isWysiwygActive(activeTabId)) {
    const editor = resolveTiptapEditor(activeTabId);
    if (!editor) return false;
    if (!canApplyFormatAction(actionId, context)) return false;
    return applyTiptapFormatAction(editor, actionId, context);
  }

  const currentView = resolveCodeMirrorView(
    useEditorStore.getState().view,
    activeTabId,
  );
  if (!currentView) return false;
  if (!canApplyFormatAction(actionId, context)) return false;
  return applyFormatAction(currentView, actionId, context);
}
