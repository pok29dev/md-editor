import { MarkdownPreview } from "../preview/MarkdownPreview";
import { useAppStore } from "../../stores/appStore";

export function PreviewPane() {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <MarkdownPreview
      content={activeTab?.content ?? ""}
      tabId={activeTabId}
    />
  );
}
