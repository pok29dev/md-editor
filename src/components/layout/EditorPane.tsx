import { useEffect } from "react";
import { MarkdownEditor } from "../editor/MarkdownEditor";
import { EditorToolbar } from "../editor/EditorToolbar";
import { EditorToolbarDialogs } from "../editor/EditorToolbarDialogs";
import { useAppStore } from "../../stores/appStore";
import { useEditorStore } from "../../stores/editorStore";
import { destroyOrphanTabEditors } from "../../lib/editor/tabEditorCache";
import { supportsPreview } from "../../lib/files/fileKind";

function AiStructureOverlay() {
  const running = useAppStore((s) => s.aiStructureRunning);
  if (!running) return null;
  return (
    <div className="ai-structure-overlay" role="status" aria-live="polite">
      Running thClaws…
    </div>
  );
}

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
      {supportsPreview(activeTab.fileKind) && <EditorToolbar />}
      {supportsPreview(activeTab.fileKind) && <EditorToolbarDialogs />}
      <MarkdownEditor
        tabId={activeTab.id}
        content={activeTab.content}
        fileKind={activeTab.fileKind}
        onChange={(content) => updateTabContent(activeTab.id, content)}
      />
      <AiStructureOverlay />
      <style>{`
        .ai-structure-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.25);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          z-index: 20;
          pointer-events: all;
        }
        .editor-pane {
          position: relative;
        }
      `}</style>
    </div>
  );
}
