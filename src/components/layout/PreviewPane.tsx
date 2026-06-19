import { MarkdownPreview } from "../preview/MarkdownPreview";
import { useAppStore } from "../../stores/appStore";
import { supportsPreview } from "../../lib/files/fileKind";

export function PreviewPane() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (activeTab && !supportsPreview(activeTab.fileKind)) {
    return (
      <div className="preview-pane empty">
        <div className="workspace-empty">
          <p className="workspace-empty-title">Preview not available</p>
          <p className="workspace-empty-hint">
            JSON and YAML files use editor-only mode
          </p>
        </div>
      </div>
    );
  }

  return (
    <MarkdownPreview
      content={activeTab?.content ?? ""}
      tabId={activeTabId}
    />
  );
}
