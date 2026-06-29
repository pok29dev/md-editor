import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import { shouldUseWysiwyg } from "./editMode";
import { getTabTiptapMarkdown } from "./tiptapTabCache";

/** Push live editor buffer into the active tab before switching modes or saving. */
export function flushActiveEditorContent(): void {
  const { tabs, activeTabId } = useAppStore.getState();
  if (!activeTabId) return;

  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return;

  let content: string | undefined;

  if (shouldUseWysiwyg(tab.viewMode, tab.editMode, tab.fileKind)) {
    content = getTabTiptapMarkdown(activeTabId);
  } else {
    content = useEditorStore.getState().view?.state.doc.toString();
  }

  if (content === undefined) return;
  if (tab.content === content) return;

  useAppStore.getState().updateTabContent(activeTabId, content);
}
