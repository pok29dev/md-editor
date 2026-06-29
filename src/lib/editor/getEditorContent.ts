import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import type { EditorTab } from "../../stores/appStore";
import { shouldUseWysiwyg } from "./editMode";
import { getTabTiptapMarkdown } from "./tiptapTabCache";

/** Prefer live editor buffer over store (source of truth while editing). */
export function getActiveTabForSave(): EditorTab | null {
  const { tabs, activeTabId } = useAppStore.getState();
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return null;

  if (
    activeTabId &&
    shouldUseWysiwyg(tab.viewMode, tab.editMode, tab.fileKind)
  ) {
    const wysiwygContent = getTabTiptapMarkdown(activeTabId);
    if (wysiwygContent !== undefined) {
      return { ...tab, content: wysiwygContent };
    }
  }

  const editorContent = useEditorStore.getState().view?.state.doc.toString();
  if (editorContent === undefined) return tab;

  return { ...tab, content: editorContent };
}

export function syncActiveTabContentFromEditor(): EditorTab | null {
  const tab = getActiveTabForSave();
  if (!tab) return null;

  const stored = useAppStore
    .getState()
    .tabs.find((t) => t.id === tab.id)?.content;

  if (stored !== tab.content) {
    useAppStore.setState((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tab.id ? { ...t, content: tab.content } : t,
      ),
    }));
  }

  return tab;
}
