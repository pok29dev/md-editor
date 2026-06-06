import { useAppStore, type ViewMode } from "../stores/appStore";

export function useActiveViewMode(): ViewMode {
  const tabs = useAppStore((s) => s.tabs);
  const activeTabId = useAppStore((s) => s.activeTabId);
  return tabs.find((t) => t.id === activeTabId)?.viewMode ?? "split";
}
