import { useCallback } from "react";
import { useAppStore } from "../stores/appStore";
import { useEditorStore } from "../stores/editorStore";
import { getTabEditorView } from "../lib/editor/tabEditorCache";
import {
  applyFormatAction,
  canApplyFormatAction,
  type FormatActionId,
  type FormatContext,
} from "../lib/editor/formatActions";

function resolveEditorView(
  storeView: ReturnType<typeof useEditorStore.getState>["view"],
  activeTabId: string | null,
) {
  if (storeView) return storeView;
  if (!activeTabId) return null;
  return getTabEditorView(activeTabId) ?? null;
}

export function useMarkdownFormat() {
  const activeTabId = useAppStore((s) => s.activeTabId);
  const storeView = useEditorStore((s) => s.view);
  const view = resolveEditorView(storeView, activeTabId);

  const format = useCallback(
    (actionId: FormatActionId, context: FormatContext = {}) => {
      const currentView = resolveEditorView(
        useEditorStore.getState().view,
        useAppStore.getState().activeTabId,
      );
      if (!currentView) return false;
      if (!canApplyFormatAction(actionId, context)) return false;
      return applyFormatAction(currentView, actionId, context);
    },
    [],
  );

  return {
    format,
    hasEditor: view !== null,
  };
}

/** For native menu / shortcuts that read the store at call time. */
export function runFormatAction(
  actionId: FormatActionId,
  context: FormatContext = {},
): boolean {
  const currentView = resolveEditorView(
    useEditorStore.getState().view,
    useAppStore.getState().activeTabId,
  );
  if (!currentView) return false;
  if (!canApplyFormatAction(actionId, context)) return false;
  return applyFormatAction(currentView, actionId, context);
}
