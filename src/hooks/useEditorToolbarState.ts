import { useEffect, useState } from "react";
import { useAppStore } from "../stores/appStore";
import { useEditorStore } from "../stores/editorStore";
import {
  getInlineActiveState,
  getListActiveState,
  type InlineFormatId,
  type ListFormatId,
} from "../lib/editor/formatActiveState";
import { getHeadingLevelAtCursor, type HeadingLevelValue } from "../lib/editor/headingLevel";
import { getTabEditorView, subscribeTabEditorUpdate } from "../lib/editor/tabEditorCache";
import { canEditorRedo, canEditorUndo } from "../lib/editor/editorHistory";

const DEFAULT_INLINE: Record<InlineFormatId, boolean> = {
  bold: false,
  italic: false,
  code: false,
  highlight: false,
  strikethrough: false,
};

const DEFAULT_LIST: Record<ListFormatId, boolean> = {
  bulletList: false,
  numberedList: false,
  taskList: false,
  blockquote: false,
};

function resolveEditorView(
  storeView: ReturnType<typeof useEditorStore.getState>["view"],
  activeTabId: string | null,
) {
  if (storeView) return storeView;
  if (!activeTabId) return null;
  return getTabEditorView(activeTabId) ?? null;
}

export function useEditorToolbarState() {
  const activeTabId = useAppStore((s) => s.activeTabId);
  const storeView = useEditorStore((s) => s.view);
  const view = resolveEditorView(storeView, activeTabId);
  const [headingLevel, setHeadingLevel] = useState<HeadingLevelValue>("body");
  const [activeInline, setActiveInline] =
    useState<Record<InlineFormatId, boolean>>(DEFAULT_INLINE);
  const [activeList, setActiveList] =
    useState<Record<ListFormatId, boolean>>(DEFAULT_LIST);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!view) {
      setHeadingLevel("body");
      setActiveInline(DEFAULT_INLINE);
      setActiveList(DEFAULT_LIST);
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    const sync = (target = view) => {
      setHeadingLevel(getHeadingLevelAtCursor(target));
      setActiveInline(getInlineActiveState(target));
      setActiveList(getListActiveState(target));
      setCanUndo(canEditorUndo(target));
      setCanRedo(canEditorRedo(target));
    };

    sync();
    return subscribeTabEditorUpdate((update) => {
      if (update.selectionSet || update.docChanged) {
        sync(update.view);
      }
    });
  }, [view]);

  return { headingLevel, activeInline, activeList, canUndo, canRedo };
}
