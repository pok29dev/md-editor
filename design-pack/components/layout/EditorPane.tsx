import { useEffect } from "react";
import { MarkdownEditor } from "../editor/MarkdownEditor";
import { EditorToolbar } from "../editor/EditorToolbar";
import { EditorToolbarDialogs } from "../editor/EditorToolbarDialogs";
import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import { destroyOrphanTabEditors } from "../../lib/editor/tabEditorCache";

export function EditorPane() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const updateTabContent = useAppStore((s) => s.updateTabContent);
  const editorTextDirection = useEditorStore((s) => s.editorTextDirection);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    destroyOrphanTabEditors(tabs.map((t) => t.id));
  }, [tabs]);

  if (!activeTab) {
    return (
      <div className="editor-pane empty">
        <div className="workspace-empty">
          <p className="workspace-empty-title">No document open</p>
          <p className="workspace-empty-hint">
            Open a file with <kbd>⌘O</kbd> or create a new tab
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-pane" data-direction={editorTextDirection}>
      <EditorToolbar />
      <EditorToolbarDialogs />
      <MarkdownEditor
        tabId={activeTab.id}
        content={activeTab.content}
        onChange={(content) => updateTabContent(activeTab.id, content)}
      />
    </div>
  );
}
