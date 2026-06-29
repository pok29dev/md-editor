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
import { subscribeTiptapEditorUpdate } from "../lib/editor/tiptapTabCache";
import { canEditorRedo, canEditorUndo } from "../lib/editor/editorHistory";
import {
  canTiptapRedo,
  canTiptapUndo,
} from "../lib/editor/tiptapFormatActions";
import {
  getTiptapHeadingLevel,
  getTiptapInlineActiveState,
  getTiptapListActiveState,
} from "../lib/editor/tiptapActiveState";
import { shouldUseWysiwyg } from "../lib/editor/editMode";

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
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const wysiwyg =
    activeTab !== undefined &&
    shouldUseWysiwyg(activeTab.viewMode, activeTab.editMode, activeTab.fileKind);

  const storeView = useEditorStore((s) => s.view);
  const tiptapEditor = useEditorStore((s) => s.tiptapEditor);
  const view = wysiwyg ? null : resolveEditorView(storeView, activeTabId);

  const [headingLevel, setHeadingLevel] = useState<HeadingLevelValue>("body");
  const [activeInline, setActiveInline] =
    useState<Record<InlineFormatId, boolean>>(DEFAULT_INLINE);
  const [activeList, setActiveList] =
    useState<Record<ListFormatId, boolean>>(DEFAULT_LIST);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (wysiwyg) {
      if (!tiptapEditor || tiptapEditor.isDestroyed) {
        setHeadingLevel("body");
        setActiveInline(DEFAULT_INLINE);
        setActiveList(DEFAULT_LIST);
        setCanUndo(false);
        setCanRedo(false);
        return;
      }

      const sync = () => {
        setHeadingLevel(getTiptapHeadingLevel(tiptapEditor));
        setActiveInline(getTiptapInlineActiveState(tiptapEditor));
        setActiveList(getTiptapListActiveState(tiptapEditor));
        setCanUndo(canTiptapUndo(tiptapEditor));
        setCanRedo(canTiptapRedo(tiptapEditor));
      };

      sync();
      return subscribeTiptapEditorUpdate(sync);
    }

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
  }, [view, tiptapEditor, wysiwyg]);

  return { headingLevel, activeInline, activeList, canUndo, canRedo };
}
