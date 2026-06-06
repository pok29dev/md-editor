import { useEffect } from "react";
import { MarkdownEditor } from "../editor/MarkdownEditor";
import { EditorToolbar } from "../editor/EditorToolbar";
import { useAppStore } from "../../stores/appStore";
import { destroyOrphanTabEditors } from "../../lib/editor/tabEditorCache";

export function EditorPane() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const updateTabContent = useAppStore((s) => s.updateTabContent);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    destroyOrphanTabEditors(tabs.map((t) => t.id));
  }, [tabs]);

  if (!activeTab) {
    return (
      <div className="editor-pane empty">
        <p>No document open</p>
      </div>
    );
  }

  return (
    <div className="editor-pane">
      <EditorToolbar />
      <MarkdownEditor
        tabId={activeTab.id}
        content={activeTab.content}
        onChange={(content) => updateTabContent(activeTab.id, content)}
      />
    </div>
  );
}
